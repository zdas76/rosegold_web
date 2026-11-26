/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo } from 'react';
import { Button, Table, Select, InputNumber } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ProductionExpenseItem } from '../ProductionCreationForm';

interface ProductionExpensesSectionProps {
  productionExpenses: ProductionExpenseItem[];
  setProductionExpenses: React.Dispatch<React.SetStateAction<ProductionExpenseItem[]>>;
  expenseOptions: any[];
  totalExpenseQty: number;
  totalExpenseTk: number;
  disabled?: boolean;
}

const ProductionExpensesSection: React.FC<ProductionExpensesSectionProps> = ({
  productionExpenses,
  setProductionExpenses,
  expenseOptions,
  totalExpenseQty,
  totalExpenseTk,
  disabled = false,
}) => {
  const selectedExpenseIds = useMemo(() => {
    return new Set(
      productionExpenses
        .map(item => item.expenseItemId)
        .filter((id): id is number => id != null)
    );
  }, [productionExpenses]);

  const handleAddExpenseRow = () => {
    const newExpense: ProductionExpenseItem = {
      si: productionExpenses.length + 1,
      expenseItemId: null,
      name: '',
      qty: null,
      rate: null,
      total: 0,
    };
    setProductionExpenses(prev => [...prev, newExpense]);
  };

  const handleExpenseItemChange = (si: number, expenseItemId: number | null) => {
    const chosen = expenseOptions.find((opt: any) => opt.value === expenseItemId);
    setProductionExpenses(prev =>
      prev.map(item => {
        if (item.si === si) {
          if (!chosen) {
            return {
              ...item,
              expenseItemId: null,
              name: '',
              rate: null,
              total: 0,
            };
          }

          const rate = chosen.rate || 0;
          const qty = item.qty != null ? Number(item.qty) : 0;
          const total = Number((qty * rate).toFixed(2));

          return {
            ...item,
            expenseItemId,
            name: chosen.label,
            rate,
            total,
          };
        }
        return item;
      })
    );
  };

  const handleQuantityChange = (si: number, newQty: number | null) => {
    setProductionExpenses(prev =>
      prev.map(item => {
        if (item.si === si) {
          const qtyVal = newQty != null ? Number(newQty) : 0;
          const rate = item.rate || 0;
          const total = Number((qtyVal * rate).toFixed(2));
          return {
            ...item,
            qty: newQty,
            total,
          };
        }
        return item;
      })
    );
  };

  const handleRateChange = (si: number, newRate: number | null) => {
    setProductionExpenses(prev =>
      prev.map(item => {
        if (item.si === si) {
          const rateVal = newRate != null ? Number(newRate) : 0;
          const qty = item.qty != null ? Number(item.qty) : 0;
          const total = Number((qty * rateVal).toFixed(2));
          return {
            ...item,
            rate: newRate,
            total,
          };
        }
        return item;
      })
    );
  };

  const handleRemoveExpenseRow = (si: number) => {
    setProductionExpenses(prev =>
      prev
        .filter(item => item.si !== si)
        .map((item, index) => ({ ...item, si: index + 1 }))
    );
  };

  const expenseColumns = [
    {
      title: 'SI',
      dataIndex: 'si',
      key: 'si',
      width: 55,
      align: 'center' as const,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: 'Expense Item Name',
      dataIndex: 'expenseItemId',
      key: 'expenseItemId',
      width: 260,
      render: (_: any, record: ProductionExpenseItem) => (
        <Select
          showSearch
          disabled={disabled}
          placeholder="Select Expense Item"
          value={record.expenseItemId || undefined}
          style={{ width: '100%' }}
          options={expenseOptions.map((opt: any) => ({
            ...opt,
            disabled: selectedExpenseIds.has(opt.value) && opt.value !== record.expenseItemId,
          }))}
          filterOption={(input, option) =>
            !!option?.label?.toString().toLowerCase().includes(input.toLowerCase())
          }
          onChange={(val) => handleExpenseItemChange(record.si, val)}
        />
      ),
    },
    {
      title: 'Qty/Duration',
      dataIndex: 'qty',
      key: 'qty',
      width: 140,
      align: 'right' as const,
      render: (qty: number, record: ProductionExpenseItem) => (
        <InputNumber
          min={0}
          step={0.01}
          disabled={disabled}
          value={qty}
          onChange={(val) => handleQuantityChange(record.si, val)}
          onFocus={(e) => e.target.select()}
          controls={false}
          precision={2}
          placeholder="0.00"
          className="w-full text-right"
        />
      ),
    },
    {
      title: 'Rate (BDT)',
      dataIndex: 'rate',
      key: 'rate',
      width: 140,
      align: 'right' as const,
      render: (rate: number, record: ProductionExpenseItem) => (
        <InputNumber
          min={0}
          step={0.01}
          disabled={disabled}
          value={rate}
          onChange={(val) => handleRateChange(record.si, val)}
          onFocus={(e) => e.target.select()}
          controls={false}
          precision={2}
          placeholder="0.00"
          className="w-full text-right"
        />
      ),
    },
    {
      title: 'Total (BDT)',
      dataIndex: 'total',
      key: 'total',
      width: 140,
      align: 'right' as const,
      render: (value: number) => (
        <span className="font-bold text-amber-700">{Number(value || 0).toFixed(2)}</span>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 60,
      align: 'center' as const,
      render: (_: any, record: ProductionExpenseItem) => !disabled ? (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveExpenseRow(record.si)}
          size="small"
        />
      ) : <span className="text-gray-400">-</span>,
    },
  ];

  return (
    <div className={`bg-white p-5 rounded-xl border border-slate-200/80 shadow-[0_2px_12px_-3px_rgba(15,23,42,0.04)] mt-4 ${disabled ? 'opacity-90' : ''}`}>
      <div className="flex items-center justify-between mb-3.5 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <h3 className="font-bold text-sm text-slate-800 m-0 tracking-tight">Production Expenses & Overheads</h3>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/50">
            {productionExpenses.filter(e => e.expenseItemId).length} Items
          </span>
          {disabled && (
            <span className="text-xs font-semibold px-2.5 py-0.5 bg-gray-200 text-gray-700 rounded-full">
              Locked
            </span>
          )}
        </div>
      </div>

      <div className="rounded-xl overflow-hidden border border-slate-200/80 shadow-[0_2px_12px_-3px_rgba(15,23,42,0.04)] bg-white">
        <Table
          className={`expense-materials-table`}
          dataSource={productionExpenses}
          columns={expenseColumns}
          rowKey={(record, index) =>
            record.id ? `id-${record.id}` : `row-${record.si ?? index}`
          }
          pagination={false}
          size="small"
          scroll={{ x: 750 }}
          summary={() => (
            <Table.Summary fixed>
              <Table.Summary.Row className="bg-amber-50/40 border-t border-amber-200/50 font-bold">
                <Table.Summary.Cell index={0} colSpan={2}>
                  {!disabled && (
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={handleAddExpenseRow}
                      className="bg-[#C58D2F] hover:bg-[#b07d28] border-none text-white font-semibold rounded-lg px-4 h-8 text-xs shadow-xs"
                    >
                      Add Expense
                    </Button>
                  )}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} className="text-right pr-4 font-bold text-slate-800">
                  <span className="text-gray-500 mr-2 font-semibold">Total Qty/Duration:</span>
                  <span className="text-sm font-bold text-slate-900">
                    {totalExpenseQty.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2} colSpan={3} className="text-right pr-4 font-bold">
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
  );
};

export default ProductionExpensesSection;
