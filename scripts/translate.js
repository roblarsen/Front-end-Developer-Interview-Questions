#!/usr/bin/env node

const Translator = require('./translator');
const {
  readFile,
  writeFile,
  getTranslationDirs
} = require('./diff-utils');
const path = require('path');
const fs = require('fs').promises;

/**
 * Get the source questions content
 * @returns {Promise<Object>} - Map of question file names to content
 */
async function getSourceContent() {
  const questionsDir = path.join(__dirname, '..', 'src', 'questions');
  const files = await fs.readdir(questionsDir);
  const content = {};

  for (const file of files) {
    if (file.endsWith('.md')) {
      const filePath = path.join(questionsDir, file);
      content[file] = await readFile(filePath);
    }
  }

  return content;
}

/**
 * Extract frontmatter from markdown
 * @param {string} content - Markdown content
 * @returns {Object} - { frontmatter, body }
 */
function extractFrontmatter(content) {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (match) {
    return {
      frontmatter: match[1],
      body: match[2]
    };
  }

  return {
    frontmatter: '',
    body: content
  };
}

/**
 * Build the translated content with proper frontmatter
 * @param {string} translatedBody - Translated body content
 * @param {string} language - Target language
 * @param {string} dirName - Directory name
 * @param {string} questionType - Type of question (e.g., 'general-questions')
 * @returns {string} - Complete translated document
 */
function buildTranslatedContent(translatedBody, language, dirName, questionType) {
  const title = translatedBody.split('\n')[0].replace(/^#*\s*/, '');
  
  const frontmatter = `---
title: ${title}
layout: layouts/page.njk
permalink: /translations/${dirName}/index.html
lang: ${dirName.substring(0, 2)}
---

`;

  return frontmatter + translatedBody;
}

/**
 * Translate content to a specific language
 * @param {Object} sourceContent - Map of question files to content
 * @param {string} targetLanguage - Target language name
 * @param {string} targetDir - Target directory path
 * @param {string} dirName - Directory name
 */
async function translateToLanguage(sourceContent, targetLanguage, targetDir, dirName) {
  console.log(`\nTranslating to ${targetLanguage}...`);
  const translator = new Translator();

  // Combine all questions into a single document for translation
  let combinedContent = '# Front-end Developer Interview Questions\n\n';
  combinedContent += 'This file contains a number of front-end interview questions that can be used when vetting potential candidates. It is by no means recommended to use every single question here on the same candidate (that would take hours). Choosing a few items from this list should help you vet the intended skills you require.\n\n';
  combinedContent += '**Note:** Keep in mind that many of these questions are open-ended and could lead to interesting discussions that tell you more about the person\'s capabilities than a straight answer would.\n\n';
  combinedContent += '## Table of Contents\n\n';
  
  const sections = [
    { file: 'general-questions.md', title: 'General Questions', anchor: 'general-questions' },
    { file: 'html-questions.md', title: 'HTML Questions', anchor: 'html-questions' },
    { file: 'css-questions.md', title: 'CSS Questions', anchor: 'css-questions' },
    { file: 'javascript-questions.md', title: 'JS Questions', anchor: 'js-questions' },
    { file: 'coding-questions.md', title: 'Coding Questions', anchor: 'code-questions' },
    { file: 'testing-questions.md', title: 'Testing Questions', anchor: 'testing-questions' },
    { file: 'performance-questions.md', title: 'Performance Questions', anchor: 'performance-questions' },
    { file: 'network-questions.md', title: 'Network Questions', anchor: 'network-questions' },
    { file: 'fun-questions.md', title: 'Fun Questions', anchor: 'fun-questions' }
  ];

  // Build table of contents
  for (const section of sections) {
    combinedContent += `1. [${section.title}](#${section.anchor})\n`;
  }

  combinedContent += '\n';

  // Add each section
  for (const section of sections) {
    if (sourceContent[section.file]) {
      const { body } = extractFrontmatter(sourceContent[section.file]);
      combinedContent += `#### [[⬆]](#toc) <a name='${section.anchor}'>${section.title}:</a>\n\n`;
      combinedContent += body.trim() + '\n\n';
    }
  }

  // Add getting involved section
  combinedContent += `#### Getting Involved:\n\n`;
  combinedContent += `1. [Contributors](https://github.com/h5bp/Front-end-Developer-Interview-Questions/blob/master/CONTRIBUTORS.md)\n`;
  combinedContent += `1. [How to Contribute](https://github.com/h5bp/Front-end-Developer-Interview-Questions/blob/master/.github/CONTRIBUTING.md)\n`;
  combinedContent += `1. [License](https://github.com/h5bp/Front-end-Developer-Interview-Questions/blob/master/LICENSE.md)\n\n`;

  try {
    // Translate the combined content
    console.log(`Translating ${combinedContent.length} characters...`);
    const translatedContent = await translator.translate(
      combinedContent,
      targetLanguage,
      'This is a comprehensive interview questions document for front-end developers'
    );

    // Write the translated README.md
    const readmePath = path.join(targetDir, 'README.md');
    await writeFile(readmePath, translatedContent);
    console.log(`✓ Translated to ${targetLanguage} at ${readmePath}`);
  } catch (error) {
    console.error(`✗ Failed to translate to ${targetLanguage}:`, error.message);
    throw error;
  }
}

/**
 * Main function to translate content
 * @param {string} targetLang - Specific language to translate (optional)
 */
async function translate(targetLang = null) {
  try {
    console.log('Starting translation process...');
    
    // Get source content
    const sourceContent = await getSourceContent();
    console.log(`Loaded ${Object.keys(sourceContent).length} source files`);

    // Get translation directories
    const translationDirs = await getTranslationDirs();
    
    // Filter by target language if specified
    let dirsToTranslate = translationDirs;
    if (targetLang) {
      dirsToTranslate = translationDirs.filter(d => 
        d.dirName === targetLang || d.language.toLowerCase() === targetLang.toLowerCase()
      );
      
      if (dirsToTranslate.length === 0) {
        console.error(`Language '${targetLang}' not found. Available languages:`);
        translationDirs.forEach(d => console.log(`  - ${d.dirName} (${d.language})`));
        process.exit(1);
      }
    }

    console.log(`Translating to ${dirsToTranslate.length} language(s)...`);

    // Translate to each language
    for (const { dir, dirName, language } of dirsToTranslate) {
      await translateToLanguage(sourceContent, language, dir, dirName);
    }

    console.log('\n✓ Translation complete!');
  } catch (error) {
    console.error('Translation failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  const targetLang = process.argv[2];
  translate(targetLang);
}

module.exports = { translate };
