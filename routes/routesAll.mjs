import express from "express";
const router = express.Router();
import { router as authRoutes } from "./authRoutes.mjs";
import { router as recordsRoutes } from "./recordsRoutes.mjs";
router.use("/", authRoutes);
router.use("/", recordsRoutes);
export { router };
