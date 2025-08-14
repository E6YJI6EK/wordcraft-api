import { Response } from 'express';
import { DocumentService } from '../services/documentService';
import { GostService } from '../services/gostService';
import { ApiResponse, AuthRequest } from '../types';
import { catchAsync } from '../utils/errorHandler';

export class GostController {
  private gostService: GostService;
  private documentService: DocumentService;

  constructor() {
    this.gostService = new GostService();
    this.documentService = new DocumentService();
  }

  // @route   POST /api/gost/format
  // @desc    Форматирование документа по ГОСТ
  // @access  Private
  formatDocument = catchAsync(async (req: AuthRequest, res: Response<ApiResponse>) => {
    const { documentId, format, customSettings } = req.body;

    const document = await this.documentService.getDocumentByIdAndUser(
      documentId,
      req.user!._id
    );

    if (!document) {
      res.status(404).json({
        success: false,
        message: 'Документ не найден.'
      });
      return;
    }

    const gostSettings = this.gostService.getGostSettings(format || document.gostFormat);

    // Обновляем настройки документа
    const updatedDocument = await this.documentService.updateDocument(documentId, {
      settings: {
        ...document.settings,
        fontSize: customSettings?.fontSize || gostSettings.body.fontSize,
        lineSpacing: customSettings?.lineSpacing || 1.5,
        margins: customSettings?.margins || gostSettings.margins,
        fontFamily: customSettings?.fontFamily || gostSettings.body.fontFamily
      },
      gostFormat: format || document.gostFormat
    });

    res.json({
      success: true,
      message: 'Документ отформатирован по ГОСТ успешно.',
      data: {
        document: updatedDocument,
        gostSettings
      }
    });
  });

  // @route   POST /api/gost/export/:id
  // @desc    Экспорт документа в формате DOCX
  // @access  Private
  exportDocument = catchAsync(async (req: AuthRequest, res: Response) => {
    const documentId = req.params['id'];
    if (!documentId) {
      res.status(400).json({
        success: false,
        message: 'ID документа обязателен.'
      });
      return;
    }

    const document = await this.documentService.getDocumentByIdAndUser(
      documentId,
      req.user!._id
    );

    if (!document) {
      res.status(404).json({
        success: false,
        message: 'Документ не найден.'
      });
      return;
    }

    const gostSettings = this.gostService.getGostSettings(document.gostFormat);
    const docxBuffer = await this.gostService.createDocxDocument(document, gostSettings);
    const fileName = `${document.title.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.docx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(docxBuffer);
  });

  // @route   GET /api/gost/templates
  // @desc    Получение доступных ГОСТ шаблонов
  // @access  Public
  getTemplates = (_req: any, res: Response<ApiResponse>) => {
    const templates = this.gostService.getAvailableTemplates();

    res.json({
      success: true,
      data: templates
    });
  };

  // @route   POST /api/gost/validate/:id
  // @desc    Валидация документа на соответствие ГОСТ
  // @access  Private
  validateDocument = catchAsync(async (req: AuthRequest, res: Response<ApiResponse>) => {
    const documentId = req.params['id'];
    if (!documentId) {
      res.status(400).json({
        success: false,
        message: 'ID документа обязателен.'
      });
      return;
    }

    const document = await this.documentService.getDocumentByIdAndUser(
      documentId,
      req.user!._id
    );

    if (!document) {
      res.status(404).json({
        success: false,
        message: 'Документ не найден.'
      });
      return;
    }

    const validationResults = this.gostService.validateDocument(document);

    res.json({
      success: true,
      data: {
        validation: validationResults,
        gostType: document.gostFormat
      }
    });
  });
} 