# WidgetLabs Sheets AddOn for Google Sheets

A powerful Google Sheets add-on that integrates multiple AI models (Google Gemini, OpenAI, and Anthropic) directly into your spreadsheets.

<img width="1510" alt="image" src="https://github.com/user-attachments/assets/b78bcd63-c7e7-4f84-b905-99fbabba1245" />


## Features

- **Multiple AI Providers**: Support for Google Gemini, OpenAI, and Anthropic models
- **Simple Functions**: Easy-to-use `AI_CALL()` and `AI_CALL_ADV()` functions
- **Direct API Integration**: No third-party services required - uses your own API keys
- **Flexible Output**: Support for text, list, and matrix outputs
- **User-Friendly Settings**: Simple sidebar for managing API keys and preferences

## Contributing

We welcome contributions! Whether you're fixing bugs, adding features, or improving documentation, your help makes this project better.

📖 **[Read our detailed Contributing Guide](CONTRIBUTING.md)** for:
- Code setup and development environment
- Adding new custom functions and API integrations
- Coding standards and best practices
- Testing guidelines
- How to submit changes

## Quick Start

1. **Install the Add-on**: Deploy this code as a Google Apps Script project
2. **Set Up API Keys**: Go to `WidgetLabs Sheets AddOn > Settings` and add your API keys
3. **Start Using**: Use `=AI_CALL("Your prompt here")` in any cell

## Available Functions

### AI_CALL(prompt, [inputText])
Simple AI function that uses your default model and settings.

```
=AI_CALL("What is machine learning?")
=AI_CALL("Summarize this text:", A1)
=AI_CALL("Translate to Spanish:", "Hello world")
```

### AI_CALL_ADV(prompt, systemPrompt, inputText, temperature, modelName, outputType, overflow)
Advanced AI function with full control over parameters.

```
=AI_CALL_ADV("Explain quantum physics", "You are a physics professor")
=AI_CALL_ADV("List 5 colors", "", "", 0, "", "list", true)
=AI_CALL_ADV("Create a 3x3 table", "", "", 0, "", "matrix", true)
```

## Included Models (Default)
The following models are pre-configured for use with `AI_CALL()` and for ease of use, have been kept limited to the fast flagship models, and one latest model, from the top LLM providers. Advanced users may access any additional models from these providers, with no code changes needed, by using the `AI_CALL_ADV()` function. The WidgetLabs team will keep the default models list updated on a monthly basis.  


### Google Gemini
- `gemini-2.0-flash`
- `gemini-2.5-pro-exp-03-25`

### OpenAI
- `gpt-4o`
- `gpt-4o-mini`
- `o3-mini`

### Anthropic
- `claude-3.7-sonnet`
- `claude-3.5-sonnet`
- `claude-haiku`

## Getting API Keys

1. **Google Gemini**: [Google AI Studio](https://aistudio.google.com/app/apikey)
2. **OpenAI**: [OpenAI Platform](https://platform.openai.com/api-keys)
3. **Anthropic**: [Anthropic Console](https://console.anthropic.com/)

## Installation

There are three ways to use this project in Google Sheets:

### 1. Easiest: Bound Script (Recommended for Most Users)

This method attaches the script directly to a single Google Sheet.

1. Open your target Google Sheet.
2. Go to **Extensions > Apps Script**.
3. Copy all the `.js` files from this repository into the script editor.
4. Copy the `settingsPanel.html` file as well.
5. Save the project.
6. Reload your Google Sheet to access the add-on functions.

*This script will only be available in this specific spreadsheet.*

---

### 2. Reusable: Unbound (Standalone) Script

This method lets you reuse the code in multiple spreadsheets, but requires manual steps for each new sheet.

1. Go to [Google Apps Script](https://script.google.com/) and create a new project.
2. Copy all the `.js` files and `settingsPanel.html` into the project.
3. Save the project.
4. For each new Google Sheet you want to use:
    - Open the sheet, then go to **Extensions > Apps Script**.
    - In the script editor, add your standalone script as a **library** (Project Settings > Libraries, using the Script ID).
    - Use the functions from the library in your sheet.

*Custom functions will only work in a sheet if the code is present (directly or via a library).*

---

### 3. Advanced: Deploy as an Add-on

You can also deploy this project as a Google Sheets Add-on, making it installable from the Google Workspace Marketplace.  
**Note:** This requires extra setup, Google verification, and is not the main focus of this open source project (as of May 2025).

For more information, see [Google's Add-on publishing guide](https://developers.google.com/workspace/marketplace/create-publish-editor-addons).

---

**Tip:**  
For most users, the **bound script** method is the simplest and quickest way to get started!

## File Structure

- `01_config.js` - Configuration and model definitions
- `02_utils.js` - Utility functions
- `03_apiKeyManager.js` - API key management
- `04_apiIntegrations.js` - Direct API integrations
- `05_settingsManager.js` - Settings management
- `06_customFunctions.js` - Custom spreadsheet functions
- `07_widgetlabsMenu.js` - Menu creation
- `08_main.js` - Global function exposure
- `settingsPanel.html` - Settings interface
- `appsscript.json` - Apps Script manifest

## Usage Examples

### Basic Text Generation
```
=AI_CALL("Write a professional email subject line for a meeting request")
```

### Data Analysis
```
=AI_CALL("Analyze this sales data and provide insights:", A1:C10)
```

### Structured Output
```
=AI_CALL_ADV("Create a project timeline", "You are a project manager", "", 0, "", "matrix", true)
```

### Creative Writing
```
=AI_CALL_ADV("Write a short story about space exploration", "You are a creative writer", "", 0.8, "gpt-4o")
```

## Output Types

- **text**: Returns plain text (default)
- **list**: Returns an array that expands vertically
- **matrix**: Returns a 2D array that expands both horizontally and vertically

## Temperature Settings

- **0.0-0.3**: Focused and consistent responses
- **0.4-0.7**: Balanced creativity and consistency
- **0.8-1.0**: Highly creative and varied responses

## Tips for Best Results

1. **Be Specific**: Clear, detailed prompts yield better results
2. **Use Context**: Provide relevant background information
3. **Experiment with Models**: Different models excel at different tasks
4. **Adjust Temperature**: Higher values for creativity, lower for precision
5. **Use Structured Outputs**: Lists and matrices for organized data

## Troubleshooting

### "Error: No API key found"
- Go to `WidgetLabs Sheets AddOn > Settings` and add your API keys
- Make sure you've saved the keys properly

### "Error: Unsupported model"
- Check that the model name is spelled correctly
- Ensure you have an API key for that provider

### Rate Limiting
- Each provider has their own rate limits
- Consider using different models to distribute load

## Security

- API keys are stored securely in Google Apps Script's PropertiesService
- Keys are encrypted and only accessible to your account
- No data is sent to third-party services beyond the LLM providers used in the project (default: Google Gemini, OpenAI, Anthropic)

## Permissions

When you use this script/add-on, it will request the following permissions:

- Access to view and manage your spreadsheets in Google Drive
- Connect to external services (to call AI APIs)
- Store and retrieve user settings and API keys (using Google Apps Script PropertiesService)

These permissions are required for the add-on to function.

## Limitations

- **API Rate Limits:** Each AI provider enforces its own rate limits and quotas.
- **Token/Length Limits:** Prompts and responses are subject to maximum length limits set by each provider.
- **Structured Output:** List/matrix output types depend on the model returning valid structured data; malformed output may cause errors.
- **Custom Functions:** Only work in sheets where the script (or library) is present.
- **API Key Security:** API keys are only as secure as your Google account and Apps Script environment.

## Support & Contributing

### Getting Help
- 🐛 **Bug Reports**: [Open an issue](https://github.com/widgetlabs-ai/gpt4sheets/issues) on GitHub
- 💬 **Questions**: Use [GitHub Discussions](https://github.com/widgetlabs-ai/gpt4sheets/discussions) for general help
- 📖 **Documentation**: Check this README or our [Contributing Guide](CONTRIBUTING.md)
- 🗺️ **Wiki**: Check out the project wiki for additional help topics, usage tips, etc

### Contributing to the Project
We'd love your help! Here's how to get started:

1. **🔍 Check our [Contributing Guide](CONTRIBUTING.md)** - comprehensive documentation for developers
2. **🎯 Pick an issue** - look for ["good first issue"](https://github.com/widgetlabs-ai/gpt4sheets/labels/good%20first%20issue) labels
3. **💻 Set up your environment** - follow the setup instructions in CONTRIBUTING.md
4. **🚀 Submit a pull request** - we'll review and provide feedback

**First time contributing to open source?** No problem! Our [Contributing Guide](CONTRIBUTING.md) walks you through everything step by step.

## License

This project is open source and available under the MIT License.
