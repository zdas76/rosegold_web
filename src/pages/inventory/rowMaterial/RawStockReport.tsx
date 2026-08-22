import { useGetRawMaterialStockReportQuery, } from '../../../redux/features/rowMaterials/rowMaterials.api'
import { Table, Tag, Badge, Form, DatePicker, Button, } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { TRawMaterialStockReport } from '../../../types/types';
import { Link } from 'react-router';
import { useState } from 'react';
import { toast } from 'sonner';

export const MaterialStockReport = () => {
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const { data: stockData, isLoading, isFetching } = useGetRawMaterialStockReportQuery({ startDate, endDate })

  const data = stockData?.data?.map((item: TRawMaterialStockReport, idx: number) => ({
    ...item.rawMaterial,
    total: item.total,
    key: idx + 1,
  }))

  const columns: ColumnsType<any> = [
    {
      title: "SL",
      dataIndex: "key",
      key: "key",
    },
    {
      title: "Item",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <div>
          <p className="font-semibold text-gray-800">{text}</p>
          <p className="text-xs text-gray-500">{record?.description}</p>
        </div>
      ),
    },
    {
      title: "Add Qty",
      key: "addQty",
      align: "right",
      render: (_, record) => (
        <span className="font-medium text-gold-600">
          {record.total?._sum?.quantityAdd || 0}
        </span>
      ),
    },
    {
      title: "Less Qty",
      key: "lessQty",
      align: "right",
      render: (_, record) => (
        <span className="font-medium text-red-600">
          {record.total?._sum?.quantityLess || 0}
        </span>
      ),
    },
    {
      title: "QTY Balance",
      key: "currentStock",
      align: "right",
      render: (_, record) => (
        <span className="font-bold text-gray-800">
          {(record.total?._sum?.quantityAdd || 0) - (record.total?._sum?.quantityLess || 0)}
        </span>
      ),
    },
    {
      title: "Debit Amount",
      dataIndex: "status",
      key: "status",
      align: "right",
      render: (_, record) => (
        <span className="font-medium text-gold-600">
          {record.total?._sum?.debitAmount || 0}
        </span>
      ),
    },
    {
      title: "Credit Amount",
      dataIndex: "status",
      key: "status",
      align: "right",
      render: (_, record) => (
        <span className="font-medium text-red-600">
          {record.total?._sum?.creditAmount || 0}
        </span>
      ),
    },
    {
      title: "Balance",
      key: "value",
      align: "right",
      render: (_, record) => (
        <span className="font-semibold text-green-600">
          ৳ {((record.total?._sum?.debitAmount || 0) - (record.total?._sum?.creditAmount || 0)).toLocaleString()}
        </span>
      ),
    },
    {
      title: "Action",
      key: "action",
      align: "right",
      render: (_, record) => (
        <Link
          to={`/dashboard/row-material/${record.id}`}
          className="text-gold-600 hover:underline font-bold"
        >
          Details
        </Link>
      ),
    },
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <div className='flex justify-between'>
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Materials Stock Report
        </h2>
        <div className="flex items-center gap-3">
          <Form.Item name="startDate">
            <DatePicker onChange={(e) => setStartDate(e?.format("YYYY-MM-DD") || "")} />
          </Form.Item>

          <Form.Item name="endDate">
            <DatePicker onChange={(e) => setEndDate(e?.format("YYYY-MM-DD") || "")} />
          </Form.Item>
        </div>
      </div>


      <Table
        loading={isLoading || isFetching}
        columns={columns}
        dataSource={data || []}
        rowKey="id"
        pagination={{ pageSize: 12 }}
        className="rounded-lg overflow-hidden"
      />
    </div>
  )
}
