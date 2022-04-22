/**
 * 
 */
function processAll() {
  logSheet("Manual processing started");
  getAllRows().forEach(row => {

  });
}

/**
 * Run each time a new registration happens.
 */
function onNewRegistration() {
  logSheet("New registration");
  // - Map registration to internal representation
  // - Run state machine
}

/**
 * Run each time the sheet changes.
 */
function onEdit(changeEvent) {
  const sourceSheet = changeEvent.source;
  // Log all changes
  logSheet(JSON.stringify(changeEvent));
  logSheet(JSON.stringify(sourceSheet.getSheetName()));

  // Filter out changes from other sheets than "Tilstand":
  if (sourceSheet.getSheetName() !== SheetIds.STATE) {
    // Irrelevant sheet -- abort.
    return;
  };

  // Detect what changed:
  // - Payment received
  // - Cancelled
  // - Manually edited 
}

function sendEmail(
  recipient: string,
  title: string,
  body: string
) {
  GmailApp.createDraft
}

function getAllRows() {
  return [];
}
