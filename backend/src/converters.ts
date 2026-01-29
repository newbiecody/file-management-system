export const convertToNumber = (
  value?: unknown,
  options: { isRequired?: boolean; default?: number | null } = {}
): number | null => {
  if (value === undefined || value === null || value === "") {
    if (options.isRequired) throw new Error("Value is required");
    return options.default!;
  }

  const parsed = Number(value);

  if (isNaN(parsed) || typeof value === "symbol") {
    throw new Error(`Invalid number format: ${value}`);
  }

  return parsed;
};
