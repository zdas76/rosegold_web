/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Button, Table, Select, InputNumber, Form } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ProductionExpenseItem } from '../ProductionCreationForm';

interface ProductionExpensesSectionProps {
  productionExpenses: ProductionExpenseItem[];
  setProductionExpenses: React.Dispatch<React.SetStateAction<ProductionExpenseItem[]>>;
  expenseOptions: any[];
  totalExpenseQty: number;
  totalExpenseTk: number;
}

const ProductionExpensesSection: React.FC<ProductionExpensesSectionProps> = ({
  productionExpenses,
  setProductionExpenses,
  expenseOptions,
  totalExpenseQty,
  totalExpenseTk,
}) => {
  const [form] = Form.useForm();

  const handleAddExpense = (values: any) => {
    const chosen = expenseOptions.find((opt: any) => opt.value === values.expenseItemId);
    if (!chosen) return;

    const rate = values.rate || 0;
    const qty = values.qty || 0;
    const total = Number((qty * rate).toFixed(2));

    const newExpense: ProductionExpenseItem = {
      si: productionExpenses.length > 0 ? Math.max(...productionExpenses.map(p => p.si)) + 1 : 1,
      expenseItemId: values.expenseItemId,
      name: chosen.label,
      qty,
      rate,
      total,
    };

    setProductionExpenses([...productionExpenses, newExpense]);
    form.resetFields();
  };

  const handleRemoveExpenseRow = (si: number) => {
    setProductionExpenses(prev => prev.filter(item => item.si !== si));
  };

  const expenseColumns = [
    { title: 'SI', dataIndex: 'si', key: 'si', width: 60, align: 'center' as const },
    {
      title: 'Expense Item Name',
      dataIndex: 'name',
      key: 'name',
      width: 250,
      render: (text: string) => <span className="font-semibold text-gray-800">{text}</span>
    },
    {
      title: 'Qty/Duration',
      dataIndex: 'qty',
      key: 'qty',
      width: 140,
      align: 'right' as const,
      render: (qty: number) => <span className="font-medium">{Number(qty || 0).toFixed(2)}</span>
    },
    {
      title: 'Rate (BDT)',
      dataIndex: 'rate',
      key: 'rate',
      width: 140,
      align: 'right' as const,
      render: (rate: number) => <span>{Number(rate || 0).toFixed(2)} ৳</span>
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
      render: (_: any, record: ProductionExpenseItem) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveExpenseRow(record.si)}
          size="small"
        />
      ),
    },
  ];

  return (
    <div className="bg-slate-50/50 p-6 rounded-xl border border-slate-200/60 shadow-sm mt-6">
      <h3 className="font-bold text-lg text-gray-800 mb-5 border-b border-gray-200 pb-2">Production Expenses</h3>

      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddExpense}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-7 items-end">
            <Form.Item
              name="expenseItemId"
              label={<span className="font-semibold text-gray-700 text-sm">Select Expense Item</span>}
              rules={[{ required: true, message: 'Please select an expense item' }]}
              className="mb-0"
            >
              <Select
                style={{ width: "100%" }}
                showSearch
                placeholder="Select Expense Item"
                options={expenseOptions}
                filterOption={(input, option) =>
                  !!option?.label?.toString().toLowerCase().includes(input.toLowerCase())
                }
                onChange={(value) => {
                  const chosen = expenseOptions.find((opt: any) => opt.value === value);
                  if (chosen && chosen.rate) {
                    form.setFieldsValue({ rate: chosen.rate });
                  }
                }}
                size="large"
                className="rounded-lg shadow-sm"
              />
            </Form.Item>

            <Form.Item
              name="qty"
              label={<span className="font-semibold text-gray-700 text-sm">Qty/Duration</span>}
              rules={[{ required: true, message: 'Enter qty' }]}
              className="mb-0"
            >
              <InputNumber style={{ width: "100%" }} min={0.01} step={0.01} controls={false} size="large" className="w-full rounded-lg shadow-sm" placeholder="0.00" />
            </Form.Item>

            <Form.Item
              name="rate"
              label={<span className="font-semibold text-gray-700 text-sm">Rate (BDT)</span>}
              rules={[{ required: true, message: 'Enter rate' }]}
              className="mb-0"
            >
              <InputNumber min={0} step={0.01} controls={false} size="large" className="w-full rounded-lg shadow-sm" placeholder="0.00" style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item className="mb-0">
              <Button type="dashed" htmlType="submit" size="large" icon={<PlusOutlined />} className="w-full text-blue-600 border-blue-200 hover:border-blue-400 hover:text-blue-700 font-bold rounded-lg shadow-sm">
                Add Expense
              </Button>
            </Form.Item>
          </div>
        </Form>
      </div>

      {productionExpenses.length > 0 && (
        <div className="mt-5 rounded-lg overflow-hidden border border-gray-200/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] bg-white">
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
                  <Table.Summary.Cell index={0} colSpan={2} />
                  <Table.Summary.Cell index={1} className="text-right pr-4 font-bold text-slate-800">
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
      )}
    </div>
  );
};

export default ProductionExpensesSection;
