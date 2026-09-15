/**
 * Utilities for session namespacing to isolate test entities and avoid ERP referential integrity deadlocks.
 */

/**
 * Format a human-readable business name with an optional session tag.
 * Example: ("Autocollant Panini Mbappe", "S1") -> "Autocollant Panini Mbappe [S1]"
 */
export function formatSessionName(baseName: string, sessionTag?: string): string {
  if (!sessionTag || sessionTag.trim() === "") {
    return baseName.trim();
  }
  const tag = sessionTag.trim();
  const cleanName = baseName.replace(/\s*\[.*?\]\s*$/, "").trim();
  return `${cleanName} [${tag}]`;
}

/**
 * Format a technical code with an optional session suffix.
 * Example: ("PANINI-MBAPPE", "S1") -> "PANINI-MBAPPE-S1"
 */
export function formatSessionCode(baseCode: string, sessionTag?: string): string {
  if (!sessionTag || sessionTag.trim() === "") {
    return baseCode.trim();
  }
  const cleanCode = baseCode.replace(/[-_][A-Za-z0-9]+$/, "").trim();
  const cleanTag = sessionTag.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  return `${cleanCode}-${cleanTag}`;
}

/**
 * Extract an existing session tag from a name if present.
 * Example: "Autocollant Panini Mbappe [S1]" -> "S1"
 */
export function extractSessionTag(name: string): string | null {
  const match = name.match(/\[(.*?)\]\s*$/);
  return match && match[1] ? match[1].trim() : null;
}
