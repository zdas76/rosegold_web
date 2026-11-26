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
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_4px_24px_-2px_rgba(15,23,42,0.06),0_1px_3px_0_rgba(15,23,42,0.04)] p-6 space-y-1">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="text-lg font-bold text-slate-800 m-0 tracking-tight">Production Voucher</h1>
      </div>

      <SavedProductionList
        onNextStep={handleNextStep}
        onNewProduction={handleNewProduction}
      />
    </div>
  );
};

export default ProductionVoucher;
