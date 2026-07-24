// Local Storage Store for Persistent Reconciliation Job Archives

const STORAGE_KEY = 'iserveu_recon_job_archives_v2';

export const getStoredJobs = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultSeedJobs();
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read stored jobs:', err);
    return getDefaultSeedJobs();
  }
};

export const saveJobToHistory = (job) => {
  try {
    const existing = getStoredJobs();
    // Prepend new job
    const updated = [job, ...existing.filter(j => j.jobId !== job.jobId)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to save job to history:', err);
    return [];
  }
};

export const getJobById = (jobId) => {
  const jobs = getStoredJobs();
  return jobs.find(j => j.jobId === jobId) || null;
};

// Seed default history jobs across various products
function getDefaultSeedJobs() {
  const dateStr = new Date().toISOString().split('T')[0];
  const dateCompact = dateStr.replace(/-/g, '');

  return [
    {
      jobId: `JOB-AEPS-${dateCompact}-8492`,
      productName: 'NSDL AEPS',
      productId: 'nsdlaeps',
      category: 'aeps',
      date: dateStr,
      time: '09:35 AM',
      cycle: 'Cycle 1 (00:00 - 08:00)',
      status: 'COMPLETED',
      totalRecords: 1250,
      matchedCount: 1180,
      mismatchedCount: 70,
      matchRate: '94.4%',
      elapsedTime: '2.1s',
      matchedList: Array.from({ length: 10 }, (_, i) => ({
        'Transaction ID': `TXN_AEPS_${i+1}`,
        'RRN': `612345000${i+1}`,
        'Amount': '500.00',
        'Date': dateStr,
        'Status': 'MATCHED'
      })),
      mismatchedList: Array.from({ length: 5 }, (_, i) => ({
        'Transaction ID': `ERR_AEPS_${i+1}`,
        'RRN': `612345999${i+1}`,
        'Amount': '1250.00',
        'Date': dateStr,
        'Status': 'MISMATCHED',
        'Reason': 'Amount mismatch between NPCI and Switch'
      })),
      productConfig: { id: 'nsdlaeps', name: 'NSDL AEPS' }
    },
    {
      jobId: `JOB-UPI-${dateCompact}-9102`,
      productName: 'Dynamic UPI',
      productId: 'dynamicupi',
      category: 'upi',
      date: dateStr,
      time: '11:15 AM',
      cycle: 'All Cycles (Daily Consolidated)',
      status: 'COMPLETED',
      totalRecords: 3400,
      matchedCount: 3310,
      mismatchedCount: 90,
      matchRate: '97.4%',
      elapsedTime: '3.4s',
      matchedList: Array.from({ length: 10 }, (_, i) => ({
        'Transaction ID': `TXN_UPI_${i+1}`,
        'RRN': `819203000${i+1}`,
        'Amount': '150.00',
        'Date': dateStr,
        'Status': 'MATCHED'
      })),
      mismatchedList: Array.from({ length: 5 }, (_, i) => ({
        'Transaction ID': `ERR_UPI_${i+1}`,
        'RRN': `819203999${i+1}`,
        'Amount': '150.00',
        'Date': dateStr,
        'Status': 'MISMATCHED',
        'Reason': 'Pending response in URCS'
      })),
      productConfig: { id: 'dynamicupi', name: 'Dynamic UPI' }
    },
    {
      jobId: `JOB-MATM-${dateCompact}-4419`,
      productName: 'MATM 4-Way Txn Recon',
      productId: 'matm4way',
      category: 'matm',
      date: dateStr,
      time: '02:40 PM',
      cycle: 'Cycle 2 (08:00 - 16:00)',
      status: 'COMPLETED',
      totalRecords: 890,
      matchedCount: 840,
      mismatchedCount: 50,
      matchRate: '94.4%',
      elapsedTime: '1.8s',
      matchedList: Array.from({ length: 10 }, (_, i) => ({
        'Transaction ID': `TXN_MATM_${i+1}`,
        'RRN': `901234000${i+1}`,
        'Amount': '2000.00',
        'Date': dateStr,
        'Status': 'MATCHED'
      })),
      mismatchedList: Array.from({ length: 5 }, (_, i) => ({
        'Transaction ID': `ERR_MATM_${i+1}`,
        'RRN': `901234999${i+1}`,
        'Amount': '2000.00',
        'Date': dateStr,
        'Status': 'MISMATCHED',
        'Reason': 'Switch status failed'
      })),
      productConfig: { id: 'matm4way', name: 'MATM 4-Way Txn Recon' }
    }
  ];
}
