import express from "express";
import { z } from "zod";
import { GostController } from "../controllers/gostController";
import { protect } from "../middleware/auth";
import { validateParams } from "../middleware/validation";

const router = express.Router();
const gostController = new GostController();

// Схема для параметров ID
const idParamSchema = z.object({
  id: z.string().min(1, "ID документа обязателен"),
});

// @route   POST /api/gost/export/:id
// @desc    Экспорт документа в формате DOCX
// @access  Private
router.post(
  "/export/:id",
  protect,
  validateParams(idParamSchema),
  gostController.exportDocument
);

export default router;
