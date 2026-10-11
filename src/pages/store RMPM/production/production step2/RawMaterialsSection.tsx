/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Table, Collapse, Button, InputNumber } from 'antd';
import { EyeOutlined, EditOutlined } from '@ant-design/icons';
import type { RawMaterialItem } from '../ProductionCreationForm';

interface RawMaterialsSectionProps {
  rawMaterials: RawMaterialItem[];
  setRawMaterials: React.Dispatch<React.SetStateAction<RawMaterialItem[]>>;
  grandTotal: number;
  handleInputFocus: (e: React.FocusEvent<HTMLInputElement>) => void;
  hideEditButton?: boolean;
}

const RawMaterialsSection: React.FC<RawMaterialsSectionProps> = ({
  rawMaterials,
  setRawMaterials,
  grandTotal,
  handleInputFocus,
  hideEditButton = false,
}) => {
  const [isRawMaterialsEditable, setIsRawMaterialsEditable] = useState(false);
  const effectiveIsEditable = !hideEditButton && isRawMaterialsEditable;

  const handleRawMaterialChange = (si: number, field: 'qty' | 'rate', value: number | null) => {
    setRawMaterials((prev: any) => prev.map((item: any) => {
      if (item.si === si) {
        const updated = { ...item, [field]: value };
        updated.total = Number(((updated.qty || 0) * (updated.rate || 0)).toFixed(2));
        return updated;
      }
      return item;
    }));
  };

  const rawMaterialColumns = [
    { title: 'SI', dataIndex: 'si', key: 'si', width: 60, align: 'center' as const },
    {
      title: 'Material Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <span className="font-semibold text-gray-800">{name}</span>,
    },
    {
      title: 'Unit',
      dataIndex: 'unit',
      key: 'unit',
      width: 90,
      align: 'center' as const,
      render: (unit: string) => <span className="text-gray-600">{unit || 'Kg'}</span>,
    },
    {
      title: 'Quantity',
      dataIndex: 'qty',
      key: 'qty',
      width: 120,
      align: 'right' as const,
      render: (qty: number, record: any) => effectiveIsEditable ? (
        <InputNumber
          value={qty}
          min={0}
          onFocus={handleInputFocus}
          onChange={(val) => handleRawMaterialChange(record.si, 'qty', val)}
          className="w-full"
        />
      ) : <span className="font-medium">{Number(qty || 0).toFixed(2)}</span>,
    },
    {
      title: 'Unit Rate (BDT)',
      dataIndex: 'rate',
      key: 'rate',
      width: 130,
      align: 'right' as const,
      render: (rate: number, record: any) => effectiveIsEditable ? (
        <InputNumber
          value={rate}
          min={0}
          onFocus={handleInputFocus}
          onChange={(val) => handleRawMaterialChange(record.si, 'rate', val)}
          className="w-full"
        />
      ) : <span>{Number(rate || 0).toFixed(2)} ৳</span>,
    },
    {
      title: 'Total (BDT)',
      dataIndex: 'total',
      key: 'total',
      width: 140,
      align: 'right' as const,
      render: (total: number) => (
        <span className="font-bold text-amber-700">{Number(total || 0).toFixed(2)} ৳</span>
      ),
    },
  ];

  return (
    <Collapse
      defaultActiveKey={['1']}
      ghost
      className="bg-slate-50/60 rounded-lg border border-slate-200/60"
      items={[
        {
          key: '1',
          label: (
            <span className="font-semibold text-gray-700 flex items-center gap-2">
              <EyeOutlined />
              Raw Materials Breakdown ({rawMaterials.length} Items)
            </span>
          ),
          extra: !hideEditButton ? (
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                setIsRawMaterialsEditable(!isRawMaterialsEditable);
              }}
              className="text-blue-600 hover:text-blue-800"
            >
              {isRawMaterialsEditable ? 'Done' : 'Edit'}
            </Button>
          ) : null,
          children: (
            <Table
              dataSource={rawMaterials}
              columns={rawMaterialColumns}
              rowKey="si"
              pagination={false}
              bordered
              size="small"
              scroll={{ x: 700 }}
              summary={() => (
                <Table.Summary fixed>
                  <Table.Summary.Row className="bg-amber-50/40 font-bold">
                    <Table.Summary.Cell index={0} colSpan={3} className="font-bold text-slate-800">
                      Total Raw Materials
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1} className="text-right font-bold text-slate-900">
                      {rawMaterials
                        .reduce((sum, item) => sum + (Number(item.qty) || 0), 0)
                        .toFixed(2)}
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={2} />
                    <Table.Summary.Cell index={3} className="text-right font-extrabold text-amber-700">
                      {grandTotal.toFixed(2)} ৳
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                </Table.Summary>
              )}
            />
          ),
        },
      ]}
    />
  );
};

export default RawMaterialsSection;
