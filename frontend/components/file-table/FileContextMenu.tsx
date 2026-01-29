import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { noop } from "@tanstack/react-table";

interface IFileContextMenu {
  text: string;
  data: {
    id: string;
  };
  onDeleteFile: () => void;
  onRenameFile: () => void;
  onClick?: () => void;
}
export function FileContextMenu({
  text,
  onRenameFile,
  onDeleteFile,
  onClick = noop,
}: IFileContextMenu) {
  return (
    <ContextMenu>
      <ContextMenuTrigger
        onClick={onClick}
        className="flex w-full text-sm gap-2 items-center cursor-pointer hover:underline"
      >
        {text}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuGroup>
          <ContextMenuItem onClick={onRenameFile}>Rename</ContextMenuItem>
          <ContextMenuItem onClick={onDeleteFile}>Delete</ContextMenuItem>
        </ContextMenuGroup>
      </ContextMenuContent>
    </ContextMenu>
  );
}
