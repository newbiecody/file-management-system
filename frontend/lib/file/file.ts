import { fetchFromServer } from "../api";
import { FileRetrievalResult, FileUploadResult } from "./file.type";

const MAXIMUM_NUMBER_CONCURRENT_UPLOADS = 3;

export function getFiles({
  parentId,
  search,
  page,
  limit,
  sort,
}: {
  parentId?: string;
  search?: string;
  limit?: number;
  page?: number;
  sort?: string;
}) {
  const urlParams = new URLSearchParams({
    ...(typeof parentId !== "undefined" && { parentId }),
    ...(typeof search !== "undefined" && { search }),
    ...(typeof limit !== "undefined" && { limit: String(limit) }),
    ...(typeof page !== "undefined" && { after: String(page) }),
    ...(typeof sort !== "undefined" && { sort }),
  });

  return fetchFromServer<FileRetrievalResult>(
    `/v1/files${urlParams.size > 0 ? "?" : ""}${urlParams.toString()}`
  );
}

export async function updateFileName(fileId: string, updatedName: string) {
  await fetchFromServer(`/v1/files/${fileId}`, {
    method: "PATCH",
    body: JSON.stringify({
      name: updatedName,
    }),
  });
}

export async function deleteFile(fileId: string) {
  await fetchFromServer(`/v1/files/${fileId}`, {
    method: "DELETE",
  });
}

export async function uploadFilesWithLimit(
  files: File[],
  parentId?: string | null
) {
  const fileUploadJobs = files.map(async (file) => {
    const formData = new FormData();
    if (parentId) {
      formData.append("parentId", parentId.toString());
    }
    formData.append("file", file);

    return await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/files/upload`, {
      method: "POST",
      body: formData,
    });
  });
  const results: FileUploadResult[] = [];
  const queue = [...fileUploadJobs];

  const workers = Array.from({ length: MAXIMUM_NUMBER_CONCURRENT_UPLOADS }).map(
    async () => {
      while (queue.length) {
        const job = queue.shift();

        if (!job) return;
        const result = await job;
        results.push(result as any);
      }
    }
  );

  await Promise.all(workers);
  return results;
}
