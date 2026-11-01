/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo } from 'react';
import { useGetTotalQuantityAndUnitPriceQuery } from '../../../../redux/features/transactions/transactons.api';
import { Button, Table, Select, InputNumber, Tag, message } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

export interface CombinedProductItem {
  id?: number | string;
  si: number;
  productId: number | null | undefined;
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
  oldProductQty?: number | null;
  onStockChange?: (qty: number | null) => void;
  disabled?: boolean;
  selectedProduct?: any;
}

const CombinedProductsSection: React.FC<CombinedProductsSectionProps> = ({
  combinedProducts,
  setCombinedProducts,
  productsData,
  oldProductQty,
  onStockChange,
  disabled = false,
  selectedProduct,
}) => {
  const currentProductId = selectedProduct?.id ? Number(selectedProduct.id) : undefined;
  const { data: stockData } = useGetTotalQuantityAndUnitPriceQuery(
    { itemType: "product", productId: currentProductId },
    { skip: !currentProductId || disabled, refetchOnMountOrArgChange: true }
  );

  const fetchedStockQty = stockData?.data?.netQuantity;
  const effectiveStockQty = fetchedStockQty !== undefined ? fetchedStockQty : (oldProductQty ?? null);

  useEffect(() => {
    if (onStockChange && fetchedStockQty !== undefined) {
      onStockChange(fetchedStockQty);
    }
  }, [fetchedStockQty, onStockChange]);

  const mainProductId = selectedProduct?.id;
  const targetSubCategoryName = selectedProduct?.subCategory?.subCategoryName;

  const productOptions = useMemo(() => {
    const list = Array.isArray(productsData?.data) ? productsData.data : [];

    // Filter products whose subCategory matches the main product's subCategory
    const filteredList = targetSubCategoryName
      ? list.filter((p: any) => p?.subCategory?.subCategoryName === targetSubCategoryName)
      : list;

    return filteredList.map((p: any) => {
      const catName = p?.subCategory?.category?.categoryName || p?.category?.categoryName || '';
      const isMain = mainProductId != null && p.id === mainProductId;

      return {
        value: p.id,
        label: `${p.name}${catName ? ` (${catName})` : ''}${isMain ? ' (Main Product)' : ''}`,
        searchStr: `${p.name} ${catName}`.toLowerCase(),
        name: p.name,
        categoryName: catName,
        isMainProduct: isMain,
      };
    });
  }, [productsData, targetSubCategoryName, mainProductId]);

  const totalCombinedQty = useMemo(() => {
    return combinedProducts.reduce((sum, item) => sum + (Number(item.totalQty) || 0), 0);
  }, [combinedProducts]);

  const maxAllowedQty = effectiveStockQty != null ? Number(effectiveStockQty) : 0;
  const isExceeded = effectiveStockQty != null && totalCombinedQty > maxAllowedQty;

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
    if (mainProductId != null && Number(productId) === Number(mainProductId)) {
      message.warning('The main production product cannot be selected as a combined product.');
      return;
    }
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
      render: (_: any, record: CombinedProductItem) => {
        // If current record already has a productId not in filtered productOptions, preserve it in options
        const currentOptions =
          record.productId && !productOptions.some((opt: any) => opt.value === record.productId)
            ? [
              ...productOptions,
              {
                value: record.productId,
                label: record.productName || `Product #${record.productId}`,
                searchStr: (record.productName || '').toLowerCase(),
                name: record.productName,
                categoryName: record.categoryName,
                isMainProduct: false,
              },
            ]
            : productOptions;

        return (
          <Select
            showSearch
            disabled={disabled}
            placeholder="Select Combined Product"
            value={record.productId || undefined}
            style={{ width: '100%' }}
            options={currentOptions.map((opt: any) => ({
              ...opt,
              disabled:
                Boolean(opt.isMainProduct) ||
                (selectedProductIds.has(opt.value) && opt.value !== record.productId),
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
        );
      },
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
        <div className="flex items-center gap-3 flex-wrap w-full">
          <h3 className="font-bold text-lg text-gray-800 m-0">Combined Products</h3>
          {targetSubCategoryName && (
            <Tag color="gold" className="font-semibold text-xs py-0.5 px-2.5 rounded-full border border-amber-200 m-0">
              Subcategory: {targetSubCategoryName}
            </Tag>
          )}
          {disabled && (
            <span className="text-xs font-semibold px-2.5 py-0.5 bg-gray-200 text-gray-700 rounded-full">
              Locked
            </span>
          )}
          {isExceeded && (
            <span className="text-xs font-semibold px-2.5 py-0.5 bg-red-100 text-red-700 rounded-full border border-red-200">
              Exceeds available product qty ({effectiveStockQty ?? 0})!
            </span>
          )}
          <div className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-700 rounded-full border border-slate-200/70 ml-auto font-mono">
            Available : {effectiveStockQty ?? 0}
          </div>
        </div>
      </div>
      <div className={`rounded-lg overflow-hidden border ${isExceeded ? 'border-red-300' : 'border-gray-200/80'} shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] bg-white`}>
        <Table
          className="combined-products-table"
          dataSource={combinedProducts}
          columns={combinedColumns}
          rowKey={(record, index) =>
            record.id ? `id-${record.id}` : `row-${record.si ?? index}`
          }
          pagination={false}
          size="small"
          scroll={{ x: 800 }}
          summary={() => (
            <Table.Summary fixed>
              <Table.Summary.Row className={`${isExceeded ? 'bg-red-50/40 border-t border-red-200/60' : 'bg-blue-50/40 border-t border-blue-200/50'} font-bold`}>
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
                  {effectiveStockQty != null && (
                    <span className="text-xs text-gray-500 ml-1 font-normal">
                      / {Number(effectiveStockQty).toLocaleString()}
                    </span>
                  )}
                  {isExceeded && (
                    <div className="text-xs text-red-500 font-semibold mt-0.5">
                      Total combined qty cannot exceed available qty ({effectiveStockQty ?? 0})
                    </div>
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
