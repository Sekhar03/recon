import React, { useState } from 'react';
import {
  Fingerprint,
  CreditCard,
  Send,
  Receipt,
  Zap,
  QrCode,
  ArrowRightLeft,
  Building2,
  Wallet,
  Smartphone,
  CircleDollarSign,
  Percent,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { CATEGORIES, BUSINESS_VERTICALS } from '../../data/categoriesAndSubProducts';
import { Category, BusinessVerticalId } from '../../types';

interface Page1CategoryProps {
  onSelectCategory: (category: Category) => void;
  selectedCategory?: Category | null;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Fingerprint: <Fingerprint className="w-7 h-7" />,
  CreditCard: <CreditCard className="w-7 h-7" />,
  Send: <Send className="w-7 h-7" />,
  Receipt: <Receipt className="w-7 h-7" />,
  Zap: <Zap className="w-7 h-7" />,
  QrCode: <QrCode className="w-7 h-7" />,
  ArrowRightLeft: <ArrowRightLeft className="w-7 h-7" />,
  Building2: <Building2 className="w-7 h-7" />,
  Wallet: <Wallet className="w-7 h-7" />,
  Smartphone: <Smartphone className="w-7 h-7" />,
  CircleDollarSign: <CircleDollarSign className="w-7 h-7" />,
  Percent: <Percent className="w-7 h-7" />
};

export const Page1Category: React.FC<Page1CategoryProps> = ({
  onSelectCategory,
  selectedCategory
}) => {
  // Only default to vertical view if the vertical has multiple categories
  const [selectedVerticalId, setSelectedVerticalId] = useState<BusinessVerticalId | null>(() => {
    if (!selectedCategory) return null;
    const count = CATEGORIES.filter((c) => c.verticalId === selectedCategory.verticalId).length;
    return count > 1 ? selectedCategory.verticalId : null;
  });

  const selectedVertical = BUSINESS_VERTICALS.find((v) => v.id === selectedVerticalId);
  const productsForVertical = selectedVertical
    ? CATEGORIES.filter((c) => c.verticalId === selectedVertical.id)
    : [];

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------------- */}
      {/* VIEW 1: MAIN BUSINESS VERTICAL OPTIONS                              */}
      {/* ------------------------------------------------------------------- */}
      {!selectedVerticalId ? (
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white border border-[#e2e8f0] rounded-[20px] p-6 shadow-xs">
            <h2 className="text-xl font-bold text-[#1b2a3e]">
              Select Division
            </h2>
          </div>

          {/* Main Vertical Cards - Pure Heading & Icon */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {BUSINESS_VERTICALS.map((vert) => {
              const icon = ICON_MAP[vert.iconName] || <Building2 className="w-8 h-8" />;

              return (
                <div
                  key={vert.id}
                  onClick={() => {
                    const vertCategories = CATEGORIES.filter((c) => c.verticalId === vert.id);
                    if (vertCategories.length === 1) {
                      onSelectCategory(vertCategories[0]);
                    } else {
                      setSelectedVerticalId(vert.id);
                    }
                  }}
                  className="bg-white border border-[#e2e8f0] hover:border-[#119db0] hover:shadow-lg rounded-[24px] p-8 cursor-pointer transition-all flex flex-col items-center justify-center text-center gap-5 group min-h-[200px]"
                >
                  <div className="w-16 h-16 rounded-2xl bg-[#119db0]/10 text-[#119db0] flex items-center justify-center group-hover:bg-[#119db0] group-hover:text-white transition-colors">
                    {icon}
                  </div>
                  <h3 className="text-xl font-bold text-[#1b2a3e] group-hover:text-[#119db0] transition-colors">
                    {vert.name}
                  </h3>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ------------------------------------------------------------------- */
        /* VIEW 2: PRODUCTS UNDER SELECTED BUSINESS VERTICAL                   */
        /* ------------------------------------------------------------------- */
        <div className="space-y-6">
          {/* Header with Prominent Back Button */}
          <div className="bg-white border border-[#e2e8f0] rounded-[20px] p-6 shadow-xs flex items-center justify-between gap-4">
            <button
              onClick={() => setSelectedVerticalId(null)}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#1b2a3e] hover:bg-[#119db0] text-white text-xs font-bold transition-all shadow-md hover:shadow-lg shadow-[#1b2a3e]/15 group cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Business Verticals</span>
            </button>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-[#119db0] bg-[#119db0]/10 border border-[#119db0]/20 px-3.5 py-1.5 rounded-full hidden sm:inline-block">
                Business Vertical
              </span>
              <h2 className="text-xl font-bold text-[#1b2a3e]">
                {selectedVertical?.name}
              </h2>
            </div>
          </div>

          {/* Grid of Product Categories in this Vertical */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {productsForVertical.map((category) => {
              const isSelected = selectedCategory?.id === category.id;
              const icon = ICON_MAP[category.iconName] || <Fingerprint className="w-6 h-6" />;

              return (
                <div
                  key={category.id}
                  onClick={() => onSelectCategory(category)}
                  className={`glass-card glass-card-hover p-5 cursor-pointer flex items-center justify-between transition-all group ${
                    isSelected
                      ? 'ring-2 ring-[#119db0] bg-[#119db0]/5 border-[#119db0]'
                      : 'hover:border-[#119db0]/40'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-[#119db0] text-white shadow-md shadow-[#119db0]/30'
                          : 'bg-[#f0f4f8] text-[#119db0] group-hover:bg-[#119db0] group-hover:text-white'
                      }`}
                    >
                      {icon}
                    </div>
                    <h4 className="font-bold text-base text-[#1b2a3e] group-hover:text-[#119db0] transition-colors">
                      {category.name}
                    </h4>
                  </div>

                  <div className="w-8 h-8 rounded-full bg-[#f0f4f8] group-hover:bg-[#119db0] group-hover:text-white flex items-center justify-center text-[#475569] transition-all shrink-0">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};



