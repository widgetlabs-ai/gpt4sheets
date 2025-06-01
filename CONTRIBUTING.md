# Contributing to WidgetLabs Sheets AddOn

Thank you for your interest in contributing to the WidgetLabs Sheets AddOn! This guide will help you understand the codebase structure, coding conventions, and how to add new features.

## Table of Contents

- [Project Structure](#project-structure)
- [Code Setup](#code-setup)
- [Adding New Custom Functions](#adding-new-custom-functions)
- [API Integration and URLFetch](#api-integration-and-urlfetch)
- [File Organization](#file-organization)
- [Coding Hygiene and Standards](#coding-hygiene-and-standards)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)

## Project Structure

This Google Apps Script project follows a modular, numbered file structure for clear organization:

```
├── 01_config.js          # Configuration constants and model definitions
├── 02_utils.js           # Common utility functions and helpers
├── 03_apiKeyManager.js   # API key storage and validation
├── 04_apiIntegrations.js # Direct API integrations (Gemini, OpenAI, Anthropic)
├── 05_settingsManager.js # Settings management and UI helpers
├── 06_customFunctions.js # Custom spreadsheet functions (AI_CALL, AI_CALL_ADV)
├── 07_widgetlabsMenu.js  # Google Sheets menu creation and handlers
├── settingsPanel.html    # Settings UI interface
├── appsscript.json       # Apps Script project configuration
└── .clasp.json          # Google clasp configuration (deployment)
```

### Numbering System

Files are numbered to indicate dependency order and logical flow:
- **01-03**: Core infrastructure (config, utils, key management)
- **04**: External API integrations 
- **05-07**: User interface and spreadsheet integration
- **HTML files**: UI components

## Code Setup

### Prerequisites

1. **Google Apps Script Environment**: This project runs in Google Apps Script (GAS)
2. **Google Account**: Required for accessing Google Sheets and Apps Script
3. **API Keys**: For AI providers (Gemini, OpenAI, Anthropic)

### Development Environment

1. **Option 1: Web Editor** (Recommended for beginners)
   - Go to [script.google.com](https://script.google.com)
   - Create new project
   - Copy files from this repository

2. **Option 2: Local Development with clasp**
   ```bash
   npm install -g @google/clasp
   clasp login
   clasp clone <your-script-id> / git clone
   ```

### Dependencies

The project uses built-in Google Apps Script services:
- `PropertiesService` - For storing user settings and API keys
- `UrlFetchApp` - For making HTTP requests to external APIs
- `SpreadsheetApp` - For Google Sheets integration
- `HtmlService` - For settings UI

No external npm packages are required.

## Adding New Custom Functions

Custom functions are spreadsheet functions that users can call directly from cells (e.g., `=AI_CALL("prompt")`).

### Step 1: Add Function to `06_customFunctions.js`

```javascript
/**
 * Your new custom function description
 * 
 * @param {string} param1 Description of first parameter
 * @param {string} param2 Description of second parameter (optional)
 * @return {string} Description of return value
 * 
 * @customfunction
 *
 * @example
 *   =MY_NEW_FUNCTION("input", "option")
 */
function MY_NEW_FUNCTION(param1, param2 = "") {
  try {
    // Validate inputs
    if (!param1 || param1.trim() === '') {
      return "Error: Please provide required parameter";
    }

    // Your function logic here
    const result = processMyFunction(param1, param2);
    
    return result;
  } catch (error) {
    return "Error: " + error.message;
  }
}
```

### Step 2: Add Helper Functions

If your function needs helper logic, add it to the appropriate file:
- **Utility functions**: `02_utils.js`
- **API calls**: `04_apiIntegrations.js` 
- **Configuration**: `01_config.js`

### Step 3: Update Documentation

Add your function to the README.md with usage examples.

### Custom Function Best Practices

1. **Always include `@customfunction` JSDoc tag**
2. **Use try-catch for error handling**
3. **Return user-friendly error messages**
4. **Validate all inputs**
5. **Keep functions focused and single-purpose**
6. **Use meaningful parameter names**

## API Integration and URLFetch

### Making HTTP Requests

Use the standardized `makeHttpRequest` utility function from `02_utils.js`:

```javascript
// Example: Call any external API
function callCustomAPI(apiKey, data) {
  try {
    const endpoint = 'https://api.example.com/v1/endpoint';
    
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        // Add any custom headers
        'X-Custom-Header': 'value'
      },
      payload: JSON.stringify(data)
    };

    const response = makeHttpRequest(endpoint, requestOptions);

    if (!response.success) {
      return `Error: ${response.error}`;
    }

    // Process successful response
    return response.data;

  } catch (error) {
    return handleError(error, 'Custom API');
  }
}
```

### URLFetch Patterns

The project follows these patterns for API calls:

#### 1. Basic GET Request
```javascript
const requestOptions = {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${apiKey}`
  }
};
```

#### 2. POST with JSON Payload
```javascript
const requestOptions = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  },
  payload: JSON.stringify(dataObject)
};
```

#### 3. Handling Different Response Types
```javascript
// JSON response (most common)
const response = makeHttpRequest(url, options);
if (response.success) {
  const jsonData = response.data; // Already parsed
}

// Text response
const response = UrlFetchApp.fetch(url, options);
const textContent = response.getContentText();

// Binary response
const response = UrlFetchApp.fetch(url, options);
const binaryContent = response.getBlob();
```

### Adding New API Integrations

1. **Add configuration to `01_config.js`**:
```javascript
const API_ENDPOINTS = {
  // existing endpoints...
  myapi: 'https://api.myservice.com/v1'
};
```

2. **Create integration function in `04_apiIntegrations.js`**:
```javascript
/**
 * Calls My Custom API
 * @param {string} prompt User input
 * @param {Object} options API options
 * @returns {string} API response
 */
function callMyCustomAPI(prompt, options = {}) {
  // Implementation following existing patterns
}
```

3. **Add API key management in `03_apiKeyManager.js`** if needed

4. **Update settings UI** in `settingsPanel.html` if user configuration is required

## File Organization

### Where to Put Different Types of Code

| Code Type | File Location | Example |
|-----------|---------------|---------|
| Configuration constants | `01_config.js` | Model lists, API endpoints |
| Utility functions | `02_utils.js` | HTTP helpers, validation |
| API key management | `03_apiKeyManager.js` | Store/retrieve credentials |
| External API calls | `04_apiIntegrations.js` | URLFetch implementations |
| Settings management | `05_settingsManager.js` | User preferences |
| Custom functions | `06_customFunctions.js` | Spreadsheet functions |
| Menu/UI handlers | `07_widgetlabsMenu.js` | Google Sheets menu |
| HTML interfaces | `*.html` | Settings panels, dialogs |

### Function Naming Conventions

- **Custom functions**: `UPPER_CASE` (e.g., `AI_CALL`, `MY_FUNCTION`)
- **API functions**: `callProviderAPI` (e.g., `callGeminiAPI`, `callOpenAIAPI`)
- **Utility functions**: `camelCase` (e.g., `makeHttpRequest`, `handleError`)
- **Config getters**: `getConfigName` (e.g., `getModelConfig`, `getApiEndpoints`)

## Coding Hygiene and Standards

### 1. Documentation Standards

**All functions must include JSDoc comments:**

```javascript
/**
 * Brief description of what the function does
 * 
 * @param {string} paramName Description of parameter
 * @param {number} [optionalParam=defaultValue] Optional parameter description
 * @returns {Object} Description of return value
 * 
 * @example
 *   functionName("example", 42)
 */
```

**File headers should include:**
```javascript
/**
 * Brief description of file purpose
 *
 * Longer description of what this file contains and its role in the project.
 * All functions are designed for use in Google Apps Script and are referenced
 * throughout the project.
 *
 * @fileoverview Brief file description for open-source WidgetLabs Sheets Add-on
 */
```

### 2. Error Handling

**Always use consistent error handling:**

```javascript
function myFunction(input) {
  try {
    // Validate inputs first
    if (!input || input.trim() === '') {
      return "Error: Input is required";
    }
    
    // Main logic here
    const result = processInput(input);
    
    return result;
  } catch (error) {
    return handleError(error, 'MyFunction');
  }
}
```

### 3. Code Style

- **Indentation**: 2 spaces
- **Semicolons**: Always use semicolons
- **Constants**: `UPPER_SNAKE_CASE`
- **Variables**: `camelCase`
- **CustomFunctions**: `UPPERCASE`
- **Line length**: Maximum 100 characters

### 4. Input Validation

Always validate user inputs:

```javascript
// Required string validation
if (!prompt || prompt.trim() === '') {
  return "Error: Prompt is required";
}

// Number validation
const temp = parseFloat(temperature);
if (isNaN(temp) || temp < 0 || temp > 1) {
  return "Error: Temperature must be between 0 and 1";
}

// Array validation
const validTypes = ["text", "list", "matrix"];
if (!validTypes.includes(outputType)) {
  return "Error: Invalid output type";
}
```

### 5. Configuration Management

- Store all constants in `01_config.js`
- Use getter functions to access configuration
- Never hardcode API endpoints or model names in functions

### 6. API Response Handling

Follow the standard pattern:

```javascript
const response = makeHttpRequest(endpoint, requestOptions);

if (!response.success) {
  return `Error: ${response.error}`;
}

// Validate response structure
if (!response.data || !response.data.expectedField) {
  return "Error: Invalid response format";
}

return response.data.expectedField;
```

## Testing

### Manual Testing in Google Sheets

1. **Deploy your changes** to a test Google Sheet
2. **Test custom functions** by typing them in cells:
   ```
   =AI_CALL("test prompt")
   =MY_NEW_FUNCTION("test input")
   ```
3. **Test error cases** with invalid inputs
4. **Check the Apps Script logs** (Extensions > Apps Script > Executions)

### Validation Checklist

Before submitting changes:

- [ ] All functions have proper JSDoc documentation
- [ ] Error handling is implemented consistently
- [ ] Input validation is thorough
- [ ] Custom functions work in Google Sheets
- [ ] No hardcoded values (use config)
- [ ] Code follows style guidelines
- [ ] API calls use `makeHttpRequest` utility
- [ ] Changes are backwards compatible

## Submitting Changes

### Before You Submit

1. **Test thoroughly** in a Google Sheets environment
2. **Check all existing functions** still work
3. **Update documentation** (README.md, JSDoc)
4. **Follow the coding standards** outlined above

### Pull Request Guidelines

1. **Clear title and description** of what the PR does
2. **Reference any issues** being addressed
3. **Include examples** of new functionality
4. **Update tests** if applicable
5. **Add yourself to contributors** if this is your first contribution

### Commit Message Format

```
type: brief description

Longer description if needed, explaining:
- What changed
- Why it changed
- Any breaking changes
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`

## Questions?

- **Issues**: Open a GitHub issue for bugs or feature requests.
- **Discussions**: Use GitHub discussions for questions
- **Documentation**: Check the README.md first

Thank you for contributing to WidgetLabs Sheets AddOn! 🚀 