#!/usr/bin/env node

const { execSync } = require('child_process');
const Translator = require('./translator');
const {
  readFile,
  writeFile,
  detectChangeLevel,
  extractContext
} = require('./diff-utils');
const path = require('path');
const fs = require('fs').promises;

/**
 * Get changed lines from git diff
 * @param {string} filePath - Path to the file
 * @returns {Promise<Array>} - Array of changed line information
 */
async function getChangedContent(filePath) {
  try {
    // Get the diff for the file
    const diff = execSync(
      `git diff HEAD~1 HEAD -- "${filePath}" || git diff -- "${filePath}" || true`,
      { encoding: 'utf-8', cwd: path.join(__dirname, '..') }
    );

    if (!diff) {
      return [];
    }

    const currentContent = await readFile(filePath);
    const lines = currentContent.split('\n');
    const changes = [];

    // Parse diff to find changed lines
    const diffLines = diff.split('\n');
    let lineNumber = 0;

    for (const diffLine of diffLines) {
      // Track line numbers from diff headers
      const headerMatch = diffLine.match(/^@@ -\d+,?\d* \+(\d+),?\d* @@/);
      if (headerMatch) {
        lineNumber = parseInt(headerMatch[1]) - 1;
        continue;
      }

      // Lines starting with + are additions (new content)
      if (diffLine.startsWith('+') && !diffLine.startsWith('+++')) {
        const content = diffLine.substring(1);
        changes.push({
          lineNumber,
          content,
          type: 'added'
        });
        lineNumber++;
      } 
      // Lines starting with - are deletions (old content)
      else if (diffLine.startsWith('-') && !diffLine.startsWith('---')) {
        changes.push({
          lineNumber,
          content: diffLine.substring(1),
          type: 'deleted'
        });
      } 
      // Context lines (unchanged)
      else if (diffLine.startsWith(' ')) {
        lineNumber++;
      }
    }

    return changes.filter(c => c.type === 'added').map(c => ({
      lineNumber: c.lineNumber,
      content: c.content,
      context: extractContext(lines, c.lineNumber, 'sentence')
    }));

  } catch (error) {
    console.error(`Error getting changed content for ${filePath}:`, error.message);
    return [];
  }
}

/**
 * Update translation file with new translations
 * @param {string} translationPath - Path to translation file
 * @param {string} originalText - Original text to find
 * @param {string} translatedText - New translated text
 */
async function updateTranslationFile(translationPath, originalText, translatedText) {
  try {
    let content = await readFile(translationPath);
    
    if (!content) {
      return false;
    }

    // Simple replacement - in production, you might want more sophisticated matching
    content = content.replace(originalText, translatedText);
    
    await writeFile(translationPath, content);
    return true;
  } catch (error) {
    console.error(`Error updating translation file ${translationPath}:`, error);
    return false;
  }
}

/**
 * Process incremental translation for changed files
 */
async function incrementalTranslate() {
  console.log('Starting incremental translation...');

  const questionsDir = path.join(__dirname, '..', 'src', 'questions');
  const languageMapping = require('./language-mapping.json');
  
  // Get all question files
  const questionFiles = (await fs.readdir(questionsDir))
    .filter(f => f.endsWith('.md'))
    .map(f => path.join(questionsDir, f));

  const translator = new Translator();
  let totalChanges = 0;

  for (const questionFile of questionFiles) {
    const changes = await getChangedContent(questionFile);
    
    if (changes.length === 0) {
      continue;
    }

    console.log(`\nFound ${changes.length} change(s) in ${path.basename(questionFile)}`);
    totalChanges += changes.length;

    // Translate each changed context to all languages
    for (const change of changes) {
      const contextText = change.context.text;
      
      console.log(`Translating context: "${contextText.substring(0, 60)}..."`);

      for (const [dirName, languageName] of Object.entries(languageMapping)) {
        const translationDir = path.join(__dirname, '..', 'src', 'translations', dirName);
        const translationFile = path.join(translationDir, 'README.md');

        try {
          // Check if translation file exists
          await fs.access(translationFile);

          // Translate the context
          const translatedContext = await translator.translate(
            contextText,
            languageName,
            'Front-end Developer Interview Questions'
          );

          // Update the translation file
          await updateTranslationFile(translationFile, contextText, translatedContext);
          
          console.log(`  ✓ Updated ${languageName}`);

        } catch (error) {
          console.error(`  ✗ Failed to update ${languageName}:`, error.message);
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
  }

  if (totalChanges === 0) {
    console.log('\nNo changes detected in question files.');
  } else {
    console.log(`\n✓ Incremental translation complete! Processed ${totalChanges} change(s).`);
  }
}

// Run if called directly
if (require.main === module) {
  incrementalTranslate().catch(error => {
    console.error('Incremental translation failed:', error);
    process.exit(1);
  });
}

module.exports = { incrementalTranslate, getChangedContent };
