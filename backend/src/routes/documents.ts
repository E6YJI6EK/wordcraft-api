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

// @route   GET /api/documents
// @desc    Получение всех документов пользователя
// @access  Private
router.get('/', protect, validateQuery(documentQuerySchema), documentController.getDocuments);

// @route   POST /api/documents
// @desc    Создание нового документа
// @access  Private
router.post('/', protect, validateBody(createDocumentSchema), documentController.createDocument);

// @route   POST /api/documents/upload
// @desc    Загрузка документа из файла
// @access  Private
router.post('/upload', protect, upload.single('document'), documentController.uploadDocument);

// @route   GET /api/documents/:id
// @desc    Получение документа по ID
// @access  Private
router.get('/:id', protect, validateParams(idParamSchema), documentController.getDocument);

// @route   PUT /api/documents/:id
// @desc    Обновление документа
// @access  Private
router.put('/:id', protect, validateParams(idParamSchema), validateBody(updateDocumentSchema), documentController.updateDocument);

// @route   DELETE /api/documents/:id
// @desc    Удаление документа
// @access  Private
router.delete('/:id', protect, validateParams(idParamSchema), documentController.deleteDocument);

// @route   POST /api/documents/:id/duplicate
// @desc    Дублирование документа
// @access  Private
router.post('/:id/duplicate', protect, validateParams(idParamSchema), documentController.duplicateDocument);

export default router; 