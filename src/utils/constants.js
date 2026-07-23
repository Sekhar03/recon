export const PRODUCTS = [
  {
    id: 'matm',
    name: 'mATM',
    banks: ['IPPB', 'NSDL'],
    type: 'Cycle-wise',
    files: 4,
    description: '4-way reconciliation across NPCI, Switch, Middleware, and Wallet.'
  },
  {
    id: 'dmt',
    name: 'DMT',
    banks: ['Airtel', 'FINO', 'NSDL'],
    type: 'Day-wise',
    files: 3,
    description: '3-way reconciliation using gatewayId / RRN as the join key.'
  },
  {
    id: 'aeps',
    name: 'AePS Cash Deposit',
    banks: ['NSDL', 'IPPB', 'FINO'],
    type: 'Cycle-wise',
    files: 5,
    description: '5-way matching including NPCI, Switch, Middleware, Wallet, and BAV Report.'
  }
];

export const CYCLES = [
  { id: 1, label: 'Cycle 1', time: '21:00–00:00' },
  { id: 2, label: 'Cycle 2', time: '00:00–05:00' },
  { id: 3, label: 'Cycle 3', time: '05:00–07:00' },
  { id: 4, label: 'Cycle 4', time: '07:00–09:00' },
  { id: 5, label: 'Cycle 5', time: '09:00–11:00' },
  { id: 6, label: 'Cycle 6', time: '11:00–13:00' },
  { id: 7, label: 'Cycle 7', time: '13:00–15:00' },
  { id: 8, label: 'Cycle 8', time: '15:00–17:00' },
  { id: 9, label: 'Cycle 9', time: '17:00–19:00' },
  { id: 10, label: 'Cycle 10', time: '19:00–21:00' },
];

export const RECON_STATUS = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed'
};
