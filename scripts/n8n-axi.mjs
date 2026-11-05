#!/usr/bin/env node
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function getEnvVar(name) {
  if (process.env[name]) return process.env[name];
  if (process.platform === 'win32') {
    try {
      const val = execSync(`powershell -NoProfile -Command "[System.Environment]::GetEnvironmentVariable('${name}', 'User')"`, {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore']
      }).trim();
      if (val) return val;
    } catch (e) {}
  }
  return '';
}

if (!process.env.N8N_MCP_URL) {
  const url = getEnvVar('N8N_MCP_URL') || getEnvVar('N8N_BASE_URL');
  if (url) process.env.N8N_MCP_URL = url.endsWith('/mcp-server/http') ? url : `${url.replace(/\/+$/, '')}/mcp-server/http`;
}

if (!process.env.N8N_MCP_TOKEN) {
  const token = getEnvVar('N8N_MCP_TOKEN') || getEnvVar('N8N_API_KEY');
  if (token) process.env.N8N_MCP_TOKEN = token;
}

import fs from 'node:fs';

const localN8n = path.resolve('node_modules/n8n-axi/bin/n8n-axi.js');
const repoN8n = 'g:/doc/Ecole/professional/Alter-si/AgenticAxelor/node_modules/n8n-axi/bin/n8n-axi.js';

const n8nBin = fs.existsSync(localN8n) ? localN8n : repoN8n;
await import(`file://${n8nBin.replace(/\\/g, '/')}`);
