import fs from "fs";
import path from "path";
import { AxelorClient } from "./axelorClient.js";
import {
  MetaAttachmentRecord,
  MetaFileRecord,
  AxelorAttachmentItem,
  UploadAttachmentOptions,
  UploadAttachmentResult,
  DownloadAttachmentOptions,
  DownloadAttachmentResult,
} from "../types/axelor.js";

export interface GetAttachmentsOptions {
  model: string;
  recordId: number;
  limit?: number;
}

export class DmsService {
  private client: AxelorClient;

  constructor(client: AxelorClient) {
    this.client = client;
  }

  /**
   * Format bytes to readable size text.
   */
  private formatSize(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  }

  /**
   * Fetch attachments linked to a specific business record.
   */
  async getAttachments(options: GetAttachmentsOptions): Promise<AxelorAttachmentItem[]> {
    const rawModel = options.model.trim();
    const recordId = options.recordId;
    const limit = options.limit ?? 20;

    if (!rawModel) {
      throw new Error("Model name is required to fetch attachments.");
    }
    if (!recordId || isNaN(recordId)) {
      throw new Error("Valid record ID is required to fetch attachments.");
    }

    const simpleName = rawModel.includes(".") ? rawModel.split(".").pop()! : rawModel;

    // Axelor MetaAttachment records store objectName either as full name or simple class name
    const domain =
      "(self.objectName = :rawModel or self.objectName = :simpleName or self.objectName like :wildcard) and self.objectId = :recordId";
    const domainContext = {
      rawModel,
      simpleName,
      wildcard: `%.${simpleName}`,
      recordId,
    };

    const response = await this.client.search<MetaAttachmentRecord>("com.axelor.meta.db.MetaAttachment", {
      limit,
      sortBy: ["-createdOn", "-id"],
      domain,
      domainContext,
      fields: [
        "id",
        "objectName",
        "objectId",
        "metaFile",
        "createdOn",
        "createdBy",
      ],
    });

    const records = response.data || [];
    const baseUrl = this.client.getBaseUrl();

    return records
      .filter((r) => r.metaFile && r.metaFile.id)
      .map((r) => {
        const file = r.metaFile!;
        return {
          id: r.id,
          fileId: file.id,
          fileName: file.fileName,
          fileType: file.fileType || undefined,
          fileSize: file.fileSize || undefined,
          sizeText: file.sizeText || undefined,
          description: file.description || undefined,
          createdOn: r.createdOn || file.createdOn || undefined,
          createdBy: r.createdBy?.name || file.createdBy?.name || undefined,
          downloadUrl: `${baseUrl}/ws/rest/com.axelor.meta.db.MetaFile/${file.id}/content/download`,
        };
      });
  }

  /**
   * Upload and attach a file (from local disk or raw content) to an Axelor business record.
   */
  async uploadAttachment(options: UploadAttachmentOptions): Promise<UploadAttachmentResult> {
    const rawModel = options.model.trim();
    const recordId = options.recordId;
    const fileName = options.fileName.trim();

    if (!rawModel) throw new Error("Target model name is required.");
    if (!recordId || isNaN(recordId)) throw new Error("Valid target record ID is required.");
    if (!fileName) throw new Error("File name is required.");

    let buffer: Buffer;
    if (options.localFilePath) {
      if (!fs.existsSync(options.localFilePath)) {
        throw new Error(`Local file not found at path: ${options.localFilePath}`);
      }
      buffer = fs.readFileSync(options.localFilePath);
    } else if (options.content !== undefined) {
      // Check if base64 or plain string
      const isBase64 = /^[A-Za-z0-9+/=]+$/.test(options.content) && options.content.length % 4 === 0 && options.content.length > 50;
      buffer = isBase64
        ? Buffer.from(options.content, "base64")
        : Buffer.from(options.content, "utf-8");
    } else {
      throw new Error("Either 'content' (inline string/base64) or 'localFilePath' must be provided.");
    }

    const fileSize = buffer.length;
    const sizeText = this.formatSize(fileSize);
    const sanitizedFileName = fileName.replace(/[/\\?%*:|"<>]/g, "-");
    const filePath = `attachments/${Date.now()}_${sanitizedFileName}`;

    // Infer mime type if not explicitly given
    let fileType = options.fileType;
    if (!fileType) {
      if (fileName.endsWith(".pdf")) fileType = "application/pdf";
      else if (fileName.endsWith(".txt")) fileType = "text/plain";
      else if (fileName.endsWith(".json")) fileType = "application/json";
      else if (fileName.endsWith(".csv")) fileType = "text/csv";
      else if (fileName.endsWith(".png")) fileType = "image/png";
      else if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) fileType = "image/jpeg";
      else fileType = "application/octet-stream";
    }

    // 1. Create MetaFile record
    const metaFilePayload: Record<string, unknown> = {
      fileName,
      filePath,
      fileType,
      fileSize,
      sizeText,
    };
    if (options.description) {
      metaFilePayload.description = options.description;
    }

    const metaFileRes = await this.client.save<MetaFileRecord>("com.axelor.meta.db.MetaFile", metaFilePayload);
    const metaFile = metaFileRes.data?.[0];
    if (!metaFile || !metaFile.id) {
      throw new Error(`Failed to create MetaFile record for ${fileName}`);
    }

    // 2. Link MetaFile via MetaAttachment to target business record
    const attachmentPayload: Record<string, unknown> = {
      objectName: rawModel,
      objectId: recordId,
      metaFile: { id: metaFile.id },
    };

    const attachmentRes = await this.client.save<MetaAttachmentRecord>("com.axelor.meta.db.MetaAttachment", attachmentPayload);
    const attachment = attachmentRes.data?.[0];
    if (!attachment || !attachment.id) {
      throw new Error(`Failed to create MetaAttachment linking file ${metaFile.id} to ${rawModel} ID ${recordId}`);
    }

    const baseUrl = this.client.getBaseUrl();

    return {
      attachmentId: attachment.id,
      fileId: metaFile.id,
      fileName,
      fileSize,
      sizeText,
      targetModel: rawModel,
      targetRecordId: recordId,
      downloadUrl: `${baseUrl}/ws/rest/com.axelor.meta.db.MetaFile/${metaFile.id}/content/download`,
    };
  }

  /**
   * Download a DMS attachment by fileId with option to save locally or return as base64 string.
   */
  async downloadAttachment(options: DownloadAttachmentOptions): Promise<DownloadAttachmentResult> {
    const fileId = options.fileId;
    if (!fileId || isNaN(fileId)) {
      throw new Error("Valid fileId is required for download.");
    }

    // 1. Fetch metadata of MetaFile
    const metaFile = await this.client.fetchById<MetaFileRecord>("com.axelor.meta.db.MetaFile", fileId);
    const fileName = metaFile?.fileName || `download_${fileId}.bin`;
    const declaredType = metaFile?.fileType;

    // 2. Fetch binary stream
    const downloadRes = await this.client.downloadFile(fileId);
    const buffer = downloadRes.data;
    const fileSize = buffer.length;
    const sizeText = metaFile?.sizeText || this.formatSize(fileSize);
    const fileType = declaredType || downloadRes.contentType || "application/octet-stream";

    let savedPath: string | undefined;
    if (options.outputPath) {
      const resolvedPath = path.resolve(options.outputPath);
      const targetDir = path.dirname(resolvedPath);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      fs.writeFileSync(resolvedPath, buffer);
      savedPath = resolvedPath;
    }

    let base64Content: string | undefined;
    if (options.includeBase64) {
      base64Content = buffer.toString("base64");
    }

    return {
      fileId,
      fileName,
      fileSize,
      sizeText,
      fileType,
      savedPath,
      base64Content,
    };
  }
}
