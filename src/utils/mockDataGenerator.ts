import { ReconRecord, ReconJob } from '../types';

export interface AdjustmentRule {
  npci: string;
  switch: string;
  middleware: string;
  wallet: string;
  action: string;
}

export const ADJUSTMENT_CRITERIA_RULES: AdjustmentRule[] = [
  { npci: 'Success', switch: 'Success', middleware: 'Inprogress', wallet: 'N/A', action: 'Raise credit adjustment' },
  { npci: 'Success', switch: 'Success', middleware: 'Inprogress', wallet: 'Success', action: 'Update the middleware status to success' },
  { npci: 'Success', switch: 'Success', middleware: 'Success', wallet: 'N/A', action: 'Process wallet operation to success' },
  { npci: 'Pending', switch: 'Pending', middleware: 'Inprogress', wallet: 'N/A', action: 'Raise RET in URCS portal' },
  { npci: 'Success', switch: 'Failed', middleware: 'Failed', wallet: 'N/A', action: 'Raise RET in URCS portal' },
  { npci: 'Pending', switch: 'Success', middleware: 'Success', wallet: 'Success', action: 'Raise TCC in URCS portal' },
  { npci: 'Success', switch: 'Pending', middleware: 'Success', wallet: 'Success', action: 'No Action' }
];

export function generateReconDataset(
  subProductId: string,
  subProductName: string,
  categoryName: string,
  date: string,
  cycle: string,
  totalCount: number = 200
): { matchedRecords: ReconRecord[]; mismatchedRecords: ReconRecord[]; job: ReconJob } {
  const dateFormatted = date.replace(/-/g, '');
  const matchedCount = Math.floor(totalCount * 0.984);
  const mismatchedCount = totalCount - matchedCount;

  const matchedRecords: ReconRecord[] = [];
  const mismatchedRecords: ReconRecord[] = [];

  const agentIds = ['AGNT-1024', 'AGNT-2048', 'AGNT-3096', 'AGNT-4112', 'AGNT-5020', 'AGNT-6180', 'AGNT-7220', 'AGNT-8900'];
  const channels = ['GCP Switch / CBS', 'NPCI Clearing Node', 'SFTP Nodal Bank', 'Partner Gateway'];

  // Generate matched records
  for (let i = 1; i <= matchedCount; i++) {
    const pad = String(i).padStart(5, '0');
    const txnId = `TXN${dateFormatted}${pad}`;
    const rrn = `4208${dateFormatted.slice(2)}${pad}`;
    const agent = agentIds[i % agentIds.length];
    const amount = [100, 250, 500, 1000, 2000, 2500, 5000, 10000][i % 8];
    const hour = String((i % 8)).padStart(2, '0');
    const min = String((i * 3) % 60).padStart(2, '0');
    const sec = String((i * 7) % 60).padStart(2, '0');

    matchedRecords.push({
      id: `MATCH-${i}`,
      txnId,
      rrn,
      agentId: agent,
      amount,
      status: 'matched',
      npciStatus: 'Success',
      switchStatus: 'Success',
      middlewareStatus: 'Success',
      walletStatus: 'Success',
      discrepancyReason: 'No Action',
      actionToBeTaken: 'No Action',
      timestamp: `${date} ${hour}:${min}:${sec}`,
      channel: channels[i % channels.length]
    });
  }

  // Generate mismatched records based on Adjustment Criteria rules
  for (let j = 1; j <= mismatchedCount; j++) {
    const pad = String(matchedCount + j).padStart(5, '0');
    const txnId = `TXN${dateFormatted}${pad}`;
    const rrn = `4208${dateFormatted.slice(2)}${pad}`;
    const agent = agentIds[j % agentIds.length];
    const amount = [150, 320, 750, 1200, 3500][j % 5];
    const hour = String((j % 8)).padStart(2, '0');
    const min = String((j * 5) % 60).padStart(2, '0');
    const sec = String((j * 11) % 60).padStart(2, '0');
    
    // Pick rule according to Adjustment Criteria
    const ruleIndex = (j - 1) % ADJUSTMENT_CRITERIA_RULES.length;
    const rule = ADJUSTMENT_CRITERIA_RULES[ruleIndex];

    mismatchedRecords.push({
      id: `MISMATCH-${j}`,
      txnId,
      rrn,
      agentId: agent,
      amount,
      status: 'mismatched',
      npciStatus: rule.npci,
      switchStatus: rule.switch,
      middlewareStatus: rule.middleware,
      walletStatus: rule.wallet,
      discrepancyReason: rule.action,
      actionToBeTaken: rule.action,
      timestamp: `${date} ${hour}:${min}:${sec}`,
      channel: channels[j % channels.length]
    });
  }

  const matchRate = Number(((matchedCount / totalCount) * 100).toFixed(1));

  const job: ReconJob = {
    id: `RECON-${dateFormatted}-${Math.floor(100 + Math.random() * 900)}`,
    subProductId,
    subProductName,
    categoryName,
    date,
    cycle,
    totalRecords: totalCount,
    matchedRecords: matchedCount,
    mismatchedRecords: mismatchedCount,
    matchRate,
    status: 'Completed',
    createdAt: new Date().toISOString(),
    matchedData: matchedRecords,
    mismatchedData: mismatchedRecords
  };

  return { matchedRecords, mismatchedRecords, job };
}
