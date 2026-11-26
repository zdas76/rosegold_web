/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import dayjs from 'dayjs';
import { numberToWords } from '../../utils/numberToWords';

export interface TPurchaseVoucherData {
  id: number;
  voucherNo: string;
  invoiceNo: string | null;
  status?: string;
  date: string;
  partyId?: number | null;
  voucherType: string;
  createdAt?: string;
  updatedAt?: string;
  party?: {
    name?: string;
    contactNo?: string;
    address?: string;
    partyType?: string;
  } | null;
  customer?: any;
  bankTransaction?: any[];
  journal?: Array<{
    accountsItemId: number;
    date?: string;
    creditAmount: number | string;
    debitAmount: number | string;
    narration?: string;
    accountsItem?: {
      accountsItemName: string;
    };
  }>;
  inventory?: Array<{
    id?: number;
    productId?: number | null;
    rawId?: number | null;
    packingMaterialId?: number | null;
    product?: { name: string } | null;
    raWMaterial?: { name: string } | null;
    packingMaterial?: { name: string } | null;
    quantityAdd?: number | string;
    quantityLess?: number | string;
    unitPrice?: number | string;
    debitAmount?: number | string;
    creditAmount?: number | string;
  }>;
  pMInventory?: Array<any>;
}

const PurchaseVoucherTable: React.FC<{ data: TPurchaseVoucherData }> = ({ data }) => {
  const inventory = Array.isArray(data?.inventory) ? data.inventory : [];
  const pmInventory = Array.isArray(data?.pMInventory) ? data.pMInventory : [];
  const journalEntries = Array.isArray(data?.journal) ? data.journal : [];

  // Inventory items with calculations
  let runningBalance = 0;
  const inventoryWithBalance = inventory.map((item: any) => {
    const debit = Number(item.debitAmount || 0);
    const credit = Number(item.creditAmount || 0);
    runningBalance += debit - credit;
    const qty = Number(item.quantityAdd || item.quantityLess || 0);
    const unitPrice =
      qty > 0 ? debit / qty : Number(item.unitPrice || 0);

    return {
      ...item,
      debit,
      credit,
      qty,
      unitPrice,
      balance: runningBalance,
    };
  });

  // Calculate totals
  const totalInventoryQty = inventoryWithBalance.reduce(
    (acc, item) => acc + item.qty,
    0
  );
  const totalInventoryDebit = inventoryWithBalance.reduce(
    (acc, item) => acc + item.debit,
    0
  );

  const totalPMDebit = pmInventory.reduce(
    (acc, item) => acc + Number(item.debitAmount || 0),
    0
  );
  const totalPMQty = pmInventory.reduce(
    (acc, item) => acc + Number(item.quantityAdd || item.quantityLess || 0),
    0
  );

  const totalJournalDebit = journalEntries.reduce(
    (acc, item) => acc + Number(item.debitAmount || 0),
    0
  );
  const totalJournalCredit = journalEntries.reduce(
    (acc, item) => acc + Number(item.creditAmount || 0),
    0
  );

  // Grand total amount:
  // If itemized inventory is present, use inventory total.
  // If itemized inventory is empty but journal entries exist, use journal debit (or credit).
  const grandTotal =
    totalInventoryDebit > 0
      ? totalInventoryDebit + totalPMDebit
      : totalPMDebit > 0
        ? totalPMDebit
        : totalJournalDebit > 0
          ? totalJournalDebit
          : totalJournalCredit;

  return (
    <div className="w-full font-sans">
      {/* Title */}
      <div className="text-center mb-3">
        <h2 className="text-lg mt-1 font-bold uppercase tracking-widest border-b-2 border-black inline-block px-5 pb-1">
          Purchase Voucher
        </h2>
      </div>

      {/* Voucher Meta Banner */}
      <div className="flex flex-wrap justify-between items-center mb-3 p-3 bg-gray-50 rounded border border-gray-200 text-sm print:bg-transparent print:border-dotted gap-2">
        <div className="space-y-1">
          <div className="flex gap-2 text-sm">
            <span className="font-bold min-w-[100px] text-gray-700">Voucher No:</span>
            <span className="font-mono font-bold text-gray-900">{data?.voucherNo}</span>
          </div>
          <div className="flex gap-2 text-sm">
            <span className="font-bold min-w-[100px] text-gray-700">Invoice / Ref:</span>
            <span className="font-mono font-semibold text-gray-800">{data?.invoiceNo || 'N/A'}</span>
          </div>
          {data?.party?.name && (
            <div className="flex gap-2 text-xs text-gray-600">
              <span className="font-bold min-w-[100px]">Supplier:</span>
              <span className="font-medium text-gray-900">
                {data.party.name}{' '}
                {data.party.contactNo ? `(${data.party.contactNo})` : ''}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs text-gray-600">Voucher Type:</span>
            <span className="bg-blue-100 px-2.5 py-0.5 rounded text-blue-800 text-xs font-bold uppercase print:bg-transparent print:p-0">
              {data?.voucherType || 'PURCHASE'}
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
          <div className="text-[11px] text-gray-500">
            {data?.date ? dayjs(data.date).format('DD-MMM-YYYY, hh:mm A') : ''}
          </div>
        </div>
      </div>

      {/* 1. Itemized Inventory Table (if inventory items exist) */}
      {inventoryWithBalance.length > 0 && (
        <div className="mb-4">
          <div className="font-bold text-sm text-gray-800 mb-1 flex items-center justify-between">
            <span className="uppercase text-xs tracking-wider">
              1. Purchased Materials / Items
            </span>
            <span className="text-xs text-gray-500 font-normal">
              Total Items: {inventoryWithBalance.length}
            </span>
          </div>

          <table className="w-full border-collapse border border-slate-300 text-sm">
            <thead>
              <tr className="bg-slate-100">
                <th className="border border-slate-300 text-center py-2 px-3 w-12 font-semibold">
                  No.
                </th>
                <th className="border border-slate-300 text-left py-2 px-4 font-semibold">
                  Description
                </th>
                <th className="border border-slate-300 text-right py-2 px-4 w-24 font-semibold">
                  Quantity
                </th>
                <th className="border border-slate-300 text-right py-2 px-4 w-28 font-semibold">
                  Unit Price
                </th>
                <th className="border border-slate-300 text-right py-2 px-4 w-32 font-semibold">
                  TK (Debit)
                </th>
                <th className="border border-slate-300 text-right py-2 px-4 w-32 font-semibold">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {inventoryWithBalance.map((item: any, idx: number) => (
                <tr key={item.id || idx} className="hover:bg-slate-50">
                  <td className="border border-slate-300 text-center py-2 px-3 text-gray-600">
                    {idx + 1}
                  </td>
                  <td className="border border-slate-300 text-left py-2 px-4 font-medium text-gray-800">
                    {item?.product?.name ||
                      item?.raWMaterial?.name ||
                      item?.packingMaterial?.name ||
                      'Item'}
                  </td>
                  <td className="border border-slate-300 text-right py-2 px-4 font-mono">
                    {item.qty.toLocaleString()}
                  </td>
                  <td className="border border-slate-300 text-right py-2 px-4 font-mono text-gray-700">
                    {item.unitPrice.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="border border-slate-300 text-right py-2 px-4 font-mono font-semibold text-gray-900">
                    {item.debit.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="border border-slate-300 text-right py-2 px-4 font-mono text-gray-700">
                    {item.balance.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              ))}
              <tr className="bg-slate-50 font-bold border-t-2 border-slate-300">
                <td colSpan={2} className="border border-slate-300 text-right py-2 px-4">
                  Subtotal (Inventory):
                </td>
                <td className="border border-slate-300 text-right py-2 px-4 font-mono">
                  {totalInventoryQty.toLocaleString()}
                </td>
                <td className="border border-slate-300 text-right py-2 px-4"></td>
                <td className="border border-slate-300 text-right py-2 px-4 font-mono text-emerald-800">
                  ৳{' '}
                  {totalInventoryDebit.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
                <td className="border border-slate-300 text-right py-2 px-4"></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* 2. Packing Materials Table (if pMInventory items exist) */}
      {pmInventory.length > 0 && (
        <div className="mb-4">
          <div className="font-bold text-sm text-gray-800 mb-1 uppercase text-xs tracking-wider">
            Packing Material Items (প্যাকিং উপাদান ক্রয়)
          </div>
          <table className="w-full border-collapse border border-slate-300 text-sm">
            <thead>
              <tr className="bg-slate-100">
                <th className="border border-slate-300 text-center py-2 px-3 w-12 font-semibold">No.</th>
                <th className="border border-slate-300 text-left py-2 px-4 font-semibold">Packing Material</th>
                <th className="border border-slate-300 text-right py-2 px-4 w-28 font-semibold">Quantity</th>
                <th className="border border-slate-300 text-right py-2 px-4 w-32 font-semibold">Unit Price</th>
                <th className="border border-slate-300 text-right py-2 px-4 w-36 font-semibold">Amount (TK)</th>
              </tr>
            </thead>
            <tbody>
              {pmInventory.map((item: any, idx: number) => {
                const qty = Number(item.quantityAdd || item.quantityLess || 0);
                const debit = Number(item.debitAmount || 0);
                const unitPrice = qty > 0 ? debit / qty : Number(item.unitPrice || 0);
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
                      {debit.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-slate-50 font-bold">
                <td colSpan={2} className="border border-slate-300 text-right py-2 px-4">
                  Subtotal (PM):
                </td>
                <td className="border border-slate-300 text-right py-2 px-4 font-mono">{totalPMQty.toLocaleString()}</td>
                <td className="border border-slate-300 text-right py-2 px-4"></td>
                <td className="border border-slate-300 text-right py-2 px-4 font-mono text-emerald-800">
                  ৳ {totalPMDebit.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* 3. Accounting Journal / Ledger Postings */}
      {journalEntries.length > 0 && (
        <div className="mb-4">
          <div className="font-bold text-sm text-gray-800 mb-1 flex items-center justify-between">
            <span className="uppercase text-xs tracking-wider">
              {inventoryWithBalance.length > 0
                ? '2. Accounting Journal Posting'
                : 'Journal & Accounts Details'}
            </span>
            <span className="text-xs text-gray-500 font-normal">
              Entries: {journalEntries.length}
            </span>
          </div>

          <table className="w-full border-collapse border border-slate-300 text-sm">
            <thead>
              <tr className="bg-slate-100">
                <th className="border border-slate-300 text-center py-2 px-3 w-12 font-semibold">
                  No.
                </th>
                <th className="border border-slate-300 text-left py-2 px-4 font-semibold">
                  Account Head
                </th>
                <th className="border border-slate-300 text-left py-2 px-4 font-semibold">
                  Narration / Remarks
                </th>
                <th className="border border-slate-300 text-right py-2 px-4 w-32 font-semibold">
                  Debit (TK)
                </th>
                <th className="border border-slate-300 text-right py-2 px-4 w-32 font-semibold">
                  Credit (TK)
                </th>
              </tr>
            </thead>
            <tbody>
              {journalEntries.map((item, idx: number) => {
                const debit = Number(item.debitAmount || 0);
                const credit = Number(item.creditAmount || 0);

                return (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="border border-slate-300 text-center py-2 px-3 text-gray-600">
                      {idx + 1}
                    </td>
                    <td className="border border-slate-300 text-left py-2 px-4 font-medium text-gray-900">
                      {item.accountsItem?.accountsItemName || 'Accounts Item'}
                    </td>
                    <td className="border border-slate-300 text-left py-2 px-4 text-xs text-gray-600 italic">
                      {item.narration || '—'}
                    </td>
                    <td className="border border-slate-300 text-right py-2 px-4 font-mono font-medium text-emerald-700">
                      {debit > 0
                        ? debit.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })
                        : '—'}
                    </td>
                    <td className="border border-slate-300 text-right py-2 px-4 font-mono font-medium text-rose-700">
                      {credit > 0
                        ? credit.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })
                        : '—'}
                    </td>
                  </tr>
                );
              })}

              {/* Journal Total Row */}
              <tr className="bg-slate-50 font-bold border-t-2 border-slate-300">
                <td colSpan={3} className="border border-slate-300 text-right py-2 px-4">
                  Total (Journal):
                </td>
                <td className="border border-slate-300 text-right py-2 px-4 font-mono text-emerald-800">
                  ৳{' '}
                  {totalJournalDebit.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
                <td className="border border-slate-300 text-right py-2 px-4 font-mono text-rose-800">
                  ৳{' '}
                  {totalJournalCredit.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* If both inventory and journal are empty */}
      {inventoryWithBalance.length === 0 &&
        pmInventory.length === 0 &&
        journalEntries.length === 0 && (
          <div className="py-8 text-center text-gray-400 italic border border-slate-200 rounded">
            No items or journal transactions recorded in this voucher.
          </div>
        )}

      {/* Grand Total & Amount in Words */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-3 p-3 bg-slate-50 rounded border border-slate-300 gap-3">
        <div className="text-sm">
          <span className="font-bold underline text-gray-800">Amount in Word:</span>
          <span className="ml-2 font-semibold italic text-gray-900">
            {numberToWords(grandTotal || 0)}
          </span>
        </div>

        <div className="border bg-white px-5 py-2.5 rounded border-slate-300 w-full sm:w-auto min-w-[280px] flex justify-between items-center shadow-xs">
          <span className="font-bold text-gray-700">Total Amount:</span>
          <span className="font-mono text-lg font-bold text-amber-900">
            ৳{' '}
            {grandTotal.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
      </div>

      {/* Signature Section */}
      <div className="flex justify-between px-5" style={{ marginTop: '90px' }}>
        <div className="text-center border-t border-black pt-1.5 w-32">
          <p className="text-xs font-bold uppercase tracking-tight text-gray-800">Prepared By</p>
        </div>
        <div className="text-center border-t border-black pt-1.5 w-32">
          <p className="text-xs font-bold uppercase tracking-tight text-gray-800">Checked By</p>
        </div>
        <div className="text-center border-t border-black pt-1.5 w-32">
          <p className="text-xs font-bold uppercase tracking-tight text-gray-800">Store Keeper</p>
        </div>
        <div className="text-center border-t border-black pt-1.5 w-32">
          <p className="text-xs font-bold uppercase tracking-tight text-gray-800">Authorized By</p>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-8 border-t border-gray-100 pt-3 text-[10px] text-gray-400 text-center italic print:block no-screen">
        Printed on {new Date().toLocaleString()} - Golden Mart Industries
      </div>
    </div>
  );
};

export default PurchaseVoucherTable;
