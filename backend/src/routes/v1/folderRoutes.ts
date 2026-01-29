import { Router } from "express";
import { createFolder } from "../../controllers/v1/foldersController";

const router = Router();

router.post("/", createFolder);

export default router;
