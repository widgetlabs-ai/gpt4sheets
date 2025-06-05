/**
 * Direct API Integrations for AI model providers 
 * 
 * Provides functions to call Gemini, OpenAI, Anthropic, and Perplexity APIs directly.
 * All functions are designed for use in Google Apps Script and are referenced
 * throughout the project.
 *
 * @fileoverview API integration helpers for open-source WidgetLabs Sheets Add-on
 */

/**
 * Calls the Gemini API directly.
 *
 * @param {string} systemPrompt - The system prompt to set context.
 * @param {string} prompt - The user prompt.
 * @param {string} inputText - Additional input text.
 * @param {number} temperature - The temperature parameter (0-1).
 * @param {string} [modelName=null] - The specific Gemini model to use.
 * @param {string} [outputType="text"] - The output type ("text", "list", "matrix").
 * @returns {string|Array} The API response.
 */
function callGeminiAPI(systemPrompt, prompt, inputText, temperature, modelName = null, outputType = "text") {
  try {
    // Validate API key
    const selectedModel = modelName || getModelConfig().default;
    const validation = validateApiKeyForModel(selectedModel);
    if (!validation.success) {
      return validation.message;
    }

    // Get API key
    const provider = getProviderFromModel(selectedModel);
    const apiKey = getApiKey(provider);

    // Prepare the input data
    const fullPrompt = systemPrompt + "\n\n" + prompt + (inputText ? "\n\n" + inputText : "");
    
    const data = {
      contents: [{
        parts: [{
          text: fullPrompt
        }]
      }],
      generationConfig: {
        temperature: parseFloat(temperature || 0)
      }
    };

    // Add response schema for structured outputs
    if (outputType === "list" || outputType === "matrix") {
      data.generationConfig.response_mime_type = "application/json";
      
      if (outputType === "list") {
        data.generationConfig.response_schema = {
          "type": "ARRAY",
          "items": {
            "type": "STRING"
          }
        };
      } else if (outputType === "matrix") {
        data.generationConfig.response_schema = {
          "type": "ARRAY",
          "items": {
            "type": "ARRAY",
            "items": {
              "type": "STRING"
            }
          }
        };
      }
    }

    // Make API request
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`;
    
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify(data)
    };

    const response = makeHttpRequest(endpoint, requestOptions);

    if (!response.success) {
      return `Error: ${response.error}`;
    }

    // Process response
    const responseData = response.data;
    
    if (responseData.error) {
      return `Error: ${JSON.stringify(responseData.error)}`;
    }

    if (!responseData.candidates || responseData.candidates.length === 0) {
      return "Error: No response generated";
    }

    const content = responseData.candidates[0].content;
    if (!content || !content.parts || content.parts.length === 0) {
      return "Error: Invalid response format";
    }

    const text = content.parts[0].text;

    // Handle structured outputs
    if (outputType === "list" || outputType === "matrix") {
      try {
        return JSON.parse(text);
      } catch (parseError) {
        return `Error parsing structured response: ${parseError.message}`;
      }
    }

    return text;

  } catch (error) {
    return handleError(error, 'Gemini API');
  }
}

/**
 * Calls the OpenAI API directly.
 *
 * @param {string} systemPrompt - The system prompt to set context.
 * @param {string} prompt - The user prompt.
 * @param {string} inputText - Additional input text.
 * @param {number} temperature - The temperature parameter (0-1).
 * @param {string} modelName - The specific OpenAI model to use.
 * @param {string} [outputType="text"] - The output type ("text", "list", "matrix").
 * @returns {string|Array} The API response.
 */
function callOpenAIAPI(systemPrompt, prompt, inputText, temperature, modelName, outputType = "text") {
  try {
    // Validate API key
    const validation = validateApiKeyForModel(modelName);
    if (!validation.success) {
      return validation.message;
    }

    // Get API key
    const provider = getProviderFromModel(modelName);
    const apiKey = getApiKey(provider);

    // Prepare messages
    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt + (inputText ? "\n\n" + inputText : "") }
    ];

    const data = {
      model: modelName,
      messages: messages,
      temperature: parseFloat(temperature || 0)
    };

    // Add response format for structured outputs
    if (outputType === "list" || outputType === "matrix") {
      data.response_format = { type: "json_object" };
      
      // Add instruction for structured output
      const structureInstruction = outputType === "list" 
        ? "Please respond with a JSON array of strings."
        : "Please respond with a JSON array of arrays (matrix format).";
      
      messages[messages.length - 1].content += "\n\n" + structureInstruction;
    }

    // Make API request
    const endpoint = 'https://api.openai.com/v1/chat/completions';
    
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      payload: JSON.stringify(data)
    };

    const response = makeHttpRequest(endpoint, requestOptions);

    if (!response.success) {
      return `Error: ${response.error}`;
    }

    // Process response
    const responseData = response.data;
    
    if (responseData.error) {
      return `Error: ${responseData.error.message}`;
    }

    if (!responseData.choices || responseData.choices.length === 0) {
      return "Error: No response generated";
    }

    const content = responseData.choices[0].message.content;

    // Handle structured outputs
    if (outputType === "list" || outputType === "matrix") {
      try {
        return JSON.parse(content);
      } catch (parseError) {
        return `Error parsing structured response: ${parseError.message}`;
      }
    }

    return content;

  } catch (error) {
    return handleError(error, 'OpenAI API');
  }
}

/**
 * Calls the Anthropic API directly.
 *
 * @param {string} systemPrompt - The system prompt to set context.
 * @param {string} prompt - The user prompt.
 * @param {string} inputText - Additional input text.
 * @param {number} temperature - The temperature parameter (0-1).
 * @param {string} modelName - The specific Anthropic model to use.
 * @param {string} [outputType="text"] - The output type ("text", "list", "matrix").
 * @returns {string|Array} The API response.
 */
function callAnthropicAPI(systemPrompt, prompt, inputText, temperature, modelName, outputType = "text") {
  try {
    // Validate API key
    const validation = validateApiKeyForModel(modelName);
    if (!validation.success) {
      return validation.message;
    }

    // Get API key
    const provider = getProviderFromModel(modelName);
    const apiKey = getApiKey(provider);

    // Prepare user message
    let userMessage = prompt + (inputText ? "\n\n" + inputText : "");

    // Add instruction for structured outputs
    if (outputType === "list") {
      userMessage += "\n\nPlease respond with a JSON array of strings.";
    } else if (outputType === "matrix") {
      userMessage += "\n\nPlease respond with a JSON array of arrays (matrix format).";
    }

    const data = {
      model: modelName,
      max_tokens: 4096,
      temperature: parseFloat(temperature || 0),
      system: systemPrompt,
      messages: [
        { role: "user", content: userMessage }
      ]
    };

    // Make API request
    const endpoint = 'https://api.anthropic.com/v1/messages';
    
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      payload: JSON.stringify(data)
    };

    const response = makeHttpRequest(endpoint, requestOptions);

    if (!response.success) {
      return `Error: ${response.error}`;
    }

    // Process response
    const responseData = response.data;
    
    if (responseData.error) {
      return `Error: ${responseData.error.message}`;
    }

    if (!responseData.content || responseData.content.length === 0) {
      return "Error: No response generated";
    }

    const content = responseData.content[0].text;

    // Handle structured outputs
    if (outputType === "list" || outputType === "matrix") {
      try {
        return JSON.parse(content);
      } catch (parseError) {
        return `Error parsing structured response: ${parseError.message}`;
      }
    }

    return content;

  } catch (error) {
    return handleError(error, 'Anthropic API');
  }
}

/**
 * Calls the Perplexity API directly.
 *
 * @param {string} systemPrompt - The system prompt to set context.
 * @param {string} prompt - The user prompt.
 * @param {string} inputText - Additional input text.
 * @param {number} temperature - The temperature parameter (0-1).
 * @param {string} modelName - The specific Perplexity model to use.
 * @param {string} [outputType="text"] - The output type ("text", "list", "matrix").
 * @returns {string|Array} The API response.
 */
function callPerplexityAPI(systemPrompt, prompt, inputText, temperature, modelName, outputType = "text") {
  try {
    // Validate API key
    const validation = validateApiKeyForModel(modelName);
    if (!validation.success) {
      return validation.message;
    }

    // Get API key
    const provider = getProviderFromModel(modelName);
    const apiKey = getApiKey(provider);

    // Prepare messages
    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt + (inputText ? "\n\n" + inputText : "") }
    ];

    // Add instruction for structured outputs
    if (outputType === "list" || outputType === "matrix") {
      const structureInstruction = outputType === "list" 
        ? "Please respond with a JSON array of strings."
        : "Please respond with a JSON array of arrays (matrix format).";
      messages[messages.length - 1].content += "\n\n" + structureInstruction;
    }

    const data = {
      model: modelName,
      messages: messages,
      temperature: parseFloat(temperature || 0)
    };

    const endpoint = 'https://api.perplexity.ai/chat/completions';

    // Make API request
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      payload: JSON.stringify(data)
    };

    const response = makeHttpRequest(endpoint, requestOptions);

    if (!response.success) {
      return `Error: ${response.error}`;
    }

    // Process response
    const responseData = response.data;

    if (responseData.error) {
      return `Error: ${responseData.error.message || JSON.stringify(responseData.error)}`;
    }

    if (!responseData.choices || responseData.choices.length === 0) {
      return "Error: No response generated";
    }

    const choice = responseData.choices[0].message;
    const content = choice.content;

    // Check if we should include search results
    const includeSearchResults = PropertiesService.getUserProperties().getProperty('include_search_results') === 'true';
    // Perplexity API: search_results is at the top level, not inside choice.message
    const searchResults = responseData.search_results || [];

    // For structured outputs like list and matrix
    if (outputType === "list" || outputType === "matrix") {
      try {
        // For structured output, we can't append search results to the result
        return JSON.parse(content);
      } catch (parseError) {
        return `Error parsing structured response: ${parseError.message}`;
      }
    }

    // For text output with search results
    let finalContent = content;

    // Append search results if enabled and available
    if (includeSearchResults && searchResults.length > 0) {
      finalContent += "\n\n===== SEARCH RESULTS =====\n\n";

      for (let i = 0; i < searchResults.length; i++) {
        const result = searchResults[i];
        finalContent += `[${i+1}] ${result.title || 'Untitled'}\n`;
        finalContent += `${result.url || 'No URL'}\n`;
        finalContent += `${result.date || 'No date available'}\n\n`;
      }
    }

    return finalContent;

  } catch (error) {
    return handleError(error, 'Perplexity API');
  }
}


/**
 * Calls the DeepSeek API directly.
 *
 * @param {string} systemPrompt - The system prompt to set context.
 * @param {string} prompt - The user prompt.
 * @param {string} inputText - Additional input text.
 * @param {number} temperature - The temperature parameter (0-1).
 * @param {string} [outputType="text"] - The output type ("text", "list", "matrix").
 * @returns {string|Array} The API response.
 */
function callDeepSeekAPI(systemPrompt, prompt, inputText, temperature, outputType = "text"){
  const modelName = "deepseek-chat"; // DeepSeek's latest model
  try{
    //Validate API key
    const validation = validateApiKeyForModel(modelName);
    if(!validation.success){
      return validation.message;
    }
    //Get API key
    const provider = getProviderFromModel(modelName);
    const apiKey = getApiKey(provider);

    //Prepare messages
    const messages = [
      {role: "system", content: systemPrompt},
      {role: "user", content: prompt + (inputText ? "\n\n" + inputText : "")}
    ];

    //Add instruction for structured outputs
    if(outputType === 'list' || outputType === 'matrix'){
      const structureInstruction = (outputType === 'list') ? "Please respond with a JSON array of strings." : "Please respond with a JSON array of arrays (matrix format).";
      messages[messages.length - 1].content += '\n\n' + structureInstruction;
    }

    //Prepare request data 
    const data = {
      model: modelName,
      messages: messages,
      temperature: parseFloat(temperature || 0),
      max_tokens: 4096
    };

    //Make API request 
    const endpoint = 'https://api.deepseek.com/v1/chat/completions';
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      payload: JSON.stringify(data)
    };

    const response = makeHttpRequest(endpoint, requestOptions);

    if (!response.success) {
      return `Error: ${response.error}`;
    }

    const responseData = response.data;

    if (responseData.error) {
      return `Error: ${responseData.error.message}`;
    }

    if (!responseData.choices || responseData.choices.length === 0) {
      return "Error: No response generated";
    }

    const content = responseData.choices[0].message.content;

    //Handled structured outputs
    if(outputType === 'list' || outputType === 'matrix'){
      try{
        return JSON.parse(content);
      } catch(parseError){
        return `Error parsing structured response: ${parseError.message}`;
      }
    }
    return content;

  } catch(error){
    return handleError(error, 'DeepSeek API');
  }
}