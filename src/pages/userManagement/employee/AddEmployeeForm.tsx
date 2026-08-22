/* eslint-disable @typescript-eslint/no-explicit-any */

import { Form, Input, Button, DatePicker } from "antd";

import { useState } from "react";
import { useCreateEmployeeMutation } from "../../../redux/features/auth/authApi";
import { getResponse } from "../../../utils/getResponse";

interface Employee {
  name: string;
  nid: string;
  email?: string;
  workingPlase: string;
  address: string;
  mobile: string;
  dob: string;
  password: string;
}

interface FormValues {
  employee: Employee;
}

const AddEmployeeForm = ({ setIsModalOpen }: { setIsModalOpen: any }) => {
  const [employeImage, setEmployeImage] = useState<File>();
  const [form] = Form.useForm();
  const [addEmployee, { isLoading }] = useCreateEmployeeMutation();

  const onFinish = async (values: FormValues) => {
    const data = { ...values, employeeType: "employee" }
    const formData: any = new FormData();
    if (employeImage) {
      formData.append("photo", employeImage);
    }
    formData.append("data", JSON.stringify(data));
    const response = await addEmployee(formData);
    const res = getResponse(response);
    if (res?.success) {
      form.resetFields();
      setIsModalOpen(false)
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Form.Item
          label="Name"
          name={["name"]}
          rules={[{ required: true, message: "Please enter your name!" }]}>
          <Input placeholder="Enter your name" />
        </Form.Item>

        <Form.Item
          label="Email"
          name={["email"]}
          rules={[
            { type: "email", message: "Please enter a valid email!" },
          ]}
        >
          <Input type="email" placeholder="Enter your email" />
        </Form.Item>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Form.Item
          label="Password"
          name={["password"]}
          rules={[{ required: true, message: "Please enter your password!" }]}
        >
          <Input.Password placeholder="Enter your password" />
        </Form.Item>

        <Form.Item
          label="NID"
          name={["nid"]}
          rules={[{ required: true, message: "Please enter your NID number!" }]}
        >
          <Input placeholder="Enter your NID number" maxLength={17} />
        </Form.Item>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Form.Item
          label="Phone"
          name={["mobile"]}
          rules={[
            { required: true, message: "Please enter your Phone!" },
          ]}
        >
          <Input placeholder="Enter your working place" maxLength={14} />
        </Form.Item>
        <Form.Item
          label="Address"
          name={["address"]}
          rules={[{ required: true, message: "Please enter your address!" }]}
        >
          <Input placeholder="Enter your address" />
        </Form.Item>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Form.Item
          label="Working Place"
          name={["workingPlase"]}
          rules={[{ required: true, message: "Please enter your working place!" }]}
        >
          <Input placeholder="Enter your working place" />
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Form.Item
          label="Date of Birth (DOB)"
          name={["dob"]}
          rules={[
            { required: true, message: "Please select your date of birth!" },
          ]}
        >
          <DatePicker className="w-full" />
        </Form.Item>
      </div>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={isLoading}>
          {isLoading ? "Submitting..." : "Submit"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default AddEmployeeForm;
