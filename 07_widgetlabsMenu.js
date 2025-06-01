/**
 * Menu creation and management for the Google Sheets Add-on
 */

/**
 * Runs when the spreadsheet is opened, creating the custom menu
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('gpt4sheets')
    .addItem('Settings', 'showSettingsDialog')
    .addSeparator()
    .addItem('Help & Documentation', 'showFunctionsDocumentation')
    .addToUi();
}

/**
 * Shows documentation about the available custom functions
 */
function showFunctionsDocumentation() {
  const htmlOutput = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
      h2 { color: #4285F4; }
      h3 { color: #333; margin-top: 25px; }
      code { background-color: #f8f9fa; padding: 2px 4px; border-radius: 3px; font-family: monospace; }
      .example { background-color: #f8f9fa; padding: 10px; border-left: 4px solid #4285F4; margin: 10px 0; }
      ul { padding-left: 20px; }
      .note { background-color: #fff3cd; padding: 10px; border-radius: 4px; margin: 10px 0; }
      .footer { font-size: 12px; color: #888; margin-top: 30px; text-align: right; }
    </style>
    
    <h2>gpt4sheets Functions</h2>
    
    <h3>=AI_CALL(prompt, [inputText])</h3>
    <p>Simple AI function that uses your default model and settings.</p>
    <ul>
      <li><strong>prompt</strong>: The question or instruction for the AI</li>
      <li><strong>inputText</strong> (optional): Additional context or data</li>
    </ul>
    <div class="example">
      <strong>Examples:</strong><br>
      <code>=AI_CALL("What is machine learning?")</code><br>
      <code>=AI_CALL("Summarize this text:", A1)</code><br>
      <code>=AI_CALL("Translate to Spanish:", "Hello world")</code>
    </div>

    <h3>=AI_CALL_ADV(prompt, systemPrompt, inputText, temperature, modelName, outputType, overflow)</h3>
    <p>Advanced AI function with full control over all parameters.</p>
    <ul>
      <li><strong>prompt</strong>: The question or instruction</li>
      <li><strong>systemPrompt</strong>: Context for the AI (e.g., "You are a helpful assistant")</li>
      <li><strong>inputText</strong>: Additional input data</li>
      <li><strong>temperature</strong>: Creativity level (0-1, where 0 is focused and 1 is creative)</li>
      <li><strong>modelName</strong>: Specific model to use (leave empty for default)</li>
      <li><strong>outputType</strong>: "text", "list", or "matrix"</li>
      <li><strong>overflow</strong>: Whether to expand into adjacent cells for structured outputs</li>
    </ul>
    <div class="example">
      <strong>Examples:</strong><br>
      <code>=AI_CALL_ADV("Explain quantum physics", "You are a physics professor")</code><br>
      <code>=AI_CALL_ADV("Write a creative story", "You are a creative writer", "", 0.8, "gpt-4o")</code><br>
      <code>=AI_CALL_ADV("List 5 colors", "", "", 0, "", "list", true)</code><br>
      <code>=AI_CALL_ADV("Create a 3x3 table", "", "", 0, "", "matrix", true)</code>
    </div>

    <h3>Available Models</h3>
    <ul>
      <li><strong>Google Gemini:</strong> gemini-2.0-flash, gemini-2.5-pro-exp-03-25</li>
      <li><strong>OpenAI:</strong> gpt-4o, gpt-4o-mini, o3-mini</li>
      <li><strong>Anthropic:</strong> claude-3.7-sonnet, claude-3.5-sonnet, claude-haiku</li>
    </ul>

    <h3>Getting Started</h3>
    <ol>
      <li>Go to <strong>gpt4sheets > Settings</strong> in the menu</li>
      <li>Add your API keys for the providers you want to use:
        <ul>
          <li><a href="https://aistudio.google.com/app/apikey" target="_blank">Google Gemini API Key</a></li>
          <li><a href="https://platform.openai.com/api-keys" target="_blank">OpenAI API Key</a></li>
          <li><a href="https://console.anthropic.com/" target="_blank">Anthropic API Key</a></li>
        </ul>
      </li>
      <li>Set your preferred default model and temperature</li>
      <li>Start using the AI functions in your spreadsheet!</li>
    </ol>

    <div class="note">
      <strong>Note:</strong> You need at least one API key configured to use the AI functions. 
      The functions will automatically use your default model, or you can specify a different model 
      using AI_CALL_ADV.
    </div>

    <h3>Output Types</h3>
    <ul>
      <li><strong>text:</strong> Returns plain text (default)</li>
      <li><strong>list:</strong> Returns an array that can expand vertically</li>
      <li><strong>matrix:</strong> Returns a 2D array that can expand both horizontally and vertically</li>
    </ul>

    <h3>Tips</h3>
    <ul>
      <li>Use specific, clear prompts for better results</li>
      <li>Higher temperature values (0.7-1.0) make responses more creative</li>
      <li>Lower temperature values (0.0-0.3) make responses more focused and consistent</li>
      <li>Use the overflow parameter with structured outputs to automatically fill adjacent cells</li>
    </ul>
    <div class="footer">Open source project by <a href="https://widgetlabs.ai" target="_blank">Widgetlabs.ai</a></div>
  `)
    .setTitle('gpt4sheets Documentation')
    .setWidth(600)
    .setHeight(500);
  
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'gpt4sheets Documentation');
}

/**
 * Shows the WidgetLabs sidebar with the Documentation tab active
 */
function showWidgetLabsDocumentation() {
  const html = HtmlService.createHtmlOutputFromFile('widgetlabsSettingsPanel')
    .setTitle('WidgetLabs Documentation');
  
  // Add a parameter to indicate that the Help tab should be active
  html.append('<script>var initialTab = "help";</script>');
  
  SpreadsheetApp.getUi().showSidebar(html);
}

/**
 * Shows the WidgetLabs sidebar with the Settings tab active
 */
function showWidgetLabsSettingsDialog() {
  const html = HtmlService.createHtmlOutputFromFile('widgetlabsSettingsPanel')
    .setTitle('WidgetLabs Settings');
  
  // Add a parameter to indicate that the Settings tab should be active (default)
  html.append('<script>var initialTab = "settings";</script>');
  
  SpreadsheetApp.getUi().showSidebar(html);
}

/**
 * Function to handle the macro shortcut defined in appsscript.json
 * This will be called when the user presses Ctrl+Alt+Shift+1
 */
function onOpenTrigger() {
  onOpen();
}