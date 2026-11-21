import React, { useState } from 'react';
import { Tabs, Tag } from 'antd';
import {
  SwapRightOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import NewRequisitionTab from './components/NewRequisitionTab';
import RequisitionHistoryTab from './components/RequisitionHistoryTab';
import type { RequisitionRecord } from './types';

const ProductTransfer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('form');
  const [requisitionHistory, setRequisitionHistory] = useState<RequisitionRecord[]>([]);

  const handleRequisitionSuccess = (newRecord: RequisitionRecord) => {
    setRequisitionHistory(prev => [newRecord, ...prev]);
  };

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-[1400px] mx-auto">
      {/* Page Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_12px_-3px_rgba(15,23,42,0.04)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold text-lg">
              <SwapRightOutlined />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-800 m-0 tracking-tight">
                Product Transfer to FG Store
              </h2>
              <p className="text-xs text-slate-500 m-0 mt-0.5">
                Create and manage finished goods transfer requisitions from Store RMPM to FG Store
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Tag color="gold" className="px-3 py-1 font-semibold text-xs rounded-full m-0">
            Store RMPM → FG Store
          </Tag>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        className="bg-transparent"
        items={[
          {
            key: 'form',
            label: (
              <span className="flex items-center gap-2 font-semibold">
                <FileTextOutlined /> New Requisition
              </span>
            ),
            children: (
              <NewRequisitionTab onSuccess={handleRequisitionSuccess} />
            ),
          },
          {
            key: 'history',
            label: (
              <span className="flex items-center gap-2 font-semibold">
                <ClockCircleOutlined /> Requisition History ({requisitionHistory.length})
              </span>
            ),
            children: (
              <RequisitionHistoryTab history={requisitionHistory} />
            ),
          },
        ]}
      />
    </div>
  );
};

export default ProductTransfer;
