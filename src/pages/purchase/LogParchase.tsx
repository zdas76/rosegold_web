/* eslint-disable @typescript-eslint/no-explicit-any */

import { Form, Input, Button, InputNumber, Divider, Row, Col, Select, DatePicker } from "antd";
import { FaPlus, FaTrash } from "react-icons/fa";
import { useGetPartiesQuery } from "../../redux/features/auth/authApi";
import { TAccountsItem, TBankAccount, TGrade, TlogOrderItems, TParty } from "../../types/types";
import { useEffect, useState } from "react";
import { generateInvoiceNumber } from "../../utils/generateRandomNumber";
import { useCreateLogOrderMutation, useGetGradesQuery, useGetLogsQuery } from "../../redux/features/logAndGrade/LogAndGrade.api";
import { useGetAccountItemQuery } from "../../redux/features/transactions/transactons.api";
import { TCreditItem } from "../transactions/receivedVoucher/ReceivedVoucher";
import { useGetBankQuery } from "../../redux/features/bank/bank.api";
import { getResponse } from "../../utils/getResponse";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { addLorgOrderItem, clearLogOrderitem, removeLogOrderCreditItem } from "../../redux/features/logAndGrade/logOrderSlice";
import { roundToTwo } from "../../redux/features/unit/roundToTow";
import { clearVoucher, setVoucher } from "../../redux/features/logAndGrade/logOrderVoucherSlice";
import VoucherModal from "../../components/shared/LogOrderVoucherModal";

const LogParchase = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();
    const { Option } = Select;
    const { data: supplier } = useGetPartiesQuery({})
    const [vaoucherNo, setVoucherNo] = useState<any>(generateInvoiceNumber("LGV"))
    const [resVoucherNo, setResVoucherNo] = useState<any>(null)
    const { data: logCategory } = useGetLogsQuery({})
    const { data: grade } = useGetGradesQuery({})
    const { data: creaditAccountItem } = useGetAccountItemQuery({ accountMainPillerId: ["01", "04"] })
    // const [debitAmount, setDebitAmount] = useState<any>(null);
    const [expenseAmount, setExpenseAmount] = useState<any>(null);
    const [creditAmountValue, setCreditAmountValue] = useState<any>(null);
    const [createLogorder, { isLoading: isSubmitting }] = useCreateLogOrderMutation()
    const [categroy, setCategory] = useState<number | undefined>();
    const [redius, setRedius] = useState<number | null>(null);
    const [addQantity, setAddQantity] = useState<number>(0)
    const [height, setHeight] = useState<number | null>();
    const [selectedGrade, setSelectedGrade] = useState<any>(null);
    const [u_price, setU_Price] = useState<number | null>(0)
    const dispatch = useAppDispatch()
    const selectedLogorderItems = useAppSelector(state => state?.logOrder.logOrderCreditItem)
    const selectlogOrderbyCategory = useAppSelector(state => state?.logOrder.logOrderByCategory)
    const totalOfAmountAndQantity = selectedLogorderItems?.reduce(
        (acc, item: TlogOrderItems) => {
            return {
                logOrderTotalAmount: acc.logOrderTotalAmount + (Number(item?.amount) || 0),
                logOrderTotalQuantity: acc.logOrderTotalQuantity + (Number(item?.quantity) || 0)
            };
        },
        {
            logOrderTotalAmount: 0,
            logOrderTotalQuantity: 0
        }
    );
    const { data: banks, isLoading } = useGetBankQuery({});
    const allBanks = banks?.data?.map((bank: TBankAccount) => {
        return {
            label: `${bank?.bankName} - ${bank?.accountNumber}`,
            value: bank?.id,
            key: bank?.id,
        };
    })
    const creditAccountsItem = creaditAccountItem?.data?.map((items: TAccountsItem) => {
        return {
            ...items,
            label: items?.accountsItemName,
            value: items?.id,
            key: items?.accountsItemId,
        };
    })
    // watch the form fields
    const debitItem = Form.useWatch("debitItem", form); // ✅ watch the form field
    const creditItem = Form.useWatch("creditItem", form);
    // selected grade
    useEffect(() => {
        if (grade?.data?.length && categroy && redius) {
            const firstGrade = grade?.data?.find((item: TGrade) => {
                if (item?.categoryId == categroy && redius >= item?.minRadius
                    && redius <= item?.maxRadius) {
                    return item;
                } else {
                    return
                }
            });
            if (firstGrade) {
                setSelectedGrade(firstGrade);
                setU_Price(firstGrade?.unitPrice)
            } else {
                setSelectedGrade(null);
                setU_Price(null)
            }
        }
        if (redius && height) {
            const quantity = (redius * redius * height) / 2304;
            setAddQantity(Number(quantity.toFixed(2)));
        } else {
            return;
        }
    }, [categroy, redius, grade?.data, height]);
    // get total debit amount
    useEffect(() => {
        // Calculate total debit amount from logOrderItems
        const expense = debitItem?.reduce((sum: number, item: any) => {
            return sum + (Number(item?.debitAmount) || 0);
        }, 0);
        setExpenseAmount(Number(expense?.toFixed(2)));
        // Calculate total credit amount from creditItem
        const creditTotal = creditItem?.reduce((sum: number, item: any) => {
            return sum + (Number(item?.creditAmount) || 0);
        }, 0);
        setCreditAmountValue(Number(creditTotal?.toFixed(2)));
    }, [debitItem, creditItem]);
    const allSupplier = supplier?.data.filter((entry: TParty) => entry.partyType === "VENDOR");
    const onFinish = async (values: any) => {
        dispatch(clearVoucher())
        const valuedata = {
            ...values,
            voucherNo: vaoucherNo,
            logOrderItem: selectedLogorderItems,
            debitTotal: totalOfAmountAndQantity?.logOrderTotalAmount + expenseAmount,
            logOrderTotalAmount: totalOfAmountAndQantity?.logOrderTotalAmount,
            logOrderTotalQuantity: totalOfAmountAndQantity?.logOrderTotalQuantity,
            logItemsByCategory: selectlogOrderbyCategory,
        }
        // console.log(valuedata, "valuedata")
        const res = await createLogorder(valuedata)
        // hell checking
        const result = getResponse(res);
        setResVoucherNo(result?.data?.voucherNo);
        if (result?.success) {
            // set the data log order slice
            setIsModalOpen(true)
            dispatch(setVoucher(result?.data))
            form.resetFields();
            dispatch(clearLogOrderitem()); // reset log order items
            setAddQantity(0);
            setCategory(undefined);
            setCreditAmountValue(0);
            setHeight(null);
            setRedius(null);
            setSelectedGrade(null);
            setU_Price(null);
            // reset the form
            form.setFieldsValue({
                creditItem: [{}],
                debitItem: [{}],
                voucherNo: vaoucherNo,
                partyId: undefined,
                chalanNo: "",
                date: null,
            });
            setVoucherNo(generateInvoiceNumber("LGV"))
        }
    };


    // console.log(totalLogOrderAmount);
    const handleAddCreditItem = () => {
        const logOrderCreditItem = {
            logId: categroy,
            radis: redius,
            height,
            logGradeId: selectedGrade?.id,
            quantity: Number(addQantity.toFixed(2)),
            u_price: u_price,
            amount: Number((addQantity * u_price!).toFixed(2))
        }
        dispatch(addLorgOrderItem(logOrderCreditItem));
        setAddQantity(0)
        setCategory(undefined)
        setCreditAmountValue(0)
        setHeight(null)
        setRedius(null)
        setSelectedGrade(null)
        setU_Price(null)
    }
    // handle delete log order items
    const handleDeleteLogOrderitem = (idx: number) => {
        dispatch(removeLogOrderCreditItem({ idx }))
    }

    return (
        <>
            <div className="bg-white rounded-lg px-4 py-2 mb-3">
                <h2 className="text-xl font-bold m-0">Log Purchase</h2>
            </div>
            <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{
                // logOrderItem: [{}],
                creditItem: [{}],
                debitItem: [{}],
            }}>
                {/* Static Fields */}
                <Row className="bg-white px-4 pb-0 pt-2 gap-2 rounded-md shadow-md">
                    <Col span={6}>
                        <Form.Item
                            name="partyId"
                            label="Select Vendor"
                            rules={[{ required: true, message: "Vendor is required" }]}>
                            <Select
                                placeholder="Select a Vendor"
                                style={{ width: "100%" }}>
                                {allSupplier?.map((supplier: TParty) => (
                                    <Option key={supplier.id} value={supplier.id}>
                                        {supplier.name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item
                            name="chalanNo"
                            label="Chalan No">
                            <Input placeholder="chalan no, chalan no" />
                        </Form.Item>
                    </Col>
                    <Col span={4}>
                        <Form.Item
                            // name="voucherNo"
                            label="Voucher No">
                            <Input value={vaoucherNo} disabled style={{ color: "black" }} />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item
                            name="date"
                            label="Date"
                            rules={[{ required: true, message: "Date is required" }]}>
                            <DatePicker style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>
                </Row>
                {/* Credit Items - Dynamic List */}
                <div className="px-2 py-1 rounded bg-white mt-5">
                    <Divider orientation="left">Payment</Divider>
                    <div className="grid px-3 grid-cols-3 gap-x-4 w-full">
                        <b>Account Name <span className="text-red-500">*</span></b>
                        <b>Credit Amount <span className="text-red-500">*</span></b>
                        <b>Narration</b>
                    </div>
                    <Form.List name="creditItem">
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({ key, name, ...restField }) => {
                                    const creditItems = form.getFieldValue(["creditItem", name]) || {};
                                    return <div className="flex items-center gap-2 px-3 justify-center" key={key}>
                                        <div className="grid grid-cols-3 gap-x-4 w-full">
                                            <div className="flex flex-col">
                                                <div>
                                                    <Form.Item
                                                        {...restField}
                                                        name={[name, "accountsItemId"]}
                                                        rules={[{ required: true, message: "Account ID is required" }]}>
                                                        <Select style={{ width: "100%" }} placeholder="Select Account" options={creditAccountsItem} />
                                                    </Form.Item>
                                                </div>
                                                {
                                                    creditAccountsItem?.find((item: TCreditItem) => creditItems?.accountsItemId === item?.id)?.accountsItemName.toLowerCase() === "bank" &&
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
                                                                options={allBanks} />
                                                        </Form.Item>
                                                    </div>
                                                }
                                            </div>
                                            <div>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, "creditAmount"]}
                                                    rules={[{ required: true, message: "Credit Amount is required" }]}
                                                >
                                                    <InputNumber placeholder="Payment Amount" style={{ width: "100%" }} />
                                                </Form.Item>
                                            </div>
                                            <div>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, "narration"]}
                                                // rules={[{ required: true, message: "Narration is required" }]}
                                                >
                                                    <Input placeholder="Write your narration" />
                                                </Form.Item>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-center">
                                            <button
                                                onClick={() => remove(name)}
                                                className="border border-slate-200 p-2 mt-3 rounded-2xl hover:bg-slate-400 cursor-pointer hover:text-white"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>
                                })}
                                <div className="flex items-center justify-end mr-20 md:mr-28">
                                    <h3 className="font-bold">Total Credit {creditAmountValue}</h3>
                                </div>
                                <Form.Item>
                                    <button
                                        onClick={() => add()}
                                        type="button"
                                        className="w-full bg-slate-900 cursor-pointer text-white py-1 px-3 rounded mt-3">
                                        Add Credit Item
                                    </button>
                                </Form.Item>
                            </>
                        )}
                    </Form.List>
                </div>
                <div className="mt-5 bg-white px-2 py-1 rounded">
                    {/* Log Order Item - Dynamic List */}
                    <div className="flex flex-col gap-2">
                        <div className="px-2 py-1 rounded">
                            <Divider orientation="left">Log Order Item</Divider>
                            <div className="flex items-center gap-2">
                                <div className="grid grid-cols-3 gap-x-5 md:grid-cols-3 flex-1">
                                    <div>
                                        <Form.Item
                                            label="Category"
                                            rules={[{ required: true, message: "Category Name Required" }]}>
                                            <Select onChange={(value) => setCategory(value)} value={categroy}>
                                                {logCategory?.data?.map((supplier: TParty) => (
                                                    <Option key={supplier.id} value={supplier.id}>
                                                        {supplier.name}
                                                    </Option>
                                                ))}
                                            </Select>
                                        </Form.Item>
                                    </div>
                                    <div>
                                        <Form.Item
                                            label="Radius"
                                            rules={[{ required: true, message: "Radius is required" }]}>
                                            <InputNumber value={redius} style={{ width: "100%" }} onChange={(value) => setRedius(Number(value))} />
                                        </Form.Item>
                                    </div>
                                    <div>
                                        <Form.Item
                                            label="Height"
                                            rules={[{ required: true, message: "Height is required" }]}>
                                            <InputNumber value={height} style={{ width: "100%" }} min={1} onChange={(value) => setHeight(Number(value))} />
                                        </Form.Item>
                                    </div>
                                </div>
                                <div className="flex flex-col justify-end w-fit mt-2">
                                    <button disabled={!redius || !categroy || !height || !selectedGrade || u_price! < 1 || (addQantity * u_price! < 0)} type="button" onClick={handleAddCreditItem} className="px-3 bg-indigo-600 text-white rounded-lg border disabled:bg-gray-700 disabled:cursor-default py-2 cursor-pointer"><FaPlus /></button>
                                </div>
                            </div>
                        </div>
                        <div className="pb-2">
                            {/* <small className="text-base mb-3">log Order item:</small> */}
                            <div className="flex gap-2">
                                <div className="grid grid-cols-3 gap-x-1 md:grid-cols-7 flex-1">
                                    {categroy &&
                                        <div className="flex flex-col gap-2">
                                            <b className="">Category</b>
                                            <h3 className="border p-1 rounded-md border-slate-300">
                                                {
                                                    logCategory?.data?.find((item: any) => item.id === categroy)?.name
                                                }
                                            </h3>
                                        </div>
                                    }
                                    {
                                        redius &&
                                        <div className="flex flex-col gap-2">
                                            <b className="">Radius</b>
                                            <h3 className="border p-1 rounded-md border-slate-300">
                                                {redius}
                                            </h3>
                                        </div>
                                    }
                                    {
                                        height &&
                                        <div className="flex flex-col gap-2">
                                            <b className="">Height</b>
                                            <h3 className="border p-1 rounded-md border-slate-300">
                                                {height}
                                            </h3>
                                        </div>
                                    }
                                    {
                                        selectedGrade && categroy &&
                                        <div className="flex flex-col gap-2">
                                            <b className="">Grade</b>
                                            <h3 className="border p-1 px-4 rounded-md border-green-300 bg-green-100 font-black">
                                                {selectedGrade?.gradeName}
                                            </h3>
                                        </div>
                                    }
                                    {
                                        u_price && u_price > 0 ?
                                            <div className="flex flex-col gap-2">
                                                <b className="">Unit Price</b>
                                                <h3 className="border p-1 rounded-md border-slate-300">
                                                    {u_price}
                                                </h3>
                                            </div> : null
                                    }
                                    {
                                        addQantity > 0 &&
                                        <div className="flex flex-col gap-2">
                                            <b className="">Quantity/Area</b>
                                            <h3 className="border p-1 rounded-md border-slate-300">
                                                {addQantity.toFixed(2)}
                                            </h3>
                                        </div>
                                    }
                                    {
                                        addQantity > 0 &&
                                        <div className="flex flex-col gap-2">
                                            <b className="">E. Amount</b>
                                            <h3 className="border p-1 rounded-md border-slate-300">
                                                {Number((addQantity * u_price!).toFixed(2))}
                                            </h3>
                                        </div>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* total and prcced button */}
                <div className="mt-3 bg-white px-2 py-1 rounded">
                    <Form.Item rules={[{ required: true, message: "Log narration is required" }]} label="Log Narration" name={"narration"} className="font-bold">
                        <Input.TextArea placeholder="Write Log Narration here" className="font-normal" rows={3} />
                    </Form.Item>
                </div>
                <div className="flex mt-4 py-2 items-center justify-between w-full bg-gray-100">
                    <div>
                        <h3 className="font-bold md:text-base w-fit ml-auto px-8"> Total: {roundToTwo(totalOfAmountAndQantity?.logOrderTotalAmount)}</h3>
                    </div>
                    <div className="flex items-center gap-5 px-5">
                        {
                            (totalOfAmountAndQantity?.logOrderTotalAmount) != (creditAmountValue) ?
                                <div className="font-bold">Difference: {roundToTwo((totalOfAmountAndQantity?.logOrderTotalAmount) - creditAmountValue)}</div>
                                : <span className="font-bold text-green-500 block">Procced</span>
                        }
                        <Button disabled={(totalOfAmountAndQantity?.logOrderTotalAmount) != creditAmountValue} type="primary" htmlType="submit" loading={isSubmitting}>
                            {isSubmitting ? "Submitting..." : "Submit"}
                        </Button>
                    </div>
                </div>
                <div className="shadow rounded border border-slate-300 p-1 mt-3">
                    <div className="overflow-x-auto">
                        <table className="min-w-full border border-gray-300 text-sm text-left">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-4 py-2 border border-slate-300">#</th>
                                    <th className="px-4 py-2 border border-slate-300">Category Name</th>
                                    <th className="px-4 py-2 border border-slate-300">Radius</th>
                                    <th className="px-4 py-2 border border-slate-300">Height</th>

                                    <th className="px-4 py-2 border border-slate-300">Grade</th>
                                    <th className="px-4 py-2 border border-slate-300">Quantity</th>
                                    <th className="px-4 py-2 border border-slate-300">Unit Price</th>
                                    <th className="px-4 py-2 border border-slate-300">Debit Amount</th>
                                    <th className="px-4 py-2 border border-slate-300"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedLogorderItems?.map((item: TlogOrderItems, index: number) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-4 py-2 border border-slate-300">{index + 1}</td>
                                        <td className="px-4 py-2 border border-slate-300">
                                            {
                                                logCategory?.data?.find((party: TParty) => party?.id === item?.logId)?.name
                                            }
                                        </td>
                                        <td className="px-4 py-2 border border-slate-300">{item.radis.toFixed(2)}</td>
                                        <td className="px-4 py-2 border border-slate-300">{item.height.toFixed(2)}</td>
                                        <td className="px-4 py-2 border border-green-300 bg-green-100 font-bold">
                                            {
                                                grade?.data?.find((grade: TGrade) => grade?.id === item?.logGradeId)?.gradeName
                                            }
                                        </td>
                                        <td className="px-4 py-2 border border-slate-300">{item.quantity.toFixed(2)}</td>
                                        <td className="px-4 py-2 border border-slate-300">{item.u_price.toFixed(2)}</td>
                                        <td className="px-4 py-2 border border-slate-300">{item.amount.toFixed(2)}</td>
                                        <td className="px-4 py-2 border border-slate-300"><FaTrash className="cursor-pointer" onClick={() => handleDeleteLogOrderitem(index)} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </Form>
            {
                isModalOpen &&
                <div className="hidden"><VoucherModal voucherNo={resVoucherNo} isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} /></div>
            }
        </>
    );
};

export default LogParchase;