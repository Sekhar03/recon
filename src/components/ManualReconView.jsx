import React, { useState, useEffect, useRef } from 'react';
import { getCategories, getProductsByCategory, getProductById } from '../utils/productConfigs';
import { runRecon, exportToExcel, exportReconResults } from '../utils/manualReconEngine';
import {
  Play, CheckCircle, Clock, Upload, Download, RefreshCw, AlertTriangle,
  ChevronRight, FileText, Check, Search, X, ArrowLeft, Layers, Database,
  Filter, ChevronDown
} from 'lucide-react';

const steps = [
  { id: 1, label: 'Select Product' },
  { id: 2, label: 'Upload Data' },
  { id: 3, label: 'Processing' },
  { id: 4, label: 'Results' }
];

export default function ManualReconView() {
  const [currentStep, setCurrentStep] = useState(1);
  const [categories, setCategories] = useState([]);

  // Step 1 State
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [availableProducts, setAvailableProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [businessDate, setBusinessDate] = useState(new Date().toISOString().split('T')[0]);

  // Step 2 State
  const [productConfig, setProductConfig] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [filePreviews, setFilePreviews] = useState({});
  const [dragActive, setDragActive] = useState(null);

  // Step 3 State
  const [processingStatus, setProcessingStatus] = useState('idle'); // idle, processing, completed, error
  const [processingLogs, setProcessingLogs] = useState([]);
  const [currentProcStepIndex, setCurrentProcStepIndex] = useState(-1);
  const logsEndRef = useRef(null);

  // Step 4 State
  const [reconResults, setReconResults] = useState(null);
  const [activeTab, setActiveTab] = useState('mismatched');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 50;

  useEffect(() => {
    try {
      const cats = getCategories();
      setCategories(cats || []);
    } catch (e) {
      console.warn("Failed to get categories", e);
    }
  }, []);

  useEffect(() => {
    if (selectedCategoryId) {
      try {
        const prods = getProductsByCategory(selectedCategoryId);
        setAvailableProducts(prods || []);
      } catch (e) {
        console.warn("Failed to get products", e);
      }
      setSelectedProductId('');
    }
  }, [selectedCategoryId]);

  useEffect(() => {
    if (selectedProductId) {
      try {
        const config = getProductById(selectedProductId);
        setProductConfig(config);
      } catch (e) {
        console.warn("Failed to get product config", e);
      }
      setUploadedFiles({});
      setFilePreviews({});
    } else {
      setProductConfig(null);
    }
  }, [selectedProductId]);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [processingLogs]);

  // --- Step 1 Handlers ---
  const handleProceedToStep2 = () => {
    if (selectedProductId && businessDate) {
      setCurrentStep(2);
    }
  };

  // --- Step 2 Handlers ---
  const handleDrag = (e, sourceKey) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(sourceKey);
    } else if (e.type === "dragleave") {
      setDragActive(null);
    }
  };

  const handleDrop = (e, sourceKey) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(null);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0], sourceKey);
    }
  };

  const handleFileInput = (e, sourceKey) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0], sourceKey);
    }
  };

  const handleFile = (file, sourceKey) => {
    setUploadedFiles(prev => ({ ...prev, [sourceKey]: file }));
    
    // Simulate preview generation
    setTimeout(() => {
      setFilePreviews(prev => ({
        ...prev,
        [sourceKey]: {
          cols: ['ID', 'Amount', 'Date', 'Status'],
          rows: [
            ['1001', '500.00', '2023-10-01', 'Settled'],
            ['1002', '1250.50', '2023-10-01', 'Pending'],
            ['1003', '75.25', '2023-10-02', 'Settled']
          ]
        }
      }));
    }, 500);
  };

  const removeFile = (sourceKey) => {
    setUploadedFiles(prev => {
      const newFiles = { ...prev };
      delete newFiles[sourceKey];
      return newFiles;
    });
    setFilePreviews(prev => {
      const newPreviews = { ...prev };
      delete newPreviews[sourceKey];
      return newPreviews;
    });
  };

  const canProceedToStep3 = () => {
    if (!productConfig || !productConfig.sources) return false;
    return productConfig.sources.every(src => {
      if (src.required) return !!uploadedFiles[src.key];
      return true;
    });
  };

  const handleStartRecon = async () => {
    setCurrentStep(3);
    setProcessingStatus('processing');
    setProcessingLogs([]);
    setCurrentProcStepIndex(0);

    try {
      const results = await runRecon(productConfig, uploadedFiles, (stepIndex, message, status) => {
        setCurrentProcStepIndex(stepIndex);
        setProcessingLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), message, status, stepIndex }]);
      });
      
      setReconResults(results);
      setProcessingStatus('completed');
      setTimeout(() => {
        setCurrentStep(4);
      }, 1500);
    } catch (error) {
      console.error(error);
      setProcessingStatus('error');
      setProcessingLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), message: `Error: ${error.message}`, status: 'error' }]);
    }
  };

  // --- Step 4 Handlers ---
  const handleReset = () => {
    setCurrentStep(1);
    setSelectedCategoryId('');
    setSelectedProductId('');
    setProductConfig(null);
    setUploadedFiles({});
    setFilePreviews({});
    setReconResults(null);
    setProcessingLogs([]);
    setProcessingStatus('idle');
  };

  const getFilteredData = () => {
    if (!reconResults) return [];
    let data = [];
    if (activeTab === 'matched') data = reconResults.matchedData;
    else if (activeTab === 'mismatched') data = reconResults.mismatchedData;
    else data = reconResults.allData;

    if (searchQuery) {
      const lowerQ = searchQuery.toLowerCase();
      return data.filter(row => 
        Object.values(row).some(val => 
          String(val).toLowerCase().includes(lowerQ)
        )
      );
    }
    return data;
  };

  const filteredData = getFilteredData();
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  const dataColumns = filteredData.length > 0 ? Object.keys(filteredData[0]) : [];

  // --- Render Helpers ---
  const renderStepper = () => (
    <div className="glass-card" style={{ padding: '20px 32px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      {steps.map((step, index) => {
        const isActive = step.id === currentStep;
        const isCompleted = step.id < currentStep;
        
        return (
          <div key={step.id} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1 }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: isActive ? 'var(--primary)' : (isCompleted ? 'var(--success)' : 'transparent'),
                border: `2px solid ${isActive ? 'var(--primary)' : (isCompleted ? 'var(--success)' : 'var(--border)')}`,
                color: (isActive || isCompleted) ? '#fff' : 'var(--text-secondary)',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}>
                {isCompleted ? <Check size={18} /> : step.id}
              </div>
              <span style={{ 
                marginTop: '8px', fontSize: '0.85rem', fontWeight: isActive ? '600' : '400',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)'
              }}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div style={{ flex: 1, height: '2px', backgroundColor: isCompleted ? 'var(--success)' : 'var(--border)', margin: '0 16px', marginTop: '-24px', transition: 'all 0.3s ease' }} />
            )}
          </div>
        );
      })}
    </div>
  );

  const renderStep1 = () => (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h2 style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers className="text-primary" size={24} /> Select Category
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>Choose the asset class or product category you want to reconcile.</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {categories.map(cat => (
            <div 
              key={cat.id} 
              className="glass-card"
              onClick={() => setSelectedCategoryId(cat.id)}
              style={{
                padding: '24px', cursor: 'pointer', position: 'relative', overflow: 'hidden',
                borderColor: selectedCategoryId === cat.id ? 'var(--primary)' : 'var(--border)',
                backgroundColor: selectedCategoryId === cat.id ? 'rgba(17, 157, 176, 0.05)' : '',
                transform: selectedCategoryId === cat.id ? 'translateY(-2px)' : 'none',
                boxShadow: selectedCategoryId === cat.id ? '0 8px 24px rgba(0,0,0,0.05)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ fontSize: '2.5rem', lineHeight: 1 }}>{cat.icon || '📦'}</div>
                {selectedCategoryId === cat.id && (
                  <div style={{ backgroundColor: 'var(--primary)', color: 'white', borderRadius: '50%', padding: '4px' }}>
                    <Check size={16} />
                  </div>
                )}
              </div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem' }}>{cat.name}</h3>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.4' }}>{cat.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {selectedCategoryId && (
        <div className="animate-fade-in glass-card" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>Configuration</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Sub-Product</label>
              <div style={{ position: 'relative' }}>
                <select 
                  className="settings-input" 
                  value={selectedProductId} 
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  style={{ width: '100%', appearance: 'none', paddingRight: '40px' }}
                >
                  <option value="">Select a product...</option>
                  {availableProducts.map(prod => (
                    <option key={prod.id} value={prod.id}>{prod.name}</option>
                  ))}
                </select>
                <ChevronDown size={18} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', pointerEvents: 'none' }} />
              </div>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Business Date</label>
              <input 
                type="date" 
                className="settings-input" 
                value={businessDate}
                onChange={(e) => setBusinessDate(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px' }}>
            <button 
              className="btn btn-primary" 
              onClick={handleProceedToStep2}
              disabled={!selectedProductId || !businessDate}
              style={{ padding: '10px 24px' }}
            >
              Proceed to Upload <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderStep2 = () => {
    if (!productConfig) return null;
    
    return (
      <div className="animate-fade-in glass-card" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
          <button className="btn btn-outline" onClick={() => setCurrentStep(1)} style={{ marginRight: '16px', padding: '8px' }}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Database className="text-primary" size={24} /> Upload Data Sources
            </h2>
            <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)' }}>
              Reconciling: <strong>{productConfig.name}</strong> for {businessDate}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '32px' }}>
          {productConfig.sources && productConfig.sources.map((source) => {
            const isUploaded = !!uploadedFiles[source.key];
            const isDragActive = dragActive === source.key;
            
            return (
              <div key={source.key} style={{ 
                border: '1px solid var(--border)', 
                borderRadius: '8px', 
                overflow: 'hidden',
                backgroundColor: 'var(--bg-card)'
              }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', backgroundColor: 'rgba(0,0,0,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{source.label}</h3>
                    {source.required ? (
                      <span className="badge badge-warning">Required</span>
                    ) : (
                      <span className="badge" style={{ backgroundColor: 'var(--border)', color: 'var(--text-secondary)' }}>Optional</span>
                    )}
                  </div>
                  {isUploaded && <span className="badge badge-success" style={{ display: 'flex', gap: '4px', alignItems: 'center' }}><CheckCircle size={14}/> Uploaded</span>}
                </div>
                
                <div style={{ padding: '24px' }}>
                  {!isUploaded ? (
                    <div 
                      onDragEnter={(e) => handleDrag(e, source.key)}
                      onDragLeave={(e) => handleDrag(e, source.key)}
                      onDragOver={(e) => handleDrag(e, source.key)}
                      onDrop={(e) => handleDrop(e, source.key)}
                      style={{
                        border: `2px dashed ${isDragActive ? 'var(--primary)' : 'var(--border)'}`,
                        borderRadius: '8px',
                        padding: '40px 20px',
                        textAlign: 'center',
                        backgroundColor: isDragActive ? 'rgba(17, 157, 176, 0.05)' : 'transparent',
                        transition: 'all 0.2s',
                        cursor: 'pointer'
                      }}
                      onClick={() => document.getElementById(`file-upload-${source.key}`).click()}
                    >
                      <input 
                        type="file" 
                        id={`file-upload-${source.key}`}
                        style={{ display: 'none' }} 
                        accept=".csv, .xlsx, .xls"
                        onChange={(e) => handleFileInput(e, source.key)}
                      />
                      <Upload size={32} color={isDragActive ? 'var(--primary)' : 'var(--text-secondary)'} style={{ marginBottom: '16px' }} />
                      <p style={{ margin: '0 0 8px 0', fontWeight: '500', color: isDragActive ? 'var(--primary)' : 'var(--text-primary)' }}>
                        Drag & drop file here or click to browse
                      </p>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        Supports CSV, XLSX up to 50MB
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', backgroundColor: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <FileText size={24} className="text-success" />
                          <div>
                            <p style={{ margin: '0 0 4px 0', fontWeight: '500' }}>{uploadedFiles[source.key].name}</p>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                              {(uploadedFiles[source.key].size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button className="btn btn-outline" onClick={() => removeFile(source.key)} style={{ padding: '6px' }}>
                          <X size={16} />
                        </button>
                      </div>
                      
                      {filePreviews[source.key] && (
                        <div>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Data Preview (first 3 rows)</p>
                          <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: '6px' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                              <thead>
                                <tr>
                                  {filePreviews[source.key].cols.map((col, i) => (
                                    <th key={i} style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-hover)', color: 'var(--text-secondary)', fontWeight: '500' }}>{col}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {filePreviews[source.key].rows.map((row, i) => (
                                  <tr key={i}>
                                    {row.map((cell, j) => (
                                      <td key={j} style={{ padding: '8px 12px', borderBottom: i < 2 ? '1px solid var(--border)' : 'none', color: 'var(--text-primary)' }}>{cell}</td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px', gap: '16px' }}>
          <button 
            className="btn btn-primary" 
            onClick={handleStartRecon}
            disabled={!canProceedToStep3()}
            style={{ padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Play size={18} /> Start Reconciliation
          </button>
        </div>
      </div>
    );
  };

  const renderStep3 = () => (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="glass-card" style={{ padding: '32px', textAlign: 'center' }}>
        {processingStatus === 'processing' && (
          <div style={{ marginBottom: '24px' }}>
            <RefreshCw size={48} className="text-primary" style={{ animation: 'spin 2s linear infinite', margin: '0 auto' }} />
            <h2 style={{ marginTop: '16px', marginBottom: '8px' }}>Reconciliation in Progress</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Running matching engine rules for {productConfig?.name}...</p>
          </div>
        )}
        {processingStatus === 'completed' && (
          <div style={{ marginBottom: '24px' }}>
            <CheckCircle size={48} className="text-success" style={{ margin: '0 auto' }} />
            <h2 style={{ marginTop: '16px', marginBottom: '8px' }}>Reconciliation Complete</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Preparing results dashboard...</p>
          </div>
        )}
        {processingStatus === 'error' && (
          <div style={{ marginBottom: '24px' }}>
            <AlertTriangle size={48} className="text-danger" style={{ margin: '0 auto' }} />
            <h2 style={{ marginTop: '16px', marginBottom: '8px' }}>Processing Failed</h2>
            <p style={{ color: 'var(--text-secondary)' }}>An error occurred during reconciliation.</p>
            <button className="btn btn-outline" onClick={() => setCurrentStep(2)} style={{ marginTop: '16px' }}>Go Back</button>
          </div>
        )}

        {/* Steps Pipeline */}
        {productConfig?.steps && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '600px', margin: '0 auto', textAlign: 'left' }}>
            {productConfig.steps.map((step, idx) => {
              const isPast = currentProcStepIndex > idx || processingStatus === 'completed';
              const isCurrent = currentProcStepIndex === idx && processingStatus === 'processing';
              const isFuture = currentProcStepIndex < idx;
              
              let statusIcon = <Clock size={16} color="var(--text-secondary)" />;
              let borderColor = 'var(--border)';
              
              if (isPast) {
                statusIcon = <CheckCircle size={16} className="text-success" />;
                borderColor = 'var(--success)';
              } else if (isCurrent) {
                statusIcon = <RefreshCw size={16} className="text-primary" style={{ animation: 'spin 2s linear infinite' }} />;
                borderColor = 'var(--primary)';
              }

              return (
                <div key={idx} className="pipeline-step" style={{ 
                  display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', 
                  border: `1px solid ${borderColor}`, borderRadius: '8px',
                  backgroundColor: isCurrent ? 'rgba(17, 157, 176, 0.05)' : 'transparent',
                  opacity: isFuture ? 0.6 : 1,
                  transition: 'all 0.3s'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px' }}>
                    {statusIcon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontWeight: '500', color: isCurrent ? 'var(--primary)' : 'var(--text-primary)' }}>{step.name}</p>
                  </div>
                  {isCurrent && <span className="badge badge-warning">Processing</span>}
                  {isPast && <span className="badge badge-success">Done</span>}
                  {isFuture && <span className="badge" style={{ backgroundColor: 'var(--border)' }}>Waiting</span>}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Terminal Output */}
      <div className="glass-card" style={{ padding: '0', overflow: 'hidden', backgroundColor: '#1b2a3e', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ padding: '12px 16px', backgroundColor: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={16} color="#8b9bb4" />
          <span style={{ color: '#8b9bb4', fontSize: '0.85rem', fontFamily: 'monospace' }}>Engine Logs</span>
        </div>
        <div style={{ padding: '16px', height: '250px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '0.85rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {processingLogs.length === 0 && <span style={{ color: '#64748b' }}>Waiting for engine to start...</span>}
          {processingLogs.map((log, i) => {
            let color = '#cbd5e1';
            if (log.status === 'error') color = '#ef4444';
            if (log.status === 'completed') color = '#10b981';
            if (log.status === 'info') color = '#3b82f6';
            if (log.status === 'skipped') color = '#f59e0b';
            
            return (
              <div key={i} style={{ display: 'flex', gap: '12px' }}>
                <span style={{ color: '#64748b' }}>[{log.time}]</span>
                <span style={{ color }}>{log.message}</span>
              </div>
            );
          })}
          <div ref={logsEndRef} />
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => {
    if (!reconResults) return null;
    const { summary } = reconResults;
    
    return (
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: '0 0 4px 0' }}>Reconciliation Results</h2>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{productConfig?.name} | {businessDate}</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-outline" onClick={handleReset} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <RefreshCw size={16} /> Run Another
            </button>
            <button className="btn btn-primary" onClick={() => exportReconResults(reconResults.matchedData, reconResults.mismatchedData, productConfig)} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Download size={16} /> Export Final Report
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          <div className="glass-card" style={{ padding: '20px', borderTop: '3px solid var(--text-secondary)' }}>
            <p style={{ margin: '0 0 8px 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Total Records Analyzed</p>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{summary?.totalRecords?.toLocaleString() || 0}</div>
            <p style={{ margin: '8px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Across all sources</p>
          </div>
          <div className="glass-card" style={{ padding: '20px', borderTop: '3px solid var(--success)' }}>
            <p style={{ margin: '0 0 8px 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Matched</p>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--success)' }}>{summary?.matched?.toLocaleString() || 0}</div>
            <p style={{ margin: '8px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Perfect match</p>
          </div>
          <div className="glass-card" style={{ padding: '20px', borderTop: '3px solid var(--danger)' }}>
            <p style={{ margin: '0 0 8px 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Mismatched</p>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--danger)' }}>{summary?.mismatched?.toLocaleString() || 0}</div>
            <p style={{ margin: '8px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Requires investigation</p>
          </div>
          <div className="glass-card" style={{ padding: '20px', borderTop: '3px solid var(--primary)' }}>
            <p style={{ margin: '0 0 8px 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Match Rate</p>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{summary?.matchRate || '0'}%</div>
            <p style={{ margin: '8px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Time: {summary?.elapsedTime || '0s'}</p>
          </div>
        </div>

        {/* Data Table Area */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Toolbar */}
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                className={`btn ${activeTab === 'mismatched' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => { setActiveTab('mismatched'); setCurrentPage(1); }}
                style={{ padding: '6px 16px', borderRadius: '20px', border: activeTab === 'mismatched' ? 'none' : '1px solid var(--border)' }}
              >
                Mismatches <span style={{ marginLeft: '6px', padding: '2px 8px', borderRadius: '10px', backgroundColor: activeTab === 'mismatched' ? 'rgba(255,255,255,0.2)' : 'rgba(239,68,68,0.1)', fontSize: '0.8rem' }}>{summary?.mismatched || 0}</span>
              </button>
              <button 
                className={`btn ${activeTab === 'matched' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => { setActiveTab('matched'); setCurrentPage(1); }}
                style={{ padding: '6px 16px', borderRadius: '20px', border: activeTab === 'matched' ? 'none' : '1px solid var(--border)' }}
              >
                Matches <span style={{ marginLeft: '6px', padding: '2px 8px', borderRadius: '10px', backgroundColor: activeTab === 'matched' ? 'rgba(255,255,255,0.2)' : 'rgba(16,185,129,0.1)', fontSize: '0.8rem' }}>{summary?.matched || 0}</span>
              </button>
              <button 
                className={`btn ${activeTab === 'all' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => { setActiveTab('all'); setCurrentPage(1); }}
                style={{ padding: '6px 16px', borderRadius: '20px', border: activeTab === 'all' ? 'none' : '1px solid var(--border)' }}
              >
                All Data
              </button>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input 
                  type="text" 
                  placeholder="Search data..." 
                  className="settings-input"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  style={{ paddingLeft: '36px', width: '250px' }}
                />
              </div>
              <button className="btn btn-outline" style={{ padding: '8px' }} title="Filter">
                <Filter size={18} />
              </button>
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto', padding: '0' }}>
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {dataColumns.map(col => (
                    <th key={col} style={{ 
                      padding: '12px 16px', textAlign: 'left', backgroundColor: 'var(--bg-hover)', 
                      borderBottom: '2px solid var(--border)', color: 'var(--text-secondary)',
                      fontWeight: '600', fontSize: '0.85rem', whiteSpace: 'nowrap'
                    }}>
                      {col}
                    </th>
                  ))}
                  {dataColumns.length === 0 && <th style={{ padding: '12px' }}>No Data Available</th>}
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', transition: 'background-color 0.2s' }} className="hover:bg-gray-50">
                    {dataColumns.map(col => {
                      let val = row[col];
                      // Highlight final status column
                      const isStatusCol = productConfig?.finalStatusCol === col;
                      let cellContent = val;
                      if (isStatusCol) {
                        const statusStr = String(val).toLowerCase();
                        if (statusStr.includes('match') && !statusStr.includes('mismatch')) {
                          cellContent = <span className="badge badge-success">{val}</span>;
                        } else if (statusStr.includes('mismatch') || statusStr.includes('fail') || statusStr.includes('error')) {
                          cellContent = <span className="badge badge-danger">{val}</span>;
                        } else {
                          cellContent = <span className="badge badge-warning">{val}</span>;
                        }
                      }
                      
                      return (
                        <td key={col} style={{ padding: '12px 16px', fontSize: '0.9rem', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                          {cellContent}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                {paginatedData.length === 0 && (
                  <tr>
                    <td colSpan={dataColumns.length || 1} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      No records found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Showing {(currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, filteredData.length)} of {filteredData.length} entries
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  className="btn btn-outline" 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  style={{ padding: '4px 12px' }}
                >
                  Previous
                </button>
                <div style={{ display: 'flex', alignItems: 'center', padding: '0 8px', fontSize: '0.9rem' }}>
                  Page {currentPage} of {totalPages}
                </div>
                <button 
                  className="btn btn-outline"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  style={{ padding: '4px 12px' }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px', height: '100%', overflowY: 'auto' }}>
      {renderStepper()}
      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && renderStep3()}
      {currentStep === 4 && renderStep4()}
    </div>
  );
}
