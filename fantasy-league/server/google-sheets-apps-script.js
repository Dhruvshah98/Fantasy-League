function doPost(e) {
  const body = JSON.parse(e.postData.contents);
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  writeSheet(spreadsheet, "Standings", body.sheets.standings);
  writeSheet(spreadsheet, "Teams", body.sheets.teams);
  writeSheet(spreadsheet, "Players", body.sheets.players);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, league: body.league.code }))
    .setMimeType(ContentService.MimeType.JSON);
}

function writeSheet(spreadsheet, name, rows) {
  let sheet = spreadsheet.getSheetByName(name);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(name);
  }

  sheet.clearContents();
  sheet.getRange(1, 1, rows.length, rows[0].length).setValues(rows);
}
