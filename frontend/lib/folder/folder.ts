import { fetchFromServer } from "../api";

export async function createFolder(
  folderName: string,
  parentId?: number | null
) {
  await fetchFromServer(`/v1/folders`, {
    method: "POST",
    body: JSON.stringify({
      ...(Boolean(parentId) && { parentId }),
      folderName,
    }),
  });
}
