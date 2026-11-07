/* eslint-disable @typescript-eslint/no-explicit-any */
import { useGetRawMaterialStockReportQuery } from '../../../redux/features/rowMaterials/rowMaterials.api';
import { useGetProductionIngredientsQuery } from '../../../redux/features/productionIngredient/productionIngredient.api';
import { useGetProductsQuery } from '../../../redux/features/product/product.api';
import { Table, Tag, DatePicker, Select, Button } from "antd";
import type { ColumnsType } from "antd/es/table";
import { TRawMaterialStockReport } from '../../../types/types';
import { Link } from 'react-router';
import { useState, useMemo } from 'react';
import { WarningOutlined, FilterOutlined, ReloadOutlined } from '@ant-design/icons';

export const MaterialStockReport = () => {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

  // Queries
  const { data: stockData, isLoading, isFetching } = useGetRawMaterialStockReportQuery({ startDate, endDate });
  const { data: ingredientsData, isLoading: isIngredientsLoading } = useGetProductionIngredientsQuery({});
  const { data: productsData } = useGetProductsQuery({});

  // Parse recipes from ingredient API
  const rawIngredientsList = useMemo(() => {
    return Array.isArray(ingredientsData?.data)
      ? ingredientsData.data
      : Array.isArray((ingredientsData as any)?.data?.data)
        ? (ingredientsData as any).data.data
        : [];
  }, [ingredientsData]);

  // Product options available in recipes
  const productOptions = useMemo(() => {
    const options: { label: string; value: number }[] = [];
    const seen = new Set<number>();

    rawIngredientsList.forEach((ing: any) => {
      const prodId = Number(ing.productId || ing.product?.id);
      if (prodId && !seen.has(prodId)) {
        seen.add(prodId);
        const prodName =
          ing.product?.name ||
          productsData?.data?.find((p: any) => Number(p.id) === prodId)?.name ||
          `Product #${prodId}`;
        options.push({ label: prodName, value: prodId });
      }
    });

    return options.sort((a, b) => a.label.localeCompare(b.label));
  }, [rawIngredientsList, productsData]);

  // Selected product's raw material IDs from recipe
  const selectedProductRawMaterialIds = useMemo(() => {
    if (!selectedProductId) return null;
    const ids = new Set<number>();

    rawIngredientsList
      .filter((ing: any) => Number(ing.productId || ing.product?.id) === Number(selectedProductId))
      .forEach((ing: any) => {
        const materials = ing.ingredientRawMaterial || ing.ingredientRawMaterials || ing.rawMaterials || [];
        materials.forEach((m: any) => {
          const rawId = Number(m.rawId ?? m.rawMaterials?.id ?? m.id);
          if (rawId) ids.add(rawId);
        });
      });

    return ids;
  }, [selectedProductId, rawIngredientsList]);

  // Process, filter by product, and sort: items with qtyBalance <= 10 at top
  const processedData = useMemo(() => {
    const rawList = stockData?.data || [];

    let items = rawList.map((item: TRawMaterialStockReport) => {
      const addQty = item.total?._sum?.quantityAdd || 0;
      const lessQty = item.total?._sum?.quantityLess || 0;
      const qtyBalance = addQty - lessQty;
      const rawAlert = (item.rawMaterial as any)?.alertQuantity ?? (item as any)?.alertQuantity;
      const hasAlertQty = rawAlert !== undefined && rawAlert !== null && rawAlert !== "";
      const alertThreshold = hasAlertQty ? Number(rawAlert) : null;
      const isLowStock = alertThreshold !== null && qtyBalance <= alertThreshold;

      return {
        ...item.rawMaterial,
        total: item.total,
        qtyBalance,
        alertQuantity: alertThreshold,
        isLowStock,
      };
    });

    // Filter by product's recipe raw materials
    if (selectedProductRawMaterialIds) {
      items = items.filter((rm: any) => selectedProductRawMaterialIds.has(Number(rm.id)));
    }

    // Sort: items with qtyBalance <= 10 stay at the top (ascending by balance)
    items.sort((a: any, b: any) => {
      if (a.isLowStock && !b.isLowStock) return -1;
      if (!a.isLowStock && b.isLowStock) return 1;
      if (a.isLowStock && b.isLowStock) {
        return a.qtyBalance - b.qtyBalance;
      }
      return 0;
    });

    // Re-index serial keys
    return items.map((item: any, idx: number) => ({
      ...item,
      key: idx + 1,
    }));
  }, [stockData, selectedProductRawMaterialIds]);

  const lowStockCount = useMemo(() => {
    return processedData.filter((item: any) => item.isLowStock).length;
  }, [processedData]);

  const columns: ColumnsType<any> = [
    {
      title: "SL",
      dataIndex: "key",
      key: "key",
      width: 60,
      align: "center",
    },
    {
      title: "Item",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <div className="py-0.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-gray-800 leading-tight">{text}</span>
            {record.isLowStock && (
              <Tag color="error" className="m-0 text-[10px] font-bold uppercase px-1 py-0 leading-none">
                Low Stock
              </Tag>
            )}
          </div>
          {record?.description && (
            <p className="text-[11px] text-gray-400 line-clamp-1 leading-tight m-0 mt-0.5">{record.description}</p>
          )}
        </div>
      ),
    },
    {
      title: "Add Qty",
      key: "addQty",
      align: "right",
      render: (_, record) => (
        <span className="font-medium text-gold-600">
          {(record.total?._sum?.quantityAdd || 0).toLocaleString()}
        </span>
      ),
    },
    {
      title: "Less Qty",
      key: "lessQty",
      align: "right",
      render: (_, record) => (
        <span className="font-medium text-red-600">
          {(record.total?._sum?.quantityLess || 0).toLocaleString()}
        </span>
      ),
    },
    {
      title: "QTY Balance",
      key: "currentStock",
      align: "right",
      render: (_, record) => {
        const balance = record.qtyBalance;
        if (record.isLowStock) {
          return (
            <div className="flex items-center justify-end gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
              </span>
              <span className="font-extrabold text-red-600 text-sm">
                {balance.toLocaleString()}
              </span>
            </div>
          );
        }
        return (
          <span className="font-bold text-gray-800">
            {balance.toLocaleString()}
          </span>
        );
      },
    },
    {
      title: "Debit Amount",
      dataIndex: "status",
      key: "status",
      align: "right",
      render: (_, record) => (
        <span className="font-medium text-gold-600">
          {(record.total?._sum?.debitAmount || 0).toLocaleString()}
        </span>
      ),
    },
    {
      title: "Credit Amount",
      dataIndex: "status",
      key: "status",
      align: "right",
      render: (_, record) => (
        <span className="font-medium text-red-600">
          {(record.total?._sum?.creditAmount || 0).toLocaleString()}
        </span>
      ),
    },
    {
      title: "Balance",
      key: "value",
      align: "right",
      render: (_, record) => (
        <span className="font-semibold text-green-600">
          ৳ {((record.total?._sum?.debitAmount || 0) - (record.total?._sum?.creditAmount || 0)).toLocaleString()}
        </span>
      ),
    },
    {
      title: "Action",
      key: "action",
      align: "right",
      render: (_, record) => (
        <Link
          to={`/dashboard/row-material/${record.id}`}
          className="text-gold-600 hover:underline font-bold"
        >
          Details
        </Link>
      ),
    },
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
      {/* Blinking Red Animation Styles for Low Stock Rows & Compact Padding */}
      <style>{`
        @keyframes redBlinkBg {
          0%, 100% {
            background-color: rgba(254, 226, 226, 0.95);
          }
          50% {
            background-color: rgba(254, 202, 202, 0.4);
          }
        }
        .row-low-stock {
          animation: redBlinkBg 1.5s infinite ease-in-out !important;
        }
        .row-low-stock td {
          background-color: inherit !important;
        }
        .compact-raw-table .ant-table-tbody > tr > td {
          padding: 5px 10px !important;
          font-size: 12.5px !important;
          line-height: 1.3 !important;
        }
        .compact-raw-table .ant-table-thead > tr > th {
          padding: 7px 10px !important;
          font-size: 12.5px !important;
        }
      `}</style>

      {/* Header & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-gray-100">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            Materials Stock Report
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Real-time stock balance & movement tracking
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Product Filter from Ingredient API */}
          <Select
            allowClear
            showSearch
            placeholder="Filter by Product (Recipe)"
            style={{ width: 230 }}
            value={selectedProductId}
            onChange={(val) => setSelectedProductId(val ?? null)}
            options={productOptions}
            loading={isIngredientsLoading}
            filterOption={(input, option) =>
              String(option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
          />

          {/* Date Range Filters */}
          <DatePicker
            placeholder="Start Date"
            onChange={(e) => setStartDate(e?.format("YYYY-MM-DD") || "")}
          />
          <DatePicker
            placeholder="End Date"
            onChange={(e) => setEndDate(e?.format("YYYY-MM-DD") || "")}
          />

          {(selectedProductId || startDate || endDate) && (
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                setSelectedProductId(null);
                setStartDate("");
                setEndDate("");
              }}
              title="Reset Filters"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Status Badges: Low Stock Alert & Filter Active Tag */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {selectedProductId && (
            <Tag color="gold" className="font-medium flex items-center gap-1">
              <FilterOutlined /> Product Filter:{" "}
              {productOptions.find((p) => p.value === selectedProductId)?.label || `Product #${selectedProductId}`}
              <span className="ml-1 text-xs opacity-75">
                ({processedData.length} materials)
              </span>
            </Tag>
          )}
        </div>

        {lowStockCount > 0 && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-3 py-1 rounded-md text-xs font-semibold animate-pulse">
            <WarningOutlined className="text-red-600" />
            <span>
              Low Stock Warning: <strong>{lowStockCount}</strong> raw material{lowStockCount > 1 ? "s" : ""} at or below Alert Quantity
            </span>
          </div>
        )}
      </div>

      {/* Table */}
      <Table
        size="small"
        loading={isLoading || isFetching}
        columns={columns}
        dataSource={processedData}
        rowKey="id"
        rowClassName={(record) => (record.isLowStock ? 'row-low-stock' : '')}
        pagination={{ pageSize: 15 }}
        className="compact-raw-table rounded-lg overflow-hidden border border-gray-100"
      />
    </div>
  );
};
