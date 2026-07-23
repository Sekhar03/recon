/**
 * Multi-Sheet Excel Exporter Utility
 * Emits XML Spreadsheet 2003 format (.xls / .xlsx) natively supported by Microsoft Excel,
 * rendering multi-tab workbooks (Input, Formatter_Working, Output, Field_Formats) with clean styling.
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

  <Style ss:ID="YellowHeader">
   <Font ss:Bold="1" ss:Color="#000000"/>
   <Interior ss:Color="#FFFF00" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
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

  <Style ss:ID="HighlightYellow">
   <Font ss:Bold="1" ss:Color="#000000"/>
   <Interior ss:Color="#FFFF00" ss:Pattern="Solid"/>
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
  link.download = `${filename}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Dedicated GEFU 4-Sheet Excel Workbook Exporter
 */
export function exportGefuExcelWorkbook(jobId = 'JOB-GEFU-20260723') {
  const inputRows = [
    { 'Account Type': '3', 'Account Number': '208100063', 'Branch Code': '8888', 'Txn Code': '1008', 'Txn Date': '30/06/2025', 'Dr / Cr': 'D', 'Value Date': '30/06/2025', 'Txn CCY': '1', 'Amt LCY': '266618.30', 'Amt TCY': '266618.30', 'Rate Con': '1.00', 'Ref No': '0', 'Ref Doc No': '0', 'Transaction Description': 'UPI_NPT_FinalSettledAmt_7C_300625', 'Option': '30', '~~END~~': '~~END~~', 'Issuer Code': '00000', 'Payable Branch': '0000', 'Flag Future dated': 'N', 'Mis Code': '0000000000000000' },
    { 'Account Type': '3', 'Account Number': '208100064', 'Branch Code': '8888', 'Txn Code': '1408', 'Txn Date': '30/06/2025', 'Dr / Cr': 'C', 'Value Date': '30/06/2025', 'Txn CCY': '1', 'Amt LCY': '266618.30', 'Amt TCY': '266618.30', 'Rate Con': '1.00', 'Ref No': '0', 'Ref Doc No': '0', 'Transaction Description': 'UPI_NPT_FinalSettledAmt_7C_300625', 'Option': '30', '~~END~~': '~~END~~', 'Issuer Code': '00000', 'Payable Branch': '0000', 'Flag Future dated': 'N', 'Mis Code': '0000000000000000' }
  ];

  const outputRows = [
    { 'Record Type': 'Header', 'Length': '9', 'Message': '120250630' },
    { 'Record Type': 'Detail', 'Length': '559', 'Message': '203  40421004588880100820250630D2025063000001000000000446600000000004466000000100000000000000000000000000Switching Fees_7C_300625' },
    { 'Record Type': 'Footer', 'Length': '49', 'Message': '3000000009000001079036217000000014000001079036217' }
  ];

  const fieldFormatsRows = [
    { 'Fields': 'Txn Type', 'Sample CASA Value': '1', 'Sample GL Value': '3', 'Validations': 'Must be 1 for CASA and 3 for GL', 'Mandatory': 'Y' },
    { 'Fields': 'Account Number', 'Sample CASA Value': '501000000794', 'Sample GL Value': '208100011', 'Validations': 'Number only', 'Mandatory': 'Y' }
  ];

  exportMultiSheetExcel([
    { name: 'Input', type: 'data', data: inputRows },
    { name: 'Output', type: 'data', data: outputRows },
    { name: 'Field_Formats', type: 'data', data: fieldFormatsRows }
  ], `GEFU_File_${jobId}`);
}

/**
 * Dedicated GEFU Accounting File Excel Exporter matching exact screenshot layout
 */
export function exportGefuAccountingExcel(jobId = 'JOB-GEFU-20260723') {
  const columns = ['Account Number', 'Account Name', 'Debit / Credit', 'Amount', 'Remarks', 'Source'];

  const rows = [
    { 'Account Number': '208100063', 'Account Name': 'RBI Mirror Account', 'Debit / Credit': 'Debit', 'Amount': '265.18', 'Remarks': 'UPI_NPT_FinalSettledAmt_6C_050625', 'Source': 'NPCI NTSL' },
    { 'Account Number': '208100472', 'Account Name': 'SL-UPI ACQUIRING PAYABLE-MERCHANT SETTLEMENT', 'Debit / Credit': 'Credit', 'Amount': '265.18', 'Remarks': 'UPI_NPT_FinalSettledAmt_6C_050625', 'Source': 'NPCI NTSL' },
    { 'Account Number': '208100472', 'Account Name': 'SL-UPI ACQUIRING PAYABLE-MERCHANT SETTLEMENT', 'Debit / Credit': 'Debit', 'Amount': '265.18', 'Remarks': 'UPI_NPT_FinalSettledAmt_6C_050625', 'Source': 'NPCI NTSL' },
    { 'Account Number': '404210045', 'Account Name': 'GC-INTERCHANGE CHARGES-UPI', 'Debit / Credit': 'Debit', 'Amount': '-', 'Remarks': 'Switching Fees', 'Source': 'NPCI NTSL' },
    { 'Account Number': '114180001', 'Account Name': 'CGST 9% INPUT TAX CREDIT', 'Debit / Credit': 'Debit', 'Amount': '-', 'Remarks': 'GST on Switching Fees', 'Source': 'NPCI NTSL' },
    { 'Account Number': '114180006', 'Account Name': 'SGST 9% INPUT CREDIT', 'Debit / Credit': 'Debit', 'Amount': '-', 'Remarks': 'GST on Switching Fees', 'Source': 'NPCI NTSL' },
    { 'Account Number': '404210045', 'Account Name': 'GC-INTERCHANGE CHARGES-UPI', 'Debit / Credit': 'Credit', 'Amount': '-', 'Remarks': 'Switching Fees', 'Source': 'NPCI NTSL' },
    { 'Account Number': '114180001', 'Account Name': 'CGST 9% INPUT TAX CREDIT', 'Debit / Credit': 'Credit', 'Amount': '-', 'Remarks': 'GST on Switching Fees', 'Source': 'NPCI NTSL' },
    { 'Account Number': '114180006', 'Account Name': 'SGST 9% INPUT CREDIT', 'Debit / Credit': 'Credit', 'Amount': '-', 'Remarks': 'GST on Switching Fees', 'Source': 'NPCI NTSL' },
    { 'Account Number': '302110017', 'Account Name': 'COMM-UPI', 'Debit / Credit': 'Debit', 'Amount': '-', 'Remarks': 'Switching Fees', 'Source': 'NPCI NTSL' },
    { 'Account Number': '208080061', 'Account Name': 'SL-CENTRAL GST PAYABLE', 'Debit / Credit': 'Debit', 'Amount': '-', 'Remarks': 'GST on Switching Fees', 'Source': 'NPCI NTSL' },
    { 'Account Number': '208080062', 'Account Name': 'SL-STATE GST PAYABLE', 'Debit / Credit': 'Debit', 'Amount': '-', 'Remarks': 'GST on Switching Fees', 'Source': 'NPCI NTSL' },
    { 'Account Number': '302110017', 'Account Name': 'COMM-UPI', 'Debit / Credit': 'Credit', 'Amount': '-', 'Remarks': 'Switching Fees', 'Source': 'NPCI NTSL' },
    { 'Account Number': '208080061', 'Account Name': 'SL-CENTRAL GST PAYABLE', 'Debit / Credit': 'Credit', 'Amount': '-', 'Remarks': 'GST on Switching Fees', 'Source': 'NPCI NTSL' },
    { 'Account Number': '208080062', 'Account Name': 'SL-STATE GST PAYABLE', 'Debit / Credit': 'Credit', 'Amount': '-', 'Remarks': 'GST on Switching Fees', 'Source': 'NPCI NTSL' },
    { 'Account Number': '302110017', 'Account Name': 'COMM-UPI', 'Debit / Credit': 'Credit', 'Amount': '0.45', 'Remarks': 'UPI Acquiring - IserveU_6C_050625', 'Source': '17 bps' },
    { 'Account Number': '208080061', 'Account Name': 'SL-CENTRAL GST PAYABLE', 'Debit / Credit': 'Credit', 'Amount': '0.04', 'Remarks': 'UPI Acquiring GST on Fees_6C_050625', 'Source': '' },
    { 'Account Number': '208080062', 'Account Name': 'SL-STATE GST PAYABLE', 'Debit / Credit': 'Credit', 'Amount': '0.04', 'Remarks': 'UPI Acquiring GST on Fees_6C_050625', 'Source': '' },
    { 'Account Number': '502003805716', 'Account Name': 'ISERVEU TECHNOLOGY PRIVATE LIMITED', 'Debit / Credit': 'Credit', 'Amount': '-', 'Remarks': '', 'Source': '' },
    { 'Account Number': '502003806105', 'Account Name': 'NSDL PAYMENTS BANK LIMITED', 'Debit / Credit': 'Credit', 'Amount': '264.65', 'Remarks': 'UPI_NPT_FinalSettledAmt_6C_050625', 'Source': 'NPCI NTSL' },
    { 'Account Number': '502003805716', 'Account Name': 'ISERVEU TECHNOLOGY PRIVATE LIMITED', 'Debit / Credit': 'Debit', 'Amount': '-', 'Remarks': 'Dispute Adjustment Amount', 'Source': 'NPCI NTSL' },
    { 'Account Number': '502003805716', 'Account Name': 'ISERVEU TECHNOLOGY PRIVATE LIMITED', 'Debit / Credit': 'Credit', 'Amount': '-', 'Remarks': 'Representement Adjustment Amount', 'Source': 'NPCI NTSL' },
    { 'Account Number': '******', 'Account Name': 'Fees Account', 'Debit / Credit': 'Credit/Debit', 'Amount': '-', 'Remarks': 'Adjusted Fee', 'Source': 'NPCI NTSL' },
    { 'Account Number': '******', 'Account Name': 'GST Account', 'Debit / Credit': 'Credit/Debit', 'Amount': '-', 'Remarks': 'Adjusted Fee with Tax', 'Source': 'NPCI NTSL' }
  ];

  let xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="YellowHeader">
   <Font ss:Bold="1" ss:Color="#000000"/>
   <Interior ss:Color="#FFFF00" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="DataCell">
   <Alignment ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="HighlightYellow">
   <Font ss:Bold="1" ss:Color="#000000"/>
   <Interior ss:Color="#FFFF00" ss:Pattern="Solid"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="GEFU_Accounting_Ledger">
  <Table>
   <Row>
`;

  columns.forEach(col => {
    xml += `    <Cell ss:StyleID="YellowHeader"><Data ss:Type="String">${escapeXml(col)}</Data></Cell>\n`;
  });
  xml += `   </Row>\n`;

  rows.forEach(row => {
    xml += `   <Row>\n`;
    columns.forEach(col => {
      let val = row[col] || '';
      let style = 'DataCell';
      if (row['Account Number'] === '502003806105' && col === 'Amount') {
        style = 'HighlightYellow';
      }
      xml += `    <Cell ss:StyleID="${style}"><Data ss:Type="String">${escapeXml(val)}</Data></Cell>\n`;
    });
    xml += `   </Row>\n`;
  });

  xml += `  </Table>\n </Worksheet>\n</Workbook>`;

  const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `GEFU_Accounting_${jobId}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
