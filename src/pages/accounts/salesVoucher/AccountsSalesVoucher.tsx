/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from "react";
import {
  Form,
  Input,
  Button,
  DatePicker,
  Select,
  InputNumber,
  Table,
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { useGetProductsQuery } from "../../../redux/features/product/product.api";
import { useGetAccountItemQuery, useLazyGetTotalQuantityAndUnitPriceQuery } from "../../../redux/features/transactions/transactons.api";
import { TAccountsItem, TBankAccount, TCustomer, TProduct, TVendor } from "../../../types/types";
import { useGetPartiesQuery } from "../../../redux/features/auth/authApi";
import { useCreateSalesVoucherMutation } from "../../../redux/features/journal/journal.api";
import { useGetBankQuery } from "../../../redux/features/bank/bank.api";
import { getResponse } from "../../../utils/getResponse";
import { useLazyGetCustomerByPhoneQuery } from "../../../redux/features/OthersApi/othersApi";
import PostSubmitModal from "../../../components/shared/PostSubmitModal";
import Loading from "../../../components/shared/Loading";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import {
  addSalesDebitItem,
  removeSalesDebitItem,
  clearSalesDebitItems,
} from "../../../redux/features/accountsSales/salesDebitSlice";
import {
  addSalesCreditItem,
  removeSalesCreditItem,
  clearSalesCreditItems,
} from "../../../redux/features/accountsSales/salesCreditSlice";
import dayjs from "dayjs";

const { Option } = Select;
const AccountsSalesVoucher = () => {
  const [triggerGetTotalQuantity] = useLazyGetTotalQuantityAndUnitPriceQuery();
  const [customer, setCustomer] = useState<TCustomer[] | null>(null);
  const [form] = Form.useForm();
  const [debitForm] = Form.useForm();
  const [creditForm] = Form.useForm();
  const [selectedPartyType, setSelectedPartyType] = useState("");
  const { data, isLoading } = useGetBankQuery({});
  const [getCustomer] = useLazyGetCustomerByPhoneQuery();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dispatch = useAppDispatch();
  const debitItems = useAppSelector((state) => state.salesDebit.items);
  const creditItems = useAppSelector((state) => state.salesCredit.creditItems);

  const banks = data?.data?.map((item: TBankAccount, idx: number) => {
    return {
      key: idx,
      label: `${item?.bankName} (${item?.accountNumber})`,
      value: item?.id,
      ...item,
    };
  });
  const [addvoucher, { isLoading: isSubmitting }] = useCreateSalesVoucherMutation();
  const { data: accountItem, isLoading: isAccountItemLoading } = useGetAccountItemQuery({});
  const { data: party, isLoading: isPartiesLoading } = useGetPartiesQuery({ partyType: "DISTRIBUTOR" });
  const { data: product, isLoading: isProductLoading } = useGetProductsQuery({});

  const getDebitTotal = useMemo(() => {
    return debitItems.reduce((acc, item) => acc + (item?.creditAmount || 0), 0);
  }, [debitItems]);

  const getCreditTotal = useMemo(() => {
    return creditItems.reduce((acc, item) => acc + (item?.debitAmount || 0), 0);
  }, [creditItems]);

  if (isLoading || isAccountItemLoading || isPartiesLoading || isProductLoading) {
    return <Loading tip="Loading Sales Voucher details..." />;
  }

  const parties = party?.data?.filter((item: any) => {
    if (item?.partyType === "DISTRIBUTOR") {
      return item;
    }
  });

  const handleAddDebitItem = () => {
    debitForm.validateFields().then((values) => {
      const quantity = Number(values.quantity) || 0;
      const unitPrice = Number(values.unitPrice) || 0;
      const creditAmount = quantity * unitPrice;

      dispatch(addSalesDebitItem({
        key: Date.now(),
        rawOrProductId: values.rawOrProductId,
        quantity,
        unitPrice,
        creditAmount,
        existingQuantity: values.existingQuantity || 0,
        narration: values.narration || "",
      }));
      debitForm.resetFields();
    });
  };

  const handleAddCreditItem = () => {
    creditForm.validateFields().then((values) => {
      const selected = accountItem?.data?.find((item: TAccountsItem) => item?.id === values.accountsItemId);
      dispatch(addSalesCreditItem({
        key: Date.now(),
        accountsItemId: values.accountsItemId,
        accountsItemName: selected?.accountsItemName || "",
        debitAmount: values.debitAmount || 0,
        bankId: values.bankId || null,
        narration: values.narration || "",
      }));
      creditForm.resetFields();
    });
  };

  const onFinish = async (values: any) => {
    const salesVoucherData = {
      ...values,
      totalDiscount: 0,
      grandTotal: getDebitTotal,
      grandDebitTotal: getCreditTotal,
      salseItem: debitItems,
      debitItem: creditItems,
    };
    const res = await addvoucher(salesVoucherData);
    const resStatus = getResponse(res);
    if (resStatus?.success) {
      setIsModalOpen(true);
    }
  };

  const handleNewVoucher = () => {
    form.resetFields();
    dispatch(clearSalesDebitItems());
    dispatch(clearSalesCreditItems());
    setIsModalOpen(false);
  };

  const isSubmitDisabled = getDebitTotal !== getCreditTotal || debitItems.length === 0 || creditItems.length === 0;

  return (
    <div className="">
      <div className="bg-white rounded-lg px-4 py-2 mb-3">
        <h2 className="text-lg md:text-xl font-semibold m-0">Sales Entry Form</h2>
      </div>
      <Form form={form} name="sales_form" onFinish={onFinish} initialValues={{
        partyType: "DISTRIBUTOR",
        date: dayjs()
      }} autoComplete="off" layout="vertical">
        <div className="bg-white shadow rounded p-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-0 lg:gap-x-2">
            <Form.Item label="Party Type" name="partyType" rules={[{ required: true }]}>
              <Select placeholder="Select party" onChange={(value) => setSelectedPartyType(value)}>
                <Option value="DISTRIBUTOR">DISTRIBUTOR</Option>
              </Select>
            </Form.Item>
            {selectedPartyType === "CUSTOMER" ? (
              <>
                <div className="relative">
                  <Form.Item label="Contact Number" name="contactNumber" rules={[{ required: true, message: "Contact Number is required" }]}>
                    <Input style={{ width: "100%" }} maxLength={11} placeholder="Contact Number" onChange={async (e: any) => {
                      let customerData;
                      if (e.target.value.length > 5) {
                        const customer = await getCustomer(e.target.value);
                        customerData = customer?.data?.data;
                      }
                      if (customerData && customerData?.length > 0) {
                        setCustomer(customerData);
                      } else {
                        setCustomer([]);
                        form.setFieldsValue({ name: "", address: "" });
                      }
                    }} />
                  </Form.Item>
                  <div className="absolute w-full top-16 max-h-[300px] p-1 overflow-y-auto shadow-lg bg-white z-10 rounded">
                    {customer && customer?.length > 0 && customer?.map((item: TCustomer, idx: number) => (
                      <button type="button" onClick={() => {
                        form.setFieldsValue({ contactNumber: item.contactNumber, name: item?.name, address: item?.address });
                        setCustomer([]);
                      }} key={idx} className="px-3 py-2 cursor-pointer w-full text-left hover:bg-gray-100">
                        {item?.contactNumber}
                      </button>
                    ))}
                  </div>
                </div>
                <Form.Item label="Name" name="name" rules={[{ required: true }]}>
                  <Input placeholder="Name" />
                </Form.Item>
                <Form.Item label="Address" name="address">
                  <Input.TextArea placeholder="Address" rows={1} />
                </Form.Item>
              </>
            ) : (
              <Form.Item label="Name" name="name" rules={[{ required: true, message: "Party Name is required" }]}>
                <Select placeholder="Select party">
                  {parties?.map((item: TVendor) => (
                    <Option key={item?.id} value={item?.id}>{item?.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            )}
            <Form.Item label="Date" name="date" rules={[{ required: true }]}>
              <DatePicker className="w-full" />
            </Form.Item>
          </div>
        </div>
        <div className="mb-5 bg-white shadow rounded p-3 pt-0 mt-3">
          <h3 className="text-lg font-semibold mb-1">Debit Items</h3>
          <Form component="div" form={debitForm} layout="vertical" className="mb-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              <Form.Item name="rawOrProductId" label="Raw Material" rules={[{ required: true, message: "Required" }]}>
                <Select placeholder="Select Product">
                  {product?.data?.map((item: TProduct) => (
                    <Option key={item?.id} value={item?.id}>{item?.name}</Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="quantity" label="Quantity" rules={[{ required: true, message: "Required" }]}>
                <InputNumber style={{ width: "100%" }} min={1} placeholder="Quantity" />
              </Form.Item>
              <Form.Item name="unitPrice" label="Unit Price" rules={[{ required: true, message: "Required" }]}>
                <InputNumber style={{ width: "100%" }} min={0} placeholder="Unit Price" />
              </Form.Item>
              <Form.Item name="narration" label="Narration">
                <Input placeholder="Narration" />
              </Form.Item>
              <Form.Item label=" ">
                <Button onClick={handleAddDebitItem} icon={<PlusOutlined />} style={{ fontSize: "12px", background: "#2d1849", color: "white", width: "100%" }}>
                  Add
                </Button>
              </Form.Item>
            </div>
          </Form>
          {debitItems.length > 0 && (
            <Table
              dataSource={debitItems}
              className="mb-0 itemsTable"
              rowKey="key"
              columns={[
                {
                  title: "Raw Material",
                  dataIndex: "rawOrProductId",
                  render: (value: number) => product?.data?.find((r: TProduct) => r.id === value)?.name || value,
                },
                {
                  title: "Quantity",
                  dataIndex: "quantity",
                },
                {
                  title: "Unit Price",
                  dataIndex: "unitPrice",
                  render: (value: number) => value?.toFixed(2),
                },
                {
                  title: "Credit Amount",
                  dataIndex: "creditAmount",
                  render: (value: number) => <b>{value?.toFixed(2)}</b>,
                },
                {
                  title: "Actions",
                  render: (_, record) => (
                    <Button type="link" icon={<DeleteOutlined />} onClick={() => dispatch(removeSalesDebitItem(record.key))} danger />
                  ),
                },
              ]}
              pagination={false}
            />
          )}
          <div className="flex gap-4 justify-end flex-1 items-center md:text-xl mr-5 mt-2">
            <b>Total</b>
            <b>= {getDebitTotal.toFixed(2)}</b>
          </div>
        </div>
        <div className="mb-5 bg-white shadow rounded p-3 pt-0 mt-3">
          <h3 className="text-lg font-semibold mb-1">Credit Items</h3>
          <Form component="div" form={creditForm} layout="vertical" className="mb-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              <Form.Item name="accountsItemId" label="Account Item" rules={[{ required: true, message: "Required" }]}>
                <Select placeholder="Select item">
                  {accountItem?.data?.map((item: TAccountsItem) => (
                    <Option key={item?.id} value={item?.id}>{item?.accountsItemName}</Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="debitAmount" label="Debit Amount" rules={[{ required: true, message: "Required" }]}>
                <InputNumber style={{ width: "100%" }} min={0} placeholder="Amount" />
              </Form.Item>
              <Form.Item name="narration" label="Narration">
                <Input placeholder="Narration" />
              </Form.Item>
              <Form.Item label=" ">
                <Button onClick={handleAddCreditItem} icon={<PlusOutlined />} style={{ fontSize: "12px", background: "#2d1849", color: "white", width: "100%" }}>
                  Add
                </Button>
              </Form.Item>
            </div>
          </Form>
          {creditItems.length > 0 && (
            <Table
              dataSource={creditItems}
              className="mb-0 itemsTable"
              rowKey="key"
              columns={[
                {
                  title: "Account Item",
                  dataIndex: "accountsItemName",
                },
                {
                  title: "Debit Amount",
                  dataIndex: "debitAmount",
                  render: (value: number) => <b>{value?.toFixed(2)}</b>,
                },
                {
                  title: "Narration",
                  dataIndex: "narration",
                },
                {
                  title: "Actions",
                  render: (_, record) => (
                    <Button type="link" icon={<DeleteOutlined />} onClick={() => dispatch(removeSalesCreditItem(record.key))} danger />
                  ),
                },
              ]}
              pagination={false}
            />
          )}
          <div className="flex justify-end items-center mt-2 border-t pt-2">
            <b>Credit Total = {getCreditTotal.toFixed(2)}</b>
          </div>
        </div>
        <div className="bg-white px-3 pb-2 rounded-b-md shadow">
          <div className="flex justify-end items-center mt-2">
            {
              getDebitTotal === getCreditTotal ?
                <span className="font-bold text-green-600">Proceed</span> :
                <span className="font-bold text-red-500">Need Debit/Credit: {(getDebitTotal - getCreditTotal).toFixed(2)}</span>
            }
          </div>
        </div>
        <div className="flex justify-end items-center mt-4">
          <Button type="primary" htmlType="submit" loading={isSubmitting} disabled={isSubmitDisabled} style={{ background: isSubmitDisabled ? "#d9d9d9" : "black", color: isSubmitDisabled ? "#bfbfbf" : "white", cursor: isSubmitDisabled ? "not-allowed" : "pointer" }}>
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </Form>
      <PostSubmitModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onNewVoucher={handleNewVoucher} />
    </div>
  );
};

export default AccountsSalesVoucher;
