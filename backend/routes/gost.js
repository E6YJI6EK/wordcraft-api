const express = require('express');
const { Document } = require('docx');
const { Packer } = require('docx');
const fs = require('fs');
const path = require('path');
const DocumentModel = require('../models/Document');
const { protect, checkDocumentOwnership } = require('../middleware/auth');

const router = express.Router();

// ГОСТ 7.32-2017 - Отчет о научно-исследовательской работе
const gost7322017 = {
  title: {
    fontSize: 16,
    fontFamily: 'Times New Roman',
    bold: true,
    alignment: 'center',
    spacing: { after: 300 }
  },
  heading1: {
    fontSize: 16,
    fontFamily: 'Times New Roman',
    bold: true,
    alignment: 'center',
    spacing: { before: 300, after: 300 }
  },
  heading2: {
    fontSize: 14,
    fontFamily: 'Times New Roman',
    bold: true,
    spacing: { before: 200, after: 200 }
  },
  heading3: {
    fontSize: 14,
    fontFamily: 'Times New Roman',
    bold: true,
    spacing: { before: 150, after: 150 }
  },
  body: {
    fontSize: 14,
    fontFamily: 'Times New Roman',
    spacing: { line: 360 }, // 1.5 интервала
    alignment: 'justify'
  },
  margins: {
    top: 2000, // 20mm
    bottom: 2000, // 20mm
    left: 3000, // 30mm
    right: 1500 // 15mm
  }
};

// ГОСТ 7.1-2003 - Библиографическая запись
const gost712003 = {
  title: {
    fontSize: 16,
    fontFamily: 'Times New Roman',
    bold: true,
    alignment: 'center',
    spacing: { after: 300 }
  },
  heading1: {
    fontSize: 16,
    fontFamily: 'Times New Roman',
    bold: true,
    alignment: 'center',
    spacing: { before: 300, after: 300 }
  },
  heading2: {
    fontSize: 14,
    fontFamily: 'Times New Roman',
    bold: true,
    spacing: { before: 200, after: 200 }
  },
  body: {
    fontSize: 14,
    fontFamily: 'Times New Roman',
    spacing: { line: 360 },
    alignment: 'justify'
  },
  margins: {
    top: 2000,
    bottom: 2000,
    left: 3000,
    right: 1500
  }
};

// ГОСТ 2.105-95 - Единая система конструкторской документации
const gost210595 = {
  title: {
    fontSize: 16,
    fontFamily: 'Times New Roman',
    bold: true,
    alignment: 'center',
    spacing: { after: 300 }
  },
  heading1: {
    fontSize: 16,
    fontFamily: 'Times New Roman',
    bold: true,
    alignment: 'center',
    spacing: { before: 300, after: 300 }
  },
  heading2: {
    fontSize: 14,
    fontFamily: 'Times New Roman',
    bold: true,
    spacing: { before: 200, after: 200 }
  },
  body: {
    fontSize: 14,
    fontFamily: 'Times New Roman',
    spacing: { line: 360 },
    alignment: 'justify'
  },
  margins: {
    top: 2000,
    bottom: 2000,
    left: 3000,
    right: 1500
  }
};

// Функция для получения настроек ГОСТ
const getGostSettings = (gostType) => {
  switch (gostType) {
    case 'gost-7.32-2017':
      return gost7322017;
    case 'gost-7.1-2003':
      return gost712003;
    case 'gost-2.105-95':
      return gost210595;
    default:
      return gost7322017;
  }
};

// @route   POST /api/gost/format
// @desc    Форматирование документа по ГОСТ
// @access  Private
router.post('/format', protect, async (req, res) => {
  try {
    const { documentId, gostType } = req.body;

    const document = await DocumentModel.findById(documentId);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Документ не найден.'
      });
    }

    if (document.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'У вас нет прав для доступа к этому документу.'
      });
    }

    const gostSettings = getGostSettings(gostType || document.gostFormat);

    // Обновляем настройки документа
    document.settings = {
      ...document.settings,
      fontSize: gostSettings.body.fontSize,
      lineSpacing: 1.5,
      margins: gostSettings.margins,
      fontFamily: gostSettings.body.fontFamily
    };

    document.gostFormat = gostType || document.gostFormat;
    await document.save();

    res.json({
      success: true,
      message: 'Документ отформатирован по ГОСТ успешно.',
      document,
      gostSettings
    });
  } catch (error) {
    console.error('Ошибка форматирования по ГОСТ:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при форматировании документа.',
      error: error.message
    });
  }
});

// @route   POST /api/gost/export/:id
// @desc    Экспорт документа в формате DOCX
// @access  Private
router.post('/export/:id', protect, checkDocumentOwnership, async (req, res) => {
  try {
    const document = req.document;
    const gostSettings = getGostSettings(document.gostFormat);

    // Создаем документ DOCX
    const doc = new Document({
      sections: [{
        properties: {
          page: {
            margin: gostSettings.margins
          }
        },
        children: [
          // Заголовок
          {
            type: 'paragraph',
            children: [{
              text: document.title,
              ...gostSettings.title
            }]
          },
          // Содержимое
          {
            type: 'paragraph',
            children: [{
              text: document.content || 'Содержимое документа',
              ...gostSettings.body
            }]
          }
        ]
      }]
    });

    // Генерируем имя файла
    const fileName = `${document.title.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.docx`;
    const filePath = path.join(__dirname, '../uploads', fileName);

    // Сохраняем файл
    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(filePath, buffer);

    // Отправляем файл
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Ошибка отправки файла:', err);
      }
      // Удаляем временный файл
      fs.unlinkSync(filePath);
    });

  } catch (error) {
    console.error('Ошибка экспорта документа:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при экспорте документа.',
      error: error.message
    });
  }
});

// @route   GET /api/gost/templates
// @desc    Получение доступных ГОСТ шаблонов
// @access  Public
router.get('/templates', (req, res) => {
  const templates = [
    {
      id: 'gost-7.32-2017',
      name: 'ГОСТ 7.32-2017',
      description: 'Отчет о научно-исследовательской работе',
      type: 'report',
      settings: gost7322017
    },
    {
      id: 'gost-7.1-2003',
      name: 'ГОСТ 7.1-2003',
      description: 'Библиографическая запись',
      type: 'bibliography',
      settings: gost712003
    },
    {
      id: 'gost-2.105-95',
      name: 'ГОСТ 2.105-95',
      description: 'Единая система конструкторской документации',
      type: 'technical',
      settings: gost210595
    }
  ];

  res.json({
    success: true,
    templates
  });
});

// @route   POST /api/gost/validate/:id
// @desc    Валидация документа на соответствие ГОСТ
// @access  Private
router.post('/validate/:id', protect, checkDocumentOwnership, async (req, res) => {
  try {
    const document = req.document;
    const gostSettings = getGostSettings(document.gostFormat);
    
    const validationResults = {
      isValid: true,
      errors: [],
      warnings: [],
      recommendations: []
    };

    // Проверяем заголовок
    if (!document.title || document.title.length < 5) {
      validationResults.errors.push('Заголовок документа должен содержать минимум 5 символов');
      validationResults.isValid = false;
    }

    // Проверяем содержимое
    if (!document.content || document.content.length < 100) {
      validationResults.warnings.push('Содержимое документа слишком короткое');
    }

    // Проверяем настройки форматирования
    if (document.settings.fontSize !== gostSettings.body.fontSize) {
      validationResults.recommendations.push(`Рекомендуемый размер шрифта: ${gostSettings.body.fontSize}pt`);
    }

    if (document.settings.fontFamily !== gostSettings.body.fontFamily) {
      validationResults.recommendations.push(`Рекомендуемый шрифт: ${gostSettings.body.fontFamily}`);
    }

    // Проверяем метаданные
    if (!document.metadata.author) {
      validationResults.warnings.push('Не указан автор документа');
    }

    if (!document.metadata.subject) {
      validationResults.warnings.push('Не указана тема документа');
    }

    res.json({
      success: true,
      validation: validationResults,
      gostType: document.gostFormat
    });

  } catch (error) {
    console.error('Ошибка валидации документа:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при валидации документа.',
      error: error.message
    });
  }
});

module.exports = router; 