import { Request, Response } from "express";
import { convertToNumber } from "../../converters";
import { FileRepository } from "../../repositories/FilesRepository";
import multer from "multer";
import path from "path";
import fs from "fs";
import { isDefined, validateFilename } from "../../utils";
import { type FileFilterCallback } from "multer";

const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const fileRepo = new FileRepository();
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  const allowedMimetypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|csv|xls|xlsx/;
  const allowedExtensions = /jpeg|jpg|png|gif|pdf|doc|docx|txt|csv|xls|xlsx/;

  const mimetypeValid = allowedMimetypes.test(file.mimetype);
  const extname = allowedExtensions.test(
    path.extname(file.originalname).toLowerCase()
  );

  if (mimetypeValid && extname) {
    return cb(null, true);
  }

  cb(
    new Error(
      `File type not allowed. Allowed types: ${allowedMimetypes.source}`
    )
  );
};

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: fileFilter,
});

export const getActiveFiles = async (req: Request, res: Response) => {
  try {
    const { page, pageSize, parentId, search } = req.query;

    const parsedPage = convertToNumber(page as string, { default: 1 });
    const parsedPageSize = convertToNumber(pageSize as string, { default: 20 });

    const parsedParentId =
      parentId === "null" || parentId === undefined ? null : String(parentId);

    const result = await fileRepo.findAll({
      page: parsedPage,
      pageSize: parsedPageSize,
      parentId: parsedParentId,
      search: search as string,
      fileStatus: "ACTIVE",
    });

    res.json({
      status: "success",
      ...result,
    });
  } catch (error: any) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

export const updateFile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const fileIdNumber = convertToNumber(id);
    if (!isDefined(fileIdNumber)) {
      res.status(400).json({ status: "error", message: "No file targeted" });
      return;
    }

    const { name: newFileName } = req.body;

    const filenameErrors = validateFilename(newFileName as string);
    if (filenameErrors) {
      res.status(400).json({ status: "error", message: filenameErrors });
      return;
    }

    fileRepo.update(fileIdNumber, { name: newFileName });
    res.json({
      status: "success",
    });
  } catch (error: any) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

export const deleteFile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const fileIdNumber = convertToNumber(id);
    if (isDefined(fileIdNumber)) {
      fileRepo.softDelete(fileIdNumber);
    } else {
      res.status(400).json({ status: "error", message: "No file selected" });
      return;
    }

    res.json({
      status: "success",
    });
  } catch (error: any) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

export const uploadFile = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({
        error: "No file uploaded",
      });
    }

    const { parentId } = req.body;
    const { originalname, mimetype, size, filename, path: filePath } = file;

    await fileRepo.create({
      parentId: convertToNumber(parentId),
      name: originalname,
      size,
      mimetype,
      objectType: "FILE",
      storageKey: filePath,
    });

    return res.status(200).json({
      message: "File uploaded successfully",
      file: {
        originalname,
        filename,
        mimetype,
        size,
        path: filePath,
      },
    });
  } catch (error) {
    console.error("File upload error:", error);
    return res.status(500).json({
      error: "Failed to upload file",
    });
  }
};
