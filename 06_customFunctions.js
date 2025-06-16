/**
 * Custom functions for Google Sheets integration
 *
 * Provides spreadsheet functions for calling AI models directly from cells.
 * All functions are designed for use in Google Apps Script and are referenced throughout the project.
 *
 * @fileoverview Custom spreadsheet functions for open-source WidgetLabs Sheets Add-on
 */

/**
 * Simple AI calling function that uses default settings
 * 
 * @param {string} prompt The prompt to send to the AI model
 * @param {string|Range} inputText Additional input text or cell reference (optional)
 * @return {string} The AI response
 * 
 * @customfunction
 *
 * @example
 *   =AI_CALL("What is machine learning?")
 *   =AI_CALL("Summarize this text:", A1)
 *   =AI_CALL("Translate to Spanish:", "Hello world")
 */
function AI_CALL(prompt, inputText = "") {
  try {
    // Validate prompt
    if (!prompt || (typeof prompt === 'string' && prompt.trim() === '')) {
      return "Error: Please provide a prompt";
    }

    // Get the default model and temperature from user preferences
    const propertyStore = getPropertyStore();
    const userModel = getProperty(propertyStore.USER.DEFAULT_MODEL, 'user', null);
    const userTemperature = getProperty(propertyStore.USER.DEFAULT_TEMPERATURE, 'user', '0');
    const modelConfig = getModelConfig();
    const selectedModel = userModel || modelConfig.default;
    const temperature = parseFloat(userTemperature);
    
    // Call the appropriate API based on the model provider
    const provider = getProviderFromModel(selectedModel);
    if (provider === 'gemini') {
      return callGeminiAPI("You are a helpful assistant", prompt, inputText, temperature, selectedModel, "text");
    } else if (provider === 'openai') {
      return callOpenAIAPI("You are a helpful assistant", prompt, inputText, temperature, selectedModel, "text");
    } else if (provider === 'anthropic') {
      return callAnthropicAPI("You are a helpful assistant", prompt, inputText, temperature, selectedModel, "text");
    } else if (provider === 'perplexity') {
      return callPerplexityAPI("You are a helpful assistant", prompt, inputText, temperature, selectedModel, "text");
    } else if (provider === 'deepseek'){
      return callDeepSeekAPI("You are a helpful assistant", prompt, inputText, temperature, selectedModel, "text");
    } else {
      return "Error: Unsupported model: " + selectedModel;
    }
  } catch (error) {
    return "Error: " + error.message;
  }
}

/**
 * Advanced AI calling function with full control over parameters
 * 
 * @param {string} prompt The prompt to send to the AI model
 * @param {string} systemPrompt The system prompt to set context for the AI model (optional, default: "You are a helpful assistant")
 * @param {string|Range} inputText Additional input text or cell reference (optional)
 * @param {number} temperature The temperature parameter for the model (0-1, optional, default: 0)
 * @param {string} modelName Optional model name to use (optional, uses default if not specified)
 * @param {string} outputType The type of output to return: 'text', 'list', or 'matrix' (optional, default: 'text')
 * @param {boolean} overflow Whether the response should overflow into adjacent cells for structured outputs (optional, default: false)
 * @return {string|Array} The AI response
 * 
 * @customfunction
 * 
 * Example usage:
 * 
 * // Basic usage (returns plain text):
 * =AI_CALL_ADV("What is machine learning?")
 * 
 * // With custom system prompt:
 * =AI_CALL_ADV("Explain quantum physics", "You are a physics professor")
 * 
 * // With specific model and temperature:
 * =AI_CALL_ADV("Write a creative story", "You are a creative writer", "", 0.8, "gpt-4o")
 * 
 * // List output (returns an array that expands to multiple cells):
 * =AI_CALL_ADV("List 5 programming languages", "You are a helpful assistant", "", 0, "", "list")
 * 
 * // Matrix output (returns a 2D array):
 * =AI_CALL_ADV("Create a 3x3 multiplication table", "You are a helpful assistant", "", 0, "", "matrix")
 * 
 * // Using overflow option for structured data:
 * =AI_CALL_ADV("Create a recipe with ingredients and steps", "You are a helpful chef", "", 0, "", "matrix", true)
 */
function AI_CALL_ADV(prompt, systemPrompt = "You are a helpful assistant", inputText = "", temperature = 0, modelName = "", outputType = "text", overflow = false) {
  try {
    // Validate prompt
    if (!prompt || (typeof prompt === 'string' && prompt.trim() === '')) {
      return "Error: Please provide a prompt";
    }
    
    // Validate outputType
    const validOutputTypes = ["text", "list", "matrix"];
    if (outputType && !validOutputTypes.includes(outputType)) {
      return "Error: outputType must be one of: 'text', 'list', or 'matrix'";
    }

    // Validate temperature
    const temp = parseFloat(temperature);
    if (isNaN(temp) || temp < 0 || temp > 1) {
      return "Error: temperature must be a number between 0 and 1";
    }
    
    // Determine which model to use
    let selectedModel = modelName;
    
    if (!selectedModel) {
      const propertyStore = getPropertyStore();
      const userModel = getProperty(propertyStore.USER.DEFAULT_MODEL, 'user', null);
      const modelConfig = getModelConfig();
      selectedModel = userModel || modelConfig.default;
    }
    
    // Validate that we have an API key for this model
    const validation = validateApiKeyForModel(selectedModel);
    if (!validation.success) {
      return validation.message;
    }
    
    // Call the appropriate API based on the model provider
    const provider = getProviderFromModel(selectedModel);
    let response;
    if (provider === 'gemini') {
      response = callGeminiAPI(systemPrompt, prompt, inputText, temp, selectedModel, outputType);
    } else if (provider === 'openai') {
      response = callOpenAIAPI(systemPrompt, prompt, inputText, temp, selectedModel, outputType);
    } else if (provider === 'anthropic') {
      response = callAnthropicAPI(systemPrompt, prompt, inputText, temp, selectedModel, outputType);
    } else if (provider === 'perplexity') {
      response = callPerplexityAPI(systemPrompt, prompt, inputText, temp, selectedModel, outputType);
    } else if (provider === 'deepseek'){
      response = callDeepSeekAPI(systemPrompt, prompt, inputText, temp, selectedModel, outputType);
    } else {
      return "Error: Unsupported model: " + selectedModel;
    }
    
    // Handle overflow for structured outputs
    if (overflow && (outputType === "list" || outputType === "matrix")) {
      // For Google Sheets, returning an array will automatically overflow into adjacent cells
      return response;
    }
    
    return response;
    
  } catch (error) {
    return "Error: " + error.message;
  }
}
/**
* Simple function to replace selected cell(s) with the values outputted by the formula call
*
* @customFunction
*
*/
function replace_selected_formulas_with_values(){
  //Get active spreadsheet
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  //warning so that you dont run it on itself  
  if (sheet.getName() === "__AI__BACKUP__DO__NOT__TOUCH") {
    SpreadsheetApp.getUi().alert("Do not run this on the backup sheet.");
    return;
  }

  //Get backup sheet
  const backupSheet = getBackupSheet();

  //Get actively selected range --> returns a 2D array
  const range = sheet.getActiveRange();
  const num_rows = range.getNumRows();
  const num_cols = range.getNumColumns();

  //get the starting row and col
  const startRow = range.getRow();
  const startCol = range.getColumn();

  //Get values and formulas within the range
  const values = range.getValues(); //2d array of strings
  const formulas = range.getFormulas();
  const backupFormulas = formulas.map(row => [...row]); // deep copy of formulas to modify

  //boolean to see if active range has formulas to replace
  let modified = false;

  for(let row = 0; row<num_rows; row++){
    for(let col = 0; col<num_cols; col++){
      const currFormula = formulas[row][col];
      if(currFormula && (currFormula.includes("AI_CALL") || currFormula.includes("AI_CALL_ADV"))){
        modified = true;
      } else {
        values[row][col] = currFormula;
        backupFormulas[row][col] = "";
      }
    }
  }
  if(modified){
    range.setValues(values);
    backupSheet.getRange(startRow, startCol, num_rows, num_cols).setFormulas(backupFormulas);
  } else {
    SpreadsheetApp.getUi().alert("No AI_CALL or AI_CALL_ADV formulas found in selected range.");
  }
}


/** 
* Simple function to replace all cells in the spreadsheet with the values outputted by the formula call
*
* @customFunction
*
*/
function replace_all_formulas_with_values(){
  //Get active spreadsheet
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  //warning so that you dont run it on itself  
  if (sheet.getName() === "__AI__BACKUP__DO__NOT__TOUCH") {
    SpreadsheetApp.getUi().alert("Do not run this on the backup sheet.");
    return;
  }

  //get accessn to the backup sheet
  const backupSheet = getBackupSheet();

  //Get minimum spanning range --> returns a 2D array
  const range = sheet.getDataRange();
  const num_rows = range.getNumRows();
  const num_cols = range.getNumColumns();

  //get the starting row and col
  const startRow = range.getRow();
  const startCol = range.getColumn();

  //Get values and formulas within the range
  const values = range.getValues();  //2d array of strings
  const formulas = range.getFormulas();
  const backupFormulas = formulas.map(row => [...row]); // deep copy of formulas to modify

  //boolean to see if active range has formulas to replace
  let modified = false;

  for(let row = 0; row<num_rows; row++){
    for(let col = 0; col<num_cols; col++){
      const currFormula = formulas[row][col];
      if(currFormula && (currFormula.includes("AI_CALL") || currFormula.includes("AI_CALL_ADV"))){
        modified = true;
        backupFormulas[row][col] = "";
      } else {
        values[row][col] = currFormula;
      }
    }
  }
  if(modified){
    range.setValues(values);
    backupSheet.getRange(startRow, startCol, num_rows, num_cols).setFormulas(backupFormulas);
  } else {
    SpreadsheetApp.getUi().alert("No AI_CALL or AI_CALL_ADV formulas found in sheet.");
  }
}


/** 
* Simple function to replace all cells in the spreadsheet with the values that had use of an AI CALL previously with the prior formula
*
* @customFunction
*
*/
function replace_values_with_formulas(){
  //get basic info on current sheet
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const range = sheet.getActiveRange();
  const values = range.getValues();

  //get info on range
  const num_rows = range.getNumRows();
  const num_cols = range.getNumColumns();
  const startRow = range.getRow();
  const startCol = range.getColumn();

  //get backup sheet and its formulas
  const backupSheet = getBackupSheet();
  let backupFormulas = backupSheet.getRange(startRow, startCol, num_rows, num_cols).getFormulas();

  let to_replace = false;
  for(let row = 0; row<num_rows; row++){
    for(let col = 0; col<num_cols; col++){
      const currFormula = backupFormulas[row][col];
      if(currFormula && currFormula !== ""){
        to_replace = true;
        values[row][col] = currFormula;
        backupFormulas[row][col] = "";
      } else {
        continue;
      }
    }
  }
  if(to_replace){
    range.setValues(values); //set values
    backupSheet.getRange(startRow, startCol, num_rows, num_cols).setFormulas(backupFormulas); //overwrite the backup formulas so they dont exist anymore
  } else {
    SpreadsheetApp.getUi().alert("No AI_CALL or AI_CALL_ADV formulas found to replace in current sheet.");
  }
}

