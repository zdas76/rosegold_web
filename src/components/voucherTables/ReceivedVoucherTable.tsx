import { JournalEntry } from "../../types/voucherTypes";
import { numberToWords } from "../../utils/numberToWords";

const ReceivedVoucherTable = ({ data }: { data: any }) => {
    const journalEntries: JournalEntry[] = data?.journal || [];
    const totalDebit = journalEntries.reduce((acc, item) => acc + (item.debitAmount || 0), 0);
    const totalCredit = journalEntries.reduce((acc, item) => acc + (item.creditAmount || 0), 0);

    return (
        <div className="w-full">
            <div className='text-center mb-3'>
                <h2 className='text-xl font-bold uppercase tracking-widest border-b-2 border-black inline-block px-4 pb-1'>
                    Received
                </h2>
            </div>

            <div className='flex justify-between items-center mb-2 gap-2 bg-gray-50 p-3 rounded border border-gray-200 print:bg-transparent print:border-dotted'>
                <div className='space-y-1'>
                    <div className='flex gap-2 text-sm'>
                        <span className='font-bold min-w-[100px]'>Voucher No:</span>
                        <span className='font-mono'>{data?.voucherNo}</span>
                    </div>
                </div>
                <div className='flex gap-2 text-sm justify-end mt-1'>
                    <span className='font-bold'>Voucher Type:</span>
                    <span className='bg-emerald-100 px-2 rounded text-emerald-800 text-xs font-bold uppercase print:bg-transparent print:p-0'>
                        {data?.voucherType}
                    </span>
                </div>
            </div>

            <table className="w-full border-collapse">
                <thead>
                    <tr>
                        <th className="border border-slate-300 bg-slate-100 text-left py-2 px-4 w-12">
                            No.
                        </th>
                        <th className="border border-slate-300 bg-slate-100 text-left py-2 px-4">
                            Account / Description
                        </th>
                        <th className="border border-slate-300 bg-slate-100 text-right py-2 px-4 w-32">
                            Debit
                        </th>
                        <th className="border border-slate-300 bg-slate-100 text-right py-2 px-4 w-32">
                            Credit
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {journalEntries.map((item, idx: number) => (
                        <tr key={idx}>
                            <td className="border border-slate-300 text-left py-2 px-4">
                                {idx + 1}
                            </td>
                            <td className="border border-slate-300 text-left py-2 px-4">
                                <div className="font-semibold text-sm">
                                    {item?.accountsItem?.accountsItemName}
                                </div>
                                {item.narration && (
                                    <div className="text-[11px] text-gray-500 italic mt-0.5">
                                        {item.narration}
                                    </div>
                                )}
                            </td>
                            <td className="border border-slate-300 text-right py-2 px-4 font-mono">
                                {item.debitAmount > 0 ? item.debitAmount.toLocaleString() : '-'}
                            </td>
                            <td className="border border-slate-300 text-right py-2 px-4 font-mono">
                                {item.creditAmount > 0 ? item.creditAmount.toLocaleString() : '-'}
                            </td>
                        </tr>
                    ))}
                    {/* Totals Row */}
                    <tr className="bg-slate-50 font-bold">
                        <td className="border border-slate-300 text-right py-2 px-4" colSpan={2}>
                            Total
                        </td>
                        <td className="border border-slate-300 text-right py-2 px-4 font-mono">
                            {totalDebit.toLocaleString()}
                        </td>
                        <td className="border border-slate-300 text-right py-2 px-4 font-mono">
                            {totalCredit.toLocaleString()}
                        </td>
                    </tr>
                </tbody>
            </table>

            <div className="mt-4 mb-2">
                <span className="font-bold underline">Amount in Word:</span>
                <span className="ml-2 font-semibold italic">{numberToWords(totalDebit || 0)}</span>
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

            {/* Print Footer */}
            <div className='mt-10 border-t border-gray-100 pt-4 text-[10px] text-gray-400 text-center italic print:block no-screen'>
                Printed on {new Date().toLocaleString()} - Golden Mart Industries
            </div>
        </div>
    );
};

export default ReceivedVoucherTable;
