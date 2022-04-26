/**
 * Run each time a new registration happens.
 */
function onNewRegistration() {
  Logger.log("New registration")
  // - Copy new signup(s) to the state sheet
  const allExistingStates = getAllStates()
  sheets.answers().getDataRange().getValues()
    .slice(1) // Ignore column headers
    .forEach((rawSignupRow) => {
      const signupRow = parseAnswerRow(rawSignupRow);
      if (signupRow !== undefined) {
        const r = signupToState(signupRow)
        const alreadyThere = allExistingStates
          .filter(state => state.timestamp == r.timestamp && state.email == r.email)
          .length > 0
        if (!alreadyThere) {
          appendStateRow(r)
        }
      }
    })
  // - Run state machine
  processAll()
}

function countFreeSpots(): number {
  const params = getParameters()
  return params.maxParticipants - countClaimed()
}

/**
 * 
 * @returns number of claimed spots, including reserved ones
 */
function countClaimed(): number {
  const params = getParameters()
  const reserved = params.followerBias + params.leaderBias

  return reserved + getAllStates()
    .map(stateToFsm)
    .filter(s => s.claimsSpot)
    .length
}

function getAllFsms(): FsmState[] {
  return getAllStates().map(stateToFsm)
}

function getAllStates(): StateRow[] {
  return sheets.state().getDataRange().getValues()
    .slice(1)
    .map(parseStateRow)
    .filter(r => r !== undefined) as StateRow[]
}

function getParameters(): EventParameters {
  const sheetValues = sheets.parameters().getDataRange().getValues()
  const find = (needle: string) => sheetValues
    .find(([key, value]) => key === needle)![1]
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
function installedEditHandler(changeEvent: GoogleAppsScript.Events.SheetsOnEdit) {
  const sourceSheet = changeEvent.source;
  // Log all changes
  logSheet(JSON.stringify([sourceSheet.getSheetName(), changeEvent]));

  // Filter out changes from other sheets than "Tilstand":
  if (sourceSheet.getSheetName() !== SheetIds.STATE) {
    // Irrelevant sheet -- abort.
    return;
  };

  const decodeEventType = (changeEvent: GoogleAppsScript.Events.SheetsOnEdit): ([number, ChangeEvent] | undefined) => {
    if (changeEvent.range.getWidth() != 1 || changeEvent.range.getHeight() != 1) {
      return
    }
    if (!changeEvent.range.getValue()) {
      return
    }
    const column = changeEvent.range.getColumn()
    const rowNumber = changeEvent.range.getRowIndex()
    switch (column) {
      case 10: return [rowNumber, "PARTNER_CONFIRMED"]
      case 11: return [rowNumber, "PAYMENT_RECEIVED"]
      case 12: return [rowNumber, "CANCELLED"]
      case 14: return [rowNumber, "EVALUATE"]
    }
  }

  const maybeEvent = decodeEventType(changeEvent)
  if (maybeEvent !== undefined) {
    logSheet(JSON.stringify(maybeEvent))
    const [rowNumber, eventType] = maybeEvent
    const fsm = getState(rowNumber)
    if (fsm === undefined) {
      logSheet(`Couldn't load state at row ${rowNumber} -- aborting`)
      return
    }
    if (eventType == "PAYMENT_RECEIVED" && fsm.stateName == "AWAITING_PAYMENT") {
      (<AwaitingPaymentState>fsm).acknowledgePayment()
    } else if (eventType == "CANCELLED") {
      fsm.cancel()
    } else if (eventType == "PARTNER_CONFIRMED" && fsm.stateName == "PARTNER_SIGNUP") {
      (<PartnerSignupState>fsm).partnerConfirmed()
    } else if (eventType == "EVALUATE") {
      if (fsm.stateName == "NEW") {
        (<NewState>fsm).evaluate()
      } else if (fsm.stateName == "WAITING_LIST") {
        (<WaitingListState>fsm).reevaluate()
      }
    }
    processAll()
  }

}

function processAll() {
  Logger.log("Processing started")
  let unstable = true
  while (unstable) {
    Logger.log("Something changed on the last run. Running again.")
    unstable = processAllInternal()
  }
}

function processAllInternal(): boolean {

  let newAdmitted = false

  const newFsms = getAllFsms().filter(s => s.stateName == "NEW")
    .map(fsm => <NewState>fsm)
  newFsms.forEach(fsm => {
    const newState = fsm.evaluate()
    if (newState.stateName != "NEW") {
      newAdmitted = true
    }
  })

  let waitingListAdmitted = false

  const waitingList = getAllFsms().filter(s => s.stateName == "WAITING_LIST")
    .map(fsm => <WaitingListState>fsm)
  waitingList.forEach(fsm => {
    const newState = fsm.reevaluate()
    if (newState.stateName != "WAITING_LIST") {
      waitingListAdmitted = true
    }
  })

  return newAdmitted || waitingListAdmitted
}

function enumerate<T,>(xs: T[]): ([number, T])[] {
  const ys: [number, T][] = []
  xs.forEach((t, ix) => {
    ys.push([ix, t])
  })
  return ys
}