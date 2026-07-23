/**
 * 3.1 Cycle Scheduler Module
 * Maps NPCI 10 daily settlement sub-cycles to 3 internal cycles per day.
 */

export const CYCLE_MAPPINGS = [
  { npciCycle: 1, internalCycle: 'Cycle 1', window: '21:00–00:00', settlesOn: 'T+1', gefuCutoff: '09:30 AM' },
  { npciCycle: 2, internalCycle: 'Cycle 1', window: '00:00–05:00', settlesOn: 'T Day', gefuCutoff: '09:30 AM' },
  { npciCycle: 3, internalCycle: 'Cycle 1', window: '05:00–07:00', settlesOn: 'T Day', gefuCutoff: '09:30 AM' },
  { npciCycle: 4, internalCycle: 'Cycle 2', window: '07:00–09:00', settlesOn: 'T Day', gefuCutoff: '03:30 PM' },
  { npciCycle: 5, internalCycle: 'Cycle 2', window: '09:00–11:00', settlesOn: 'T Day', gefuCutoff: '03:30 PM' },
  { npciCycle: 6, internalCycle: 'Cycle 2', window: '11:00–13:00', settlesOn: 'T Day', gefuCutoff: '03:30 PM' },
  { npciCycle: 7, internalCycle: 'Cycle 3', window: '13:00–15:00', settlesOn: 'T Day', gefuCutoff: '09:30 PM' },
  { npciCycle: 8, internalCycle: 'Cycle 3', window: '15:00–17:00', settlesOn: 'T Day', gefuCutoff: '09:30 PM' },
  { npciCycle: 9, internalCycle: 'Cycle 1', window: '17:00–19:00', settlesOn: 'T+1', gefuCutoff: '09:30 AM' },
  { npciCycle: 10, internalCycle: 'Cycle 1', window: '19:00–21:00', settlesOn: 'T+1', gefuCutoff: '09:30 AM' },
];

export const INTERNAL_CYCLES = [
  { id: 'Cycle 1', name: 'Internal Cycle 1', cutOffTime: '09:30 AM', npciCycles: [1, 2, 3, 9, 10], description: 'Overnight & Evening NPCI windows' },
  { id: 'Cycle 2', name: 'Internal Cycle 2', cutOffTime: '03:30 PM', npciCycles: [4, 5, 6], description: 'Morning NPCI windows' },
  { id: 'Cycle 3', name: 'Internal Cycle 3', cutOffTime: '09:30 PM', npciCycles: [7, 8], description: 'Afternoon NPCI windows' },
];

export function getInternalCycleForNpci(npciCycleNum) {
  const mapping = CYCLE_MAPPINGS.find(m => m.npciCycle === Number(npciCycleNum));
  return mapping ? mapping.internalCycle : 'Cycle 1';
}

export function getCycleScheduleStatus(date = new Date().toISOString().split('T')[0]) {
  return INTERNAL_CYCLES.map(c => ({
    ...c,
    date,
    status: 'READY',
    lastRunAt: new Date().toISOString(),
    idempotencyKey: `${date}_${c.id}`
  }));
}
