/**
 * DEBUG: Log all stored API keys to help diagnose provider name mismatches
 */
function logAllStoredApiKeys() {
  const apiKeys = getStoredApiKeys();
  Logger.log('All stored API keys: %s', JSON.stringify(apiKeys));
  return apiKeys;
}
/**
 * API Key Management module
 *
 * Provides functions to store, retrieve, validate, and remove API keys for
 * different AI model providers. All functions are designed for use in Google Apps Script
 * and are referenced throughout the project.
 *
 * @fileoverview API key helpers for open-source WidgetLabs Sheets Add-on
 */

/**
 * Stores API keys for different model providers
 * @param {Object} apiKeys Object containing API keys for different providers
 * @returns {boolean} True if successful, false otherwise
 */
function storeApiKeys(apiKeys) {
  try {
    const propertyStore = getPropertyStore();
    const apiKeysJson = JSON.stringify(apiKeys);
    return setProperty(propertyStore.USER.API_KEYS, apiKeysJson, 'user');
  } catch (error) {
    console.error('Failed to store API keys:', error);
    return false;
  }
}

/**
 * Retrieves stored API keys
 * @returns {Object} Object containing API keys for different providers
 */
function getStoredApiKeys() {
  try {
    const propertyStore = getPropertyStore();
    const apiKeysJson = getProperty(propertyStore.USER.API_KEYS, 'user', '{}');
    return JSON.parse(apiKeysJson);
  } catch (error) {
    console.error('Failed to retrieve API keys:', error);
    return {};
  }
}

/**
 * Gets API key for a specific model provider
 * @param {string} provider The provider name (gemini, openai, anthropic)
 * @returns {string} The API key or empty string if not found
 */
function getApiKey(provider) {
  const apiKeys = getStoredApiKeys();
  return apiKeys[provider] || '';
}

/**
 * Sets API key for a specific model provider
 * @param {string} provider The provider name (gemini, openai, anthropic)
 * @param {string} apiKey The API key to store
 * @returns {boolean} True if successful, false otherwise
 */
function setApiKey(provider, apiKey) {
  try {
    const apiKeys = getStoredApiKeys();
    apiKeys[provider] = apiKey;
    return storeApiKeys(apiKeys);
  } catch (error) {
    console.error(`Failed to set API key for ${provider}:`, error);
    return false;
  }
}

/**
 * Removes API key for a specific model provider
 * @param {string} provider The provider name (gemini, openai, anthropic)
 * @returns {boolean} True if successful, false otherwise
 */
function removeApiKey(provider) {
  try {
    const apiKeys = getStoredApiKeys();
    delete apiKeys[provider];
    return storeApiKeys(apiKeys);
  } catch (error) {
    console.error(`Failed to remove API key for ${provider}:`, error);
    return false;
  }
}

/**
 * Validates that an API key exists for a given model
 * @param {string} modelName The model name to check
 * @returns {Object} Validation result with success status and message
 */
function validateApiKeyForModel(modelName) {
  try {
    const provider = getProviderFromModel(modelName);
    const apiKey = getApiKey(provider);
    
    if (!apiKey) {
      return {
        success: false,
        message: `No API key found for ${provider}. Please set your ${provider} API key in the settings.`
      };
    }
    
    return {
      success: true,
      message: `API key found for ${provider}`
    };
  } catch (error) {
    return {
      success: false,
      message: `Error validating API key: ${error.message}`
    };
  }
}

/**
 * Gets the provider name from a model name
 * @param {string} modelName The model name
 * @returns {string} The provider name
 */
function getProviderFromModel(modelName) {
  const config = getModelConfig();
  
  // Check if the model exists in any provider's model list
  for (const [provider, models] of Object.entries(config.all)) {
    if (models.includes(modelName)) {
      return provider.toLowerCase();
    }
  }
  
  // If we get here, the model wasn't found in any provider's list
  console.error(`Model "${modelName}" not found in MODEL_CONFIG.all. Add it to the appropriate provider's model list.`);
  throw new Error(`Unknown model: "${modelName}". Please add it to MODEL_CONFIG or select a different model.`);
}

/**
 * Gets all available providers that have API keys set
 * @returns {Array} Array of provider names that have API keys
 */
function getAvailableProviders() {
  const apiKeys = getStoredApiKeys();
  return Object.keys(apiKeys).filter(provider => apiKeys[provider] && apiKeys[provider].trim() !== '');
}

/**
 * Checks if any API keys are configured
 * @returns {boolean} True if at least one API key is configured
 */
function hasAnyApiKeys() {
  const providers = getAvailableProviders();
  return providers.length > 0;
}