import { Document, Packer, Paragraph, TextRun } from 'docx';
import { IDocument } from '../types';

interface GostSettings {
  title: any;
  heading1: any;
  heading2: any;
  heading3?: any;
  body: any;
  margins: any;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  recommendations: string[];
}

interface GostTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  settings: GostSettings;
}

export class GostService {
  // ГОСТ 7.32-2017 - Отчет о научно-исследовательской работе
  private gost7322017: GostSettings = {
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
  private gost712003: GostSettings = {
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
  private gost210595: GostSettings = {
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

  // Получение настроек ГОСТ
  getGostSettings(gostType: string): GostSettings {
    switch (gostType) {
      case 'gost-7.32-2017':
        return this.gost7322017;
      case 'gost-7.1-2003':
        return this.gost712003;
      case 'gost-2.105-95':
        return this.gost210595;
      default:
        return this.gost7322017;
    }
  }

  // Создание DOCX документа
  async createDocxDocument(document: IDocument, gostSettings: GostSettings): Promise<Buffer> {
    const doc = new Document({
      sections: [{
        properties: {
          page: {
            margin: gostSettings.margins
          }
        },
        children: [
          // Заголовок
          new Paragraph({
            children: [new TextRun({
              text: document.title,
              ...gostSettings.title
            })]
          }),
          // Содержимое
          new Paragraph({
            children: [new TextRun({
              text: document.content || 'Содержимое документа',
              ...gostSettings.body
            })]
          })
        ]
      }]
    });

    return await Packer.toBuffer(doc);
  }

  // Получение доступных шаблонов ГОСТ
  getAvailableTemplates(): GostTemplate[] {
    return [
      {
        id: 'gost-7.32-2017',
        name: 'ГОСТ 7.32-2017',
        description: 'Отчет о научно-исследовательской работе',
        type: 'report',
        settings: this.gost7322017
      },
      {
        id: 'gost-7.1-2003',
        name: 'ГОСТ 7.1-2003',
        description: 'Библиографическая запись',
        type: 'bibliography',
        settings: this.gost712003
      },
      {
        id: 'gost-2.105-95',
        name: 'ГОСТ 2.105-95',
        description: 'Единая система конструкторской документации',
        type: 'technical',
        settings: this.gost210595
      }
    ];
  }

  // Валидация документа на соответствие ГОСТ
  validateDocument(document: IDocument): ValidationResult {
    const gostSettings = this.getGostSettings(document.gostFormat);
    
    const validationResults: ValidationResult = {
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

    if (document.title && document.title.length > 200) {
      validationResults.warnings.push('Заголовок документа слишком длинный');
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

    if (document.settings.lineSpacing !== 1.5) {
      validationResults.recommendations.push('Рекомендуемый межстрочный интервал: 1.5');
    }

    // Проверяем метаданные
    if (!document.metadata.author) {
      validationResults.warnings.push('Не указан автор документа');
    }

    if (!document.metadata.subject) {
      validationResults.warnings.push('Не указана тема документа');
    }

    if (!document.metadata.year) {
      validationResults.warnings.push('Не указан год создания документа');
    }

    // Проверяем поля
    if (document.metadata.year && (document.metadata.year < 2000 || document.metadata.year > new Date().getFullYear() + 1)) {
      validationResults.errors.push('Некорректный год создания документа');
      validationResults.isValid = false;
    }

    return validationResults;
  }

  // Применение ГОСТ настроек к документу
  applyGostSettings(document: IDocument, gostType: string): Partial<IDocument> {
    const gostSettings = this.getGostSettings(gostType);
    
    return {
      gostFormat: gostType as 'gost-7.32-2017' | 'gost-7.1-2003' | 'gost-2.105-95',
      settings: {
        ...document.settings,
        fontSize: gostSettings.body.fontSize,
        lineSpacing: 1.5,
        margins: gostSettings.margins,
        fontFamily: gostSettings.body.fontFamily
      }
    };
  }

  // Получение рекомендаций по форматированию
  getFormattingRecommendations(document: IDocument): string[] {
    const gostSettings = this.getGostSettings(document.gostFormat);
    const recommendations: string[] = [];

    if (document.settings.fontSize !== gostSettings.body.fontSize) {
      recommendations.push(`Измените размер шрифта на ${gostSettings.body.fontSize}pt`);
    }

    if (document.settings.fontFamily !== gostSettings.body.fontFamily) {
      recommendations.push(`Измените шрифт на ${gostSettings.body.fontFamily}`);
    }

    if (document.settings.lineSpacing !== 1.5) {
      recommendations.push('Установите межстрочный интервал 1.5');
    }

    if (!document.metadata.author) {
      recommendations.push('Добавьте информацию об авторе');
    }

    if (!document.metadata.subject) {
      recommendations.push('Добавьте тему документа');
    }

    return recommendations;
  }
} 