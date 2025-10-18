import { Response } from 'express';
import { AuthRequest, ApiResponse, PaginatedResponse } from '../types';
import { DocumentService } from '../services/documentService';
import { catchAsync } from '../utils/errorHandler';

export class DocumentController {
  private documentService: DocumentService;

  constructor() {
    this.documentService = new DocumentService();
  }

  // @route   GET /api/documents
  // @desc    Получение всех документов пользователя
  // @access  Private
  getDocuments = catchAsync(async (req: AuthRequest, res: Response<PaginatedResponse<any>>) => {
    const { page, limit, search, sortBy, sortOrder } = req.query;
    
    const query: any = { user: req.user!._id };
    
    if (search) {
      query.$text = { $search: search };
    }

    const sortOptions: any = {};
    sortOptions[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

    const result = await this.documentService.getDocumentsWithPagination(
      query,
      {
        page: Number(page) || 1,
        limit: Number(limit) || 10,
        sort: sortOptions
      }
    );

    res.json({
      success: true,
      data: result.documents,
      pagination: result.pagination
    });
  });

  // @route   POST /api/documents
  // @desc    Создание нового документа
  // @access  Private
  createDocument = catchAsync(async (req: AuthRequest, res: Response<ApiResponse>) => {
    const documentData = {
      ...req.body,
      user: req.user!._id
    };

    const document = await this.documentService.createDocument(documentData);

    res.status(201).json({
      success: true,
      message: 'Документ создан успешно.',
      data: document
    });
  });

  // @route   POST /api/documents/upload
  // @desc    Загрузка документа из файла
  // @access  Private
  uploadDocument = catchAsync(async (req: AuthRequest, res: Response<ApiResponse>) => {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'Файл не был загружен.'
      });
      return;
    }

    const { title } = req.body;
console.log(req.file);
    const document = await this.documentService.createDocumentFromFile({
      file: req.file,
      title: title || req.file.originalname,
      userId: req.user!._id
    });

    res.status(201).json({
      success: true,
      message: 'Документ загружен успешно.',
      data: document
    });
  });

  // @route   GET /api/documents/:id
  // @desc    Получение документа по ID
  // @access  Private
  getDocument = catchAsync(async (req: AuthRequest, res: Response<ApiResponse>) => {
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

    res.json({
      success: true,
      data: document
    });
  });

  // @route   PUT /api/documents/:id
  // @desc    Обновление документа
  // @access  Private
  updateDocument = catchAsync(async (req: AuthRequest, res: Response<ApiResponse>) => {
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

    const updateData = { ...req.body };
    updateData.updatedAt = new Date();

    const updatedDocument = await this.documentService.updateDocument(
      documentId,
      updateData
    );

    res.json({
      success: true,
      message: 'Документ обновлен успешно.',
      data: updatedDocument
    });
  });

  // @route   DELETE /api/documents/:id
  // @desc    Удаление документа
  // @access  Private
  deleteDocument = catchAsync(async (req: AuthRequest, res: Response<ApiResponse>) => {
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

    await this.documentService.deleteDocument(documentId);

    res.json({
      success: true,
      message: 'Документ удален успешно.'
    });
  });

  // @route   POST /api/documents/:id/duplicate
  // @desc    Дублирование документа
  // @access  Private
  duplicateDocument = catchAsync(async (req: AuthRequest, res: Response<ApiResponse>) => {
    const documentId = req.params['id'];
    if (!documentId) {
      res.status(400).json({
        success: false,
        message: 'ID документа обязателен.'
      });
      return;
    }

    const originalDoc = await this.documentService.getDocumentByIdAndUser(
      documentId,
      req.user!._id
    );

    if (!originalDoc) {
      res.status(404).json({
        success: false,
        message: 'Документ не найден.'
      });
      return;
    }

    const duplicatedDoc = await this.documentService.duplicateDocument(
      originalDoc,
      req.user!._id
    );

    res.status(201).json({
      success: true,
      message: 'Документ продублирован успешно.',
      data: duplicatedDoc
    });
  });
} 