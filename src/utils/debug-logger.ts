type DebugMeta = Record<string, unknown>;

const ENABLED_DEBUG_VALUES = ['1', 'true', 'yes', 'on', 'debug'] as const;
const enabledDebugValues = new Set<string>(ENABLED_DEBUG_VALUES);

export function isDebugEnabled(): boolean {
  const value = process.env.DEBUG?.toLowerCase().trim();
  return Boolean(value && enabledDebugValues.has(value));
}

function serializeMeta(meta?: DebugMeta): string {
  if (!meta || Object.keys(meta).length === 0) {
    return '';
  }
  return ` ${JSON.stringify(meta)}`;
}

export function logDebug(message: string, meta?: DebugMeta): void {
  if (!isDebugEnabled()) {
    return;
  }
  console.debug(`[DEBUG] ${message}${serializeMeta(meta)}`);
}
