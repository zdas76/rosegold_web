import { TSalesVoucher } from '../../types/voucherTypes';
import { numberToWords } from '../../utils/numberToWords';

const SalesVoucherTable = ({ data }: { data: TSalesVoucher }) => {
  const inventory = data?.inventory || [];
  
  // For sales vouchers, we typically look at creditAmount in inventory 
  // as the sales value, and debitAmount in journal/bank transactions as payments.
  const total = inventory.reduce((acc: number, item: any) => acc + (item.creditAmount || 0), 0);

  let runningBalance = 0;
  const inventoryWithBalance = inventory.map((item: any) => {
    // For sales, credit is usually the amount sold (revenue)
    runningBalance += (item.creditAmount || 0);
    return {
      ...item,
      balance: runningBalance,
    };
  });

  return (
    <div className="w-full">
      <div className='text-center mb-3'>
        <h2 className='text-xl font-bold uppercase tracking-widest border-b-2 border-black inline-block px-4 pb-1'>
          Sales
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
          <span className='bg-green-100 px-2 rounded text-green-800 text-xs font-bold uppercase print:bg-transparent print:p-0'>
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
          {inventoryWithBalance.map((item: any, idx: number) => (
            <tr key={idx}>
              <td className="border border-slate-300 text-left py-2 px-4">
                {idx + 1}
              </td>
              <td className="border border-slate-300 text-left py-2 px-4 font-semibold">
                {item?.product?.name || item?.raWMaterial?.name || 'N/A'}
              </td>
              <td className="border border-slate-300 text-left py-2 px-4">
                {item?.quantityLess || item?.quantityAdd || 0}
              </td>
              <td className="border border-slate-300 text-left py-2 px-4">
                {(item?.quantityLess > 0 
                  ? (item.creditAmount / item.quantityLess) 
                  : item?.quantityAdd > 0 
                    ? (item.debitAmount / item.quantityAdd) 
                    : 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
              <td className="border border-slate-300 text-left py-2 px-4">
                {(item?.creditAmount || item?.debitAmount || 0).toLocaleString()}
              </td>
              <td className="border border-slate-300 text-left py-2 px-4">
                {item?.balance.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-between items-center mt-2">
        <div className="flex items-center gap-2">
          <span className="font-bold underline">Amount in Word:</span>
          <span className="font-semibold italic">{numberToWords(total)}</span>
        </div>
        <div className="border flex justify-between px-5 p-3 border-slate-300 w-fit min-w-[300px]">
          <b>Total = </b>
          <b className="font-mono text-lg">{total.toLocaleString()}</b>
        </div>
      </div>

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
      <div className='mt-10 border-t border-gray-100 pt-4 text-[10px] text-gray-400 text-center italic print:block no-screen'>
        Printed on {new Date().toLocaleString()} - Golden Mart Industries
      </div>
    </div>
  );
};

export default SalesVoucherTable;