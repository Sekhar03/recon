// Local Storage Store for Persistent Reconciliation Job Archives

const STORAGE_KEY = 'iserveu_recon_job_archives_v1';

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

// Seed default history jobs if empty
function getDefaultSeedJobs() {
  const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
  return [
    {
      jobId: `JOB-UPI-${dateStr}-8492`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: '09:35 AM',
      cycle: 'Cycle 1 (09:30 AM)',
      status: 'COMPLETED',
      matchedCount: 285,
      mismatchedCount: 15,
      matchRate: '95.0%',
      netSettlement: '710,678.84',
      payoutRowCount: 2,
      matchedList: Array.from({ length: 15 }, (_, i) => ({
        'Transaction ID': `TXN_SEED_${i+1}`,
        'RRN': `612345${String(i+1).padStart(6, '0')}`,
        'Payer VPA': `user${i+1}@upi`,
        'Payee VPA': 'merchant@iserveu',
        'Amount': '2500.00',
        'NPCI Status': 'Success',
        'Switch Status': 'Success',
        'MW Status': 'Success',
        'Wallet Status': 'Success',
        'Status': 'Matched'
      })),
      mismatchedList: [
        { 'Transaction ID': 'TXN_ERR_01', 'RRN': '612345999001', 'Payer VPA': 'payer1@upi', 'Payee VPA': 'merchant@iserveu', 'Amount': '1500.00', 'NPCI Status': 'Pending', 'Switch Status': 'Success', 'MW Status': 'Success', 'Wallet Status': 'Success', 'Label': 'Credit adjustment likely needed', 'Notes': 'Pending response code in URCS' }
      ],
      gefuFlatFileContent: 'HDR20260723NSDL0000001\nDTL501001234DR00000002500000PAYMENT\nFTR00000100000002500000',
      gefuAccountingLedger: [
        { 'Account Number': '501001234', 'Dr/Cr': 'DR', 'Amount': 2500.00, 'Narration': 'UPI Settlement Net' }
      ],
      settlementRows: [
        { userName: 'merchant_01', count: 285, txnAmount: 712500.00, interchange: 356.25, switchingFee: 35.63, bankShare: 1429.28, netSettlement: 710678.84 }
      ],
      payoutRows: [
        { clientReferenceNo: 'PO_merchant_01_01', username: 'merchant_01', beneName: 'Merchant Store', beneAccountNo: '501001234', beneifsc: 'HDFC0001234', paramA: 'UPI_SETTL_REM', amount: '210678.84' },
        { clientReferenceNo: 'PO_merchant_01_02', username: 'merchant_01', beneName: 'Merchant Store', beneAccountNo: '501001234', beneifsc: 'HDFC0001234', paramA: 'UPI_SETTL_MAX', amount: '500000.00' }
      ]
    }
  ];
}
