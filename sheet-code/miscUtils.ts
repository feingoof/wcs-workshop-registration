function reorderName(name: string) {
    const nameParts = name.trim().split(" ");
    const firstName = nameParts.slice(0, -1).join(" ")
    const lastName = nameParts.slice(-1)[0]
    return [lastName, firstName].join(", ")
}

function isClass1(classes: WsClass[]) {
    return classes.includes("CLASS_1")
}

function isClass2(classes: WsClass[]) {
    return classes.includes("CLASS_2")
}