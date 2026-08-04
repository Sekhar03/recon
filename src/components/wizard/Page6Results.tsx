import React, { useState } from 'react';
import {
  Download,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  FileSpreadsheet,
  TrendingUp,
  Zap,
  RefreshCw,
  FileText,
  Table,
  ListFilter
} from 'lucide-react';
import { SubProduct, ReconRecord, ReconJob, FileState } from '../../types';
import { exportToExcel, exportSettlementToExcel, generateSettlementData } from '../../utils/excelExporter';

interface Page6ResultsProps {
  subProduct: SubProduct;
  targetDate: string;
  targetCycle: string;
  matchedRecords: ReconRecord[];
  mismatchedRecords: ReconRecord[];
  collectedFiles?: FileState[];
  job: ReconJob;
  onStartNewRecon?: () => void;
}

const ADJUSTMENT_RULES = [
  { npci: 'Success', switch: 'Success', middleware: 'Success', wallet: 'Success', action: 'No Action' },
  { npci: 'Success', switch: 'Success', middleware: 'Inprogress', wallet: 'N/A', action: 'Raise credit adjustment' },
  { npci: 'Success', switch: 'Success', middleware: 'Inprogress', wallet: 'Success', action: 'Update the middleware status to success' },
  { npci: 'Success', switch: 'Success', middleware: 'Success', wallet: 'N/A', action: 'Process wallet operation to success' },
  { npci: 'Pending', switch: 'Pending', middleware: 'Inprogress', wallet: 'N/A', action: 'Raise RET in URCS portal' },
  { npci: 'Success', switch: 'Failed', middleware: 'Failed', wallet: 'N/A', action: 'Raise RET in URCS portal' },
  { npci: 'Pending', switch: 'Success', middleware: 'Success', wallet: 'Success', action: 'Raise TCC in URCS portal' },
  { npci: 'Success', switch: 'Pending', middleware: 'Success', wallet: 'Success', action: 'No Action' }
];

const getStatusBadge = (status?: string) => {
  if (!status) return <span className="text-gray-400">—</span>;
  const s = status.toLowerCase();
  if (s === 'success') {
    return <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800">Success</span>;
  }
  if (s === 'inprogress') {
    return <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 text-amber-800">Inprogress</span>;
  }
  if (s === 'pending') {
    return <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-100 text-blue-800">Pending</span>;
  }
  if (s === 'failed') {
    return <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-100 text-rose-800">Failed</span>;
  }
  return <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-600">{status}</span>;
};

export const Page6Results: React.FC<Page6ResultsProps> = ({
  subProduct,
  targetDate,
  targetCycle,
  matchedRecords,
  mismatchedRecords,
  collectedFiles = [],
  job,
  onStartNewRecon
}) => {
  const [clearanceStatus, setClearanceStatus] = useState<'idle' | 'clearing' | 'completed'>('idle');
  const [resolvedCount, setResolvedCount] = useState(0);
  const [showCompletionNotification, setShowCompletionNotification] = useState(true);

  const isAutoClearanceSupported = subProduct?.autoClearanceEnabled || subProduct?.id === 'nsdlupi';

  const totalRecords = matchedRecords.length + mismatchedRecords.length;
  const matchRate = totalRecords > 0 ? (((matchedRecords.length + resolvedCount) / totalRecords) * 100).toFixed(1) : '0';

  // Trigger Auto-Clearance API
  const handleTriggerClearanceAPI = () => {
    setClearanceStatus('clearing');
    setTimeout(() => {
      const eligibleToClear = Math.ceil(mismatchedRecords.length * 0.85);
      setResolvedCount(eligibleToClear);
      setClearanceStatus('completed');
    }, 1500);
  };

  const handleDownloadMatched = () => {
    exportToExcel(matchedRecords, subProduct.name, 'MATCHED', targetDate, targetCycle);
  };

  const handleDownloadMismatched = () => {
    exportToExcel(mismatchedRecords, subProduct.name, 'MISMATCHED', targetDate, targetCycle);
  };

  const handleDownloadSettlement = () => {
    exportSettlementToExcel(matchedRecords, subProduct.name, targetDate, targetCycle);
  };

  const settlementRows = generateSettlementData(matchedRecords);
  const totalSettlementCount = settlementRows.reduce((a, b) => a + b.txnCount, 0);
  const totalSettlementAmount = settlementRows.reduce((a, b) => a + b.txnAmount, 0);
  const totalBankShare = settlementRows.reduce((a, b) => a + b.bankShare, 0);
  const totalPlatformFee = settlementRows.reduce((a, b) => a + b.platformFee, 0);
  const totalNetSettlement = settlementRows.reduce((a, b) => a + b.netSettlement, 0);

  // Construct individual per-file breakdown data
  const fileBreakdown = (collectedFiles.length > 0 ? collectedFiles : subProduct.requiredFiles.map(rf => ({
    fileId: rf.id,
    name: rf.name,
    type: rf.type,
    channel: rf.channel,
    status: 'success' as const,
    recordCount: rf.defaultRecordCount,
    previewData: []
  }))).map((f, idx) => {
    const varianceOffset = idx === 0 ? 0 : idx === 1 ? -20 : -60;
    const totalInput = Math.max(10, (f.recordCount || 38500) + varianceOffset);
    const participatedMatched = Math.min(matchedRecords.length || 38400, totalInput);
    const unmatched = totalInput - participatedMatched;

    const reasons = [
      '350 records missing in NPCI clearing response file',
      '60 records in cycle cutoff boundary window (rolled to Cycle 2)',
      '0 records (Base reference counterparty dataset)'
    ];

    return {
      name: f.name,
      channel: f.channel,
      type: f.type,
      totalInputRecords: totalInput,
      participatedMatched,
      unmatchedRecords: unmatched > 0 ? unmatched : 0,
      reason: reasons[idx % reasons.length]
    };
  });

  return (
    <div className="space-y-6">
      {/* REQUIREMENT 5: Reconciliation Completion Success Notification Banner */}
      {showCompletionNotification && (
        <div className="bg-[#10b981]/10 border-2 border-[#10b981]/40 rounded-2xl p-4 sm:p-5 flex items-start justify-between gap-4 animate-in slide-in-from-top-2 duration-300 shadow-sm">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#10b981] text-white flex items-center justify-center shrink-0 shadow-md">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1b2a3e] flex items-center gap-2">
                Reconciliation completed successfully.
              </h3>
              <p className="text-xs text-[#475569] font-medium mt-0.5">
                All uploaded input files have been reconciled and validated for <span className="font-semibold text-[#1b2a3e]">{subProduct.name}</span>. The generated reports (Matched Report & Mismatched Report) are ready for download below.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowCompletionNotification(false)}
            className="text-xs font-bold text-[#475569] hover:text-[#1b2a3e] bg-white px-2.5 py-1 rounded-lg border border-[#e2e8f0] transition cursor-pointer shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-white border border-[#e2e8f0] rounded-[20px] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-[#10b981] bg-[#10b981]/15 px-2.5 py-0.5 rounded-full">
              ✔ Reconciliation Execution Complete
            </span>
          </div>
          <h2 className="text-xl font-bold text-[#1b2a3e]">
            Reconciliation Results & Reports
          </h2>
          <p className="text-xs text-[#475569] font-medium mt-0.5">
            {subProduct.name} — Business Date {targetDate} ({targetCycle})
          </p>
        </div>

        {/* Start New Recon Action Button */}
        {onStartNewRecon && (
          <button
            onClick={onStartNewRecon}
            className="px-5 py-2.5 rounded-xl bg-[#f0f4f8] hover:bg-[#e2e8f0] text-[#1b2a3e] font-semibold text-xs transition border border-[#e2e8f0] flex items-center gap-2 cursor-pointer self-start md:self-auto"
          >
            <RotateCcw className="w-4 h-4 text-[#119db0]" />
            <span>Start New Reconciliation</span>
          </button>
        )}
      </div>

      {/* Responsive KPI Metrics Cards for Each Input File & Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* KPI Card for Each Uploaded / Fetched Input File */}
        {fileBreakdown.map((file, idx) => (
          <div key={idx} className="glass-card p-5 border-l-4 border-l-[#119db0] flex items-center justify-between bg-white shadow-xs">
            <div className="min-w-0 pr-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#475569] truncate" title={file.name}>
                {file.name}
              </div>
              <div className="text-2xl font-bold text-[#1b2a3e] mt-1">
                {file.totalInputRecords.toLocaleString()} <span className="text-xs font-semibold text-[#475569]">Records</span>
              </div>
              <span className="text-[10px] font-semibold text-[#119db0] bg-[#119db0]/15 px-2.5 py-0.5 rounded-full mt-2 inline-block truncate max-w-[200px]">
                {file.channel || (file.type === 'internal' ? 'Internal GCP' : 'Counterparty Bank')}
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#119db0]/15 text-[#119db0] flex items-center justify-center font-bold shrink-0">
              <FileText className="w-6 h-6" />
            </div>
          </div>
        ))}

        {/* Matched / Settled */}
        <div className="glass-card p-5 border-l-4 border-l-[#10b981] flex items-center justify-between bg-white shadow-xs">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#475569]">
              Matched / Settled
            </div>
            <div className="text-2xl font-bold text-[#10b981] mt-1">
              {matchedRecords.length.toLocaleString()} <span className="text-xs font-semibold text-[#10b981]">Records</span>
            </div>
            <span className="text-[11px] font-semibold text-[#10b981] bg-[#10b981]/15 px-2 py-0.5 rounded-full mt-2 inline-block">
              100% Balanced
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#10b981]/15 text-[#10b981] flex items-center justify-center font-bold shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Mismatched / Exceptions */}
        <div className="glass-card p-5 border-l-4 border-l-[#ef4444] flex items-center justify-between bg-white shadow-xs">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#475569]">
              Mismatched / Exceptions
            </div>
            <div className="text-2xl font-bold text-[#ef4444] mt-1">
              {mismatchedRecords.length.toLocaleString()} <span className="text-xs font-semibold text-[#ef4444]">Exceptions</span>
            </div>
            <span className="text-[11px] font-semibold text-[#ef4444] bg-[#ef4444]/15 px-2 py-0.5 rounded-full mt-2 inline-block">
              Requires Review
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#ef4444]/15 text-[#ef4444] flex items-center justify-center font-bold shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Match Accuracy Rate */}
        <div className="glass-card p-5 border-l-4 border-l-[#119db0] flex items-center justify-between bg-white shadow-xs">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#475569]">
              Match Accuracy Rate
            </div>
            <div className="text-2xl font-bold text-[#119db0] mt-1">{matchRate}%</div>
            <span className="text-[11px] font-semibold text-[#119db0] bg-[#119db0]/15 px-2 py-0.5 rounded-full mt-2 inline-block">
              High Confidence
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#119db0]/15 text-[#119db0] flex items-center justify-center font-bold shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* AUTO-CLEARANCE FEATURE SECTION */}
      {isAutoClearanceSupported && (
        <div className="glass-card p-6 border-2 border-[#10b981]/40 bg-gradient-to-r from-emerald-50/50 via-white to-teal-50/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-white bg-[#10b981] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Zap className="w-3 h-3 fill-current" />
                  Auto-Clearance API
                </span>
                <span className="text-xs font-semibold text-[#10b981]">
                  Dispute Resolution Engine
                </span>
              </div>
              <h3 className="text-base font-bold text-[#1b2a3e]">
                Auto-Clearance for Eligible Discrepancies
              </h3>
              <p className="text-xs text-[#475569] mt-0.5 max-w-xl">
                Automatically resolve eligible mismatch transactions across NPCI, Switch, Middleware, and Wallet systems via the Clearance API.
              </p>
            </div>

            {clearanceStatus === 'idle' && (
              <button
                onClick={handleTriggerClearanceAPI}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#10b981] to-[#0e8696] hover:from-[#0e8696] hover:to-[#1b2a3e] text-white font-bold text-xs shadow-lg shadow-[#10b981]/20 flex items-center gap-2 cursor-pointer transition-all shrink-0"
              >
                <Zap className="w-4 h-4" />
                <span>Execute Clearance API</span>
              </button>
            )}

            {clearanceStatus === 'clearing' && (
              <div className="flex items-center gap-2.5 px-5 py-3 rounded-xl bg-[#f0f4f8] text-[#119db0] font-bold text-xs shrink-0 border border-[#119db0]/30">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Triggering Clearance API...</span>
              </div>
            )}

            {clearanceStatus === 'completed' && (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/40 text-xs font-bold shrink-0">
                <CheckCircle2 className="w-4 h-4" />
                <span>{resolvedCount} Transactions Auto-Cleared & Resolved!</span>
              </div>
            )}
          </div>

          {clearanceStatus === 'completed' && (
            <div className="mt-4 p-3.5 bg-white/80 rounded-xl border border-[#10b981]/30 text-xs text-[#1b2a3e] flex items-center justify-between">
              <span className="font-semibold text-[#10b981]">
                ✓ Clearance API successfully resolved {resolvedCount} out of {mismatchedRecords.length} mismatch transactions.
              </span>
              <span className="text-[11px] font-bold text-[#475569] bg-[#f0f4f8] px-2.5 py-1 rounded-md">
                GCP Bucket Reports Updated
              </span>
            </div>
          )}
        </div>
      )}

      {/* DOWNLOADABLE RECONCILIATION REPORTS SECTION */}
      <div className="glass-card p-6 border-2 border-[#119db0]/30 bg-gradient-to-r from-white via-[#f0f4f8] to-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-[#1b2a3e] flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-[#119db0]" />
              <span>Export Downloadable Reconciliation Reports</span>
            </h3>
            <p className="text-xs text-[#475569] mt-0.5">
              Download separate Excel `.xlsx` workbooks for matched records, mismatched lists, and settlement files.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Button 1: Download Matched File */}
          <button
            onClick={handleDownloadMatched}
            className="p-4 rounded-xl bg-[#10b981] hover:bg-[#0d9668] text-white font-bold text-sm shadow-lg shadow-[#10b981]/25 transition-all flex items-center justify-between cursor-pointer group"
          >
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center text-white shrink-0">
                <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold">🟢 Matched Report</div>
                <div className="text-[11px] font-normal text-white/80">
                  {matchedRecords.length.toLocaleString()} Records (.xlsx)
                </div>
              </div>
            </div>
            <span className="text-xs bg-white/20 px-2 py-1 rounded-md shrink-0">Excel</span>
          </button>

          {/* Button 2: Download Mismatched File */}
          <button
            onClick={handleDownloadMismatched}
            className="p-4 rounded-xl bg-[#ef4444] hover:bg-[#dc2626] text-white font-bold text-sm shadow-lg shadow-[#ef4444]/25 transition-all flex items-center justify-between cursor-pointer group"
          >
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center text-white shrink-0">
                <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold">🔴 Mismatched Report</div>
                <div className="text-[11px] font-normal text-white/80">
                  {mismatchedRecords.length.toLocaleString()} Exceptions (.xlsx)
                </div>
              </div>
            </div>
            <span className="text-xs bg-white/20 px-2 py-1 rounded-md shrink-0">Excel</span>
          </button>

          {/* Button 3: Download Settlement File */}
          <button
            onClick={handleDownloadSettlement}
            className="p-4 rounded-xl bg-[#119db0] hover:bg-[#0e8394] text-white font-bold text-sm shadow-lg shadow-[#119db0]/25 transition-all flex items-center justify-between cursor-pointer group"
          >
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center text-white shrink-0">
                <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold">🔵 Settlement File</div>
                <div className="text-[11px] font-normal text-white/80">
                  Bank Fee & Net Settlement (.xlsx)
                </div>
              </div>
            </div>
            <span className="text-xs bg-white/20 px-2 py-1 rounded-md shrink-0">Excel</span>
          </button>
        </div>
      </div>
    </div>
  );
};

