import React from 'react';
import VoucherHeader from '../../../components/shared/VoucherHead';
import { TParty, TLedgerReport } from '../../../types/types';
import dayjs from 'dayjs';

interface VendorLedgerPrintProps {
    party: TParty;
    result: TLedgerReport[];
    totalDebit: number;
    totalCredit: number;
}

const VendorLedgerPrint: React.FC<VendorLedgerPrintProps> = ({ party, result, totalDebit, totalCredit }) => {
    let runningBalance = party?.openingAmount ?? 0;

    return (
        <div className="bg-white text-black print-container w-full max-w-[842px] mx-auto">
            <VoucherHeader
                partyName={party?.name || ''}
                date={dayjs().format('YYYY-MM-DD')}
                address={party?.address || ''}
            />

            <div className="mt-8 px-12">
                <h3 className="text-center text-xl font-bold mb-6 underline uppercase">Vendor Ledger Report</h3>

                <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p><strong>Contact No:</strong> {party?.contactNo}</p>
                        <p><strong>Opening Balance:</strong> ৳ {party?.openingAmount?.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                        <p><strong>Report Date:</strong> {dayjs().format('DD MMM, YYYY')}</p>
                        <p><strong>Party Type:</strong> {party?.partyType}</p>
                    </div>
                </div>

                <table className="w-full border-collapse border border-gray-400 text-sm">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border border-gray-400 p-2 text-left text-xs uppercase tracking-wider">S/N</th>
                            <th className="border border-gray-400 p-2 text-left text-xs uppercase tracking-wider">Date</th>
                            <th className="border border-gray-400 p-2 text-left text-xs uppercase tracking-wider">Narration</th>
                            <th className="border border-gray-400 p-2 text-left text-xs uppercase tracking-wider">Voucher No</th>
                            <th className="border border-gray-400 p-2 text-right text-xs uppercase tracking-wider">Debit</th>
                            <th className="border border-gray-400 p-2 text-right text-xs uppercase tracking-wider">Credit</th>
                            <th className="border border-gray-400 p-2 text-right text-xs uppercase tracking-wider">Balance</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Opening Balance Row */}
                        <tr>
                            <td className="border-r border-gray-400 p-2">1</td>
                            <td className="border-r border-gray-400 p-2">{dayjs(party?.openingDate).format('DD-MM-YYYY')}</td>
                            <td className="border-r border-gray-400 p-2" colSpan={4}>Opening Balance</td>
                            <td className="p-2 text-right font-semibold">{party?.openingAmount?.toLocaleString()}</td>
                        </tr>
                        {result.map((item, index) => {
                            runningBalance += item.debitAmount - item.creditAmount;
                            return (
                                <tr key={index} className="border-t border-gray-400">
                                    <td className="border-r border-gray-400 p-2">{index + 2}</td>
                                    <td className="border-r border-gray-400 p-2">{dayjs(item.date).format('DD-MM-YYYY')}</td>
                                    <td className="border-r border-gray-400 p-2">{item.narration || '-'}</td>
                                    <td className="border-r border-gray-400 p-2">{item.transactionInfo?.voucherNo || '-'}</td>
                                    <td className="border-r border-gray-400 p-2 text-right">{item.debitAmount ? item.debitAmount.toLocaleString() : '-'}</td>
                                    <td className="border-r border-gray-400 p-2 text-right">{item.creditAmount ? item.creditAmount.toLocaleString() : '-'}</td>
                                    <td className="p-2 text-right font-semibold">{runningBalance.toLocaleString()}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                    <tfoot>
                        <tr className="bg-gray-50 font-bold border-t border-gray-400">
                            <td className="border-r border-gray-400 p-2 text-right" colSpan={4}>Period Totals</td>
                            <td className="border-r border-gray-400 p-2 text-right">৳ {totalDebit.toLocaleString()}</td>
                            <td className="border-r border-gray-400 p-2 text-right">৳ {totalCredit.toLocaleString()}</td>
                            <td className="p-2 text-right">৳ {(totalDebit - totalCredit).toLocaleString()}</td>
                        </tr>
                    </tfoot>
                </table>

                <div className="mt-24 flex justify-between px-10">
                    <div className='flex flex-col items-center gap-2'>
                        <div className='w-48 border-t-2 border-gray-800 pt-1 text-center font-bold italic text-gray-700'>
                            Prepared By
                        </div>
                    </div>
                    <div className='flex flex-col items-end gap-2'>
                        <div className='text-xl italic mb-1'>
                            For: <span className='font-serif font-bold text-[#4a3b31]'>Golden Mart Industries</span>
                        </div>
                        <div className='w-56 border-t-2 border-gray-800 pt-1 text-center font-bold text-xs uppercase tracking-tighter text-gray-500'>
                            Authorized Signature
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @media print {
                    @page {
                        margin: 10mm;
                        size: A4;
                    }
                    .print-container {
                        padding: 0;
                        margin: 0;
                        width: 100% !important;
                        max-width: none !important;
                    }
                    body {
                        padding: 0 !important;
                        margin: 0 !important;
                        background: white !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    table {
                        border-collapse: collapse !important;
                        width: 100% !important;
                        border: 1px solid #777 !important;
                    }
                    th, td {
                        border: 1px solid #777 !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default VendorLedgerPrint;
