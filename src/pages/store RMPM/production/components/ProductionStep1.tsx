/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Form, Input, Button, Table, Select, DatePicker, Spin, Alert, Tag } from 'antd';
import { PlusOutlined, ArrowRightOutlined } from '@ant-design/icons';
import type { RawMaterialItem } from '../ProductionCreationForm';

interface ProductionStep1Props {
  productOptions: { value: number; label: string }[];
  isProductsLoading: boolean;
  selectedProductId: number | null;
  isIngredientsLoading: boolean;
  isIngredientsFetching: boolean;
  rawMaterials: RawMaterialItem[];
  columns: any[];
  handleAddRow: () => void;
  totalQty: number;
  grandTotal: number;
  createdProductionId: number | null;
  isStep1Submitting: boolean;
  handleStep1Submit: () => void;
  onProceedToStep2: () => void;
  isRawMaterialsDisabled?: boolean;
}

export const ProductionStep1: React.FC<ProductionStep1Props> = ({
  productOptions,
  isProductsLoading,
  selectedProductId,
  isIngredientsLoading,
  isIngredientsFetching,
  rawMaterials,
  columns,
  handleAddRow,
  totalQty,
  grandTotal,
  createdProductionId,
  isStep1Submitting,
  handleStep1Submit,
  onProceedToStep2,
  isRawMaterialsDisabled = false,
}) => {

  return (
    <div className="space-y-4">
      {isRawMaterialsDisabled && (
        <Alert
          type="warning"
          showIcon
          message="Step 1 Raw Materials Locked"
          description="Raw materials are saved and locked for this production. All raw material fields are disabled. Please proceed to Step 2 to complete packaging and expenses."
          className="border-amber-200 bg-amber-50"
        />
      )}

      {/* Top 3 required fields */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/60 p-2 rounded-lg border border-slate-200/60">
        <Form.Item
          name="productId"
          label={<span className="font-semibold">Select Product</span>}
          rules={[{ required: true, message: 'Please select product' }]}>
          <Select
            placeholder="Choose product..."
            style={{ width: '100%' }}
            options={productOptions}
            loading={isProductsLoading}
            disabled={isRawMaterialsDisabled}
            showSearch
            filterOption={(input, option) =>
              !!option?.label?.toString().toLowerCase().includes(input.toLowerCase())
            }
          />
        </Form.Item>

        <Form.Item
          name="batchNo"
          label={<span className="font-semibold">Batch No</span>}
          rules={[{ required: true, message: 'Please enter batch number' }]}
        >
          <Input placeholder="e.g. BATCH-2026-01" disabled={isRawMaterialsDisabled} />
        </Form.Item>

        <Form.Item
          name="date"
          label={<span className="font-semibold">Date</span>}
          rules={[{ required: true, message: 'Please select date' }]}
        >
          <DatePicker style={{ width: '100%' }} format="DD-MMM-YYYY" disabled={isRawMaterialsDisabled} />
        </Form.Item>
      </div>

      {/* Raw Materials Section */}
      <div className="mt-2">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-base text-gray-800 m-0">Raw Materials</h3>
          <span className="text-xs text-gray-500 font-medium">Add raw materials used in this batch</span>
        </div>

        {selectedProductId && (isIngredientsLoading || isIngredientsFetching) ? (
          <div className="p-8 text-center bg-slate-50/50 rounded border border-slate-200/60">
            <Spin tip="Loading product ingredients recipe..." />
          </div>
        ) : (
          <>
            {selectedProductId && rawMaterials.length === 0 && (
              <Alert
                type="info"
                showIcon
                message="No ingredients configured for this product. You can add raw materials manually below."
                className="mb-3 border-sky-100 bg-sky-50/60"
              />
            )}
            <div className="border border-slate-200/60 rounded-lg overflow-hidden">
              <Table
                className="raw-materials-table"
                dataSource={rawMaterials}
                columns={columns}
                rowKey="si"
                pagination={false}
                bordered
                size="small"
                scroll={{ x: 750 }}
                summary={() => (
                  <Table.Summary fixed>
                    <Table.Summary.Row className="bg-amber-50/40 border-t border-amber-200/50 font-bold">
                      <Table.Summary.Cell index={0} colSpan={3}>
                        <Button
                          type="primary"
                          icon={<PlusOutlined />}
                          onClick={handleAddRow}
                          disabled={!selectedProductId || isRawMaterialsDisabled}
                          className="bg-[#C58D2F] hover:bg-[#b07d28] border-none text-white shadow-xs"
                        >
                          Add Raw Material
                        </Button>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1} colSpan={2} className="text-center font-bold text-slate-800">
                        <span className="text-gray-500 mr-2 font-semibold">Total Qty:</span>
                        <span className="text-sm font-bold text-slate-900">
                          {totalQty.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2} colSpan={2} className="text-right pr-4 font-bold">
                        <span className="text-gray-500 mr-2 font-semibold">Total Tk:</span>
                        <span className="text-base font-extrabold text-amber-700">
                          {grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ৳
                        </span>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  </Table.Summary>
                )}
              />
            </div>
          </>
        )}

        {/* Step 1 Actions */}
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3 bg-slate-50/80 rounded-lg border py-2 px-4 border-slate-200/60">
          <div className="flex items-center gap-2">
            {isRawMaterialsDisabled ? (
              <Tag color="orange" className="text-sm py-1 px-3 font-semibold">
                🔒 Step 1 Locked (Production #{createdProductionId})
              </Tag>
            ) : createdProductionId ? (
              <Tag color="success" className="text-sm py-1 px-3 font-semibold">
                ✓ Production Draft Created (ID: #{createdProductionId})
              </Tag>
            ) : (
              <span className="text-sm text-gray-500">
                Step 1: Save raw materials to proceed to packaging and expenses
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {isRawMaterialsDisabled ? (
              <Button
                type="primary"
                onClick={onProceedToStep2}
                icon={<ArrowRightOutlined />}
                className="bg-[#C58D2F] hover:bg-[#b07d28] border-none text-white shadow-xs font-semibold px-6"
              >
                Proceed to Step 2
              </Button>
            ) : (
              <>
                {createdProductionId && (
                  <Button
                    onClick={onProceedToStep2}
                    icon={<ArrowRightOutlined />}
                  >
                    Go to Step 2
                  </Button>
                )}
                <Button
                  type="primary"
                  onClick={handleStep1Submit}
                  loading={isStep1Submitting}
                  icon={<ArrowRightOutlined />}
                  className="bg-[#C58D2F] hover:bg-[#b07d28] border-none text-white shadow-xs font-semibold px-6"
                >
                  {createdProductionId ? 'Update & Proceed to Step 2' : 'Save Raw Materials & Proceed to Step 2'}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
