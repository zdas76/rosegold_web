/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  DatePicker,
  Select,
  InputNumber,
  Divider,
} from "antd";
import { MinusCircleOutlined, } from "@ant-design/icons";
import { FaTrash } from "react-icons/fa";
import { useGetProductsQuery } from "../../../redux/features/product/product.api";
import { useGetAccountItemQuery, useLazyGetTotalQuantityAndUnitPriceQuery } from "../../../redux/features/transactions/transactons.api";
import { TAccountsItem, TBankAccount, TCustomer, TProduct, TVendor } from "../../../types/types";
import { useGetPartiesQuery } from "../../../redux/features/auth/authApi";
import { TDebititems, TsalesItem } from "../../../types/salesRelatedtype";
import { useCreateSalesVoucherMutation } from "../../../redux/features/journal/journal.api";
import { useGetBankQuery } from "../../../redux/features/bank/bank.api";
import { getResponse } from "../../../utils/getResponse";
import { generateInvoiceNumber } from "../../../utils/generateRandomNumber";
import { useLazyGetCustomerByPhoneQuery } from "../../../redux/features/OthersApi/othersApi";
import { toast } from "sonner";
import PostSubmitModal from "../../../components/shared/PostSubmitModal";
import Loading from "../../../components/shared/Loading";

const { Option } = Select;
const ProductionSales = () => {
  const [triggerGetTotalQuantity] = useLazyGetTotalQuantityAndUnitPriceQuery();
  const [customer, setCustomer] = useState<TCustomer[] | null>(null);

  const [form] = Form.useForm();
  const [grandTotal, setGrandTotal] = useState(0);
  const [voucherNo, setVoucherNo] = useState(generateInvoiceNumber("SV"));
  const [grandDebitTotal, setGrandDebitTotal] = useState(0);
  // const [discountRate, setDiscountRate] = useState<number>()
  const [totalDiscount, setTotalDiscount] = useState<number>(0);
  const [selectedPartyType, setSelectedPartyType] = useState("")
  const { data, isLoading } = useGetBankQuery({})
  // get customer by phone
  const [getCustomer] = useLazyGetCustomerByPhoneQuery()
  const [isModalOpen, setIsModalOpen] = useState(false);

  const banks = data?.data?.map((item: TBankAccount, idx: number) => {
    return {
      key: idx,
      label: `${item?.bankName} (${item?.accountNumber})`,
      value: item?.id,
      ...item
    }
  })
  const [addvoucher, { isLoading: isSubmitting }] = useCreateSalesVoucherMutation()
  const { data: accountItem, isLoading: isAccountItemLoading } = useGetAccountItemQuery({})
  const { data: party, isLoading: isPartiesLoading } = useGetPartiesQuery({ partyType: "DISTRIBUTOR" })

  const { data: product, isLoading: isProductLoading } = useGetProductsQuery({})

  const salesItems: TsalesItem[] = Form.useWatch("salseItem", form);
  const debitItem: TDebititems[] = Form.useWatch("debitItem", form);

  // salesItems?.map()
  useEffect(() => {
    const calculatedTotal = salesItems?.reduce((total: number, item: TsalesItem) => {
      return total + (item?.creditAmount || 0);
    }, 0) || 0;
    setGrandTotal(calculatedTotal);
  }, [salesItems])
  // debit items total calculation
  useEffect(() => {
    const debitItemCalculate = debitItem?.reduce((total: number, item: TDebititems) => {
      return total + (item?.debitAmount);
    }, 0) || 0;
    setGrandDebitTotal(debitItemCalculate);
  }, [debitItem])

  if (isLoading || isAccountItemLoading || isPartiesLoading || isProductLoading) {
    return <Loading tip="Loading Sales Voucher details..." />;
  }

  const vendors = party?.data?.filter((item: any) => {
    if (item?.partyType === "DISTRIBUTOR" || item?.partyType === "PARTY") {
      return item
    }
  })

  const onFinish = async (values: any) => {
    const salesVoucherData = {
      ...values,
      voucherNo,
      totalDiscount,
      grandTotal: grandTotal,
      grandDebitTotal: grandDebitTotal
    }
    const res = await addvoucher(salesVoucherData)
    const resStatus = getResponse(res)
    if (resStatus?.success) {
      setIsModalOpen(true);
    }
  };

  const handleNewVoucher = () => {
    setVoucherNo(generateInvoiceNumber("SV"));
    setTotalDiscount(0);
    form.resetFields();
    setIsModalOpen(false);
  };

  return (
    <div className="">
      <div className="bg-white rounded-lg px-4 py-2 mb-3">
        <h2 className="text-lg md:text-xl font-semibold m-0">Production Sales</h2>
      </div>
      <Form
        form={form}
        name="dynamic_sales_form"
        onFinish={onFinish}
        autoComplete="off"
        initialValues={{
          salseItem: [{}],
          debitItem: [{}],
        }}
        layout="vertical">
        <div className="bg-white shadow rounded p-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-y-0 sm:gap-x-6">
            <Form.Item label="Party Type" name="partyType" rules={[{ required: true }]}>
              <Select placeholder="Select party" onChange={(value) => setSelectedPartyType(value)}>
                <Option value="CUSTOMER">CUSTOMER</Option>
                <Option value="DISTRIBUTOR">DISTRIBUTOR</Option>
                <Option value="PARTY">PARTY</Option>
              </Select>
            </Form.Item>
            {
              selectedPartyType === "CUSTOMER" ?
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
                      }
                      } />
                    </Form.Item>
                    <div className="absolute w-full top-16 max-h-[300px] p-1 overflow-y-auto shadow-lg bg-white z-10 rounded">
                      {
                        customer && customer?.length > 0 &&
                        customer?.map((item: TCustomer, idx: number) => (
                          <button type="button" onClick={() => {
                            form.setFieldsValue({ contactNumber: item.contactNumber, name: item?.name, address: item?.address }); // ✅ Set input value
                            setCustomer([]); // hide suggestions
                          }} key={idx} className="px-3 py-2 cursor-pointer w-full text-left hover:bg-gray-100">
                            {item?.contactNumber}
                          </button>
                        ))
                      }
                    </div>
                  </div>
                  <Form.Item label="Name" name="name" rules={[{ required: true }]}>
                    <Input placeholder="Name" />
                  </Form.Item>
                  <Form.Item label="Address" name="address">
                    <Input.TextArea placeholder="Address" rows={1} />
                  </Form.Item>
                </>
                :
                <>
                  <Form.Item label="Paryt Name" name="name" rules={[{ required: true, message: "Vendor Name is required" }]}>
                    <Select placeholder="Select party" onChange={(value) => setSelectedPartyType(value)}>
                      {
                        vendors?.map((item: TVendor) => (
                          <Option key={item?.id} value={item?.id}>{item?.name}</Option>
                        ))
                      }
                    </Select>
                  </Form.Item>

                </>
            }
            <Form.Item label="Date" name="date" rules={[{ required: true }]}>
              <DatePicker className="w-full" />
            </Form.Item>
            <Form.Item label="Voucher No">
              <Input placeholder="Voucher No" value={voucherNo} disabled style={{ color: "black" }} />
            </Form.Item>
            {/* <Form.Item label="Payment Type" name="paymentType" rules={[{ required: true }]}>
              <Select placeholder="Select payment type">
                <Option value="PAID">Paid</Option>
                <Option value="DUE">Deu</Option>
                <Option value="PARTIAL">Partial</Option>
              </Select>
            </Form.Item> */}
          </div>
        </div>
        <div className="mb-5 bg-white shadow rounded p-3 pt-0 mt-3">
          <Divider orientation="left" style={{ paddingTop: "10px", fontWeight: "bold" }}>Debit Items</Divider>
          {/* headers of this table */}
          <div className="w-full grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            <div className="w-full">
              <b className="block">Items</b>
            </div>
            <div className="w-full">
              <b className="block">Quantity</b>
            </div>
            <div className="w-full">
              <b className="block">Unit Price</b>
            </div>
            <div className="w-full">
              <b className="block">Discount Rate (%)</b>
            </div>
            <div className="w-full">
              <b className="block">Discounted Amount</b>
            </div>
            <div className="w-full">
              <b className="block">Credit Amount</b>
            </div>
          </div>
          <Form.List name="salseItem">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => {
                  const salesItem = form.getFieldValue(["salseItem", name]) || {};
                  const quantity = Number(salesItem?.quantity);
                  const unitPrice = Number(salesItem?.unitPrice);
                  const discountRate = Number(salesItem?.discountRate)
                  const discount = Number((((quantity * unitPrice) * discountRate) / 100).toFixed(2)) || 0;
                  const creditAmount = (quantity * unitPrice) - discount || 0;
                  salesItem.quantity = quantity;
                  salesItem.discount = discount || 0;
                  salesItem.creditAmount = creditAmount;

                  return <div key={key} className="flex gap-2">
                    <div
                      className="w-full grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-6">
                      <Form.Item
                        {...restField}
                        name={[name, "rawOrProductId"]}
                        rules={[{ required: true, message: "Item selection is required" }]}
                        style={{ width: "100%" }}>
                        <Select
                          placeholder="Select Product"
                          className="w-full"
                          onChange={async (value) => {
                            try {
                              const res = await triggerGetTotalQuantity({
                                itemType: "product",
                                productId: value,
                              }).unwrap();
                              const netQty = res?.data?.netQuantity ?? 0;
                              form.setFields([
                                {
                                  name: ["salseItem", name, "existingQuantity"],
                                  value: netQty,
                                },
                              ]);
                            } catch (error) {
                              console.error(error);
                            }
                          }}
                        >
                          {
                            product?.data?.map((item: TProduct) => {
                              // Get all selected product IDs except the current row
                              const selectedIds = (form.getFieldValue("salseItem") || [])
                                .map((row: any, idx: number) => idx !== name ? row?.rawOrProductId : undefined)
                                .filter(Boolean);
                              return (
                                <Option
                                  value={item?.id}
                                  key={item?.id}
                                  disabled={selectedIds.includes(item?.id)}
                                >
                                  {item?.name}
                                </Option>
                              );
                            })
                          }
                        </Select>
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        style={{ width: "100%" }}
                        name={[name, "quantity"]}
                        rules={[{ required: true, message: "Quantity required" }]}>
                        <InputNumber
                          addonBefore={form.getFieldValue(["salseItem", name, "existingQuantity"]) || "Q"}
                          placeholder="Quantity"
                          style={{ width: "100%", borderRadius: "0 5px 5px 0 " }}
                          onChange={(value) => {
                            const existingQuantity = form.getFieldValue(["salseItem", name, "existingQuantity"]);
                            if (value && existingQuantity < value) {
                              toast.error("Quantity can't be more than stock");
                              form.setFieldsValue({
                                salseItem: {
                                  [name]: { quantity: existingQuantity || "" },
                                },
                              });
                            }
                          }}
                        />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        style={{ width: "100%" }}
                        name={[name, "unitPrice"]}
                        rules={[{ required: true, message: "unitPrice required" }]}>
                        <InputNumber placeholder="unitPrice" style={{ width: "100%" }} />
                      </Form.Item>

                      <Form.Item  {...restField} name={[name, "discountRate"]} style={{ width: "100%" }}>
                        <InputNumber placeholder="Discount Rate %" style={{ width: "100%" }} onChange={(value) => {
                          const creditAmount = form.getFieldValue("creditAmount")
                          console.log(creditAmount, value)
                        }} />
                      </Form.Item>

                      <Form.Item {...restField} name={[name, "discount"]} style={{ width: "100%" }}>
                        <InputNumber placeholder="Discount" style={{ width: "100%" }} readOnly />
                      </Form.Item>

                      <Form.Item {...restField} name={[name, "creditAmount"]} style={{ width: "100%" }}>
                        <b className="border w-full block px-3 py-1 rounded-md border-gray-300 bg-white">{creditAmount}</b>
                      </Form.Item>
                    </div>
                    <Button onClick={() => remove(name)} className="" icon={<MinusCircleOutlined className="text-red-500 mt-2 flex-1" />} style={{ padding: "5px" }}>
                    </Button>
                  </div>

                })}
                <Form.Item>
                  <button
                    onClick={() => add()}
                    type="button"
                    className="w-full bg-slate-900 cursor-pointer text-white py-1 px-3 rounded mt-3">
                    Add Sales Item
                  </button>
                </Form.Item>
                <div className="flex gap-4 justify-end flex-1 items-center md:text-xl mr-5 -mt-3">
                  <b>Total</b>
                  <b>= {grandTotal}</b>
                </div>
              </>
            )}
          </Form.List>
        </div>
        <div className="mb-5 bg-white shadow rounded p-3 pt-0 mt-3">
          <Divider orientation="left" className="" style={{ paddingTop: "10px", fontWeight: "bold" }}>Credit Items</Divider>

          {/* headers of this table */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
            <div className="w-full">
              <b className="block">Account Item</b>
            </div>
            <div className="w-full">
              <b className="block">Credit Amount</b>
            </div>
            <div className="w-full">
              <b className="block">Narration</b>
            </div>
          </div>
          <Form.List name="debitItem">
            {(fields, { add, remove }) => {
              return <>.
                {fields.map(({ key, name, ...restField }) => {
                  const debitItem = form.getFieldValue(["debitItem", name]) || {};
                  // const selectedDebitItem = accountItem?.data?.find((item: TAccountsItem) => debitItem?.accountsItemId === item?.id)
                  return <div key={key} className="flex items-center gap-2">
                    <div
                      key={key}
                      className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
                      <div className="w-full flex flex-col">
                        <Form.Item
                          style={{ width: '100%', }}
                          {...restField}
                          name={[name, "accountsItemId"]}
                          rules={[{ required: true, message: "Account Item ID required" }]}>
                          <Select placeholder="Select item" style={{ width: '100%' }}>
                            {
                              accountItem?.data?.map((item: TAccountsItem) => (
                                <Option key={item?.id} value={item?.id}>{item?.accountsItemName}</Option>
                              ))
                            }
                          </Select>
                        </Form.Item>
                        {
                          accountItem?.data?.find((item: TAccountsItem) => debitItem?.accountsItemId === item?.id)?.accountsItemName.toLowerCase() === "bank" &&
                          <div className="-mt-3 rounded flex gap-2 items-center">
                            <Form.Item
                              {...restField}
                              style={{ margin: 0 }}
                              name={[name, "bankAccountId"]}
                              rules={[{ required: true, message: "required field" }]}
                              className="w-full">
                              <Select
                                placeholder="Select Bank"
                                disabled={isLoading}
                                options={banks} />
                            </Form.Item>
                          </div>
                        }
                      </div>
                      <Form.Item
                        {...restField}
                        style={{ width: "100%" }}
                        name={[name, "debitAmount"]}
                        rules={[{ required: true, message: "Debit Amount required" }]}>
                        <InputNumber placeholder="Amount" style={{ width: '100%' }} />
                      </Form.Item>
                      <Form.Item {...restField} name={[name, "narration"]} style={{ width: '100%' }}>
                        <Input placeholder="Narration" />
                      </Form.Item>
                    </div>
                    <Button onClick={() => remove(name)} className="mb-6">
                      <FaTrash />
                    </Button>
                  </div>
                })}

                <div className="mt-3">
                  <Form.Item>
                    <button
                      type="button"
                      onClick={() => add()}
                      className="w-full bg-slate-900 cursor-pointer text-white py-1 px-3 rounded">
                      Add Debit Item
                    </button>
                  </Form.Item>
                </div>
                <div className="flex items-start justify-between border-b mb-2">
                  <div className="min-w-fit w-[400px]">
                    <Form.Item name="totalDiscount">
                      <b>Total Discount: </b> <InputNumber placeholder="Discount" style={{ minWidth: "140px" }} onChange={(value) => setTotalDiscount(Number(value))} />
                    </Form.Item>
                  </div>
                  <div className="flex justify-end flex-col items-center mb-2 max-w-[800px]">
                    <div>
                      <b>Total</b>
                      <b>= {grandDebitTotal + totalDiscount}</b>
                    </div>
                    {
                      totalDiscount > 0 &&
                      <div>
                        <b>Discount</b>
                        <b>= - {totalDiscount}</b>
                      </div>
                    }

                  </div>
                </div>
                <div className="md:text-lg flex justify-end">
                  <b>Grand Total</b>
                  <b>: {grandDebitTotal}</b>
                </div>
              </>
            }}
          </Form.List>
        </div>
        <Form.Item style={{ textAlign: "right" }}>
          {
            (grandDebitTotal + totalDiscount) !== grandTotal ?
              <b className="text-red-500 block">{(grandDebitTotal + totalDiscount) - grandTotal} (Items total) and (Debit Items) total should be same</b> :
              (grandDebitTotal + totalDiscount) === grandTotal ?
                <b className="text-green-600 mx-3">Procced</b> : null
          }
          <Button type="primary" size="large" htmlType="submit" className="w-full text-lg max-w-[300px]" loading={isSubmitting} disabled={grandTotal !== grandDebitTotal + totalDiscount}>
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </Form.Item>
      </Form >
      <PostSubmitModal
        voucherNo={voucherNo}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onNewVoucher={handleNewVoucher}
      />
    </div >

  );
};

export default ProductionSales;