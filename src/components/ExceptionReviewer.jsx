import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, Filter, ShieldAlert, History, UserCheck, Check, X, FileSpreadsheet, Download } from 'lucide-react';
import axios from 'axios';
import { exportToExcel } from '../utils/excelExporter';

const ExceptionReviewer = () => {
  const [activeTab, setActiveTab] = useState('txn-exceptions');
  const [exceptions, setExceptions] = useState([]);
  const [payoutExceptions, setPayoutExceptions] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [dispositionReason, setDispositionReason] = useState('');
  const [filterRule, setFilterRule] = useState('ALL');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    axios.get('/api/v1/exceptions')
      .then(res => {
        setExceptions(res.data.transactionExceptions || []);
        setPayoutExceptions(res.data.payoutExceptions || []);
      })
      .catch(() => {});

    axios.get('/api/v1/audit-logs')
      .then(res => setAuditLogs(res.data || []))
      .catch(() => {});
  };

  const handleExportExcel = () => {
    if (activeTab === 'txn-exceptions') {
      exportToExcel(exceptions, 'Transaction_Mismatches_Report');
    } else if (activeTab === 'payout-exceptions') {
      exportToExcel(payoutExceptions, 'Payout_Discrepancies_Report');
    } else {
      exportToExcel(auditLogs, 'Reconciliation_Audit_Trail');
    }
  };

  const handleDisposition = (item, action) => {
    setSelectedItem({ item, action });
  };

  const submitDisposition = () => {
    if (!selectedItem) return;
    axios.post('/api/v1/exceptions/disposition', {
      exceptionId: selectedItem.item.id,
      action: selectedItem.action,
      actor: 'Finance Reviewer',
      reason: dispositionReason || 'Approved per URCS statement validation'
    }).then(() => {
      setSelectedItem(null);
      setDispositionReason('');
      fetchData();
    });
  };

  const filteredTxnExceptions = exceptions.filter(e => {
    if (filterRule === 'ALL') return true;
    return e.ruleId === filterRule;
  });

  return (
    <div className="glass-card animate-fade-in" style={{ padding: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldAlert color="var(--warning)" size={24} />
            Reviewer Exception Console & Audit Log
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '14px' }}>
            Interactive disposition dashboard for 4-way transaction mismatches and 3-way payout discrepancies with immutable audit logging.
          </p>
        </div>
        <button onClick={handleExportExcel} className="btn btn-primary">
          <Download size={16} /> Export Mismatches Excel
        </button>
      </div>

      {/* Main Tabs */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border)', marginBottom: '28px' }}>
        <button
          className={`btn ${activeTab === 'txn-exceptions' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('txn-exceptions')}
          style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
        >
          <AlertCircle size={16} /> 4-Way Transaction Mismatches ({exceptions.length})
        </button>
        <button
          className={`btn ${activeTab === 'payout-exceptions' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('payout-exceptions')}
          style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
        >
          <FileSpreadsheet size={16} /> 3-Way Payout Mismatches ({payoutExceptions.length})
        </button>
        <button
          className={`btn ${activeTab === 'audit-trail' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('audit-trail')}
          style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
        >
          <History size={16} /> Immutable Audit Trail ({auditLogs.length})
        </button>
      </div>

      {/* Tab 1: 4-Way Transaction Mismatches */}
      {activeTab === 'txn-exceptions' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Filter size={16} color="var(--text-secondary)" />
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Filter by Triggered Rule:</span>
              <select 
                value={filterRule} 
                onChange={(e) => setFilterRule(e.target.value)}
                className="settings-input"
                style={{ padding: '6px 12px', width: 'auto', fontSize: '13px' }}
              >
                <option value="ALL">All Mismatch Rules</option>
                <option value="RULE_2">RULE_2: Credit Adjustment Required</option>
                <option value="RULE_5">RULE_5: RET in URCS Required</option>
                <option value="RULE_7">RULE_7: TCC in URCS Required</option>
              </select>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)', textAlign: 'left', fontSize: '12px' }}>
                  <th style={{ padding: '12px' }}>RRN / Txn ID</th>
                  <th style={{ padding: '12px' }}>Amount</th>
                  <th style={{ padding: '12px' }}>NPCI</th>
                  <th style={{ padding: '12px' }}>Switch</th>
                  <th style={{ padding: '12px' }}>Middleware</th>
                  <th style={{ padding: '12px' }}>Wallet</th>
                  <th style={{ padding: '12px' }}>Triggered Rule & Action</th>
                  <th style={{ padding: '12px' }}>Reviewer Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredTxnExceptions.map((row) => (
                  <tr key={row.id} style={{ borderBottom: '1px solid var(--border)', fontSize: '13px', opacity: row.state === 'resolved' ? 0.5 : 1 }}>
                    <td style={{ padding: '12px', fontFamily: 'monospace', fontWeight: '600' }}>
                      {row.rrn || row.id}
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{row.payerVpa}</div>
                    </td>
                    <td style={{ padding: '12px', fontWeight: '700' }}>₹{parseFloat(row.amount).toFixed(2)}</td>
                    <td style={{ padding: '12px', color: row.npciStatus === 'Success' ? 'var(--success)' : 'var(--warning)' }}>{row.npciStatus}</td>
                    <td style={{ padding: '12px', color: row.switchStatus === 'Success' ? 'var(--success)' : 'var(--warning)' }}>{row.switchStatus}</td>
                    <td style={{ padding: '12px', color: row.mwStatus === 'Success' ? 'var(--success)' : 'var(--danger)' }}>{row.mwStatus}</td>
                    <td style={{ padding: '12px' }}>{row.walletStatus}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600' }}>
                        {row.ruleId}: {row.actionRequired}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      {row.state === 'resolved' ? (
                        <span style={{ color: 'var(--success)', fontWeight: '700', fontSize: '12px' }}>
                          ✓ Resolved ({row.dispositionAction})
                        </span>
                      ) : (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button 
                            className="btn btn-outline"
                            style={{ padding: '4px 10px', fontSize: '11px' }}
                            onClick={() => handleDisposition(row, 'APPROVE_' + row.ruleId)}
                          >
                            Approve Action
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: 3-Way Payout Mismatches */}
      {activeTab === 'payout-exceptions' && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)', textAlign: 'left', fontSize: '12px' }}>
                <th style={{ padding: '12px' }}>Client Ref No / UTR</th>
                <th style={{ padding: '12px' }}>Merchant</th>
                <th style={{ padding: '12px' }}>Payout Amt</th>
                <th style={{ padding: '12px' }}>Bank MIS</th>
                <th style={{ padding: '12px' }}>Bank Stmt</th>
                <th style={{ padding: '12px' }}>Discrepancy Cause</th>
                <th style={{ padding: '12px' }}>Disposition</th>
              </tr>
            </thead>
            <tbody>
              {payoutExceptions.map((p, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--border)', fontSize: '13px' }}>
                  <td style={{ padding: '12px', fontFamily: 'monospace' }}>
                    {p.clientReferenceNo}
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>UTR: {p.utr}</div>
                  </td>
                  <td style={{ padding: '12px', fontWeight: '600' }}>{p.beneName}</td>
                  <td style={{ padding: '12px', fontWeight: '700' }}>₹{parseFloat(p.payoutAmount).toFixed(2)}</td>
                  <td style={{ padding: '12px', color: 'var(--success)' }}>{p.bankMisStatus}</td>
                  <td style={{ padding: '12px', color: 'var(--danger)', fontWeight: '700' }}>{p.bankStmtStatus}</td>
                  <td style={{ padding: '12px', color: 'var(--danger)' }}>{p.failureReason}</td>
                  <td style={{ padding: '12px' }}>
                    <button className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '11px' }}>
                      Escalate to Bank Ops
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Immutable Audit Trail */}
      {activeTab === 'audit-trail' && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)', textAlign: 'left', fontSize: '12px' }}>
                <th style={{ padding: '12px' }}>Audit ID</th>
                <th style={{ padding: '12px' }}>Timestamp</th>
                <th style={{ padding: '12px' }}>Actor</th>
                <th style={{ padding: '12px' }}>Action</th>
                <th style={{ padding: '12px' }}>Target Record</th>
                <th style={{ padding: '12px' }}>Reason & Justification</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid var(--border)', fontSize: '13px' }}>
                  <td style={{ padding: '12px', fontFamily: 'monospace', fontWeight: '600' }}>{log.id}</td>
                  <td style={{ padding: '12px', fontSize: '12px', color: 'var(--text-secondary)' }}>{new Date(log.timestamp).toLocaleString()}</td>
                  <td style={{ padding: '12px', fontWeight: '600' }}>{log.actor}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ background: 'rgba(34, 197, 94, 0.1)', color: 'var(--success)', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700' }}>
                      {log.action}
                    </span>
                  </td>
                  <td style={{ padding: '12px', fontFamily: 'monospace' }}>{log.target}</td>
                  <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{log.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Mandatory Reason Modal for Disposition */}
      {selectedItem && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="glass-card" style={{ width: '480px', padding: '32px', borderRadius: '24px', background: 'white' }}>
            <h3 style={{ marginTop: 0, fontSize: '20px' }}>Confirm Exception Disposition</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Action: <strong>{selectedItem.action}</strong> for transaction <code>{selectedItem.item.rrn || selectedItem.item.id}</code>.
            </p>

            <label className="input-label">Mandatory Audit Reason / Reference:</label>
            <textarea
              className="settings-input"
              rows={3}
              placeholder="Enter URCS ticket number or reason..."
              value={dispositionReason}
              onChange={(e) => setDispositionReason(e.target.value)}
              style={{ width: '100%', marginBottom: '24px' }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setSelectedItem(null)} className="btn btn-outline">Cancel</button>
              <button onClick={submitDisposition} className="btn btn-primary">Submit to Audit Log</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExceptionReviewer;
