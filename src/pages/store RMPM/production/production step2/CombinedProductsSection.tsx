/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo } from 'react';
import { Button, Table, Select, InputNumber } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

export interface CombinedProductItem {
  id?: number | string;
  si: number;
  productId: number | null;
  productName: string;
  categoryName?: string;
  qtyPerPack: number | null;
  numberOfCartoon: number | null;
  totalQty: number;
}

interface CombinedProductsSectionProps {
  combinedProducts: CombinedProductItem[];
  setCombinedProducts: React.Dispatch<React.SetStateAction<CombinedProductItem[]>>;
  productsData: any;
  productQuantity: any;
  disabled?: boolean;
}

const CombinedProductsSection: React.FC<CombinedProductsSectionProps> = ({
  combinedProducts,
  setCombinedProducts,
  productsData,
  productQuantity,
  disabled = false,
}) => {
  const productOptions = useMemo(() => {
    const list = Array.isArray(productsData?.data) ? productsData.data : [];
    return list.map((p: any) => {
      const catName = p?.subCategory?.category?.categoryName || p?.category?.categoryName || '';
      return {
        value: p.id,
        label: p.name + (catName ? ` (${catName})` : ''),
        searchStr: `${p.name} ${catName}`.toLowerCase(),
        name: p.name,
        categoryName: catName,
      };
    });
  }, [productsData]);

  const totalCombinedQty = useMemo(() => {
    return combinedProducts.reduce((sum, item) => sum + (Number(item.totalQty) || 0), 0);
  }, [combinedProducts]);

  const prodQty = Number(productQuantity) || 0;
  const isExceeded = prodQty > 0 && totalCombinedQty > prodQty;

  const handleAddProductRow = () => {
    const nextSi = combinedProducts.length > 0 ? Math.max(...combinedProducts.map(m => m.si)) + 1 : 1;
    const newRow: CombinedProductItem = {
      id: Date.now(),
      si: nextSi,
      productId: null,
      productName: '',
      categoryName: '',
      qtyPerPack: null,
      numberOfCartoon: null,
      totalQty: 0,
    };
    setCombinedProducts(prev => [...prev, newRow]);
  };

  const handleProductChange = (si: number, productId: number | null) => {
    const chosen = productOptions.find((opt: any) => opt.value === productId);
    setCombinedProducts(prev =>
      prev.map(item => {
        if (item.si === si) {
          if (!chosen) {
            return {
              ...item,
              productId: null,
              productName: '',
              categoryName: '',
            };
          }
          return {
            ...item,
            productId,
            productName: chosen.name,
            categoryName: chosen.categoryName,
          };
        }
        return item;
      })
    );
  };

  const handleQtyPerPackChange = (si: number, newQty: number | null) => {
    setCombinedProducts(prev =>
      prev.map(item => {
        if (item.si === si) {
          const qtyVal = newQty != null ? Number(newQty) : 0;
          const cartoonVal = item.numberOfCartoon != null ? Number(item.numberOfCartoon) : 0;
          const totalQty = qtyVal * cartoonVal;
          return {
            ...item,
            qtyPerPack: newQty,
            totalQty,
          };
        }
        return item;
      })
    );
  };

  const handleNumberOfCartoonChange = (si: number, newCount: number | null) => {
    setCombinedProducts(prev =>
      prev.map(item => {
        if (item.si === si) {
          const cartoonVal = newCount != null ? Number(newCount) : 0;
          const qtyVal = item.qtyPerPack != null ? Number(item.qtyPerPack) : 0;
          const totalQty = qtyVal * cartoonVal;
          return {
            ...item,
            numberOfCartoon: newCount,
            totalQty,
          };
        }
        return item;
      })
    );
  };

  const handleRemoveProductRow = (si: number) => {
    setCombinedProducts(prev =>
      prev
        .filter(item => item.si !== si)
        .map((item, index) => ({ ...item, si: index + 1 }))
    );
  };

  const selectedProductIds = useMemo(() => {
    return new Set(
      combinedProducts
        .map(item => item.productId)
        .filter((id): id is number => id != null)
    );
  }, [combinedProducts]);

  const combinedColumns = [
    {
      title: 'SI',
      dataIndex: 'si',
      key: 'si',
      width: 55,
      align: 'center' as const,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: 'Combined Product',
      dataIndex: 'productId',
      key: 'productId',
      width: 320,
      render: (_: any, record: CombinedProductItem) => (
        <Select
          showSearch
          disabled={disabled}
          placeholder="Select Combined Product"
          value={record.productId || undefined}
          style={{ width: '100%' }}
          options={productOptions.map((opt: any) => ({
            ...opt,
            disabled: selectedProductIds.has(opt.value) && opt.value !== record.productId,
          }))}
          filterOption={(input, option) =>
            Boolean(
              option?.label?.toString().toLowerCase().includes(input.toLowerCase()) ||
              option?.searchStr?.toString().toLowerCase().includes(input.toLowerCase())
            )
          }
          onChange={(val) => handleProductChange(record.si, val)}
          allowClear
        />
      ),
    },
    {
      title: 'Qty Per Pack',
      dataIndex: 'qtyPerPack',
      key: 'qtyPerPack',
      width: 150,
      align: 'right' as const,
      render: (qtyPerPack: number | null, record: CombinedProductItem) => (
        <InputNumber
          min={1}
          controls={false}
          disabled={disabled}
          value={qtyPerPack}
          onChange={(val) => handleQtyPerPackChange(record.si, val)}
          onFocus={(e) => e.target.select()}
          placeholder="0"
          className="w-full text-right"
        />
      ),
    },
    {
      title: 'No. of Cartoon',
      dataIndex: 'numberOfCartoon',
      key: 'numberOfCartoon',
      width: 150,
      align: 'right' as const,
      render: (numberOfCartoon: number | null, record: CombinedProductItem) => (
        <InputNumber
          min={1}
          controls={false}
          disabled={disabled}
          value={numberOfCartoon}
          onChange={(val) => handleNumberOfCartoonChange(record.si, val)}
          onFocus={(e) => e.target.select()}
          placeholder="0"
          className="w-full text-right"
        />
      ),
    },
    {
      title: 'Total Qty',
      dataIndex: 'totalQty',
      key: 'totalQty',
      width: 140,
      align: 'right' as const,
      render: (totalQty: number) => (
        <span className="font-extrabold text-blue-700">
          {Number(totalQty || 0).toLocaleString()}
        </span>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 60,
      align: 'center' as const,
      render: (_: any, record: CombinedProductItem) => !disabled ? (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveProductRow(record.si)}
          size="small"
        />
      ) : <span className="text-gray-400">-</span>,
    },
  ];

  return (
    <div className={`bg-slate-50/50 p-6 rounded-xl border border-slate-200/60 shadow-sm mt-6 ${disabled ? 'opacity-90' : ''}`}>
      <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-3">
        <div className="flex items-center gap-3">
          <h3 className="font-bold text-lg text-gray-800 m-0">Combined Products</h3>
          {disabled && (
            <span className="text-xs font-semibold px-2.5 py-0.5 bg-gray-200 text-gray-700 rounded-full">
              Locked
            </span>
          )}
          {isExceeded && (
            <span className="text-xs font-semibold px-2.5 py-0.5 bg-red-100 text-red-700 rounded-full border border-red-200">
              Exceeds finished product qty ({prodQty})!
            </span>
          )}
        </div>
      </div>

      <div className="rounded-lg overflow-hidden border border-gray-200/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] bg-white">
        <Table
          className="combined-products-table"
          dataSource={combinedProducts}
          columns={combinedColumns}
          rowKey={(record, index) =>
            record.id ? `id-${record.id}` : `row-${record.si ?? index}`
          }
          pagination={false}
          bordered
          size="small"
          scroll={{ x: 800 }}
          summary={() => (
            <Table.Summary fixed>
              <Table.Summary.Row className="bg-blue-50/40 border-t border-blue-200/50 font-bold">
                <Table.Summary.Cell index={0} colSpan={2}>
                  {!disabled && (
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={handleAddProductRow}
                      className="bg-[#C58D2F] hover:bg-[#b07d28] border-none text-white font-semibold shadow-xs"
                    >
                      Add Product
                    </Button>
                  )}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} colSpan={2} className="text-right pr-4 font-bold text-slate-800">
                  <span className="text-gray-500 mr-2 font-semibold">Total Combined Qty:</span>
                  <span className={`text-base font-extrabold ${isExceeded ? 'text-red-600' : 'text-blue-800'}`}>
                    {totalCombinedQty.toLocaleString()}
                  </span>
                  {prodQty > 0 && (
                    <span className="text-xs text-gray-500 ml-1 font-normal">
                      / {prodQty.toLocaleString()}
                    </span>
                  )}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2} colSpan={2} />
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />
      </div>
    </div>
  );
};

export default CombinedProductsSection;
