import { Router } from "express";
import fileRoutes from "./fileRoutes";
import folderRoutes from "./folderRoutes";

const v1Router = Router();

v1Router.use("/files", fileRoutes);
v1Router.use("/folders", folderRoutes);

export default v1Router;
