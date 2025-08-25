import fs from "fs";
import Document from "../models/Document";
import { IDocument, PaginatedResponse } from "../types";
import { DocxParserService } from "./DocxParserService";

interface PaginationOptions {
  page: number;
  limit: number;
  sort: any;
}

interface FileUploadData {
  file: Express.Multer.File;
  title: string;
  userId: string;
}

export class DocumentService {
  private docxParserService: DocxParserService;

  constructor() {
    this.docxParserService = new DocxParserService();
  }
  // Создание документа
  async createDocument(documentData: Partial<IDocument>): Promise<IDocument> {
    return await Document.create(documentData);
  }

  // Создание документа из файла
  async createDocumentFromFile(data: FileUploadData): Promise<IDocument> {
    const res = await this.docxParserService.parseDocx(data.file.path);
    return await Document.create({
      title: data.title,
      contents: res.contents,
      originalFile: {
        filename: data.file.originalname,
        path: data.file.path,
        mimetype: data.file.mimetype,
        size: data.file.size,
      },
      user: data.userId,
    });
  }

  // Получение документа по ID и пользователю
  async getDocumentByIdAndUser(
    documentId: string,
    userId: string
  ): Promise<IDocument | null> {
    return await Document.findOne({ _id: documentId, user: userId });
  }

  // Получение документа по ID (для публичных документов)
  async getDocumentById(documentId: string): Promise<IDocument | null> {
    return await Document.findById(documentId);
  }

  // Получение документов с пагинацией
  async getDocumentsWithPagination(
    query: any,
    options: PaginationOptions
  ): Promise<{
    documents: IDocument[];
    pagination: PaginatedResponse<any>["pagination"];
  }> {
    const { page, limit, sort } = options;
    const skip = (page - 1) * limit;

    const [documents, total] = await Promise.all([
      Document.find(query)
        .sort(sort)
        .limit(limit)
        .skip(skip)
        .populate("user", "name email"),
      Document.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      documents,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  // Обновление документа
  async updateDocument(
    documentId: string,
    updateData: Partial<IDocument>
  ): Promise<IDocument | null> {
    return await Document.findByIdAndUpdate(documentId, updateData, {
      new: true,
      runValidators: true,
    });
  }

  // Удаление документа
  async deleteDocument(documentId: string): Promise<void> {
    const document = await Document.findById(documentId);

    if (document && document.originalFile && document.originalFile.path) {
      // Удаляем файл, если он существует
      if (fs.existsSync(document.originalFile.path)) {
        fs.unlinkSync(document.originalFile.path);
      }
    }

    await Document.findByIdAndDelete(documentId);
  }

  // Дублирование документа
  async duplicateDocument(
    originalDoc: IDocument,
    userId: string
  ): Promise<IDocument> {
    return await Document.create({
      title: `${originalDoc.title} (копия)`,
      metadata: originalDoc.metadata,
      user: userId,
    });
  }

  // Поиск документов
  async searchDocuments(
    userId: string,
    searchTerm: string,
    options: PaginationOptions
  ): Promise<{
    documents: IDocument[];
    pagination: PaginatedResponse<any>["pagination"];
  }> {
    const query: any = { user: userId };

    if (searchTerm) {
      query.$text = { $search: searchTerm };
    }

    return await this.getDocumentsWithPagination(query, options);
  }

  // Получение статистики документов пользователя
  async getUserDocumentStats(userId: string): Promise<{
    total: number;
  }> {
    const total = await Document.countDocuments({ user: userId });

    return {
      total,
    };
  }
}
