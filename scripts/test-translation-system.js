#!/usr/bin/env node

/**
 * Simple validation tests for the translation system
 * These tests validate structure and configuration without requiring API keys
 */

const fs = require('fs');
const path = require('path');

let testsPassed = 0;
let testsFailed = 0;

function test(description, fn) {
  try {
    fn();
    console.log(`✓ ${description}`);
    testsPassed++;
  } catch (error) {
    console.error(`✗ ${description}`);
    console.error(`  Error: ${error.message}`);
    testsFailed++;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

console.log('Running translation system tests...\n');

// Test 1: Check all required files exist
test('All translation scripts exist', () => {
  const requiredFiles = [
    'scripts/translator.js',
    'scripts/translate.js',
    'scripts/incremental-translate.js',
    'scripts/diff-utils.js',
    'scripts/language-mapping.json'
  ];

  for (const file of requiredFiles) {
    const filePath = path.join(__dirname, '..', file);
    assert(fs.existsSync(filePath), `Missing file: ${file}`);
  }
});

// Test 2: Validate language mapping
test('Language mapping is valid JSON and contains all expected languages', () => {
  const mappingPath = path.join(__dirname, '..', 'scripts', 'language-mapping.json');
  const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf-8'));
  
  assert(typeof mapping === 'object', 'Language mapping should be an object');
  assert(Object.keys(mapping).length > 0, 'Language mapping should not be empty');
  
  // Check some key languages exist
  const requiredLanguages = ['french', 'spanish', 'german', 'chinese', 'japanese'];
  for (const lang of requiredLanguages) {
    assert(mapping[lang], `Missing language: ${lang}`);
  }
});

// Test 3: Check package.json has translation scripts
test('Package.json contains translation scripts', () => {
  const packagePath = path.join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
  
  assert(packageJson.scripts['translate:all'], 'Missing translate:all script');
  assert(packageJson.scripts['translate'], 'Missing translate script');
  assert(packageJson.scripts['translate:french'], 'Missing translate:french script');
  assert(packageJson.scripts['translate:spanish'], 'Missing translate:spanish script');
});

// Test 4: Check GitHub Actions workflow exists
test('GitHub Actions workflow exists and is valid', () => {
  const workflowPath = path.join(__dirname, '..', '.github', 'workflows', 'auto-translate.yml');
  assert(fs.existsSync(workflowPath), 'Workflow file missing');
  
  const content = fs.readFileSync(workflowPath, 'utf-8');
  assert(content.includes('GEMINI_API_KEY'), 'Workflow should reference GEMINI_API_KEY');
  assert(content.includes('src/questions/'), 'Workflow should watch src/questions/');
});

// Test 5: Validate .env.example exists
test('.env.example file exists with GEMINI_API_KEY', () => {
  const envExamplePath = path.join(__dirname, '..', '.env.example');
  assert(fs.existsSync(envExamplePath), '.env.example file missing');
  
  const content = fs.readFileSync(envExamplePath, 'utf-8');
  assert(content.includes('GEMINI_API_KEY'), '.env.example should include GEMINI_API_KEY');
});

// Test 6: Check .gitignore includes .env
test('.gitignore includes .env', () => {
  const gitignorePath = path.join(__dirname, '..', '.gitignore');
  const content = fs.readFileSync(gitignorePath, 'utf-8');
  assert(content.includes('.env'), '.gitignore should include .env');
});

// Test 7: Verify all translation directories exist
test('All translation directories exist', () => {
  const translationsDir = path.join(__dirname, '..', 'src', 'translations');
  const languageMapping = require('./language-mapping.json');
  
  for (const dirName of Object.keys(languageMapping)) {
    const dirPath = path.join(translationsDir, dirName);
    assert(fs.existsSync(dirPath), `Missing translation directory: ${dirName}`);
  }
});

// Test 8: Check documentation exists
test('Translation documentation exists', () => {
  const docPath = path.join(__dirname, '..', 'TRANSLATION.md');
  assert(fs.existsSync(docPath), 'TRANSLATION.md missing');
  
  const content = fs.readFileSync(docPath, 'utf-8');
  assert(content.includes('Google Gemini'), 'Documentation should mention Google Gemini');
  assert(content.includes('npm run translate'), 'Documentation should include usage instructions');
});

// Test 9: Validate scripts can be required without errors (syntax check)
test('Translation scripts have valid syntax', () => {
  // This will throw if there are syntax errors
  require('./translator.js');
  require('./diff-utils.js');
  require('./translate.js');
  require('./incremental-translate.js');
});

// Test 10: Check devDependencies include required packages
test('Package.json includes required dependencies', () => {
  const packagePath = path.join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
  
  assert(packageJson.devDependencies['@google/generative-ai'], 'Missing @google/generative-ai dependency');
  assert(packageJson.devDependencies['dotenv'], 'Missing dotenv dependency');
});

// Summary
console.log('\n' + '='.repeat(50));
console.log(`Tests completed: ${testsPassed + testsFailed}`);
console.log(`✓ Passed: ${testsPassed}`);
console.log(`✗ Failed: ${testsFailed}`);
console.log('='.repeat(50));

if (testsFailed > 0) {
  process.exit(1);
}
