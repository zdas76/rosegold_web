/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Form, InputNumber } from 'antd';

interface FinalizationSummaryProps {
  handleInputFocus: (e: any) => void;
  unitCost: number;
  grandTotal: number;
  rawMaterialUnitCost: number;
  totalExpenseTk: number;
  expenseStageUnitCost: number;
  totalPackingTk: number;
  packingStageUnitCost: number;
  totalProductionCost: number;
  disabled?: boolean;
  disabledText?: string;
}

const FinalizationSummary: React.FC<FinalizationSummaryProps> = ({
  handleInputFocus,
  unitCost,
  grandTotal,
  rawMaterialUnitCost,
  totalExpenseTk,
  expenseStageUnitCost,
  totalPackingTk,
  packingStageUnitCost,
  totalProductionCost,
  disabled = false,
  disabledText,
}) => {
  return (
    <div className={`bg-white p-5 rounded-xl border border-slate-200/80 shadow-[0_2px_12px_-3px_rgba(15,23,42,0.04)] mt-4 ${disabled ? 'opacity-70' : ''}`}>
      <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
        <h3 className="font-bold text-sm text-slate-800 m-0 tracking-tight">Finalization & Yield Summary</h3>
        {disabled && (
          <span className="text-xs font-semibold px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded-full border border-amber-200">
            {disabledText || 'Disabled'}
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Form.Item
          name="productQuantity"
          label={<span className="font-semibold text-gray-700 text-sm">Finished Product Quantity</span>}
          rules={[{ required: true, message: 'Please enter finished quantity' }]}
        >
          <InputNumber
            min={0.01}
            step={1}
            precision={2}
            disabled={disabled}
            controls={false}
            placeholder={disabled ? (disabledText || "Disabled") : "Enter final produced quantity"}
            style={{ width: '100%' }}
            onFocus={handleInputFocus}
            size="large"
            className="rounded-lg shadow-sm"
          />
        </Form.Item>

        <Form.Item label={<span className="font-semibold text-gray-700 text-sm">Calculated Unit Cost (BDT)</span>}>
          <InputNumber
            value={unitCost}
            disabled
            precision={3}
            controls={false}
            style={{ width: '100%' }}
            size="large"
            className="rounded-lg bg-white font-bold text-gray-800 shadow-sm opacity-100"
          />
        </Form.Item>
      </div>

      {/* Breakdown summary */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
          <span className="text-xs text-gray-400 block uppercase font-semibold mb-1">Raw Materials</span>
          <span className="font-bold text-gray-800 text-lg">{grandTotal.toFixed(2)} ৳</span>
          <span className="text-[11px] text-blue-500 block mt-1 font-medium bg-blue-50 py-0.5 rounded-full w-max mx-auto px-2">Per Unit: {rawMaterialUnitCost.toFixed(3)} ৳</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
          <span className="text-xs text-gray-400 block uppercase font-semibold mb-1">Expenses</span>
          <span className="font-bold text-gray-800 text-lg">{totalExpenseTk.toFixed(2)} ৳</span>
          <span className="text-[11px] text-blue-500 block mt-1 font-medium bg-blue-50 py-0.5 rounded-full w-max mx-auto px-2">Cum. Unit: {expenseStageUnitCost.toFixed(3)} ৳</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
          <span className="text-xs text-gray-400 block uppercase font-semibold mb-1">Packaging</span>
          <span className="font-bold text-gray-800 text-lg">{totalPackingTk.toFixed(2)} ৳</span>
          <span className="text-[11px] text-blue-500 block mt-1 font-medium bg-blue-50 py-0.5 rounded-full w-max mx-auto px-2">Cum. Unit: {packingStageUnitCost.toFixed(3)} ৳</span>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-200/50 shadow-sm text-center">
          <span className="text-xs text-amber-700/70 block uppercase font-bold mb-1">Grand Total</span>
          <span className="font-extrabold text-amber-600 text-xl">{totalProductionCost.toFixed(2)} ৳</span>
          <span className="text-[11px] text-amber-700 block mt-1 font-bold bg-amber-100/50 py-0.5 rounded-full w-max mx-auto px-2">Final Unit: {unitCost.toFixed(3)} ৳</span>
        </div>
      </div>
      <div className="mt-4 py-3 px-5 bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl shadow-sm flex justify-between items-center text-white">
        <span className="font-bold text-xs uppercase tracking-wider text-slate-200">Final Per Unit Cost (All Costs Included)</span>
        <span className="text-xl font-black drop-shadow-sm">
          {unitCost.toFixed(3)} ৳
        </span>
      </div>
    </div>

  );
};

export default FinalizationSummary;
