/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { useNavigate } from 'react-router';
import { SavedProductionList } from './components/SavedProductionList';

const ProductionVoucher: React.FC = () => {
  const navigate = useNavigate();

  const handleNextStep = (production: any) => {
    navigate('/dashboard/production-step-two', {
      state: { production },
    });
  };

  const handleNewProduction = () => {
    navigate('/dashboard/store_rmpm_production');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_4px_24px_-2px_rgba(15,23,42,0.06),0_1px_3px_0_rgba(15,23,42,0.04)] p-6 space-y-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-1 border-b border-slate-100">
        <div>
          <h1 className="text-lg font-bold text-slate-800 m-0 tracking-tight">Production Voucher</h1>
          <p className="text-xs text-slate-400 m-0 mt-0.5">
            List of saved productions. Click &quot;Next Step&quot; to open the production creation form with Step 2 enabled.
          </p>
        </div>
      </div>

      <SavedProductionList
        onNextStep={handleNextStep}
        onNewProduction={handleNewProduction}
      />
    </div>
  );
};

export default ProductionVoucher;
