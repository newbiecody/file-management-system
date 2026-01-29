import { BackendError } from "./BackendError";

export async function fetchFromServer<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    cache: "no-store",
    ...options,
  });

  const contentType = res.headers.get("content-type");
  const isJson = contentType?.includes("application/json");

  const data = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    throw new BackendError(
      isJson ? data?.message : data || "Backend request failed",
      res.status,
      isJson ? data?.code : undefined
    );
  }

  if (!isJson) {
    throw new Error(`Expected JSON but received ${contentType}`);
  }

  return data as T;
}
