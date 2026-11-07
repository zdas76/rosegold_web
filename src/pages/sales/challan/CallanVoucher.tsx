import React, { useRef } from 'react'
import { useParams } from 'react-router'
import { useGetReportByVoucherNoQuery } from '../../../redux/features/transactions/transactons.api';
import VoucherHeader from '../../../components/shared/VoucherHead';
import { Button } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import { useReactToPrint } from 'react-to-print';
import Loading from '../../../components/shared/Loading';

const CallanVoucher = () => {
    const { voucherNo } = useParams();
    const componentRef = useRef<HTMLDivElement>(null);
    const { data, isLoading } = useGetReportByVoucherNoQuery(voucherNo!, { skip: !voucherNo });
    const voucherData = data?.data;
    const handlePrint = useReactToPrint({
        contentRef: componentRef,
    });

    if (isLoading) {
        return <Loading tip="Fetching Challan Details..." />;
    }

    if (!voucherData) {
        return <div className="p-10 text-center">No Voucher Data Found</div>;
    }
    const partyName = voucherData?.party?.name || voucherData?.customer?.name || "No Name Exists";
    const partyAddress = voucherData?.party?.address || voucherData?.customer?.address || "";
    const date = voucherData?.date || "";
    const inventory = voucherData?.inventory || [];

    return (
        <div className='p-0 border max-w-[850px] border-gray-200 shadow-xl mx-auto my-6 bg-gray-50'>
            <div className='max-w-[842px] mx-auto bg-white shadow-inner' ref={componentRef}>
                <div className='relative'>
                    {/* Header Component */}
                    <VoucherHeader partyName={partyName} date={date} address={partyAddress} />
                    <div className='text-gray-600 font-mono ml-12 absolute top-20 -left-2 text-sm mt-1'>
                        No: {voucherData.voucherNo}
                    </div>
                    {/* Voucher Identification */}
                    {/* Delivery Challan Title Card */}
                    <div className='flex justify-center mb-2'>
                        <div className='bg-[#4a3b31] text-white px-8 py-1 rounded-full text-lg font-semibold border-2 border-white tracking-wider uppercase mt-2'>
                            Delivery Challan
                        </div>
                    </div>
                    {/* Table Section */}
                    <div className='px-12 relative min-h-[600px]'>
                        <table className='w-full border-collapse border-2 border-gray-800 relative z-10 shadow-sm'>
                            <thead className='bg-[#4a3b31] text-white'>
                                <tr>
                                    <th className='border-2 border-gray-800 p-3 text-center w-[80px] uppercase text-xs tracking-widest font-semibold'>Serial No.</th>
                                    <th className='border-2 border-gray-800 p-3 text-center w-[140px] uppercase text-xs tracking-widest font-semibold'>Quantity</th>
                                    <th className='border-2 border-gray-800 p-3 text-left uppercase text-xs tracking-wide font-semibold'>Description of Goods</th>
                                </tr>
                            </thead>

                            <tbody>
                                {inventory.map((item: any, index: number) => (
                                    <tr key={item.id} className='h-12'>
                                        <td className='border-r-2 border-gray-800 p-3 text-center align-middle font-semibold text-gray-700'>{index + 1}</td>
                                        <td className='border-r-2 border-gray-800 p-3 text-center align-middle bg-[#f1f8ed] font-bold text-lg text-[#3a5a2e]'>
                                            {item.quantityLess}
                                        </td>
                                        <td className='p-3 text-left align-middle font-medium text-gray-800'>
                                            {item.product?.name}
                                        </td>
                                    </tr>
                                ))}
                                {/* Empty rows to maintain layout height */}
                                {[...Array(Math.max(0, 10 - inventory.length))].map((_, i) => (
                                    <tr key={`empty-${i}`} className='h-12'>
                                        <td className='border-r-2 border-gray-800 p-3'></td>
                                        <td className='border-r-2 border-gray-800 p-3 bg-[#f1f8ed]'></td>
                                        <td className='p-3'></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Golden Mart Watermark */}
                        <div className='absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none' style={{ zIndex: 0 }}>
                            <div className='transform -rotate-12 text-[120px] font-serif font-black text-gray-900 whitespace-nowrap'>
                                GOLDEN MART
                            </div>
                        </div>
                    </div>

                    {/* Footer Section */}
                    <div className='px-12 mt-24 flex justify-between items-end'>
                        <div className='flex flex-col items-center gap-2'>
                            <div className='w-48 border-t-2 border-gray-800 pt-1 text-center font-bold italic text-gray-700'>
                                Received by
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
            </div>

            {/* Print Button Wrapper */}
            <div className='max-w-[842px] mx-auto mt-6 flex justify-center no-print pb-20'>
                <Button
                    type="primary"
                    size="large"
                    icon={<PrinterOutlined />}
                    onClick={() => handlePrint()}
                    className='min-w-[240px] h-12 bg-[#4a3b31] hover:bg-[#32251d] border-none text-lg font-bold shadow-lg transition-all duration-300 hover:scale-105 active:scale-95'>
                    PRINT DELIVERY CHALLAN
                </Button>
            </div>

            <style>{`
                @media print {
                    @page {
                        margin: 0;
                        size: auto;
                    }
                    .no-print {
                        display: none !important;
                    }
                    body {
                        padding: 0 !important;
                        margin: 0 !important;
                        background: white !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    .shadow-xl, .shadow-inner, .shadow-lg, .shadow-sm {
                        box-shadow: none !important;
                    }
                    .border {
                        border: none !important;
                    }
                    .bg-gray-50, .bg-white {
                        background-color: white !important;
                    }
                    .bg-gray-100 {
                        background-color: #f3f4f6 !important;
                    }
                    .bg-[#4a3b31] {
                        background-color: #4a3b31 !important;
                        color: white !important;
                    }
                    .bg-[#f1f8ed] {
                        background-color: #f1f8ed !important;
                    }
                    table {
                        border-collapse: collapse !important;
                        width: 100% !important;
                        border: 2px solid #000 !important;
                    }
                    th {
                        border: 2px solid #000 !important;
                    }
                    td {
                        border-right: 2px solid #000 !important;
                        border-left: 2px solid #000 !important;
                        border-top: none !important;
                        border-bottom: none !important;
                    }
                    /* Ensure bottom of last row has border if needed by container */
                }
            `}</style>
        </div>
    )
}

export default CallanVoucher

