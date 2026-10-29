const SECRET_KEY_PATTERN = /pass|password|secret|token|authorization|cookie|smtp_pass/i;

function sanitize(meta?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!meta) {
    return undefined;
  }

  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(meta)) {
    if (SECRET_KEY_PATTERN.test(key)) {
      cleaned[key] = "[redacted]";
      continue;
    }
    cleaned[key] = value;
  }
  return cleaned;
}

function write(level: "info" | "warn" | "error", message: string, meta?: Record<string, unknown>) {
  const entry = {
    level,
    message,
    time: new Date().toISOString(),
    ...sanitize(meta),
  };
  const line = JSON.stringify(entry);

  if (level === "error") {
    console.error(line);
    return;
  }
  if (level === "warn") {
    console.warn(line);
    return;
  }
  console.log(line);
}

export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => write("info", message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => write("warn", message, meta),
  error: (message: string, meta?: Record<string, unknown>) => write("error", message, meta),
};
