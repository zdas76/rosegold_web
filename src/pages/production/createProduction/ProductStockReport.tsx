import Table, { ColumnsType } from "antd/es/table";
import { useGetProductStockReportQuery } from "../../../redux/features/product/product.api"
import { TProductStockReport } from "../../../types/types";
import { Badge, DatePicker } from "antd";
import { Link } from "react-router";
import dayjs from "dayjs";
import { useState } from "react";


export const ProductStockReport = () => {
  const [startDate, setStartDate] = useState<string | undefined>(undefined);
  const [endDate, setEndDate] = useState<string | undefined>(undefined);
  const { data, isLoading, isFetching } = useGetProductStockReportQuery({ startDate, endDate })


  const columns: ColumnsType<TProductStockReport> = [
    {
      title: "SL",
      key: "sl",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Item",
      key: "item",
      render: (_, record) => (
        <div>
          <p className="font-semibold text-gray-800">
            {record?.product?.name} {record?.product?.size && <span className="text-gray-500 text-xs">({record.product.size})</span>}
          </p>
          <p className="text-xs text-gray-500">
            {record?.product?.description}
          </p>
        </div>
      ),
    },
    {
      title: "Qty In",
      key: "quantityAdd",
      align: "right",
      render: (_, record) => (
        <span className="font-medium text-green-600">
          {record?.total?._sum?.quantityAdd ?? 0}
        </span>
      ),
    },
    {
      title: "Qty Out",
      key: "quantityLess",
      align: "right",
      render: (_, record) => (
        <span className="font-medium text-red-600">
          {record?.total?._sum?.quantityLess ?? 0}
        </span>
      ),
    },
    {
      title: "Qty Balance",
      key: "closingQuantity",
      align: "right",
      render: (_, record) => {
        const opening = record?.product?.quantity ?? 0;
        const add = record?.total?._sum?.quantityAdd ?? 0;
        const less = record?.total?._sum?.quantityLess ?? 0;
        const closing = opening + add - less;

        return (
          <span className="font-semibold text-gold-600">
            {closing}
          </span>
        );
      },
    },
    // {
    //   title: "Unit Price",
    //   key: "unitPrice",
    //   align: "right",
    //   render: (_, record) => (
    //     <span className="font-medium">
    //       ৳ {record?.product?.unitPrice ?? 0}
    //     </span>
    //   ),
    // },
    {
      title: "Debit",
      key: "debitAmount",
      align: "right",
      render: (_, record) => {
        const debitAmount = record?.total?._sum?.debitAmount ?? 0;

        return (
          <span className="font-semibold text-gray-900">
            ৳ {debitAmount.toLocaleString()}
          </span>
        );
      },
    },
    {
      title: "Credit",
      key: "creditAmount",
      align: "right",
      render: (_, record) => {
        const creditAmount = record?.total?._sum?.creditAmount ?? 0;
        return (
          <span className="font-semibold text-gray-900">
            ৳ {creditAmount.toLocaleString()}
          </span>
        );
      },
    },
    {
      title: "Balance",
      key: "balanceAmount",
      align: "right",
      render: (_, record) => {
        const debitAmount = record?.total?._sum?.debitAmount ?? 0;
        const creditAmount = record?.total?._sum?.creditAmount ?? 0;
        const balanceAmount = debitAmount - creditAmount;
        return (
          <span className="font-semibold text-gray-900">
            ৳ {balanceAmount.toLocaleString()}
          </span>
        );
      },
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Link
          to={`/dashboard/product_stock_report/${record?.product?.id}`}
          className="text-gold-600 hover:underline font-bold">
          Details
        </Link>
      ),
    },
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Product Stock Report
        </h2>
        <div className="flex gap-2">
          <DatePicker
            onChange={(date) => {
              setStartDate(date?.format("YYYY-MM-DD") || "");
            }}
            size="middle"
          />
          <DatePicker
            onChange={(date) => {
              setEndDate(date?.format("YYYY-MM-DD") || "");
            }}
            size="middle"
          />
        </div>
      </div>

      <Table
        loading={isLoading || isFetching}
        columns={columns}
        dataSource={data?.data || []}
        rowKey="id"
        pagination={{ pageSize: 5 }}
        className="rounded-lg overflow-hidden"
      />
    </div>
  )
}



