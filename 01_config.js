/**
 * Configuration file for API credentials and model settings
 */

// Model configurations
const MODEL_CONFIG = {
  default: "gemini-2.0-flash", // Most versatile, widely supported
  // Recommended/Quick Select: latest, best-in-class models for most use cases
  quickSelect: [
    // Google Gemini
    "gemini-2.0-flash",
    // OpenAI
    "gpt-4.1",
    // Anthropic Claude
    "claude-3-5-sonnet-latest",
    // Perplexity
    "sonar",
    //Deepseek
    "deepseek-v3"
  ],
  // Full, up-to-date list for all providers (text-only)
  all: {
    gemini: [
      "gemini-2.5-flash-preview-05-20",
      "gemini-2.5-pro-preview-05-06",
      "gemini-2.0-flash",
      "gemini-2.0-flash-lite",
      "gemini-2.0-flash-thinking-exp-01-21",
      "gemini-1.5-pro",
      "gemini-1.5-flash",
      "gemini-1.5-flash-8b",
      // Older versions (1.0, ultra, lite, etc.) omitted as deprecated
    ],
    openai: [
      // Flagship, most capable GPT model for complex tasks and general use
      "gpt-4.1", // Flagship GPT-4.1 (complex tasks, high intelligence)
      "gpt-4o", // Fast, intelligent, flexible GPT-4o (general use, strong performance)

      // Reasoning models (o-series)
      "o3", // Most powerful reasoning model (multi-step, logic, coding)
      "o4-mini", // Faster, more affordable reasoning model (good balance of speed/cost)
      "o3-mini", // Small, fast, affordable alternative to o3

      // Cost-optimized models
      "gpt-4.1-mini", // Mini version: balanced for intelligence, speed, and cost
      "gpt-4.1-nano", // Fastest, most cost-effective GPT-4.1 model (smallest footprint)
      "gpt-4o-mini", // Fast, affordable small model for focused tasks
      // Older/legacy variants omitted for clarity
    ],
    anthropic: [
      "claude-opus-4-0",
      "claude-sonnet-4-0",
      "claude-3-5-haiku-latest",
      "claude-3-5-sonnet-latest",
      "claude-3-7-sonnet-latest",
      "claude-3-opus-latest",
      // Older 3.x and instant/v1 models omitted as deprecated
    ],
    perplexity: [
      "sonar",
      "sonar-pro",
      // As of June 2025
    ],
    deepseek: [
      "deepseek-v3",
    ]
  },
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
  anthropic: 'https://api.anthropic.com/v1/messages',
  perplexity: 'https://api.perplexity.ai/chat/completions',
  deepseek: 'https://api.deepseek.com/v1'
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