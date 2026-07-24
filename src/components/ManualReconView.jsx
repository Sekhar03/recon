import React, { useState, useEffect, useRef } from 'react';
import { getCategories, getProductsByCategory, getProductById, getAllProducts } from '../utils/productConfigs';
import { runRecon, exportToExcel, exportReconResults } from '../utils/manualReconEngine';
import {
  Play, CheckCircle, Clock, Upload, Download, RefreshCw, AlertTriangle,
  ChevronRight, FileText, Check, Search, X, ArrowLeft, Layers, Database,
  Filter, ChevronDown, Tag, Calendar, RotateCcw, Cloud, Server, Zap, HardDrive
} from 'lucide-react';

const wizardSteps = [
  { id: 1, label: '1. Category' },
  { id: 2, label: '2. Sub-Product' },
  { id: 3, label: '3. Date & Cycle' },
  { id: 4, label: '4. File Upload' },
  { id: 5, label: '5. Processing' },
  { id: 6, label: '6. Results' }
];

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

  // Step 4 State: File Upload & Auto-Fetch
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [filePreviews, setFilePreviews] = useState({});
  const [dragActive, setDragActive] = useState(null);
  const [isAutoFetching, setIsAutoFetching] = useState(false);
  const [autoFetchedKeys, setAutoFetchedKeys] = useState([]);

  // Step 5 State: Processing Engine
  const [processingStatus, setProcessingStatus] = useState('idle');
  const [processingLogs, setProcessingLogs] = useState([]);
  const [currentProcStepIndex, setCurrentProcStepIndex] = useState(-1);
  const logsEndRef = useRef(null);

  // Step 6 State: Results
  const [reconResults, setReconResults] = useState(null);
  const [activeTab, setActiveTab] = useState('mismatched');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 50;

  // Initial load: fetch all categories
  useEffect(() => {
    try {
      const cats = getCategories();
      setCategories(cats || []);
    } catch (e) {
      console.warn("Failed to load categories", e);
    }
  }, []);

  // Helper: check if a source file is an internal system log that can be auto-fetched
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
      setAutoFetchedKeys([]);
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
    setAutoFetchedKeys([]);
    setCurrentStep(3);
  };

  // --- Step 3 Handler: Proceed to Step 4 File Upload ---
  const handleProceedToUpload = () => {
    if (businessDate && settlementCycle) {
      setCurrentStep(4);
    }
  };

  // --- Step 4 Single File Cloud Auto-Fetch ---
  const handleSingleSourceAutoFetch = (srcKey, srcLabel) => {
    setIsAutoFetching(true);
    const formattedCycle = settlementCycle.replace(/[^a-zA-Z0-9]/g, '_');

    setTimeout(() => {
      const fileName = `AUTO_${srcKey.toUpperCase()}_${businessDate}_${formattedCycle}.csv`;
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
      setAutoFetchedKeys(prev => Array.from(new Set([...prev, srcKey])));
      setIsAutoFetching(false);
    }, 400);
  };

  // --- Step 4 Auto-Fetch ALL Internal Cloud Data ---
  const handleAutoFetchAllCloudData = () => {
    if (!productConfig || !productConfig.sources) return;
    setIsAutoFetching(true);

    setTimeout(() => {
      const newFiles = { ...uploadedFiles };
      const newPreviews = { ...filePreviews };
      const fetchedKeys = [...autoFetchedKeys];
      const formattedCycle = settlementCycle.replace(/[^a-zA-Z0-9]/g, '_');

      productConfig.sources.forEach(src => {
        if (isAutoFetchableSource(src.key, src.label)) {
          const fileName = `AUTO_${src.key.toUpperCase()}_${businessDate}_${formattedCycle}.csv`;
          const csvContent = `TxnRefID,RRN,Amount,Date,Status\nTXN1001,612345001,500.00,${businessDate},SUCCESS\nTXN1002,612345002,1250.50,${businessDate},SUCCESS\nTXN1003,612345003,75.25,${businessDate},FAILED`;
          const mockBlob = new Blob([csvContent], { type: 'text/csv' });
          const mockFile = new File([mockBlob], fileName, { type: 'text/csv' });

          newFiles[src.key] = mockFile;
          newPreviews[src.key] = {
            cols: ['TxnRefID', 'RRN', 'Amount', 'Date', 'Status'],
            rows: [
              ['TXN1001', '612345001', '500.00', businessDate, 'SUCCESS'],
              ['TXN1002', '612345002', '1250.50', businessDate, 'SUCCESS'],
              ['TXN1003', '612345003', '75.25', businessDate, 'FAILED']
            ]
          };
          fetchedKeys.push(src.key);
        }
      });

      setUploadedFiles(newFiles);
      setFilePreviews(newPreviews);
      setAutoFetchedKeys(Array.from(new Set(fetchedKeys)));
      setIsAutoFetching(false);
    }, 600);
  };

  // --- Step 4 Manual File Handlers ---
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
    setAutoFetchedKeys(prev => prev.filter(k => k !== sourceKey));
    
    // Create preview simulation
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
    }, 300);
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
    setAutoFetchedKeys(prev => prev.filter(k => k !== sourceKey));
  };

  const canStartRecon = () => {
    if (!productConfig || !productConfig.sources) return false;
    return productConfig.sources.every(src => {
      if (src.required) return !!uploadedFiles[src.key];
      return true;
    });
  };

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

  // --- Step 6 Reset Handler ---
  const handleReset = () => {
    setCurrentStep(1);
    setSelectedCategoryId('');
    setSelectedProductId('');
    setProductConfig(null);
    setUploadedFiles({});
    setFilePreviews({});
    setAutoFetchedKeys([]);
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

  // --- Render Stepper Header ---
  const renderStepper = () => (
    <div className="glass-card" style={{ padding: '18px 28px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      {wizardSteps.map((step, index) => {
        const isActive = step.id === currentStep;
        const isCompleted = step.id < currentStep;
        
        return (
          <div key={step.id} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1 }}>
              <div style={{
                width: '34px', height: '34px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: isActive ? 'var(--primary)' : (isCompleted ? 'var(--success)' : 'transparent'),
                border: `2px solid ${isActive ? 'var(--primary)' : (isCompleted ? 'var(--success)' : 'var(--border)')}`,
                color: (isActive || isCompleted) ? '#fff' : 'var(--text-secondary)',
                fontWeight: '600', fontSize: '0.85rem',
                transition: 'all 0.3s ease'
              }}>
                {isCompleted ? <Check size={16} /> : step.id}
              </div>
              <span style={{ 
                marginTop: '6px', fontSize: '0.78rem', fontWeight: isActive ? '700' : '500',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                textAlign: 'center'
              }}>
                {step.label}
              </span>
            </div>
            {index < wizardSteps.length - 1 && (
              <div style={{ flex: 1, height: '2px', backgroundColor: isCompleted ? 'var(--success)' : 'var(--border)', margin: '0 8px', marginTop: '-20px', transition: 'all 0.3s ease' }} />
            )}
          </div>
        );
      })}
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
            onClick={handleProceedToUpload}
            style={{ padding: '10px 24px', fontWeight: '700', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            Next: Upload Files <ChevronRight size={18} />
          </button>
        </div>

        {/* Date & Cycle Selection Controls */}
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

  // ─── STEP 4: Upload Source Files (Categorized Auto-Fetch vs User Upload) ───
  const renderStep4 = () => {
    if (!productConfig) return null;
    const hasAutoFetchableSources = productConfig.sources.some(s => isAutoFetchableSource(s.key, s.label));

    return (
      <div className="animate-fade-in glass-card" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              className="btn btn-outline" 
              onClick={() => setCurrentStep(3)}
              style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <ArrowLeft size={16} /> Back to Date & Cycle
            </button>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Step 4: Source File Collection for {productConfig.name}</h2>
              <p style={{ margin: '2px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.86rem' }}>
                Date: <strong>{businessDate}</strong> • Cycle: <strong>{settlementCycle}</strong>
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            {hasAutoFetchableSources && (
              <button 
                className="btn btn-outline"
                onClick={handleAutoFetchAllCloudData}
                disabled={isAutoFetching}
                style={{ padding: '10px 18px', display: 'flex', gap: '8px', alignItems: 'center', fontWeight: '600', borderColor: 'var(--primary)', color: 'var(--primary)' }}
              >
                {isAutoFetching ? <RefreshCw className="animate-spin" size={16} /> : <Zap size={16} />} 
                ⚡ Auto-Fetch Internal Cloud Data (GCP & SFTP)
              </button>
            )}

            <button 
              className="btn btn-primary" 
              onClick={handleStartRecon}
              disabled={!canStartRecon()}
              style={{ padding: '10px 24px', display: 'flex', gap: '8px', alignItems: 'center', fontWeight: '700' }}
            >
              <Play size={18} /> Start Reconciliation Engine
            </button>
          </div>
        </div>

        {/* Source File Collection Grid */}
        <label style={{ display: 'block', marginBottom: '14px', fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
          Required Source Files ({productConfig.sources?.length || 0})
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: productConfig.sources.length > 2 ? 'repeat(2, 1fr)' : '1fr', gap: '20px' }}>
          {productConfig.sources.map(src => {
            const uploadedFile = uploadedFiles[src.key];
            const isDrag = dragActive === src.key;
            const preview = filePreviews[src.key];
            const autoFetchable = isAutoFetchableSource(src.key, src.label);
            const isAutoFetched = autoFetchedKeys.includes(src.key);

            return (
              <div 
                key={src.key} 
                style={{ 
                  border: `2px dashed ${isDrag ? 'var(--primary)' : (uploadedFile ? 'var(--success)' : 'var(--border)')}`,
                  borderRadius: '12px', padding: '20px', textAlign: 'center',
                  backgroundColor: isDrag ? 'rgba(17,157,176,0.05)' : (uploadedFile ? 'rgba(16,185,129,0.03)' : 'white'),
                  transition: 'all 0.2s ease'
                }}
                onDragEnter={(e) => handleDrag(e, src.key)}
                onDragOver={(e) => handleDrag(e, src.key)}
                onDragLeave={(e) => handleDrag(e, src.key)}
                onDrop={(e) => handleDrop(e, src.key)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-primary)' }}>{src.label}</span>
                    {autoFetchable ? (
                      <span style={{ fontSize: '0.7rem', color: '#0284c7', background: 'rgba(2, 132, 199, 0.1)', padding: '2px 8px', borderRadius: '10px', fontWeight: '600' }}>
                        ⚡ Auto-Fetch (GCP / SFTP)
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.7rem', color: '#d97706', background: 'rgba(217, 119, 6, 0.1)', padding: '2px 8px', borderRadius: '10px', fontWeight: '600' }}>
                        📂 User Upload (Bank/NPCI File)
                      </span>
                    )}
                  </div>

                  {src.required ? (
                    <span className="badge badge-danger">Required</span>
                  ) : (
                    <span className="badge badge-warning">Optional</span>
                  )}
                </div>

                {!uploadedFile ? (
                  <div style={{ padding: '16px 0' }}>
                    {autoFetchable ? (
                      <div>
                        <Cloud size={32} style={{ color: 'var(--primary)', marginBottom: '8px' }} />
                        <p style={{ margin: '0 0 10px 0', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                          Internal log extract available on Cloud (GCP / SFTP)
                        </p>
                        <button 
                          className="btn btn-outline"
                          onClick={() => handleSingleSourceAutoFetch(src.key, src.label)}
                          style={{ padding: '6px 16px', fontSize: '0.85rem', color: 'var(--primary)', borderColor: 'var(--primary)', fontWeight: '600' }}
                        >
                          ⚡ Auto-Fetch from Cloud
                        </button>
                      </div>
                    ) : (
                      <div>
                        <Upload size={32} style={{ color: 'var(--text-secondary)', marginBottom: '8px' }} />
                        <p style={{ margin: '0 0 6px 0', fontSize: '0.9rem', fontWeight: '500' }}>
                          Drag & drop file here, or{' '}
                          <label style={{ color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline' }}>
                            browse
                            <input type="file" accept=".xlsx, .xls, .csv" onChange={(e) => handleFileInput(e, src.key)} style={{ display: 'none' }} />
                          </label>
                        </p>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Supports .xlsx, .xls, .csv</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="animate-fade-in" style={{ textAlign: 'left' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FileText size={22} style={{ color: isAutoFetched ? 'var(--primary)' : 'var(--success)' }} />
                        <div>
                          <p style={{ margin: 0, fontWeight: '600', fontSize: '0.88rem' }}>{uploadedFile.name}</p>
                          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            {(uploadedFile.size / 1024).toFixed(1)} KB • {isAutoFetched ? '⚡ Auto-Fetched from Cloud' : '📂 User Uploaded'}
                          </p>
                        </div>
                      </div>
                      <button onClick={() => removeFile(src.key)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>
                        <X size={16} />
                      </button>
                    </div>

                    {preview && (
                      <div style={{ marginTop: '12px' }}>
                        <p style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>Structure Preview</p>
                        <div style={{ overflowX: 'auto', background: '#F8FAFC', borderRadius: '6px', border: '1px solid var(--border)' }}>
                          <table style={{ width: '100%', fontSize: '0.75rem', borderCollapse: 'collapse' }}>
                            <thead>
                              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                {preview.cols.map(c => <th key={c} style={{ padding: '5px 8px', textAlign: 'left' }}>{c}</th>)}
                              </tr>
                            </thead>
                            <tbody>
                              {preview.rows.map((r, i) => (
                                <tr key={i} style={{ borderBottom: i < preview.rows.length - 1 ? '1px solid #E2E8F0' : 'none' }}>
                                  {r.map((val, j) => <td key={j} style={{ padding: '5px 8px' }}>{val}</td>)}
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
            );
          })}
        </div>
      </div>
    );
  };

  // ─── STEP 5: Processing Engine ───
  const renderStep5 = () => (
    <div className="animate-fade-in glass-card" style={{ padding: '32px' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Processing Reconciliation Engine</h2>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
          Product: <strong>{productConfig?.name}</strong> • Business Date: <strong>{businessDate}</strong> • Cycle: <strong>{settlementCycle}</strong>
        </p>
      </div>

      <div style={{ backgroundColor: '#1b2a3e', borderRadius: '12px', padding: '24px', fontFamily: 'monospace', color: '#e2e8f0', height: '350px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#10b981' }} />
          <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginLeft: '8px' }}>engine_console.log</span>
        </div>

        {processingLogs.map((log, idx) => {
          let logColor = '#cbd5e1';
          if (log.status === 'completed') logColor = '#34d399';
          if (log.status === 'error') logColor = '#f87171';
          if (log.status === 'processing') logColor = '#60a5fa';

          return (
            <div key={idx} style={{ marginBottom: '8px', fontSize: '0.85rem', color: logColor, display: 'flex', gap: '12px' }}>
              <span style={{ color: 'rgba(255,255,255,0.4)' }}>[{log.time}]</span>
              <span>{log.message}</span>
            </div>
          );
        })}
        {processingStatus === 'processing' && (
          <div style={{ color: '#60a5fa', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RefreshCw className="animate-spin" size={14} /> Running merge, column normalization, and comparison logic...
          </div>
        )}
        <div ref={logsEndRef} />
      </div>
    </div>
  );

  // ─── STEP 6: Results & Reports ───
  const renderStep6 = () => {
    if (!reconResults) return null;
    const { summary } = reconResults;

    return (
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: '0 0 4px 0' }}>Reconciliation Final Results</h2>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
              {productConfig?.name} • Business Date: <strong>{businessDate}</strong> • Cycle: <strong>{settlementCycle}</strong>
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-outline" onClick={handleReset} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <RefreshCw size={16} /> Run Another Recon
            </button>
            <button className="btn btn-primary" onClick={() => exportReconResults(reconResults.matchedData, reconResults.mismatchedData, productConfig, reconResults.allData)} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Download size={16} /> Export Final Report
            </button>
          </div>
        </div>

        {/* Summary Metrics Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
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
      {currentStep === 4 && renderStep4()}
      {currentStep === 5 && renderStep5()}
      {currentStep === 6 && renderStep6()}
    </div>
  );
}
