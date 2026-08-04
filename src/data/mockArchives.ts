import { ReconJob } from '../types';
import { generateReconDataset } from '../utils/mockDataGenerator';

const archive1 = generateReconDataset('nsdlaeps', 'NSDL AEPS', 'AEPS', '2026-07-28', 'Cycle 1 (00:00 - 08:00 Window)', 18450);
archive1.job.id = 'RECON-20260728-001';

const archive2 = generateReconDataset('aadharpay', 'Aadharpay', 'AEPS', '2026-07-27', 'All Cycles (Daily Consolidated)', 24200);
archive2.job.id = 'RECON-20260727-004';

const archive3 = generateReconDataset('matm4way', 'MATM 4-Way Txn Recon', 'MATM', '2026-07-27', 'Cycle 3 (16:00 - 24:00 Window)', 12800);
archive3.job.id = 'RECON-20260727-003';

const archive4 = generateReconDataset('dynamicupi', 'Dynamic UPI', 'UPI', '2026-07-26', 'All Cycles (Daily Consolidated)', 45000);
archive4.job.id = 'RECON-20260726-012';

const archive5 = generateReconDataset('airteldmt', 'Airtel DMT', 'DMT', '2026-07-25', 'Cycle 2 (08:00 - 16:00 Window)', 15600);
archive5.job.id = 'RECON-20260725-008';

const archive6 = generateReconDataset('bbpsbou', 'BBPS BOU Reconciliation', 'BBPS', '2026-07-25', 'All Cycles (Daily Consolidated)', 9800);
archive6.job.id = 'RECON-20260725-002';

const archive7 = generateReconDataset('pos_sub', 'POS', 'POS', '2026-07-24', 'Cycle 1 (00:00 - 08:00 Window)', 14500);
archive7.job.id = 'RECON-20260724-005';

const archive8 = generateReconDataset('wallet2cashout', 'Wallet2Cashout', 'RBL Payout', '2026-07-24', 'Cycle 2 (08:00 - 16:00 Window)', 16800);
archive8.job.id = 'RECON-20260724-009';

const archive9 = generateReconDataset('rechargekrack', 'Recharge Krack', 'RECHARGE', '2026-07-23', 'All Cycles (Daily Consolidated)', 24500);
archive9.job.id = 'RECON-20260723-011';

const archive10 = generateReconDataset('bobproject_sub', 'BOB Project', 'BOB PROJECT', '2026-07-23', 'Cycle 1 (00:00 - 08:00 Window)', 15400);
archive10.job.id = 'RECON-20260723-002';

export const INITIAL_JOB_ARCHIVES: ReconJob[] = [
  archive1.job,
  archive2.job,
  archive3.job,
  archive4.job,
  archive5.job,
  archive6.job,
  archive7.job,
  archive8.job,
  archive9.job,
  archive10.job
];
