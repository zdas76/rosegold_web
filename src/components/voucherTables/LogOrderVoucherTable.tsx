import { numberToWords } from "../../utils/numberToWords";

const LogOrderVoucherTable = ({ data }: { data: any }) => {
    const logOrdByCategory = data?.logOrdByCategory || [];
    const logOrderItem = data?.logOrderItem || [];

    const summaryTotal = logOrdByCategory?.reduce((acc: number, item: any) => acc + Number(item?.debitAmount || 0), 0);
    const detailedTotal = logOrderItem?.reduce((acc: number, item: any) => acc + Number(item?.amount || 0), 0);

    return (
        <div className="w-full">
            <div className='text-center mb-4'>
                <h2 className='text-xl font-bold uppercase tracking-widest border-b-2 border-black inline-block px-4 pb-1'>
                    Log Order
                </h2>
            </div>

            {/* Top Section: Metadata & Summary */}
            <div className='grid grid-cols-1 gap-4 mb-4'>
                <div className='bg-gray-50 p-3 rounded border border-gray-200 print:bg-transparent'>
                    <h3 className='font-bold border-b border-gray-200 mb-2 text-sm uppercase'>Voucher Info</h3>
                    <div className='space-y-1 text-sm'>
                        <div className='flex gap-2'>
                            <span className='font-bold min-w-[100px]'>Voucher No:</span>
                            <span className='font-mono'>{data?.voucherNo}</span>
                        </div>
                        <div className='flex gap-2'>
                            <span className='font-bold min-w-[100px]'>Invoice No:</span>
                            <span>{data?.invoiceNo || '-'}</span>
                        </div>
                        <div className='flex gap-2'>
                            <span className='font-bold min-w-[100px]'>Voucher Type:</span>
                            <span className='bg-orange-100 px-2 rounded text-orange-800 text-xs font-bold uppercase print:hidden'>
                                {data?.voucherType}
                            </span>
                        </div>
                    </div>
                </div>

                <div className='bg-gray-50 p-3 rounded border border-gray-200 print:bg-transparent'>
                    <h3 className='font-bold border-b border-gray-200 mb-2 text-sm uppercase'>Summary by Category</h3>
                    <table className="w-full text-xs">
                        <thead>
                            <tr className='border-b border-gray-300'>
                                <th className='text-left pb-1'>Category</th>
                                <th className='text-right pb-1'>Qty</th>
                                <th className='text-right pb-1'>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logOrdByCategory.map((item: any, idx: number) => (
                                <tr key={idx} className='border-b border-gray-100'>
                                    <td className='py-1'>{item?.logCategory?.name}</td>
                                    <td className='text-right py-1'>{Number(item?.quantityAdd).toLocaleString()}</td>
                                    <td className='text-right py-1 font-mono'>{Number(item?.debitAmount).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className='font-bold'>
                                <td colSpan={2} className='text-right pt-1'>Total</td>
                                <td className='text-right pt-1 font-mono border-t border-black'>{summaryTotal.toLocaleString()}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            <div className="mt-2 mb-4">
                <span className="font-bold underline">Amount in Word:</span>
                <span className="ml-2 font-semibold italic">{numberToWords(summaryTotal || 0)}</span>
            </div>


            {/* Page 1: Signature Section follows the Summary */}
            <div className='flex justify-between px-5 mb-10' style={{ marginTop: "100px" }}>
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
            {/* Page 2: Individual Product Details - Controlled by breakBefore: 'page' */}
            <div className='mt-10 print:mt-0 print:pt-10' style={{ breakBefore: 'page' }}>
                <h3 className='font-bold text-sm uppercase mb-2 bg-slate-100 p-2 border border-slate-300'>Individual Product Details</h3>
                <table className="w-full border-collapse text-sm">
                    <thead>
                        <tr>
                            <th className="border border-slate-300 bg-slate-50 text-left py-2 px-2 w-10">No.</th>
                            <th className="border border-slate-300 bg-slate-50 text-left py-2 px-2 w-10">Name</th>
                            <th className="border border-slate-300 bg-slate-50 text-center py-2 px-2">Radius</th>
                            <th className="border border-slate-300 bg-slate-50 text-center py-2 px-2">Height</th>
                            <th className="border border-slate-300 bg-slate-50 text-center py-2 px-2">Grade</th>
                            <th className="border border-slate-300 bg-slate-50 text-right py-2 px-2">Quantity</th>
                            <th className="border border-slate-300 bg-slate-50 text-right py-2 px-2">Unit Price</th>
                            <th className="border border-slate-300 bg-slate-50 text-right py-2 px-2">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logOrderItem.map((item: any, idx: number) => (
                            <tr key={idx}>
                                <td className="border border-slate-300 text-center py-1 px-2">{idx + 1}</td>
                                <td className="border border-slate-300 text-center py-1 px-2">{item?.logGrades?.logCategory?.name}</td>
                                <td className="border border-slate-300 text-center py-1 px-2">{item?.radis}</td>
                                <td className="border border-slate-300 text-center py-1 px-2">{item?.height}</td>
                                <td className="border border-slate-300 text-center py-1 px-2">{item?.logGrades?.gradeName}</td>
                                <td className="border border-slate-300 text-right py-1 px-2">{item?.quantity}</td>
                                <td className="border border-slate-300 text-right py-1 px-2">{Number(item?.u_price).toLocaleString()}</td>
                                <td className="border border-slate-300 text-right py-1 px-2 font-mono">{Number(item?.amount).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className='font-bold bg-slate-50'>
                            <td colSpan={7} className='border border-slate-300 text-right py-2 px-2'>Grand Total</td>
                            <td className='border border-slate-300 text-right py-2 px-2 font-mono'>{detailedTotal.toLocaleString()}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            <div className="mt-4 mb-2">
                <span className="font-bold underline">Amount in Word:</span>
                <span className="ml-2 font-semibold italic">{numberToWords(detailedTotal || 0)}</span>
            </div>

            {/* Print Footer */}
            <div className='mt-10 border-t border-gray-100 pt-4 text-[10px] text-gray-400 text-center italic print:block no-screen'>
                Printed on {new Date().toLocaleString()} - Golden Mart Industries
            </div>
        </div>
    );
};

export default LogOrderVoucherTable;
