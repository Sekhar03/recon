import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  Upload, 
  FileText, 
  Loader2, 
  ShieldCheck, 
  Zap,
  Database,
  CloudDownload,
  Bell,
  X,
  ArrowRight
} from 'lucide-react';
import axios from 'axios';
import { PRODUCTS, CYCLES } from '../utils/constants';
import ResultsView from './ResultsView';

const API_BASE = '/api/v1';

const Wizard = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [selection, setSelection] = useState({
    product: null,
    bank: null,
    date: new Date().toISOString().split('T')[0],
    cycle: null,
    npci_file: null
  });
  
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [reconProgress, setReconProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [results, setResults] = useState(null);
  const [showNotification, setShowNotification] = useState(false);

  // Phase 3: BigQuery Extraction Simulation
  useEffect(() => {
    if (step === 3) {
      setExtractionProgress(0);
      setStatusText('Connecting to BigQuery "isure-prod-dataset"...');
      
      const interval = setInterval(() => {
        setExtractionProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setStatusText('Extraction Complete. 14,204 records retrieved.');
            return 100;
          }
          if (prev === 30) setStatusText('Fetching Middleware logs...');
          if (prev === 60) setStatusText('Synthesizing Wallet transactions...');
          if (prev === 85) setStatusText('Finalizing extraction bundle...');
          return prev + 5;
        });
      }, 150);
      return () => clearInterval(interval);
    }
  }, [step]);

  // Phase 5: Reconciliation Process
  const runReconciliation = async () => {
    setStep(5);
    setReconProgress(0);
    setStatusText('Initializing 5-way matching engine...');
    
    try {
      // Small simulated delay for initialization
      setTimeout(() => {
        const interval = setInterval(() => {
          setReconProgress(prev => {
            if (prev >= 100) {
              clearInterval(interval);
              finishRecon();
              return 100;
            }
            if (prev === 20) setStatusText('Matching Switch vs BigQuery...');
            if (prev === 45) setStatusText('Validating NPCI Settlement nodes...');
            if (prev === 70) setStatusText('Cross-referencing Wallet balances...');
            if (prev === 90) setStatusText('Generating audit journals...');
            return prev + 2;
          });
        }, 100);
      }, 500);
    } catch (error) {
      console.error('Error starting job:', error);
      setStatusText('Process failed.');
    }
  };

  const finishRecon = () => {
    const mockMismatches = [
      { rrn: '612345678901', date: selection.date, amount: '5,000.00', bankStatus: 'SUCCESS', mwStatus: 'FAILED', reason: 'Status Mismatch' },
      { rrn: '612345678904', date: selection.date, amount: '15,000.00', bankStatus: 'SUCCESS', mwStatus: 'NOT_FOUND', reason: 'Missing in MW' },
    ];

    const finalResults = {
      total: 10240,
      matched: 10105,
      mismatched: 135,
      rate: '98.7%',
      mismatchedData: mockMismatches,
      jobId: 'JOB-' + Math.random().toString(36).substr(2, 9).toUpperCase()
    };

    setResults(finalResults);
    setShowNotification(true);
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const renderStepper = () => (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '48px', position: 'relative', padding: '0 20px' }}>
      <div style={{ 
        position: 'absolute', top: '20px', left: '60px', right: '60px', height: '2px', 
        background: 'var(--border)', zIndex: 0 
      }}>
        <div style={{ 
          height: '100%', background: 'var(--primary)', width: `${((step - 1) / 4) * 100}%`, 
          transition: 'width 0.4s ease' 
        }} />
      </div>
      {[1, 2, 3, 4, 5].map((s) => (
        <div key={s} style={{ 
          zIndex: 1, 
          background: s < step ? 'var(--primary)' : (s === step ? 'white' : 'var(--bg-main)'),
          color: s < step ? 'white' : (s === step ? 'var(--primary)' : 'var(--text-secondary)'),
          width: '40px', height: '40px', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: '700', border: `3px solid ${s <= step ? 'var(--primary)' : 'var(--border)'}`,
          transition: 'all 0.3s ease',
          boxShadow: s === step ? '0 0 15px rgba(17, 157, 176, 0.3)' : 'none'
        }}>
          {s < step ? <CheckCircle2 size={18} /> : s}
        </div>
      ))}
    </div>
  );

  return (
    <div className="wizard-container animate-fade-in">
      {renderStepper()}

      <div className="glass-card" style={{ padding: '40px', minHeight: '520px', position: 'relative' }}>
        
        {/* Step 1: Product Selection */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Product Category</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Choose the financial product stream for this reconciliation cycle.</p>
            <div className="responsive-grid">
              {PRODUCTS.map(p => (
                <div 
                  key={p.id} 
                  className={`product-card-pill ${selection.product?.id === p.id ? 'active' : ''}`}
                  onClick={() => setSelection({ ...selection, product: p })}
                >
                  <div className="icon-circle">
                    <ShieldCheck size={20} />
                  </div>
                  <h3>{p.name}</h3>
                  <span className="type-tag">{p.type}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '64px', display: 'flex', justifyContent: 'flex-end' }}>
              <button disabled={!selection.product} onClick={nextStep} className="btn btn-primary" style={{ padding: '14px 32px' }}>
                Configure Parameters <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Configuration */}
        {step === 2 && (
          <div>
            <h2 style={{ fontSize: '24px', marginBottom: '32px' }}>Reconciliation Scope</h2>
            <div className="responsive-grid" style={{ gap: '40px' }}>
              <div>
                <label className="input-label">Issuing Bank</label>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '32px' }}>
                  {selection.product.banks.map(bank => (
                    <button 
                      key={bank}
                      className={`pill-choice ${selection.bank === bank ? 'active' : ''}`}
                      onClick={() => setSelection({ ...selection, bank })}
                    >
                      {bank}
                    </button>
                  ))}
                </div>

                <label className="input-label">Reconciliation Date</label>
                <input 
                  type="date" 
                  value={selection.date}
                  onChange={(e) => setSelection({ ...selection, date: e.target.value })}
                  className="settings-input"
                />
              </div>

              {selection.product.type === 'Cycle-wise' && (
                <div>
                  <label className="input-label">Settlement Cycle</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                    {CYCLES.map(cycle => (
                      <button 
                        key={cycle.id}
                        className={`pill-choice-wide ${selection.cycle === cycle.id ? 'active' : ''}`}
                        onClick={() => setSelection({ ...selection, cycle: cycle.id })}
                      >
                        <span style={{ fontWeight: '600' }}>{cycle.label}</span>
                        <span style={{ fontSize: '12px', opacity: 0.6 }}>{cycle.time}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div style={{ marginTop: '64px', display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={prevStep} className="btn btn-outline" style={{ padding: '12px 24px' }}>
                <ChevronLeft size={18} /> Back
              </button>
              <button 
                disabled={!selection.bank || (selection.product.type === 'Cycle-wise' && !selection.cycle)} 
                onClick={nextStep} 
                className="btn btn-primary"
                style={{ padding: '12px 32px' }}
              >
                Verify Data Availability <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: BigQuery Extraction */}
        {step === 3 && (
          <div style={{ textAlign: 'center', paddingTop: '60px' }}>
            <div className="icon-pulse" style={{ marginBottom: '32px', color: 'var(--primary)' }}>
              <Database size={64} />
            </div>
            <h2 style={{ marginBottom: '12px' }}>BigQuery Extraction</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '48px' }}>Retrieving Switch and Middleware logs for <strong>{selection.bank}</strong>.</p>
            
            <div style={{ maxWidth: '500px', margin: '0 auto' }}>
              <div style={{ height: '10px', background: 'var(--bg-hover)', borderRadius: '20px', overflow: 'hidden', marginBottom: '16px' }}>
                <div style={{ 
                  width: `${extractionProgress}%`, 
                  height: '100%', 
                  background: 'var(--primary)',
                  transition: 'width 0.3s ease'
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '500' }}>{statusText}</span>
                <span style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: '700' }}>{extractionProgress}%</span>
              </div>
            </div>

            <div style={{ marginTop: '100px', display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={prevStep} className="btn btn-outline"><ChevronLeft size={18} /> Back</button>
              <button 
                disabled={extractionProgress < 100} 
                onClick={nextStep} 
                className="btn btn-primary"
              >
                Proceed to NPCI Upload <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: NPCI Upload */}
        {step === 4 && (
          <div>
            <h2 style={{ marginBottom: '12px' }}>Upload Settlement Report</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '40px' }}>
              External data extracted successfully. Please provide the corresponding <strong>NPCI Settlement File</strong>.
            </p>

            <div 
              style={{ 
                border: '2px dashed var(--border)', 
                borderRadius: '24px', 
                padding: '60px', 
                textAlign: 'center',
                background: selection.npci_file ? 'var(--primary-glow)' : 'var(--bg-main)',
                transition: '0.3s'
              }}
              onClick={() => document.getElementById('npci-file').click()}
            >
              <input 
                type="file" 
                id="npci-file" 
                style={{ display: 'none' }} 
                onChange={(e) => {
                  if (e.target.files[0]) {
                    setSelection({ ...selection, npci_file: e.target.files[0].name });
                  }
                }}
              />
              <div style={{ color: 'var(--primary)', marginBottom: '20px' }}>
                <CloudDownload size={48} />
              </div>
              {selection.npci_file ? (
                <div>
                  <h3 style={{ color: 'var(--primary)' }}>{selection.npci_file}</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px' }}>File ready for matching</p>
                </div>
              ) : (
                <>
                  <h3>Click to upload NPCI Report</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px' }}>Supported formats: .CSV, .XLSX (Max 20MB)</p>
                </>
              )}
            </div>

            <div style={{ marginTop: '64px', display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={prevStep} className="btn btn-outline"><ChevronLeft size={18} /> Back</button>
              <button 
                disabled={!selection.npci_file} 
                onClick={runReconciliation} 
                className="btn btn-primary"
                style={{ padding: '12px 40px' }}
              >
                <Zap size={18} fill="currentColor" /> Run Reconciliation
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Matching Progress */}
        {step === 5 && !results && (
          <div style={{ textAlign: 'center', paddingTop: '60px' }}>
            <div className="spinning" style={{ marginBottom: '32px', color: 'var(--primary)' }}>
              <Loader2 size={64} />
            </div>
            <h2 style={{ marginBottom: '12px' }}>Matching in Progress</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '48px' }}>Executing 5-way matching logic across all financial nodes.</p>
            
            <div style={{ maxWidth: '500px', margin: '0 auto' }}>
              <div style={{ height: '10px', background: 'var(--bg-hover)', borderRadius: '20px', overflow: 'hidden', marginBottom: '16px' }}>
                <div style={{ 
                  width: `${reconProgress}%`, 
                  height: '100%', 
                  background: 'var(--primary)',
                  transition: 'width 0.2s ease'
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '500' }}>{statusText}</span>
                <span style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: '700' }}>{reconProgress}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Results with Notification Popup */}
        {step === 5 && results && (
          <div className="animate-fade-in">
            <ResultsView 
              results={results} 
              selection={selection} 
              onBack={() => onComplete({ ...selection, results })} 
            />

            {/* Completion Popup */}
            {showNotification && (
              <div style={{
                position: 'fixed', top: '24px', right: '24px',
                width: '400px', background: 'white', borderRadius: '16px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                padding: '24px', zIndex: 1000, border: '1px solid var(--primary)',
                animation: 'slideIn 0.5s cubic-bezier(0.18, 0.89, 0.32, 1.28)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', background: 'var(--primary)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                      <Bell size={20} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, color: 'var(--secondary)' }}>Reconciliation Completed</h4>
                      <p style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>{results.jobId}</p>
                    </div>
                  </div>
                  <X size={20} onClick={() => setShowNotification(false)} style={{ cursor: 'pointer' }} />
                </div>
                
                <div style={{ padding: '16px', background: 'var(--bg-hover)', borderRadius: '12px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Overall Match Rate</span>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--primary)' }}>{results.rate}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Total Exceptions</span>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--danger)' }}>{results.mismatched} transactions</span>
                  </div>
                </div>

                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => onComplete({ ...selection, results })}
                >
                  View Full Output Audit <ArrowRight size={18} />
                </button>
              </div>
            )}
          </div>
        )}

      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .product-card-pill {
          padding: 24px; background: white; border: 1.5px solid var(--border); border-radius: 20px;
          cursor: pointer; transition: 0.3s; text-align: center;
        }
        .product-card-pill:hover { border-color: var(--primary); transform: translateY(-5px); }
        .product-card-pill.active { border-color: var(--primary); background: var(--primary-glow); border-width: 2px; }
        .product-card-pill h3 { font-size: 18px; margin-top: 16px; margin-bottom: 8px; }
        
        .icon-circle {
          width: 44px; height: 44px; background: var(--bg-hover); border-radius: 50%;
          display: flex; alignItems: center; justifyContent: center; color: var(--primary); margin: 0 auto;
        }
        
        .type-tag { font-size: 11px; color: var(--text-secondary); text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; }
        
        .pill-choice {
          padding: 10px 20px; border-radius: 50px; border: 1.5px solid var(--border);
          background: white; font-size: 14px; font-weight: 500; cursor: pointer; transition: 0.2s;
        }
        .pill-choice:hover { border-color: var(--primary); color: var(--primary); }
        .pill-choice.active { background: var(--primary); color: white; border-color: var(--primary); }
        
        .pill-choice-wide {
          display: flex; justify-content: space-between; align-items: center; padding: 16px 20px;
          background: white; border: 1.5px solid var(--border); border-radius: 16px; cursor: pointer; transition: 0.2s;
        }
        .pill-choice-wide:hover { border-color: var(--primary); background: var(--bg-hover); }
        .pill-choice-wide.active { border-color: var(--primary); border-width: 2px; box-shadow: 0 4px 12px rgba(17, 157, 176, 0.1); }
        
        .icon-pulse { animation: pulse 2s infinite; }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
        
        @keyframes slideIn {
          from { transform: translateX(100%) scale(0.9); opacity: 0; }
          to { transform: translateX(0) scale(1); opacity: 1; }
        }
      `}} />
    </div>
  );
};

export default Wizard;
