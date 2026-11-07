import { useRef } from 'react';
import { useParams } from 'react-router';
import { useGetReportByVoucherNoQuery } from '../../redux/features/transactions/transactons.api';
import { useReactToPrint } from 'react-to-print';
import { Button } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import VoucherHeader from '../../components/shared/VoucherHead';
import PaymentVoucherTable from '../../components/voucherTables/PaymentVoucherTable';
import PurchaseVoucherTable from '../../components/voucherTables/PurchaseVoucherTable';
import LogOrderVoucherTable from '../../components/voucherTables/LogOrderVoucherTable';
import JournalVoucherTable from '../../components/voucherTables/JournalVoucherTable';
import ReceivedVoucherTable from '../../components/voucherTables/ReceivedVoucherTable';
import SalesVoucherTable from '../../components/voucherTables/SalesVoucherTable';
import Loading from '../../components/shared/Loading';
import CreateProductTable from '../../components/voucherTables/CreateProductTable';

const VoucherDetails = () => {
    const params = useParams().voucherNo;
    const componentRef = useRef<HTMLDivElement>(null);
    const { data, isLoading } = useGetReportByVoucherNoQuery(params!, { skip: !params });
    const voucherData = data?.data;
    console.log(voucherData);
    const voucherType = voucherData?.voucherType;
    const partyName = voucherData?.party?.name || voucherData?.customer?.name;
    const partyAddress = voucherData?.party?.address || voucherData?.customer?.address;

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
    });

    if (isLoading) {
        return <Loading tip="Fetching Voucher Details..." />;
    }
    return (
        <div className='p-0 border max-w-[800px] border-gray-200 shadow mx-auto m-2'>
            <div className='max-w-[792px] mx-auto bg-white' ref={componentRef}>
                <VoucherHeader partyName={partyName || "No Name Exits"} date={voucherData?.date || ""} address={partyAddress || ''} />
                <div className='p-8 pt-0'>
                    {
                        voucherType === "RECEIPT" ?
                            <ReceivedVoucherTable data={voucherData} /> :
                            voucherType === "PAYMENT" ?
                                <PaymentVoucherTable data={voucherData} /> :
                                voucherType === "PURCHASE" ?
                                    <PurchaseVoucherTable data={voucherData} /> :
                                    (voucherType === "LOGORDERS") ?
                                        <LogOrderVoucherTable data={voucherData} /> :
                                        voucherType === "JOURNAL" ?
                                            <JournalVoucherTable data={voucherData} /> :
                                            voucherType === "SALES" ?
                                                <SalesVoucherTable data={voucherData} /> :
                                                // voucherType === "CREATEPRODUCT" ? <CreateProductTable data={voucherData} /> :
                                                <div className='p-10 text-center'>Voucher Type Not Supported</div>
                    }
                </div>
            </div>

            <div className='max-w-[792px] mx-auto mt-10 flex justify-center no-print pb-20'>
                <Button
                    type="primary"
                    size="large"
                    icon={<PrinterOutlined />}
                    onClick={() => handlePrint()}
                    className='min-w-[200px] bg-gold-600 hover:bg-gold-700'>
                    Print Voucher
                </Button>
            </div>

            <style>{`
                .no-screen {
                    display: none;
                }
                @media print {
                    .no-print {
                        display: none !important;
                    }
                    .no-screen {
                        display: block !important;
                    }
                    body {
                        padding: 0 !important;
                        margin: 0 !important;
                        background: white !important;
                    }
                    .shadow-sm {
                        box-shadow: none !important;
                    }
                }
            `}</style>
        </div>
    )
}

export default VoucherDetails;