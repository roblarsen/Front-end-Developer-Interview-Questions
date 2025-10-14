# Quick Start Guide: Automated Translation System

## Overview

This project now includes automated translation powered by Google Gemini AI. Translations are automatically updated when questions change, or can be triggered manually.

## For Repository Maintainers

### Initial Setup (One-Time)

1. **Get API Key**:
   ```bash
   # Visit https://makersuite.google.com/app/apikey
   # Create and copy your Gemini API key
   ```

2. **Add GitHub Secret**:
   - Go to: Repository Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `GEMINI_API_KEY`
   - Value: Your Gemini API key
   - Click "Add secret"

3. **Done!** The system is now active.

### How It Works

#### Automatic Translation (Recommended)

When you edit files in `src/questions/`:

1. Commit and push your changes
2. GitHub Actions automatically:
   - Detects which lines changed
   - Extracts context around changes
   - Translates only the changed content
   - Creates a PR with updates
3. Review and merge the translation PR

#### Manual Translation

**Translate all languages (full translation):**
```bash
npm run translate:all
```

**Translate one language:**
```bash
npm run translate:french
```

**Incremental translation (only changed content):**
```bash
npm run translate
```

## For Contributors

No setup needed! Translations happen automatically via GitHub Actions when questions are updated.

## Testing the System

Run validation tests:
```bash
npm run test:translation
```

Expected output:
```
✓ All translation scripts exist
✓ Language mapping is valid JSON and contains all expected languages
✓ Package.json contains translation scripts
... (10 tests total)
```

## Local Development (Optional)

If you want to test translations locally:

1. **Setup environment**:
   ```bash
   cp .env.example .env
   # Edit .env and add your GEMINI_API_KEY
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Test translation**:
   ```bash
   # Translate to French (as a test)
   npm run translate:french
   ```

## Supported Languages

34 languages are currently supported:

- Arabic, Bengali, Bulgarian, Burmese
- Chinese (Simplified & Traditional)
- Croatian, Czech, Danish, Dutch
- Farsi, French, German, Greek
- Hebrew, Hindi, Hungarian, Indonesian
- Italian, Japanese, Korean, Latvian
- Polish, Portuguese, Romanian, Russian
- Serbian, Slovak, Slovenian, Spanish
- Swedish, Turkish, Ukrainian, Vietnamese

## Cost Optimization

The system minimizes API costs by:

- ✅ Using incremental translation (default for auto-trigger)
- ✅ Translating only changed sentences/paragraphs
- ✅ Built-in rate limiting (500ms delays)
- ✅ Smart context extraction

**Full translation** is only used for:
- Manual triggers (`npm run translate:all`)
- New language additions
- Major restructuring

## Troubleshooting

### "GEMINI_API_KEY environment variable is required"

**Solution**: Add the API key to GitHub Secrets (for Actions) or `.env` file (for local development)

### GitHub Action fails

**Check**:
1. Is `GEMINI_API_KEY` added to repository secrets?
2. Is the API key valid and active?
3. Check workflow logs for specific errors

### Translation quality issues

**Remember**:
- AI translations should be reviewed
- Technical terms may need adjustment
- Context matters for accuracy
- Manual review recommended before merging

## Files Reference

```
.env.example                           # Environment variable template
.github/workflows/auto-translate.yml   # GitHub Actions workflow
TRANSLATION.md                         # Detailed documentation
scripts/
  ├── translator.js                    # Gemini AI wrapper
  ├── translate.js                     # Full translation script
  ├── incremental-translate.js         # Incremental translation
  ├── diff-utils.js                    # Change detection utilities
  ├── language-mapping.json            # Language configuration
  └── test-translation-system.js       # Validation tests
```

## Learn More

- Full documentation: [TRANSLATION.md](TRANSLATION.md)
- Google Gemini API: https://ai.google.dev/
- Contribute: [CONTRIBUTING.md](.github/CONTRIBUTING.md)

---

**Questions?** Open an issue or check the [TRANSLATION.md](TRANSLATION.md) documentation.
