/**
 * Multi-Sheet Excel Exporter Utility
 * Emits XML Spreadsheet 2003 format (.xls / .xlsx) natively supported by Microsoft Excel,
 * rendering multi-tab workbooks (Summary, Matched, Mismatched) with clean styling.
 */

function escapeXml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function exportMultiSheetExcel(sheetsData = [], filename = 'Reconciliation_Report') {
  let xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="Header">
   <Font ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#0F172A" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
  </Style>

  <Style ss:ID="SummaryHeader">
   <Font ss:Bold="1" ss:Color="#1E293B" ss:Size="12"/>
   <Interior ss:Color="#E2E8F0" ss:Pattern="Solid"/>
  </Style>

  <Style ss:ID="SummaryValue">
   <Font ss:Bold="1" ss:Color="#0F172A" ss:Size="14"/>
   <Alignment ss:Horizontal="Center"/>
  </Style>

  <Style ss:ID="DataCell">
   <Alignment ss:Vertical="Center"/>
  </Style>

  <Style ss:ID="LabelMismatch">
   <Font ss:Bold="1" ss:Color="#991B1B"/>
   <Interior ss:Color="#FEE2E2" ss:Pattern="Solid"/>
  </Style>

  <Style ss:ID="LabelMatched">
   <Font ss:Bold="1" ss:Color="#166534"/>
   <Interior ss:Color="#DCFCE7" ss:Pattern="Solid"/>
  </Style>
 </Styles>
`;

  sheetsData.forEach(sheet => {
    const sheetName = escapeXml(sheet.name || 'Sheet1');
    xml += ` <Worksheet ss:Name="${sheetName}">\n  <Table>\n`;

    if (sheet.type === 'summary') {
      // Summary sheet layout
      xml += `   <Row>\n    <Cell ss:StyleID="SummaryHeader"><Data ss:Type="String">Reconciliation Summary Report</Data></Cell>\n   </Row>\n`;
      xml += `   <Row/>\n`;

      if (sheet.metrics) {
        Object.entries(sheet.metrics).forEach(([key, value]) => {
          xml += `   <Row>\n`;
          xml += `    <Cell><Data ss:Type="String">${escapeXml(key)}</Data></Cell>\n`;
          xml += `    <Cell ss:StyleID="SummaryValue"><Data ss:Type="String">${escapeXml(value)}</Data></Cell>\n`;
          xml += `   </Row>\n`;
        });
      }
    } else {
      // Data sheet (Matched / Mismatched)
      const rows = sheet.data || [];
      if (rows.length > 0) {
        const columns = sheet.columns || Object.keys(rows[0]);

        // Header Row
        xml += `   <Row>\n`;
        columns.forEach(col => {
          xml += `    <Cell ss:StyleID="Header"><Data ss:Type="String">${escapeXml(col)}</Data></Cell>\n`;
        });
        xml += `   </Row>\n`;

        // Data Rows
        rows.forEach(row => {
          xml += `   <Row>\n`;
          columns.forEach(col => {
            let val = row[col];
            if (val === null || val === undefined) val = '';
            
            let style = 'DataCell';
            if (col === 'Label' || col === 'discrepancyReason') {
              style = String(val).toLowerCase().includes('matched') ? 'LabelMatched' : 'LabelMismatch';
            }

            xml += `    <Cell ss:StyleID="${style}"><Data ss:Type="String">${escapeXml(val)}</Data></Cell>\n`;
          });
          xml += `   </Row>\n`;
        });
      } else {
        xml += `   <Row>\n    <Cell><Data ss:Type="String">No records found for this category.</Data></Cell>\n   </Row>\n`;
      }
    }

    xml += `  </Table>\n </Worksheet>\n`;
  });

  xml += `</Workbook>`;

  const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
