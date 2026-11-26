/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import dayjs from 'dayjs';
import { numberToWords } from '../../utils/numberToWords';

export interface TProductionInventoryItem {
  id: number;
  productId: number | null;
  rawId: number | null;
  packingMaterialId?: number | null;
  product: {
    name: string;
  } | null;
  raWMaterial: {
    name: string;
  } | null;
  packingMaterial?: {
    name: string;
  } | null;
  date: string;
  quantityAdd: number | string;
  quantityLess: number | string;
  debitAmount: number | string;
  creditAmount: number | string;
}

export interface TProductionVoucherData {
  id: number;
  voucherNo: string;
  invoiceNo: string | null;
  status: string;
  date: string;
  partyId: number | null;
  voucherType: string;
  createdAt: string;
  updatedAt: string;
  party: any;
  customer?: any;
  bankTransaction?: any[];
  journal?: any[];
  inventory?: TProductionInventoryItem[];
  pMInventory?: any[];
}

const ProductionVoucherTable: React.FC<{ data: TProductionVoucherData }> = ({ data }) => {
  const inventory = data?.inventory || [];
  const journalEntries = data?.journal || [];
  const pmInventory = data?.pMInventory || [];

  // Separate Finished Goods (Products) and Consumed Raw Materials
  const producedProducts = inventory.filter(
    (item) => item.productId !== null || item.product !== null
  );

  const rawMaterials = inventory.filter(
    (item) => item.rawId !== null || item.raWMaterial !== null
  );

  // Other items if any
  const otherInventory = inventory.filter(
    (item) =>
      item.productId === null &&
      item.product === null &&
      item.rawId === null &&
      item.raWMaterial === null
  );

  // Totals calculation
  const totalRawQty = rawMaterials.reduce(
    (acc, item) => acc + Number(item.quantityLess || item.quantityAdd || 0),
    0
  );
  const totalRawCost = rawMaterials.reduce(
    (acc, item) => acc + Number(item.creditAmount || 0),
    0
  );

  const totalPMQty = pmInventory.reduce(
    (acc, item) => acc + Number(item.quantityLess || item.quantityAdd || 0),
    0
  );
  const totalPMCost = pmInventory.reduce(
    (acc, item) => acc + Number(item.creditAmount || item.debitAmount || 0),
    0
  );

  const totalExpenseCost = journalEntries.reduce(
    (acc, item) => acc + Number(item.debitAmount || item.creditAmount || 0),
    0
  );

  // Net Material & Production Cost
  const grandTotalCost = totalRawCost + totalPMCost + totalExpenseCost;

  // Produced Product Summary
  const primaryProduct = producedProducts.length > 0 ? producedProducts[0] : null;
  const producedQty = producedProducts.reduce(
    (acc, item) => acc + Number(item.quantityAdd || 0),
    0
  );
  const productDebitValuation = producedProducts.reduce(
    (acc, item) => acc + Number(item.debitAmount || 0),
    0
  );

  return (
    <div className="w-full font-sans">
      {/* Title */}
      <div className="text-center mb-3">
        <h2 className="text-lg mt-1 font-bold uppercase tracking-widest border-b-2 border-black inline-block px-5 pb-1">
          Production Voucher
        </h2>
      </div>

      {/* Voucher Meta Banner */}
      <div className="flex flex-wrap justify-between items-center mb-3 p-3 bg-gray-50 rounded border border-gray-200 text-sm print:bg-transparent print:border-dotted">
        <div className="space-y-1">
          <div className="flex gap-2">
            <span className="font-bold min-w-[110px] text-gray-700">Voucher No:</span>
            <span className="font-mono font-bold text-gray-900">{data?.voucherNo}</span>
          </div>
          <div className="flex gap-2 text-xs text-gray-600">
            <span className="font-bold min-w-[110px]">Date & Time:</span>
            <span>
              {data?.date ? dayjs(data.date).format('DD-MMM-YYYY, hh:mm A') : 'N/A'}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 mt-1 sm:mt-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs text-gray-600">Type:</span>
            <span className="bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded text-xs font-bold uppercase print:bg-transparent print:p-0">
              {data?.voucherType || 'PRODUCTION'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs text-gray-600">Status:</span>
            <span
              className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${data?.status === 'CONFIRMED'
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
                } print:bg-transparent print:p-0`}
            >
              {data?.status || 'CONFIRMED'}
            </span>
          </div>
        </div>
      </div>

      {/* Target Finished Goods Card */}
      {producedProducts.length > 0 && (
        <div className="mb-4 bg-amber-50/70 border border-amber-200 rounded p-3 text-sm print:border-slate-300">
          <div className="flex justify-between items-center font-bold text-amber-900 border-b border-amber-200/80 pb-1.5 mb-2">
            <span className="uppercase tracking-wide text-xs">
              Finished Product Target (উৎপাদিত / লক্ষ্য পণ্য)
            </span>
            <span className="text-xs font-semibold">
              Batch: {primaryProduct?.product?.name || `Product #${primaryProduct?.productId}`}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            <div>
              <span className="text-gray-600">Product Name: </span>
              <span className="font-bold text-gray-900">
                {primaryProduct?.product?.name || `Product #${primaryProduct?.productId}`}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Produced Quantity: </span>
              <span className="font-mono font-bold text-gray-900">
                {producedQty > 0 ? producedQty.toLocaleString() : 'In Process'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Output Valuation: </span>
              <span className="font-mono font-bold text-gray-900">
                {productDebitValuation > 0
                  ? `৳ ${productDebitValuation.toLocaleString()}`
                  : `Batch Cost (৳ ${grandTotalCost.toLocaleString()})`}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Consumed Raw Materials Table */}
      <div className="mb-4">
        <div className="font-bold text-sm text-gray-800 mb-1 flex items-center justify-between">
          <span className="uppercase text-xs tracking-wider">
            1. Raw Materials Consumed
          </span>
          <span className="text-xs text-gray-500 font-normal">
            Total Items: {rawMaterials.length}
          </span>
        </div>

        <table className="w-full border-collapse border border-slate-300 text-sm">
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-slate-300 text-center py-2 px-3 w-12 font-semibold">
                No.
              </th>
              <th className="border border-slate-300 text-left py-2 px-4 font-semibold">
                Raw Material Name (কাঁচামাল)
              </th>
              <th className="border border-slate-300 text-right py-2 px-4 w-28 font-semibold">
                Consumed Qty
              </th>
              <th className="border border-slate-300 text-right py-2 px-4 w-32 font-semibold">
                Unit Cost (TK)
              </th>
              <th className="border border-slate-300 text-right py-2 px-4 w-36 font-semibold">
                Total Cost (TK)
              </th>
            </tr>
          </thead>
          <tbody>
            {rawMaterials.length === 0 ? (
              <tr>
                <td colSpan={5} className="border border-slate-300 text-center py-4 text-gray-400 italic">
                  No raw materials recorded in this voucher.
                </td>
              </tr>
            ) : (
              rawMaterials.map((item, idx) => {
                const qty = Number(item.quantityLess || item.quantityAdd || 0);
                const cost = Number(item.creditAmount || item.debitAmount || 0);
                const unitPrice = qty > 0 ? cost / qty : 0;

                return (
                  <tr key={item.id || idx} className="hover:bg-slate-50">
                    <td className="border border-slate-300 text-center py-2 px-3 text-gray-600">
                      {idx + 1}
                    </td>
                    <td className="border border-slate-300 text-left py-2 px-4 font-medium text-gray-800">
                      {item.raWMaterial?.name || `Raw Material #${item.rawId}`}
                    </td>
                    <td className="border border-slate-300 text-right py-2 px-4 font-mono font-medium">
                      {qty.toLocaleString()}
                    </td>
                    <td className="border border-slate-300 text-right py-2 px-4 font-mono text-gray-700">
                      {unitPrice.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="border border-slate-300 text-right py-2 px-4 font-mono font-semibold text-gray-900">
                      {cost.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                );
              })
            )}

            {/* Subtotal Row */}
            <tr className="bg-slate-50 font-bold border-t-2 border-slate-300">
              <td colSpan={2} className="border border-slate-300 text-right py-2 px-4">
                Subtotal (Raw Materials):
              </td>
              <td className="border border-slate-300 text-right py-2 px-4 font-mono">
                {totalRawQty.toLocaleString()}
              </td>
              <td className="border border-slate-300 text-right py-2 px-4"></td>
              <td className="border border-slate-300 text-right py-2 px-4 font-mono text-emerald-800">
                ৳{' '}
                {totalRawCost.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Packing Materials Section (if any) */}
      {pmInventory.length > 0 && (
        <div className="mb-4">
          <div className="font-bold text-sm text-gray-800 mb-1 uppercase text-xs tracking-wider">
            2. Packing Materials Consumed (ব্যবহৃত প্যাকিং উপাদান)
          </div>
          <table className="w-full border-collapse border border-slate-300 text-sm">
            <thead>
              <tr className="bg-slate-100">
                <th className="border border-slate-300 text-center py-2 px-3 w-12 font-semibold">No.</th>
                <th className="border border-slate-300 text-left py-2 px-4 font-semibold">Packing Material</th>
                <th className="border border-slate-300 text-right py-2 px-4 w-28 font-semibold">Qty</th>
                <th className="border border-slate-300 text-right py-2 px-4 w-32 font-semibold">Unit Rate</th>
                <th className="border border-slate-300 text-right py-2 px-4 w-36 font-semibold">Amount (TK)</th>
              </tr>
            </thead>
            <tbody>
              {pmInventory.map((item: any, idx: number) => {
                const qty = Number(item.quantityLess || item.quantityAdd || 0);
                const cost = Number(item.creditAmount || item.debitAmount || 0);
                const unitPrice = qty > 0 ? cost / qty : 0;
                return (
                  <tr key={idx}>
                    <td className="border border-slate-300 text-center py-2 px-3">{idx + 1}</td>
                    <td className="border border-slate-300 text-left py-2 px-4 font-medium">
                      {item.packingMaterial?.name || `PM #${item.packingMaterialId}`}
                    </td>
                    <td className="border border-slate-300 text-right py-2 px-4 font-mono">{qty.toLocaleString()}</td>
                    <td className="border border-slate-300 text-right py-2 px-4 font-mono">
                      {unitPrice.toFixed(2)}
                    </td>
                    <td className="border border-slate-300 text-right py-2 px-4 font-mono font-semibold">
                      {cost.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-slate-50 font-bold">
                <td colSpan={2} className="border border-slate-300 text-right py-2 px-4">
                  Subtotal (Packing Materials):
                </td>
                <td className="border border-slate-300 text-right py-2 px-4 font-mono">{totalPMQty.toLocaleString()}</td>
                <td className="border border-slate-300 text-right py-2 px-4"></td>
                <td className="border border-slate-300 text-right py-2 px-4 font-mono text-emerald-800">
                  ৳ {totalPMCost.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Production Overhead / Journal Entries (if any) */}
      {journalEntries.length > 0 && (
        <div className="mb-4">
          <div className="font-bold text-sm text-gray-800 mb-1 uppercase text-xs tracking-wider">
            3. Direct Expenses / Overhead (উৎপাদন খরচ)
          </div>
          <table className="w-full border-collapse border border-slate-300 text-sm">
            <thead>
              <tr className="bg-slate-100">
                <th className="border border-slate-300 text-center py-2 px-3 w-12 font-semibold">No.</th>
                <th className="border border-slate-300 text-left py-2 px-4 font-semibold">Expense Head</th>
                <th className="border border-slate-300 text-left py-2 px-4 font-semibold">Narration</th>
                <th className="border border-slate-300 text-right py-2 px-4 w-36 font-semibold">Amount (TK)</th>
              </tr>
            </thead>
            <tbody>
              {journalEntries.map((item: any, idx: number) => (
                <tr key={idx}>
                  <td className="border border-slate-300 text-center py-2 px-3">{idx + 1}</td>
                  <td className="border border-slate-300 text-left py-2 px-4 font-medium">
                    {item.accountsItem?.accountsItemName || 'Expense'}
                  </td>
                  <td className="border border-slate-300 text-left py-2 px-4 text-xs text-gray-500 italic">
                    {item.narration || '—'}
                  </td>
                  <td className="border border-slate-300 text-right py-2 px-4 font-mono font-semibold">
                    {Number(item.debitAmount || item.creditAmount || 0).toFixed(2)}
                  </td>
                </tr>
              ))}
              <tr className="bg-slate-50 font-bold">
                <td colSpan={3} className="border border-slate-300 text-right py-2 px-4">
                  Subtotal (Expenses):
                </td>
                <td className="border border-slate-300 text-right py-2 px-4 font-mono text-emerald-800">
                  ৳ {totalExpenseCost.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Grand Total Summary Box */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-3 p-3 bg-slate-50 rounded border border-slate-300 gap-3">
        <div className="text-sm">
          <span className="font-bold underline text-gray-800">Amount in Words:</span>
          <span className="ml-2 font-semibold italic text-gray-900">
            {numberToWords(grandTotalCost || productDebitValuation || 0)}
          </span>
        </div>

        <div className="border bg-white px-5 py-2.5 rounded border-slate-300 w-full sm:w-auto min-w-[280px] flex justify-between items-center shadow-xs">
          <span className="font-bold text-gray-700">Total Material Cost:</span>
          <span className="font-mono text-lg font-bold text-amber-900">
            ৳{' '}
            {grandTotalCost.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
      </div>

      {/* Signature Section */}
      <div className="flex justify-between px-4" style={{ marginTop: '90px' }}>
        <div className="text-center border-t border-black pt-1.5 w-32">
          <p className="text-[11px] font-bold uppercase tracking-tight text-gray-800">Store Keeper (RMPM)</p>
        </div>
        <div className="text-center border-t border-black pt-1.5 w-32">
          <p className="text-[11px] font-bold uppercase tracking-tight text-gray-800">Production In-Charge</p>
        </div>
        <div className="text-center border-t border-black pt-1.5 w-32">
          <p className="text-[11px] font-bold uppercase tracking-tight text-gray-800">Accountant</p>
        </div>
        <div className="text-center border-t border-black pt-1.5 w-32">
          <p className="text-[11px] font-bold uppercase tracking-tight text-gray-800">Authorized By</p>
        </div>
      </div>

      {/* Footer Info for Print */}
      <div className="mt-8 border-t border-gray-100 pt-3 text-[10px] text-gray-400 text-center italic print:block no-screen">
        Printed on {new Date().toLocaleString()} - Golden Mart Industries
      </div>
    </div>
  );
};

export default ProductionVoucherTable;
