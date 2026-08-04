export interface UserSession {
  username: string;
  role: string;
  title: string;
  isLoggedIn: boolean;
}

export type ModuleKey = 'product-recon' | 'job-archives';

export type BusinessVerticalId = 'agency-banking' | 'acquiring' | 'issuing' | 'bbps';

export interface Category {
  id: string;
  name: string;
  iconName: string;
  verticalId: BusinessVerticalId;
  verticalName: string;
}

export interface RequiredSourceFile {
  id: string;
  name: string;
  type: 'internal' | 'counterparty';
  channel: string; // e.g. "GCP Bucket (gs://prod-isurecon/...)" or "SFTP Bank Portal"
  defaultRecordCount: number;
}

export interface MatchingCriteriaRule {
  system: string;
  matchingKey: string;
  amountField: string;
  statusField: string;
  rrnField?: string;
  payerVpaField?: string;
}

export interface SampleReportLink {
  name: string;
  url: string;
}

export interface SubProduct {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
  highlights?: string[];
  autoClearanceEnabled?: boolean;
  sampleReports?: SampleReportLink[];
  matchingCriteriaRules?: MatchingCriteriaRule[];
  requiredFiles: RequiredSourceFile[];
}

export interface FileState {
  fileId: string;
  name: string;
  type: 'internal' | 'counterparty';
  channel: string;
  status: 'pending' | 'fetching' | 'success';
  recordCount: number;
  previewData: Record<string, any>[];
}

export interface ReconRecord {
  id: string;
  txnId: string;
  rrn: string;
  agentId: string;
  amount: number;
  status: 'matched' | 'mismatched';
  npciStatus?: string;
  switchStatus?: string;
  middlewareStatus?: string;
  walletStatus?: string;
  discrepancyReason?: string;
  actionToBeTaken?: string;
  timestamp: string;
  channel: string;
}

export interface ReconJob {
  id: string;
  subProductId: string;
  subProductName: string;
  categoryName: string;
  date: string;
  cycle: string;
  totalRecords: number;
  matchedRecords: number;
  mismatchedRecords: number;
  matchRate: number;
  status: 'Completed';
  createdAt: string;
  matchedData: ReconRecord[];
  mismatchedData: ReconRecord[];
}
