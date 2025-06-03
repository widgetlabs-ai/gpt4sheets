/**
 * @typedef {Object} ModelGroup
 * @property {string[]} quickSelect - List of models for quick selection.
 * @property {Array<{provider: string, models: string[]}>} all - List of all models grouped by provider.
 */

/**
 * Returns a grouped list of models for all providers: quick select and all models per provider
 * @returns {ModelGroup} The grouped list of models.
 */
function getAllModelsGrouped() {
  const config = getModelConfig();
  const quickSelect = config.available;
  const all = [
    { provider: 'Gemini', models: config.all.gemini },
    { provider: 'OpenAI', models: config.all.openai },
    { provider: 'Anthropic', models: config.all.anthropic }
  ];
  return { quickSelect, all };
}
/**
 * Settings management module for API keys and configuration 
 *
 * Provides functions to manage user settings, API keys, and preferences for the add-on.
 * All functions are designed for use in Google Apps Script and are referenced throughout the project.
 *
 * @fileoverview Settings management helpers for open-source WidgetLabs Sheets Add-on
 */

/**
 * Shows the settings dialog/sidebar
 */
function showSettingsDialog() {
  const html = HtmlService.createHtmlOutputFromFile('settingsPanel')
    .setTitle('AI Settings')
    .setWidth(400)
    .setHeight(600);
  SpreadsheetApp.getUi().showSidebar(html);
}

/**
 * Gets the current user settings including API keys and preferences
 * @returns {Object} Current user settings
 */
function getUserSettings() {
  try {
    const propertyStore = getPropertyStore();
    const apiKeys = getStoredApiKeys();
    const defaultModel = getProperty(propertyStore.USER.DEFAULT_MODEL, 'user', getModelConfig().default);
    const defaultTemperature = getProperty(propertyStore.USER.DEFAULT_TEMPERATURE, 'user', '0');
    
    return {
      apiKeys: apiKeys,
      defaultModel: defaultModel,
      defaultTemperature: parseFloat(defaultTemperature),
      availableModels: getModelConfig().available
    };
  } catch (error) {
    console.error('Failed to get user settings:', error);
    return {
      apiKeys: {},
      defaultModel: getModelConfig().default,
      defaultTemperature: 0,
      availableModels: getModelConfig().available
    };
  }
}

/**
 * Saves user settings including API keys and preferences
 * @param {Object} settings The settings to save
 * @returns {Object} Result with success status and message
 */
function saveUserSettings(settings) {
  try {
    const propertyStore = getPropertyStore();
    
    // Save API keys if provided
    if (settings.apiKeys) {
      const success = storeApiKeys(settings.apiKeys);
      if (!success) {
        return { success: false, message: 'Failed to save API keys' };
      }
    }
    
    // Save default model if provided
    if (settings.defaultModel) {
      const success = setProperty(propertyStore.USER.DEFAULT_MODEL, settings.defaultModel, 'user');
      if (!success) {
        return { success: false, message: 'Failed to save default model' };
      }
    }
    
    // Save default temperature if provided
    if (settings.defaultTemperature !== undefined) {
      const success = setProperty(propertyStore.USER.DEFAULT_TEMPERATURE, settings.defaultTemperature.toString(), 'user');
      if (!success) {
        return { success: false, message: 'Failed to save default temperature' };
      }
    }
    
    return { success: true, message: 'Settings saved successfully' };
  } catch (error) {
    console.error('Failed to save user settings:', error);
    return { success: false, message: `Error saving settings: ${error.message}` };
  }
}

/**
 * Sets an API key for a specific provider
 * @param {string} provider The provider name (gemini, openai, anthropic)
 * @param {string} apiKey The API key to set
 * @returns {Object} Result with success status and message
 */
function setProviderApiKey(provider, apiKey) {
  try {
    const success = setApiKey(provider, apiKey);
    if (success) {
      return { success: true, message: `${provider} API key saved successfully` };
    } else {
      return { success: false, message: `Failed to save ${provider} API key` };
    }
  } catch (error) {
    console.error(`Failed to set ${provider} API key:`, error);
    return { success: false, message: `Error setting ${provider} API key: ${error.message}` };
  }
}

/**
 * Removes an API key for a specific provider
 * @param {string} provider The provider name (gemini, openai, anthropic)
 * @returns {Object} Result with success status and message
 */
function removeProviderApiKey(provider) {
  try {
    const success = removeApiKey(provider);
    if (success) {
      return { success: true, message: `${provider} API key removed successfully` };
    } else {
      return { success: false, message: `Failed to remove ${provider} API key` };
    }
  } catch (error) {
    console.error(`Failed to remove ${provider} API key:`, error);
    return { success: false, message: `Error removing ${provider} API key: ${error.message}` };
  }
}

/**
 * Sets the default model for AI calls
 * @param {string} modelName The model name to set as default
 * @returns {Object} Result with success status and message
 */
function setDefaultModel(modelName) {
  try {
    const propertyStore = getPropertyStore();
    const config = getModelConfig();
    // Flatten all models from all providers into a single array
    const allModels = [
      ...config.all.gemini,
      ...config.all.openai,
      ...config.all.anthropic
    ];

    // Debug logging
    Logger.log('setDefaultModel called with: %s', modelName);
    Logger.log('All models: %s', JSON.stringify(allModels));

    if (!allModels.includes(modelName)) {
      return { success: false, message: `Invalid model: ${modelName}` };
    }
    
    const success = setProperty(propertyStore.USER.DEFAULT_MODEL, modelName, 'user');
    if (success) {
      return { success: true, message: `Default model set to ${modelName}` };
    } else {
      return { success: false, message: 'Failed to save default model' };
    }
  } catch (error) {
    console.error('Failed to set default model:', error);
    return { success: false, message: `Error setting default model: ${error.message}` };
  }
}

/**
 * Sets the default temperature for AI calls
 * @param {number} temperature The temperature value (0-1)
 * @returns {Object} Result with success status and message
 */
function setDefaultTemperature(temperature) {
  try {
    const temp = parseFloat(temperature);
    if (isNaN(temp) || temp < 0 || temp > 1) {
      return { success: false, message: 'Temperature must be a number between 0 and 1' };
    }
    
    const propertyStore = getPropertyStore();
    const success = setProperty(propertyStore.USER.DEFAULT_TEMPERATURE, temp.toString(), 'user');
    if (success) {
      return { success: true, message: `Default temperature set to ${temp}` };
    } else {
      return { success: false, message: 'Failed to save default temperature' };
    }
  } catch (error) {
    console.error('Failed to set default temperature:', error);
    return { success: false, message: `Error setting default temperature: ${error.message}` };
  }
}

/**
 * Tests an API key by making a simple API call
 * @param {string} provider The provider name (gemini, openai, anthropic)
 * @param {string} apiKey The API key to test
 * @returns {Object} Result with success status and message
 */
function testApiKey(provider, apiKey) {
  try {
    // Temporarily store the API key for testing
    const originalKey = getApiKey(provider);
    setApiKey(provider, apiKey);
    
    // Get a model for this provider
    const modelConfig = getModelConfig();
    const testModel = modelConfig.available.find(model => getProviderFromModel(model) === provider);
    
    if (!testModel) {
      return { success: false, message: `No available models for provider: ${provider}` };
    }
    
    // Make a simple test call
    let result;
    if (provider === 'gemini') {
      result = callGeminiAPI("You are a helpful assistant", "Say 'Hello'", "", 0, testModel, "text");
    } else if (provider === 'openai') {
      result = callOpenAIAPI("You are a helpful assistant", "Say 'Hello'", "", 0, testModel, "text");
    } else if (provider === 'anthropic') {
      result = callAnthropicAPI("You are a helpful assistant", "Say 'Hello'", "", 0, testModel, "text");
    } else {
      return { success: false, message: `Unknown provider: ${provider}` };
    }
    
    // Restore original key if test failed
    if (result.startsWith('Error:')) {
      setApiKey(provider, originalKey);
      return { success: false, message: `API key test failed: ${result}` };
    }
    
    return { success: true, message: `${provider} API key is valid` };
  } catch (error) {
    console.error(`Failed to test ${provider} API key:`, error);
    return { success: false, message: `Error testing API key: ${error.message}` };
  }
}

/**
 * Gets the status of all configured API keys
 * @returns {Object} Status information for all providers
 */
function getApiKeyStatus() {
  try {
    const apiKeys = getStoredApiKeys();
    const status = {};
    
    ['gemini', 'openai', 'anthropic'].forEach(provider => {
      status[provider] = {
        configured: !!(apiKeys[provider] && apiKeys[provider].trim() !== ''),
        keyPreview: apiKeys[provider] ? `${apiKeys[provider].substring(0, 8)}...` : 'Not set'
      };
    });
    
    return status;
  } catch (error) {
    console.error('Failed to get API key status:', error);
    return {};
  }
}