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

// ─── MAIN RECONCILIATION RUNNER ───

/**
 * Run the full reconciliation for a product given its config and uploaded files
 * 
 * @param {Object} productConfig - product configuration from productConfigs.js
 * @param {Object} uploadedFiles - { sourceKey: File } map of uploaded files
 * @param {Function} onProgress - callback(stepIndex, stepName, status) for progress updates
 * @returns {Object} { summary, matchedData, mismatchedData, allData }
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

    // Compare
    merged = compareColumns(merged, step.comparisons, step.statusDescCol, step.statusCol);

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
 * Export match and mismatch data as separate sheets in one workbook
 */
export function exportReconResults(matchedData, mismatchedData, productConfig) {
  const workbook = XLSX.utils.book_new();

  if (matchedData.length > 0) {
    const matchSheet = XLSX.utils.json_to_sheet(matchedData);
    XLSX.utils.book_append_sheet(workbook, matchSheet, 'Matched');
  }

  if (mismatchedData.length > 0) {
    const mismatchSheet = XLSX.utils.json_to_sheet(mismatchedData);
    XLSX.utils.book_append_sheet(workbook, mismatchSheet, 'Mismatched');
  }

  const filename = `${productConfig.id}_recon_${new Date().toISOString().split('T')[0]}`;
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}
