import { Router } from "express";
import {
  getActiveFiles,
  uploadFile,
  updateFile,
  deleteFile,
  upload,
} from "../../controllers/v1/filesController";

const router = Router();
router.get("/", getActiveFiles);
router.post("/upload", upload.single("file"), uploadFile);
router.patch("/:id", updateFile);
router.delete("/:id", deleteFile);

export default router;
