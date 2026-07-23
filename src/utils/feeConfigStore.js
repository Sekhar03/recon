/**
 * Persistent Store for System-Wide Fee & Tax Configurations
 * Controls Bank Share %, CGST %, SGST %, IGST %, Switching Fees, Interchange %, Platform %, and IMPS Chunk Limits.
 */

const FEE_CONFIG_KEY = 'iserveu_recon_fee_config_v1';

export const DEFAULT_FEE_CONFIG = {
  bankShareRate: 0.2006,       // 0.2006% per spec formula
  cgstRate: 9.0,              // 9.0% CGST
  sgstRate: 9.0,              // 9.0% SGST
  igstRate: 18.0,             // 18.0% IGST
  switchingFeePerTxn: 0.05,    // ₹0.05 per txn
  interchangeRate: 0.10,      // 0.10% Interchange
  platformFeeRate: 0.02,      // 0.02% Platform Fee
  impsPayoutMaxLimit: 500000, // ₹500,000 max limit per IMPS chunk
  disputeHoldRate: 0.00
};

export function getFeeConfig() {
  try {
    const data = localStorage.getItem(FEE_CONFIG_KEY);
    if (data) {
      return { ...DEFAULT_FEE_CONFIG, ...JSON.parse(data) };
    }
  } catch (err) {
    console.error('Failed to parse fee config:', err);
  }
  return { ...DEFAULT_FEE_CONFIG };
}

export function saveFeeConfig(config) {
  try {
    localStorage.setItem(FEE_CONFIG_KEY, JSON.stringify(config));
    return true;
  } catch (err) {
    console.error('Failed to save fee config:', err);
    return false;
  }
}

export function resetFeeConfig() {
  try {
    localStorage.removeItem(FEE_CONFIG_KEY);
    return { ...DEFAULT_FEE_CONFIG };
  } catch (err) {
    console.error('Failed to reset fee config:', err);
    return { ...DEFAULT_FEE_CONFIG };
  }
}
