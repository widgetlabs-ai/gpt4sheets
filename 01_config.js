/**
 * Configuration file for API credentials and model settings
 */

// Model configurations
const MODEL_CONFIG = {
  default: 'gemini-2.0-flash',
  available: [
    'gemini-2.0-flash', 
    'gemini-2.5-pro-exp-03-25', 
    'gpt-4o', 
    'gpt-4o-mini', 
    'o3-mini', 
    'claude-3.7-sonnet',
    'claude-3.5-sonnet',
    'claude-haiku'
  ]
};

// Property store keys for user settings
const PROPERTY_STORE = {
  USER: {
    API_KEYS: 'api-keys',
    DEFAULT_MODEL: 'default-model',
    DEFAULT_TEMPERATURE: 'default-temperature'
  }
};

// API endpoints for different model providers
const API_ENDPOINTS = {
  gemini: 'https://generativelanguage.googleapis.com/v1beta/models',
  openai: 'https://api.openai.com/v1/chat/completions',
  anthropic: 'https://api.anthropic.com/v1/messages'
};

// Function to get model configuration
function getModelConfig() {
  return MODEL_CONFIG;
}

// Function to get property store keys
function getPropertyStore() {
  return PROPERTY_STORE;
}

// Function to get API endpoints
function getApiEndpoints() {
  return API_ENDPOINTS;
} 