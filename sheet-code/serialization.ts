function getColumnTitles() {
    const answerData = sheets.answers().getDataRange().getValues();
    const topRow = answerData[0];
    answerData.forEach(row => {
        Logger.log(row);
    });
}

function parseAnswerRow(row: string[]): SignupRow {
    const [timestamp, email, name, membership, classes, role, partner] = row;

    return {
        timestamp: timestamp,
        email: email,
        name: name,
        membership: membership,
        classes: classes,
        role: role,
        partner: partner
    };
}

function stateObjToStateList(obj: StateRow) {
    return [obj.timestamp, obj.email, obj.name, obj.membership, obj.classes, obj.role,
    obj.partner, obj.state, obj.paymentConfirmed, obj.paymentReference];
}

function parseStateRow(row: any[]): StateRow {
    const [timestamp, email, name, membership, classes, role, partner, state,
        partnerConfirmed, paymentConfirmed, paymentReference] = row;
    return {
        timestamp, email, name, membership, classes, role,
        partner, partnerConfirmed, state, paymentConfirmed, paymentReference
    }
}

function signupToState(signup: SignupRow): StateRow {
    const parseMembership = (rawMembership: string) => rawMembership.startsWith("Yes");
    const parseClasses = (rawClasses: string) => [["Class 1", "CLASS_1" as WsClass], ["Class 2", "CLASS_2" as WsClass]]
        .filter(([prefix, _]) => rawClasses.includes(prefix))
        .map(([_, v]) => v as WsClass);

    return {
        timestamp: signup.timestamp,
        email: signup.email,
        name: signup.name,
        membership: parseMembership(signup.membership),
        classes: parseClasses(signup.classes),
        role: signup.role as Role,
        state: "NEW",
        partnerConfirmed: false,
        paymentConfirmed: false,
    }
}

function writeStateRow(obj) {
    const stateSheet = sheets.state();
    const rowNumber = stateSheet.getDataRange().getValues()
        .findIndex(row => row[0] == obj.timestamp && row[1] == obj.email);
    const stateRow = stateObjToStateList(obj);
    if (rowNumber === -1) {
        stateSheet.appendRow(stateRow);
    } else {
        stateSheet.getRange(`A${rowNumber}`).setValues([stateRow]);
    }
}
