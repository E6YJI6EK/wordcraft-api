import express from "express";
import { z } from "zod";
import { ExportController } from "../controllers/ExportController";
import { protect } from "../middleware/auth";
import { validateParams } from "../middleware/validation";

const router = express.Router();
const gostController = new ExportController();

// Схема для параметров ID
const idParamSchema = z.object({
  id: z.string().min(1, "ID документа обязателен"),
});

/**
 * @openapi
 * /api/gost/export/{id}:
 *   post:
 *     tags: [Export]
 *     summary: Экспорт документа в формате DOCX
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Файл DOCX
 */
// @desc    Экспорт документа в формате DOCX
// @access  Private
router.post(
  "/export/:id",
  protect,
  validateParams(idParamSchema),
  gostController.exportDocument
);

export default router;
