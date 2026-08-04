import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  CloudDownload,
  UploadCloud,
  CheckCircle2,
  Database,
  FileText,
  ArrowLeft,
  ArrowRight,
  Play,
  Loader2,
  Check,
  Server
} from 'lucide-react';
import { SubProduct, RequiredSourceFile, FileState } from '../../types';

interface Page4FileCollectionProps {
  subProduct: SubProduct;
  targetDate: string;
  targetCycle: string;
  onProceedToProcessing: (collectedFiles: FileState[]) => void;
  onBackToDateCycle: () => void;
}

export const Page4FileCollection: React.FC<Page4FileCollectionProps> = ({
  subProduct,
  targetDate,
  targetCycle,
  onProceedToProcessing,
  onBackToDateCycle
}) => {
  const [currentFileIndex, setCurrentFileIndex] = useState(0);

  // Re-order requiredFiles so manual upload files (counterparty) come FIRST in sequence
  const requiredFiles = useMemo(() => {
    const manualFiles = subProduct.requiredFiles.filter((f) => f.type === 'counterparty');
    const autoFiles = subProduct.requiredFiles.filter((f) => f.type !== 'counterparty');
    return [...manualFiles, ...autoFiles];
  }, [subProduct.id]);

  const safeFileIndex = Math.min(
    Math.max(0, currentFileIndex),
    Math.max(0, requiredFiles.length - 1)
  );
  const activeFile = requiredFiles[safeFileIndex] || requiredFiles[0];

  // Initialize file states - all start as 'pending'
  const [fileStates, setFileStates] = useState<Record<string, FileState>>(() => {
    const initial: Record<string, FileState> = {};
    requiredFiles.forEach((f) => {
      initial[f.id] = {
        fileId: f.id,
        name: f.name,
        type: f.type,
        channel: f.channel,
        status: 'pending',
        recordCount: f.defaultRecordCount,
        previewData: []
      };
    });
    return initial;
  });

  // Track currentFileIndex in a ref for safe timer callbacks
  const currentFileIndexRef = useRef(currentFileIndex);
  useEffect(() => {
    currentFileIndexRef.current = currentFileIndex;
  }, [currentFileIndex]);

  // Fetch progress for internal files (0% to 100%)
  const [fetchProgress, setFetchProgress] = useState<Record<string, number>>(() => {
    const p: Record<string, number> = {};
    requiredFiles.forEach((f) => {
      p[f.id] = 0;
    });
    return p;
  });

  // Helper to generate preview sample records
  const generatePreviewRecords = (f: RequiredSourceFile) => {
    const dateFormatted = targetDate.replace(/-/g, '');
    const sample = [];
    for (let i = 1; i <= 5; i++) {
      const pad = String(i).padStart(5, '0');
      sample.push({
        'Txn ID': `TXN${dateFormatted}${pad}`,
        'RRN': `4208${dateFormatted.slice(2)}${pad}`,
        'Agent ID': `AGNT-${1000 + i * 12}`,
        'Amount (₹)': (i * 500).toFixed(2),
        'Channel': f.channel.includes('GCP') ? 'GCP Bucket' : 'SFTP',
        'Status': 'SUCCESS'
      });
    }
    return sample;
  };

  const processingSetRef = useRef<Set<string>>(new Set());

  // Helper to check if a file tab/step is unlocked
  const isFileUnlocked = (idx: number) => {
    if (idx === 0) return true;
    for (let i = 0; i < idx; i++) {
      if (fileStates[requiredFiles[i]?.id]?.status !== 'success') {
        return false;
      }
    }
    return true;
  };

  // Helper to safely navigate to next file or complete step
  const advanceToNextStep = (latestStates: Record<string, FileState>) => {
    const activeIdx = currentFileIndexRef.current;
    if (activeIdx < requiredFiles.length - 1) {
      setCurrentFileIndex(activeIdx + 1);
    } else {
      const allSuccess = requiredFiles.every(f => latestStates[f.id]?.status === 'success');
      if (allSuccess) {
        onProceedToProcessing(Object.values(latestStates));
      }
    }
  };

  // Automatic Cloud Fetching effect when an internal file becomes active
  useEffect(() => {
    const currentFile = requiredFiles[currentFileIndex];
    if (!currentFile || currentFile.type !== 'internal') return;

    if (fileStates[currentFile.id]?.status === 'success') return;
    if (processingSetRef.current.has(currentFile.id)) return;

    processingSetRef.current.add(currentFile.id);

    setFileStates(prev => ({
      ...prev,
      [currentFile.id]: {
        ...prev[currentFile.id],
        status: 'fetching'
      }
    }));
    setFetchProgress(prev => ({ ...prev, [currentFile.id]: 0 }));

    let progress = 0;
    let isCompleted = false;

    const interval = setInterval(() => {
      progress += 10;
      if (progress >= 100) {
        isCompleted = true;
        clearInterval(interval);
        setFetchProgress(prev => ({ ...prev, [currentFile.id]: 100 }));

        const previewRecords = generatePreviewRecords(currentFile);
        let updatedStates: Record<string, FileState> = {};

        setFileStates(prev => {
          updatedStates = {
            ...prev,
            [currentFile.id]: {
              ...prev[currentFile.id],
              status: 'success',
              previewData: previewRecords
            }
          };
          return updatedStates;
        });

        // Slight delay after completion so user clearly sees step verified before moving
        setTimeout(() => {
          advanceToNextStep(updatedStates);
        }, 800);
      } else {
        setFetchProgress(prev => ({ ...prev, [currentFile.id]: progress }));
      }
    }, 120);

    return () => {
      clearInterval(interval);
      if (!isCompleted) {
        processingSetRef.current.delete(currentFile.id);
      }
    };
  }, [currentFileIndex, requiredFiles]);

  // Handle manual file upload / drop: uploads file and auto-fetches all internal backend files instantly without UI fetching animations
  const handleUploadFile = (f: RequiredSourceFile) => {
    if (processingSetRef.current.has(f.id)) return;
    processingSetRef.current.add(f.id);

    setFileStates(prev => ({
      ...prev,
      [f.id]: {
        ...prev[f.id],
        status: 'fetching'
      }
    }));
    setFetchProgress(prev => ({ ...prev, [f.id]: 0 }));

    let progress = 0;
    const interval = setInterval(() => {
      progress += 20; // 5 steps * 100ms = 500ms upload
      if (progress >= 100) {
        clearInterval(interval);
        setFetchProgress(prev => ({ ...prev, [f.id]: 100 }));

        const previewRecords = generatePreviewRecords(f);
        
        // Prepare final states for ALL required files for this subproduct
        const finalStates: Record<string, FileState> = {};
        
        requiredFiles.forEach((reqFile) => {
          if (reqFile.id === f.id) {
            finalStates[reqFile.id] = {
              fileId: reqFile.id,
              name: reqFile.name,
              type: reqFile.type,
              channel: reqFile.channel,
              status: 'success',
              recordCount: reqFile.defaultRecordCount,
              previewData: previewRecords
            };
          } else {
            // Auto-fetch internal files (Middleware, Switch, CBS) in backend without showing fetching animation UI
            finalStates[reqFile.id] = {
              fileId: reqFile.id,
              name: reqFile.name,
              type: reqFile.type,
              channel: reqFile.channel,
              status: 'success',
              recordCount: reqFile.defaultRecordCount,
              previewData: generatePreviewRecords(reqFile)
            };
          }
        });

        setFileStates(finalStates);

        // Immediately trigger RECON INITIATED popup
        setTimeout(() => {
          onProceedToProcessing(Object.values(finalStates));
        }, 300);
      } else {
        setFetchProgress(prev => ({ ...prev, [f.id]: progress }));
      }
    }, 100);
  };

  const currentFileState = (activeFile && fileStates[activeFile.id]) || {
    fileId: activeFile?.id || '',
    name: activeFile?.name || '',
    type: activeFile?.type || 'counterparty',
    channel: activeFile?.channel || '',
    status: 'pending' as const,
    recordCount: activeFile?.defaultRecordCount || 0,
    previewData: []
  };
  const allFilesReady = requiredFiles.every(f => fileStates[f.id]?.status === 'success');

  return (
    <div className="space-y-6">
      {/* Top Banner Info with Prominent Upper Back Button */}
      <div className="bg-white border border-[#e2e8f0] rounded-[20px] p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e2e8f0]">
          <button
            onClick={onBackToDateCycle}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#1b2a3e] hover:bg-[#119db0] text-white text-xs font-bold transition-all shadow-md hover:shadow-lg shadow-[#1b2a3e]/15 group cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Date & Cycle Selection</span>
          </button>

          <span className="text-xs font-bold text-[#10b981] bg-[#10b981]/10 border border-[#10b981]/30 px-3.5 py-1.5 rounded-full self-start sm:self-auto">
            {subProduct.name} ({targetDate})
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
          <div>
            <h2 className="text-xl font-bold text-[#1b2a3e]">
              File Collection & Data Fetching
            </h2>
            <p className="text-xs text-[#475569] font-medium mt-0.5">
              Collecting <span className="font-semibold text-[#1b2a3e]">{requiredFiles.length} source files</span> for {subProduct.name} ({targetDate} - {targetCycle})
            </p>
          </div>

          <button
            disabled={!allFilesReady}
            onClick={() => onProceedToProcessing(Object.values(fileStates))}
            className={`px-6 py-3 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-md ${
              allFilesReady
                ? 'bg-[#10b981] hover:bg-[#0d9668] text-white shadow-[#10b981]/25 ring-2 ring-[#10b981]/50'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
            }`}
          >
            <span>Start Reconciliation Engine</span>
            <Play className="w-4 h-4 fill-current" />
          </button>
        </div>
      </div>

      {/* File Stepper Tabs */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2">
        {requiredFiles.map((f, idx) => {
          const state = fileStates[f.id];
          const isCurrent = idx === currentFileIndex;
          const isSuccess = state?.status === 'success';
          const unlocked = isFileUnlocked(idx);

          return (
            <button
              key={f.id}
              disabled={!unlocked}
              onClick={() => {
                if (unlocked) setCurrentFileIndex(idx);
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all border shrink-0 ${
                !unlocked
                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
                  : isCurrent
                  ? 'bg-[#1b2a3e] text-white border-[#1b2a3e] shadow-md cursor-pointer'
                  : isSuccess
                  ? 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/30 hover:bg-[#10b981]/20 cursor-pointer'
                  : 'bg-white text-[#475569] border-[#e2e8f0] hover:bg-[#f0f4f8] cursor-pointer'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${
                  isSuccess
                    ? 'bg-[#10b981] text-white'
                    : isCurrent
                    ? 'bg-[#119db0] text-white'
                    : unlocked
                    ? 'bg-[#e2e8f0] text-[#475569]'
                    : 'bg-slate-200 text-slate-400'
                }`}
              >
                {isSuccess ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : idx + 1}
              </div>
              <span>
                File {idx + 1} of {requiredFiles.length}: {f.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Dedicated File Card */}
      <div className="glass-card p-8 space-y-6">
        {/* File Header Details */}
        <div className="flex items-center justify-between pb-6 border-b border-[#e2e8f0]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#119db0]/10 text-[#119db0] flex items-center justify-center font-bold">
              {activeFile.type === 'internal' ? (
                <Server className="w-6 h-6" />
              ) : (
                <FileText className="w-6 h-6" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#119db0]">
                  Source File {currentFileIndex + 1} of {requiredFiles.length}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    activeFile.type === 'internal'
                      ? 'bg-[#119db0]/15 text-[#119db0]'
                      : 'bg-[#23c5da]/15 text-[#0e8696]'
                  }`}
                >
                  {activeFile.type === 'internal' ? 'Internal GCP Log' : 'Counterparty Bank File'}
                </span>
              </div>
              <h3 className="text-xl font-bold text-[#1b2a3e] mt-0.5">{activeFile.name}</h3>
              <p className="text-xs text-[#475569] mt-0.5">Channel: {activeFile.channel}</p>
            </div>
          </div>
        </div>

        {/* FILE UPLOAD & FETCHING SECTION */}
        <div className="space-y-6">
          {currentFileState.status === 'pending' && (
            <div
              onClick={() => handleUploadFile(activeFile)}
              className="p-10 rounded-2xl border-2 border-dashed border-[#119db0]/40 hover:border-[#119db0] bg-[#f0f4f8] hover:bg-[#119db0]/5 text-center cursor-pointer transition-all group"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#119db0]/10 text-[#119db0] group-hover:scale-110 flex items-center justify-center mx-auto mb-3 transition-transform">
                <UploadCloud className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-base text-[#1b2a3e]">
                Drag & Drop {activeFile.name} Here
              </h4>
              <p className="text-xs text-[#475569] mt-1">
                Supports .csv, .txt, .xlsx files ({activeFile.channel})
              </p>
              <div className="mt-5 flex items-center justify-center">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUploadFile(activeFile);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#119db0] text-white font-semibold text-xs shadow-md shadow-[#119db0]/20 hover:bg-[#0e8696] transition cursor-pointer"
                >
                  Browse or Upload File
                </button>
              </div>
            </div>
          )}

          {currentFileState.status === 'fetching' && (
            <div className="p-8 rounded-2xl bg-[#f0f4f8] border border-[#e2e8f0] text-center space-y-4 animate-in fade-in duration-200">
              <div className="w-14 h-14 rounded-2xl bg-[#119db0]/15 text-[#119db0] flex items-center justify-center mx-auto shadow-sm">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
              <div>
                <h4 className="font-bold text-base text-[#1b2a3e]">
                  {activeFile.type === 'internal'
                    ? 'Fetching records from GCP cloud storage...'
                    : 'Uploading & validating file records...'}
                </h4>
                <p className="text-xs text-[#475569] mt-1">
                  {activeFile.type === 'internal'
                    ? `Connecting to auto-ingestion bucket (${activeFile.channel})`
                    : `Processing manual upload file through portal (${activeFile.channel})`}
                </p>
              </div>

              {/* Animated Progress Bar */}
              <div className="w-full max-w-md mx-auto bg-[#e2e8f0] h-3.5 rounded-full overflow-hidden p-0.5 border border-[#cbd5e1]">
                <div
                  className="bg-gradient-to-r from-[#119db0] via-[#23c5da] to-[#10b981] h-full rounded-full transition-all duration-100 ease-linear"
                  style={{ width: `${fetchProgress[activeFile.id] || 0}%` }}
                />
              </div>
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#119db0]">
                <span>{fetchProgress[activeFile.id] || 0}% Loaded</span>
                <span className="text-[#94a3b8]">•</span>
                <span className="text-[#475569] font-medium">Validating schema & parsing records...</span>
              </div>
            </div>
          )}

          {currentFileState.status === 'success' && (
            <div className="p-6 rounded-2xl bg-[#10b981]/10 border border-[#10b981]/30 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#10b981] text-white flex items-center justify-center shrink-0 shadow-md">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-base text-[#1b2a3e]">
                    ✔ {activeFile.name} Verified & Loaded!
                  </h4>
                  <span className="text-xs font-bold bg-[#10b981] text-white px-3 py-1 rounded-full">
                    {activeFile.defaultRecordCount.toLocaleString()} Records Active
                  </span>
                </div>
                <p className="text-xs text-[#475569] mt-1">
                  File uploaded and schema validated successfully for business date {targetDate}.
                </p>
              </div>
            </div>
          )}
        </div>



        {/* Navigation buttons */}
        <div className="pt-6 flex items-center justify-between border-t border-[#e2e8f0]">
          <button
            type="button"
            disabled={currentFileIndex === 0}
            onClick={() => setCurrentFileIndex((prev) => Math.max(0, prev - 1))}
            className={`px-5 py-2.5 rounded-xl border font-semibold text-xs transition cursor-pointer ${
              currentFileIndex === 0
                ? 'opacity-50 cursor-not-allowed border-slate-200 text-slate-400'
                : 'border-[#e2e8f0] hover:bg-[#f0f4f8] text-[#1b2a3e]'
            }`}
          >
            ← Previous File
          </button>

          {currentFileIndex < requiredFiles.length - 1 ? (
            <button
              type="button"
              disabled={currentFileState.status !== 'success'}
              onClick={() => {
                if (currentFileState.status === 'success') {
                  setCurrentFileIndex((prev) => prev + 1);
                }
              }}
              className={`px-6 py-2.5 rounded-xl font-semibold text-xs transition shadow-md flex items-center gap-2 ${
                currentFileState.status === 'success'
                  ? 'bg-[#119db0] hover:bg-[#0e8696] text-white shadow-[#119db0]/20 cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              <span>Next File ({currentFileIndex + 2} of {requiredFiles.length})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={!allFilesReady}
              onClick={() => onProceedToProcessing(Object.values(fileStates))}
              className={`px-6 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 cursor-pointer shadow-md ${
                allFilesReady
                  ? 'bg-[#10b981] hover:bg-[#0d9668] text-white shadow-[#10b981]/25 ring-2 ring-[#10b981]/50'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>Start Reconciliation Engine</span>
              <Play className="w-4 h-4 fill-current" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
