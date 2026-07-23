import React, { useState, useEffect } from 'react';
import { FileCheck, Download, AlertCircle, CheckCircle2, Search, ArrowUpRight } from 'lucide-react';
import axios from 'axios';
import { downloadCSV } from '../utils/csvExport';

const PayoutReconView = () => {
  const [payoutReconData, setPayoutReconData] = useState(null);

  useEffect(() => {
    // Generate synthetic 3-way payout recon data
    const mockPayouts = [
      { clientReferenceNo: 'PO_merchant_01_20260723_01', username: 'merchant_01', beneName: 'MERCHANT ONE STORE', payoutAmount: 446979.30, bankMisAmount: 446979.30, bankStmtAmount: 446979.30, status: 'MATCHED', utr: 'UTR991029310', failureReason: 'None' },
      { clientReferenceNo: 'PO_merchant_01_20260723_02', username: 'merchant_01', beneName: 'MERCHANT ONE STORE', payoutAmount: 500000.00, bankMisAmount: 500000.00, bankStmtAmount: 500000.00, status: 'MATCHED', utr: 'UTR991029311', failureReason: 'None' },
      { clientReferenceNo: 'PO_merchant_02_20260723_01', username: 'merchant_02', beneName: 'MERCHANT TWO RETAIL', payoutAmount: 298888.20, bankMisAmount: 298888.20, bankStmtAmount: 298888.20, status: 'MATCHED', utr: 'UTR991029312', failureReason: 'None' },
      { clientReferenceNo: 'PO_merchant_03_20260723_01', username: 'merchant_03', beneName: 'MERCHANT STORE ENTERPRISES', payoutAmount: 429156.36, bankMisAmount: 429156.36, bankStmtAmount: null, status: 'EXCEPTION', utr: 'UTR991029313', failureReason: 'Missing in Bank Statement' }
    ];

    const matched = mockPayouts.filter(p => p.status === 'MATCHED');
    const exceptions = mockPayouts.filter(p => p.status === 'EXCEPTION');

    setPayoutReconData({
      totalPayouts: mockPayouts.length,
      matchedCount: matched.length,
      exceptionCount: exceptions.length,
      payoutMatchRate: ((matched.length / mockPayouts.length) * 100).toFixed(1) + '%',
      mockPayouts
    });
  }, []);

  const handleExportRecon = () => {
    if (payoutReconData?.mockPayouts) {
      downloadCSV(payoutReconData.mockPayouts, 'Payout_3Way_Reconciliation_Report');
    }
  };

  return (
    <div className="glass-card animate-fade-in" style={{ padding: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileCheck color="var(--primary)" size={24} />
            Payout 3-Way Reconciliation Engine
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '14px' }}>
            Automated 3-way matching across iServeU Payout Report, Bank MIS Report, and Bank Statement.
          </p>
        </div>
        <button onClick={handleExportRecon} className="btn btn-primary">
          <Download size={16} /> Export 3-Way Match Summary
        </button>
      </div>

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
        <div style={{ padding: '20px', background: 'var(--bg-hover)', borderRadius: '16px', borderLeft: '4px solid var(--primary)' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>Total Payout Rows</p>
          <h3 style={{ margin: 0, fontSize: '24px' }}>{payoutReconData?.totalPayouts || 0}</h3>
        </div>
        <div style={{ padding: '20px', background: 'var(--bg-hover)', borderRadius: '16px', borderLeft: '4px solid var(--success)' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>3-Way Matched</p>
          <h3 style={{ margin: 0, fontSize: '24px', color: 'var(--success)' }}>{payoutReconData?.matchedCount || 0}</h3>
        </div>
        <div style={{ padding: '20px', background: 'var(--bg-hover)', borderRadius: '16px', borderLeft: '4px solid var(--danger)' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>Bank Mismatches</p>
          <h3 style={{ margin: 0, fontSize: '24px', color: 'var(--danger)' }}>{payoutReconData?.exceptionCount || 0}</h3>
        </div>
        <div style={{ padding: '20px', background: 'var(--bg-hover)', borderRadius: '16px', borderLeft: '4px solid var(--secondary)' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>Match Accuracy Rate</p>
          <h3 style={{ margin: 0, fontSize: '24px', color: 'var(--secondary)' }}>{payoutReconData?.payoutMatchRate || '0%'}</h3>
        </div>
      </div>

      {/* 3-Way Match Data Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)', textAlign: 'left', fontSize: '12px' }}>
              <th style={{ padding: '12px' }}>Client Ref No</th>
              <th style={{ padding: '12px' }}>Beneficiary</th>
              <th style={{ padding: '12px' }}>Payout Amt</th>
              <th style={{ padding: '12px' }}>Bank MIS Amt</th>
              <th style={{ padding: '12px' }}>Bank Stmt Amt</th>
              <th style={{ padding: '12px' }}>Bank UTR</th>
              <th style={{ padding: '12px' }}>3-Way Status</th>
            </tr>
          </thead>
          <tbody>
            {payoutReconData?.mockPayouts?.map((row, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid var(--border)', fontSize: '13px' }}>
                <td style={{ padding: '12px', fontFamily: 'monospace', fontWeight: '600' }}>{row.clientReferenceNo}</td>
                <td style={{ padding: '12px' }}>{row.beneName}</td>
                <td style={{ padding: '12px', fontWeight: '700' }}>₹{row.payoutAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                <td style={{ padding: '12px', color: 'var(--success)' }}>₹{row.bankMisAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                <td style={{ padding: '12px', color: row.bankStmtAmount ? 'var(--success)' : 'var(--danger)', fontWeight: row.bankStmtAmount ? 'normal' : 'bold' }}>
                  {row.bankStmtAmount ? `₹${row.bankStmtAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : 'MISSING IN STMT'}
                </td>
                <td style={{ padding: '12px', fontFamily: 'monospace' }}>{row.utr}</td>
                <td style={{ padding: '12px' }}>
                  {row.status === 'MATCHED' ? (
                    <span style={{ color: 'var(--success)', background: 'rgba(34, 197, 94, 0.1)', padding: '4px 10px', borderRadius: '20px', fontWeight: '700', fontSize: '12px' }}>
                      ✓ 3-Way Matched
                    </span>
                  ) : (
                    <span style={{ color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.1)', padding: '4px 10px', borderRadius: '20px', fontWeight: '700', fontSize: '12px' }}>
                      ⚠ Discrepancy Flagged
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PayoutReconView;
