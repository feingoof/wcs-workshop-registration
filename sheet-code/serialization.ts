function parseAnswerRow(row: string[]): SignupRow {
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
}

function parseStateRow(row: any[]): StateRow {
    const [timestamp, email, name, membership, classes, role, partner, price,
        state, partnerConfirmed, paymentConfirmed, paymentReference] = row;
    return {
        timestamp, email, name, membership, classes, role, price,
        partner, partnerConfirmed, state, paymentConfirmed, paymentReference
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
    }
}

function rowifyState(obj: StateRow) {
    const { timestamp, email, name, membership, classes, role, partner, price,
        state, partnerConfirmed, paymentConfirmed, paymentReference } = obj
    const stateRow = [timestamp, email, name, membership, JSON.stringify(classes), role, partner, price,
        state, partnerConfirmed, paymentConfirmed, paymentReference]
    return stateRow
}

function writeStateRow(obj: StateRow) {
    const stateRow = rowifyState(obj)

    const stateSheet = sheets.state();
    const rowNumber = stateSheet.getDataRange().getValues()
        .findIndex(row => row[0] == obj.timestamp && row[1] === obj.email);

    Logger.log("Row index: " + rowNumber);
    if (rowNumber === -1) {
        stateSheet.appendRow(stateRow);
    } else {
        const i = rowNumber + 1
        stateSheet.getRange(`A${i}:L${i}`).setValues([stateRow]);
    }
}

function writeStateRowAtRow(rowNumber: number, row: StateRow) {
    const stateRow = rowifyState(row)
    sheets.state().getRange(`A${rowNumber}:L${rowNumber}`).setValues([stateRow]);
}