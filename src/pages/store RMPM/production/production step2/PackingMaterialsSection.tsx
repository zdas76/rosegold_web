/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo, useEffect } from 'react';
import { Button, Table, Select, InputNumber, Spin } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { PackingMaterialItem } from '../ProductionCreationForm';
import { useLazyGetLastVoucherQtyQuery } from '../../../../redux/features/inventory/InventoryApi';
import { useLazyGetTotalQuantityAndUnitPriceQuery } from '../../../../redux/features/transactions/transactons.api';

interface PackingMaterialsSectionProps {
  packingMaterials: PackingMaterialItem[];
  setPackingMaterials: React.Dispatch<React.SetStateAction<PackingMaterialItem[]>>;
  packingMaterialOptions: any[];
  totalPackingQty: number;
  totalPackingTk: number;
  productQuantity: number | string | null;
  disabled?: boolean;
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
  disabled = false,
}) => {

  const [trigerLastVoucherQty] = useLazyGetLastVoucherQtyQuery();
  const [triggerGetTotalQuantity] = useLazyGetTotalQuantityAndUnitPriceQuery();

  const [liveStocks, setLiveStocks] = useState<Record<number, number | null>>({});
  const [loadingStocks, setLoadingStocks] = useState<Record<number, boolean>>({});

  // Helper to fetch live stock from /inventory/inventorytotal?itemType=pmmaterial&packingMaterialId={pmId}
  const fetchPMStock = async (pmId: number) => {
    setLoadingStocks(prev => ({ ...prev, [pmId]: true }));
    try {
      const res = await triggerGetTotalQuantity({
        itemType: 'pmmaterial',
        packingMaterialId: Number(pmId),
      }).unwrap();
      const resData = (res as any)?.data?.data ?? (res as any)?.data ?? res;
      const netQty =
        resData?.netQuantity != null
          ? Number(resData.netQuantity)
          : resData?.totalQuantity != null
            ? Number(resData.totalQuantity)
            : 0;

      setLiveStocks(prev => ({ ...prev, [pmId]: netQty }));
      setPackingMaterials(prev =>
        prev.map(p => (p.packingMaterialId === pmId ? { ...p, netQuantity: netQty } : p))
      );
      return netQty;
    } catch (err) {
      console.error('Failed to fetch PM total quantity for id:', pmId, err);
      setLiveStocks(prev => ({ ...prev, [pmId]: 0 }));
      setPackingMaterials(prev =>
        prev.map(p => (p.packingMaterialId === pmId ? { ...p, netQuantity: 0 } : p))
      );
      return 0;
    } finally {
      setLoadingStocks(prev => ({ ...prev, [pmId]: false }));
    }
  };

  // Automatically fetch live stock for all packing materials present in the table
  useEffect(() => {
    packingMaterials.forEach(item => {
      const pmId = item.packingMaterialId;
      if (pmId && liveStocks[pmId] === undefined && !loadingStocks[pmId]) {
        fetchPMStock(pmId);
      }
    });
  }, [packingMaterials, liveStocks, loadingStocks]);

  const selectedPackingIds = useMemo(() => {
    return new Set(
      packingMaterials
        .map(item => item.packingMaterialId)
        .filter((id): id is number => id != null)
    );
  }, [packingMaterials]);

  const handleAddPackingRow = async () => {
    const newRow: PackingMaterialItem = {
      si: packingMaterials.length + 1,
      packingMaterialId: null,
      name: '',
      unit: 'Pcs',
      unitId: null,
      qty: null,
      unitPrice: 0,
      perUnitQty: null,
      perUnitCost: null,
      total: 0,
    };
    setPackingMaterials(prev => [...prev, newRow]);
  };

  const handlePackingItemChange = async (si: number, packingMaterialId: number | null) => {
    if (!packingMaterialId) {
      setPackingMaterials(prev =>
        prev.map(item =>
          item.si === si
            ? {
              ...item,
              packingMaterialId: null,
              name: '',
              unit: 'Pcs',
              unitId: null,
              unitPrice: 0,
              total: 0,
              perUnitQty: null,
              perUnitCost: null,
              qty: null,
              netQuantity: null,
            }
            : item
        )
      );
      return;
    }

    const chosen = packingMaterialOptions.find((opt: any) => opt.value === packingMaterialId);
    const prodQty = Number(productQuantity) || 0;

    let lastUsedQty: number | null = null;
    let netStockQty: number | null = null;

    setLoadingStocks(prev => ({ ...prev, [packingMaterialId]: true }));

    try {
      const [lastQtyRes, totalQtyRes] = await Promise.all([
        trigerLastVoucherQty({ pmMaterialId: Number(packingMaterialId) }),
        triggerGetTotalQuantity({ itemType: 'pmmaterial', packingMaterialId: Number(packingMaterialId) }).unwrap(),
      ]);

      const fetchedLast = lastQtyRes?.data?.data?.quantityLess ?? lastQtyRes?.data?.quantityLess;
      if (fetchedLast != null && Number(fetchedLast) > 0) {
        lastUsedQty = Number(fetchedLast);
      }
      const totalData = (totalQtyRes as any)?.data?.data ?? (totalQtyRes as any)?.data ?? totalQtyRes;
      if (totalData?.netQuantity != null) {
        netStockQty = Number(totalData.netQuantity);
      } else if (totalData?.totalQuantity != null) {
        netStockQty = Number(totalData.totalQuantity);
      } else {
        netStockQty = 0;
      }
    } catch (err) {
      console.error('Failed to fetch PM info:', err);
      netStockQty = 0;
    } finally {
      setLoadingStocks(prev => ({ ...prev, [packingMaterialId]: false }));
    }

    setLiveStocks(prev => ({ ...prev, [packingMaterialId]: netStockQty }));

    setPackingMaterials(prev =>
      prev.map((item) => {
        if (item.si === si) {
          const unitPrice = chosen?.unitPrice || 0;
          const qty = lastUsedQty != null ? lastUsedQty : (item.qty != null ? Number(item.qty) : null);
          const total = Number(((qty || 0) * unitPrice).toFixed(2));
          let perUnitQty = null;
          let perUnitCost = null;

          if (prodQty > 0 && qty != null) {
            perUnitQty = roundToThree(qty / prodQty);
            perUnitCost = roundToThree(total / prodQty);
          }

          return {
            ...item,
            packingMaterialId,
            name: chosen?.label || '',
            unit: chosen?.unit || 'Pcs',
            unitId: chosen?.item?.unitId || null,
            unitPrice,
            total,
            perUnitQty,
            perUnitCost,
            qty,
            netQuantity: netStockQty,
          };
        }
        return item;
      })
    );
  };

  const handleUnitPriceChange = (si: number, newPrice: number | null) => {
    const prodQty = Number(productQuantity) || 0;
    setPackingMaterials(prev =>
      prev.map(item => {
        if (item.si === si) {
          const priceVal = newPrice != null ? Number(newPrice) : 0;
          const qtyVal = item.qty != null ? Number(item.qty) : 0;
          const total = Number((qtyVal * priceVal).toFixed(2));
          let perUnitQty = item.perUnitQty;
          let perUnitCost = item.perUnitCost;

          if (prodQty > 0) {
            perUnitQty = roundToThree(qtyVal / prodQty);
            perUnitCost = roundToThree(total / prodQty);
          } else if (perUnitQty != null && priceVal > 0) {
            perUnitCost = roundToThree(perUnitQty * priceVal);
          }

          return {
            ...item,
            unitPrice: newPrice != null ? newPrice : 0,
            total,
            perUnitQty,
            perUnitCost,
          };
        }
        return item;
      })
    );
  };

  const handleQuantityChange = (si: number, newQty: number | null) => {
    const prodQty = Number(productQuantity) || 0;
    setPackingMaterials(prev =>
      prev.map(item => {
        if (item.si === si) {
          const qtyVal = newQty != null ? Number(newQty) : 0;
          const unitPrice = item.unitPrice || 0;
          const total = Number((qtyVal * unitPrice).toFixed(2));
          let perUnitQty = item.perUnitQty;
          let perUnitCost = item.perUnitCost;

          if (prodQty > 0) {
            perUnitQty = roundToThree(qtyVal / prodQty);
            perUnitCost = roundToThree(total / prodQty);
          }

          return {
            ...item,
            qty: newQty,
            total,
            perUnitQty,
            perUnitCost,
          };
        }
        return item;
      })
    );
  };

  const handleRemovePackingRow = (si: number) => {
    setPackingMaterials(prev =>
      prev
        .filter(item => item.si !== si)
        .map((item, index) => ({ ...item, si: index + 1 }))
    );
  };

  const packingColumns = [
    {
      title: 'SI',
      dataIndex: 'si',
      key: 'si',
      width: 55,
      align: 'center' as const,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: 'Packing Material',
      dataIndex: 'packingMaterialId',
      key: 'packingMaterialId',
      width: 260,
      render: (_: any, record: PackingMaterialItem) => (
        <Select
          showSearch
          disabled={disabled}
          placeholder="Select Packing Material"
          value={record.packingMaterialId || undefined}
          style={{ width: '100%' }}
          options={packingMaterialOptions.map((opt: any) => ({
            ...opt,
            disabled: selectedPackingIds.has(opt.value) && opt.value !== record.packingMaterialId,
          }))}
          filterOption={(input, option) =>
            !!option?.label?.toString().toLowerCase().includes(input.toLowerCase())
          }
          onChange={(val) => handlePackingItemChange(record.si, val)}
        />
      ),
    },
    {
      title: 'Available Stock',
      dataIndex: 'availableStock',
      key: 'availableStock',
      width: 130,
      align: 'center' as const,
      render: (_: any, record: PackingMaterialItem) => {
        if (!record.packingMaterialId) {
          return <span className="text-slate-400">-</span>;
        }

        const pmId = record.packingMaterialId;
        const isLoading = loadingStocks[pmId];
        const stock =
          pmId && liveStocks[pmId] !== undefined
            ? liveStocks[pmId]
            : (record.netQuantity !== undefined && record.netQuantity !== null ? record.netQuantity : null);

        if (isLoading || stock === null || stock === undefined) {
          return <Spin size="small" />;
        }

        const displayStock = stock.toLocaleString();
        const hasStock = stock > 0;

        return (
          <span
            onClick={() => {
              if (hasStock && !disabled) {
                handleQuantityChange(record.si, stock);
              }
            }}
            title={hasStock && !disabled ? 'Click to use full stock' : undefined}
            className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold font-mono ${hasStock && !disabled
              ? 'bg-slate-100/80 text-slate-700 hover:bg-amber-100 hover:text-amber-800 cursor-pointer transition-colors'
              : 'bg-slate-100/80 text-slate-400'
              }`}
          >
            {displayStock} {record.unit || 'Pcs'}
          </span>
        );
      },
    },
    {
      title: 'Total Qty',
      dataIndex: 'qty',
      key: 'qty',
      width: 140,
      align: 'right' as const,
      render: (qty: number, record: PackingMaterialItem) => {
        const pmId = record.packingMaterialId;
        const maxStock =
          pmId && liveStocks[pmId] !== undefined && liveStocks[pmId] !== null
            ? liveStocks[pmId]
            : (record.netQuantity !== undefined && record.netQuantity !== null ? record.netQuantity : null);
        const hasExceeded = maxStock != null && qty != null && qty > maxStock;

        return (
          <div className="flex flex-col items-end">
            <InputNumber
              min={0}
              step={0.01}
              disabled={disabled}
              value={qty}
              status={hasExceeded ? 'error' : undefined}
              onChange={(val) => handleQuantityChange(record.si, val)}
              onFocus={(e) => e.target.select()}
              controls={false}
              precision={2}
              placeholder="0.00"
              className={`w-full text-right ${hasExceeded ? '!border-red-500 !bg-red-50/50' : ''}`}
            />
            {hasExceeded && (
              <span className="text-[10px] text-red-500 font-semibold mt-0.5 whitespace-nowrap">
                Exceeds stock ({maxStock})
              </span>
            )}
          </div>
        );
      },
    },
    {
      title: 'Unit Price (BDT)',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 140,
      align: 'right' as const,
      render: (unitPrice: number, record: PackingMaterialItem) => (
        <InputNumber
          min={0}
          step={0.01}
          disabled={disabled}
          value={unitPrice}
          onChange={(val) => handleUnitPriceChange(record.si, val)}
          onFocus={(e) => e.target.select()}
          controls={false}
          precision={2}
          placeholder="0.00"
          className="w-full text-right"
        />
      ),
    },

    {
      title: 'P.U. Qty',
      dataIndex: 'perUnitQty',
      key: 'perUnitQty',
      width: 110,
      align: 'right' as const,
      render: (val: number) => <span className="text-gray-600">{val != null ? val.toFixed(3) : '-'}</span>,
    },
    {
      title: 'P. U. Cost',
      dataIndex: 'perUnitCost',
      key: 'perUnitCost',
      width: 120,
      align: 'right' as const,
      render: (val: number) => <span className="text-gray-600">{val != null ? val.toFixed(3) : '-'}</span>,
    },
    {
      title: 'Total (BDT)',
      dataIndex: 'total',
      key: 'total',
      width: 130,
      align: 'right' as const,
      render: (value: number, record: PackingMaterialItem) => {
        const itemTotal =
          value && Number(value) > 0
            ? Number(value)
            : ((Number(record.qty) || 0) * (Number(record.unitPrice) || 0));
        return (
          <span className="font-semibold text-gray-800">{Number(itemTotal || 0).toFixed(2)}</span>
        );
      },
    },
    {
      title: 'Action',
      key: 'action',
      width: 60,
      align: 'center' as const,
      render: (_: any, record: PackingMaterialItem) => !disabled ? (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemovePackingRow(record.si)}
          size="small"
        />
      ) : <span className="text-gray-400">-</span>,
    },
  ];

  return (
    <div className={`bg-white p-5 rounded-xl border border-slate-200/80 shadow-[0_2px_12px_-3px_rgba(15,23,42,0.04)] mt-4 ${disabled ? 'opacity-90' : ''}`}>
      <div className="flex items-center justify-between mb-3.5 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <h3 className="font-bold text-sm text-slate-800 m-0 tracking-tight">Packaging Materials (PM)</h3>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/50">
            {packingMaterials.filter(p => p.packingMaterialId).length} Items
          </span>
          {disabled && (
            <span className="text-xs font-semibold px-2.5 py-0.5 bg-gray-200 text-gray-700 rounded-full">
              Locked
            </span>
          )}
        </div>
      </div>

      <div className="rounded-xl overflow-hidden border border-slate-200/80 shadow-[0_2px_12px_-3px_rgba(15,23,42,0.04)] bg-white">
        <Table
          className="packing-materials-table"
          dataSource={packingMaterials}
          columns={packingColumns}
          rowKey={(record, index) =>
            record.id ? `id-${record.id}` : `row-${record.si ?? index}`
          }
          pagination={false}
          size="small"
          scroll={{ x: 950 }}
          summary={() => (
            <Table.Summary fixed>
              <Table.Summary.Row className="bg-amber-50/40 border-t border-amber-200/50 font-bold">
                <Table.Summary.Cell index={0} colSpan={3}>
                  {!disabled && (
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={handleAddPackingRow}
                      className="bg-[#C58D2F] hover:bg-[#b07d28] border-none text-white font-semibold rounded-lg px-4 h-8 text-xs shadow-xs"
                    >
                      Add Item
                    </Button>
                  )}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} colSpan={2} className="text-right pr-4 font-bold text-slate-800">
                  <span className="text-gray-500 mr-2 font-semibold">Total Qty:</span>
                  <span className="text-sm font-bold text-slate-900">
                    {totalPackingQty.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2} colSpan={4} className="text-right pr-4 font-bold">
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
    </div>
  );
};

export default PackingMaterialsSection;
