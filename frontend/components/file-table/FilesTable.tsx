"use client";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type RowSelectionState,
  type OnChangeFn,
} from "@tanstack/react-table";
import { FileMetadata } from "@/lib/file/file.type";
import { PaginationState } from "@/lib/api.type";
import { formatBytes, mapMimeToIcon } from "@/lib/utils";
import { DateCell } from "./DateCell";
import { FileContextMenu } from "./FileContextMenu";
import { Spinner } from "@/components/ui/spinner";
import { HugeiconsIcon } from "@hugeicons/react";
import { Folder01Icon } from "@hugeicons/core-free-icons";
import { FULL_MIME_TO_ABBREVIATED_MAP } from "@/lib/constants";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

interface FilesTableProps {
  files: FileMetadata[];
  pagination: PaginationState;
  onDeleteFile: (fileId: string) => void;
  onRenameFile: (fileId: string, fileName: string) => void;
  onClickFolder: (fileId: string) => void;
  rowSelection: RowSelectionState;
  onRowSelectionChange: OnChangeFn<RowSelectionState>;
  isLoading?: boolean;
}

export default function FilesTable({
  files,
  pagination,
  onDeleteFile,
  onRenameFile,
  onClickFolder,
  rowSelection,
  onRowSelectionChange,
  isLoading = false,
}: FilesTableProps) {
  const columns = getColumns(onDeleteFile, onRenameFile, onClickFolder);

  const table = useReactTable<FileMetadata>({
    data: files,
    columns,
    state: {
      rowSelection,
    },
    initialState: {
      columnVisibility: {
        id: false,
        objectType: false,
      },
    },
    onRowSelectionChange,
    enableRowSelection: true,
    manualPagination: true,
    pageCount: pagination.totalPages,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="w-full relative">
      {isLoading && (
        <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
          <Spinner />
        </div>
      )}

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function getColumns(
  onDeleteFile: (fileId: string) => void,
  onRenameFile: (fileId: string, currentFilename: string) => void,
  onClickFolder: (fileId: string) => void
): ColumnDef<FileMetadata>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "id",
      header: "ID",
      enableHiding: true,
    },
    {
      accessorKey: "objectType",
      enableSorting: false,
      enableHiding: true,
    },
    {
      accessorKey: "name",
      header: "File Name",
      cell: ({ row }) => (
        <div className="flex gap-2 capitalize align-middle">
          {row.getValue("objectType") === "FOLDER" && (
            <HugeiconsIcon icon={Folder01Icon} />
          )}
          {mapMimeToIcon(
            FULL_MIME_TO_ABBREVIATED_MAP[row.getValue("mimetype") as string]
          )}
          <FileContextMenu
            onClick={() => {
              if (row.getValue("objectType") === "FOLDER") {
                onClickFolder(row.getValue("id"));
              }
            }}
            text={row.getValue("name")}
            data={{
              id: row.getValue("id"),
            }}
            onDeleteFile={() => {
              onDeleteFile(row.getValue("id"));
            }}
            onRenameFile={() => {
              onRenameFile(row.getValue("id"), row.getValue("name"));
            }}
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "size",
      header: () => <div className="text-right">File Size</div>,
      cell: ({ row }) => (
        <div className="text-right">
          {row.getValue("size") ? formatBytes(row.getValue("size")) : ""}
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "mimetype",
      header: () => <div className="text-right">Mimetype</div>,
      cell: ({ row }) => (
        <div className="flex justify-end w-full font-medium">
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="w-fit">
                {
                  FULL_MIME_TO_ABBREVIATED_MAP[
                    row.getValue("mimetype") as string
                  ]
                }
              </p>
            </TooltipTrigger>
            <TooltipContent>
              <p>{row.getValue("mimetype")}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "createdAt",
      header: () => <div className="text-right">Created On</div>,
      cell: ({ row }) => (
        <div className="text-right">
          <DateCell date={row.getValue("createdAt")} />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "updatedAt",
      header: () => <div className="text-right">Updated On</div>,
      cell: ({ row }) => (
        <div className="text-right">
          {row.getValue("createdAt") !== row.getValue("updatedAt") && (
            <DateCell date={row.getValue("updatedAt")} />
          )}
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];
}
