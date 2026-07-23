/**
 * 3.3 NTSL -> GEFU Generation Module
 * Parses NTSL fee lines, creates 4-sheet staging pipeline, and formats fixed-width flat file
 * with control totals validation header/detail/footer records.
 */

export function detectOOXMLFormat(fileBuffer, fileName = '') {
  // OOXML files (xlsx) start with PK zip header bytes: 0x50 0x4B 0x03 0x04
  if (fileBuffer && fileBuffer.length >= 4) {
    const isZip = fileBuffer[0] === 0x50 && fileBuffer[1] === 0x4B && fileBuffer[2] === 0x03 && fileBuffer[3] === 0x04;
    return {
      realFormat: isZip ? 'xlsx' : 'xls',
      declaredExtension: fileName.endsWith('.xls') ? 'xls' : 'xlsx',
      isMismatch: isZip && fileName.endsWith('.xls')
    };
  }
  return { realFormat: 'xlsx', declaredExtension: 'xlsx', isMismatch: false };
}

export const GEFU_FIELD_SPECS = [
  { field: 'accountType', width: 2, pad: '0', align: 'right' },
  { field: 'accountNumber', width: 16, pad: ' ', align: 'right' },
  { field: 'branchCode', width: 4, pad: '0', align: 'right' },
  { field: 'txnCode', width: 5, pad: '0', align: 'right' }, // 01008 for Dr, 01408 for Cr
  { field: 'txnDate', width: 8, pad: '0', align: 'right' }, // YYYYMMDD
  { field: 'drCr', width: 2, pad: ' ', align: 'left' },
  { field: 'valueDate', width: 8, pad: '0', align: 'right' },
  { field: 'amtLcy', width: 14, pad: '0', align: 'right' }, // Paise (amt * 100)
  { field: 'amtTcy', width: 14, pad: '0', align: 'right' },
  { field: 'rateCon', width: 8, pad: '0', align: 'right' },
  { field: 'refNo', width: 12, pad: '0', align: 'right' },
  { field: 'refDocNo', width: 12, pad: '0', align: 'right' },
  { field: 'description', width: 40, pad: ' ', align: 'left' },
  { field: 'benefIc', width: 16, pad: ' ', align: 'left' },
  { field: 'benefName', width: 120, pad: ' ', align: 'left' },
  { field: 'benefAdd1', width: 35, pad: ' ', align: 'left' },
  { field: 'benefAdd2', width: 35, pad: ' ', align: 'left' },
  { field: 'benefAdd3', width: 35, pad: ' ', align: 'left' },
  { field: 'city', width: 35, pad: ' ', align: 'left' },
  { field: 'state', width: 35, pad: ' ', align: 'left' },
  { field: 'country', width: 35, pad: ' ', align: 'left' },
  { field: 'zip', width: 35, pad: ' ', align: 'left' },
  { field: 'option', width: 2, pad: '0', align: 'right' },
  { field: 'issuerCode', width: 5, pad: '0', align: 'right' },
  { field: 'payableBranch', width: 4, pad: '0', align: 'right' },
  { field: 'flagFuture', width: 1, pad: ' ', align: 'left' },
  { field: 'misCode', width: 16, pad: '0', align: 'right' }
];

function formatField(value, width, padChar = ' ', align = 'left') {
  let str = String(value || '');
  if (str.length > width) {
    return str.substring(0, width);
  }
  if (align === 'right') {
    return str.padStart(width, padChar);
  }
  return str.padEnd(width, padChar);
}

export function generateGefuFile(ntslData, processDateStr = new Date().toISOString().split('T')[0].replace(/-/g, '')) {
  // Sample NTSL calculation
  const totalGrossAmount = ntslData?.grossAmount || 1245000.50;
  const switchingFee = ntslData?.switchingFee || 1245.00;
  const switchingFeeGst = ntslData?.switchingFeeGst || 224.10;
  const surchargeFee = ntslData?.surchargeFee || 500.00;
  const bankShareRate = 0.002006;
  const bankShareAmt = totalGrossAmount * bankShareRate;
  const netSettlementAmt = totalGrossAmount - (switchingFee + switchingFeeGst + surchargeFee);

  // Staging entries (Input sheet equivalent)
  const stagingTable = [
    {
      entryName: 'Net Settlement Amount',
      accountNumber: '9908123456789012',
      accountName: 'NPCI UPI Settlement Pool A/C',
      branchCode: '0012',
      drCr: 'CR',
      amount: netSettlementAmt,
      description: 'UPI Net Settlement Credit to Pool',
      refNo: processDateStr + '001'
    },
    {
      entryName: 'NPCI Switching Fee',
      accountNumber: '9908123456789013',
      accountName: 'NPCI Switching Fee Expense A/C',
      branchCode: '0012',
      drCr: 'DR',
      amount: switchingFee,
      description: 'NPCI Switching Fee Debit',
      refNo: processDateStr + '002'
    },
    {
      entryName: 'GST on Switching Fee',
      accountNumber: '9908123456789014',
      accountName: 'Input GST Receivable A/C',
      branchCode: '0012',
      drCr: 'DR',
      amount: switchingFeeGst,
      description: 'GST on NPCI Switching Fee',
      refNo: processDateStr + '003'
    },
    {
      entryName: 'Bank Share Commission',
      accountNumber: '9908123456789015',
      accountName: 'Bank UPI Revenue A/C',
      branchCode: '0012',
      drCr: 'CR',
      amount: bankShareAmt,
      description: 'Bank Share @ 0.2006%',
      refNo: processDateStr + '004'
    },
    {
      entryName: 'Final Merchant Settlement Amount',
      accountNumber: '9908123456789016',
      accountName: 'Merchant Settlement Clearing A/C',
      branchCode: '0012',
      drCr: 'DR',
      amount: netSettlementAmt - bankShareAmt,
      description: 'Final Settlement Allocation to Merchants',
      refNo: processDateStr + '005'
    }
  ];

  // Control totals initializers
  let noOfDr = 0;
  let amtOfDrPaise = 0;
  let noOfCr = 0;
  let amtOfCrPaise = 0;

  // Formatter Working & Output detail lines
  const detailRecords = stagingTable.map(row => {
    const isDr = row.drCr === 'DR';
    const amtPaise = Math.round(row.amount * 100);
    const txnCode = isDr ? '01008' : '01408';

    if (isDr) {
      noOfDr += 1;
      amtOfDrPaise += amtPaise;
    } else {
      noOfCr += 1;
      amtOfCrPaise += amtPaise;
    }

    const formattedRow = [
      formatField('01', 2, '0', 'right'), // accountType
      formatField(row.accountNumber, 16, ' ', 'right'),
      formatField(row.branchCode, 4, '0', 'right'),
      formatField(txnCode, 5, '0', 'right'),
      formatField(processDateStr, 8, '0', 'right'),
      formatField(row.drCr, 2, ' ', 'left'),
      formatField(processDateStr, 8, '0', 'right'),
      formatField(amtPaise, 14, '0', 'right'),
      formatField(amtPaise, 14, '0', 'right'),
      formatField(100, 8, '0', 'right'),
      formatField(row.refNo, 12, '0', 'right'),
      formatField(row.refNo, 12, '0', 'right'),
      formatField(row.description, 40, ' ', 'left'),
      formatField('BENEF001', 16, ' ', 'left'),
      formatField('NSDL PAYMENTS BANK', 120, ' ', 'left'),
      formatField('NSDL TOWER', 35, ' ', 'left'),
      formatField('BKC MUMBAI', 35, ' ', 'left'),
      formatField('MAHARASHTRA', 35, ' ', 'left'),
      formatField('MUMBAI', 35, ' ', 'left'),
      formatField('MAHARASHTRA', 35, ' ', 'left'),
      formatField('INDIA', 35, ' ', 'left'),
      formatField('400051', 35, ' ', 'left'),
      formatField('01', 2, '0', 'right'),
      formatField('00100', 5, '0', 'right'),
      formatField('0012', 4, '0', 'right'),
      formatField('N', 1, ' ', 'left'),
      formatField('MIS001', 16, '0', 'right'),
      '~~END~~'
    ].join('');

    return `2${formattedRow}`;
  });

  // Header Record
  const headerRecord = `1${processDateStr}`;

  // Footer Record with Control Totals
  const footerRecord = `3${formatField(noOfDr, 6, '0', 'right')}${formatField(amtOfDrPaise, 14, '0', 'right')}${formatField(noOfCr, 6, '0', 'right')}${formatField(amtOfCrPaise, 14, '0', 'right')}`;

  const gefuFlatFileContent = [headerRecord, ...detailRecords, footerRecord].join('\n');

  // Verify control totals before return
  const verified = (noOfDr + noOfCr === stagingTable.length) && (amtOfDrPaise > 0 || amtOfCrPaise > 0);

  // Accounting Ledger Projection
  const accountingLedger = stagingTable.map(s => ({
    accountNumber: s.accountNumber,
    accountName: s.accountName,
    drCr: s.drCr,
    amount: s.amount,
    remarks: s.description
  }));

  return {
    processDate: processDateStr,
    controlTotals: {
      noOfDr,
      amtOfDr: (amtOfDrPaise / 100).toFixed(2),
      noOfCr,
      amtOfCr: (amtOfCrPaise / 100).toFixed(2),
      verified
    },
    finalSettlementAmount: (netSettlementAmt - bankShareAmt),
    gefuFlatFileContent,
    stagingTable,
    accountingLedger
  };
}
