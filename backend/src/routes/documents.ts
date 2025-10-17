import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { protect } from '../middleware/auth';
import { validateBody, validateQuery, validateParams } from '../middleware/validation';
import { createDocumentSchema, updateDocumentSchema, documentQuerySchema } from '../validations';
import { DocumentController } from '../controllers/documentController';
import { z } from 'zod';

const router = express.Router();
const documentController = new DocumentController();

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Неподдерживаемый тип файла. Разрешены только .doc, .docx, .txt'));
    }
  }
});

// Схема для параметров ID
const idParamSchema = z.object({
  id: z.string().min(1, 'ID документа обязателен')
});

/**
 * @openapi
 * /api/documents:
 *   get:
 *     tags: [Documents]
 *     summary: Получение всех документов пользователя
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список документов
 */
// @desc    Получение всех документов пользователя
// @access  Private
router.get('/', protect, validateQuery(documentQuerySchema), documentController.getDocuments);

/**
 * @openapi
 * /api/documents:
 *   post:
 *     tags: [Documents]
 *     summary: Создание нового документа
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *     responses:
 *       201:
 *         description: Документ создан
 */
// @desc    Создание нового документа
// @access  Private
router.post('/', protect, validateBody(createDocumentSchema), documentController.createDocument);

/**
 * @openapi
 * /api/documents/upload:
 *   post:
 *     tags: [Documents]
 *     summary: Загрузка документа из файла
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *     responses:
 *       201:
 *         description: Документ загружен
 */
// @desc    Загрузка документа из файла
// @access  Private
router.post('/upload', protect, upload.single('document'), documentController.uploadDocument);

/**
 * @openapi
 * /api/documents/{id}:
 *   get:
 *     tags: [Documents]
 *     summary: Получение документа по ID
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
 *         description: Документ
 */
// @desc    Получение документа по ID
// @access  Private
router.get('/:id', protect, validateParams(idParamSchema), documentController.getDocument);

/**
 * @openapi
 * /api/documents/{id}:
 *   put:
 *     tags: [Documents]
 *     summary: Обновление документа
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *     responses:
 *       200:
 *         description: Документ обновлен
 */
// @desc    Обновление документа
// @access  Private
router.put('/:id', protect, validateParams(idParamSchema), validateBody(updateDocumentSchema), documentController.updateDocument);

/**
 * @openapi
 * /api/documents/{id}:
 *   delete:
 *     tags: [Documents]
 *     summary: Удаление документа
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Документ удален
 */
// @desc    Удаление документа
// @access  Private
router.delete('/:id', protect, validateParams(idParamSchema), documentController.deleteDocument);

/**
 * @openapi
 * /api/documents/{id}/duplicate:
 *   post:
 *     tags: [Documents]
 *     summary: Дублирование документа
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Документ продублирован
 */
// @desc    Дублирование документа
// @access  Private
router.post('/:id/duplicate', protect, validateParams(idParamSchema), documentController.duplicateDocument);

export default router; 