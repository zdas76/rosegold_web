
import { useRef } from "react";
import { useAppSelector } from "../../../redux/hooks";
import { useReactToPrint } from "react-to-print";

const LogVoucherPrint = () => {
    const data = useAppSelector(state => state.logVoucher.voucher)
    const contentRef = useRef<HTMLDivElement>(null);

    const reactToPrintFn = useReactToPrint({ contentRef });
    console.log(data);

    if (!data) {
        return <h3 className="mt-10 font-bold text-xl md:text-2xl text-center">There is no voucher to Print</h3>
    }

    return (

        <>
            <div ref={contentRef} className="max-w-4xl mx-auto bg-white p-8 shadow-lg rounded-lg border border-gray-200 mt-4">
                {/* Header */}
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Log Voucher</h1>
                    <p className="text-sm text-gray-500">Voucher No: {data?.voucherNo}</p>
                    <p className="text-sm text-gray-500">Invoice No: {data?.invoiceNo}</p>
                    <p className="text-sm text-gray-500">
                        Date: {new Date(data?.createdAt!).toLocaleString()}
                    </p>
                </div>

                {/* Voucher Type */}
                <div className="mb-4">
                    <span className="font-semibold text-gray-700">Voucher Type:</span>{" "}
                    {data?.voucherType}
                </div>

                {/* Log Order by Category Table */}
                <h2 className="font-semibold text-gray-800 mb-2">Log Order</h2>
                <table className="w-full border-collapse border border-gray-300 mb-6">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border border-gray-300 p-2">No.</th>
                            <th className="border border-gray-300 p-2">Category Name</th>
                            <th className="border border-gray-300 p-2">Quantity</th>
                            <th className="border border-gray-300 p-2">Unit Price</th>
                            <th className="border border-gray-300 p-2">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data?.logOrdByCategory.map((item, idx: number) => (
                            <tr key={item.id}>
                                <td className="border text-center border-gray-300 p-2">{idx + 1}</td>
                                <td className="border text-left border-gray-300 p-2">{item?.logCategory?.name}</td>
                                <td className="border text-center border-gray-300 p-2">{item?.quantityAdd}</td>
                                <td className="border text-center border-gray-300 p-2">{item?.unitPrice}</td>
                                <td className="border text-center border-gray-300 p-2">{item?.debitAmount}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Log Order Items Table */}
                {/* <h2 className="font-semibold text-gray-800 mb-2">Log Order Items</h2>
                <table className="w-full border-collapse border border-gray-300 mb-6">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border border-gray-300 p-2">Grade ID</th>
                            <th className="border border-gray-300 p-2">Radius</th>
                            <th className="border border-gray-300 p-2">Height</th>
                            <th className="border border-gray-300 p-2">Quantity</th>
                            <th className="border border-gray-300 p-2">Unit Price</th>
                            <th className="border border-gray-300 p-2">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data?.logOrderItem.map((item) => (
                            <tr key={item.id}>
                                <td className="border border-gray-300 p-2">{item.logGradeId}</td>
                                <td className="border border-gray-300 p-2">{item.radis}</td>
                                <td className="border border-gray-300 p-2">{item.height}</td>
                                <td className="border border-gray-300 p-2">{item.quantity}</td>
                                <td className="border border-gray-300 p-2">{item.unitPrice}</td>
                                <td className="border border-gray-300 p-2">{item.total}</td>
                            </tr>
                        ))}
                    </tbody>
                </table> */}

                {/* Footer */}
                <div className="mt-6 text-right">
                    <p className="font-semibold">
                        Payment Type: {data?.paymentType || "N/A"}
                    </p>
                </div>
            </div>

            <div className="mt-4 max-w-4xl mx-auto flex justify-end">
                {/* <button className="rounded cursor-pointer bg-blue-600 text-white px-4 py-1 text-lg md:px-10">Print</button> */}
                <button
                    onClick={reactToPrintFn}
                    className="mt-4 bg-gold-500 text-white px-4 py-2 rounded hover:bg-gold-600 cursor-pointer"
                >
                    Print Voucher
                </button>
            </div>
        </>
    );
};

export default LogVoucherPrint;
