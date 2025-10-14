# Translation System

This project uses Google Gemini AI to automatically translate the Front-end Developer Interview Questions into multiple languages.

## Setup

1. **Get a Gemini API Key**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create an API key
   - Copy the API key

2. **Configure the API Key**
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Add your API key to the `.env` file:
     ```
     GEMINI_API_KEY=your_actual_api_key_here
     ```

## Usage

### Translate All Languages

To translate the questions to all supported languages:

```bash
npm run translate:all
```

### Translate to a Specific Language

To translate to a specific language, use the corresponding npm script:

```bash
npm run translate:french
npm run translate:spanish
npm run translate:german
# ... etc
```

Available languages:
- arabic
- bengali
- bulgarian
- burmese
- chinese
- chinese-traditional
- croatian
- czech
- danish
- dutch
- farsi
- french
- german
- greek
- hebrew
- hindi
- hungarian
- indonesian
- italian
- japanese
- korean
- latvian
- polish
- portuguese
- romanian
- russian
- serbian
- slovakian
- slovenian
- spanish
- swedish
- turkish
- ukrainian
- vietnamese

## Automatic Translation

The translation system automatically triggers when:

1. **Changes to Question Files**: When you push changes to files in `src/questions/`, the GitHub Action workflow automatically:
   - Detects the changes
   - Translates all affected content to all supported languages
   - Creates a Pull Request with the translations

2. **Manual Trigger**: You can manually trigger translations from the GitHub Actions tab:
   - Go to the "Actions" tab in GitHub
   - Select "Auto Translate Questions"
   - Click "Run workflow"
   - Optionally specify a single language to translate

## How It Works

### Translation Process

1. **Source Content**: The system reads all question files from `src/questions/`
2. **Combination**: It combines them into a comprehensive README format
3. **Translation**: Using Google Gemini AI, it translates the content while:
   - Preserving markdown formatting
   - Keeping code blocks intact
   - Maintaining document structure
4. **Output**: Writes translated README.md files to `src/translations/{language}/`

### Smart Translation (Future Enhancement)

The current implementation translates the entire document. A future enhancement will include:

- **Word-level changes**: If only a word is changed, translate the containing sentence
- **Sentence-level changes**: If a sentence is changed, translate the whole paragraph
- **Paragraph-level changes**: If a paragraph is changed, translate the entire section

This minimizes API calls and translation costs.

## Configuration

### Language Mapping

Languages are configured in `scripts/language-mapping.json`. Each entry maps a directory name to the full language name used for Gemini translation.

### Translation Scripts

- `scripts/translator.js`: Core Gemini AI translation wrapper
- `scripts/translate.js`: Main translation orchestration script
- `scripts/diff-utils.js`: Utilities for detecting changes (for future smart translation)
- `scripts/language-mapping.json`: Language directory to name mapping

## GitHub Actions

The automated workflow is defined in `.github/workflows/auto-translate.yml` and requires:

- **Repository Secret**: `GEMINI_API_KEY` must be added to GitHub repository secrets
  - Go to repository Settings → Secrets and variables → Actions
  - Add a new secret named `GEMINI_API_KEY`

## Best Practices

1. **Review Translations**: Always review AI-generated translations for accuracy
2. **Context Matters**: Technical terms may need manual adjustment
3. **Batch Updates**: Try to group question changes together to minimize API calls
4. **Rate Limiting**: The system includes automatic delays to avoid rate limiting

## Troubleshooting

### "GEMINI_API_KEY environment variable is required"

Make sure you have:
1. Created a `.env` file
2. Added your Gemini API key to it
3. The key is valid and active

### Translation Fails

- Check your API key is valid
- Ensure you haven't exceeded Gemini API quotas
- Check the error message for specific issues

### GitHub Action Fails

- Verify `GEMINI_API_KEY` is added as a repository secret
- Check the workflow logs for specific errors
- Ensure the repository has permission to create pull requests

## Cost Considerations

Google Gemini API usage may incur costs. To minimize:

1. Use language-specific commands when testing
2. Group related question changes together
3. Review changes before committing to avoid unnecessary re-translations
4. Monitor your API usage in Google AI Studio

## Contributing

When adding a new language:

1. Create the directory in `src/translations/{language-code}/`
2. Add the language to `scripts/language-mapping.json`
3. Add the language to `src/_data/translations.json`
4. Add a corresponding npm script in `package.json`
5. Run the translation for that language
