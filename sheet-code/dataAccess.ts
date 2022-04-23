const sheets = {
  state: () => getSheet(SheetIds.STATE),
  answers: () => getSheet(SheetIds.ANSWERS),
  log: () => getSheet(SheetIds.LOG),
  parameters: () => getSheet(SheetIds.PARAMETERS),
}

enum SheetIds {
  STATE = "Tilstand",
  ANSWERS = "Skjemasvar 1",
  LOG = "script_log",
  PARAMETERS = "Parametre"
};

function getSheet(sheet) {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheet);
}