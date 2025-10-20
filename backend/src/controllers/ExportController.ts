import { Response } from "express";
import { DocumentService } from "../services/documentService";
import { ConverterService } from "../services/ConverterService";
import { AuthRequest } from "../types";
import { catchAsync } from "../utils/errorHandler";

export class ExportController {
  private converterService: ConverterService;
  private documentService: DocumentService;

  constructor() {
    this.converterService = new ConverterService();
    this.documentService = new DocumentService();
  }

  // @route   POST /api/gost/export/:id
  // @desc    Экспорт документа в формате DOCX
  // @access  Private
  exportDocument = catchAsync(async (req: AuthRequest, res: Response) => {
    const documentId = req.params["id"];
    if (!documentId) {
      res.status(400).json({
        success: false,
        message: "ID документа обязателен.",
      });
      return;
    }

    const document = await this.documentService.getDocumentWithContents(
      documentId,
      req.user!._id
    );

    if (!document) {
      res.status(404).json({
        success: false,
        message: "Документ не найден.",
      });
      return;
    }

    const docxBuffer = await this.converterService.createDocxDocument(
      document,
      document.settings
    );
    const fileName = `${document.title.replace(
      /[^a-zA-Z0-9]/g,
      "_"
    )}_${Date.now()}.docx`;

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.send(docxBuffer);
  });
}
