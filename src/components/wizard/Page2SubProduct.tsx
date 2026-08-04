import React from 'react';
import { ArrowLeft, ChevronRight, Layers, FileSpreadsheet } from 'lucide-react';
import { Category, SubProduct } from '../../types';
import { SUB_PRODUCTS } from '../../data/categoriesAndSubProducts';

interface Page2SubProductProps {
  category: Category;
  onSelectSubProduct: (subProduct: SubProduct) => void;
  onBackToCategory: () => void;
  selectedSubProduct?: SubProduct | null;
}

export const Page2SubProduct: React.FC<Page2SubProductProps> = ({
  category,
  onSelectSubProduct,
  onBackToCategory,
  selectedSubProduct
}) => {
  // Filter sub products for this category
  const filteredSubProducts = SUB_PRODUCTS.filter(sp => sp.categoryId === category?.id);

  return (
    <div className="space-y-6">
      {/* Header Info with Prominent Upper Back Button */}
      <div className="bg-white border border-[#e2e8f0] rounded-[20px] p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-[#e2e8f0]">
          <button
            onClick={onBackToCategory}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#1b2a3e] hover:bg-[#119db0] text-white text-xs font-bold transition-all shadow-md hover:shadow-lg shadow-[#1b2a3e]/15 group cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Category Selection</span>
          </button>

          <span className="text-xs font-bold text-[#119db0] bg-[#119db0]/10 border border-[#119db0]/20 px-3.5 py-1.5 rounded-full self-start sm:self-auto">
            Category: {category.name}
          </span>
        </div>

        <div>
          <h2 className="text-xl font-bold text-[#1b2a3e]">
            Select Sub-Product
          </h2>
          <p className="text-xs text-[#475569] font-medium mt-0.5">
            Select the sub-product for reconciliation under {category.name}.
          </p>
        </div>
      </div>

      {/* Grid of Sub-Product Box Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {filteredSubProducts.map((sp) => {
          const isSelected = selectedSubProduct?.id === sp.id;

          return (
            <div
              key={sp.id}
              onClick={() => onSelectSubProduct(sp)}
              className={`glass-card glass-card-hover p-5 cursor-pointer transition-all flex flex-col justify-between group ${
                isSelected
                  ? 'ring-2 ring-[#119db0] bg-[#119db0]/5 border-[#119db0]'
                  : 'hover:border-[#119db0]/40'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-[#f0f4f8] text-[#119db0] group-hover:bg-[#119db0] group-hover:text-white flex items-center justify-center transition-colors">
                    <Layers className="w-6 h-6" />
                  </div>

                  <div className="w-7 h-7 rounded-full bg-[#f0f4f8] group-hover:bg-[#119db0] group-hover:text-white flex items-center justify-center text-[#475569] transition-all">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>

                <h3 className="font-bold text-base text-[#1b2a3e] group-hover:text-[#119db0] transition-colors">
                  {sp.name}
                </h3>

                {sp.description && (
                  <p className="text-xs text-[#475569] font-medium mt-2 leading-relaxed">
                    {sp.description}
                  </p>
                )}

                {sp.highlights && sp.highlights.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[#e2e8f0] space-y-1">
                    {sp.highlights.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-[11px] text-[#475569]">
                        <span className="text-[#10b981] font-bold">✓</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
