/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Form, InputNumber, Button, Table, Tag } from 'antd';
import { PlusOutlined, ArrowLeftOutlined, CheckCircleOutlined, EditOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { PackingMaterialItem, ProductionExpenseItem } from '../ProductionCreationForm';

interface ProductionStep2Props {
  form: any;
  productName: string;
  createdProductionId: number | null;
  grandTotal: number;
  packingMaterials: PackingMaterialItem[];
  packingColumns: any[];
  handleAddPackingRow: () => void;
  totalPackingQty: number;
  totalPackingTk: number;
  productionExpenses: ProductionExpenseItem[];
  expenseColumns: any[];
  handleAddExpenseRow: () => void;
  totalExpenseQty: number;
  totalExpenseTk: number;
  totalProductionCost: number;
  unitCost: number;
  isStep2Submitting: boolean;
  handleStep2Submit: () => void;
  onBackToStep1: () => void;
  handleInputFocus: (e: React.FocusEvent<HTMLInputElement>) => void;
  handleNumberKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  isRawMaterialsDisabled?: boolean;
}

export const ProductionStep2: React.FC<ProductionStep2Props> = ({
  form,
  productName,
  createdProductionId,
  grandTotal,
  packingMaterials,
  packingColumns,
  handleAddPackingRow,
  totalPackingQty,
  totalPackingTk,
  productionExpenses,
  expenseColumns,
  handleAddExpenseRow,
  totalExpenseQty,
  totalExpenseTk,
  totalProductionCost,
  unitCost,
  isStep2Submitting,
  handleStep2Submit,
  onBackToStep1,
  handleInputFocus,
  handleNumberKeyDown,
  isRawMaterialsDisabled = false,
}) => {
  const batchNo = form.getFieldValue('batchNo');
  const dateVal = form.getFieldValue('date');

  return (
    <div className="space-y-4">
      {/* Step 1 Summary Banner */}
      <div className="bg-amber-50/60 p-4 rounded-lg border border-amber-200/60 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-6">
          <div>
            <span className="text-xs text-gray-500 block uppercase font-medium">Product</span>
            <span className="font-bold text-gray-800 text-base">
              {productName || '-'}
            </span>
          </div>
          <div>
            <span className="text-xs text-gray-500 block uppercase font-medium">Batch No</span>
            <span className="font-semibold text-gray-800">
              {batchNo || '-'}
            </span>
          </div>
          <div>
            <span className="text-xs text-gray-500 block uppercase font-medium">Date</span>
            <span className="font-semibold text-gray-800">
              {dateVal ? dayjs(dateVal).format('DD-MMM-YYYY') : '-'}
            </span>
          </div>
          <div>
            <span className="text-xs text-gray-500 block uppercase font-medium">Raw Materials Cost</span>
            <span className="font-bold text-amber-700">
              {grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ৳
            </span>
          </div>
          {createdProductionId && (
            <Tag color="success" className="font-semibold text-sm py-0.5 px-2">
              Production #{createdProductionId}
            </Tag>
          )}
        </div>
        <Button
          icon={<EditOutlined />}
          onClick={onBackToStep1}
          size="small"
        >
          {isRawMaterialsDisabled ? 'View Raw Materials (Step 1)' : 'Edit Raw Materials (Step 1)'}
        </Button>
      </div>

      {/* Production Expenses Section */}
      <div className="mt-4">
        <h3 className="font-bold text-base mb-2 text-gray-800">Production Expenses</h3>

        <div className="border border-slate-200/60 rounded-lg overflow-hidden">
          <Table
            className="expense-materials-table"
            dataSource={productionExpenses}
            columns={expenseColumns}
            rowKey="si"
            pagination={false}
            bordered
            size="small"
            scroll={{ x: 750 }}
            summary={() => (
              <Table.Summary fixed>
                <Table.Summary.Row className="bg-amber-50/40 border-t border-amber-200/50 font-bold">
                  <Table.Summary.Cell index={0} colSpan={2}>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={handleAddExpenseRow}
                      className="bg-[#C58D2F] hover:bg-[#b07d28] border-none text-white shadow-xs"
                    >
                      Add Expense Item
                    </Button>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} colSpan={1} className="text-center font-bold text-slate-800">
                    <span className="text-gray-500 mr-2 font-semibold">Total Qty/Duration:</span>
                    <span className="text-sm font-bold text-slate-900">
                      {totalExpenseQty.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2} colSpan={2} className="text-right pr-4 font-bold">
                    <span className="text-gray-500 mr-2 font-semibold">Total Tk:</span>
                    <span className="text-base font-extrabold text-amber-700">
                      {totalExpenseTk.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ৳
                    </span>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />
        </div>
      </div>

      {/* Packing Materials Section */}
      <div className="mt-4">
        <h3 className="font-bold text-base mb-2 text-gray-800">Packing Materials</h3>

        <div className="border border-slate-200/60 rounded-lg overflow-hidden">
          <Table
            className="packing-materials-table"
            dataSource={packingMaterials}
            columns={packingColumns}
            rowKey="si"
            pagination={false}
            bordered
            size="small"
            scroll={{ x: 1050 }}
            summary={() => (
              <Table.Summary fixed>
                <Table.Summary.Row className="bg-amber-50/40 border-t border-amber-200/50 font-bold">
                  <Table.Summary.Cell index={0} colSpan={3}>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={handleAddPackingRow}
                      className="bg-[#C58D2F] hover:bg-[#b07d28] border-none text-white shadow-xs"
                    >
                      Add Packing Material
                    </Button>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} colSpan={3} className="text-center font-bold text-slate-800">
                    <span className="text-gray-500 mr-2 font-semibold">Total Qty:</span>
                    <span className="text-sm font-bold text-slate-900">
                      {totalPackingQty.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2} colSpan={3} className="text-right pr-4 font-bold">
                    <span className="text-gray-500 mr-2 font-semibold">Total Tk:</span>
                    <span className="text-base font-extrabold text-amber-700">
                      {totalPackingTk.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ৳
                    </span>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />
        </div>
      </div>

      {/* Finished Product Section */}
      <div className="bg-slate-50/60 p-4 rounded-lg border border-slate-200/60 my-4">
        <h3 className="font-bold text-base mb-3 text-gray-800">Finished Product</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item
            name="productQuantity"
            label={<span className="font-semibold">Finished Product Quantity</span>}
            rules={[{ required: true, message: 'Please enter finished quantity' }]}
          >
            <InputNumber
              min={0.01}
              step={1}
              precision={2}
              controls={false}
              placeholder="Enter quantity"
              style={{ width: '100%' }}
              onFocus={handleInputFocus}
              onKeyDown={handleNumberKeyDown}
            />
          </Form.Item>

          <Form.Item
            label={<span className="font-semibold">Calculated Unit Cost (BDT)</span>}
          >
            <InputNumber
              value={unitCost}
              disabled
              precision={2}
              controls={false}
              style={{ width: '100%' }}
              className="bg-slate-100/80 font-bold text-gray-700 border-slate-200/60"
            />
          </Form.Item>
        </div>

        {/* Production Cost Summary Breakdown */}
        <div className="mt-3 p-3 bg-white rounded border border-slate-200/60 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div>
            <span className="text-xs text-gray-500 block">Raw Materials</span>
            <span className="font-bold text-slate-800">{grandTotal.toFixed(2)} ৳</span>
          </div>
          <div>
            <span className="text-xs text-gray-500 block">Production Expenses</span>
            <span className="font-bold text-slate-800">{totalExpenseTk.toFixed(2)} ৳</span>
          </div>
          <div>
            <span className="text-xs text-gray-500 block">Packing Materials</span>
            <span className="font-bold text-slate-800">{totalPackingTk.toFixed(2)} ৳</span>
          </div>
          <div>
            <span className="text-xs text-gray-500 block">Grand Total Cost</span>
            <span className="font-extrabold text-amber-700">{totalProductionCost.toFixed(2)} ৳</span>
          </div>
        </div>
      </div>

      {/* Step 2 Actions */}
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3 bg-slate-50/80 rounded-lg border py-2 px-4 border-slate-200/60">
        <Button
          onClick={onBackToStep1}
          icon={<ArrowLeftOutlined />}
          size="large"
        >
          Back to Step 1
        </Button>
        <Button
          type="primary"
          onClick={handleStep2Submit}
          loading={isStep2Submitting}
          size="large"
          icon={<CheckCircleOutlined />}
          className="px-8 bg-[#C58D2F] hover:bg-[#b07d28] border-none text-white shadow-sm font-semibold"
        >
          {isStep2Submitting ? 'Saving...' : 'Complete & Save Production'}
        </Button>
      </div>
    </div>
  );
};
