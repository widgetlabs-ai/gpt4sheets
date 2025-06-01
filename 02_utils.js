/**
 * Utility functions for the Google Sheets Add-on
 */

/**
 * Sets a property in the specified property store
 * @param {string} key The property key
 * @param {string} value The property value
 * @param {string} store The store type ('user' or 'script')
 * @returns {boolean} True if successful, false otherwise
 */
function setProperty(key, value, store = 'user') {
  try {
    if (store === 'user') {
      PropertiesService.getUserProperties().setProperty(key, value);
    } else if (store === 'script') {
      PropertiesService.getScriptProperties().setProperty(key, value);
    } else {
      throw new Error('Invalid store type. Use "user" or "script".');
    }
    return true;
  } catch (error) {
    console.error(`Failed to set property ${key}:`, error);
    return false;
  }
}

/**
 * Gets a property from the specified property store
 * @param {string} key The property key
 * @param {string} store The store type ('user' or 'script')
 * @param {string} defaultValue Default value if property doesn't exist
 * @returns {string} The property value or default value
 */
function getProperty(key, store = 'user', defaultValue = '') {
  try {
    let value;
    if (store === 'user') {
      value = PropertiesService.getUserProperties().getProperty(key);
    } else if (store === 'script') {
      value = PropertiesService.getScriptProperties().getProperty(key);
    } else {
      throw new Error('Invalid store type. Use "user" or "script".');
    }
    return value !== null ? value : defaultValue;
  } catch (error) {
    console.error(`Failed to get property ${key}:`, error);
    return defaultValue;
  }
}

/**
 * Gets the current user's email address
 * @returns {string} The user's email address
 */
function getUserEmail() {
  try {
    return Session.getActiveUser().getEmail();
  } catch (error) {
    console.error('Failed to get user email:', error);
    return 'unknown@example.com';
  }
}

/**
 * Makes an HTTP request with error handling
 * @param {string} url The URL to request
 * @param {Object} options The request options
 * @returns {Object} Response object with success status and data/error
 */
function makeHttpRequest(url, options) {
  try {
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    if (responseCode >= 200 && responseCode < 300) {
      try {
        const data = JSON.parse(responseText);
        return { success: true, data: data };
      } catch (parseError) {
        return { success: true, data: responseText };
      }
    } else {
      return { 
        success: false, 
        error: `HTTP ${responseCode}: ${responseText}`,
        statusCode: responseCode
      };
    }
  } catch (error) {
    return { 
      success: false, 
      error: error.toString() 
    };
  }
}

/**
 * Estimates token count for text (rough approximation)
 * @param {string} text The text to estimate tokens for
 * @param {number} multiplier Multiplier for output tokens
 * @returns {Object} Object with inputTokens and outputTokens estimates
 */
function estimateTokenCounts(text, multiplier = 1.0) {
  const inputTokens = Math.ceil(text.length / 4); // Rough estimate: 4 chars per token
  const outputTokens = Math.ceil(inputTokens * multiplier);
  
  return {
    inputTokens: inputTokens,
    outputTokens: outputTokens
  };
}

/**
 * Parses API response and handles errors
 * @param {Object} response The API response
 * @param {Function} parser Optional custom parser function
 * @returns {string} Parsed response or error message
 */
function parseApiResponse(response, parser = null) {
  try {
    if (!response.success) {
      return `Error: ${response.error || 'Unknown error occurred'}`;
    }
    
    if (parser && typeof parser === 'function') {
      return parser(response.data);
    }
    
    return response.data;
  } catch (error) {
    return `Error parsing response: ${error.message}`;
  }
}

/**
 * Handles errors consistently across the application
 * @param {Error} error The error object
 * @param {string} context Context where the error occurred
 * @returns {string} Formatted error message
 */
function handleError(error, context = '') {
  const errorMessage = error.message || error.toString();
  const fullMessage = context ? `${context}: ${errorMessage}` : errorMessage;
  console.error(fullMessage);
  return `Error: ${errorMessage}`;
}

/**
 * Validates that a string is not empty
 * @param {string} value The value to validate
 * @param {string} fieldName The name of the field for error messages
 * @returns {boolean} True if valid, throws error if invalid
 */
function validateRequired(value, fieldName) {
  if (!value || value.trim() === '') {
    throw new Error(`${fieldName} is required`);
  }
  return true;
}

/**
 * Safely converts a value to string
 * @param {any} value The value to convert
 * @returns {string} String representation of the value
 */
function safeToString(value) {
  if (value === null || value === undefined) {
    return '';
  }
  return value.toString();
}
