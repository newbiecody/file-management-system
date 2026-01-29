import { ChangeEvent, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { uploadFilesWithLimit } from "@/lib/file/file";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add02Icon } from "@hugeicons/core-free-icons";

interface IUploadButton {
  parentId: string | null;
  onUpload: () => void;
  onStartFolderCreate: () => void;
}

export default function UploadDropdown({
  parentId,
  onUpload,
  onStartFolderCreate,
}: IUploadButton) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesSelected = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      await uploadFilesWithLimit(Array.from(files), parentId);
      onUpload();
    }
  };

  return (
    <>
      <Input
        type="file"
        ref={fileInputRef}
        className="hidden"
        multiple
        onChange={handleFilesSelected}
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            Add <HugeiconsIcon icon={Add02Icon} />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
            File
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onStartFolderCreate}>
            Folder
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
