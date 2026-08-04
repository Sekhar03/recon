import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Calendar, Clock } from 'lucide-react';
import { SubProduct } from '../../types';
import { SUB_PRODUCTS } from '../../data/categoriesAndSubProducts';

interface Page3DateCycleProps {
  subProduct: SubProduct;
  onProceed: (date: string, cycle: string) => void;
  onBackToSubProducts: () => void;
  initialDate?: string;
  initialCycle?: string;
}

export const Page3DateCycle: React.FC<Page3DateCycleProps> = ({
  subProduct,
  onProceed,
  onBackToSubProducts,
  initialDate = '2026-07-28',
  initialCycle = 'Cycle 1 (00:00 - 08:00 Window)'
}) => {
  const [date, setDate] = useState(initialDate);
  const [cycle, setCycle] = useState(initialCycle);

  const isSingleSubProduct = SUB_PRODUCTS.filter(sp => sp.categoryId === subProduct.categoryId).length <= 1;

  const cycleOptions = [
    { value: 'All Cycles (Daily Consolidated)', label: 'All Cycles (Daily Consolidated)', scope: 'Full 24-Hour Consolidated Batch' },
    { value: 'Cycle 1 (00:00 - 08:00 Window)', label: 'Cycle 1', scope: '00:00 - 08:00 Window' },
    { value: 'Cycle 2 (08:00 - 16:00 Window)', label: 'Cycle 2', scope: '08:00 - 16:00 Window' },
    { value: 'Cycle 3 (16:00 - 24:00 Window)', label: 'Cycle 3', scope: '16:00 - 24:00 Window' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onProceed(date, cycle);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header Info with Prominent Upper Back Button */}
      <div className="bg-white border border-[#e2e8f0] rounded-[20px] p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-[#e2e8f0]">
          <button
            type="button"
            onClick={onBackToSubProducts}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#1b2a3e] hover:bg-[#119db0] text-white text-xs font-bold transition-all shadow-md hover:shadow-lg shadow-[#1b2a3e]/15 group cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>{isSingleSubProduct ? 'Back to Category Selection' : 'Back to Sub-Products'}</span>
          </button>

          <span className="text-xs font-bold text-[#119db0] bg-[#119db0]/10 border border-[#119db0]/20 px-3.5 py-1.5 rounded-full self-start sm:self-auto">
            Sub-Product: {subProduct.name}
          </span>
        </div>

        <div>
          <h2 className="text-xl font-bold text-[#1b2a3e]">
            Configure Target Business Date & Settlement Cycle
          </h2>
          <p className="text-xs text-[#475569] font-medium mt-1">
            Specify reconciliation business date and target cycle for <span className="font-bold text-[#119db0]">{subProduct.name}</span>
          </p>
        </div>
      </div>

      {/* Configuration Form Card */}
      <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6">
        {/* Business Date Picker */}
        <div>
          <label className="block text-xs font-bold text-[#1b2a3e] uppercase tracking-wider mb-2">
            Business Date (T)
          </label>
          <div className="relative">
            <Calendar className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#119db0]" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-[#e2e8f0] bg-white text-[#1b2a3e] font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[#119db0] focus:border-transparent transition"
              required
            />
          </div>
          <p className="text-[11px] text-[#475569] mt-1.5">
            Default target date: <span className="font-semibold text-[#1b2a3e]">2026-07-28</span>
          </p>
        </div>

        {/* Settlement Cycle Dropdown */}
        <div>
          <label className="block text-xs font-bold text-[#1b2a3e] uppercase tracking-wider mb-2">
            Settlement Cycle Window
          </label>
          <div className="relative">
            <Clock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#119db0]" />
            <select
              value={cycle}
              onChange={(e) => setCycle(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-[#e2e8f0] bg-white text-[#1b2a3e] font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[#119db0] focus:border-transparent transition appearance-none cursor-pointer"
            >
              {cycleOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label} — ({opt.scope})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Buttons */}
        <div className="pt-4 flex items-center justify-between border-t border-[#e2e8f0]">
          <button
            type="button"
            onClick={onBackToSubProducts}
            className="px-5 py-3 rounded-xl border border-[#e2e8f0] hover:bg-[#f0f4f8] text-[#1b2a3e] font-semibold text-sm transition cursor-pointer"
          >
            ← Previous
          </button>

          <button
            type="submit"
            className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#119db0] to-[#0e8696] hover:from-[#0e8696] hover:to-[#1b2a3e] text-white font-semibold text-sm transition-all shadow-md shadow-[#119db0]/25 flex items-center gap-2 cursor-pointer"
          >
            <span>Next: Collect Source Files</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
