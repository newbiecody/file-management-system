import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { SortConfig } from "./api.type";
import { AbbreviatedFileType } from "./constants";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  File02Icon,
  Image02Icon,
  Video02Icon,
} from "@hugeicons/core-free-icons";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatIsoDate(isoString: string) {
  if (!isoString) return "";

  const date = new Date(isoString);

  if (isNaN(date.getTime())) return "";

  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getSortConfigString(sortConfig: SortConfig) {
  return `sort=${sortConfig.field},${sortConfig.direction}`;
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${
    sizes[i]
  }`;
}

export function validateFilename(name: string) {
  const trimmed = name.trim();

  if (!trimmed) return "Filename cannot be empty";
  if (trimmed.length > 255) return "Filename is too long";
  if (/[\\\/:*?"<>|]/.test(trimmed))
    return "Filename contains invalid characters";

  return "";
}

export function noop() {}

export function mapMimeToIcon(mime: AbbreviatedFileType) {
  if (!mime) {
    return;
  }
  if (["JPG", "PNG", "GIF"].includes(mime)) {
    return <HugeiconsIcon icon={Image02Icon} />;
  }

  if (["WEBP"].includes(mime)) {
    return <HugeiconsIcon icon={Video02Icon} />;
  }

  return <HugeiconsIcon icon={File02Icon} />;
}
