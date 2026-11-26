/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Table, Tag, Button, Modal } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import type { RequisitionRecord, ProductRequisitionItem } from '../types';

interface RequisitionHistoryTabProps {
  history: RequisitionRecord[];
}

const RequisitionHistoryTab: React.FC<RequisitionHistoryTabProps> = ({ history }) => {
  const [selectedRecord, setSelectedRecord] = useState<RequisitionRecord | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const historyColumns = [
    {
      title: 'Requisition No',
      dataIndex: 'requisitionNo',
      key: 'requisitionNo',
      render: (text: string) => <span className="font-mono font-bold text-slate-800">{text}</span>,
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'From Department',
      dataIndex: 'fromStore',
      key: 'fromStore',
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: 'To Destination',
      dataIndex: 'toStore',
      key: 'toStore',
      render: (text: string) => <Tag color="green">{text}</Tag>,
    },
    {
      title: 'E-Invoice No',
      dataIndex: 'eInvoiceNo',
      key: 'eInvoiceNo',
      render: (text: string) => text ? <span className="font-mono font-medium text-slate-700">{text}</span> : <span className="text-slate-400">-</span>,
    },
    {
      title: 'Items',
      dataIndex: 'items',
      key: 'items',
      render: (itemsList: ProductRequisitionItem[]) => (
        <span className="font-semibold">{itemsList.length} item(s)</span>
      ),
    },
    {
      title: 'Total Qty',
      dataIndex: 'totalQty',
      key: 'totalQty',
      align: 'right' as const,
      render: (qty: number) => (
        <span className="font-bold font-mono text-[#C58D2F]">{qty.toLocaleString()}</span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      align: 'center' as const,
      render: (status: string) => {
        const color = status === 'APPROVED' ? 'green' : status === 'TRANSFERRED' ? 'purple' : 'gold';
        return <Tag color={color} className="font-semibold">{status}</Tag>;
      },
    },
    {
      title: 'Action',
      key: 'action',
      align: 'center' as const,
      render: (_: any, record: RequisitionRecord) => (
        <Button
          icon={<EyeOutlined />}
          size="small"
          onClick={() => {
            setSelectedRecord(record);
            setIsDetailModalOpen(true);
          }}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_12px_-3px_rgba(15,23,42,0.04)]">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <h3 className="text-sm font-bold text-slate-800 m-0">Recent Transfer Requisitions</h3>
      </div>
      <Table
        dataSource={history}
        columns={historyColumns}
        rowKey="id"
        size="middle"
        locale={{ emptyText: 'No requisition records created in this session.' }}
        pagination={{ pageSize: 8 }}
      />

      {/* Detail Modal */}
      <Modal
        title={
          <div className="flex items-center justify-between pr-6">
            <span className="font-bold text-base">Requisition: {selectedRecord?.requisitionNo}</span>
            <Tag color="gold">{selectedRecord?.status}</Tag>
          </div>
        }
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={[
          <Button key="close" size="middle" onClick={() => setIsDetailModalOpen(false)} className="text-xs">
            Close
          </Button>,
        ]}
        width="min(950px, 94vw)"
      >
        {selectedRecord && (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/60 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Date</span>
                <span className="font-semibold text-slate-700">{selectedRecord.date}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">From</span>
                <span className="font-semibold text-slate-700">{selectedRecord.fromStore}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">To</span>
                <span className="font-semibold text-slate-700">{selectedRecord.toStore}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">E-Invoice</span>
                <span className="font-semibold text-slate-700">{selectedRecord.eInvoiceNo || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Total Qty</span>
                <span className="font-bold text-[#C58D2F] font-mono text-sm">
                  {selectedRecord.totalQty.toLocaleString()}
                </span>
              </div>
            </div>

            <Table
              dataSource={selectedRecord.items}
              columns={[
                { title: 'SI', dataIndex: 'si', key: 'si', width: 50, render: (_: any, __: any, idx: number) => idx + 1 },
                { title: 'Product', dataIndex: 'productName', key: 'productName', render: (n: string) => <span className="font-semibold">{n}</span> },
                { title: 'Unit', dataIndex: 'unit', key: 'unit', width: 80 },
                { title: 'Transfer Qty', dataIndex: 'quantity', key: 'quantity', align: 'right' as const, render: (q: number) => <span className="font-mono font-bold text-blue-700">{q?.toLocaleString()}</span> },
                { title: 'Remarks', dataIndex: 'remarks', key: 'remarks', render: (r: string) => r || '-' },
              ]}
              pagination={false}
              size="small"
              rowKey="key"
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RequisitionHistoryTab;
