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
 * Base function for formulas -> values for selected range
 */
function replace_selected_formulas_with_values(){
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const range = sheet.getActiveRange();
  formulas_to_values(sheet, range)
}

/**
 * Base function for formulas -> values for all range
 */
function replace_all_formulas_with_values(){
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const range = sheet.getDataRange();
  formulas_to_values(sheet, range)
}


/**
 * Templated formula -> value function for easier code readability
 * 
 * @param {SpreadsheetApp->spreadsheet->sheet} sheet --> the currenr sheet we are operating on 
 * @param {sheet->range} range --> the MSM (minimum spanning matrix of the selected data values [custom/all])
 * @returns 
 */
function formulas_to_values(sheet, range){
  //warning so that you dont run it on itself  
  if (sheet.getName().endsWith("_BCKFM")) {
    SpreadsheetApp.getUi().alert("Do not run this on the backup sheet.");
    return;
  }

  //Get backup sheet
  const backupSheet = getBackupSheet(sheet);

  //Get metadata on the range
  const numRows = range.getNumRows();
  const numCols = range.getNumColumns();
  const startRow = range.getRow();
  const startCol = range.getColumn();

  //Get values 
  let values = range.getValues(); 

  //get formulas and a deep copy of formulas to save
  let formulas = range.getFormulas();
  let backupFormulasAsText = formulas.map(row => [...row]); // deep copy of formulas to modify

  //boolean to see if range has formulas to replace
  let modified = false;

  //get set of sheet functions
  const set_functions = getSheetFunctions();

  for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < numCols; col++) {
      const currFormula = formulas[row][col];

      if (currFormula) {
        let formulaPrefix = currFormula.split('(')[0].trim().toUpperCase();
        formulaPrefix = formulaPrefix.substring(1); // remove '='

        if (set_functions.has(formulaPrefix)) {
          // Case 1: AI formula
          modified = true;
          const cell = sheet.getRange(startRow + row, startCol + col);
          cell.setValue(values[row][col])
          backupFormulasAsText[row][col] = "'" + currFormula;
        } else {
          // Case 2: Non-AI formula → keep it
          backupFormulasAsText[row][col] = null;
          // formulas[row][col] already has the correct value — no need to touch
          // values[row][col] already has original value
        }
    } else {
      // Case 3: Static value (no formula)
      backupFormulasAsText[row][col] = null;
      // Don't touch formulas[row][col] — it's already "" and should stay
      // Don't touch values[row][col] — it already has the static value
      }
    }
  } 

  if(modified){
    // Apply LLM formulas to backup sheet
    backupSheet.getRange(startRow, startCol, numRows, numCols).setValues(backupFormulasAsText);
    SpreadsheetApp.getUi().alert("All custom formulas have been replaced by their values");
  } else {
    SpreadsheetApp.getUi().alert("No custom formulas found to replace in current sheet.");
  }
}

/**
 * Base function for values -> formulas for selected range
 */
function replace_selected_values_with_formulas(){
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const range = sheet.getActiveRange();
  values_to_formulas(sheet, range);
}

/**
 * Base function for values -> formulas for entire range
 */
function replace_all_values_with_formulas(){
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const range = sheet.getDataRange();
  values_to_formulas(sheet, range);
  const sheetName = "" + sheet.getSheetId() + "_BCKFM";
  const backupSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  SpreadsheetApp.getActiveSpreadsheet().deleteSheet(backupSheet);
}


/**
 * 
 * @param {SpreadsheetApp->spreadsheet->sheet} sheet --> the current sheet we are operating on 
 * @param {sheet->range} range --> the range of the sheet we are operating on
 * @returns 
 */
function values_to_formulas(sheet, range){
  //warning so that you dont run it on itself  
  if (sheet.getName().endsWith("_BCKFM")) {
    SpreadsheetApp.getUi().alert("Do not run this on the backup sheet.");
    return;
  }

  //get values on current sheet
  let values = range.getValues();

  //get formulas on current sheet
  let formulas = range.getFormulas();

  //get metadata on range
  const numRows = range.getNumRows();
  const numCols = range.getNumColumns();
  const startRow = range.getRow();
  const startCol = range.getColumn();

  //get backup sheet and its formulas
  const backupSheet = getBackupSheet(sheet);
  let backupFormulas = backupSheet.getRange(startRow, startCol, numRows, numCols).getValues();

  let to_replace = false;
  for(let row = 0; row<numRows; row++){
    for(let col = 0; col<numCols; col++){
      const currBackup = backupFormulas[row][col];
      if(currBackup && currBackup !== ""){
        //there exists a backupFormula we want to replace
        to_replace = true;
        let currFormula = currBackup.substring(1);
        const cell = sheet.getRange(startRow + row, startCol + col);
        cell.setFormula(currFormula);
        backupFormulas[row][col] = ""; //no need to save the formula anymore
      } else {
        //there is no backup formula and there is nothing to do

        //values[row][col] = values[row][col] <-- this is a no op but it is implied that the values stay the same
      }
    }
  }
  if(to_replace){
    backupSheet.getRange(startRow, startCol, numRows, numCols).setFormulas(backupFormulas); //overwrite the backup formulas so they dont exist anymore
    SpreadsheetApp.getUi().alert("All values from custom formulas have been replaced");
  } else {
    SpreadsheetApp.getUi().alert("No dynamic values found to replace in current sheet.");
  }
}

/**
 * Imports content from a text file in Google Drive into the current cell
 * 
 * @param {string} txtID - The Drive ID of the .txt file to extract 
 * @returns {void} - Doesn't return anything, but sets the value of the current cell to the text of the .txt file
 */
function file_to_cell(txtID){
  // Check for valid input
  if(txtID === '-1' || txtID === null || txtID === undefined){
    SpreadsheetApp.getUi().alert("Please choose a .txt file to extract.");
    return;
  }

  // Get active sheet and cell
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const cell = sheet.getCurrentCell();

  if(cell === null){
    SpreadsheetApp.getUi().alert("Choose a cell for the output.");
    return;
  }

  try {
    // Get the file from Drive
    const file = DriveApp.getFileById(txtID);
    
    // Check file size (limit to 50MB to be safe)
    const fileSize = file.getSize();
    const MAX_SIZE = 50 * 1024 * 1024; // 50MB in bytes
    
    if (fileSize > MAX_SIZE) {
      SpreadsheetApp.getUi().alert("File is too large to import. Please select a smaller text file (under 50MB).");
      return;
    }
    
    // Get file content
    const fileBody = file.getBlob();
    const data = fileBody.getDataAsString();
    
    // Insert into cell
    cell.setValue(data);
    SpreadsheetApp.getUi().alert("Extracted text from '" + file.getName() + "' successfully");
  } catch (error) {
    // Handle potential errors
    console.error("Error in file_to_cell:", error);
    SpreadsheetApp.getUi().alert("Error importing text file: " + error.toString());
  }
}

/**
 * 
 * @param {string} cell 
 * @param {string} promptString 
 * @returns {string} 
 * 
 * @customfunction 
 * 
 * @example =AI_EXTRACT(A1, "Extract the main idea")
 */
function AI_EXTRACT(cell, promptString){
  try{
    if(!cell) return "Error: Please pick a non-null cell.";
    if(!promptString) return "Error: Please provide a prompt string.";

    const prompt = "Prompt: " + promptString + "\nPlease return the answer only in the minimal words.";

    return AI_CALL(prompt, cell);
  } catch (error){
    return "Error: " + error.message;
  }
}


/**
 * AI Classifer Function that accepts any combination of string or cells as the input
 *
 * @param {string/2D Array} classifiers
 * @param {string} object
 * @returns {string}
 *
 * @customfunction
 * 
 * @example 
 * =AI_CLASSIFY(A1:A3, B1)
 * =AI_CLASSIFY("Is this a fruit, vegetable, or neither?", "Rock")
 */
function AI_CLASSIFY(classifiers, object){
  try {
    if(!object) return "Error: Please provide an object to classify.";
    if(!classifiers) return "Error: Please provide classifiers."; 

    const base_prompt = "Classify the following object using these criteria: ";

    if(typeof(classifiers) === "string"){
      const prompt = base_prompt + classifiers + "Output is strictly one of the classes";
      return AI_CALL(prompt, object);
    } else {
      //classifiers is a 2D array that needs to be turned to a string
      const flattened = classifiers.flat().join(',');
      const prompt = base_prompt + flattened + "Output is strictly one of the classes";
      return AI_CALL(prompt, object);
    }
  } catch (error) {
    return "Error: " + error.message;
  }
}

/**
 * 
 * Accepts any combination of string or cells as the input
 * 
 * @param {cell} text 
 * @param {user string} outputLanguage 
 * 
 * @customfunction
 * 
 * @example
 * =AI_TRANSLATE(A1, "Spanish")
 * =AI_TRANSLATE("Hello, world!", "French")
 * 
 */

function AI_TRANSLATE(text, outputLanguage){
  try{
    if(!text) return "Error: Please provide text to translate.";
    if(!outputLanguage) return "Error: Please provide an output language.";

    const prompt = "Translate the follwing text into " + outputLanguage + ". Return the text only";
    return AI_CALL(prompt, text);

  } catch (error) {
    return "Error: " + error.message;
  }
}


/**
 * 
 * AI Summarization with custom output length as # of sentences
 * Works on any combination of strings or cells as input
 * 
 * Default sentence size is medium
 * 
 * @param {string} text 
 * @param {int} num_sentences 
 * @param {string} sentence_length 
 * 
 * @customfunction
 * 
 * @example
 * =AI_SUMMARIZE(A1, 3, "short")
 *
 * 
 */
function AI_SUMMARIZE(text, num_sentences, sentence_length){
  try{
    if(!text) return "Error: Please provide text to summarize.";
    if(!num_sentences || num_sentences <= 0) return "Error: Please provide a valid output length.";
    if(!sentence_length) sentence_length = "medium";

    const prompt = "Summarize the following text in " + num_sentences + " " + sentence_length + " sentences. Return only the summary.";
    return AI_CALL(prompt, text);
  } catch (error){
    return "Error: " + error.message;
  }
}



/**
 * AI Formatting Function that takes in both cells and strings as inputs
 * 
 * 
 * @param {string} formatStyle 
 * @param {string} text
 * 
 * 
 * @customfunction
 * 
 * @example
 * =AI_FORMAT("MM/DD/YYYY", A1)
 * =AI_FORMAT("snake case", "Hello World!")
 *  
 */
function AI_FORMAT(formatStyle, text){
  try {
    if(!formatStyle) return "Error: Please provide a format style.";
    if(!text) return "Error: Please provide text to format.";

    const prompt = "Format the following text in the style of " + formatStyle + " and return the output only";

    return AI_CALL(prompt, text);

  } catch (error) {
    return "Error: " + error.message;
  }
}