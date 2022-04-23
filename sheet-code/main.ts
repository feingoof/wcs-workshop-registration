/**
 * Run each time a new registration happens.
 */
function onNewRegistration() {
  logSheet("New registration");
  // - Copy new signup(s) to the state sheet
  const stateSheet = sheets.state()
  enumerate(sheets.answers().getDataRange().getValues())
    .slice(1) // Ignore column headers
    .forEach(([index, signupRow]) => {
      const rowNumber = index + 1
      const r = signupToState(parseAnswerRow(signupRow))
      Logger.log([rowNumber, r])
      if (!stateSheet.getRange(`A${rowNumber}`).getValue()) {
        Logger.log("Nothing there")
        writeStateRowAtRow(rowNumber, r)
      } else {
        Logger.log("Something there")
      }
    })
  // - Run state machine
}

function countFreeSpots(): number {
  const params = getParameters()
  return params.maxParticipants - countUnclaimed()
}

function countUnclaimed(): number {
  return getAllStates()
    .filter(s => !["NEW", "CANCELLED", "WAITING_LIST"].includes(s.state))
    .length
}

function getAllStates(): StateRow[] {
  return sheets.state().getDataRange().getValues()
    .slice(1)
    .map(parseStateRow)
}

function getParameters(): EventParameters {
  const sheetValues = sheets.parameters().getDataRange().getValues()
  const find = (needle: string) => sheetValues.find(([key, value]) => key === needle)[1]
  return {
    maxImbalance: find("maxImbalance"),
    maxParticipants: find("maxParticipants"),
    leaderBias: find("leaderBias"),
    followerBias: find("followerBias"),
  }
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

/**
 * 
 */
function processAll() {
  logSheet("Manual processing started");
}

function enumerate<T,>(xs: T[]): ([number, T])[] {
  const ys = []
  xs.forEach((t, ix) => {
    ys.push([ix, t])
  })
  return ys
}