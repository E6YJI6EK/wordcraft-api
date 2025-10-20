import * as mammoth from "mammoth";
import { ContentBlockType, IDocumentContent } from "../types";

export interface IDocumentParseResult {
  title: string;
  contents: IDocumentContent[];
}

export class DocxParserService {
  private detectContentType(htmlElement: string): ContentBlockType {
    const lowerHtml = htmlElement.toLowerCase();
    
    if (lowerHtml.includes("<img") || lowerHtml.includes("<picture")) {
      return ContentBlockType.IMAGE;
    } else if (lowerHtml.includes("<table") || lowerHtml.includes("<tr") || lowerHtml.includes("<td")) {
      return ContentBlockType.TABLE;
    } else if (lowerHtml.includes("<math") || lowerHtml.includes("equation") || lowerHtml.includes("formula")) {
      return ContentBlockType.FORMULA;
    }
    
    return ContentBlockType.PARAGRAPH;
  }

  private parseHtmlToContent(html: string): IDocumentContent[] {
    const contents: IDocumentContent[] = [];
    
    // Разбиваем HTML на блоки по заголовкам
    const headingRegex = /<h([1-3])[^>]*>(.*?)<\/h[1-3]>/gi;
    let lastIndex = 0;
    let currentContent: IDocumentContent | null = null;
    
    let match;
    let order = 1;
    while ((match = headingRegex.exec(html)) !== null) {
      // Если есть предыдущий контент, сохраняем его
      if (currentContent) {
        const contentBetween = html.substring(lastIndex, match.index);
        if (contentBetween.trim()) {
          currentContent.blocks.push({
            type: ContentBlockType.PARAGRAPH,
            textContent: contentBetween.trim(),
            order: 1
          });
        }
        contents.push(currentContent);
      }
      
      const level = parseInt(match[1] || "1") as 1 | 2 | 3;
      const titleText = (match[2] || "").replace(/<[^>]*>/g, '').trim(); // Убираем HTML теги из заголовка
      
      currentContent = {
        title: titleText || "Untitled Section",
        level,
        blocks: []
      };
      
      lastIndex = match.index + match[0].length;
      order++;
    }
    
    // Обрабатываем оставшийся контент после последнего заголовка
    if (currentContent) {
      const remainingContent = html.substring(lastIndex);
      if (remainingContent.trim()) {
        // Разбиваем оставшийся контент на блоки
        const blocks = this.parseContentBlocks(remainingContent);
        currentContent.blocks.push(...blocks);
      }
      contents.push(currentContent);
    }
    
    // Если нет заголовков, создаем один раздел с параграфом
    if (contents.length === 0) {
      const blocks = this.parseContentBlocks(html);
      contents.push({
        title: "Document Content",
        level: 1,
        blocks
      });
    }
    
    return contents;
  }

  private parseContentBlocks(html: string): Array<{ type: ContentBlockType; data: string }> {
    const blocks: Array<{ type: ContentBlockType; data: string }> = [];
    
    // Разбиваем HTML на параграфы и другие элементы
    const paragraphRegex = /<p[^>]*>(.*?)<\/p>/gi;
    const tableRegex = /<table[^>]*>.*?<\/table>/gi;
    const imgRegex = /<img[^>]*>/gi;
    
    const allMatches: Array<{ match: RegExpExecArray; type: 'paragraph' | 'table' | 'image' }> = [];
    
    // Собираем все совпадения
    let match;
    while ((match = paragraphRegex.exec(html)) !== null) {
      allMatches.push({ match, type: 'paragraph' });
    }
    paragraphRegex.lastIndex = 0;
    
    while ((match = tableRegex.exec(html)) !== null) {
      allMatches.push({ match, type: 'table' });
    }
    tableRegex.lastIndex = 0;
    
    while ((match = imgRegex.exec(html)) !== null) {
      allMatches.push({ match, type: 'image' });
    }
    imgRegex.lastIndex = 0;
    
    // Сортируем по позиции в документе
    allMatches.sort((a, b) => a.match.index - b.match.index);
    
    // Обрабатываем каждый блок
    for (const { match } of allMatches) {
      const content = match[0];
      const blockType = this.detectContentType(content);
      
      blocks.push({
        type: blockType,
        data: content
      });
    }
    
    // Если нет структурированного контента, обрабатываем как параграф
    if (blocks.length === 0 && html.trim()) {
      blocks.push({
        type: ContentBlockType.PARAGRAPH,
        data: html.trim()
      });
    }
    
    return blocks;
  }

  private extractTitleFromHtml(html: string): string {
    // Ищем первый заголовок в HTML
    const titleMatch = html.match(/<h[1-3][^>]*>(.*?)<\/h[1-3]>/i);
    if (titleMatch && titleMatch[1]) {
      return titleMatch[1].replace(/<[^>]*>/g, '').trim();
    }
    
    // Ищем title в метаданных
    const metaTitleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
    if (metaTitleMatch && metaTitleMatch[1]) {
      return metaTitleMatch[1].replace(/<[^>]*>/g, '').trim();
    }
    
    return "Untitled Document";
  }

  public async parseDocx(filePath: string): Promise<IDocumentParseResult> {
    try {
      // Используем mammoth для конвертации DOCX в HTML
      const result = await mammoth.convertToHtml({ path: filePath });
      
      if (result.messages && result.messages.length > 0) {
        console.warn("Mammoth conversion messages:", result.messages);
      }
      
      const html = result.value;
      const title = this.extractTitleFromHtml(html);
      const contents = this.parseHtmlToContent(html);
      
      console.log({
        title,
        contents,
      });

      return {
        title,
        contents,
      };
    } catch (error) {
      console.error("Error parsing DOCX file:", error);
      throw new Error("Failed to parse DOCX file");
    }
  }
}
