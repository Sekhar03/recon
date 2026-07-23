import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

// Mock Data Initial State
let jobs = [
  { jobId: 'RECON-10492', product: 'mATM', bank: 'NSDL', date: '2026-04-07', cycle: '3', status: 'completed', progress: 100, user: 'Finance Exec', rate: '98.7%', results: { total: 10240, matched: 10105, mismatched: 135, rate: '98.7%' }, createdAt: new Date('2026-04-07T10:00:00').toISOString() },
  { jobId: 'RECON-10491', product: 'AePS', bank: 'IPPB', date: '2026-04-07', cycle: '2', status: 'completed', progress: 100, user: 'Logic Engineer', rate: '98.9%', results: { total: 8500, matched: 8410, mismatched: 90, rate: '98.9%' }, createdAt: new Date('2026-04-07T11:30:00').toISOString() },
  { jobId: 'RECON-10490', product: 'DMT', bank: 'Airtel', date: '2026-04-07', cycle: 'N/A', status: 'failed', progress: 45, user: 'Finance Exec', rate: '0%', createdAt: new Date('2026-04-07T14:20:00').toISOString(), error: 'Upstream Timeout (MN)' },
  { jobId: 'RECON-10489', product: 'mATM', bank: 'IPPB', date: '2026-04-06', cycle: '10', status: 'completed', progress: 100, user: 'system', rate: '99.8%', results: { total: 12000, matched: 11980, mismatched: 20, rate: '99.8%' }, createdAt: new Date('2026-04-06T09:15:00').toISOString() },
  { jobId: 'RECON-10488', product: 'AePS', bank: 'NSDL', date: '2026-04-06', cycle: '1', status: 'completed', progress: 100, user: 'Finance Exec', rate: '97.4%', results: { total: 15400, matched: 15000, mismatched: 400, rate: '97.4%' }, createdAt: new Date('2026-04-06T12:00:00').toISOString() },
  { jobId: 'RECON-10487', product: 'DMT', bank: 'FINO', date: '2026-04-05', cycle: 'N/A', status: 'completed', progress: 100, user: 'Logic Engineer', rate: '99.1%', results: { total: 7200, matched: 7135, mismatched: 65, rate: '99.1%' }, createdAt: new Date('2026-04-05T16:45:00').toISOString() },
  { jobId: 'RECON-10486', product: 'mATM', bank: 'NSDL', date: '2026-04-05', cycle: '4', status: 'completed', progress: 100, user: 'system', rate: '98.2%', results: { total: 9500, matched: 9330, mismatched: 170, rate: '98.2%' }, createdAt: new Date('2026-04-05T18:20:00').toISOString() },
  { jobId: 'RECON-10485', product: 'AePS', bank: 'FINO', date: '2026-04-04', cycle: '5', status: 'completed', progress: 100, user: 'Finance Exec', rate: '96.8%', results: { total: 11000, matched: 10648, mismatched: 352, rate: '96.8%' }, createdAt: new Date('2026-04-04T10:30:00').toISOString() },
  { jobId: 'RECON-10484', product: 'DMT', bank: 'NSDL', date: '2026-04-04', cycle: 'N/A', status: 'failed', progress: 20, user: 'Logic Engineer', rate: '0%', createdAt: new Date('2026-04-04T13:10:00').toISOString(), error: 'Invalid NPCI Report Format' },
  { jobId: 'RECON-10483', product: 'mATM', bank: 'IPPB', date: '2026-04-03', cycle: '1', status: 'completed', progress: 100, user: 'system', rate: '99.9%', results: { total: 25000, matched: 24975, mismatched: 25, rate: '99.9%' }, createdAt: new Date('2026-04-03T09:00:00').toISOString() }
];

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get all products configuration
app.get('/api/v1/products', (req, res) => {
  res.json([
    { id: 'matm', name: 'mATM', banks: ['IPPB', 'NSDL'], type: 'Cycle-wise' },
    { id: 'dmt', name: 'DMT', banks: ['Airtel', 'FINO', 'NSDL'], type: 'Day-wise' },
    { id: 'aeps', name: 'AePS Cash Deposit', banks: ['NSDL', 'IPPB', 'FINO'], type: 'Cycle-wise' }
  ]);
});

// Aggregate stats for dashboard
app.get('/api/v1/stats', (req, res) => {
  const completedJobs = jobs.filter(j => j.status === 'completed');
  const runningJobs = jobs.filter(j => j.status === 'running');

  // Product Distribution
  const dist = completedJobs.reduce((acc, curr) => {
    acc[curr.product] = (acc[curr.product] || 0) + 1;
    return acc;
  }, {});

  // Failure Reason Analysis
  const reasons = {
    'Status Mismatch': 45,
    'Amount Mismatch': 28,
    'Timeout': 15,
    'Missing in MN': 12
  };

  // Dynamic Trend Data based on history
  const trends = [
    { day: 'Mon', volume: 8500, rate: 97.2 },
    { day: 'Tue', volume: 9200, rate: 98.1 },
    { day: 'Wed', volume: 7800, rate: 96.5 },
    { day: 'Thu', volume: 10500, rate: 99.2 },
    { day: 'Fri', volume: 11200, rate: 98.8 },
    { day: 'Sat', volume: 8900, rate: 97.5 },
    { day: 'Sun', volume: 9500, rate: 98.4 }
  ];

  const avgRateNum = completedJobs.length > 0 
    ? (completedJobs.reduce((acc, curr) => acc + parseFloat(curr.results?.rate || 0), 0) / completedJobs.length)
    : 0;

  res.json({
    totalJobs: jobs.length,
    completedToday: completedJobs.filter(j => new Date(j.createdAt).toDateString() === new Date().toDateString()).length,
    matchedRate: avgRateNum ? avgRateNum.toFixed(1) + '%' : '0%',
    mismatchCount: completedJobs.reduce((acc, curr) => acc + (curr.results?.mismatched || 0), 0),
    runningCount: runningJobs.length,
    activeJobs: runningJobs.map(j => ({ id: j.jobId, product: j.product, bank: j.bank, progress: j.progress })),
    productDistribution: dist,
    failureReasons: reasons,
    trends: trends
  });
});

// Trigger a new job
app.post('/api/v1/jobs', (req, res) => {
  const { product, bank, date, cycle, user = 'finance_admin' } = req.body || {};
  const jobId = `RECON-${Date.now()}`;
  
  const mockMismatches = [
    { rrn: '700' + Math.floor(Math.random() * 1000000), date: date || '2026-04-07', amount: '5,000.00', bankStatus: 'SUCCESS', mwStatus: 'FAILED', reason: 'Status Mismatch' },
    { rrn: '700' + Math.floor(Math.random() * 1000000), date: date || '2026-04-07', amount: '2,500.00', bankStatus: 'FAILED', mwStatus: 'SUCCESS', reason: 'Amount Mismatch' },
    { rrn: '700' + Math.floor(Math.random() * 1000000), date: date || '2026-04-07', amount: '1,000.00', bankStatus: 'SUCCESS', mwStatus: 'PENDING', reason: 'Wallet Timeout' }
  ];
  
  const total = 5000 + Math.floor(Math.random() * 5000);
  const mismatchedCount = 50 + Math.floor(Math.random() * 200);

  const newJob = {
    jobId,
    product: product || 'mATM',
    bank: bank || 'NSDL',
    date: date || '2026-04-07',
    cycle: cycle || '1',
    status: 'completed',
    progress: 100,
    user,
    rate: (((total - mismatchedCount) / total) * 100).toFixed(1) + '%',
    results: {
      total,
      matched: total - mismatchedCount,
      mismatched: mismatchedCount,
      rate: (((total - mismatchedCount) / total) * 100).toFixed(1) + '%',
      mismatchedData: mockMismatches
    },
    createdAt: new Date().toISOString()
  };
  
  jobs.unshift(newJob);

  res.status(201).json(newJob);
});

// Poll job status
app.get('/api/v1/jobs/:jobId', (req, res) => {
  const job = jobs.find(j => j.jobId === req.params.jobId);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  res.json(job);
});

// Delete/Cancel job
app.delete('/api/v1/jobs/:jobId', (req, res) => {
  const index = jobs.findIndex(j => j.jobId === req.params.jobId);
  if (index === -1) return res.status(404).json({ error: 'Job not found' });
  jobs.splice(index, 1);
  res.status(204).send();
});

// List all jobs (History)
app.get('/api/v1/history', (req, res) => {
  res.json([...jobs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});

export default app;
