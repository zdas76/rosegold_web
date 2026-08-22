/* eslint-disable @typescript-eslint/no-explicit-any */
import { TInventoryTransaction } from "../../types/types";
import { numberToWords } from "../../utils/numberToWords";

const PurchaseVoucherTable = ({
  data,
}: {
    data: any;
}) => {
  const inventory = data?.inventory;
  const total = inventory?.reduce((acc: number, item: TInventoryTransaction) => acc + item.debitAmount, 0);

  let runningBalance = 0;
  const inventoryWithBalance = inventory?.map((item: TInventoryTransaction) => {
    runningBalance += (item.debitAmount || 0) - (item.creditAmount || 0);
    return {
      ...item,
      balance: runningBalance,
    };
  });

  return (
    <div className="w-full">
      <div className='text-center mb-3'>
        <h2 className='text-xl font-bold uppercase tracking-widest border-b-2 border-black inline-block px-4 pb-1'>
          Purchase
        </h2>
      </div>

      <div className='flex justify-between items-center mb-2 gap-2 bg-gray-50 p-3 rounded border border-gray-200 print:bg-transparent print:border-dotted'>
        <div className='space-y-1'>
          <div className='flex gap-2 text-sm'>
            <span className='font-bold min-w-[100px]'>Voucher No:</span>
            <span className='font-mono'>{data?.voucherNo}</span>
          </div>
          <div className='flex gap-2 text-sm'>
            <span className='font-bold min-w-[100px]'>Invoice No:</span>
            <span>{data?.invoiceNo || 'N/A'}</span>
          </div>
        </div>
        <div className='flex gap-2 text-sm justify-end mt-1'>
          <span className='font-bold'>Voucher Type:</span>
          <span className='bg-gold-100 px-2 rounded text-blue-800 text-xs font-bold uppercase print:bg-transparent print:p-0'>
            {data?.voucherType}
          </span>
        </div>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border border-slate-300 bg-slate-100 text-left py-2 px-4">
              No.
            </th>
            <th className="border border-slate-300 bg-slate-100 text-left py-2 px-4">
              Description
            </th>
            <th className="border border-slate-300 bg-slate-100 text-left py-2 px-4">
              Quantity
            </th>
            <th className="border border-slate-300 bg-slate-100 text-left py-2 px-4">
              Unit Price
            </th>
            <th className="border border-slate-300 bg-slate-100 text-left py-2 px-4">
              TK
            </th>
            <th className="border border-slate-300 bg-slate-100 text-left py-2 px-4">
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {inventoryWithBalance?.map((item: TInventoryTransaction, idx: number) => (
            <tr key={idx}>
              <td className="border border-slate-300 text-left py-2 px-4">
                {idx + 1}
              </td>
              <td className="border border-slate-300 text-left py-2 px-4 font-semibold">
                {item?.product?.name || item?.raWMaterial?.name}
              </td>
              <td className="border border-slate-300 text-left py-2 px-4">
                {item?.quantityAdd}
              </td>
              <td className="border border-slate-300 text-left py-2 px-4">
                {(item?.debitAmount / item?.quantityAdd).toFixed(2)}
              </td>
              <td className="border border-slate-300 text-left py-2 px-4">
                {item?.debitAmount}
              </td>
              <td className="border border-slate-300 text-left py-2 px-4">
                {item?.balance}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-between items-center mt-2">
        <div className="flex items-center gap-2">
          <span className="font-bold underline">Amount in Word:</span>
          <span className="font-semibold italic">{numberToWords(total || 0)}</span>
        </div>
        <div className="border flex justify-between px-5 p-3 border-slate-300 w-fit min-w-[300px]">
          <b>Total = </b>
          <b className="font-mono text-lg">{total?.toLocaleString()} </b>
        </div>
      </div>

      {/* Signature Section */}
      <div className='flex justify-between px-5' style={{ marginTop: "120px" }}>
        <div className='text-center border-t border-black pt-2 w-32'>
          <p className='text-xs font-bold uppercase'>Prepared By</p>
        </div>
        <div className='text-center border-t border-black pt-2 w-32'>
          <p className='text-xs font-bold uppercase'>Checked By</p>
        </div>
        <div className='text-center border-t border-black pt-2 w-32'>
          <p className='text-xs font-bold uppercase'>Authorized By</p>
        </div>
      </div>

      {/* Footer Info */}
      <div className='mt-10 border-t border-gray-100 pt-4 text-[10px] text-gray-400 text-center italic print:block no-screen'>
        Printed on {new Date().toLocaleString()} - Golden Mart Industries
      </div>
    </div>
  );
};

export default PurchaseVoucherTable;
