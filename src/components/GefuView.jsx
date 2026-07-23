import React, { useState, useEffect } from 'react';
import { FileText, Download, Tag, Calendar, Clock, ChevronDown, ChevronUp, Copy, Check, Table, ShieldCheck } from 'lucide-react';
import { getStoredJobs } from '../utils/jobHistoryStore';
import { exportGefuExcelWorkbook, exportGefuAccountingExcel } from '../utils/excelWorkbookExporter';

const GefuView = ({ viewMode = 'flat' }) => {
  const [jobs, setJobs] = useState([]);
  const [expandedJobId, setExpandedJobId] = useState(null);
  const [activeSheetTabs, setActiveSheetTabs] = useState({}); // Per-job sheet tab state
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    const loadedJobs = getStoredJobs();
    setJobs(loadedJobs);
    if (loadedJobs.length > 0) {
      setExpandedJobId(loadedJobs[0].jobId);
    }
  }, []);

  const getJobTab = (jobId) => activeSheetTabs[jobId] || 'Input';

  const setJobTab = (jobId, tab) => {
    setActiveSheetTabs(prev => ({ ...prev, [jobId]: tab }));
  };

  const handleDownloadFlatFile = (job) => {
    exportGefuExcelWorkbook(job.jobId);
  };

  const handleDownloadLedger = (job) => {
    exportGefuAccountingExcel(job.jobId);
  };

  const handleCopyContent = (job) => {
    const content = job.gefuFlatFileContent || '';
    navigator.clipboard.writeText(content);
    setCopiedId(job.jobId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const isFlatMode = viewMode === 'flat';

  const sampleInputRows = [
    { txnDate: '30-06-2025', drCr: 'D', valueDate: '30-06-2025', ccy: '1', amtLcy: '2,66,618.30', amtTcy: '2,66,618.30', rate: '1.00', refNo: '0', refDocNo: '0', desc: 'UPI_NPT_FinalSettledAmt_7C_300625' },
    { txnDate: '30-06-2025', drCr: 'C', valueDate: '30-06-2025', ccy: '1', amtLcy: '2,66,618.30', amtTcy: '2,66,618.30', rate: '1.00', refNo: '0', refDocNo: '0', desc: 'UPI_NPT_FinalSettledAmt_7C_300625' },
    { txnDate: '30-06-2025', drCr: 'D', valueDate: '30-06-2025', ccy: '1', amtLcy: '44.66', amtTcy: '44.66', rate: '1.00', refNo: '0', refDocNo: '0', desc: 'Switching Fees_7C_300625' },
    { txnDate: '30-06-2025', drCr: 'D', valueDate: '30-06-2025', ccy: '1', amtLcy: '8.04', amtTcy: '8.04', rate: '1.00', refNo: '0', refDocNo: '0', desc: 'GST on Switching Fees_7C_300625' },
    { txnDate: '30-06-2025', drCr: 'C', valueDate: '30-06-2025', ccy: '1', amtLcy: '453.34', amtTcy: '453.34', rate: '1.00', refNo: '0', refDocNo: '0', desc: 'UPI Acquiring - IserveU_7C_300625' },
    { txnDate: '30-06-2025', drCr: 'C', valueDate: '30-06-2025', ccy: '1', amtLcy: '81.60', amtTcy: '81.60', rate: '1.00', refNo: '0', refDocNo: '0', desc: 'UPI Acquiring GST on Fees_7C_300625' },
    { txnDate: '30-06-2025', drCr: 'C', valueDate: '30-06-2025', ccy: '1', amtLcy: '2,624.68', amtTcy: '2,624.68', rate: '1.00', refNo: '0', refDocNo: '0', desc: 'UPI Acquiring-iServeU_7C_300625' },
    { txnDate: '30-06-2025', drCr: 'C', valueDate: '30-06-2025', ccy: '1', amtLcy: '2,63,458.68', amtTcy: '2,63,458.68', rate: '1.00', refNo: '0', refDocNo: '0', desc: 'UPI_NPT_FinalSettledAmt_7C_300625' },
    { txnDate: '30-06-2025', drCr: 'D', valueDate: '30-06-2025', ccy: '1', amtLcy: '51,27,651.78', amtTcy: '51,27,651.78', rate: '1.00', refNo: '0', refDocNo: '0', desc: 'UPI_NPT_FinalSettledAmt_8C_300625' },
    { txnDate: '30-06-2025', drCr: 'C', valueDate: '30-06-2025', ccy: '1', amtLcy: '51,27,651.78', amtTcy: '51,27,651.78', rate: '1.00', refNo: '0', refDocNo: '0', desc: 'UPI_NPT_FinalSettledAmt_8C_300625' },
    { txnDate: '30-06-2025', drCr: 'D', valueDate: '30-06-2025', ccy: '1', amtLcy: '990.93', amtTcy: '990.93', rate: '1.00', refNo: '0', refDocNo: '0', desc: 'Switching Fees_8C_300625' },
    { txnDate: '30-06-2025', drCr: 'D', valueDate: '30-06-2025', ccy: '1', amtLcy: '178.38', amtTcy: '178.38', rate: '1.00', refNo: '0', refDocNo: '0', desc: 'GST on Switching Fees_8C_300625' },
    { txnDate: '30-06-2025', drCr: 'C', valueDate: '30-06-2025', ccy: '1', amtLcy: '8,699.61', amtTcy: '8,699.61', rate: '1.00', refNo: '0', refDocNo: '0', desc: 'UPI Acquiring - IserveU_8C_300625' },
    { txnDate: '30-06-2025', drCr: 'C', valueDate: '30-06-2025', ccy: '1', amtLcy: '1,565.94', amtTcy: '1,565.94', rate: '1.00', refNo: '0', refDocNo: '0', desc: 'UPI Acquiring GST on Fees_8C_300625' },
    { txnDate: '30-06-2025', drCr: 'C', valueDate: '30-06-2025', ccy: '1', amtLcy: '25,917.31', amtTcy: '25,917.31', rate: '1.00', refNo: '0', refDocNo: '0', desc: 'UPI Acquiring-iServeU_8C_300625' },
    { txnDate: '30-06-2025', drCr: 'D', valueDate: '30-06-2025', ccy: '1', amtLcy: '600.00', amtTcy: '600.00', rate: '1.00', refNo: '0', refDocNo: '0', desc: 'Net Adjusted Amount' },
    { txnDate: '30-06-2025', drCr: 'C', valueDate: '30-06-2025', ccy: '1', amtLcy: '50,92,068.92', amtTcy: '50,92,068.92', rate: '1.00', refNo: '0', refDocNo: '0', desc: 'UPI_NPT_FinalSettledAmt_8C_300625' }
  ];

  const sampleAccountingRows = [
    { accNo: '208100063', name: 'RBI Mirror Account', type: 'Debit', amt: '265.18', remarks: 'UPI_NPT_FinalSettledAmt_6C_050625', source: 'NPCI NTSL' },
    { accNo: '208100472', name: 'SL-UPI ACQUIRING PAYABLE-MERCHANT SETTLEMENT', type: 'Credit', amt: '265.18', remarks: 'UPI_NPT_FinalSettledAmt_6C_050625', source: 'NPCI NTSL' },
    { accNo: '208100472', name: 'SL-UPI ACQUIRING PAYABLE-MERCHANT SETTLEMENT', type: 'Debit', amt: '265.18', remarks: 'UPI_NPT_FinalSettledAmt_6C_050625', source: 'NPCI NTSL' },
    { accNo: '404210045', name: 'GC-INTERCHANGE CHARGES-UPI', type: 'Debit', amt: '-', remarks: 'Switching Fees', source: 'NPCI NTSL' },
    { accNo: '114180001', name: 'CGST 9% INPUT TAX CREDIT', type: 'Debit', amt: '-', remarks: 'GST on Switching Fees', source: 'NPCI NTSL' },
    { accNo: '114180006', name: 'SGST 9% INPUT CREDIT', type: 'Debit', amt: '-', remarks: 'GST on Switching Fees', source: 'NPCI NTSL' },
    { accNo: '404210045', name: 'GC-INTERCHANGE CHARGES-UPI', type: 'Credit', amt: '-', remarks: 'Switching Fees', source: 'NPCI NTSL' },
    { accNo: '114180001', name: 'CGST 9% INPUT TAX CREDIT', type: 'Credit', amt: '-', remarks: 'GST on Switching Fees', source: 'NPCI NTSL' },
    { accNo: '114180006', name: 'SGST 9% INPUT CREDIT', type: 'Credit', amt: '-', remarks: 'GST on Switching Fees', source: 'NPCI NTSL' },
    { accNo: '302110017', name: 'COMM-UPI', type: 'Debit', amt: '-', remarks: 'Switching Fees', source: 'NPCI NTSL' },
    { accNo: '208080061', name: 'SL-CENTRAL GST PAYABLE', type: 'Debit', amt: '-', remarks: 'GST on Switching Fees', source: 'NPCI NTSL' },
    { accNo: '208080062', name: 'SL-STATE GST PAYABLE', type: 'Debit', amt: '-', remarks: 'GST on Switching Fees', source: 'NPCI NTSL' },
    { accNo: '302110017', name: 'COMM-UPI', type: 'Credit', amt: '-', remarks: 'Switching Fees', source: 'NPCI NTSL' },
    { accNo: '208080061', name: 'SL-CENTRAL GST PAYABLE', type: 'Credit', amt: '-', remarks: 'GST on Switching Fees', source: 'NPCI NTSL' },
    { accNo: '208080062', name: 'SL-STATE GST PAYABLE', type: 'Credit', amt: '-', remarks: 'GST on Switching Fees', source: 'NPCI NTSL' },
    { accNo: '302110017', name: 'COMM-UPI', type: 'Credit', amt: '0.45', remarks: 'UPI Acquiring - IserveU_6C_050625', source: '17 bps' },
    { accNo: '208080061', name: 'SL-CENTRAL GST PAYABLE', type: 'Credit', amt: '0.04', remarks: 'UPI Acquiring GST on Fees_6C_050625', source: '' },
    { accNo: '208080062', name: 'SL-STATE GST PAYABLE', type: 'Credit', amt: '0.04', remarks: 'UPI Acquiring GST on Fees_6C_050625', source: '' },
    { accNo: '502003805716', name: 'ISERVEU TECHNOLOGY PRIVATE LIMITED', type: 'Credit', amt: '-', remarks: '', source: '' },
    { accNo: '502003806105', name: 'NSDL PAYMENTS BANK LIMITED', type: 'Credit', amt: '264.65', remarks: 'UPI_NPT_FinalSettledAmt_6C_050625', source: 'NPCI NTSL' },
    { accNo: '502003805716', name: 'ISERVEU TECHNOLOGY PRIVATE LIMITED', type: 'Debit', amt: '-', remarks: 'Dispute Adjustment Amount', source: 'NPCI NTSL' },
    { accNo: '502003805716', name: 'ISERVEU TECHNOLOGY PRIVATE LIMITED', type: 'Credit', amt: '-', remarks: 'Representement Adjustment Amount', source: 'NPCI NTSL' },
    { accNo: '******', name: 'Fees Account', type: 'Credit/Debit', amt: '-', remarks: 'Adjusted Fee', source: 'NPCI NTSL' },
    { accNo: '******', name: 'GST Account', type: 'Credit/Debit', amt: '-', remarks: 'Adjusted Fee with Tax', source: 'NPCI NTSL' }
  ];

  const fieldFormatsRules = [
    { field: 'Txn Type', casa: '1', gl: '3', rule: 'Must be 1 for CASA and 3 for GL', mandatory: 'Y' },
    { field: 'Account Number', casa: '501000000794', gl: '208100011', rule: 'Number only', mandatory: 'Y' },
    { field: 'Branch Code', casa: '8888', gl: '8888', rule: 'Number only', mandatory: 'Y' },
    { field: 'Txn Code', casa: '1008', gl: '1408', rule: 'Number only', mandatory: 'Y' },
    { field: 'Txn Date', casa: '22/08/2019', gl: '22/08/2019', rule: 'Date format must be DD/MM/YYYY', mandatory: 'Y' },
    { field: 'Dr / Cr', casa: 'D', gl: 'C', rule: 'Char', mandatory: 'Y' },
    { field: 'Value Date', casa: '22/08/2019', gl: '22/08/2019', rule: 'Date format must be DD/MM/YYYY', mandatory: 'Y' },
    { field: 'Txn CCY', casa: '1', gl: '1', rule: 'Number only', mandatory: 'Y' },
    { field: 'Amt LCY', casa: '1.00', gl: '1.00', rule: 'Number only', mandatory: 'Y' },
    { field: 'Amt TCY', casa: '1.00', gl: '1.00', rule: 'Number only', mandatory: 'Y' },
    { field: 'Rate Con', casa: '1.00', gl: '1.00', rule: 'Number only', mandatory: 'Y' },
    { field: 'Ref No', casa: '0', gl: '0', rule: 'Number only', mandatory: 'Y' },
    { field: 'Ref Doc No', casa: '0', gl: '0', rule: 'Number only', mandatory: 'Y' },
    { field: 'Transaction Description', casa: 'BBPS-JME20190815020855', gl: 'BBPS-JME201908150408', rule: 'Varchar', mandatory: 'Y' },
    { field: 'Option', casa: '30', gl: '30', rule: 'Number only', mandatory: 'Y' },
    { field: 'Issuer Code', casa: '00000', gl: '00000', rule: 'Number only', mandatory: 'Y' },
    { field: 'Payable Branch', casa: '0000', gl: '0000', rule: 'Number only', mandatory: 'Y' },
    { field: 'Flag Future dated', casa: 'N', gl: 'N', rule: 'Char', mandatory: 'Y' },
    { field: 'Mis Code', casa: '0000000000000000', gl: '0000000000000000', rule: 'Number only', mandatory: 'Y' }
  ];

  return (
    <div className="glass-card animate-fade-in" style={{ padding: '36px' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '26px', margin: 0, fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FileText color="var(--primary)" size={26} />
          {isFlatMode ? 'GEFU File (FLEXCUBE Core Banking Flat File Generator)' : 'GEFU Accounting File (Internal Audit Ledger)'}
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '14.5px' }}>
          {isFlatMode 
            ? 'FLEXCUBE Core Banking 4-Sheet Staging Engine: Input (Data Entry) → Formatter_Working → Output (559-char concatenated fixed-width string) → Field_Formats rulebook.'
            : 'Internal GEFU Accounting Ledger detailing Debit/Credit account entries, Remarks, and Source Sub-systems.'}
        </p>
      </div>

      {/* Detailed Tabular Jobs List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {jobs.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', background: 'var(--bg-hover)', borderRadius: '16px' }}>
            No reconciliation jobs found. Run a reconciliation on the <strong>UPI Reconciliation</strong> module to generate GEFU files.
          </div>
        ) : (
          jobs.map(job => {
            const isExpanded = expandedJobId === job.jobId;
            const currentTab = getJobTab(job.jobId);
            const ledgerData = job.gefuAccountingLedger || sampleAccountingRows;

            return (
              <div key={job.jobId} style={{ background: 'white', borderRadius: '18px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                {/* Job Summary Row */}
                <div 
                  onClick={() => setExpandedJobId(isExpanded ? null : job.jobId)}
                  style={{ padding: '20px 24px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', background: isExpanded ? 'var(--bg-hover)' : 'white' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>
                      <Tag size={20} />
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <h4 style={{ margin: 0, fontSize: '17px', fontFamily: 'monospace', fontWeight: '800' }}>{job.jobId}</h4>
                        <span className="badge badge-success" style={{ fontSize: '11px' }}>✓ {job.status}</span>
                      </div>
                      <p style={{ margin: '4px 0 0 0', fontSize: '12.5px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <span><Calendar size={13} style={{ verticalAlign: 'text-bottom' }} /> {job.date} ({job.time})</span>
                        <span><Clock size={13} style={{ verticalAlign: 'text-bottom' }} /> {job.cycle}</span>
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {isFlatMode ? (
                      <button onClick={(e) => { e.stopPropagation(); handleDownloadFlatFile(job); }} className="btn btn-primary" style={{ padding: '10px 18px', fontSize: '13px', fontWeight: '700' }}>
                        <Download size={15} /> Download GEFU_File.xlsx
                      </button>
                    ) : (
                      <button onClick={(e) => { e.stopPropagation(); handleDownloadLedger(job); }} className="btn btn-primary" style={{ padding: '10px 18px', fontSize: '13px', fontWeight: '700' }}>
                        <Download size={15} /> Download GEFU_Accounting.xlsx
                      </button>
                    )}

                    <button className="btn btn-outline" style={{ padding: '8px 12px', fontSize: '12px' }}>
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      {isExpanded ? 'Hide Data' : 'View Tabular File'}
                    </button>
                  </div>
                </div>

                {/* Expanded Detailed Tabular File View */}
                {isExpanded && (
                  <div style={{ padding: '24px', borderTop: '1px solid var(--border)', background: '#F8FAFC' }}>
                    {isFlatMode ? (
                      /* Flat File 3-Sheet Inspector */
                      <div>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                          <button 
                            onClick={() => setJobTab(job.jobId, 'Input')} 
                            className={`btn ${currentTab === 'Input' ? 'btn-primary' : 'btn-outline'}`}
                            style={{ fontSize: '12.5px', padding: '6px 14px' }}
                          >
                            <Table size={14} /> Sheet 1: Input (Transactions)
                          </button>
                          <button 
                            onClick={() => setJobTab(job.jobId, 'Output')} 
                            className={`btn ${currentTab === 'Output' ? 'btn-primary' : 'btn-outline'}`}
                            style={{ fontSize: '12.5px', padding: '6px 14px' }}
                          >
                            <FileText size={14} /> Sheet 2: Output (Fixed-Width Messages)
                          </button>
                          <button 
                            onClick={() => setJobTab(job.jobId, 'Field_Formats')} 
                            className={`btn ${currentTab === 'Field_Formats' ? 'btn-primary' : 'btn-outline'}`}
                            style={{ fontSize: '12.5px', padding: '6px 14px' }}
                          >
                            <ShieldCheck size={14} /> Sheet 3: Field_Formats (Rulebook)
                          </button>
                        </div>

                        {currentTab === 'Input' && (
                          <div>
                            <span style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--primary)', display: 'block', marginBottom: '12px' }}>
                              Sheet 1: Input Data Entry Table for {job.jobId}
                            </span>
                            <div style={{ overflowX: 'auto' }}>
                              <table className="data-table" style={{ fontSize: '12px' }}>
                                <thead>
                                  <tr>
                                    <th>Txn Date</th>
                                    <th>Dr / Cr</th>
                                    <th>Value Date</th>
                                    <th>Txn CCY</th>
                                    <th>Amt LCY</th>
                                    <th>Amt TCY</th>
                                    <th>Rate Con</th>
                                    <th>Ref No</th>
                                    <th>Ref Doc No</th>
                                    <th>Transaction Description</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {sampleInputRows.map((row, idx) => (
                                    <tr key={idx}>
                                      <td>{row.txnDate}</td>
                                      <td><span className={`badge ${row.drCr === 'D' ? 'badge-warning' : 'badge-success'}`}>{row.drCr}</span></td>
                                      <td>{row.valueDate}</td>
                                      <td>{row.ccy}</td>
                                      <td style={{ fontWeight: '700' }}>₹{row.amtLcy}</td>
                                      <td style={{ fontWeight: '700' }}>₹{row.amtTcy}</td>
                                      <td>{row.rate}</td>
                                      <td>{row.refNo}</td>
                                      <td>{row.refDocNo}</td>
                                      <td style={{ fontFamily: 'monospace', fontWeight: '600' }}>{row.desc}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {currentTab === 'Output' && (
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                              <span style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--primary)' }}>
                                Sheet 2: Output Fixed-Width Concatenated Messages for {job.jobId}
                              </span>
                              <button onClick={() => handleCopyContent(job)} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '12px' }}>
                                {copiedId === job.jobId ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
                                {copiedId === job.jobId ? 'Copied!' : 'Copy Raw Output'}
                              </button>
                            </div>
                            <pre style={{ background: '#0F172A', color: '#38BDF8', padding: '18px', borderRadius: '12px', fontSize: '11.5px', fontFamily: 'monospace', overflowX: 'auto', margin: 0, whiteSpace: 'pre-wrap' }}>
                              {job.gefuFlatFileContent || '120260723\n559 203 40421004588880100820250630D202506300000100000000044660000000000446600000010000000000000000000000000Switching Fees_7C_300625\n559 203 11418000188880140820250630C202506300000100000000008040000000000080400000010000000000000000000000000GST on Switching Fees_7C_300625\n3000000009000001079036217000000014000001079036217'}
                            </pre>
                          </div>
                        )}

                        {currentTab === 'Field_Formats' && (
                          <div>
                            <span style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--primary)', display: 'block', marginBottom: '12px' }}>
                              Sheet 3: Field_Formats Validation Rulebook
                            </span>
                            <div style={{ overflowX: 'auto' }}>
                              <table className="data-table" style={{ fontSize: '12px' }}>
                                <thead>
                                  <tr>
                                    <th>Fields</th>
                                    <th>Sample CASA Value</th>
                                    <th>Sample GL Value</th>
                                    <th>Validations Rule</th>
                                    <th>Mandatory</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {fieldFormatsRules.map((row, idx) => (
                                    <tr key={idx}>
                                      <td style={{ fontWeight: '700' }}>{row.field}</td>
                                      <td style={{ fontFamily: 'monospace' }}>{row.casa}</td>
                                      <td style={{ fontFamily: 'monospace' }}>{row.gl}</td>
                                      <td>{row.rule}</td>
                                      <td><span className="badge badge-success">{row.mandatory}</span></td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* GEFU Accounting Ledger Table matching screenshot */
                      <div>
                        <span style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--primary)', display: 'block', marginBottom: '12px' }}>
                          GEFU Accounting Ledger Table for {job.jobId}
                        </span>
                        <div style={{ overflowX: 'auto' }}>
                          <table className="data-table" style={{ fontSize: '12px' }}>
                            <thead>
                              <tr style={{ background: '#FEF08A', color: '#1E293B' }}>
                                <th>Account Number</th>
                                <th>Account Name</th>
                                <th>Debit / Credit</th>
                                <th>Amount</th>
                                <th>Remarks</th>
                                <th>Source</th>
                              </tr>
                            </thead>
                            <tbody>
                              {ledgerData.map((row, idx) => {
                                const accNo = row['Account Number'] || row.accNo || row.accountNumber;
                                const accName = row['Account Name'] || row.name || row.accountName;
                                const type = row['Debit / Credit'] || row.type || row.drCr;
                                const amt = row['Amount'] || row.amt || row.amount;
                                const remarks = row['Remarks'] || row.remarks;
                                const source = row['Source'] || row.source || '';

                                return (
                                  <tr key={idx} style={{ background: accNo === '502003806105' ? 'rgba(254, 240, 138, 0.3)' : 'transparent' }}>
                                    <td style={{ fontWeight: '700', fontFamily: 'monospace' }}>{accNo}</td>
                                    <td style={{ fontWeight: '600' }}>{accName}</td>
                                    <td>
                                      <span className={`badge ${type === 'Debit' || type === 'DR' ? 'badge-warning' : 'badge-success'}`}>
                                        {type}
                                      </span>
                                    </td>
                                    <td style={{ fontWeight: '700', background: accNo === '502003806105' ? '#FEF08A' : 'transparent' }}>
                                      {amt !== '-' && amt !== '' ? `₹${amt}` : '-'}
                                    </td>
                                    <td style={{ fontFamily: 'monospace', fontSize: '11.5px' }}>{remarks}</td>
                                    <td><span className="badge badge-outline" style={{ fontSize: '10.5px' }}>{source}</span></td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default GefuView;
