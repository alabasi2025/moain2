/** Excel export (ADR-0007) — ExcelJS loaded lazily, RTL sheet, bold brand header. */
export async function exportXlsx(filename: string, sheet: string, header: string[], rows: (string | number)[][]) {
  const ExcelJS = (await import('exceljs')).default;
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet(sheet, { views: [{ rightToLeft: true, state: 'frozen', ySplit: 1 }] });
  ws.addRow(header);
  rows.forEach((r) => ws.addRow(r));
  const h = ws.getRow(1);
  h.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  h.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF8B5E3C' } };
  ws.columns.forEach((c) => { c.width = 16; });
  const buf = await wb.xlsx.writeBuffer();
  const url = URL.createObjectURL(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
