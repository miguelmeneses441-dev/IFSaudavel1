const SHEET_NAME = 'Respostas';

function doGet() {
  return ContentService.createTextOutput('IFsaudavel: endpoint ativo.');
}

function doPost(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

  const headers = [
    'Data/Hora', 'Visual', 'Informações', 'Parte favorita', 'Quiz',
    'Navegação', 'Confiabilidade', 'O que melhorar', 'O que mais gostou',
    'Aprendeu algo novo', 'Recomendaria', 'Nota', 'Comentário final'
  ];

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
  }

  const p = e.parameter || {};
  sheet.appendRow([
    p.timestamp ? new Date(p.timestamp) : new Date(),
    p.visual || '', p.info || '', p.parte || '', p.quiz || '', p.nav || '',
    p.confianca || '', p.melhorar || '', p.gostou || '', p.aprendeu || '',
    p.recomendaria || '', p.nota || '', p.comentario || ''
  ]);

  return ContentService.createTextOutput(JSON.stringify({ok:true})).setMimeType(ContentService.MimeType.JSON);
}
