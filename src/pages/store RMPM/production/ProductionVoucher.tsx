/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { useNavigate } from 'react-router';
import { SavedProductionList } from './components/SavedProductionList';

const ProductionVoucher: React.FC = () => {
  const navigate = useNavigate();

  const handleNextStep = (production: any) => {
    navigate('/dashboard/production-step-2', {
      state: { production },
    });
  };

  const handleNewProduction = () => {
    navigate('/dashboard/store_rmpm_production');
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm space-y-4">
      <div className="border-b border-gray-100 pb-3">
        <h2 className="text-xl font-bold text-gray-800 m-0">Production Voucher</h2>
        <span className="text-xs text-gray-500">
          List of saved productions. Click &quot;Next Step&quot; to open the production creation form with Step 2 enabled.
        </span>
      </div>

      <SavedProductionList
        onNextStep={handleNextStep}
        onNewProduction={handleNewProduction}
      />
    </div>
  );
};

export default ProductionVoucher;
