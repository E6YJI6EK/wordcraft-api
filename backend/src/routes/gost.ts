import express from 'express';
import { protect } from '../middleware/auth';
import { validateBody, validateParams } from '../middleware/validation';
import { gostFormatSchema } from '../validations';
import { GostController } from '../controllers/gostController';
import { z } from 'zod';

const router = express.Router();
const gostController = new GostController();

// Схема для параметров ID
const idParamSchema = z.object({
  id: z.string().min(1, 'ID документа обязателен')
});

// @route   POST /api/gost/format
// @desc    Форматирование документа по ГОСТ
// @access  Private
router.post('/format', protect, validateBody(gostFormatSchema), gostController.formatDocument);

// @route   POST /api/gost/export/:id
// @desc    Экспорт документа в формате DOCX
// @access  Private
router.post('/export/:id', protect, validateParams(idParamSchema), gostController.exportDocument);

// @route   GET /api/gost/templates
// @desc    Получение доступных ГОСТ шаблонов
// @access  Public
router.get('/templates', gostController.getTemplates);

// @route   POST /api/gost/validate/:id
// @desc    Валидация документа на соответствие ГОСТ
// @access  Private
router.post('/validate/:id', protect, validateParams(idParamSchema), gostController.validateDocument);

export default router; 