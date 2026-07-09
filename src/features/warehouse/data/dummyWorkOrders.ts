import type { WorkOrderOption, WorkOrderDetail } from '../types';

export const DUMMY_WORK_ORDERS: WorkOrderOption[] = [
  { id: 'WO-2024-001', label: 'WO-2024-001' },
  { id: 'WO-2024-002', label: 'WO-2024-002' },
  { id: 'WO-2024-003', label: 'WO-2024-003' },
  { id: 'WO-2024-004', label: 'WO-2024-004' },
];

export const DUMMY_WO_DETAIL: Record<string, WorkOrderDetail> = {
  'WO-2024-001': {
    machine: 'Machine A1',
    customer: 'Toyota Motor Corp',
    models: 'Model X-100',
    face: 'Face A',
    line: 'Line 01',
    date: '2024-07-09',
    stkNumbers: [
      'STK-001-A',
      'STK-002-A',
      'STK-003-A',
      'STK-004-A',
      'STK-005-A',
    ],
  },
  'WO-2024-002': {
    machine: 'Machine B2',
    customer: 'Honda Motor Co',
    models: 'Model Y-200',
    face: 'Face B',
    line: 'Line 02',
    date: '2024-07-09',
    stkNumbers: ['STK-010-B', 'STK-011-B', 'STK-012-B'],
  },
  'WO-2024-003': {
    machine: 'Machine C3',
    customer: 'Suzuki Corp',
    models: 'Model Z-300',
    face: 'Face A',
    line: 'Line 03',
    date: '2024-07-10',
    stkNumbers: ['STK-020-A', 'STK-021-A', 'STK-022-A', 'STK-023-A'],
  },
  'WO-2024-004': {
    machine: 'Machine D4',
    customer: 'Yamaha Motor',
    models: 'Model W-400',
    face: 'Face B',
    line: 'Line 01',
    date: '2024-07-10',
    stkNumbers: ['STK-030-B', 'STK-031-B'],
  },
};
