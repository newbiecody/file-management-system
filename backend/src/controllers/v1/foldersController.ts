import { Request, Response } from "express";
import { FileRepository } from "../../repositories/FilesRepository";
import { validateFilename } from "../../utils";
import { convertToNumber } from "../../converters";

const fileRepo = new FileRepository();

export const createFolder = async (req: Request, res: Response) => {
  try {
    const { folderName, parentId } = req.body;
    const folderNameErrors = validateFilename(folderName as string);
    const parentIdNumber = parentId
      ? convertToNumber(parentId, { default: null })
      : null;

    if (folderNameErrors) {
      res.status(400).json({ status: "error", message: folderNameErrors });
      return;
    }

    const createdFolder = await fileRepo.createFolder(
      parentIdNumber,
      folderName
    );

    res.json({ status: "success", folder: createdFolder });
  } catch (error: any) {
    res.status(400).json({ status: "error", message: error.message });
  }
};
