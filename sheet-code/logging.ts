function logSheet(
  msg: string,
  severity = "INFO"
) {
  const sheet = getSheet(SheetIds.LOG);
  sheet!.appendRow([new Date().toISOString(), severity, msg])
}

