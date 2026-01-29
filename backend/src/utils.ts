export function isDefined<T>(value?: T | null): value is T {
  return value !== undefined && value !== null;
}

export function validateFilename(name?: string) {
  const trimmed = name?.trim();

  if (!trimmed) return "Filename cannot be empty";
  if (trimmed.length > 255) return "Filename is too long";
  if (/[\\\/:*?"<>|]/.test(trimmed))
    return "Filename contains invalid characters";

  return "";
}
