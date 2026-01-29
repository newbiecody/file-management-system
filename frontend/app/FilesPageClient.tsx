"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { type RowSelectionState } from "@tanstack/react-table";

import { FileMetadata } from "@/lib/file/file.type";
import { PaginationState } from "@/lib/api.type";
import { useDebouncedCallback } from "@/lib/hooks/useDebounced";
import { deleteFile, updateFileName, getFiles } from "@/lib/file/file";

import SearchBar from "@/components/file-table/SearchBar";
import FilesTable from "@/components/file-table/FilesTable";
import Pagination from "@/components/file-table/Pagination";
import ConfirmDeleteModal from "@/components/file-table/modals/ConfirmDeleteModal";
import RenameFileNameModal from "@/components/file-table/modals/RenameFileNameModal";
import UploadDropdown from "@/components/buttons/UploadButton";
import { Spinner } from "@/components/ui/spinner";
import CreateFolderModal from "@/components/file-table/modals/CreateFolderModal";
import { createFolder } from "@/lib/folder/folder";

const PAGE_SIZE = 20;
const SORT = "createdAt:desc";

export default function FilesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [parentId, setParentId] = useState<string | null>(
    searchParams.get("parentId")
  );

  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    hasNext: false,
    hasPrev: false,
    totalPages: 0,
  });

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    fileId: "",
  });

  const [renameModal, setRenameModal] = useState({
    isOpen: false,
    fileId: "",
    currentFilename: "",
  });

  const [createFolderModal, setCreateFolderModal] = useState({
    isOpen: false,
    fileId: "",
    folderName: "",
  });

  const fetchFiles = async (page = 1) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await getFiles({
        ...(parentId && { parentId }),
        search,
        page,
        limit: PAGE_SIZE,
        sort: SORT,
      });

      setFiles(response.data);
      setPagination({
        page: response.page,
        limit: response.limit,
        total: response.total,
        hasNext: response.hasNext,
        hasPrev: response.hasPrev,
        totalPages: response.totalPages,
      });
    } catch (err) {
      console.error("Failed to fetch files:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch files");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const urlParentId = searchParams.get("parentId");
    setParentId(urlParentId);
  }, [searchParams]);

  useEffect(() => {
    fetchFiles();
  }, [parentId]);

  const handleSearch = useDebouncedCallback((value: string) => {
    setSearch(value);
    fetchFiles(1);
  });

  const handlePageChange = (page: number) => {
    setPagination;
    fetchFiles(page);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteFile(deleteModal.fileId);
      setDeleteModal({ isOpen: false, fileId: "" });
      fetchFiles(pagination.page);
    } catch (err) {
      console.error("Failed to delete file:", err);
      setError("Failed to delete file");
    }
  };

  const handleConfirmRename = async (newName: string) => {
    try {
      await updateFileName(renameModal.fileId, newName);
      setRenameModal({ isOpen: false, fileId: "", currentFilename: "" });
      fetchFiles(pagination.page);
    } catch (err) {
      console.error("Failed to rename file:", err);
      throw err;
    }
  };

  const handleConfirmCreateFolder = async (folderName: string) => {
    try {
      const parentIdNumber = parentId !== null ? parseInt(parentId) : null;
      await createFolder(folderName, parentIdNumber);
      await fetchFiles();
    } catch (err) {
      console.error("Failed to create folder", err);
    }
  };

  const handleSelectFile = async (fileId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("parentId", fileId);
    router.push(`?${params.toString()}`);
  };

  const handleBackToRoot = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("parentId");
    router.push(`?${params.toString()}`);
  };
  
  const selectedCount = Object.keys(rowSelection).length;

  if (error && !isLoading) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-bold">Error loading files</h2>
        <p className="text-muted-foreground">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
        >
          Retry
        </button>
      </div>
    );
  }

  if (isLoading && files.length === 0) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-4">
      <div className="flex justify-between">
        <SearchBar value={search} onChange={handleSearch} />
        <UploadDropdown
          parentId={parentId}
          onUpload={() => fetchFiles(pagination.page)}
          onStartFolderCreate={() =>
            setCreateFolderModal({ ...createFolderModal, isOpen: true })
          }
        />
      </div>

      <FilesTable
        files={files}
        pagination={pagination}
        isLoading={isLoading}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        onDeleteFile={(id) => setDeleteModal({ isOpen: true, fileId: id })}
        onRenameFile={(id, name) =>
          setRenameModal({ isOpen: true, fileId: id, currentFilename: name })
        }
        onClickFolder={handleSelectFile}
      />

      <Pagination
        countSelected={selectedCount}
        countTotal={pagination.total}
        hasNext={pagination.hasNext}
        hasPrev={pagination.hasPrev}
        handlePrev={() => handlePageChange(pagination.page - 1)}
        handleNext={() => handlePageChange(pagination.page + 1)}
        isDisabled={isLoading}
      />

      <ConfirmDeleteModal
        fileId={deleteModal.fileId}
        isOpen={deleteModal.isOpen}
        setIsOpen={(open) =>
          setDeleteModal((prev) => ({ ...prev, isOpen: open }))
        }
        onConfirm={handleConfirmDelete}
      />

      <RenameFileNameModal
        fileId={renameModal.fileId}
        currentFilename={renameModal.currentFilename}
        isOpen={renameModal.isOpen}
        setIsOpen={(open) =>
          setRenameModal((prev) => ({ ...prev, isOpen: open }))
        }
        onConfirm={handleConfirmRename}
      />
      <CreateFolderModal
        isOpen={createFolderModal.isOpen}
        setIsOpen={(open) =>
          setCreateFolderModal((prev) => ({ ...prev, isOpen: open }))
        }
        onConfirm={handleConfirmCreateFolder}
      />
    </div>
  );
}
