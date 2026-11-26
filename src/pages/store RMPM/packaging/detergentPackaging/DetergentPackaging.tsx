/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import {
  Form,
  InputNumber,
  Input,
  Button,
  Table,
  Select,
  DatePicker,
  message,
  Space,
  Popconfirm,
} from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useGetProductsQuery, useGetProductStockReportQuery } from '../../../../redux/features/product/product.api';
import { useGetPackagingsQuery, useCreatePackagingMutation, useDeletePackagingMutation } from '../../../../redux/features/packaging/packaging.api';
import { getResponse } from '../../../../utils/getResponse';

const DetergentPackaging: React.FC = () => {
  const [form] = Form.useForm();
  const [isSubmitting] = React.useState(false);

  const { data: productsData } = useGetProductsQuery({});
  const { data: stockData } = useGetProductStockReportQuery({});
  const { data: packagingsData, isLoading: isListLoading } = useGetPackagingsQuery({});
  const [createPackaging] = useCreatePackagingMutation();
  const [deletePackaging] = useDeletePackagingMutation();

  const selectedProductId = Form.useWatch('productId', form);

  const productOptions = productsData?.data
    ?.filter((item: { name: string }) => item.name.toLowerCase().includes('detergent'))
    ?.map((item: { id: number; name: string }) => ({
      value: item.id,
      label: item.name,
    })) || [];

  const selectedProductStock = stockData?.data?.find(
    (item: any) => item.product?.id === selectedProductId
  );
  const stockQty = selectedProductStock
    ? (selectedProductStock.product?.quantity ?? 0) +
      (selectedProductStock.total?._sum?.quantityAdd ?? 0) -
      (selectedProductStock.total?._sum?.quantityLess ?? 0)
    : null;

  const totalPacks = Form.useWatch('totalPacks', form) || 0;
  const pcsPerPack = Form.useWatch('pcsPerPack', form) || 0;

  const totalPcs = Number(pcsPerPack) * Number(totalPacks);
  const remainingQty = stockQty !== null ? stockQty - totalPcs : null;

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setTimeout(() => e.currentTarget.select(), 0);
  };

  const handleNumberKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!/[\d.]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Enter'].includes(e.key)) {
      e.preventDefault();
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (remainingQty !== null && remainingQty < 0) {
        message.error('Cannot pack more than available stock!');
        return;
      }
      const payload = {
        type: 'detergent',
        productId: values.productId,
        voucherNo: values.voucherNo,
        batchNo: values.batchNo,
        date: values.date.toISOString(),
        totalPacks: Number(values.totalPacks),
        pcsPerPack: Number(values.pcsPerPack),
        totalPcs,
      };
      console.log('Detergent Packaging Payload:', payload);

      const res = await createPackaging(payload);
      const result = getResponse(res);
      if (result?.success) {
        message.success('Detergent powder packaging created successfully');
        form.resetFields();
      }
    } catch (error) {
      message.error('An error occurred');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await deletePackaging(id);
      const result = getResponse(res);
      if (result?.success) {
        message.success('Packaging deleted successfully');
      }
    } catch (error) {
      message.error('Failed to delete packaging');
    }
  };

  const listColumns = [
    { title: 'Voucher No', dataIndex: 'voucherNo', key: 'voucherNo' },
    { title: 'Batch No', dataIndex: 'batchNo', key: 'batchNo' },
    { title: 'Date', dataIndex: 'date', key: 'date', render: (v: string) => v ? new Date(v).toLocaleDateString() : '-' },
    { title: 'Total Packs', dataIndex: 'totalPacks', key: 'totalPacks' },
    { title: 'Total Pcs', dataIndex: 'totalPcs', key: 'totalPcs' },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_: any, record: any) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} size="small" />
          <Popconfirm title="Delete this packaging?" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-1">
      <h2 className="text-xl font-bold mb-4">Detergent Powder Packaging</h2>

      <Form form={form} onFinish={handleSubmit} layout="vertical">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Form.Item
            name="voucherNo"
            label="Voucher No"
            rules={[{ required: true, message: 'Please enter voucher number' }]}
          >
            <Input placeholder="Enter voucher number" />
          </Form.Item>

          <Form.Item
            name="batchNo"
            label="Batch No"
            rules={[{ required: true, message: 'Please enter batch number' }]}
          >
            <Input placeholder="Enter batch number" />
          </Form.Item>

          <Form.Item
            name="date"
            label="Date"
            rules={[{ required: true, message: 'Please select date' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </div>

        {/* Packaging Details */}
        <div className="mb-5">
          <h3 className="font-semibold mb-2">Packaging Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="flex items-end gap-2">
                <Form.Item
                  name="productId"
                  label="Product"
                  rules={[{ required: true, message: 'Please select product' }]}
                  className="flex-1 !mb-0"
                >
                  <Select
                    placeholder="Select product"
                    options={productOptions}
                    showSearch
                    filterOption={(input, option) =>
                      !!option?.label?.toString().toLowerCase().includes(input.toLowerCase())
                    }
                  />
                </Form.Item>
                {selectedProductId && remainingQty !== null && (
                  <div className="border h-[32px] px-1 flex items-center rounded border-gray-300">
                    <span className="font-bold text-gray-700 whitespace-nowrap">
                      Q: <span className={remainingQty < 0 ? 'text-red-600' : 'text-blue-600'}>{remainingQty}</span>
                    </span>
                  </div>
                )}
              </div>
            </div>

            <Form.Item
              name="pcsPerPack"
              label="Pcs per Pack"
              rules={[{ required: true, message: 'Please enter pcs' }]}
            >
              <InputNumber
                min={0}
                precision={0}
                controls={false}
                placeholder="e.g. 12"
                style={{ width: '100%' }}
                onFocus={handleInputFocus}
                onKeyDown={handleNumberKeyDown}
              />
            </Form.Item>

            <div>
              <Form.Item
                name="totalPacks"
                label="Total Packs"
                rules={[{ required: true, message: 'Please enter total packs' }]}
              >
                <InputNumber
                  min={0}
                  precision={0}
                  controls={false}
                  placeholder="e.g. 6"
                  style={{ width: '100%' }}
                  onFocus={handleInputFocus}
                  onKeyDown={handleNumberKeyDown}
                />
              </Form.Item>
              {remainingQty !== null && remainingQty < 0 && (
                <p className="text-red-500 text-xs">Cannot pack more than available stock!</p>
              )}
            </div>
          </div>

          {/* Auto Calculated Summary */}
          <div className="mt-3 bg-gray-50 border rounded-lg p-4">
            <div>
              <span className="text-sm text-gray-500">Total Pcs</span>
              <p className="text-xl font-bold">{totalPcs}</p>
            </div>
          </div>
        </div>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={isSubmitting}
            size="large"
            icon={<PlusOutlined />}
            className="w-full md:w-auto"
            disabled={remainingQty !== null && remainingQty < 0}
          >
            Save Detergent Powder Packaging
          </Button>
        </Form.Item>
      </Form>

      {/* Packaging Records */}
      <div className="mt-6">
        <h3 className="font-semibold mb-2">Packaging Records</h3>
        <Table
          dataSource={packagingsData?.data || []}
          columns={listColumns}
          rowKey="id"
          loading={isListLoading}
          pagination={{ pageSize: 5 }}
          bordered
          size="small"
        />
      </div>
    </div>
  );
};

export default DetergentPackaging;
