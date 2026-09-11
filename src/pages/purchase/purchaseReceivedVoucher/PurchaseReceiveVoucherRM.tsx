/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { Form, Input, Button, DatePicker, Select, Divider, Table } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useGetAccountItemQuery } from "../../../redux/features/transactions/transactons.api";
import { useGetRowMaterialsQuery } from "../../../redux/features/rowMaterials/rowMaterials.api";
import { TAccountsItem, TBankAccount, TParty, TRawMaterial } from "../../../types/types";
import { useCreateReceiveVoucherMutation } from "../../../redux/features/journal/journal.api";
import { getResponse } from "../../../utils/getResponse";
import { useGetPartiesQuery } from "../../../redux/features/auth/authApi";
import { generateInvoiceNumber } from "../../../utils/generateRandomNumber";
import { useGetBankQuery } from "../../../redux/features/bank/bank.api";
import PostSubmitModal from "../../../components/shared/PostSubmitModal";
import Loading from "../../../components/shared/Loading";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import {
  addReceiveVoucherDebitItem,
  removeReceiveVoucherDebitItem,
  clearReceiveVoucherDebitItems,
} from "../../../redux/features/purchaseReceiveVoucher/receiveVoucherDebitSlice";
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
const PurchaseReceiveVoucherRM: React.FC = () => {
  const [form] = Form.useForm();
  const [debitForm] = Form.useForm();
  const [creditForm] = Form.useForm();
  const [partyType, setPartyType] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dispatch = useAppDispatch();
  const debitItems = useAppSelector((state) => state.receiveVoucherDebit.debitItems);
  const creditItemsRedux = useAppSelector((state) => state.receiveVoucherCredit.creditItems);

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
    useCreateReceiveVoucherMutation();
  const { data: rawMaterialData, isLoading: isRawMaterialLoading } = useGetRowMaterialsQuery({});

  const { data: CreditAccountsData, isLoading: isCreditAccountsLoading } =
    useGetAccountItemQuery({ accountMainPillerId: ["01", "02"] });

  const debitTotal = debitItems?.reduce((total: number, item) => total + Number(item?.amount || 0), 0) ?? 0;
  const creditTotal = creditItemsRedux?.reduce((total: number, item) => total + Number(item?.amount || 0), 0) ?? 0;

  if (
    isLoading ||
    isBanksLoading ||
    isRawMaterialLoading ||
    isCreditAccountsLoading
  ) {
    return <Loading tip="Loading Received Voucher details..." />;
  }

  const rawMaterialsMapped = rawMaterialData?.data?.map((item: TRawMaterial) => ({
    key: item?.id,
    value: item?.id,
    label: item?.name,
  }));

  const creditItems = CreditAccountsData?.data?.map((item: TAccountsItem) => ({
    ...item,
    key: item.id,
    value: item.id,
    label: item.accountsItemName,
  }));

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
        narration: values.narration || "",
      }));
      creditForm.resetFields();
    });
  };

  const onFinish = async (values: any) => {
    const formattedDebitItems = debitItems.map((item) => ({
      rawMaterialId: item.rawMaterialId,
      qty: item.qty,
      unitPrice: item.unitPrice,
      amount: item.amount,
      narration: item.narration,
    }));
    const formattedCreditItems = creditItemsRedux.map((item) => ({
      accountsItemId: item.accountsItemId,
      amount: item.amount,
      narration: item.narration,
    }));
    const res = await createReceviveVoucher({
      ...values,
   
      debitItem: formattedDebitItems,
      creditItem: formattedCreditItems,
    });
    const result = getResponse(res);
    if (result?.success) {
      setIsModalOpen(true);
    }
  };

  const handleNewVoucher = () => {
    form.resetFields();
    const newVoucherno = generateInvoiceNumber("RV");
    dispatch(clearReceiveVoucherDebitItems());
    dispatch(clearReceiveVoucherCreditItems());
    setIsModalOpen(false);
  };

  return (
    <div className="rounded-2xl">
      <div className="bg-white rounded-lg px-4 py-2 mb-3">
        <h2 className="text-2xl font-semibold m-0">Purchase Received Voucher</h2>
      </div>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          date: dayjs(new Date()),
        }}>
        <div className="bg-white  p-4 rounded grid grid-cols-2 gap-4">
          <Form.Item
            name="partyId"
            label="Party"
            rules={[{ required: true, message: "Please select a party" }]}>
            <Select placeholder="Select party" disabled={isLoading}>
              {partyType &&
                parties?.map((item: TParty) => (
                  <Option key={item?.id} value={item?.id}>
                    {item?.name}
                  </Option>
                ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="date"
            label="Date"
            rules={[{ required: true, message: "Please select date" }]}>
            <DatePicker className="w-full" />
          </Form.Item>
        </div>

        {/*-------------------------- Debit Items --------------------------------------------- */}
        <div className="mb-5 bg-white shadow-md rounded-lg p-3 pt-0">
          <Divider orientation="left" style={{ paddingTop: "10px" }}>
            Debit Items
          </Divider>
          <Form form={debitForm} layout="vertical" className="mb-3 px-3" onValuesChange={(changed, allValues) => {
            if (changed.qty !== undefined || changed.unitPrice !== undefined) {
              const qty = Number(allValues.qty) || 0;
              const unitPrice = Number(allValues.unitPrice) || 0;
              debitForm.setFieldsValue({ amount: qty * unitPrice });
            }
          }}>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <Form.Item name="rawMaterialId" label="Raw Material" rules={[{ required: true, message: "Required" }]}>
                <Select
                  placeholder="Select raw material"
                  options={rawMaterialsMapped}
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
              <Form.Item name="narration" label="Narration">
                <Input placeholder="Narration (optional)" />
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
              rowKey="key"
              columns={[
                {
                  title: "Raw Material",
                  dataIndex: "rawMaterialName",
                },
                {
                  title: "Qty",
                  dataIndex: "qty",
                },
                {
                  title: "Unit Price",
                  dataIndex: "unitPrice",
                  render: (value: number) => value?.toFixed(2),
                },
                {
                  title: "Total",
                  dataIndex: "amount",
                  render: (value: number) => value?.toFixed(2),
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
          <div className="text-right font-bold mt-2 text-base">
            <b>Total Debit: {debitTotal}</b>
          </div>
        </div>

        {/*-------------------------- Credit Items --------------------------------------------- */}
        <div className="mb-5 bg-white shadow-md rounded-lg p-3 pt-0">
          <Divider orientation="left" style={{ paddingTop: "10px" }}>
            Credit Items
          </Divider>
          <Form form={creditForm} layout="vertical" className="mb-3 px-3">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <Form.Item name="accountsItemId" label="Select Credit Item" rules={[{ required: true, message: "Required" }]}>
                <Select placeholder="Select credit item">
                  {creditItems?.map((item: TAccountsItem) => (
                    <Option key={item?.id} value={item?.id}>
                      {item?.accountsItemName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="amount" label="Amount" rules={[{ required: true, message: "Required" }]}>
                <Input type="number" placeholder="Amount" min={0} />
              </Form.Item>
              <Form.Item name="narration" label="Narration">
                <Input placeholder="Narration (optional)" />
              </Form.Item>
              <Form.Item label=" ">
                <Button onClick={handleAddCreditItem} icon={<PlusOutlined />} style={{ fontSize: "12px", background: "#2d1849", color: "white", width: "100%" }}>
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
                {creditTotal - debitTotal}
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
