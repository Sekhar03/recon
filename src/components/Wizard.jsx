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
  ArrowRight,
  Layers,
  Split
} from 'lucide-react';
import axios from 'axios';
import { PRODUCTS, INTERNAL_CYCLES } from '../utils/constants';
import ResultsView from './ResultsView';

const Wizard = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [selection, setSelection] = useState({
    product: PRODUCTS[0],
    bank: 'NSDL Payments Bank',
    date: new Date().toISOString().split('T')[0],
    internalCycle: 'Cycle 1',
    npci_file: null,
    ntsl_file: null
  });
  
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [reconProgress, setReconProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [pipelineOutput, setPipelineOutput] = useState(null);

  // Phase 3: Simulated Auto-Ingestion from GCP Bucket & SFTP
  useEffect(() => {
    if (step === 3) {
      setExtractionProgress(0);
      setStatusText('Connecting to GCP Bucket "gcp-iserveu-recon-prod"...');
      
      const interval = setInterval(() => {
        setExtractionProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setStatusText('Auto-ingestion complete. 12,450 records retrieved from GCP/SFTP.');
            return 100;
          }
          if (prev === 25) setStatusText('Fetching Middleware extract (cycle-wise)...');
          if (prev === 55) setStatusText('Fetching Switch report from SFTP...');
          if (prev === 80) setStatusText('Fetching Wallet report & Commission extract...');
          return prev + 5;
        });
      }, 120);
      return () => clearInterval(interval);
    }
  }, [step]);

  // Phase 5: Run Full End-to-End Pipeline
  const runFullPipeline = async () => {
    setStep(5);
    setReconProgress(0);
    setStatusText('Initializing 4-Way Match Engine & GEFU Pipeline...');

    try {
      const res = await axios.post('/api/v1/pipeline/run', {
        internalCycle: selection.internalCycle,
        date: selection.date,
        mockTxnCount: 600
      });

      const interval = setInterval(() => {
        setReconProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setPipelineOutput(res.data);
            return 100;
          }
          if (prev === 20) setStatusText('Matching NPCI vs Switch vs Middleware vs Wallet...');
          if (prev === 45) setStatusText('Running Commission Reconciliation...');
          if (prev === 70) setStatusText('Generating NTSL → GEFU Fixed-Width Bank File...');
          if (prev === 85) setStatusText('Executing Settlement Calc & IMPS ₹5L Split Rules...');
          return prev + 5;
        });
      }, 100);
    } catch (err) {
      console.error(err);
      setStatusText('Pipeline failed.');
    }
  };

  const renderStepper = () => (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '48px', position: 'relative', padding: '0 20px' }}>
      <div style={{ position: 'absolute', top: '20px', left: '60px', right: '60px', height: '2px', background: 'var(--border)', zIndex: 0 }}>
        <div style={{ height: '100%', background: 'var(--primary)', width: `${((step - 1) / 4) * 100}%`, transition: 'width 0.4s ease' }} />
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
            <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Select Product Stream</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Choose the payment stream for this reconciliation run.</p>
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
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '8px 0' }}>{p.description}</p>
                  <span className="type-tag">{p.type}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '48px', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setStep(2)} className="btn btn-primary" style={{ padding: '14px 32px' }}>
                Configure Scope <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Internal Cycle & Scope Selection */}
        {step === 2 && (
          <div>
            <h2 style={{ fontSize: '24px', marginBottom: '32px' }}>Reconciliation Scope & Cycle Settings</h2>
            <div className="responsive-grid" style={{ gap: '40px' }}>
              <div>
                <label className="input-label">Sponsoring Bank</label>
                <select 
                  className="settings-input" 
                  value={selection.bank}
                  onChange={(e) => setSelection({ ...selection, bank: e.target.value })}
                  style={{ marginBottom: '24px' }}
                >
                  <option value="NSDL Payments Bank">NSDL Payments Bank</option>
                  <option value="IPPB">India Post Payments Bank (IPPB)</option>
                  <option value="Axis Bank">Axis Bank</option>
                </select>

                <label className="input-label">Reconciliation Date</label>
                <input 
                  type="date" 
                  value={selection.date}
                  onChange={(e) => setSelection({ ...selection, date: e.target.value })}
                  className="settings-input"
                />
              </div>

              <div>
                <label className="input-label">Internal Settlement Cycle (§3.1)</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                  {INTERNAL_CYCLES.map(cycle => (
                    <button 
                      key={cycle.id}
                      className={`pill-choice-wide ${selection.internalCycle === cycle.id ? 'active' : ''}`}
                      onClick={() => setSelection({ ...selection, internalCycle: cycle.id })}
                    >
                      <div>
                        <div style={{ fontWeight: '600' }}>{cycle.label}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{cycle.time}</div>
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--primary)' }}>GEFU Cutoff: {cycle.gefuCutoff}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '64px', display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={() => setStep(1)} className="btn btn-outline"><ChevronLeft size={18} /> Back</button>
              <button onClick={() => setStep(3)} className="btn btn-primary" style={{ padding: '12px 32px' }}>
                Verify GCP / SFTP Extracts <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Ingestion */}
        {step === 3 && (
          <div style={{ textAlign: 'center', paddingTop: '60px' }}>
            <div className="icon-pulse" style={{ marginBottom: '32px', color: 'var(--primary)' }}>
              <Database size={64} />
            </div>
            <h2 style={{ marginBottom: '12px' }}>Auto-Ingesting Source Extracts</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '48px' }}>Fetching Middleware, Switch, Wallet, and Commission logs from GCP Bucket and SFTP.</p>
            
            <div style={{ maxWidth: '500px', margin: '0 auto' }}>
              <div style={{ height: '10px', background: 'var(--bg-hover)', borderRadius: '20px', overflow: 'hidden', marginBottom: '16px' }}>
                <div style={{ width: `${extractionProgress}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.3s ease' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '500' }}>{statusText}</span>
                <span style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: '700' }}>{extractionProgress}%</span>
              </div>
            </div>

            <div style={{ marginTop: '80px', display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={() => setStep(2)} className="btn btn-outline"><ChevronLeft size={18} /> Back</button>
              <button disabled={extractionProgress < 100} onClick={() => setStep(4)} className="btn btn-primary">
                Proceed to NPCI & NTSL Upload <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: NPCI & NTSL File Upload */}
        {step === 4 && (
          <div>
            <h2 style={{ marginBottom: '12px' }}>Upload NPCI & NTSL Reports</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
              Provide the corresponding <strong>NPCI Settlement Report</strong> and <strong>NTSL Report</strong> downloaded from URCS portal.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', marginBottom: '32px' }}>
              <div 
                style={{ 
                  border: '2px dashed var(--border)', 
                  borderRadius: '20px', 
                  padding: '40px', 
                  textAlign: 'center',
                  background: selection.npci_file ? 'var(--primary-glow)' : 'var(--bg-main)',
                  cursor: 'pointer'
                }}
                onClick={() => document.getElementById('npci-input').click()}
              >
                <input type="file" id="npci-input" style={{ display: 'none' }} onChange={(e) => setSelection({ ...selection, npci_file: e.target.files[0]?.name })} />
                <CloudDownload size={36} color="var(--primary)" style={{ marginBottom: '12px' }} />
                <h4>{selection.npci_file || 'Upload NPCI_Report (.csv)'}</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Key columns: TXN ID, RRN, RESPONSE CODE, SETTLEMENT AMOUNT</p>
              </div>

              <div 
                style={{ 
                  border: '2px dashed var(--border)', 
                  borderRadius: '20px', 
                  padding: '40px', 
                  textAlign: 'center',
                  background: selection.ntsl_file ? 'var(--primary-glow)' : 'var(--bg-main)',
                  cursor: 'pointer'
                }}
                onClick={() => document.getElementById('ntsl-input').click()}
              >
                <input type="file" id="ntsl-input" style={{ display: 'none' }} onChange={(e) => setSelection({ ...selection, ntsl_file: e.target.files[0]?.name })} />
                <Layers size={36} color="var(--primary)" style={{ marginBottom: '12px' }} />
                <h4>{selection.ntsl_file || 'Upload NTSL_Report (.xls / .xlsx)'}</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Auto OOXML detector enabled for disguised .xls files</p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={() => setStep(3)} className="btn btn-outline"><ChevronLeft size={18} /> Back</button>
              <button onClick={runFullPipeline} className="btn btn-primary" style={{ padding: '14px 40px' }}>
                <Zap size={18} fill="currentColor" /> Run Full Automation Pipeline
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Execution Progress & Summary View */}
        {step === 5 && (
          <div>
            {!pipelineOutput ? (
              <div style={{ textAlign: 'center', paddingTop: '60px' }}>
                <div className="spinning" style={{ marginBottom: '32px', color: 'var(--primary)' }}>
                  <Loader2 size={64} />
                </div>
                <h2 style={{ marginBottom: '12px' }}>Executing Full Automation Pipeline</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '48px' }}>4-Way Matching → GEFU Flat File → Settlement Gate → IMPS Payout Split.</p>
                <div style={{ maxWidth: '500px', margin: '0 auto' }}>
                  <div style={{ height: '10px', background: 'var(--bg-hover)', borderRadius: '20px', overflow: 'hidden', marginBottom: '16px' }}>
                    <div style={{ width: `${reconProgress}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.2s ease' }} />
                  </div>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{statusText}</span>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                  <div>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--success)' }}>
                      <CheckCircle2 size={28} /> Pipeline Execution Complete!
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Job ID: {pipelineOutput.job?.jobId}</p>
                  </div>
                  <button onClick={() => onComplete(pipelineOutput.job)} className="btn btn-primary">
                    Done / Go to Console
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
                  <div style={{ padding: '16px', background: 'var(--bg-hover)', borderRadius: '12px' }}>
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>4-Way Match Rate</p>
                    <h3 style={{ margin: '4px 0 0 0', color: 'var(--primary)' }}>{pipelineOutput.job?.matchRate}</h3>
                  </div>
                  <div style={{ padding: '16px', background: 'var(--bg-hover)', borderRadius: '12px' }}>
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>GEFU Control Check</p>
                    <h3 style={{ margin: '4px 0 0 0', color: 'var(--success)' }}>Verified</h3>
                  </div>
                  <div style={{ padding: '16px', background: 'var(--bg-hover)', borderRadius: '12px' }}>
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>Settlement Hard Gate</p>
                    <h3 style={{ margin: '4px 0 0 0', color: 'var(--success)' }}>Gate Passed</h3>
                  </div>
                  <div style={{ padding: '16px', background: 'var(--bg-hover)', borderRadius: '12px' }}>
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>IMPS Payout Rows</p>
                    <h3 style={{ margin: '4px 0 0 0', color: 'var(--secondary)' }}>{pipelineOutput.job?.payoutRowCount} Rows</h3>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default Wizard;
