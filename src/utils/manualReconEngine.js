/**
 * Manual Reconciliation Engine
 * Client-side file parsing, merging, comparing, and match/mismatch generation
 * Follows the exact flow from ISU Recon documentation
 */
import * as XLSX from 'xlsx';

// ─── FILE PARSING ───

/**
 * Parse an uploaded file (Excel or CSV) into an array of row objects
 */
export async function parseFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        const firstSheet = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheet];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
        resolve(jsonData);
      } catch (err) {
        reject(new Error(`Failed to parse file "${file.name}": ${err.message}`));
      }
    };
    reader.onerror = () => reject(new Error(`Failed to read file "${file.name}"`));
    reader.readAsArrayBuffer(file);
  });
}

// ─── COLUMN OPERATIONS ───

/**
 * Add suffix to all column names, then rename merge key back to common name
 */
export function addSuffix(data, suffix, mergeColOriginal, mergeColCommon) {
  if (!data || data.length === 0) return [];
  return data.map(row => {
    const newRow = {};
    for (const [key, value] of Object.entries(row)) {
      if (key === mergeColOriginal) {
        // Keep the merge key as-is (common name) AND add suffixed version
        newRow[mergeColCommon || mergeColOriginal] = value;
        newRow[key + suffix] = value;
      } else {
        newRow[key + suffix] = value;
      }
    }
    return newRow;
  });
}

// ─── MERGING ───

/**
 * Merge two datasets (outer or left join) on a common key
 * Mimics pandas: pd.merge(left, right, on=key, how='outer'|'left')
 */
export function mergeDatasets(leftData, rightData, mergeKey, how = 'outer') {
  const rightMap = new Map();

  // Build a map from the right dataset by merge key
  rightData.forEach(row => {
    const keyVal = String(row[mergeKey] ?? '').trim();
    if (keyVal) {
      if (!rightMap.has(keyVal)) {
        rightMap.set(keyVal, []);
      }
      rightMap.get(keyVal).push(row);
    }
  });

  const merged = [];
  const matchedRightKeys = new Set();

  // Process left rows
  leftData.forEach(leftRow => {
    const keyVal = String(leftRow[mergeKey] ?? '').trim();
    const rightRows = rightMap.get(keyVal);

    if (rightRows && rightRows.length > 0) {
      rightRows.forEach(rightRow => {
        merged.push({ ...leftRow, ...rightRow });
      });
      matchedRightKeys.add(keyVal);
    } else {
      merged.push({ ...leftRow });
    }
  });

  // For outer join, add unmatched right rows
  if (how === 'outer') {
    rightData.forEach(rightRow => {
      const keyVal = String(rightRow[mergeKey] ?? '').trim();
      if (keyVal && !matchedRightKeys.has(keyVal)) {
        merged.push({ ...rightRow });
      }
    });
  }

  return merged;
}

/**
 * Three-way merge: merge left + right on key1, then merge result + third on key1
 */
export function threeWayMerge(leftData, rightData, thirdData, mergeKey, how = 'outer') {
  const step1 = mergeDatasets(leftData, rightData, mergeKey, how);
  const step2 = mergeDatasets(step1, thirdData, mergeKey, how);
  return step2;
}

// ─── COMPARISON ───

/**
 * Compare columns and generate final_status_description and final_status
 * Following the documentation pattern:
 * - If all matched → final_status_description = null, final_status = 'match'
 * - If any mismatch → final_status_description = mismatched column names, final_status = 'mismatch'
 */
export function compareColumns(mergedData, comparisons, statusDescCol, statusCol) {
  return mergedData.map(row => {
    const mismatches = [];

    comparisons.forEach(comp => {
      const leftVal = normalizeValue(row[comp.leftCol]);
      const rightVal = normalizeValue(row[comp.rightCol]);

      // Also check third column if it exists (3-way comparison)
      if (comp.thirdCol) {
        const thirdVal = normalizeValue(row[comp.thirdCol]);
        // All three must match
        if (leftVal !== rightVal || leftVal !== thirdVal || rightVal !== thirdVal) {
          mismatches.push(comp.label);
        }
      } else {
        // Two-way comparison
        if (leftVal !== rightVal) {
          mismatches.push(comp.label);
        }
      }
    });

    // Handle case where one side is entirely missing (no data for that key)
    const hasLeftData = comparisons.some(c => row[c.leftCol] !== undefined && row[c.leftCol] !== '');
    const hasRightData = comparisons.some(c => row[c.rightCol] !== undefined && row[c.rightCol] !== '');

    let statusDesc = null;
    let status = 'match';

    if (!hasLeftData || !hasRightData) {
      // One side missing entirely — mark as mismatch with "missing" note
      statusDesc = !hasLeftData ? 'Missing in Source 1' : 'Missing in Source 2';
      status = 'mismatch';
    } else if (mismatches.length > 0) {
      statusDesc = mismatches.join(' ');
      status = 'mismatch';
    }

    return {
      ...row,
      [statusDescCol]: statusDesc,
      [statusCol]: status,
    };
  });
}

/**
 * Normalize a value for comparison
 */
function normalizeValue(val) {
  if (val === undefined || val === null || val === '') return '';
  let str = String(val).trim().toUpperCase();
  // Remove trailing .0 from numbers
  if (/^\d+\.0+$/.test(str)) {
    str = str.replace(/\.0+$/, '');
  }
  return str;
}

// ─── CONCAT SOURCES ───

/**
 * Concatenate multiple source datasets into one (like pd.concat)
 * Used for products like wallet2cashout where isu1 + isu2 are combined
 */
export function concatDatasets(datasets) {
  return datasets.flat();
}

// ─── SPECIALIZED BBPS CLASSIFIERS ───

/**
 * BBPS COU Classification Engine (Bank of Baroda / BB11)
 * Reports: Match Report (CBS+COU+NPCI Success & Amt Match), Reversal Report (CBS present, COU/NPCI Failed), Exception Report (Missing in CBS or COU/NPCI)
 */
export function classifyBbpsCou(mergedData) {
  return mergedData.map(row => {
    const cbsStatus = String(row['Status_cbs'] || row['status_cbs'] || 'SUCCESS').toUpperCase();
    const couStatus = String(row['Status_cou'] || row['status_cou'] || '').toUpperCase();
    const npciStatus = String(row['Status_npci'] || row['status_npci'] || '').toUpperCase();

    const hasCbs = !!(row['TxnRefID_cbs'] || row['Status_cbs'] || row['Amount_cbs']);
    const hasCou = !!(row['TxnRefID_cou'] || row['Status_cou'] || row['Amount_cou']);
    const hasNpci = !!(row['TxnRefID_npci'] || row['Status_npci'] || row['Amount_npci']);

    const cbsAmt = normalizeValue(row['Amount_cbs'] || row['amount_cbs']);
    const couAmt = normalizeValue(row['Amount_cou'] || row['amount_cou']);
    const npciAmt = normalizeValue(row['Amount_npci'] || row['amount_npci']);

    const amountMatch = cbsAmt === couAmt && cbsAmt === npciAmt;

    let reconStatus = 'match';
    let statusCategory = 'Match Report';
    let statusDesc = 'Fully reconciled – eligible for settlement';

    if (hasCbs && (couStatus === 'FAILED' || npciStatus === 'FAILED' || couStatus === 'FAILURE' || npciStatus === 'FAILURE')) {
      reconStatus = 'mismatch';
      statusCategory = 'Reversal Report';
      statusDesc = 'Failed in COU system or NPCI - Initiate Customer Refund';
    } else if (!hasCbs || !hasCou || !hasNpci || !amountMatch) {
      reconStatus = 'mismatch';
      statusCategory = 'Exception Report';
      if (!hasCbs) statusDesc = 'Scenario A: Present in COU/NPCI but missing in CBS (Finacle)';
      else if (!hasCou || !hasNpci) statusDesc = 'Scenario B: Present in CBS (Finacle) but missing in COU/NPCI';
      else statusDesc = 'Amount mismatch across CBS, COU, or NPCI';
    } else if (cbsStatus === 'SUCCESS' && (couStatus === 'SUCCESS' || couStatus === '') && (npciStatus === 'SUCCESS' || npciStatus === '') && amountMatch) {
      reconStatus = 'match';
      statusCategory = 'Match Report';
      statusDesc = 'Fully reconciled – eligible for settlement';
    }

    return {
      ...row,
      final_status_cou: reconStatus,
      status_category: statusCategory,
      final_status_description: statusDesc
    };
  });
}

/**
 * BBPS BOU Classification Engine (Payment MTI)
 * Reports: SUCCESS (Rule 1), FAILED (Rule 2), PENDING (Rule 3 - Repush eligible), EXCEPTION (Rules 4 & 5)
 */
export function classifyBbpsBou(mergedData) {
  return mergedData.map(row => {
    const mti = String(row['MTI'] || row['mti'] || row['MTI_npci'] || 'PAYMENT').toUpperCase();

    const npciStatus = String(row['Status_npci'] || row['status_npci'] || '').toUpperCase();
    const switchStatus = String(row['Status_switch'] || row['status_switch'] || '').toUpperCase();
    const mwStatus = String(row['Status_mw'] || row['status_mw'] || '').toUpperCase();

    const hasNpci = !!(row['TxnRefID_npci'] || row['Status_npci'] || row['Amount_npci']);
    const hasSwitch = !!(row['TxnRefID_switch'] || row['Status_switch'] || row['Amount_switch']);
    const hasMw = !!(row['TxnRefID_mw'] || row['Status_mw'] || row['Amount_mw']);

    const npciAmt = normalizeValue(row['Amount_npci'] || row['amount_npci']);
    const switchAmt = normalizeValue(row['Amount_switch'] || row['amount_switch']);
    const mwAmt = normalizeValue(row['Amount_mw'] || row['amount_mw']);

    let reconStatus = 'match';
    let statusCategory = 'SUCCESS';
    let statusDesc = 'Rule 1: Fully matched across NPCI, BOU Switch, and MW';

    // Rule 2: NPCI status = FAILED
    if (npciStatus === 'FAILED' || npciStatus === 'FAILURE' || npciStatus === 'REJECTED') {
      reconStatus = 'mismatch';
      statusCategory = 'FAILED';
      statusDesc = 'Rule 2: NPCI rejected the transaction (Final Failure - No Repush)';
    }
    // Rule 4: Missing from NPCI file entirely but record exists as SUCCESS in BOU Switch or MW
    else if (!hasNpci && ((hasSwitch && switchStatus === 'SUCCESS') || (hasMw && mwStatus === 'SUCCESS'))) {
      reconStatus = 'mismatch';
      statusCategory = 'EXCEPTION';
      statusDesc = 'Rule 4: Missing in NPCI settlement file but SUCCESS in BOU Switch/MW';
    }
    // Rule 5: Amount mismatch between NPCI and BOU Switch or MW
    else if (hasNpci && ((hasSwitch && npciAmt !== switchAmt) || (hasMw && npciAmt !== mwAmt))) {
      reconStatus = 'mismatch';
      statusCategory = 'EXCEPTION';
      statusDesc = 'Rule 5: Amount mismatch between NPCI and BOU Switch or MW';
    }
    // Rule 1: All 3 present + All SUCCESS + Amount matches
    else if (npciStatus === 'SUCCESS' && (switchStatus === 'SUCCESS' || !hasSwitch) && (mwStatus === 'SUCCESS' || !hasMw) && npciAmt === switchAmt) {
      reconStatus = 'match';
      statusCategory = 'SUCCESS';
      statusDesc = 'Rule 1: Fully matched across NPCI, BOU Switch, and MW';
    }
    // Rule 3: NPCI = SUCCESS + BOU Switch or MW is Failed, Pending, or Missing
    else if (npciStatus === 'SUCCESS' && (switchStatus !== 'SUCCESS' || mwStatus !== 'SUCCESS' || !hasSwitch || !hasMw)) {
      reconStatus = 'mismatch';
      statusCategory = 'PENDING';
      statusDesc = 'Rule 3: Funds settled NPCI but biller posting pending/failed (Eligible for Repush @ 05:30 AM)';
    }

    return {
      ...row,
      final_status_bou: reconStatus,
      status_category: statusCategory,
      final_status_description: statusDesc,
      mti_type: mti
    };
  });
}

// ─── MAIN RECONCILIATION RUNNER ───

/**
 * Run the full reconciliation for a product given its config and uploaded files
 */
export async function runRecon(productConfig, uploadedFiles, onProgress = () => {}) {
  const startTime = Date.now();

  // 1. Parse all uploaded files
  onProgress(0, 'Parsing uploaded files...', 'processing');
  const parsedFiles = {};

  for (const source of productConfig.sources) {
    if (uploadedFiles[source.key]) {
      try {
        parsedFiles[source.key] = await parseFile(uploadedFiles[source.key]);
        onProgress(0, `Parsed ${source.label}: ${parsedFiles[source.key].length} rows`, 'info');
      } catch (err) {
        onProgress(0, `Error parsing ${source.label}: ${err.message}`, 'error');
        parsedFiles[source.key] = [];
      }
    } else if (source.required) {
      onProgress(0, `Missing required file: ${source.label}`, 'error');
      parsedFiles[source.key] = [];
    } else {
      parsedFiles[source.key] = [];
    }
  }

  // 2. Handle concatenation if needed (e.g., isu1 + isu2)
  if (productConfig.concatSources) {
    const { target, from } = productConfig.concatSources;
    const datasets = from.map(key => parsedFiles[key] || []);
    parsedFiles[target] = concatDatasets(datasets);
    onProgress(0, `Concatenated ${from.join(' + ')}: ${parsedFiles[target].length} rows`, 'info');
  }

  // 3. Run each step
  let mergedData = null;
  let separateOutputs = [];
  const stepResults = [];

  for (let i = 0; i < productConfig.steps.length; i++) {
    const step = productConfig.steps[i];

    // Skip optional steps if source file not provided
    if (step.optional && step.rightSource && (!parsedFiles[step.rightSource] || parsedFiles[step.rightSource].length === 0)) {
      onProgress(i + 1, `Skipping "${step.name}" — optional file not provided`, 'skipped');
      continue;
    }

    onProgress(i + 1, `${step.name}...`, 'processing');

    // Get left data
    let leftData;
    if (step.leftSource === '_merged') {
      leftData = mergedData || [];
    } else {
      leftData = parsedFiles[step.leftSource] || [];
      // Add suffix to left data
      if (step.leftSuffix) {
        leftData = addSuffix(leftData, step.leftSuffix, step.leftMergeCol, step.mergeKey);
      }
    }

    // Get right data
    let rightData = parsedFiles[step.rightSource] || [];
    if (step.rightSuffix) {
      rightData = addSuffix(rightData, step.rightSuffix, step.rightMergeCol, step.mergeKey);
    }

    // Merge
    let merged;
    if (step.isThreeWay && step.thirdSource) {
      let thirdData = parsedFiles[step.thirdSource] || [];
      if (step.thirdSuffix) {
        thirdData = addSuffix(thirdData, step.thirdSuffix, step.thirdMergeCol, step.mergeKey);
      }
      merged = threeWayMerge(leftData, rightData, thirdData, step.mergeKey, step.mergeHow);
    } else {
      merged = mergeDatasets(leftData, rightData, step.mergeKey, step.mergeHow);
    }

    onProgress(i + 1, `Merged: ${merged.length} rows. Comparing columns...`, 'processing');

    // Compare or Custom Classification
    if (productConfig.customClassification === 'classifyBbpsCou') {
      merged = classifyBbpsCou(merged);
    } else if (productConfig.customClassification === 'classifyBbpsBou') {
      merged = classifyBbpsBou(merged);
    } else {
      merged = compareColumns(merged, step.comparisons, step.statusDescCol, step.statusCol);
    }

    if (step.isSeparateOutput) {
      // For POS-style separate outputs (cashout + nodal)
      const matched = merged.filter(r => r[step.statusCol] === 'match');
      const mismatched = merged.filter(r => r[step.statusCol] === 'mismatch');
      separateOutputs.push({
        name: step.name,
        matched,
        mismatched,
        total: merged.length,
      });
    } else {
      mergedData = merged;
    }

    stepResults.push({
      stepName: step.name,
      totalRows: merged.length,
      statusCol: step.statusCol,
    });

    onProgress(i + 1, `"${step.name}" complete — ${merged.length} rows processed`, 'completed');
  }

  // 4. Split final results
  const finalStatusCol = productConfig.finalStatusCol;
  const allData = mergedData || [];
  const matchedData = allData.filter(row => row[finalStatusCol] === 'match');
  const mismatchedData = allData.filter(row => row[finalStatusCol] === 'mismatch');

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  onProgress(productConfig.steps.length + 1, `Reconciliation complete in ${elapsed}s`, 'completed');

  return {
    summary: {
      totalRecords: allData.length,
      matched: matchedData.length,
      mismatched: mismatchedData.length,
      matchRate: allData.length > 0 ? ((matchedData.length / allData.length) * 100).toFixed(1) + '%' : '0%',
      elapsedTime: elapsed + 's',
    },
    matchedData,
    mismatchedData,
    allData,
    separateOutputs,
    stepResults,
    productConfig,
  };
}

// ─── EXPORT TO EXCEL ───

/**
 * Export data array to an Excel file and trigger download
 */
export function exportToExcel(data, filename) {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

  // Auto-width columns
  const colWidths = Object.keys(data[0]).map(key => ({
    wch: Math.max(key.length, ...data.slice(0, 100).map(row => String(row[key] || '').length)) + 2
  }));
  worksheet['!cols'] = colWidths;

  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

/**
 * Export match, mismatch, reversal, pending, and exception reports as separate sheets in one workbook
 */
export function exportReconResults(matchedData, mismatchedData, productConfig, allData = []) {
  const workbook = XLSX.utils.book_new();
  const dataset = (allData && allData.length > 0) ? allData : [...(matchedData || []), ...(mismatchedData || [])];

  if (productConfig.id === 'bbpscou') {
    // BBPS COU PRD: Match Report, Reversal Report, Exception Report
    const matchReport = dataset.filter(r => r.status_category === 'Match Report' || r.final_status_cou === 'match');
    const reversalReport = dataset.filter(r => r.status_category === 'Reversal Report');
    const exceptionReport = dataset.filter(r => r.status_category === 'Exception Report' || (r.final_status_cou === 'mismatch' && r.status_category !== 'Reversal Report'));

    if (matchReport.length > 0) {
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(matchReport), 'Match Report');
    }
    if (reversalReport.length > 0) {
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(reversalReport), 'Reversal Report');
    }
    if (exceptionReport.length > 0) {
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(exceptionReport), 'Exception Report');
    }
  } else if (productConfig.id === 'bbpsbou') {
    // BBPS BOU PRD: SUCCESS Report, FAILED Report, PENDING Report (Repush), EXCEPTION Report
    const successReport = dataset.filter(r => r.status_category === 'SUCCESS' || r.final_status_bou === 'match');
    const failedReport = dataset.filter(r => r.status_category === 'FAILED');
    const pendingReport = dataset.filter(r => r.status_category === 'PENDING');
    const exceptionReport = dataset.filter(r => r.status_category === 'EXCEPTION');

    if (successReport.length > 0) {
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(successReport), 'SUCCESS Report');
    }
    if (failedReport.length > 0) {
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(failedReport), 'FAILED Report (No Repush)');
    }
    if (pendingReport.length > 0) {
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(pendingReport), 'PENDING Report (Repush @05:30)');
    }
    if (exceptionReport.length > 0) {
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(exceptionReport), 'EXCEPTION Report');
    }
  } else {
    // Standard products: Matched & Mismatched
    if (matchedData && matchedData.length > 0) {
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(matchedData), 'Matched');
    }
    if (mismatchedData && mismatchedData.length > 0) {
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(mismatchedData), 'Mismatched');
    }
  }

  const filename = `${productConfig.id}_recon_${new Date().toISOString().split('T')[0]}`;
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}
