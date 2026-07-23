export const PRODUCTS = [
  {
    id: 'upi',
    name: 'UPI Reconciliation & Settlement',
    banks: ['NSDL Payments Bank', 'IPPB', 'Axis Bank'],
    type: '10 Sub-Cycles / 3 Internal Cycles',
    files: 4,
    description: '4-way transaction recon (NPCI, Switch, Middleware, Wallet), NTSL -> GEFU flat file, Merchant Settlement & IMPS split payouts.'
  },
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

export const NPCI_SUB_CYCLES = [
  { npciCycle: 1, internalCycle: 'Cycle 1', timeWindow: '21:00–00:00', cutoff: '09:30 AM', settlesOn: 'T+1' },
  { npciCycle: 2, internalCycle: 'Cycle 1', timeWindow: '00:00–05:00', cutoff: '09:30 AM', settlesOn: 'T Day' },
  { npciCycle: 3, internalCycle: 'Cycle 1', timeWindow: '05:00–07:00', cutoff: '09:30 AM', settlesOn: 'T Day' },
  { npciCycle: 4, internalCycle: 'Cycle 2', timeWindow: '07:00–09:00', cutoff: '03:30 PM', settlesOn: 'T Day' },
  { npciCycle: 5, internalCycle: 'Cycle 2', timeWindow: '09:00–11:00', cutoff: '03:30 PM', settlesOn: 'T Day' },
  { npciCycle: 6, internalCycle: 'Cycle 2', timeWindow: '11:00–13:00', cutoff: '03:30 PM', settlesOn: 'T Day' },
  { npciCycle: 7, internalCycle: 'Cycle 3', timeWindow: '13:00–15:00', cutoff: '09:30 PM', settlesOn: 'T Day' },
  { npciCycle: 8, internalCycle: 'Cycle 3', timeWindow: '15:00–17:00', cutoff: '09:30 PM', settlesOn: 'T Day' },
  { npciCycle: 9, internalCycle: 'Cycle 1', timeWindow: '17:00–19:00', cutoff: '09:30 AM', settlesOn: 'T+1' },
  { npciCycle: 10, internalCycle: 'Cycle 1', timeWindow: '19:00–21:00', cutoff: '09:30 AM', settlesOn: 'T+1' },
];

export const INTERNAL_CYCLES = [
  { id: 'Cycle 1', label: 'Internal Cycle 1', time: '21:00–07:00 & 17:00–21:00', gefuCutoff: '09:30 AM' },
  { id: 'Cycle 2', label: 'Internal Cycle 2', time: '07:00–13:00', gefuCutoff: '03:30 PM' },
  { id: 'Cycle 3', label: 'Internal Cycle 3', time: '13:00–17:00', gefuCutoff: '09:30 PM' },
];

export const BANK_SHARE_DEFAULT_RATE = 0.002006; // 0.2006% per spec
