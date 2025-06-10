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
    
  // Check for updates
  try {
    const updateStatus = checkForUpdates();
    PropertiesService.getScriptProperties().setProperty(
      'UPDATE_STATUS', 
      JSON.stringify(updateStatus)
    );
  } catch (error) {
    console.error("Failed to check for updates:", error);
  }
}

/**
 * Shows documentation about the available custom functions
 */
function showFunctionsDocumentation() {
  const htmlOutput = HtmlService.createHtmlOutputFromFile('functionsDocumentation')
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