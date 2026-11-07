/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { Form, Input, Button, DatePicker, Select, Divider, Table, message } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { toast } from "sonner";
import dayjs from "dayjs";
import { useGetAccountItemQuery } from "../../../redux/features/transactions/transactons.api";
import { useGetRowMaterialsQuery } from "../../../redux/features/rowMaterials/rowMaterials.api";
import { TAccountsItem, TBankAccount, TParty, TRawMaterial } from "../../../types/types";
import {
  useAddPurchaseReceiveMutation,
  useLazyGetPurchaseOrderByOrderNoQuery,
} from "../../../redux/features/journal/journal.api";
import { getResponse } from "../../../utils/getResponse";
import { useGetPartiesQuery } from "../../../redux/features/auth/authApi";
import { generateInvoiceNumber } from "../../../utils/generateRandomNumber";
import { useGetBankQuery } from "../../../redux/features/bank/bank.api";
import PostSubmitModal from "../../../components/shared/PostSubmitModal";
import Loading from "../../../components/shared/Loading";
import EditableInput from "../../../components/shared/EditableInput";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import {
  addReceiveVoucherDebitItem,
  setReceiveVoucherDebitItems,
  removeReceiveVoucherDebitItem,
  updateReceiveVoucherDebitUnitPrice,
  clearReceiveVoucherDebitItems,
} from "../../../redux/features/purchaseReceiveVoucher/purchaseReceiveVoucherDebitSlice";
import {
  addReceiveVoucherCreditItem,
  removeReceiveVoucherCreditItem,
  clearReceiveVoucherCreditItems,
} from "../../../redux/features/purchaseReceiveVoucher/receiveVoucherCreditSlice";

const { Option } = Select;
export type TDebitItem = {
  accountsItemId: number;
  bankId?: number; // <-- Optional field
  amount: number;
  narration?: string;
};
export type TCreditItem = {
  accountsItemId: number;
  bankId?: number;
  amount: number;
  narration?: string;
  id?: number; // Optional field for existing items
};
export type TExpenseItem = {
  key?: number;
  expItemId: number;
  expItemName: string;
  amount: number;
  narration?: string;
};

const PurchaseReceiveVoucherRM: React.FC = () => {
  const [form] = Form.useForm();
  const [debitForm] = Form.useForm();
  const [creditForm] = Form.useForm();
  const [expenseForm] = Form.useForm();
  const [expenseItems, setExpenseItems] = useState<TExpenseItem[]>([]);
  const [partyType, setPartyType] = useState<string>("SUPPLIER");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCreditLedgerName, setSelectedCreditLedgerName] = useState<string>("");
  const [searchRequisitionNo, setSearchRequisitionNo] = useState<string>("");
  const [editingKey, setEditingKey] = useState<number | null>(null);
  const dispatch = useAppDispatch();
  const debitItems = useAppSelector((state) => state.receiveVoucherDebit.debitItems);
  const creditItemsRedux = useAppSelector((state) => state.receiveVoucherCredit.creditItems);

  const [triggerGetPurchaseOrder, { isFetching: isSearchingRequisition }] =
    useLazyGetPurchaseOrderByOrderNoQuery();

  const { data: party, isLoading } = useGetPartiesQuery({
    partyType: partyType,
  });

  const parties = party?.data?.map((item: TParty) => ({
    ...item,
    key: item?.id,
    value: item?.id,
    label: item?.name,
  }));

  const { data: banks, isLoading: isBanksLoading } = useGetBankQuery({});
  const allBanks = banks?.data?.map((item: TBankAccount) => {
    return {
      key: item?.id,
      value: item?.id,
      label: `${item?.bankName} (${item?.accountNumber})`,
      ...item,
    };
  });
  const [createReceviveVoucher, { isLoading: isSubmitting }] =
    useAddPurchaseReceiveMutation();
  const { data: rawMaterialData, isLoading: isRawMaterialLoading } = useGetRowMaterialsQuery({});

  const { data: CreditAccountsData, isLoading: isCreditAccountsLoading } =
    useGetAccountItemQuery({});

  const { data: expItemsData, isLoading: isExpItemsLoading } =
    useGetAccountItemQuery({});

  const debitTotal = debitItems?.reduce((total: number, item) => total + Number(item?.amount || 0), 0) ?? 0;
  const debitTotalQty = debitItems?.reduce((total: number, item) => total + Number(item?.qty || 0), 0) ?? 0;
  const expenseTotal = expenseItems?.reduce((total: number, item) => total + Number(item?.amount || 0), 0) ?? 0;
  const totalDebit = debitTotal + expenseTotal;
  const creditTotal = creditItemsRedux?.reduce((total: number, item) => total + Number(item?.amount || 0), 0) ?? 0;

  if (
    isLoading ||
    isBanksLoading ||
    isRawMaterialLoading ||
    isCreditAccountsLoading
  ) {
    return <Loading tip="Loading Received Voucher details..." />;
  }

  const rawMaterialsMapped = rawMaterialData?.data?.map((item: any) => ({
    key: item?.id,
    value: item?.id,
    label: item?.name || item?.rawMaterialName || "",
  }));

  const creditItems = CreditAccountsData?.data?.map((item: TAccountsItem) => ({
    ...item,
    key: item.id,
    value: item.id,
    label: item.accountsItemName,
  }));

  const expItemsMapped = expItemsData?.data?.map((item: TAccountsItem) => ({
    key: item.id,
    value: item.id,
    label: item.accountsItemName,
  }));

  const handleAddExpenseItem = () => {
    expenseForm.validateFields().then((values) => {
      const selected = expItemsMapped?.find((item: any) => item?.value === values.expItemId);
      setExpenseItems((prev) => [
        ...prev,
        {
          key: Date.now(),
          expItemId: values.expItemId,
          expItemName: selected?.label || "Expense",
          amount: Number(values.expenseAmount) || 0,
          narration: values.narration || "",
        },
      ]);
      expenseForm.resetFields();
    });
  };

  const handleRemoveExpenseItem = (key: number | undefined) => {
    setExpenseItems((prev) => prev.filter((item) => item.key !== key));
  };

  const handleAddDebitItem = () => {
    debitForm.validateFields().then((values) => {
      const selected = rawMaterialsMapped?.find((item: any) => item?.value === values.rawMaterialId);
      const qty = Number(values.qty) || 0;
      const unitPrice = Number(values.unitPrice) || 0;
      dispatch(addReceiveVoucherDebitItem({
        key: Date.now(),
        rawMaterialId: values.rawMaterialId,
        rawMaterialName: selected?.label || "",
        qty,
        unitPrice,
        amount: qty * unitPrice,
        narration: values.narration || "",
      }));
      debitForm.resetFields();
    });
  };

  const handleAddCreditItem = () => {
    creditForm.validateFields().then((values) => {
      const selected = creditItems?.find((item: TAccountsItem) => item?.id === values.accountsItemId);
      dispatch(addReceiveVoucherCreditItem({
        key: Date.now(),
        accountsItemId: values.accountsItemId,
        accountsItemName: selected?.accountsItemName || "",
        amount: Number(values.amount) || 0,
        bankId: values.bankAccountId || null,
        checkOrRTGS: values.checkOrRTGS || "",
        narration: values.narration || "",
      }));
      creditForm.resetFields();
      setSelectedCreditLedgerName("");
    });
  };

  const onFinish = async (values: any) => {
    const subTotal = totalDebit;
    const grandTotal = totalDebit;

    const formattedItems = debitItems.map((item) => ({
      key: item.key,
      itemType: "RAW_MATERIAL",
      rawOrProductId: item.rawMaterialId,
      quantityAdd: item.qty,
      unitPrice: item.unitPrice,
      discount: 0,
      debitAmount: item.amount,
      narration: item.narration,
    }));

    const formattedCreditItems = creditItemsRedux.map((item) => ({
      key: item.key,
      accountsItemId: item.accountsItemId,
      balance: 0,
      amount: item.amount,
      bankId: item.bankId || null,
      checkOrRTGS: item.checkOrRTGS || "",
      narration: item.narration,
    }));

    const res = await createReceviveVoucher({
      partyOrcustomerId: values.partyId,
      date: values.date,
      invoiceNo: values.invoiceNo,
      subTotal,
      grandTotal,
      items: formattedItems,
      expenseItems: expenseItems,
      creditItem: formattedCreditItems,
    });
    const result = getResponse(res);
    if (result?.success) {
      setIsModalOpen(true);
    }
  };

  const handleNewVoucher = () => {
    form.resetFields();
    expenseForm.resetFields();
    setExpenseItems([]);
    dispatch(clearReceiveVoucherDebitItems());
    dispatch(clearReceiveVoucherCreditItems());
    setIsModalOpen(false);
  };
  // handle requisition search
  const handleRequistionSearch = async () => {
    const requisitionNo = searchRequisitionNo || form.getFieldValue("requisitionNo");
    console.log("Searching requisition:", requisitionNo);
    if (!requisitionNo) {
      toast.warning("Please enter a requisition number to search");
      message.warning("Please enter a requisition number to search");
      return;
    }
    try {
      const res = await triggerGetPurchaseOrder(requisitionNo).unwrap();
      console.log("Purchase Order Data:", res?.data);
      if (res?.data) {
        const orderItems =
          (Array.isArray(res.data) ? res.data : null) ||
          res.data.purchaseOrder ||
          res.data.purchaseOrders ||
          res.data.items ||
          res.data.inventory ||
          res.data.purchaseOrderItem ||
          [];

        const orderType = String(
          res.data?.type ||
          res.data?.orderType ||
          res.data?.itemType ||
          ""
        ).toUpperCase();

        const isProductByType = orderType.includes("PRODUCT");
        const isRawByType = orderType.includes("RAW");

        const hasProductItems = Array.isArray(orderItems) && orderItems.length > 0 && orderItems.some((item: any) =>
          Boolean(
            item?.productId ||
            item?.product_id ||
            item?.product ||
            item?.Product ||
            (item?.itemType && String(item.itemType).toUpperCase().includes("PRODUCT")) ||
            (item?.type && String(item.type).toUpperCase().includes("PRODUCT"))
          )
        );

        const hasRawItems = Array.isArray(orderItems) && orderItems.length > 0 && orderItems.some((item: any) =>
          Boolean(
            item?.rawId ||
            item?.rawMaterialId ||
            item?.raWMaterialId ||
            item?.raw_material_id ||
            item?.raWMaterial ||
            item?.rawMaterial ||
            item?.unit ||
            (item?.itemType && String(item.itemType).toUpperCase().includes("RAW")) ||
            (item?.type && String(item.type).toUpperCase().includes("RAW")) ||
            rawMaterialsMapped?.some((rm: any) =>
              (item?.rawId != null && (rm.value == item.rawId || String(rm.value) === String(item.rawId))) ||
              (item?.itemName && rm.label?.trim().toLowerCase() === String(item.itemName).trim().toLowerCase())
            )
          )
        );

        const isProduct = isProductByType || hasProductItems || (!isRawByType && !hasRawItems);

        if (isProduct) {
          toast.warning(
            "This requisition is for Product, not Raw Material. Auto form fill skipped."
          );
          message.warning(
            "This requisition is for Product, not Raw Material. Auto form fill skipped."
          );
          return;
        }

        if (res.data.partyId) {
          form.setFieldsValue({ partyId: res.data.partyId });
        }
        if (res.data.orderNo) {
          form.setFieldsValue({ requisitionNo: res.data.orderNo });
          setSearchRequisitionNo(res.data.orderNo);
        }
        if (res.data.date) {
          form.setFieldsValue({ date: dayjs(res.data.date) });
        }

        if (Array.isArray(orderItems) && orderItems.length > 0) {
          const mappedDebitItems = orderItems.map((item: any, index: number) => {
            const rawMaterialId =
              item?.rawId ??
              item?.rawMaterialId ??
              item?.raw_material_id ??
              item?.raWMaterial?.id ??
              item?.rawMaterial?.id ??
              item?.rawOrProductId ??
              null;

            const nameFromItem =
              item?.raWMaterial?.name ||
              item?.rawMaterial?.name ||
              item?.rawMaterialName ||
              item?.itemName ||
              item?.item_name ||
              item?.name ||
              "";

            const matchedRM = rawMaterialsMapped?.find((rm: any) => {
              if (
                rawMaterialId != null &&
                (rm.value == rawMaterialId || String(rm.value) === String(rawMaterialId))
              ) {
                return true;
              }
              if (
                nameFromItem &&
                rm.label &&
                rm.label.trim().toLowerCase() === nameFromItem.trim().toLowerCase()
              ) {
                return true;
              }
              return false;
            });

            const resolvedRawMaterialId = rawMaterialId != null
              ? Number(rawMaterialId)
              : matchedRM?.value != null
                ? Number(matchedRM.value)
                : null;

            const rawMaterialName = nameFromItem || matchedRM?.label || "";
            const qty = Number(item?.quantity ?? item?.qty ?? 0);
            const unitPrice = Number(item?.unitPrice ?? 0);
            const amount = Number(
              item?.amount !== undefined && item?.amount !== null && item?.amount !== 0
                ? item.amount
                : qty * unitPrice
            );

            return {
              key: item?.id ? Number(item.id) : Date.now() + index,
              rawMaterialId: resolvedRawMaterialId || null,
              rawMaterialName: rawMaterialName,
              qty,
              unitPrice,
              amount,
              narration: item?.narration || "",
            };
          });
          dispatch(setReceiveVoucherDebitItems(mappedDebitItems));
        }
        toast.success(res.message || "Purchase Order retrieved successfully");
        message.success(res.message || "Purchase Order retrieved successfully");
      } else {
        toast.warning("No purchase order found with this requisition number");
        message.warning("No purchase order found with this requisition number");
      }
    } catch (error: any) {
      console.error("Error fetching purchase order:", error);
      toast.error(error?.data?.message || "Failed to fetch purchase order");
      message.error(error?.data?.message || "Failed to fetch purchase order");
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_4px_24px_-2px_rgba(15,23,42,0.06),0_1px_3px_0_rgba(15,23,42,0.04)] p-6 space-y-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-1 border-b border-slate-100">
        <div>
          <h1 className="text-lg font-bold text-slate-800 m-0 tracking-tight">Purchase Receive - Raw Material</h1>
          <p className="text-xs text-slate-400 m-0 mt-0.5">Record and reconcile raw material purchase receive vouchers</p>
        </div>
        <div className="flex items-center gap-2 max-w-sm w-full">
          <Input
            placeholder="Enter requisition number"
            value={searchRequisitionNo}
            onChange={(e) => setSearchRequisitionNo(e.target.value)}
            onPressEnter={handleRequistionSearch}
            className="rounded-lg text-xs"
          />
          <Button
            type="primary"
            disabled={isSearchingRequisition}
            loading={isSearchingRequisition}
            onClick={handleRequistionSearch}
            className="bg-[#C58D2F] hover:bg-[#b07d28] border-none text-white font-semibold rounded-lg px-4 h-8 text-xs shadow-xs"
          >
            Search
          </Button>
        </div>
      </div>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          date: dayjs(new Date()),
        }}>
        <div className="p-4 rounded-xl bg-slate-50/60 border border-slate-200/80 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.03)] grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
          <Form.Item
            name="partyId"
            label="Supplier"
            rules={[{ required: true, message: "Please select a supplier" }]}>
            <Select placeholder="Select supplier" disabled={isLoading}>
              {partyType &&
                parties?.map((item: TParty) => (
                  <Option key={item?.id} value={item?.id}>
                    {item?.name}
                  </Option>
                ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="requisitionNo"
            label="Requisition No"
            rules={[{ required: true, message: "Please enter requisition number" }]}>
            <Input placeholder="Enter requisition number" />
          </Form.Item>
          <Form.Item
            name="invoiceNo"
            label="Invoice No"
            rules={[{ required: true, message: "Please enter invoice number" }]}>
            <Input placeholder="Enter invoice number" />
          </Form.Item>
          <Form.Item
            name="date"
            label="Date"
            rules={[{ required: true, message: "Please select date" }]}>
            <DatePicker className="w-full" />
          </Form.Item>
        </div>

        {/*-------------------------- Debit Items --------------------------------------------- */}
        <div className="mb-5 bg-white border border-slate-200/80 rounded-xl p-4 pt-1 shadow-[0_2px_12px_-3px_rgba(15,23,42,0.04)]">
          <Divider orientation="left" style={{ paddingTop: "10px" }}>
            Debit Items
          </Divider>
          <Form component="div" form={debitForm} layout="vertical" className="mb-3 px-3" onValuesChange={(changed, allValues) => {
            if (changed.qty !== undefined || changed.unitPrice !== undefined) {
              const qty = Number(allValues.qty) || 0;
              const unitPrice = Number(allValues.unitPrice) || 0;
              debitForm.setFieldsValue({ amount: qty * unitPrice });
            }
          }}>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <Form.Item name="rawMaterialId" label="Raw Material" rules={[{ required: true, message: "Required" }]}>
                <Select
                  showSearch
                  placeholder="Select raw material"
                  filterOption={(input, option) =>
                    (option?.label ?? "").toString().toLowerCase().includes(input.toLowerCase())
                  }
                  options={rawMaterialsMapped?.map((opt: any) => ({
                    ...opt,
                    disabled: debitItems?.some((di: any) => String(di.rawMaterialId) === String(opt.value))
                  }))}
                />
              </Form.Item>
              <Form.Item name="qty" label="Qty" rules={[{ required: true, message: "Required" }]}>
                <Input type="number" placeholder="Qty" min={0} />
              </Form.Item>
              <Form.Item name="unitPrice" label="Unit Price" rules={[{ required: true, message: "Required" }]}>
                <Input type="number" placeholder="Unit Price" min={0} />
              </Form.Item>
              <Form.Item name="amount" label="Total">
                <Input type="number" placeholder="Total" readOnly style={{ backgroundColor: "#f5f5f5" }} />
              </Form.Item>
              <Form.Item label=" ">
                <Button onClick={handleAddDebitItem} icon={<PlusOutlined />} className="bg-[#C58D2F] hover:bg-[#b07d28] border-none text-white font-semibold rounded-lg text-xs h-8 shadow-xs w-full">
                  Add
                </Button>
              </Form.Item>
            </div>
          </Form>
          {debitItems.length > 0 && (
            <Table
              dataSource={debitItems}
              rowKey="key"
              columns={[
                {
                  title: "Raw Material",
                  dataIndex: "rawMaterialName",
                  render: (value: string, record: any) =>
                    value ||
                    record?.itemName ||
                    rawMaterialsMapped?.find(
                      (rm: any) =>
                        String(rm.value) === String(record.rawMaterialId || record.rawOrProductId)
                    )?.label ||
                    "-",
                },
                {
                  title: "Qty",
                  dataIndex: "qty",
                },
                {
                  title: "Unit Price",
                  dataIndex: "unitPrice",
                  render: (value: number, record: any) => {
                    const isEditing = editingKey === record.key;
                    if (isEditing) {
                      return (
                        <EditableInput
                          type="number"
                          initialValue={record.unitPrice}
                          onSave={(newVal) => {
                            const newPrice = Math.max(0, parseFloat(newVal) || 0);
                            dispatch(
                              updateReceiveVoucherDebitUnitPrice({
                                key: record.key,
                                unitPrice: newPrice,
                              })
                            );
                            setEditingKey(null);
                          }}
                          onCancel={() => setEditingKey(null)}
                        />
                      );
                    }
                    return (
                      <div
                        onDoubleClick={() => {
                          setEditingKey(record.key);
                        }}
                        className="cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors inline-block select-none"
                        title="Double-click to edit"
                      >
                        {Number(value || 0).toFixed(2)}
                      </div>
                    );
                  },
                },
                {
                  title: "Adjusted Unit R.",
                  key: "adjustedUnitR",
                  render: (_, record) => {
                    if (debitTotalQty === 0) return Number(record.unitPrice).toFixed(2);
                    const expPerUnit = expenseTotal / debitTotalQty;
                    return (Number(record.unitPrice) + expPerUnit).toFixed(2);
                  }
                },
                {
                  title: "Total",
                  dataIndex: "amount",
                  render: (value: number) => value?.toFixed(2),
                },

                {
                  title: "Ad. Total",
                  key: "adTotal",
                  render: (_, record) => {
                    if (debitTotalQty === 0) return Number(record.amount).toFixed(2);
                    const expPerUnit = expenseTotal / debitTotalQty;
                    const adjUnitPrice = Number(record.unitPrice) + expPerUnit;
                    return (Number(record.qty) * adjUnitPrice).toFixed(2);
                  }
                },
                {
                  title: "Narration",
                  dataIndex: "narration",
                },
                {
                  title: "Actions",
                  render: (_, record) => (
                    <DeleteOutlined
                      onClick={() => dispatch(removeReceiveVoucherDebitItem(record.key))}
                      className="text-red-500 cursor-pointer"
                    />
                  ),
                },
              ]}
              pagination={false}
            />
          )}
          <div className="flex justify-between items-center font-bold mt-2 text-base">
            <div>Total Qty: {debitTotalQty}</div>
            <div>Total Debit: {debitTotal.toFixed(2)}</div>
          </div>
        </div>

        {/*-------------------------- Expense Items --------------------------------------------- */}
        <div className="mb-5 bg-white border border-slate-200/80 rounded-xl p-4 pt-1 shadow-[0_2px_12px_-3px_rgba(15,23,42,0.04)]">
          <Divider orientation="left" style={{ paddingTop: "10px" }}>
            Expense
          </Divider>
          <Form component="div" form={expenseForm} layout="vertical" className="mb-3 px-3">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <Form.Item
                name="expItemId"
                label="Select exp item"
                rules={[{ required: true, message: "Required" }]}
              >
                <Select
                  placeholder="Select exp item"
                  showSearch
                  optionFilterProp="label"
                  options={expItemsMapped}
                />
              </Form.Item>
              <Form.Item
                name="expenseAmount"
                label="Amount"
                rules={[{ required: true, message: "Required" }]}
              >
                <Input type="number" placeholder="Amount" min={0} />
              </Form.Item>
              <Form.Item name="narration" label="Narration">
                <Input placeholder="Narration (optional)" />
              </Form.Item>
              <Form.Item label=" ">
                <Button
                  onClick={handleAddExpenseItem}
                  icon={<PlusOutlined />}
                  className="bg-[#C58D2F] hover:bg-[#b07d28] border-none text-white font-semibold rounded-lg text-xs h-8 shadow-xs w-full"
                >
                  Add
                </Button>
              </Form.Item>
            </div>
          </Form>
          {expenseItems.length > 0 && (
            <Table
              dataSource={expenseItems}
              rowKey="key"
              columns={[
                {
                  title: "Exp Item",
                  dataIndex: "expItemName",
                },
                {
                  title: "Amount",
                  dataIndex: "amount",
                  render: (value: number) => Number(value || 0).toFixed(2),
                },
                {
                  title: "Narration",
                  dataIndex: "narration",
                },
                {
                  title: "Actions",
                  render: (_, record) => (
                    <DeleteOutlined
                      onClick={() => handleRemoveExpenseItem(record.key)}
                      className="text-red-500 cursor-pointer"
                    />
                  ),
                },
              ]}
              pagination={false}
            />
          )}
          <div className="text-right font-bold mt-2 text-base">
            <b>Total Expense: {expenseTotal.toFixed(2)}</b>
          </div>
        </div>

        {/*-------------------------- Credit Items --------------------------------------------- */}
        <div className="mb-5 bg-white shadow rounded-lg p-3 pt-0">
          <Divider orientation="left" style={{ paddingTop: "10px" }}>
            Credit Items
          </Divider>
          <Form component="div" form={creditForm} layout="vertical" className="mb-3 px-3">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <Form.Item name="accountsItemId" label="Ledger Head" rules={[{ required: true, message: "Required" }]}>
                <Select
                  placeholder="Select ledger head"
                  onChange={(value) => {
                    const selected = creditItems?.find((item: TAccountsItem) => item?.id === value);
                    setSelectedCreditLedgerName(selected?.accountsItemName || "");
                    creditForm.setFieldsValue({ bankAccountId: undefined });
                  }}
                >
                  {creditItems?.map((item: TAccountsItem) => (
                    <Option key={item?.id} value={item?.id}>
                      {item?.accountsItemName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              {selectedCreditLedgerName?.toLowerCase() === "bank" && (
                <Form.Item name="bankAccountId" label="Bank Account" rules={[{ required: true, message: "Required" }]}>
                  <Select placeholder="Select bank account">
                    {allBanks?.map((item: any) => (
                      <Option key={item?.key} value={item?.value}>
                        {item?.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              )}
              <Form.Item name="amount" label="Amount" rules={[{ required: true, message: "Required" }]}>
                <Input type="number" placeholder="Amount" min={0} />
              </Form.Item>
              <Form.Item name="checkOrRTGS" label="Check/RTGS">
                <Input type="text" placeholder="Check/RTGS" />
              </Form.Item>
              <Form.Item name="narration" label="Narration">
                <Input placeholder="Narration (optional)" />
              </Form.Item>

              <Form.Item label=" ">
                <Button onClick={handleAddCreditItem} icon={<PlusOutlined />} className="bg-[#C58D2F] hover:bg-[#b07d28] border-none text-white font-semibold rounded-lg text-xs h-8 shadow-xs w-full">
                  Add
                </Button>
              </Form.Item>
            </div>
          </Form>
          {creditItemsRedux.length > 0 && (
            <Table
              dataSource={creditItemsRedux}
              rowKey="key"
              columns={[
                {
                  title: "Credit Item",
                  dataIndex: "accountsItemName",
                },
                {
                  title: "Amount",
                  dataIndex: "amount",
                  render: (value: number) => value?.toFixed(2),
                },
                {
                  title: "Check/RTGS",
                  dataIndex: "checkOrRTGS",
                },
                {
                  title: "Narration",
                  dataIndex: "narration",
                },
                {
                  title: "Actions",
                  render: (_, record) => (
                    <DeleteOutlined
                      onClick={() => dispatch(removeReceiveVoucherCreditItem(record.key))}
                      className="text-red-500 cursor-pointer"
                    />
                  ),
                },
              ]}
              pagination={false}
            />
          )}
          <div className="text-right font-bold mt-2 text-base">
            Total Credit: {creditTotal}
          </div>
        </div>

        <div className="flex items-center justify-end gap-4">
          <div className="">
            {creditTotal !== debitTotal ? (
              <h3 className="font-bold text-sm text-slate-900">
                Debit or credit Difference{" "}
                {creditTotal - (debitTotal + expenseTotal)}
              </h3>
            ) : (
              <p
                className="text-green-600"
                style={{ fontSize: "15px", padding: "5px" }}
              >
                Procced
              </p>
            )}
          </div>
          <Button
            type="primary"
            size="middle"
            htmlType="submit"
            loading={isSubmitting}
            className="bg-[#C58D2F] hover:bg-[#b07d28] border-none text-white font-semibold rounded-lg px-7 h-10 text-xs shadow-[0_3px_12px_rgba(197,141,47,0.3)] hover:shadow-[0_4px_16px_rgba(197,141,47,0.45)] transition-all"
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </Form>
      <PostSubmitModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onNewVoucher={handleNewVoucher}
      />
    </div>
  );
};

export default PurchaseReceiveVoucherRM;
