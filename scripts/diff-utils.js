const fs = require('fs').promises;
const path = require('path');

/**
 * Detect the level of change in text: word, sentence, or paragraph
 * @param {string} oldText - Original text
 * @param {string} newText - Modified text
 * @returns {Object} - Change information
 */
function detectChangeLevel(oldText, newText) {
  if (oldText === newText) {
    return { level: 'none', changes: [] };
  }

  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');
  const changes = [];

  // Find changed lines
  for (let i = 0; i < Math.max(oldLines.length, newLines.length); i++) {
    const oldLine = oldLines[i] || '';
    const newLine = newLines[i] || '';

    if (oldLine !== newLine) {
      changes.push({
        lineNumber: i,
        oldLine,
        newLine,
        changeType: determineChangeType(oldLine, newLine)
      });
    }
  }

  return { level: 'changes', changes };
}

/**
 * Determine if change is word-level, sentence-level, or paragraph-level
 * @param {string} oldLine - Original line
 * @param {string} newLine - Modified line
 * @returns {string} - Change type
 */
function determineChangeType(oldLine, newLine) {
  // If entire line is different, it's a paragraph change
  if (!oldLine || !newLine) {
    return 'paragraph';
  }

  // Count word differences
  const oldWords = oldLine.split(/\s+/);
  const newWords = newLine.split(/\s+/);
  
  let differentWords = 0;
  const maxLen = Math.max(oldWords.length, newWords.length);
  
  for (let i = 0; i < maxLen; i++) {
    if (oldWords[i] !== newWords[i]) {
      differentWords++;
    }
  }

  // If only 1-2 words changed, it's a word-level change
  if (differentWords <= 2 && differentWords < oldWords.length * 0.3) {
    return 'word';
  }

  // If multiple sentences or major change, it's paragraph
  if (oldLine.includes('.') && newLine.includes('.')) {
    const oldSentences = oldLine.split(/[.!?]+/).filter(s => s.trim());
    const newSentences = newLine.split(/[.!?]+/).filter(s => s.trim());
    
    if (oldSentences.length !== newSentences.length) {
      return 'paragraph';
    }
  }

  // Default to sentence level
  return 'sentence';
}

/**
 * Extract the context around a changed line
 * @param {Array<string>} lines - All lines
 * @param {number} lineNumber - Changed line number
 * @param {string} changeType - Type of change
 * @returns {Object} - Context information
 */
function extractContext(lines, lineNumber, changeType) {
  if (changeType === 'word') {
    // For word changes, return the sentence
    return {
      startLine: lineNumber,
      endLine: lineNumber,
      text: lines[lineNumber]
    };
  }

  if (changeType === 'sentence') {
    // For sentence changes, find the paragraph boundaries
    let startLine = lineNumber;
    let endLine = lineNumber;

    // Look backwards for paragraph start
    while (startLine > 0 && lines[startLine - 1].trim() !== '') {
      startLine--;
    }

    // Look forwards for paragraph end
    while (endLine < lines.length - 1 && lines[endLine + 1].trim() !== '') {
      endLine++;
    }

    return {
      startLine,
      endLine,
      text: lines.slice(startLine, endLine + 1).join('\n')
    };
  }

  // For paragraph changes, include surrounding context
  let startLine = lineNumber;
  let endLine = lineNumber;

  // Expand to paragraph boundaries
  while (startLine > 0 && lines[startLine - 1].trim() !== '') {
    startLine--;
  }

  while (endLine < lines.length - 1 && lines[endLine + 1].trim() !== '') {
    endLine++;
  }

  return {
    startLine,
    endLine,
    text: lines.slice(startLine, endLine + 1).join('\n')
  };
}

/**
 * Read a file with a specific encoding
 * @param {string} filePath - Path to file
 * @returns {Promise<string>} - File content
 */
async function readFile(filePath) {
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return '';
  }
}

/**
 * Write content to a file
 * @param {string} filePath - Path to file
 * @param {string} content - Content to write
 */
async function writeFile(filePath, content) {
  try {
    await fs.writeFile(filePath, content, 'utf-8');
  } catch (error) {
    console.error(`Error writing file ${filePath}:`, error);
    throw error;
  }
}

/**
 * Get all question files
 * @returns {Promise<Array<string>>} - Array of question file paths
 */
async function getQuestionFiles() {
  const questionsDir = path.join(__dirname, '..', 'src', 'questions');
  const files = await fs.readdir(questionsDir);
  return files
    .filter(file => file.endsWith('.md'))
    .map(file => path.join(questionsDir, file));
}

/**
 * Get all translation directories
 * @returns {Promise<Array<{dir: string, language: string}>>}
 */
async function getTranslationDirs() {
  const translationsDir = path.join(__dirname, '..', 'src', 'translations');
  const languageMapping = require('./language-mapping.json');
  
  const dirs = [];
  for (const [dirName, languageName] of Object.entries(languageMapping)) {
    const dirPath = path.join(translationsDir, dirName);
    try {
      await fs.access(dirPath);
      dirs.push({ dir: dirPath, dirName, language: languageName });
    } catch {
      // Directory doesn't exist, skip
    }
  }
  
  return dirs;
}

module.exports = {
  detectChangeLevel,
  determineChangeType,
  extractContext,
  readFile,
  writeFile,
  getQuestionFiles,
  getTranslationDirs
};
