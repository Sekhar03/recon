import React, { useState } from 'react';
import { Settings, Save, RotateCcw, Check, Percent, ShieldCheck, Zap, CreditCard } from 'lucide-react';
import { getFeeConfig, saveFeeConfig, resetFeeConfig } from '../utils/feeConfigStore';

const FeeConfigView = () => {
  const [config, setConfig] = useState(getFeeConfig());
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleChange = (field, value) => {
    const numVal = parseFloat(value) || 0;
    setConfig(prev => ({ ...prev, [field]: numVal }));
  };

  const handleSave = () => {
    saveFeeConfig(config);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleReset = () => {
    const reset = resetFeeConfig();
    setConfig(reset);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="glass-card animate-fade-in" style={{ padding: '36px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '26px', margin: 0, fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Settings color="var(--primary)" size={26} />
            Fee & Tax Settings Module
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '14.5px' }}>
            Configure system-wide GST tax rates, Bank Share %, switching charges, interchange fees, and IMPS payout chunking thresholds.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={handleReset} className="btn btn-outline" style={{ padding: '10px 18px', fontWeight: '700' }}>
            <RotateCcw size={16} /> Reset Defaults
          </button>
          <button onClick={handleSave} className="btn btn-primary" style={{ padding: '10px 22px', fontWeight: '700' }}>
            {savedSuccess ? <Check size={16} color="white" /> : <Save size={16} />}
            {savedSuccess ? 'Saved Successfully!' : 'Save Configuration'}
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid var(--success)', padding: '14px 20px', borderRadius: '12px', marginBottom: '28px', color: 'var(--success)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Check size={18} /> System configuration updated! All reconciliation and settlement calculations will use these parameters.
        </div>
      )}

      {/* Configuration Inputs Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
        {/* Card 1: Bank Revenue & Share */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '18px', border: '1px solid var(--border)' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '17px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
            <Percent size={20} /> Bank & Revenue Share Configuration
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>
                Bank Share Revenue Rate (%)
              </label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="number" 
                  step="0.0001" 
                  value={config.bankShareRate} 
                  onChange={e => handleChange('bankShareRate', e.target.value)} 
                  className="settings-input" 
                  style={{ width: '100%', padding: '10px', paddingRight: '35px', fontWeight: '700' }} 
                />
                <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', fontWeight: '700', color: 'var(--text-secondary)' }}>%</span>
              </div>
              <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '4px', display: 'block' }}>Standard NSDL Payments Bank share formula: 0.2006% per transaction</span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>
                Interchange Fee Rate (%)
              </label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="number" 
                  step="0.01" 
                  value={config.interchangeRate} 
                  onChange={e => handleChange('interchangeRate', e.target.value)} 
                  className="settings-input" 
                  style={{ width: '100%', padding: '10px', paddingRight: '35px', fontWeight: '700' }} 
                />
                <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', fontWeight: '700', color: 'var(--text-secondary)' }}>%</span>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>
                Platform Fee Rate (%)
              </label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="number" 
                  step="0.01" 
                  value={config.platformFeeRate} 
                  onChange={e => handleChange('platformFeeRate', e.target.value)} 
                  className="settings-input" 
                  style={{ width: '100%', padding: '10px', paddingRight: '35px', fontWeight: '700' }} 
                />
                <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', fontWeight: '700', color: 'var(--text-secondary)' }}>%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: GST & Tax Settings */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '18px', border: '1px solid var(--border)' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '17px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
            <ShieldCheck size={20} /> GST & Tax Rates Configuration
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>
                CGST Rate (%)
              </label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="number" 
                  step="0.1" 
                  value={config.cgstRate} 
                  onChange={e => handleChange('cgstRate', e.target.value)} 
                  className="settings-input" 
                  style={{ width: '100%', padding: '10px', paddingRight: '35px', fontWeight: '700' }} 
                />
                <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', fontWeight: '700', color: 'var(--text-secondary)' }}>%</span>
              </div>
              <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '4px', display: 'block' }}>Central GST applied to NPCI switching fees (9.0% default)</span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>
                SGST Rate (%)
              </label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="number" 
                  step="0.1" 
                  value={config.sgstRate} 
                  onChange={e => handleChange('sgstRate', e.target.value)} 
                  className="settings-input" 
                  style={{ width: '100%', padding: '10px', paddingRight: '35px', fontWeight: '700' }} 
                />
                <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', fontWeight: '700', color: 'var(--text-secondary)' }}>%</span>
              </div>
              <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '4px', display: 'block' }}>State GST applied to NPCI switching fees (9.0% default)</span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>
                IGST Rate (%)
              </label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="number" 
                  step="0.1" 
                  value={config.igstRate} 
                  onChange={e => handleChange('igstRate', e.target.value)} 
                  className="settings-input" 
                  style={{ width: '100%', padding: '10px', paddingRight: '35px', fontWeight: '700' }} 
                />
                <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', fontWeight: '700', color: 'var(--text-secondary)' }}>%</span>
              </div>
              <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '4px', display: 'block' }}>Integrated GST for interstate transactions (18.0% default)</span>
            </div>
          </div>
        </div>

        {/* Card 3: Network & Switching Fees */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '18px', border: '1px solid var(--border)' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '17px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
            <Zap size={20} /> Network & Switching Charges
          </h3>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>
              Switching Fee per Transaction (₹)
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontWeight: '700', color: 'var(--text-secondary)' }}>₹</span>
              <input 
                type="number" 
                step="0.01" 
                value={config.switchingFeePerTxn} 
                onChange={e => handleChange('switchingFeePerTxn', e.target.value)} 
                className="settings-input" 
                style={{ width: '100%', padding: '10px', paddingLeft: '32px', fontWeight: '700' }} 
              />
            </div>
            <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '4px', display: 'block' }}>Fixed NPCI switching charge per processed transaction</span>
          </div>
        </div>

        {/* Card 4: IMPS Payout Split Rules */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '18px', border: '1px solid var(--border)' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '17px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
            <CreditCard size={20} /> IMPS Payout Threshold Limit
          </h3>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>
              IMPS Payout Single-Chunk Maximum Limit (₹)
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontWeight: '700', color: 'var(--text-secondary)' }}>₹</span>
              <input 
                type="number" 
                step="10000" 
                value={config.impsPayoutMaxLimit} 
                onChange={e => handleChange('impsPayoutMaxLimit', e.target.value)} 
                className="settings-input" 
                style={{ width: '100%', padding: '10px', paddingLeft: '32px', fontWeight: '700' }} 
              />
            </div>
            <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '4px', display: 'block' }}>Amounts exceeding this threshold automatically split into remainder + max limit rows (₹500,000 default)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeeConfigView;
