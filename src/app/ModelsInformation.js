//import { GoogleSpreadsheet } from 'google-spreadsheet';

/*
export default async function(keywords, spreadsheet_id, service_email, service_key) {
  const tableData = [];

 // const serviceAccountAuth = new JWT({
 //   email: service_email,
 //   key: service_key,
 //   scopes: ['https://www.googleapis.com/auth/spreadsheets'],
 // });

  const doc = new GoogleSpreadsheet(spreadsheet_id);
  await doc.loadInfo(); // loads document properties and worksheets
  const sheet = doc.sheetsByIndex[0];
  const sheetRows = await sheet.getRows();
  for (let i = 0; i < sheetRows.length; i++) {
    let mappedData = {};
    for (let j = 0; j < keywords.length; j++) {
      let keyword = keywords[j];
      mappedData[keyword] = sheetRows[i][keyword];
    }
    tableData.push(mappedData);
  }
  return tableData;
}
*/

export default async function(keywords, spreadsheet_id) {
  const gid = '0';
  const response = await fetch(`https://docs.google.com/spreadsheets/d/${spreadsheet_id}/gviz/tq?tqx=out:json&tq&gid=${gid}`);
  const txt = await response.text();

  const jsonString = txt.match(/(?<="table":).*(?=}\);)/g)[0];
  const json = JSON.parse(jsonString);
  const tableData = [];
  const labelRow = [];
  json.cols.forEach(colonne => labelRow.push(colonne.label));
  const keywordsIndex = [];
  keywords.forEach(key => keywordsIndex.push(labelRow.indexOf(key)));
  const rawTable = [];
  json.rows.forEach(r => {
    const row = []
    r.c.forEach(cel => {
      let value = '';
      try{value = cel.f ? cel.f : cel.v}
      catch(e){value = ''}
      row.push(value)
    })
    rawTable.push(row)
  })
  rawTable.forEach(row => {
    const mappedData = {};
    keywordsIndex.forEach(index => {
      mappedData[labelRow[index]] = row[index];

    });
    tableData.push(mappedData);
  });
  

  return tableData
}
