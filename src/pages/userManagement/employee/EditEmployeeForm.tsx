/* eslint-disable @typescript-eslint/no-explicit-any */
import { Form, Input, Button, DatePicker } from "antd";
import { TEmployee } from "../../../types/types";
import { useUpdateEmployeeMutation } from "../../../redux/features/auth/authApi";
import { getResponse } from "../../../utils/getResponse";
import dayjs from "dayjs";
import { useState } from "react";
const EditEmployee = ({ employeeData, setOpenModal }: { employeeData: TEmployee; setOpenModal: any }) => {
    const [form] = Form.useForm();
    const [updateEmployee, { isLoading }] = useUpdateEmployeeMutation()
    const [employeImage, setEmployeImage] = useState<File>()

    const onFinish = async (values: TEmployee) => {
        const formData = new FormData()
        if (employeImage) {
            formData.append("photo", employeImage)
        }
        formData.append("data", JSON.stringify(values))

        const response = await updateEmployee({ data: formData, id: employeeData?.id })
        const res = getResponse(response)
        if (res?.success) {
            form.resetFields()
            setOpenModal(false)
        }
        // form.resetFields();
    };

    return (
        <Form
            form={form}
            layout="vertical"
            initialValues={{
                ...employeeData,
                dob: employeeData?.dob ? dayjs(employeeData.dob) : null, // Convert dob to dayjs
            }}
            onFinish={onFinish}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item label="Name" name={`name`}>
                    <Input placeholder="Enter your name" />
                </Form.Item>
                <Form.Item label="Email" name={`email`}>
                    <Input type="email" disabled placeholder="Enter your email" />
                </Form.Item>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item label="Working Place" name={`workingPlase`}>
                    <Input placeholder="Enter your working place" />
                </Form.Item>
                <Form.Item label="Address" name={`address`}>
                    <Input placeholder="Enter your address" />
                </Form.Item>
            </div>
            <div className="grid grid-cols-1 items-center md:grid-cols-2 gap-4">
                <Form.Item label="Mobile Number" name={`mobile`}>
                    <Input placeholder="Enter your phone" />
                </Form.Item>
                <Form.Item label="DOB" name="dob">
                    <DatePicker style={{ width: "100%" }}
                    // defaultValue={dayjs('2019-09-03', dateFormat)}
                    // minDate={dayjs('2019-08-01', dateFormat)}
                    // maxDate={dayjs('2020-10-31', dateFormat)}
                    />
                </Form.Item>
            </div>
            <div className="grid grid-cols-1 items-start md:grid-cols-2 gap-4">
                <Form.Item label="Nid" name={`nid`}>
                    <Input placeholder="Enter your Nid Number" />
                </Form.Item>
                <div>
                    <label htmlFor="">Upload Image</label>
                    <input
                        className="p-1 mt-2 border-slate-300 cursor-pointer border rounded-md w-full"
                        type="file"
                        onChange={(e: any) => setEmployeImage(e.target.files[0])}
                    />
                </div>
            </div>
            <Form.Item>
                <Button type="primary" htmlType="submit" loading={isLoading}>
                    {isLoading ? "Submitting..." : "Submit"}
                </Button>
            </Form.Item>
        </Form>
    )
}

export default EditEmployee