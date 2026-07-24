import React, { useState, useEffect, useRef } from 'react';
import { getCategories, getProductsByCategory, getProductById, getAllProducts } from '../utils/productConfigs';
import { runRecon, exportToExcel, exportReconResults, exportMatchedFile, exportMismatchedFile } from '../utils/manualReconEngine';
import {
  Play, CheckCircle, Clock, Upload, Download, RefreshCw, AlertTriangle,
  ChevronRight, FileText, Check, Search, X, ArrowLeft, Layers, Database,
  Filter, ChevronDown, Tag, Calendar, RotateCcw, Cloud, Server, Zap, HardDrive,
  CheckCircle2, ArrowRight
} from 'lucide-react';

export default function ManualReconView() {
  const [currentStep, setCurrentStep] = useState(1);
  const [categories, setCategories] = useState([]);

  // Step 1 State: Category Selection
  const [selectedCategoryId, setSelectedCategoryId] = useState('');

  // Step 2 State: Sub-Product Selection
  const [availableProducts, setAvailableProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [productConfig, setProductConfig] = useState(null);

  // Step 3 State: Date & Cycle Selection
  const [businessDate, setBusinessDate] = useState(new Date().toISOString().split('T')[0]);
  const [settlementCycle, setSettlementCycle] = useState('All Cycles (Daily Consolidated)');

  // Step 4 State: Per-File Dedicated Pages (currentFileIndex)
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [filePreviews, setFilePreviews] = useState({});
  const [dragActive, setDragActive] = useState(false);

  // Auto-Fetch Animation State
  const [fetchProgress, setFetchProgress] = useState({}); // { [key]: 0..100 }
  const [fetchStatus, setFetchStatus] = useState({}); // { [key]: 'idle'|'fetching'|'completed' }
  const [fetchLogs, setFetchLogs] = useState({}); // { [key]: Array }

  // Processing Engine State
  const [processingStatus, setProcessingStatus] = useState('idle');
  const [processingLogs, setProcessingLogs] = useState([]);
  const [currentProcStepIndex, setCurrentProcStepIndex] = useState(-1);
  const logsEndRef = useRef(null);

  // Results State
  const [reconResults, setReconResults] = useState(null);
  const [activeTab, setActiveTab] = useState('mismatched');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 50;

  // Initial load: fetch categories
  useEffect(() => {
    try {
      const cats = getCategories();
      setCategories(cats || []);
    } catch (e) {
      console.warn("Failed to load categories", e);
    }
  }, []);

  // Helper: Check if a source is an internal system log that can be auto-fetched
  const isAutoFetchableSource = (srcKey, srcLabel) => {
    const label = (srcLabel || '').toLowerCase();
    const key = (srcKey || '').toLowerCase();
    return (
      label.includes('middleware') ||
      label.includes('switch') ||
      label.includes('wallet') ||
      label.includes('internal') ||
      label.includes('cou system') ||
      label.includes('mw') ||
      key.includes('middleware') ||
      key.includes('switch') ||
      key.includes('wallet') ||
      key.includes('internal') ||
      key.includes('mw')
    );
  };

  const getFetchChannelName = (srcKey, srcLabel) => {
    const label = (srcLabel || '').toLowerCase();
    const key = (srcKey || '').toLowerCase();
    if (label.includes('switch') || key.includes('switch')) return 'SFTP Server (sftp://switch.iserveu.in/)';
    if (label.includes('wallet') || key.includes('wallet')) return 'Internal Wallet DB Ledger';
    if (label.includes('middleware') || key.includes('middleware') || label.includes('internal')) return 'GCP Cloud Bucket (gs://prod-isurecon/)';
    return 'Cloud Remote Storage';
  };

  // Update available sub-products whenever selectedCategoryId changes
  useEffect(() => {
    if (selectedCategoryId) {
      try {
        const prods = getProductsByCategory(selectedCategoryId);
        setAvailableProducts(prods || []);
      } catch (e) {
        console.warn("Failed to load sub-products", e);
      }
    }
  }, [selectedCategoryId]);

  // Update productConfig whenever selectedProductId changes
  useEffect(() => {
    if (selectedProductId) {
      try {
        const config = getProductById(selectedProductId);
        setProductConfig(config);
      } catch (e) {
        console.warn("Failed to load product config", e);
      }
      setUploadedFiles({});
      setFilePreviews({});
      setFetchProgress({});
      setFetchStatus({});
      setFetchLogs({});
      setCurrentFileIndex(0);
    } else {
      setProductConfig(null);
    }
  }, [selectedProductId]);

  // Scroll logs to bottom during processing
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [processingLogs]);

  // --- Step 1 Handler: Category Click -> Auto Go to Step 2 ---
  const handleSelectCategory = (catId) => {
    setSelectedCategoryId(catId);
    setSelectedProductId('');
    setCurrentStep(2);
  };

  // --- Step 2 Handler: Sub-Product Click -> Auto Go to Step 3 ---
  const handleSelectSubProduct = (prodId) => {
    setSelectedProductId(prodId);
    const config = getProductById(prodId);
    setProductConfig(config);
    setUploadedFiles({});
    setFilePreviews({});
    setFetchProgress({});
    setFetchStatus({});
    setFetchLogs({});
    setCurrentFileIndex(0);
    setCurrentStep(3);
  };

  // --- Step 3 Handler: Proceed to Step 4 (File 1 Page) ---
  const handleProceedToFiles = () => {
    if (businessDate && settlementCycle) {
      setCurrentFileIndex(0);
      setCurrentStep(4);
    }
  };

  // --- Auto-start Cloud Fetch animation as soon as an auto-fetchable file page renders ---
  useEffect(() => {
    if (currentStep === 4 && productConfig && productConfig.sources && productConfig.sources[currentFileIndex]) {
      const currentSrc = productConfig.sources[currentFileIndex];
      if (isAutoFetchableSource(currentSrc.key, currentSrc.label)) {
        const currentStatus = fetchStatus[currentSrc.key];
        if (!currentStatus || currentStatus === 'idle') {
          triggerAutoFetchAnimation(currentSrc.key, currentSrc.label);
        }
      }
    }
  }, [currentStep, currentFileIndex, productConfig]);

  // --- Auto-Fetch Animation Trigger for a single source file ---
  const triggerAutoFetchAnimation = (srcKey, srcLabel) => {
    setFetchStatus(prev => ({ ...prev, [srcKey]: 'fetching' }));
    setFetchProgress(prev => ({ ...prev, [srcKey]: 0 }));
    const channel = getFetchChannelName(srcKey, srcLabel);

    const logMessages = [
      `Connecting to ${channel}...`,
      `Authenticating OAuth2 / SSH RSA-256 Key for Business Date: ${businessDate}, Cycle: ${settlementCycle}...`,
      `Streaming transaction log records into local memory buffer...`,
      `Validating record schemas, RRN keys, and currency amounts...`,
      `✔ Successfully auto-fetched 18,450 records from Cloud!`
    ];

    setFetchLogs(prev => ({ ...prev, [srcKey]: [logMessages[0]] }));

    let currentProg = 0;
    const interval = setInterval(() => {
      currentProg += 20;
      setFetchProgress(prev => ({ ...prev, [srcKey]: currentProg }));

      const msgIndex = Math.min(Math.floor(currentProg / 25), logMessages.length - 1);
      setFetchLogs(prev => ({
        ...prev,
        [srcKey]: logMessages.slice(0, msgIndex + 1)
      }));

      if (currentProg >= 100) {
        clearInterval(interval);
        setFetchStatus(prev => ({ ...prev, [srcKey]: 'completed' }));

        // Create mock File & preview
        const fileName = `AUTO_${srcKey.toUpperCase()}_${businessDate}_${settlementCycle.replace(/[^a-zA-Z0-9]/g, '_')}.csv`;
        const csvContent = `TxnRefID,RRN,Amount,Date,Status\nTXN1001,612345001,500.00,${businessDate},SUCCESS\nTXN1002,612345002,1250.50,${businessDate},SUCCESS\nTXN1003,612345003,75.25,${businessDate},FAILED`;
        const mockBlob = new Blob([csvContent], { type: 'text/csv' });
        const mockFile = new File([mockBlob], fileName, { type: 'text/csv' });

        setUploadedFiles(prev => ({ ...prev, [srcKey]: mockFile }));
        setFilePreviews(prev => ({
          ...prev,
          [srcKey]: {
            cols: ['TxnRefID', 'RRN', 'Amount', 'Date', 'Status'],
            rows: [
              ['TXN1001', '612345001', '500.00', businessDate, 'SUCCESS'],
              ['TXN1002', '612345002', '1250.50', businessDate, 'SUCCESS'],
              ['TXN1003', '612345003', '75.25', businessDate, 'FAILED']
            ]
          }
        }));
      }
    }, 350);
  };

  // --- Manual File Drop & Browse Handlers ---
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e, sourceKey) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
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
    setFetchStatus(prev => ({ ...prev, [sourceKey]: 'completed' }));
    
    setTimeout(() => {
      setFilePreviews(prev => ({
        ...prev,
        [sourceKey]: {
          cols: ['TxnRefID', 'RRN', 'Amount', 'Date', 'Status'],
          rows: [
            ['TXN1001', '612345001', '500.00', businessDate, 'SUCCESS'],
            ['TXN1002', '612345002', '1250.50', businessDate, 'SUCCESS'],
            ['TXN1003', '612345003', '75.25', businessDate, 'FAILED']
          ]
        }
      }));
    }, 200);
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
    setFetchStatus(prev => ({ ...prev, [sourceKey]: 'idle' }));
    setFetchProgress(prev => ({ ...prev, [sourceKey]: 0 }));
  };

  // Check if all required files are present across all sources
  const canStartRecon = () => {
    if (!productConfig || !productConfig.sources) return false;
    return productConfig.sources.every(src => {
      if (src.required) return !!uploadedFiles[src.key];
      return true;
    });
  };

  // Navigation between dedicated file pages
  const handleNextFilePage = () => {
    if (!productConfig) return;
    if (currentFileIndex < productConfig.sources.length - 1) {
      setCurrentFileIndex(prev => prev + 1);
    } else {
      // Last file page -> Proceed to Processing Engine (Step 5)
      handleStartRecon();
    }
  };

  const handlePrevFilePage = () => {
    if (currentFileIndex > 0) {
      setCurrentFileIndex(prev => prev - 1);
    } else {
      setCurrentStep(3); // Back to Date & Cycle page
    }
  };

  // --- Step 5 Start Reconciliation Engine ---
  const handleStartRecon = async () => {
    setCurrentStep(5);
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
        setCurrentStep(6);
      }, 1200);
    } catch (error) {
      console.error(error);
      setProcessingStatus('error');
      setProcessingLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), message: `Error: ${error.message}`, status: 'error' }]);
    }
  };

  // --- Reset All ---
  const handleReset = () => {
    setCurrentStep(1);
    setSelectedCategoryId('');
    setSelectedProductId('');
    setProductConfig(null);
    setUploadedFiles({});
    setFilePreviews({});
    setFetchProgress({});
    setFetchStatus({});
    setFetchLogs({});
    setCurrentFileIndex(0);
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

  // Total dynamic wizard steps: 1(Category) + 2(SubProduct) + 3(DateCycle) + N(File Pages) + 1(Processing) + 1(Results)
  const totalFilePages = productConfig?.sources?.length || 1;

  // --- Render Top Stepper ---
  const renderStepper = () => (
    <div className="glass-card" style={{ padding: '14px 24px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem', fontWeight: '600', flexWrap: 'wrap' }}>
        <span className={`badge ${currentStep === 1 ? 'badge-primary' : 'badge-neutral'}`}>1. Category</span>
        <ChevronRight size={14} color="var(--text-secondary)" />
        <span className={`badge ${currentStep === 2 ? 'badge-primary' : 'badge-neutral'}`}>2. Sub-Product</span>
        <ChevronRight size={14} color="var(--text-secondary)" />
        <span className={`badge ${currentStep === 3 ? 'badge-primary' : 'badge-neutral'}`}>3. Date & Cycle</span>
        <ChevronRight size={14} color="var(--text-secondary)" />
        <span className={`badge ${currentStep === 4 ? 'badge-primary' : 'badge-neutral'}`}>
          4. Files ({currentStep === 4 ? `${currentFileIndex + 1}/${totalFilePages}` : totalFilePages})
        </span>
        <ChevronRight size={14} color="var(--text-secondary)" />
        <span className={`badge ${currentStep === 5 ? 'badge-primary' : 'badge-neutral'}`}>5. Processing</span>
        <ChevronRight size={14} color="var(--text-secondary)" />
        <span className={`badge ${currentStep === 6 ? 'badge-primary' : 'badge-neutral'}`}>6. Results</span>
      </div>

      {productConfig && (
        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', background: 'rgba(17, 157, 176, 0.06)', padding: '4px 12px', borderRadius: '16px', border: '1px solid rgba(17, 157, 176, 0.15)', whiteSpace: 'nowrap' }}>
          Target: <strong style={{ color: 'var(--text-primary)' }}>{productConfig.name}</strong> • <strong>{businessDate}</strong>
        </div>
      )}
    </div>
  );

  // ─── STEP 1: Select Main Product Category ───
  const renderStep1 = () => (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 style={{ marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.35rem' }}>
          <Layers className="text-primary" size={24} /> Step 1: Select Category
        </h2>
        <p style={{ color: 'var(--text-secondary)', margin: '0 0 20px 0', fontSize: '0.9rem' }}>
          Click on a product category to proceed.
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
          {categories.map(cat => (
            <div 
              key={cat.id} 
              className="glass-card"
              onClick={() => handleSelectCategory(cat.id)}
              style={{
                padding: '20px 24px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px',
                borderColor: selectedCategoryId === cat.id ? 'var(--primary)' : 'var(--border)',
                backgroundColor: selectedCategoryId === cat.id ? 'rgba(17, 157, 176, 0.08)' : 'white',
                borderRadius: '12px', transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)';
              }}
            >
              <div style={{ fontSize: '2.2rem', lineHeight: 1 }}>{cat.icon || '📦'}</div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)', fontWeight: '700' }}>{cat.name}</h3>
              </div>
              <ChevronRight size={18} style={{ color: 'var(--text-secondary)' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ─── STEP 2: Select Sub-Product ───
  const renderStep2 = () => {
    const activeCategory = categories.find(c => c.id === selectedCategoryId);

    return (
      <div className="animate-fade-in glass-card" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '14px' }}>
          <button 
            className="btn btn-outline" 
            onClick={() => setCurrentStep(1)}
            style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <ArrowLeft size={16} /> Back to Categories
          </button>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>{activeCategory?.icon}</span> {activeCategory?.name} — Step 2: Select Sub-Product
            </h2>
            <p style={{ margin: '2px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.86rem' }}>
              Click on a sub-product box to proceed.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
          {availableProducts.map(prod => (
            <div
              key={prod.id}
              className="glass-card"
              onClick={() => handleSelectSubProduct(prod.id)}
              style={{
                padding: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                borderColor: selectedProductId === prod.id ? 'var(--primary)' : 'var(--border)',
                backgroundColor: selectedProductId === prod.id ? 'rgba(17, 157, 176, 0.08)' : 'white',
                borderRadius: '12px', transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)';
              }}
            >
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)' }}>{prod.name}</h3>
              <ChevronRight size={18} style={{ color: 'var(--text-secondary)' }} />
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ─── STEP 3: Select Date & Settlement Cycle ───
  const renderStep3 = () => {
    if (!productConfig) return null;
    const activeCategory = categories.find(c => c.id === selectedCategoryId);

    return (
      <div className="animate-fade-in glass-card" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              className="btn btn-outline" 
              onClick={() => setCurrentStep(2)}
              style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <ArrowLeft size={16} /> Back to Sub-Products
            </button>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>{activeCategory?.icon}</span> {productConfig.name} — Step 3: Select Date & Cycle
              </h2>
              <p style={{ margin: '2px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.86rem' }}>
                Specify the target business date and settlement cycle for reconciliation.
              </p>
            </div>
          </div>

          <button 
            className="btn btn-primary" 
            onClick={handleProceedToFiles}
            style={{ padding: '10px 24px', fontWeight: '700', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            Next: Collect Source Files <ChevronRight size={18} />
          </button>
        </div>

        {/* Date & Cycle Controls */}
        <div style={{ background: '#F8FAFC', padding: '32px', borderRadius: '16px', border: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
          <div>
            <label style={{ marginBottom: '10px', fontWeight: '700', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
              <Calendar size={18} color="var(--primary)" /> Business Date (T)
            </label>
            <input 
              type="date" 
              className="settings-input" 
              value={businessDate}
              onChange={(e) => setBusinessDate(e.target.value)}
              style={{ width: '100%', fontSize: '1rem', padding: '12px 16px', background: 'white', borderRadius: '8px', border: '1px solid var(--border)' }}
            />
            <p style={{ margin: '8px 0 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Select the transaction settlement date.
            </p>
          </div>

          <div>
            <label style={{ marginBottom: '10px', fontWeight: '700', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
              <RotateCcw size={18} color="var(--primary)" /> Settlement Cycle
            </label>
            <div style={{ position: 'relative' }}>
              <select 
                className="settings-input" 
                value={settlementCycle} 
                onChange={(e) => setSettlementCycle(e.target.value)}
                style={{ width: '100%', appearance: 'none', paddingRight: '40px', fontSize: '1rem', padding: '12px 16px', fontWeight: '500', background: 'white', borderRadius: '8px', border: '1px solid var(--border)' }}
              >
                <option value="All Cycles (Daily Consolidated)">All Cycles (Daily Consolidated)</option>
                <option value="Cycle 1 (00:00 - 08:00)">Cycle 1 (00:00 - 08:00)</option>
                <option value="Cycle 2 (08:00 - 16:00)">Cycle 2 (08:00 - 16:00)</option>
                <option value="Cycle 3 (16:00 - 24:00)">Cycle 3 (16:00 - 24:00)</option>
                <option value="Cycle 4 (Night Settlement)">Cycle 4 (Night Settlement)</option>
              </select>
              <ChevronDown size={20} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', pointerEvents: 'none' }} />
            </div>
            <p style={{ margin: '8px 0 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Select NPCI/Bank settlement window cycle.
            </p>
          </div>
        </div>
      </div>
    );
  };

  // ─── STEP 4: DEDICATED PER-FILE PAGE (Page for File currentFileIndex + 1 of N) ───
  const renderStep4PerFilePage = () => {
    if (!productConfig || !productConfig.sources) return null;

    const totalSources = productConfig.sources.length;
    const currentSrc = productConfig.sources[currentFileIndex];
    const isAutoFetchable = isAutoFetchableSource(currentSrc.key, currentSrc.label);
    const channelName = getFetchChannelName(currentSrc.key, currentSrc.label);

    const uploadedFile = uploadedFiles[currentSrc.key];
    const preview = filePreviews[currentSrc.key];
    const status = fetchStatus[currentSrc.key] || 'idle';
    const progress = fetchProgress[currentSrc.key] || 0;
    const logs = fetchLogs[currentSrc.key] || [];

    const isCurrentFileReady = !!uploadedFile;
    const isLastFile = currentFileIndex === totalSources - 1;

    return (
      <div className="animate-fade-in glass-card" style={{ padding: '32px' }}>
        {/* Header with Navigation and Progress Badge */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              className="btn btn-outline" 
              onClick={handlePrevFilePage}
              style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <ArrowLeft size={16} /> {currentFileIndex === 0 ? 'Back to Setup' : 'Previous File'}
            </button>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge badge-primary" style={{ fontSize: '0.78rem' }}>
                  Source File {currentFileIndex + 1} of {totalSources}
                </span>
                <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{currentSrc.label}</h2>
              </div>
              <p style={{ margin: '2px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.86rem' }}>
                Product: <strong>{productConfig.name}</strong> • Date: <strong>{businessDate}</strong> • Cycle: <strong>{settlementCycle}</strong>
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            {isLastFile ? (
              <button 
                className="btn btn-primary" 
                onClick={handleStartRecon}
                disabled={!canStartRecon()}
                style={{ padding: '10px 24px', display: 'flex', gap: '8px', alignItems: 'center', fontWeight: '700' }}
              >
                <Play size={18} /> Start Reconciliation Engine
              </button>
            ) : (
              <button 
                className="btn btn-primary" 
                onClick={handleNextFilePage}
                disabled={currentSrc.required && !isCurrentFileReady}
                style={{ padding: '10px 24px', display: 'flex', gap: '8px', alignItems: 'center', fontWeight: '700' }}
              >
                Next File ({currentFileIndex + 2}/{totalSources}) <ChevronRight size={18} />
              </button>
            )}
          </div>
        </div>

        {/* ─── OPTION A: AUTO-FETCHABLE SOURCE FILE DEDICATED PAGE ─── */}
        {isAutoFetchable ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Cloud Auto-Fetch Banner Card */}
            <div style={{ background: '#F8FAFC', borderRadius: '16px', padding: '28px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: 'rgba(17, 157, 176, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Cloud size={28} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Automated System Log Extract
                    </span>
                    <h3 style={{ margin: '2px 0 4px 0', fontSize: '1.2rem' }}>{currentSrc.label}</h3>
                    <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                      Location: <strong>{channelName}</strong>
                    </p>
                  </div>
                </div>

                <button 
                  className="btn btn-outline"
                  onClick={() => triggerAutoFetchAnimation(currentSrc.key, currentSrc.label)}
                  style={{ padding: '8px 16px', display: 'flex', gap: '6px', alignItems: 'center', fontSize: '0.88rem' }}
                >
                  <RefreshCw size={15} /> Re-Fetch Data
                </button>
              </div>

              {/* Sleek Data Fetching Loading Animation */}
              {status === 'fetching' && (
                <div className="animate-fade-in" style={{ marginTop: '16px', background: 'rgba(17, 157, 176, 0.06)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(17, 157, 176, 0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(17, 157, 176, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <RefreshCw className="animate-spin" size={20} color="var(--primary)" />
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: '600' }}>
                          Fetching transaction data from Cloud...
                        </h4>
                        <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          Connecting to {channelName} • Date: {businessDate}
                        </p>
                      </div>
                    </div>
                    <span className="badge badge-primary" style={{ fontSize: '0.82rem', padding: '4px 12px' }}>
                      {progress}% Loaded
                    </span>
                  </div>

                  {/* Animated Smooth Progress Bar */}
                  <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(17, 157, 176, 0.15)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div 
                      style={{ 
                        width: `${progress}%`, 
                        height: '100%', 
                        backgroundColor: 'var(--primary)', 
                        borderRadius: '4px', 
                        transition: 'width 0.3s ease-in-out',
                        boxShadow: '0 0 10px rgba(17, 157, 176, 0.5)'
                      }} 
                    />
                  </div>
                </div>
              )}

              {/* Clean Status Badge when completed */}
              {status === 'completed' && (
                <div className="animate-fade-in" style={{ marginTop: '14px', background: 'rgba(16, 185, 129, 0.08)', padding: '12px 18px', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CheckCircle2 size={20} color="var(--success)" />
                    <span style={{ fontSize: '0.9rem', color: 'var(--success)', fontWeight: '600' }}>
                      Successfully auto-fetched 18,450 transaction records from Cloud Storage!
                    </span>
                  </div>
                  <span className="badge badge-success">File Ready</span>
                </div>
              )}
            </div>

            {/* File Data Structure Preview */}
            {preview && (
              <div className="animate-fade-in glass-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={20} color="var(--success)" />
                    <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>Auto-Fetched Stream Preview ({uploadedFile?.name})</span>
                  </div>
                  <span className="badge badge-success">✔ File Ready for Recon</span>
                </div>

                <div style={{ overflowX: 'auto', background: '#F8FAFC', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)', background: '#EDF2F7' }}>
                        {preview.cols.map(c => <th key={c} style={{ padding: '8px 12px', textAlign: 'left' }}>{c}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.rows.map((r, i) => (
                        <tr key={i} style={{ borderBottom: i < preview.rows.length - 1 ? '1px solid #E2E8F0' : 'none' }}>
                          {r.map((val, j) => <td key={j} style={{ padding: '8px 12px' }}>{val}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ─── OPTION B: USER-UPLOADED EXTERNAL SOURCE FILE DEDICATED PAGE ─── */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div 
              style={{ 
                border: `2px dashed ${dragActive ? 'var(--primary)' : (uploadedFile ? 'var(--success)' : 'var(--border)')}`,
                borderRadius: '16px', padding: '40px', textAlign: 'center',
                backgroundColor: dragActive ? 'rgba(17,157,176,0.05)' : (uploadedFile ? 'rgba(16,185,129,0.03)' : 'white'),
                transition: 'all 0.2s ease'
              }}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={(e) => handleDrop(e, currentSrc.key)}
            >
              <div style={{ marginBottom: '16px' }}>
                <span className="badge badge-warning" style={{ fontSize: '0.8rem', padding: '4px 12px' }}>
                  External Counterparty File (Bank / NPCI Portal)
                </span>
              </div>

              {!uploadedFile ? (
                <div style={{ padding: '20px 0' }}>
                  <Upload size={48} style={{ color: 'var(--primary)', marginBottom: '12px' }} />
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem' }}>Upload {currentSrc.label}</h3>
                  <p style={{ margin: '0 0 16px 0', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                    Drag and drop file here, or{' '}
                    <label style={{ color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline', fontWeight: '600' }}>
                      browse computer
                      <input type="file" accept=".xlsx, .xls, .csv" onChange={(e) => handleFileInput(e, currentSrc.key)} style={{ display: 'none' }} />
                    </label>
                  </p>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Supports .xlsx, .xls, .csv</p>
                </div>
              ) : (
                <div className="animate-fade-in" style={{ textAlign: 'left' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '16px 20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <FileText size={28} style={{ color: 'var(--success)' }} />
                      <div>
                        <p style={{ margin: 0, fontWeight: '700', fontSize: '1rem' }}>{uploadedFile.name}</p>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {(uploadedFile.size / 1024).toFixed(1)} KB • Upload Complete
                        </p>
                      </div>
                    </div>
                    <button onClick={() => removeFile(currentSrc.key)} className="btn btn-outline" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}>
                      <X size={16} /> Remove File
                    </button>
                  </div>

                  {preview && (
                    <div style={{ marginTop: '20px' }}>
                      <p style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>File Preview</p>
                      <div style={{ overflowX: 'auto', background: '#F8FAFC', borderRadius: '8px', border: '1px solid var(--border)' }}>
                        <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)', background: '#EDF2F7' }}>
                              {preview.cols.map(c => <th key={c} style={{ padding: '8px 12px', textAlign: 'left' }}>{c}</th>)}
                            </tr>
                          </thead>
                          <tbody>
                            {preview.rows.map((r, i) => (
                              <tr key={i} style={{ borderBottom: i < preview.rows.length - 1 ? '1px solid #E2E8F0' : 'none' }}>
                                {r.map((val, j) => <td key={j} style={{ padding: '8px 12px' }}>{val}</td>)}
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
        )}
      </div>
    );
  };

  // ─── STEP 5: Processing Engine ───
  const renderStep5 = () => (
    <div className="animate-fade-in glass-card" style={{ padding: '40px', textAlign: 'center' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(17, 157, 176, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
          <RefreshCw className="animate-spin" size={32} />
        </div>

        <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Processing Reconciliation Engine</h2>
        <p style={{ color: 'var(--text-secondary)', margin: '0 0 28px 0', fontSize: '0.92rem' }}>
          Product: <strong>{productConfig?.name}</strong> • Date: <strong>{businessDate}</strong> • Cycle: <strong>{settlementCycle}</strong>
        </p>

        {/* Clean Step Status List */}
        <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '20px', border: '1px solid var(--border)', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {processingLogs.map((log, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
              {log.status === 'completed' ? (
                <CheckCircle2 size={18} color="var(--success)" />
              ) : log.status === 'error' ? (
                <X size={18} color="var(--danger)" />
              ) : (
                <RefreshCw className="animate-spin" size={16} color="var(--primary)" />
              )}
              <span style={{ color: log.status === 'completed' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: log.status === 'completed' ? '600' : '400' }}>
                {log.message}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ─── STEP 6: Results & Reports ───
  const renderStep6 = () => {
    if (!reconResults) return null;
    const { summary } = reconResults;

    return (
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ margin: '0 0 4px 0', fontSize: '1.4rem' }}>Reconciliation Final Results</h2>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
              {productConfig?.name} • Business Date: <strong>{businessDate}</strong> • Cycle: <strong>{settlementCycle}</strong>
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button className="btn btn-outline" onClick={handleReset} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <RefreshCw size={16} /> Run Another Recon
            </button>
            <button 
              className="btn btn-outline" 
              onClick={() => exportMatchedFile(reconResults.matchedData, productConfig, businessDate, settlementCycle)}
              style={{ display: 'flex', gap: '8px', alignItems: 'center', borderColor: 'var(--success)', color: 'var(--success)', fontWeight: '600' }}
            >
              <Download size={16} /> 🟢 Download Matched File ({summary?.matched || 0})
            </button>
            <button 
              className="btn btn-primary" 
              onClick={() => exportMismatchedFile(reconResults.mismatchedData, productConfig, businessDate, settlementCycle)}
              style={{ display: 'flex', gap: '8px', alignItems: 'center', backgroundColor: '#ef4444', borderColor: '#ef4444', color: 'white', fontWeight: '600' }}
            >
              <Download size={16} /> 🔴 Download Mismatched File ({summary?.mismatched || 0})
            </button>
          </div>
        </div>

        {/* Summary Metrics Cards (Responsive Auto-Fit Grid) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <div className="glass-card" style={{ padding: '20px', borderTop: '3px solid var(--text-secondary)' }}>
            <p style={{ margin: '0 0 8px 0', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Total Analyzed Records</p>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{summary?.totalRecords?.toLocaleString() || 0}</div>
            <p style={{ margin: '8px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Across all merged sources</p>
          </div>
          <div className="glass-card" style={{ padding: '20px', borderTop: '3px solid var(--success)' }}>
            <p style={{ margin: '0 0 8px 0', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Matched / Settled</p>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--success)' }}>{summary?.matched?.toLocaleString() || 0}</div>
            <p style={{ margin: '8px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Fully reconciled</p>
          </div>
          <div className="glass-card" style={{ padding: '20px', borderTop: '3px solid var(--danger)' }}>
            <p style={{ margin: '0 0 8px 0', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Mismatched / Exceptions</p>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--danger)' }}>{summary?.mismatched?.toLocaleString() || 0}</div>
            <p style={{ margin: '8px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Discrepancies identified</p>
          </div>
          <div className="glass-card" style={{ padding: '20px', borderTop: '3px solid var(--primary)' }}>
            <p style={{ margin: '0 0 8px 0', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Match Accuracy Rate</p>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{summary?.matchRate || '0%'}</div>
            <p style={{ margin: '8px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Time: {summary?.elapsedTime || '0s'}</p>
          </div>
        </div>

        {/* Data Table */}
        <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                className={`btn ${activeTab === 'mismatched' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => { setActiveTab('mismatched'); setCurrentPage(1); }}
                style={{ padding: '6px 16px', borderRadius: '20px' }}
              >
                Mismatches <span style={{ marginLeft: '6px', padding: '2px 8px', borderRadius: '10px', backgroundColor: activeTab === 'mismatched' ? 'rgba(255,255,255,0.2)' : 'rgba(239,68,68,0.1)', fontSize: '0.8rem' }}>{summary?.mismatched || 0}</span>
              </button>
              <button 
                className={`btn ${activeTab === 'matched' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => { setActiveTab('matched'); setCurrentPage(1); }}
                style={{ padding: '6px 16px', borderRadius: '20px' }}
              >
                Matches <span style={{ marginLeft: '6px', padding: '2px 8px', borderRadius: '10px', backgroundColor: activeTab === 'matched' ? 'rgba(255,255,255,0.2)' : 'rgba(16,185,129,0.1)', fontSize: '0.8rem' }}>{summary?.matched || 0}</span>
              </button>
              <button 
                className={`btn ${activeTab === 'all' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => { setActiveTab('all'); setCurrentPage(1); }}
                style={{ padding: '6px 16px', borderRadius: '20px' }}
              >
                All Records
              </button>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input 
                  type="text" 
                  placeholder="Search records..." 
                  className="settings-input"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  style={{ paddingLeft: '36px', width: '240px' }}
                />
              </div>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {dataColumns.map(col => (
                    <th key={col} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-secondary)', background: '#F8FAFC' }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                    {dataColumns.map(col => {
                      const val = row[col];
                      let cellContent = String(val ?? '');
                      
                      if (col.includes('status') || col.includes('Status')) {
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
                        <td key={col} style={{ padding: '12px 16px', fontSize: '0.88rem', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                          {cellContent}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                {paginatedData.length === 0 && (
                  <tr>
                    <td colSpan={dataColumns.length || 1} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      No records found matching criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
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
                <div style={{ display: 'flex', alignItems: 'center', padding: '0 8px', fontSize: '0.85rem' }}>
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
      {currentStep === 4 && renderStep4PerFilePage()}
      {currentStep === 5 && renderStep5()}
      {currentStep === 6 && renderStep6()}
    </div>
  );
}
