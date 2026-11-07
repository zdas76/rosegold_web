/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Table, Collapse, Button, InputNumber, message } from 'antd';
import { EyeOutlined, EditOutlined, CheckOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { RawMaterialItem } from '../ProductionCreationForm';
import { useCreateProductionMutation } from '../../../../redux/features/production/production.api';
import { getResponse } from '../../../../utils/getResponse';
import { showErrorAlert } from '../../../../utils/sweetAlert';
import { useAppDispatch } from '../../../../redux/hooks';
import { setProductionStep1 } from '../../../../redux/features/production/productionSlice';
import { useParams } from 'react-router';

interface RawMaterialsSectionProps {
  rawMaterials: RawMaterialItem[];
  setRawMaterials: React.Dispatch<React.SetStateAction<RawMaterialItem[]>>;
  grandTotal: number;
  handleInputFocus: (e: React.FocusEvent<HTMLInputElement>) => void;
  hideEditButton?: boolean;
  productionId?: number | string;
  productId: number;
  date?: string;
  refetch?: () => void;
  onSuccess?: (updatedProduction?: any) => void;
  inventoryId?: number;
}

const RawMaterialsSection: React.FC<RawMaterialsSectionProps> = ({
  rawMaterials,
  setRawMaterials,
  grandTotal,
  handleInputFocus,
  hideEditButton = false,
  productId,
  date,
  refetch,
  onSuccess,
  inventoryId
}) => {
  const dispatch = useAppDispatch();
  const [createProduction, { isLoading: isSaving }] = useCreateProductionMutation();


  const [isRawMaterialsEditable, setIsRawMaterialsEditable] = useState(false);
  const [backupRawMaterials, setBackupRawMaterials] = useState<RawMaterialItem[]>([]);
  const effectiveIsEditable = !hideEditButton && isRawMaterialsEditable;
  const productionId = useParams()?.id;
  const handleSave = async () => {
    if (!productId) {
      showErrorAlert('No product ID found to update');
      return;
    }
    if (!productionId) {
      showErrorAlert('No production ID found to update');
      return;
    }

    const validMaterials = rawMaterials.filter(
      item => item.rawMaterialId || (item as any).rawId
    );
    if (validMaterials.length === 0) {
      showErrorAlert('Please enter at least one valid Raw Material');
      return;
    }

    const invalidQty = validMaterials.some(
      item => item.qty === null || item.qty === undefined || Number(item.qty) <= 0
    );
    if (invalidQty) {
      showErrorAlert('Please enter a valid Quantity (greater than 0) for all raw materials');
      return;
    }

    const invalidRate = validMaterials.some(
      item => item.rate === null || item.rate === undefined || Number(item.rate) < 0
    );
    if (invalidRate) {
      showErrorAlert('Please enter a valid Rate for all raw materials');
      return;
    }

    try {
      const payloadDate = date ? dayjs(date).toISOString() : dayjs().toISOString();
      const payload = {
        date: payloadDate,
        inventoryId: inventoryId,
        productinfo: {
          productId: Number(productId),
          quantityAdd: 0,
          unitPrice: 0,
        },
        rawMaterials: validMaterials.map(item => ({
          rawId: Number(item.rawMaterialId || (item as any).rawId),
          quantity: Number(item.qty ?? (item as any).quantity) || 0,
          unitPrice: Number(item.rate ?? (item as any).unitPrice) || 0,
        })),
        status: 'PROCESSING',
      };

      const res = await createProduction({
        data: payload,
        id: productionId,
      });
      const result = getResponse(res);

      if (result?.success) {
        message.success('Raw materials updated successfully!');
        dispatch(
          setProductionStep1({
            productId: Number(productId || 1),
            date: payload.date,
            rawMaterials: payload.rawMaterials,
          })
        );
        refetch?.();
        onSuccess?.(result.data);
        setIsRawMaterialsEditable(false);
      }
    } catch (error: any) {
      showErrorAlert('An error occurred while updating raw materials');
    }
  };

  const handleToggleEdit = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isRawMaterialsEditable) {
      setBackupRawMaterials(JSON.parse(JSON.stringify(rawMaterials)));
      setIsRawMaterialsEditable(true);
    } else {
      await handleSave();
    }
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (backupRawMaterials.length > 0) {
      setRawMaterials(backupRawMaterials);
    }
    setIsRawMaterialsEditable(false);
  };

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
        <span className="font-bold text-[#C58D2F] font-mono">{Number(total || 0).toFixed(2)} ৳</span>
      ),
    },
  ];

  return (
    <Collapse
      defaultActiveKey={['1']}
      ghost
      className="bg-white rounded-xl border border-slate-200/80 shadow-[0_2px_12px_-3px_rgba(15,23,42,0.04)] overflow-hidden [&_.ant-collapse-header]:bg-slate-50/60 [&_.ant-collapse-header]:border-b [&_.ant-collapse-header]:border-slate-100"
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
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              {isRawMaterialsEditable && (
                <Button
                  type="text"
                  size="small"
                  disabled={isSaving}
                  onClick={handleCancel}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </Button>
              )}
              <Button
                type="text"
                size="small"
                loading={isSaving}
                icon={isRawMaterialsEditable ? <CheckOutlined /> : <EditOutlined />}
                onClick={handleToggleEdit}
                className="text-blue-600 hover:text-blue-800"
              >
                {isSaving ? 'Saving...' : isRawMaterialsEditable ? 'Done' : 'Edit'}
              </Button>
            </div>
          ) : null,
          children: (
            <Table
              dataSource={rawMaterials}
              columns={rawMaterialColumns}
              rowKey="si"
              pagination={false}
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
