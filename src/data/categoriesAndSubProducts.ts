import { Category, SubProduct, BusinessVerticalId } from '../types';

export interface BusinessVertical {
  id: BusinessVerticalId;
  name: string;
  description: string;
  badge: string;
  iconName: string;
}

export const BUSINESS_VERTICALS: BusinessVertical[] = [
  {
    id: 'agency-banking',
    name: 'Agency Banking',
    description: 'AEPS, MATM, DMT & Recharge Modules',
    badge: '4 Categories',
    iconName: 'Building2'
  },
  {
    id: 'acquiring',
    name: 'Acquiring',
    description: 'UPI, POS & RBL Payout Modules',
    badge: '3 Categories',
    iconName: 'QrCode'
  },
  {
    id: 'issuing',
    name: 'Issuing',
    description: 'IMPS, Prepaid Cards & Issuer Card Management Reconciliation',
    badge: '2 Categories',
    iconName: 'CreditCard'
  },
  {
    id: 'bbps',
    name: 'BBPS',
    description: 'Bharat Bill Payment System (COU & BOU Reconciliation)',
    badge: '1 Category',
    iconName: 'Receipt'
  }
];

export const CATEGORIES: Category[] = [
  // Agency Banking
  { id: 'aeps', name: 'AEPS', iconName: 'Fingerprint', verticalId: 'agency-banking', verticalName: 'Agency Banking' },
  { id: 'matm', name: 'MATM', iconName: 'CreditCard', verticalId: 'agency-banking', verticalName: 'Agency Banking' },
  { id: 'dmt', name: 'DMT', iconName: 'ArrowRightLeft', verticalId: 'agency-banking', verticalName: 'Agency Banking' },
  { id: 'recharge', name: 'RECHARGE', iconName: 'Zap', verticalId: 'agency-banking', verticalName: 'Agency Banking' },

  // Acquiring
  { id: 'upi', name: 'UPI', iconName: 'QrCode', verticalId: 'acquiring', verticalName: 'Acquiring' },
  { id: 'pos', name: 'POS', iconName: 'Building2', verticalId: 'acquiring', verticalName: 'Acquiring' },
  { id: 'cashout', name: 'RBL Payout', iconName: 'Wallet', verticalId: 'acquiring', verticalName: 'Acquiring' },

  // Issuing
  { id: 'imps', name: 'IMPS', iconName: 'Send', verticalId: 'issuing', verticalName: 'Issuing' },
  { id: 'prepaidcard', name: 'PREPAID CARD', iconName: 'CreditCard', verticalId: 'issuing', verticalName: 'Issuing' },

  // BBPS
  { id: 'bbps', name: 'BBPS', iconName: 'Receipt', verticalId: 'bbps', verticalName: 'BBPS' }
];

export const SUB_PRODUCTS: SubProduct[] = [
  // 1. AEPS
  {
    id: 'aadharpay',
    categoryId: 'aeps',
    name: 'Aadharpay',
    requiredFiles: [
      { id: 'mw_log', name: 'Middleware Txn Log', type: 'internal', channel: 'GCP Bucket (gs://prod-isurecon/aeps/)', defaultRecordCount: 18450 },
      { id: 'switch_log', name: 'Aeps Switch / CBS Log', type: 'internal', channel: 'GCP Bucket (gs://prod-isurecon/aeps/)', defaultRecordCount: 18450 },
      { id: 'npci_settlement', name: 'NPCI Settlement File', type: 'counterparty', channel: 'NPCI Clearing Portal / SFTP', defaultRecordCount: 18450 }
    ]
  },
  {
    id: 'finoaeps',
    categoryId: 'aeps',
    name: 'Fino AEPS',
    requiredFiles: [
      { id: 'fino_gw', name: 'Fino Gateway Log', type: 'internal', channel: 'GCP Bucket (gs://prod-isurecon/fino/)', defaultRecordCount: 12300 },
      { id: 'fino_wallet', name: 'Fino Internal Ledger', type: 'internal', channel: 'GCP Bucket (gs://prod-isurecon/fino/)', defaultRecordCount: 12300 },
      { id: 'fino_cbs', name: 'Fino Bank CBS File', type: 'counterparty', channel: 'Fino SFTP Portal', defaultRecordCount: 12300 }
    ]
  },
  {
    id: 'nsdlaeps',
    categoryId: 'aeps',
    name: 'NSDL AEPS',
    requiredFiles: [
      { id: 'nsdl_mw', name: 'NSDL Middleware Log', type: 'internal', channel: 'GCP Bucket (gs://prod-isurecon/nsdl/)', defaultRecordCount: 15800 },
      { id: 'nsdl_switch', name: 'NSDL Switch Log', type: 'internal', channel: 'GCP Bucket (gs://prod-isurecon/nsdl/)', defaultRecordCount: 15800 },
      { id: 'nsdl_npci', name: 'NPCI Daily Settlement', type: 'counterparty', channel: 'NPCI Clearing Portal', defaultRecordCount: 15800 },
      { id: 'nsdl_cbs', name: 'NSDL Bank CBS Log', type: 'counterparty', channel: 'NSDL SFTP Node', defaultRecordCount: 15800 }
    ]
  },
  {
    id: 'ippbaeps',
    categoryId: 'aeps',
    name: 'IPPB AEPS',
    requiredFiles: [
      { id: 'ippb_mw', name: 'IPPB Middleware Log', type: 'internal', channel: 'GCP Bucket (gs://prod-isurecon/ippb/)', defaultRecordCount: 9400 },
      { id: 'ippb_switch', name: 'IPPB Switch Log', type: 'internal', channel: 'GCP Bucket (gs://prod-isurecon/ippb/)', defaultRecordCount: 9400 },
      { id: 'ippb_cbs', name: 'IPPB Core Banking File', type: 'counterparty', channel: 'IPPB SFTP Hub', defaultRecordCount: 9400 }
    ]
  },
  {
    id: 'ippbaeps_cd',
    categoryId: 'aeps',
    name: 'IPPB AEPS CD',
    requiredFiles: [
      { id: 'ippbcd_mw', name: 'IPPB Cash Deposit Gateway Log', type: 'internal', channel: 'GCP Bucket (gs://prod-isurecon/ippb/)', defaultRecordCount: 8200 },
      { id: 'ippbcd_cbs', name: 'IPPB CD Bank Statement', type: 'counterparty', channel: 'IPPB SFTP Portal', defaultRecordCount: 8200 }
    ]
  },
  {
    id: 'ippbwallet',
    categoryId: 'aeps',
    name: 'IPPB Wallet',
    requiredFiles: [
      { id: 'ippbwal_mw', name: 'IPPB Wallet Switch Log', type: 'internal', channel: 'GCP Bucket (gs://prod-isurecon/ippb/)', defaultRecordCount: 10500 },
      { id: 'ippbwal_ledger', name: 'IPPB Wallet Clearing Report', type: 'counterparty', channel: 'IPPB Host SFTP', defaultRecordCount: 10500 }
    ]
  },

  // 2. MATM
  {
    id: 'matm4way',
    categoryId: 'matm',
    name: 'MATM 4-Way Txn Recon',
    requiredFiles: [
      { id: 'matm4_mw', name: 'mPOS Middleware Log', type: 'internal', channel: 'GCP Bucket (gs://prod-isurecon/matm/)', defaultRecordCount: 8900 },
      { id: 'matm4_terminal', name: 'Terminal Batch File', type: 'internal', channel: 'GCP Bucket (gs://prod-isurecon/matm/)', defaultRecordCount: 8900 },
      { id: 'matm4_switch', name: 'Switch Transaction File', type: 'internal', channel: 'GCP Bucket (gs://prod-isurecon/matm/)', defaultRecordCount: 8900 },
      { id: 'matm4_bank', name: 'Acquiring Bank Settlement', type: 'counterparty', channel: 'Bank SFTP Node', defaultRecordCount: 8900 }
    ]
  },
  {
    id: 'matm3way',
    categoryId: 'matm',
    name: 'MATM 3-Way Txn Recon',
    requiredFiles: [
      { id: 'matm3_mw', name: 'MATM Middleware Journal', type: 'internal', channel: 'GCP Bucket (gs://prod-isurecon/matm/)', defaultRecordCount: 7400 },
      { id: 'matm3_switch', name: 'MATM Switch Log', type: 'internal', channel: 'GCP Bucket (gs://prod-isurecon/matm/)', defaultRecordCount: 7400 },
      { id: 'matm3_bank', name: 'Bank Settlement File', type: 'counterparty', channel: 'Acquirer Bank SFTP', defaultRecordCount: 7400 }
    ]
  },
  {
    id: 'matmcommission',
    categoryId: 'matm',
    name: 'MATM Commission Recon',
    requiredFiles: [
      { id: 'matmcomm_mw', name: 'MATM Commission Engine Log', type: 'internal', channel: 'GCP Bucket (gs://prod-isurecon/matm/)', defaultRecordCount: 11200 },
      { id: 'matmcomm_ledger', name: 'Agent Commission Ledger', type: 'internal', channel: 'GCP Bucket (gs://prod-isurecon/matm/)', defaultRecordCount: 11200 }
    ]
  },
  {
    id: 'equitasmatm',
    categoryId: 'matm',
    name: 'Equitas MATM',
    requiredFiles: [
      { id: 'eqmatm_mw', name: 'Equitas Gateway Log', type: 'internal', channel: 'GCP Bucket (gs://prod-isurecon/equitas/)', defaultRecordCount: 6800 },
      { id: 'eqmatm_cbs', name: 'Equitas Small Finance Bank CBS', type: 'counterparty', channel: 'Equitas SFTP Portal', defaultRecordCount: 6800 }
    ]
  },
  {
    id: 'nsdlmatm',
    categoryId: 'matm',
    name: 'NSDL MATM',
    requiredFiles: [
      { id: 'nsdlmatm_mw', name: 'NSDL MicroATM Switch', type: 'internal', channel: 'GCP Bucket (gs://prod-isurecon/nsdl/)', defaultRecordCount: 9100 },
      { id: 'nsdlmatm_cbs', name: 'NSDL Payments Bank Settlement', type: 'counterparty', channel: 'NSDL SFTP Node', defaultRecordCount: 9100 }
    ]
  },
  {
    id: 'ippbmatm',
    categoryId: 'matm',
    name: 'IPPB MATM',
    requiredFiles: [
      { id: 'ippbmatm_mw', name: 'IPPB MicroATM Gateway Log', type: 'internal', channel: 'GCP Bucket (gs://prod-isurecon/ippb/)', defaultRecordCount: 8300 },
      { id: 'ippbmatm_cbs', name: 'IPPB Host Clearing Report', type: 'counterparty', channel: 'IPPB SFTP Node', defaultRecordCount: 8300 }
    ]
  },

  // 3. IMPS
  {
    id: 'nsdlimps',
    categoryId: 'imps',
    name: 'NSDL IMPS',
    requiredFiles: [
      { id: 'nsdlimps_mw', name: 'IMPS Middleware Log', type: 'internal', channel: 'GCP Bucket (gs://prod-isurecon/imps/)', defaultRecordCount: 16500 },
      { id: 'nsdlimps_switch', name: 'IMPS Switch Journal', type: 'internal', channel: 'GCP Bucket (gs://prod-isurecon/imps/)', defaultRecordCount: 16500 },
      { id: 'nsdlimps_cbs', name: 'NSDL CBS Settlement File', type: 'counterparty', channel: 'NSDL SFTP', defaultRecordCount: 16500 }
    ]
  },
  {
    id: 'ippbimps',
    categoryId: 'imps',
    name: 'IPPB IMPS',
    requiredFiles: [
      { id: 'ippbimps_mw', name: 'IPPB IMPS Switch Log', type: 'internal', channel: 'GCP Bucket (gs://prod-isurecon/ippb/)', defaultRecordCount: 13200 },
      { id: 'ippbimps_cbs', name: 'IPPB Settlement Report', type: 'counterparty', channel: 'IPPB SFTP Node', defaultRecordCount: 13200 }
    ]
  },


  // 4. BBPS
  {
    id: 'bbpscou_bob',
    categoryId: 'bbps',
    name: 'BBPS COU (Bank of Baroda / BB11)',
    requiredFiles: [
      { id: 'bbpscou_mw', name: 'BOB BB11 COU Gateway Log', type: 'internal', channel: 'GCP Bucket (gs://prod-isurecon/bbps/)', defaultRecordCount: 14200 },
      { id: 'bbpscou_bob_cbs', name: 'Bank of Baroda BBPS Settlement', type: 'counterparty', channel: 'BOB Dedicated SFTP', defaultRecordCount: 14200 }
    ]
  },
  {
    id: 'bbpsbou',
    categoryId: 'bbps',
    name: 'BBPS BOU Reconciliation',
    requiredFiles: [
      { id: 'bbpsbou_mw', name: 'BOU Outlet Gateway Log', type: 'internal', channel: 'GCP Bucket (gs://prod-isurecon/bbps/)', defaultRecordCount: 11200 },
      { id: 'bbpsbou_npci', name: 'NPCI BBPS Settlement File', type: 'counterparty', channel: 'NPCI BBPS Portal', defaultRecordCount: 11200 }
    ]
  },
  {
    id: 'nsdlbbps',
    categoryId: 'bbps',
    name: 'NSDL BBPS',
    requiredFiles: [
      { id: 'nsdlbbps_mw', name: 'NSDL BBPS Switch Log', type: 'internal', channel: 'GCP Bucket (gs://prod-isurecon/nsdl/)', defaultRecordCount: 12800 },
      { id: 'nsdlbbps_cbs', name: 'NSDL Bank Cleared File', type: 'counterparty', channel: 'NSDL SFTP Portal', defaultRecordCount: 12800 }
    ]
  },
  {
    id: 'ippbbbps',
    categoryId: 'bbps',
    name: 'IPPB BBPS',
    requiredFiles: [
      { id: 'ippbbbps_mw', name: 'IPPB Bill Pay Switch', type: 'internal', channel: 'GCP Bucket (gs://prod-isurecon/ippb/)', defaultRecordCount: 10600 },
      { id: 'ippbbbps_cbs', name: 'IPPB Settlement Statement', type: 'counterparty', channel: 'IPPB Host SFTP', defaultRecordCount: 10600 }
    ]
  },

  // 5. RECHARGE
  {
    id: 'rechargekrack',
    categoryId: 'recharge',
    name: 'Recharge Krack',
    requiredFiles: [
      { id: 'krack_mw', name: 'Recharge Krack Switch Log', type: 'internal', channel: 'GCP Bucket (gs://prod-isurecon/recharge/)', defaultRecordCount: 24500 },
      { id: 'krack_op', name: 'Operator Recon Sheet', type: 'counterparty', channel: 'Operator Partner Portal', defaultRecordCount: 24500 }
    ]
  },
  {
    id: 'rechargeeuro',
    categoryId: 'recharge',
    name: 'Recharge Euro',
    requiredFiles: [
      { id: 'euro_mw', name: 'Euronet Recharge Gateway Log', type: 'internal', channel: 'GCP Bucket (gs://prod-isurecon/recharge/)', defaultRecordCount: 18900 },
      { id: 'euro_op', name: 'Euronet Aggregator Clearing', type: 'counterparty', channel: 'Euronet SFTP Node', defaultRecordCount: 18900 }
    ]
  },
  {
    id: 'rechargecommission',
    categoryId: 'recharge',
    name: 'Recharge Commission Recon (Krac & Euronet)',
    requiredFiles: [
      { id: 'rechargecomm_mw', name: 'Telecom Commission Calculation Log', type: 'internal', channel: 'GCP Bucket (gs://prod-isurecon/recharge/)', defaultRecordCount: 31200 },
      { id: 'rechargecomm_op', name: 'Aggregator Margin Statement', type: 'counterparty', channel: 'Partner Audit Node', defaultRecordCount: 31200 }
    ]
  },

  // 6. UPI
  {
    id: 'nsdlmaupi',
    categoryId: 'upi',
    name: 'NSDL MA UPI (UPI Transaction Reconciliation)',
    autoClearanceEnabled: true,
    sampleReports: [
      { name: 'NPCI Report', url: 'https://workdrive.zoho.in/file/1264721555c54c92d4a3bbda9a814b8d06d98' },
      { name: 'Switch Report', url: 'https://workdrive.zoho.in/file/126475cc920bc8fb346798145c22a52457840' },
      { name: 'Middleware Report', url: 'https://workdrive.zoho.in/file/12647e1089a8e7563494c95bd60400ddf80c5' },
      { name: 'Wallet Report', url: 'https://workdrive.zoho.in/file/126474525bdd174794bb4b6e67903e0547e4e' }
    ],
    matchingCriteriaRules: [
      { system: 'NPCI File', matchingKey: 'Switch txn_id', amountField: 'Settlement amount/100', statusField: 'Response code', rrnField: 'RRN', payerVpaField: 'payer_vpa' },
      { system: 'Switch File', matchingKey: 'client ref_id', amountField: 'Amount', statusField: 'Status', rrnField: 'RRN', payerVpaField: 'payer_vpa' },
      { system: 'Middleware File', matchingKey: 'id', amountField: 'Amount', statusField: 'Status' },
      { system: 'Wallet File', matchingKey: 'txn_id', amountField: 'Amount', statusField: 'Status' }
    ],
    requiredFiles: [
      { id: 'nsdlma_npci', name: 'NPCI File', type: 'counterparty', channel: 'Manual downloaded from NPCI URCS portal', defaultRecordCount: 38500 },
      { id: 'nsdlma_mw', name: 'Middleware File', type: 'internal', channel: 'Auto-ingested into GCP Bucket (scheduled cycle-wise)', defaultRecordCount: 38500 },
      { id: 'nsdlma_switch', name: 'Switch File', type: 'internal', channel: 'From the SFTP / GCP Bucket', defaultRecordCount: 38500 },
      { id: 'nsdlma_wallet', name: 'Wallet File', type: 'internal', channel: 'Auto-ingested into GCP Bucket (scheduled cycle-wise)', defaultRecordCount: 38500 }
    ]
  },
  {
    id: 'oxymoneyupi',
    categoryId: 'upi',
    name: 'Oxymoney UPI (UPI Transaction Reconciliation)',
    autoClearanceEnabled: true,
    sampleReports: [
      { name: 'NPCI Report', url: 'https://workdrive.zoho.in/file/1264721555c54c92d4a3bbda9a814b8d06d98' },
      { name: 'Switch Report', url: 'https://workdrive.zoho.in/file/126475cc920bc8fb346798145c22a52457840' },
      { name: 'Middleware Report', url: 'https://workdrive.zoho.in/file/12647e1089a8e7563494c95bd60400ddf80c5' },
      { name: 'Wallet Report', url: 'https://workdrive.zoho.in/file/126474525bdd174794bb4b6e67903e0547e4e' }
    ],
    matchingCriteriaRules: [
      { system: 'NPCI File', matchingKey: 'Switch txn_id', amountField: 'Settlement amount/100', statusField: 'Response code', rrnField: 'RRN', payerVpaField: 'payer_vpa' },
      { system: 'Switch File', matchingKey: 'client ref_id', amountField: 'Amount', statusField: 'Status', rrnField: 'RRN', payerVpaField: 'payer_vpa' },
      { system: 'Middleware File', matchingKey: 'id', amountField: 'Amount', statusField: 'Status' },
      { system: 'Wallet File', matchingKey: 'txn_id', amountField: 'Amount', statusField: 'Status' }
    ],
    requiredFiles: [
      { id: 'oxy_npci', name: 'NPCI File', type: 'counterparty', channel: 'Manual downloaded from NPCI URCS portal', defaultRecordCount: 29400 },
      { id: 'oxy_mw', name: 'Middleware File', type: 'internal', channel: 'Auto-ingested into GCP Bucket (scheduled cycle-wise)', defaultRecordCount: 29400 },
      { id: 'oxy_switch', name: 'Switch File', type: 'internal', channel: 'From the SFTP / GCP Bucket', defaultRecordCount: 29400 },
      { id: 'oxy_wallet', name: 'Wallet File', type: 'internal', channel: 'Auto-ingested into GCP Bucket (scheduled cycle-wise)', defaultRecordCount: 29400 }
    ]
  },
  {
    id: 'khatabookupi',
    categoryId: 'upi',
    name: 'KHATA BOOK PA/PG UPI (UPI Transaction Reconciliation)',
    autoClearanceEnabled: true,
    sampleReports: [
      { name: 'NPCI Report', url: 'https://workdrive.zoho.in/file/1264721555c54c92d4a3bbda9a814b8d06d98' },
      { name: 'Switch Report', url: 'https://workdrive.zoho.in/file/126475cc920bc8fb346798145c22a52457840' },
      { name: 'Middleware Report', url: 'https://workdrive.zoho.in/file/12647e1089a8e7563494c95bd60400ddf80c5' },
      { name: 'Wallet Report', url: 'https://workdrive.zoho.in/file/126474525bdd174794bb4b6e67903e0547e4e' }
    ],
    matchingCriteriaRules: [
      { system: 'NPCI File', matchingKey: 'Switch txn_id', amountField: 'Settlement amount/100', statusField: 'Response code', rrnField: 'RRN', payerVpaField: 'payer_vpa' },
      { system: 'Switch File', matchingKey: 'client ref_id', amountField: 'Amount', statusField: 'Status', rrnField: 'RRN', payerVpaField: 'payer_vpa' },
      { system: 'Middleware File', matchingKey: 'id', amountField: 'Amount', statusField: 'Status' },
      { system: 'Wallet File', matchingKey: 'txn_id', amountField: 'Amount', statusField: 'Status' }
    ],
    requiredFiles: [
      { id: 'khata_npci', name: 'NPCI File', type: 'counterparty', channel: 'Manual downloaded from NPCI URCS portal', defaultRecordCount: 31200 },
      { id: 'khata_mw', name: 'Middleware File', type: 'internal', channel: 'Auto-ingested into GCP Bucket (scheduled cycle-wise)', defaultRecordCount: 31200 },
      { id: 'khata_switch', name: 'Switch File', type: 'internal', channel: 'From the SFTP / GCP Bucket', defaultRecordCount: 31200 },
      { id: 'khata_wallet', name: 'Wallet File', type: 'internal', channel: 'Auto-ingested into GCP Bucket (scheduled cycle-wise)', defaultRecordCount: 31200 }
    ]
  },

  // 7. DMT
  {
    id: 'airteldmt',
    categoryId: 'dmt',
    name: 'Airtel DMT',
    requiredFiles: [
      { id: 'airtel_mw', name: 'Airtel DMT Switch Log', type: 'internal', channel: 'GCP Bucket (gs://prod-isurecon/dmt/)', defaultRecordCount: 17800 },
      { id: 'airtel_bank', name: 'Airtel Payment Bank Report', type: 'counterparty', channel: 'Airtel Bank SFTP', defaultRecordCount: 17800 }
    ]
  },
  {
    id: 'finodmt',
    categoryId: 'dmt',
    name: 'Fino DMT',
    requiredFiles: [
      { id: 'finodmt_mw', name: 'Fino DMT Gateway Log', type: 'internal', channel: 'GCP Bucket (gs://prod-isurecon/dmt/)', defaultRecordCount: 13900 },
      { id: 'finodmt_cbs', name: 'Fino Bank Statement', type: 'counterparty', channel: 'Fino SFTP Portal', defaultRecordCount: 13900 }
    ]
  },
  {
    id: 'nsdldmt',
    categoryId: 'dmt',
    name: 'NSDL DMT',
    requiredFiles: [
      { id: 'nsdldmt_mw', name: 'NSDL Money Transfer Switch', type: 'internal', channel: 'GCP Bucket (gs://prod-isurecon/nsdl/)', defaultRecordCount: 15400 },
      { id: 'nsdldmt_cbs', name: 'NSDL Host Clearing Report', type: 'counterparty', channel: 'NSDL SFTP Node', defaultRecordCount: 15400 }
    ]
  },

  // 8. POS
  {
    id: 'pos_sub',
    categoryId: 'pos',
    name: 'POS',
    requiredFiles: [
      { id: 'pos_mw', name: 'Middleware - Transaction File', type: 'internal', channel: 'GCP Bucket (gs://prod-isurecon/pos/)', defaultRecordCount: 14500 },
      { id: 'pos_switch', name: 'Europa File - Switch', type: 'internal', channel: 'GCP Bucket (gs://prod-isurecon/pos/)', defaultRecordCount: 14500 },
      { id: 'pos_jv', name: 'JV File - Network', type: 'internal', channel: 'GCP Bucket (gs://prod-isurecon/pos/)', defaultRecordCount: 14500 }
    ]
  },
  {
    id: 'cashpoint_sub',
    categoryId: 'upi',
    name: 'Cashpoint',
    requiredFiles: [
      { id: 'cashpt_mw', name: 'Cashpoint Terminal Request Log', type: 'internal', channel: 'GCP Bucket (gs://prod-isurecon/pos/)', defaultRecordCount: 11200 },
      { id: 'cashpt_bank', name: 'Banking Settlement Report', type: 'counterparty', channel: 'Bank SFTP Node', defaultRecordCount: 11200 }
    ]
  },

  // 9. RBL Payout
  {
    id: 'wallet2cashout',
    categoryId: 'cashout',
    name: 'Wallet2Cashout',
    requiredFiles: [
      { id: 'w2c_mw', name: 'Payout Gateway Log', type: 'internal', channel: 'GCP Bucket (gs://prod-isurecon/cashout/)', defaultRecordCount: 16800 },
      { id: 'w2c_rbl', name: 'RBL Nodal Bank Statement', type: 'counterparty', channel: 'RBL Bank SFTP Node', defaultRecordCount: 16800 }
    ]
  },
  {
    id: 'w2cashoutimps',
    categoryId: 'cashout',
    name: 'W2Cashout IMPS',
    requiredFiles: [
      { id: 'w2cimps_mw', name: 'W2Cashout IMPS Switch Log', type: 'internal', channel: 'GCP Bucket (gs://prod-isurecon/cashout/)', defaultRecordCount: 14100 },
      { id: 'w2cimps_bank', name: 'IMPS Nodal Clearing Report', type: 'counterparty', channel: 'RBL / Sponsor SFTP', defaultRecordCount: 14100 }
    ]
  },
  {
    id: 'nsdlcashout4way',
    categoryId: 'cashout',
    name: 'NSDL Cashout (4-Way Recon)',
    requiredFiles: [
      { id: 'nsdlco_mw', name: 'NSDL Cashout Gateway Log', type: 'internal', channel: 'GCP Bucket (gs://prod-isurecon/nsdl/)', defaultRecordCount: 11800 },
      { id: 'nsdlco_switch', name: 'NSDL Switch Journal', type: 'internal', channel: 'GCP Bucket (gs://prod-isurecon/nsdl/)', defaultRecordCount: 11800 },
      { id: 'nsdlco_npci', name: 'NPCI Settlement File', type: 'counterparty', channel: 'NPCI Clearing Portal', defaultRecordCount: 11800 },
      { id: 'nsdlco_cbs', name: 'NSDL Bank CBS Log', type: 'counterparty', channel: 'NSDL SFTP Node', defaultRecordCount: 11800 }
    ]
  },
  {
    id: 'axiscashoutpayout',
    categoryId: 'cashout',
    name: 'Axis Cashout & Payout Recon',
    requiredFiles: [
      { id: 'axisco_mw', name: 'Axis Payout Engine Log', type: 'internal', channel: 'GCP Bucket (gs://prod-isurecon/axis/)', defaultRecordCount: 13200 },
      { id: 'axisco_bank', name: 'Axis Corporate Host Statement', type: 'counterparty', channel: 'Axis Direct SFTP', defaultRecordCount: 13200 }
    ]
  },
  {
    id: 'ippbcashout',
    categoryId: 'cashout',
    name: 'IPPB Cashout',
    requiredFiles: [
      { id: 'ippbco_mw', name: 'IPPB Cashout Switch Log', type: 'internal', channel: 'GCP Bucket (gs://prod-isurecon/ippb/)', defaultRecordCount: 9900 },
      { id: 'ippbco_cbs', name: 'IPPB Clearing Report', type: 'counterparty', channel: 'IPPB SFTP Node', defaultRecordCount: 9900 }
    ]
  },

  // 10. PREPAID CARD
  {
    id: 'prepaidcard_issuance',
    categoryId: 'prepaidcard',
    name: 'Prepaid Card Issuance & Load Recon',
    requiredFiles: [
      { id: 'ppc_mw', name: 'Card Management Gateway Log', type: 'internal', channel: 'GCP Bucket (gs://prod-isurecon/prepaid/)', defaultRecordCount: 8400 },
      { id: 'ppc_load', name: 'Card Issuance Load Ledger', type: 'internal', channel: 'GCP Bucket (gs://prod-isurecon/prepaid/)', defaultRecordCount: 8400 },
      { id: 'ppc_issuer', name: 'Issuer Bank Settlement File', type: 'counterparty', channel: 'Issuer Bank SFTP Node', defaultRecordCount: 8400 }
    ]
  },
  {
    id: 'prepaidcard_usage',
    categoryId: 'prepaidcard',
    name: 'Prepaid Card ATM & POS Usage Recon',
    requiredFiles: [
      { id: 'ppcuse_switch', name: 'Issuer Switch Transaction Journal', type: 'internal', channel: 'GCP Bucket (gs://prod-isurecon/prepaid/)', defaultRecordCount: 11500 },
      { id: 'ppcuse_clearing', name: 'Card Network Clearing File', type: 'counterparty', channel: 'NPCI / Visa Cleared SFTP', defaultRecordCount: 11500 }
    ]
  },
  {
    id: 'prepaidcard_ppi',
    categoryId: 'prepaidcard',
    name: 'PPI Wallet & Card Balance Recon',
    requiredFiles: [
      { id: 'ppi_wallet', name: 'PPI Core Wallet Log', type: 'internal', channel: 'GCP Bucket (gs://prod-isurecon/prepaid/)', defaultRecordCount: 9300 },
      { id: 'ppi_host', name: 'Card Host Clearing Report', type: 'counterparty', channel: 'Partner Issuer SFTP', defaultRecordCount: 9300 }
    ]
  }
];
