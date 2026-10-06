/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Button, Table, Select, InputNumber, Form } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { PackingMaterialItem } from '../ProductionCreationForm';

interface PackingMaterialsSectionProps {
  packingMaterials: PackingMaterialItem[];
  setPackingMaterials: React.Dispatch<React.SetStateAction<PackingMaterialItem[]>>;
  packingMaterialOptions: any[];
  totalPackingQty: number;
  totalPackingTk: number;
  productQuantity: number | string | null;
}

const roundToThree = (val: number | null | undefined): number | null => {
  if (val == null || isNaN(Number(val))) return null;
  return Math.round((Number(val) + Number.EPSILON) * 1000) / 1000;
};

const PackingMaterialsSection: React.FC<PackingMaterialsSectionProps> = ({
  packingMaterials,
  setPackingMaterials,
  packingMaterialOptions,
  totalPackingQty,
  totalPackingTk,
  productQuantity,
}) => {
  const [form] = Form.useForm();

  const handleAddPacking = (values: any) => {
    const chosen = packingMaterialOptions.find((opt: any) => opt.value === values.packingMaterialId);
    if (!chosen) return;

    const unitPrice = values.unitPrice || 0;
    const qty = values.qty || 0;
    const total = Number((qty * unitPrice).toFixed(2));
    const prodQty = Number(productQuantity) || 0;
    
    let perUnitQty = null;
    let perUnitCost = null;
    
    if (prodQty > 0) {
      perUnitQty = roundToThree(qty / prodQty);
      perUnitCost = roundToThree(total / prodQty);
    }

    const newMaterial: PackingMaterialItem = {
      si: packingMaterials.length > 0 ? Math.max(...packingMaterials.map(p => p.si)) + 1 : 1,
      packingMaterialId: values.packingMaterialId,
      name: chosen.label,
      unit: chosen.unit || 'Pcs',
      unitId: chosen.item?.unitId || null,
      qty,
      unitPrice,
      perUnitQty,
      perUnitCost,
      total,
    };

    setPackingMaterials([...packingMaterials, newMaterial]);
    form.resetFields();
  };

  const handleRemovePackingRow = (si: number) => {
    setPackingMaterials(prev => prev.filter(item => item.si !== si));
  };

  const packingColumns = [
    { title: 'SI', dataIndex: 'si', key: 'si', width: 60, align: 'center' as const },
    {
      title: 'Packing Material',
      dataIndex: 'name',
      key: 'name',
      width: 250,
      render: (text: string) => <span className="font-semibold text-gray-800">{text}</span>
    },
    {
      title: 'Unit',
      dataIndex: 'unit',
      key: 'unit',
      width: 80,
      align: 'center' as const,
      render: (unit: string) => <span className="text-gray-600 font-medium">{unit || 'Pcs'}</span>,
    },
    {
      title: 'Unit Price (BDT)',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 140,
      align: 'right' as const,
      render: (unitPrice: number) => <span>{Number(unitPrice || 0).toFixed(2)}</span>
    },
    {
      title: 'Total Qty',
      dataIndex: 'qty',
      key: 'qty',
      width: 130,
      align: 'right' as const,
      render: (qty: number) => <span className="font-medium">{Number(qty || 0).toFixed(2)}</span>
    },
    {
      title: 'P.U. Qty',
      dataIndex: 'perUnitQty',
      key: 'perUnitQty',
      width: 120,
      align: 'right' as const,
      render: (val: number) => <span className="text-gray-600">{val != null ? val.toFixed(3) : '-'}</span>
    },
    {
      title: 'P. U. Cost',
      dataIndex: 'perUnitCost',
      key: 'perUnitCost',
      width: 130,
      align: 'right' as const,
      render: (val: number) => <span className="text-gray-600">{val != null ? val.toFixed(3) : '-'}</span>
    },
    {
      title: 'Total (BDT)',
      dataIndex: 'total',
      key: 'total',
      width: 130,
      align: 'right' as const,
      render: (value: number) => (
        <span className="font-semibold text-gray-800">{Number(value || 0).toFixed(2)}</span>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 60,
      align: 'center' as const,
      render: (_: any, record: PackingMaterialItem) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemovePackingRow(record.si)}
          size="small"
        />
      ),
    },
  ];

  return (
    <div className="bg-slate-50/50 p-6 rounded-xl border border-slate-200/60 shadow-sm mt-6">
      <h3 className="font-bold text-lg text-gray-800 mb-5 border-b border-gray-200 pb-2">Packing Materials</h3>
      
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddPacking}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-7 items-end">
            <Form.Item
              name="packingMaterialId"
              label={<span className="font-semibold text-gray-700 text-sm">Select Packing Material</span>}
              rules={[{ required: true, message: 'Please select a packing material' }]}
              className="mb-0"
            >
              <Select
                style={{ width: "100%" }}
                showSearch
                placeholder="Select Packing Material"
                options={packingMaterialOptions}
                filterOption={(input, option) =>
                  !!option?.label?.toString().toLowerCase().includes(input.toLowerCase())
                }
                onChange={(value) => {
                   const chosen = packingMaterialOptions.find((opt: any) => opt.value === value);
                   if (chosen && chosen.unitPrice) {
                      form.setFieldsValue({ unitPrice: chosen.unitPrice });
                   }
                }}
                size="large"
                className="rounded-lg shadow-sm"
              />
            </Form.Item>

            <Form.Item
              name="unitPrice"
              label={<span className="font-semibold text-gray-700 text-sm">Unit Price (BDT)</span>}
              rules={[{ required: true, message: 'Enter unit price' }]}
              className="mb-0"
            >
              <InputNumber style={{ width: "100%" }} min={0} step={0.01} controls={false} size="large" className="w-full rounded-lg shadow-sm" placeholder="0.00" />
            </Form.Item>

            <Form.Item
              name="qty"
              label={<span className="font-semibold text-gray-700 text-sm">Total Qty</span>}
              rules={[{ required: true, message: 'Enter qty' }]}
              className="mb-0"
            >
              <InputNumber min={0.01} step={0.01} controls={false} size="large" className="w-full rounded-lg shadow-sm" placeholder="0.00" style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item className="mb-0">
              <Button type="dashed" htmlType="submit" size="large" icon={<PlusOutlined />} className="w-full text-emerald-600 border-emerald-200 hover:border-emerald-400 hover:text-emerald-700 font-bold rounded-lg shadow-sm">
                Add Material
              </Button>
            </Form.Item>
          </div>
        </Form>
      </div>

      {packingMaterials.length > 0 && (
        <div className="mt-5 rounded-lg overflow-hidden border border-gray-200/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] bg-white">
          <Table
            className="packing-materials-table"
            dataSource={packingMaterials}
            columns={packingColumns}
            rowKey="si"
            pagination={false}
            bordered
            size="small"
            scroll={{ x: 950 }}
            summary={() => (
              <Table.Summary fixed>
                <Table.Summary.Row className="bg-amber-50/40 border-t border-amber-200/50 font-bold">
                  <Table.Summary.Cell index={0} colSpan={3} />
                  <Table.Summary.Cell index={1} colSpan={2} className="text-right pr-4 font-bold text-slate-800">
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
      )}
    </div>
  );
};

export default PackingMaterialsSection;
