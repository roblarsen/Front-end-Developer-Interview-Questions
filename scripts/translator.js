const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

class Translator {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  /**
   * Translate text to target language using Google Gemini
   * @param {string} text - The text to translate
   * @param {string} targetLanguage - The target language name (e.g., "French", "Spanish")
   * @param {string} context - Additional context for the translation
   * @returns {Promise<string>} - The translated text
   */
  async translate(text, targetLanguage, context = '') {
    const prompt = `Translate the following text to ${targetLanguage}. 
This is from a Front-end Developer Interview Questions document.
${context ? `Context: ${context}` : ''}
Maintain the exact markdown formatting, code blocks, and structure.
Only translate the natural language text, not code snippets or HTML tags.
Preserve all markdown syntax like *, **, #, [], (), etc.

Text to translate:
${text}

Translation:`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const translatedText = response.text().trim();
      return translatedText;
    } catch (error) {
      console.error(`Translation error for ${targetLanguage}:`, error);
      throw error;
    }
  }

  /**
   * Translate multiple texts in batch
   * @param {Array<{text: string, targetLanguage: string, context?: string}>} items
   * @returns {Promise<Array<string>>}
   */
  async translateBatch(items) {
    const translations = [];
    
    for (const item of items) {
      const translation = await this.translate(
        item.text, 
        item.targetLanguage, 
        item.context
      );
      translations.push(translation);
      
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    return translations;
  }
}

module.exports = Translator;
