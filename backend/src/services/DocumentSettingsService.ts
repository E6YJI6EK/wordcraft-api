import { DocumentSettings } from "../models/DocumentSettings";
import { IDocumentSettings } from "../types";

export class DocumentSettingsService {
  public async findById(
    documentSettingsId: string
  ): Promise<IDocumentSettings | null> {
    return await DocumentSettings.findById(documentSettingsId);
  }
}
