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
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           maxLength: 100
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [coursework, thesis, report, essay]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, in_progress, completed]
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt, title]
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
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
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 200
 *               type:
 *                 type: string
 *                 enum: [coursework, thesis, report, essay]
 *               content:
 *                 type: string
 *               gostFormat:
 *                 type: string
 *                 enum: [gost-7.32-2017, gost-7.1-2003, gost-2.105-95]
 *                 default: gost-7.32-2017
 *               settings:
 *                 type: object
 *                 properties:
 *                   fontSize:
 *                     type: number
 *                     minimum: 8
 *                     maximum: 72
 *                     default: 14
 *                   lineSpacing:
 *                     type: number
 *                     minimum: 1
 *                     maximum: 3
 *                     default: 1.5
 *                   margins:
 *                     type: object
 *                     properties:
 *                       top:
 *                         type: number
 *                         minimum: 10
 *                         maximum: 50
 *                         default: 20
 *                       bottom:
 *                         type: number
 *                         minimum: 10
 *                         maximum: 50
 *                         default: 20
 *                       left:
 *                         type: number
 *                         minimum: 20
 *                         maximum: 50
 *                         default: 30
 *                       right:
 *                         type: number
 *                         minimum: 10
 *                         maximum: 30
 *                         default: 15
 *                   fontFamily:
 *                     type: string
 *                     default: Times New Roman
 *               metadata:
 *                 type: object
 *                 properties:
 *                   author:
 *                     type: string
 *                     maxLength: 100
 *                   supervisor:
 *                     type: string
 *                     maxLength: 100
 *                   department:
 *                     type: string
 *                     maxLength: 100
 *                   year:
 *                     type: number
 *                   subject:
 *                     type: string
 *                     maxLength: 200
 *                   keywords:
 *                     type: array
 *                     items:
 *                       type: string
 *                       maxLength: 50
 *                     maxItems: 10
 *               isPublic:
 *                 type: boolean
 *                 default: false
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                   maxLength: 30
 *                 maxItems: 20
 *             required:
 *               - title
 *               - type
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
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               document:
 *                 type: string
 *                 format: binary
 *             required:
 *               - document
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
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 200
 *               type:
 *                 type: string
 *                 enum: [coursework, thesis, report, essay]
 *               content:
 *                 type: string
 *               gostFormat:
 *                 type: string
 *                 enum: [gost-7.32-2017, gost-7.1-2003, gost-2.105-95]
 *               settings:
 *                 type: object
 *                 properties:
 *                   fontSize:
 *                     type: number
 *                     minimum: 8
 *                     maximum: 72
 *                   lineSpacing:
 *                     type: number
 *                     minimum: 1
 *                     maximum: 3
 *                   margins:
 *                     type: object
 *                     properties:
 *                       top:
 *                         type: number
 *                         minimum: 10
 *                         maximum: 50
 *                       bottom:
 *                         type: number
 *                         minimum: 10
 *                         maximum: 50
 *                       left:
 *                         type: number
 *                         minimum: 20
 *                         maximum: 50
 *                       right:
 *                         type: number
 *                         minimum: 10
 *                         maximum: 30
 *                   fontFamily:
 *                     type: string
 *               metadata:
 *                 type: object
 *                 properties:
 *                   author:
 *                     type: string
 *                   supervisor:
 *                     type: string
 *                   department:
 *                     type: string
 *                   year:
 *                     type: number
 *                   subject:
 *                     type: string
 *                   keywords:
 *                     type: array
 *                     items:
 *                       type: string
 *               isPublic:
 *                 type: boolean
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
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