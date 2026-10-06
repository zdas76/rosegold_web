/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Form, InputNumber, Select, Button, Table, message } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

interface CombinedProductsSectionProps {
  combinedForm: any;
  combinedProducts: any[];
  setCombinedProducts: React.Dispatch<React.SetStateAction<any[]>>;
  productsData: any;
  productQuantity: any;
  currentCombinedTotalQty: number;
}

const CombinedProductsSection: React.FC<CombinedProductsSectionProps> = ({
  combinedForm,
  combinedProducts,
  setCombinedProducts,
  productsData,
  productQuantity,
  currentCombinedTotalQty
}) => {
  return (
    <div className="bg-slate-50/50 p-6 rounded-xl border border-slate-200/60 shadow-sm mt-6">
      <h3 className="font-bold text-lg text-gray-800 mb-5 border-b border-gray-200 pb-2">Combined Products</h3>

      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <Form
          form={combinedForm}
          layout="vertical"
          component={false}
        >
          <div className="grid grid-cols-1 md:grid-cols-5 gap-7 items-end">
            <Form.Item
              name="productId"
              label={<span className="font-semibold text-gray-700 text-sm">Select Combined Product</span>}
              rules={[{ required: true, message: 'Please select a product' }]}
              className="mb-0"
            >
              <Select
                style={{ width: "100%" }}
                showSearch
                placeholder="Search by category or product"
                optionFilterProp="children"
                options={Array.isArray(productsData?.data) ? productsData.data.map((p: any) => {
                  const catName = p?.subCategory?.category?.categoryName || p?.category?.categoryName || '';
                  return {
                    value: p.id,
                    label: p.name + (catName ? ` (${catName})` : ''),
                    searchStr: `${p.name} ${catName}`.toLowerCase()
                  };
                }) : []}
                filterOption={(input, option: any) =>
                  (option?.searchStr || '').includes(input.toLowerCase())
                }
                size="large"
                className="rounded-lg shadow-sm"
              />
            </Form.Item>

            <Form.Item

              name="qtyPerPack"
              label={<span className="font-semibold text-gray-700 text-sm">Qty per Pack</span>}
              rules={[{ required: true, message: 'Enter qty' }]}
              className="mb-0"
            >
              <InputNumber style={{ width: "100%" }} min={1} controls={false} size="large" className="w-full rounded-lg shadow-sm" placeholder="0" />
            </Form.Item>

            <Form.Item
              name="numberOfCartoon"
              label={<span className="font-semibold text-gray-700 text-sm">Number of Cartoon</span>}
              rules={[{ required: true, message: 'Enter cartoon count' }]}
              className="mb-0"
            >
              <InputNumber min={1} controls={false} size="large" className="w-full rounded-lg shadow-sm" placeholder="0" style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item
              label={<span className="font-semibold text-gray-700 text-sm">Total Qty</span>}
              className="mb-0"
              validateStatus={currentCombinedTotalQty + combinedProducts.reduce((sum, item) => sum + item.totalQty, 0) > (Number(productQuantity) || 0) ? "error" : ""}
              help={currentCombinedTotalQty > 0 && currentCombinedTotalQty + combinedProducts.reduce((sum, item) => sum + item.totalQty, 0) > (Number(productQuantity) || 0) ? `Exceeds! Only ${Math.max(0, (Number(productQuantity) || 0) - combinedProducts.reduce((sum, item) => sum + item.totalQty, 0))} remaining.` : undefined}
            >
              <InputNumber 
                value={currentCombinedTotalQty} 
                disabled 
                size="large" 
                className={`w-full rounded-lg shadow-sm font-bold ${currentCombinedTotalQty + combinedProducts.reduce((sum, item) => sum + item.totalQty, 0) > (Number(productQuantity) || 0) ? 'bg-red-50 text-red-600 border-red-300' : 'bg-gray-50/80 text-gray-800'}`} 
                style={{ width: "100%" }} 
              />
            </Form.Item>

            <Form.Item className="mb-0">
              <Button 
                type="dashed" 
                onClick={() => {
                  combinedForm.validateFields().then((values: any) => {
                    const newTotal = (values.qtyPerPack || 0) * (values.numberOfCartoon || 0);
                    const currentGrandTotal = combinedProducts.reduce((sum: number, item: any) => sum + item.totalQty, 0);
                    const prodQty = Number(productQuantity) || 0;

                    if (currentGrandTotal + newTotal > prodQty) {
                      const remaining = Math.max(0, prodQty - currentGrandTotal);
                      message.error(`Total combined quantity cannot exceed Finished Product Quantity (${prodQty}). You can only add up to ${remaining} more.`);
                      return;
                    }

                    const product = productsData?.data?.find((p: any) => p.id === values.productId);
                    const newProduct = {
                      id: Date.now(),
                      productId: values.productId,
                      productName: product?.name || `Product #${values.productId}`,
                      categoryName: product?.subCategory?.category?.categoryName || product?.category?.categoryName || '',
                      qtyPerPack: values.qtyPerPack,
                      numberOfCartoon: values.numberOfCartoon,
                      totalQty: newTotal,
                    };
                    setCombinedProducts([...combinedProducts, newProduct]);
                    combinedForm.resetFields();
                  }).catch((info: any) => {
                    console.log('Validate Failed:', info);
                  });
                }} 
                size="large" 
                icon={<PlusOutlined />} 
                className="w-full text-blue-600 border-blue-200 hover:border-blue-400 hover:text-blue-700 font-bold rounded-lg shadow-sm"
              >
                Add Product
              </Button>
            </Form.Item>
          </div>
        </Form>
      </div>

      {combinedProducts.length > 0 && (
        <div className="mt-5 rounded-lg overflow-hidden border border-gray-200/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] bg-white">
          <Table
            dataSource={combinedProducts}
            rowKey="id"
            pagination={false}
            size="small"
            columns={[
              {
                title: 'Product',
                dataIndex: 'productName',
                key: 'productName',
                render: (text, record) => (
                  <div>
                    <span className="font-semibold text-gray-800">{text}</span>
                    {record.categoryName && <span className="text-xs text-gray-500 block">{record.categoryName}</span>}
                  </div>
                )
              },
              { title: 'Qty Per Pack', dataIndex: 'qtyPerPack', key: 'qtyPerPack', align: 'center' },
              { title: 'No. of Cartoon', dataIndex: 'numberOfCartoon', key: 'numberOfCartoon', align: 'center' },
              {
                title: 'Total Qty',
                dataIndex: 'totalQty',
                key: 'totalQty',
                align: 'center',
                render: (val) => <span className="font-extrabold text-blue-700">{val}</span>
              },
              {
                title: 'Action',
                key: 'action',
                align: 'center',
                width: 60,
                render: (_, record) => (
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => setCombinedProducts(prev => prev.filter(p => p.id !== record.id))}
                    size="small"
                  />
                )
              }
            ]}
            summary={() => {
              const grandTotalQty = combinedProducts.reduce((sum, item) => sum + item.totalQty, 0);
              return (
                <Table.Summary fixed>
                  <Table.Summary.Row className="bg-blue-50/50 font-bold">
                    <Table.Summary.Cell index={0} colSpan={3} className="text-right text-slate-700">Total Combined Qty:</Table.Summary.Cell>
                    <Table.Summary.Cell index={1} className="text-center text-blue-800 text-base">{grandTotalQty}</Table.Summary.Cell>
                    <Table.Summary.Cell index={2} />
                  </Table.Summary.Row>
                </Table.Summary>
              );
            }}
          />
        </div>
      )}
    </div>
  );
};

export default CombinedProductsSection;
