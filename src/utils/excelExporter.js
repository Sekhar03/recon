/**
 * Helper utility for exporting reconciliation datasets directly into Excel-compatible files (.csv/.xls)
 */

export function exportToExcel(data = [], filename = 'Reconciliation_Report', columns = null) {
  if (!data || data.length === 0) {
    alert("No data available to export.");
    return;
  }

  // Determine headers
  const headers = columns || Object.keys(data[0]);

  // Construct CSV content with UTF-8 BOM for Excel compatibility
  const csvRows = [];
  csvRows.push(headers.join(','));

  data.forEach(row => {
    const values = headers.map(header => {
      let val = row[header];
      if (val === null || val === undefined) val = '';
      const strVal = String(val).replace(/"/g, '""');
      return `"${strVal}"`;
    });
    csvRows.push(values.join(','));
  });

  const csvString = '\uFEFF' + csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
