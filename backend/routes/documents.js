const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Document = require('../models/Document');
const { protect, checkDocumentOwnership } = require('../middleware/auth');

const router = express.Router();

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Неподдерживаемый тип файла. Разрешены только .doc, .docx, .txt'), false);
    }
  }
});

// @route   GET /api/documents
// @desc    Получение всех документов пользователя
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { page = 1, limit = 10, type, status, search } = req.query;
    
    const query = { user: req.user._id };
    
    if (type) query.type = type;
    if (status) query.status = status;
    if (search) {
      query.$text = { $search: search };
    }

    const documents = await Document.find(query)
      .sort({ updatedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('user', 'name email');

    const total = await Document.countDocuments(query);

    res.json({
      success: true,
      documents,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Ошибка получения документов:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении документов.',
      error: error.message
    });
  }
});

// @route   POST /api/documents
// @desc    Создание нового документа
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { title, type, content, gostFormat, settings, metadata } = req.body;

    const document = await Document.create({
      title,
      type,
      content: content || '',
      gostFormat,
      settings,
      metadata,
      user: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Документ создан успешно.',
      document
    });
  } catch (error) {
    console.error('Ошибка создания документа:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при создании документа.',
      error: error.message
    });
  }
});

// @route   POST /api/documents/upload
// @desc    Загрузка документа из файла
// @access  Private
router.post('/upload', protect, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Файл не был загружен.'
      });
    }

    const { title, type, gostFormat } = req.body;

    // Здесь можно добавить логику для извлечения содержимого из файла
    // Пока создаем документ с базовой информацией
    const document = await Document.create({
      title: title || req.file.originalname,
      type: type || 'report',
      gostFormat: gostFormat || 'gost-7.32-2017',
      originalFile: {
        filename: req.file.originalname,
        path: req.file.path,
        mimetype: req.file.mimetype,
        size: req.file.size
      },
      user: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Документ загружен успешно.',
      document
    });
  } catch (error) {
    console.error('Ошибка загрузки документа:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при загрузке документа.',
      error: error.message
    });
  }
});

// @route   GET /api/documents/:id
// @desc    Получение документа по ID
// @access  Private
router.get('/:id', protect, checkDocumentOwnership, async (req, res) => {
  try {
    res.json({
      success: true,
      document: req.document
    });
  } catch (error) {
    console.error('Ошибка получения документа:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении документа.',
      error: error.message
    });
  }
});

// @route   PUT /api/documents/:id
// @desc    Обновление документа
// @access  Private
router.put('/:id', protect, checkDocumentOwnership, async (req, res) => {
  try {
    const { title, content, gostFormat, settings, metadata, status } = req.body;

    const updateData = {};
    if (title) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (gostFormat) updateData.gostFormat = gostFormat;
    if (settings) updateData.settings = settings;
    if (metadata) updateData.metadata = metadata;
    if (status) updateData.status = status;

    updateData.updatedAt = Date.now();
    updateData.version = req.document.version + 1;

    const document = await Document.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Документ обновлен успешно.',
      document
    });
  } catch (error) {
    console.error('Ошибка обновления документа:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при обновлении документа.',
      error: error.message
    });
  }
});

// @route   DELETE /api/documents/:id
// @desc    Удаление документа
// @access  Private
router.delete('/:id', protect, checkDocumentOwnership, async (req, res) => {
  try {
    // Удаляем файл, если он существует
    if (req.document.originalFile && req.document.originalFile.path) {
      const filePath = req.document.originalFile.path;
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await Document.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Документ удален успешно.'
    });
  } catch (error) {
    console.error('Ошибка удаления документа:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при удалении документа.',
      error: error.message
    });
  }
});

// @route   POST /api/documents/:id/duplicate
// @desc    Дублирование документа
// @access  Private
router.post('/:id/duplicate', protect, checkDocumentOwnership, async (req, res) => {
  try {
    const originalDoc = req.document;
    
    const duplicatedDoc = await Document.create({
      title: `${originalDoc.title} (копия)`,
      type: originalDoc.type,
      content: originalDoc.content,
      gostFormat: originalDoc.gostFormat,
      settings: originalDoc.settings,
      metadata: originalDoc.metadata,
      user: req.user._id,
      status: 'draft'
    });

    res.status(201).json({
      success: true,
      message: 'Документ продублирован успешно.',
      document: duplicatedDoc
    });
  } catch (error) {
    console.error('Ошибка дублирования документа:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при дублировании документа.',
      error: error.message
    });
  }
});

module.exports = router; 