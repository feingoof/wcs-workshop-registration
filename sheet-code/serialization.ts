function parseAnswerRow(row: string[]): SignupRow | undefined {
    try {
        const [timestamp, email, name, membership, classes, role, partner] = row;

        return {
            timestamp: timestamp as unknown as Date,
            email: email,
            name: name,
            membership: membership,
            classes: classes,
            role: role,
            partner: partner
        };
    } catch (error) {
        Logger.log(error)
        return undefined
    }
}

function parseStateRow(row: any[]): StateRow | undefined {
    try {
        const [timestamp, email, name, membership, classes, role, partner, price,
            state, partnerConfirmed, paymentConfirmed, cancelled, note, reevaluate] = row;
        return {
            timestamp, email, name, membership, classes: JSON.parse(classes), role, price,
            partner, partnerConfirmed, state, paymentConfirmed, cancelled, note, reevaluate
        }
    } catch (error) {
        Logger.log(error)
        return undefined
    }
}

function computePrice(membership: boolean, classes: WsClass[]) {
    const MEMBER_PRICE = 100
    const REGULAR_PRICE = 150
    const pricePerClass = membership ? MEMBER_PRICE : REGULAR_PRICE
    return pricePerClass * classes.length
}

function signupToState(signup: SignupRow): StateRow {
    const parseMembership = (rawMembership: string) => rawMembership.startsWith("Yes");
    const parseClasses = (rawClasses: string) => [["Class 1", "CLASS_1" as WsClass], ["Class 2", "CLASS_2" as WsClass]]
        .filter(([prefix, _]) => rawClasses.includes(prefix))
        .map(([_, v]) => v as WsClass);

    const classes = parseClasses(signup.classes)
    const role = signup.role as Role;
    const membership = parseMembership(signup.membership);

    return {
        timestamp: signup.timestamp.toISOString(),
        email: signup.email,
        name: signup.name,
        membership: membership,
        classes: classes,
        role: role,
        partner: signup.partner,
        price: computePrice(membership, classes),
        state: "NEW",
        partnerConfirmed: false,
        paymentConfirmed: false,
        cancelled: false,
        note: "",
        reevaluate: false,
    }
}

function insertCheckBoxes() {
    const sheet = sheets.state()
    const numRows = sheet.getDataRange().getNumRows()
    sheet.getRange(`J2:L${numRows}`).insertCheckboxes()
    sheet.getRange(`N2:N${numRows}`).insertCheckboxes()
}

function rowifyState(obj: StateRow) {
    const { timestamp, email, name, membership, classes, role, partner, price,
        state, partnerConfirmed, paymentConfirmed, note } = obj
    const stateRow = [timestamp, email, name, membership, JSON.stringify(classes), role, partner, price,
        state, partnerConfirmed, paymentConfirmed, note]
    return stateRow
}

function writeStateRow(obj: StateRow) {
    const stateRow = rowifyState({
        ...obj,
        reevaluate: false,
    })

    const stateSheet = sheets.state();
    const rowNumber = stateSheet.getDataRange().getValues()
        .findIndex(row => row[0] == obj.timestamp && row[1] === obj.email);

    Logger.log("Row index: " + rowNumber);
    if (rowNumber === -1) {
        stateSheet.appendRow(stateRow);
        insertCheckBoxes()
    } else {
        const i = rowNumber + 1
        stateSheet.getRange(`A${i}:L${i}`).setValues([stateRow]);
    }
}

function appendStateRow(row: StateRow) {
    const stateRow = rowifyState(row)
    sheets.state().appendRow(stateRow)
    insertCheckBoxes()
}

function getState(rowNumber: number): FsmState | undefined {
    logSheet(`Loading state row ${rowNumber}`)
    const rawRow = sheets.state().getDataRange().getValues()[rowNumber - 1]
    const parsedState = parseStateRow(rawRow);
    logSheet(`State row ${rowNumber}: ${JSON.stringify(parsedState)}`)
    return parsedState && stateToFsm(parsedState)
}