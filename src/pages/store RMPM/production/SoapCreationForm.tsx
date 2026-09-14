/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from 'react';
import { Form, InputNumber, Input, Button, Table, Select, DatePicker, message } from 'antd';
import { useGetRowMaterialsQuery } from '../../../redux/features/rowMaterials/rowMaterials.api';
import { useGetProductsQuery } from '../../../redux/features/product/product.api';
import { useCreateSoapProductionMutation } from '../../../redux/features/production/production.api';
import { getResponse } from '../../../utils/getResponse';

interface RawMaterialFromAPI {
  id: number;
  name: string;
  unit: { id: number; name: string };
  unitId: number;
  rate?: number;
  unitPrice?: number;
}

interface RawMaterialItem {
  si: number;
  rawMaterialId: number | null;
  name: string;
  qty: number | null;
  unit: string;
  unitId: number | null;
  rate: number | null;
  total: number;
}

const defaultSoapMaterials = [
  "Pani",
  "Siliket",
  "Caustic",
  "Loric",
  "Staric",
  "Gliserin",
  "Golapi Clr",
  "Hazar P Clr",
  "Moskamber",
  "Titanium",
  "Ferafin",
  "Dalda",
  "SLES Liq.",
  "Palm Oil",
  "Golab Perfume",
  "Gas",
  "(TFM-58%) PCL",
];

const initialRawMaterials: RawMaterialItem[] = [
  ...defaultSoapMaterials.map((m, i) => ({
    si: i + 1,
    rawMaterialId: null,
    name: m,
    qty: null,
    unit: "Kg",
    unitId: null,
    rate: null,
    total: 0,
  })),
  {
    si: defaultSoapMaterials.length + 1,
    rawMaterialId: null,
    name: "",
    qty: null,
    unit: "Kg",
    unitId: null,
    rate: null,
    total: 0,
  },
  {
    si: defaultSoapMaterials.length + 2,
    rawMaterialId: null,
    name: "",
    qty: null,
    unit: "Kg",
    unitId: null,
    rate: null,
    total: 0,
  }
];

const SoapCreationForm: React.FC = () => {
  const [form] = Form.useForm();
  const [rawMaterials, setRawMaterials] = useState<RawMaterialItem[]>(initialRawMaterials);
  const [grandTotal, setGrandTotal] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: rawMaterialsData } = useGetRowMaterialsQuery({});
  const { data: productsData } = useGetProductsQuery({});
  const [createSoapProduction] = useCreateSoapProductionMutation();

  // Auto-select materials when backend data loads
  useEffect(() => {
    if (rawMaterialsData?.data) {
      setRawMaterials(prev => prev.map(item => {
        if (!item.name) return item; // Skip empty rows for auto-match
        const matched = rawMaterialsData.data.find((m: RawMaterialFromAPI) =>
          m.name.trim().toLowerCase() === item.name.trim().toLowerCase()
        );
        if (matched && !item.rawMaterialId) {
          const newRate = matched.unitPrice || matched.rate || null;
          const newQty = item.qty ?? 0;
          const newTotal = newRate != null ? Number((newQty * newRate).toFixed(2)) : 0;
          return {
            ...item,
            rawMaterialId: matched.id,
            unit: matched.unit?.name || item.unit,
            unitId: matched.unitId,
            rate: newRate,
            total: newTotal,
          };
        }
        return item;
      }));
    }
  }, [rawMaterialsData?.data]);

  const materialOptions = rawMaterialsData?.data?.map((item: RawMaterialFromAPI) => ({
    value: item.id,
    label: item.name,
    unit: item.unit?.name || 'Kg',
    unitId: item.unitId,
    rate: item.unitPrice || item.rate || 0,
  })) || [];

  const productOptions = productsData?.data?.map((item: { id: number; name: string }) => ({
    value: item.id,
    label: item.name,
  })) || [];

  const handleMaterialChange = (si: number, value: number | null) => {
    if (!value) {
      setRawMaterials(prev => prev.map(item =>
        item.si === si ? { ...item, rawMaterialId: null, name: "", unit: "Kg", unitId: null, qty: null, rate: null, total: 0 } : item
      ));
      return;
    }
    const selectedMaterial = rawMaterialsData?.data?.find((m: RawMaterialFromAPI) => m.id === value);
    if (selectedMaterial) {
      setRawMaterials(prev => prev.map(item => {
        if (item.si === si) {
          const newRate = selectedMaterial.unitPrice || selectedMaterial.rate || null;
          const newQty = item.qty ?? 0;
          const newTotal = newRate != null ? Number((newQty * newRate).toFixed(2)) : 0;
          return {
            ...item,
            rawMaterialId: selectedMaterial.id,
            name: selectedMaterial.name,
            unit: selectedMaterial.unit?.name || 'Kg',
            unitId: selectedMaterial.unitId,
            rate: newRate,
            total: newTotal,
          };
        }
        return item;
      }));
    }
  };

  const handleQtyChange = (si: number, value: number | null) => {
    setRawMaterials(prev => prev.map(item => {
      if (item.si === si) {
        const newQty = value;
        const rate = item.rate || 0;
        const newTotal = newQty != null ? Number((newQty * rate).toFixed(2)) : 0;
        return { ...item, qty: newQty, total: newTotal };
      }
      return item;
    }));
  };

  const handleRateChange = (si: number, value: number | null) => {
    setRawMaterials(prev => prev.map(item => {
      if (item.si === si) {
        const newRate = value;
        const qty = item.qty || 0;
        const newTotal = newRate != null ? Number((qty * newRate).toFixed(2)) : 0;
        return { ...item, rate: newRate, total: newTotal };
      }
      return item;
    }));
  };

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setTimeout(() => {
      e.currentTarget.select();
    }, 0);
  };

  useEffect(() => {
    const total = rawMaterials.reduce((sum, item) => sum + item.total, 0);
    setGrandTotal(Number(total.toFixed(2)));
  }, [rawMaterials]);

  const productQuantity = Form.useWatch('productQuantity', form);
  const unitCost = (Number(productQuantity) || 0) > 0
    ? Number((grandTotal / Number(productQuantity)).toFixed(2))
    : 0;

  const handleNumberKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!/[\d.]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Enter'].includes(e.key)) {
      e.preventDefault();
    }
  };

  const handleQtyKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, currentSi: number) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const allQtyInputs = Array.from(document.querySelectorAll('.qty-cell .ant-input-number-input'));
      const currentIndex = allQtyInputs.indexOf(e.target as HTMLInputElement);
      if (currentIndex === -1) return;
      const targetIndex = e.key === 'ArrowDown' ? currentIndex + 1 : currentIndex - 1;
      if (targetIndex >= 0 && targetIndex < allQtyInputs.length) {
        const targetInput = allQtyInputs[targetIndex] as HTMLInputElement;
        targetInput.focus();
        targetInput.select();
      }
    }
  };

  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
      const payload = {
        voucherNo: values.voucherNo,
        batchNo: values.batchNo,
        date: values.date.toISOString(),
        productId: values.productId,
        productQuantity: Number(values.productQuantity),
        unitCost,
        amount: grandTotal,
        rawMaterials: rawMaterials
          .filter(item => item.rawMaterialId)
          .map(item => ({
            rawId: item.rawMaterialId,
            quantity: item.qty || 0,
            unitPrice: item.rate || 0,
            amount: item.total || 0,
          })),
      };

      const res = await createSoapProduction(payload);
      const result = getResponse(res);
      if (result?.success) {
        message.success('Soap production created successfully');
        form.resetFields();
        setRawMaterials(initialRawMaterials);
      }
    } catch (error) {
      message.error('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    { title: 'SI', dataIndex: 'si', key: 'si', width: 60 },
    {
      title: 'Material Name',
      dataIndex: 'name',
      key: 'name',
      width: 220,
      render: (_: any, record: RawMaterialItem) => (
        <Select
          placeholder="Select Material"
          value={record.rawMaterialId || undefined}
          style={{ width: '100%' }}
          onChange={(v) => handleMaterialChange(record.si, v as number | null)}
          options={materialOptions}
          showSearch
          filterOption={(input, option) =>
            !!option?.label?.toString().toLowerCase().includes(input.toLowerCase())
          }
        />
      ),
    },
    {
      title: 'Qty (Kg)',
      dataIndex: 'qty',
      key: 'qty',
      width: 120,
      render: (_: any, record: RawMaterialItem) => (
        <InputNumber
          min={0}
          step={0.01}
          value={record.qty}
          onChange={(v) => handleQtyChange(record.si, v)}
          onFocus={handleInputFocus}
          onKeyDown={(e) => handleQtyKeyDown(e, record.si)}
          controls={false}
          style={{ width: '100%' }}
          precision={2}
          keyboard={false}
          className="qty-cell"
        />
      ),
    },

    {
      title: 'Rate',
      dataIndex: 'rate',
      key: 'rate',
      width: 120,
      render: (_: any, record: RawMaterialItem) => (
        <InputNumber
          min={0}
          step={0.01}
          value={record.rate}
          onChange={(v) => handleRateChange(record.si, v)}
          onFocus={handleInputFocus}
          onKeyDown={handleNumberKeyDown}
          controls={false}
          style={{ width: '100%' }}
          precision={2}
        />
      ),
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      width: 120,
      render: (value: number) => (
        <span className="font-semibold">{Number(value || 0).toFixed(2)}</span>
      ),
    },
  ];

  return (
    <div className="p-1">
      <h2 className="text-xl font-bold mb-4">Soap Creation Form</h2>
      <Form form={form} onFinish={handleSubmit} layout="vertical">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Form.Item name="voucherNo" label="Voucher No" rules={[{ required: true, message: 'Please enter voucher number' }]}>
            <Input placeholder="Enter voucher number" />
          </Form.Item>
          <Form.Item name="batchNo" label="Batch No" rules={[{ required: true }]}>
            <Input placeholder="Enter batch number" />
          </Form.Item>
          <Form.Item name="date" label="Date" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </div>

        <div className="mb-0">
          <h3 className="font-semibold mb-2">Raw Materials</h3>
          <Table
            dataSource={rawMaterials}
            columns={columns}
            rowKey="si"
            pagination={false}
            bordered
            size="small"
          />
        </div>

        <div className="flex justify-end border-gray-100 mb-2 mt-2 bg-white px-4 py-2 border rounded-lg">
          <div className="text-right">
            <p className="text-2xl mr-10 font-bold">Grand Total: {grandTotal.toLocaleString()} ৳</p>
          </div>
        </div>

        <div className="mb-0">
          <h3 className="font-semibold mb-2">Finished Product</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Form.Item name="productId" label="Product" rules={[{ required: true, message: 'Please select product' }]}>
              <Select
                placeholder="Select product"
                style={{ width: '100%' }}
                options={productOptions}
                showSearch
                filterOption={(input, option) =>
                  !!option?.label?.toString().toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>
            <Form.Item name="productQuantity" label="Quantity" rules={[{ required: true, message: 'Please enter quantity' }]}>
              <InputNumber
                min={0}
                step={0.01}
                precision={2}
                controls={false}
                placeholder="Enter quantity"
                style={{ width: '100%' }}
                onFocus={handleInputFocus}
                onKeyDown={handleNumberKeyDown}
              />
            </Form.Item>
            <Form.Item label="Unit Cost">
              <InputNumber value={unitCost} disabled precision={2} controls={false} style={{ width: '100%' }} />
            </Form.Item>
          </div>
        </div>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isSubmitting} size="large" className="w-full md:w-auto">
            {isSubmitting ? 'Submitting...' : 'Save Soap Production'}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default SoapCreationForm;