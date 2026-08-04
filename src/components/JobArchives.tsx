import React, { useState, useMemo } from 'react';
import {
  History,
  Search,
  Download,
  Calendar,
  CheckCircle2,
  Filter,
  XCircle,
  Clock,
  Layers,
  PackageCheck,
  Eye,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { ReconJob, SubProduct } from '../types';
import { CATEGORIES, SUB_PRODUCTS, BUSINESS_VERTICALS } from '../data/categoriesAndSubProducts';
import { exportToExcel, exportSettlementToExcel } from '../utils/excelExporter';
import { Page6Results } from './wizard/Page6Results';

interface JobArchivesProps {
  jobs: ReconJob[];
  onStartNewRecon?: () => void;
}

export const JobArchives: React.FC<JobArchivesProps> = ({ jobs, onStartNewRecon }) => {
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterProduct, setFilterProduct] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('');
  const [filterCycle, setFilterCycle] = useState<string>('all');

  // Inline expanded job state for downline report expansion
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

  const toggleJobExpand = (jobId: string) => {
    setExpandedJobId((prev) => (prev === jobId ? null : jobId));
  };

  const getSubProductForJob = (job: ReconJob): SubProduct => {
    const found = SUB_PRODUCTS.find((sp) => sp.id === job.subProductId);
    if (found) return found;
    return {
      id: job.subProductId,
      categoryId: job.categoryName.toLowerCase(),
      name: job.subProductName,
      description: 'Historical reconciled product',
      autoClearanceEnabled: true,
      requiredFiles: [
        {
          id: 'npci',
          name: 'NPCI SETTLEMENT FILE',
          type: 'counterparty',
          channel: 'NPCI Clearing Portal / SFTP',
          defaultRecordCount: job.totalRecords
        },
        {
          id: 'middleware',
          name: 'MIDDLEWARE TXN LOG',
          type: 'internal',
          channel: 'GCP Bucket (gs://prod-isurecon/...)',
          defaultRecordCount: Math.max(10, job.totalRecords - 20)
        },
        {
          id: 'switch',
          name: 'AEPS SWITCH / CBS LOG',
          type: 'internal' as const,
          channel: 'GCP Bucket (gs://prod-isurecon/...)',
          defaultRecordCount: Math.max(10, job.totalRecords - 60)
        }
      ]
    };
  };

  // Dependent Sub-Products based on selected category
  const availableSubProducts = useMemo(() => {
    if (filterCategory === 'all') {
      return SUB_PRODUCTS;
    }
    return SUB_PRODUCTS.filter((sp) => sp.categoryId === filterCategory);
  }, [filterCategory]);

  // Reset dependent product selection if category changes and current product doesn't belong to it
  const handleCategoryChange = (newCat: string) => {
    setFilterCategory(newCat);
    setFilterProduct('all');
  };

  // Clear all active filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setFilterCategory('all');
    setFilterProduct('all');
    setFilterDate('');
    setFilterCycle('all');
  };

  // Filtered Jobs Computation
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // 1. Text Search (Product Name, Category Name)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesProduct = job.subProductName.toLowerCase().includes(query);
        const matchesCategory = job.categoryName.toLowerCase().includes(query);
        if (!matchesProduct && !matchesCategory) return false;
      }

      // 2. Category Filter
      if (filterCategory !== 'all') {
        const targetCategoryObj = CATEGORIES.find((c) => c.id === filterCategory);
        if (targetCategoryObj) {
          if (job.categoryName.toLowerCase() !== targetCategoryObj.name.toLowerCase()) {
            return false;
          }
        }
      }

      // 3. Sub-Product Filter
      if (filterProduct !== 'all') {
        const targetSubProductObj = SUB_PRODUCTS.find((sp) => sp.id === filterProduct);
        if (targetSubProductObj) {
          if (job.subProductName.toLowerCase() !== targetSubProductObj.name.toLowerCase()) {
            return false;
          }
        }
      }

      // 4. Date Filter
      if (filterDate) {
        if (job.date !== filterDate) return false;
      }

      // 5. Settlement Cycle Filter
      if (filterCycle !== 'all') {
        if (filterCycle === 'daily' && !job.cycle.toLowerCase().includes('daily')) return false;
        if (filterCycle === 'cycle1' && !job.cycle.includes('Cycle 1')) return false;
        if (filterCycle === 'cycle2' && !job.cycle.includes('Cycle 2')) return false;
        if (filterCycle === 'cycle3' && !job.cycle.includes('Cycle 3')) return false;
      }

      return true;
    });
  }, [jobs, searchQuery, filterCategory, filterProduct, filterDate, filterCycle]);

  // Excel Downloads
  const handleDownloadMatched = (job: ReconJob) => {
    exportToExcel(job.matchedData, job.subProductName, 'MATCHED', job.date, job.cycle);
  };

  const handleDownloadMismatched = (job: ReconJob) => {
    exportToExcel(job.mismatchedData, job.subProductName, 'MISMATCHED', job.date, job.cycle);
  };

  const handleDownloadSettlement = (job: ReconJob) => {
    exportSettlementToExcel(job.matchedData, job.subProductName, job.date, job.cycle);
  };

  const hasActiveFilters = Boolean(
    searchQuery || filterCategory !== 'all' || filterProduct !== 'all' || filterDate || filterCycle !== 'all'
  );

  return (
    <div className="space-y-6">
      {/* Multi-Criteria Filter Controls Panel */}
      <div className="glass-card p-5 space-y-4">
        <div className="flex items-center justify-between gap-2 border-b border-[#e2e8f0] pb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#1b2a3e]">
            <Filter className="w-4 h-4 text-[#119db0]" />
            <span>Filter Reports</span>
          </div>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="px-3 py-1.5 rounded-lg bg-[#ef4444]/10 hover:bg-[#ef4444]/20 text-[#ef4444] text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Clear All Filters</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* 1. Global Search Input */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[#475569] flex items-center gap-1">
              <Search className="w-3 h-3 text-[#119db0]" />
              <span>Search</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Product, Category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-3 pr-3 py-2 rounded-xl border border-[#e2e8f0] bg-white text-xs text-[#1b2a3e] font-medium focus:outline-none focus:ring-2 focus:ring-[#119db0]"
              />
            </div>
          </div>

          {/* 2. Main Category Filter Dropdown */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[#475569] flex items-center gap-1">
              <Layers className="w-3 h-3 text-[#119db0]" />
              <span>Category</span>
            </label>
            <select
              value={filterCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#e2e8f0] bg-white text-xs text-[#1b2a3e] font-medium focus:outline-none focus:ring-2 focus:ring-[#119db0]"
            >
              <option value="all">All Categories ({CATEGORIES.length})</option>
              {BUSINESS_VERTICALS.map((vert) => {
                const vertCategories = CATEGORIES.filter((c) => c.verticalId === vert.id);
                return (
                  <optgroup key={vert.id} label={vert.name}>
                    {vertCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </optgroup>
                );
              })}
            </select>
          </div>

          {/* 3. Dependent Sub-Product Dropdown */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[#475569] flex items-center gap-1">
              <PackageCheck className="w-3 h-3 text-[#119db0]" />
              <span>Sub-Product</span>
            </label>
            <select
              value={filterProduct}
              onChange={(e) => setFilterProduct(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#e2e8f0] bg-white text-xs text-[#1b2a3e] font-medium focus:outline-none focus:ring-2 focus:ring-[#119db0]"
            >
              <option value="all">All Sub-Products ({availableSubProducts.length})</option>
              {availableSubProducts.map((sp) => (
                <option key={sp.id} value={sp.id}>
                  {sp.name}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Business Date Picker */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[#475569] flex items-center gap-1">
              <Calendar className="w-3 h-3 text-[#119db0]" />
              <span>Business Date</span>
            </label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#e2e8f0] bg-white text-xs text-[#1b2a3e] font-medium focus:outline-none focus:ring-2 focus:ring-[#119db0]"
            />
          </div>

          {/* 5. Settlement Cycle Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[#475569] flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#119db0]" />
              <span>Settlement Cycle</span>
            </label>
            <select
              value={filterCycle}
              onChange={(e) => setFilterCycle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#e2e8f0] bg-white text-xs text-[#1b2a3e] font-medium focus:outline-none focus:ring-2 focus:ring-[#119db0]"
            >
              <option value="all">All Cycles</option>
              <option value="daily">Daily Consolidated</option>
              <option value="cycle1">Cycle 1 (00:00 - 08:00)</option>
              <option value="cycle2">Cycle 2 (08:00 - 16:00)</option>
              <option value="cycle3">Cycle 3 (16:00 - 24:00)</option>
            </select>
          </div>
        </div>

        {/* Results Counter Bar */}
        <div className="flex items-center justify-between text-xs text-[#475569] pt-2 border-t border-[#e2e8f0]/60">
          <span>
            Showing <strong className="text-[#119db0] font-bold">{filteredJobs.length}</strong> of {jobs.length} Archive Entries
          </span>
          {hasActiveFilters && (
            <span className="text-[11px] text-[#119db0] font-semibold bg-[#119db0]/10 px-2 py-0.5 rounded-md">
              Filtered View Active
            </span>
          )}
        </div>
      </div>

      {/* Historical Jobs Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1b2a3e] text-white font-semibold">
              <tr>
                <th className="p-4 border-b border-[#253650]">Product Name</th>
                <th className="p-4 border-b border-[#253650]">Category</th>
                <th className="p-4 border-b border-[#253650]">Date & Cycle</th>
                <th className="p-4 border-b border-[#253650]">Match Rate %</th>
                <th className="p-4 border-b border-[#253650]">Status</th>
                <th className="p-4 border-b border-[#253650] text-right">Download Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0] bg-white text-[#1b2a3e]">
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#475569] font-medium">
                    No historical reconciliation jobs match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job) => {
                  const isHighMatch = job.matchRate >= 95;
                  const isExpanded = expandedJobId === job.id;
                  const subProductObj = getSubProductForJob(job);

                  return (
                    <React.Fragment key={job.id}>
                      {/* Standard History Row */}
                      <tr
                        onClick={() => toggleJobExpand(job.id)}
                        className={`cursor-pointer transition-colors ${
                          isExpanded
                            ? 'bg-[#119db0]/10 font-medium'
                            : 'hover:bg-[#f0f4f8]'
                        }`}
                      >
                        {/* Product Name with Chevron */}
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-[#119db0] shrink-0" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-[#94a3b8] shrink-0" />
                            )}
                            <div className="font-bold text-[#1b2a3e] text-sm">{job.subProductName}</div>
                          </div>
                        </td>

                        {/* Category Badge */}
                        <td className="p-4">
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#1b2a3e]/10 text-[#1b2a3e]">
                            {job.categoryName}
                          </span>
                        </td>

                        {/* Date & Cycle */}
                        <td className="p-4">
                          <div className="font-semibold text-[#1b2a3e] flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-[#119db0]" />
                            <span>{job.date}</span>
                          </div>
                          <div className="text-[11px] text-[#475569] font-medium mt-0.5">{job.cycle}</div>
                        </td>

                        {/* Match Rate % Badging */}
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                              isHighMatch
                                ? 'bg-[#10b981]/15 text-[#10b981]'
                                : 'bg-[#f59e0b]/15 text-[#d97706]'
                            }`}
                          >
                            {job.matchRate}%
                          </span>
                          <div className="w-20 bg-[#e2e8f0] h-1.5 rounded-full overflow-hidden mt-1.5">
                            <div
                              className={`h-full ${isHighMatch ? 'bg-[#10b981]' : 'bg-[#f59e0b]'}`}
                              style={{ width: `${Math.min(job.matchRate, 100)}%` }}
                            />
                          </div>
                        </td>

                        {/* Job Status */}
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#10b981]/15 text-[#10b981]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Completed</span>
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleDownloadMatched(job)}
                              className="px-2.5 py-1.5 rounded-lg bg-[#10b981] hover:bg-[#0d9668] text-white font-semibold text-[11px] shadow-xs transition flex items-center gap-1 cursor-pointer"
                              title="Download Matched .xlsx"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Matched</span>
                            </button>

                            <button
                              onClick={() => handleDownloadMismatched(job)}
                              className="px-2.5 py-1.5 rounded-lg bg-[#ef4444] hover:bg-[#dc2626] text-white font-semibold text-[11px] shadow-xs transition flex items-center gap-1 cursor-pointer"
                              title="Download Mismatched .xlsx"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Mismatched</span>
                            </button>

                            <button
                              onClick={() => handleDownloadSettlement(job)}
                              className="px-2.5 py-1.5 rounded-lg bg-[#119db0] hover:bg-[#0e8394] text-white font-semibold text-[11px] shadow-xs transition flex items-center gap-1 cursor-pointer"
                              title="Download Settlement .xlsx"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Settlement</span>
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Downline Expanded Report View */}
                      {isExpanded && (
                        <tr className="bg-[#f0f4f8]">
                          <td colSpan={6} className="p-4 sm:p-6 border-y-2 border-[#119db0]/30 shadow-inner">
                            <div className="space-y-4 animate-in fade-in duration-300">
                              <div className="bg-[#1b2a3e] text-white rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-[#119db0]/20 text-[#119db0] flex items-center justify-center font-bold shrink-0">
                                    <Eye className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <span className="text-[10px] font-bold text-[#119db0] uppercase tracking-wider">
                                      Detailed Reconciliation KPI Report (Downline View)
                                    </span>
                                    <h4 className="text-sm font-bold text-white">
                                      {job.subProductName} — {job.date} ({job.cycle})
                                    </h4>
                                  </div>
                                </div>

                                <button
                                  onClick={() => toggleJobExpand(job.id)}
                                  className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
                                >
                                  <ChevronUp className="w-4 h-4 text-[#119db0]" />
                                  <span>Collapse Report (Back to Line)</span>
                                </button>
                              </div>

                              <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 shadow-xs">
                                <Page6Results
                                  subProduct={subProductObj}
                                  targetDate={job.date}
                                  targetCycle={job.cycle}
                                  matchedRecords={job.matchedData}
                                  mismatchedRecords={job.mismatchedData}
                                  job={job}
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
