/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, DatePicker, Form, Input } from "antd";
import { useAddWorkerMutation } from "../../../redux/features/auth/authApi";
import { getResponse } from "../../../utils/getResponse";
import { TWorker } from "../../../types/types";


const AddWorkerForm = ({ setIsModalOpen }: { setIsModalOpen: any }) => {
  const [form] = Form.useForm();
  const [addWorker, { isLoading }] = useAddWorkerMutation();

  const onFinish = async (values: TWorker) => {
    const response = await addWorker(values);
    const res = getResponse(response);
    if (res?.success) {
      form.resetFields();
      setIsModalOpen(false);
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
          label="Phone"
          name={["phone"]}
          rules={[{ required: true, message: "Please enter your Phone!" }]}>
          <Input placeholder="Enter your working place" maxLength={14} />
        </Form.Item>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Form.Item
          label="NID"
          name={["nid"]}
          rules={[{ required: true, message: "Please enter your NID number!" }]}>
          <Input placeholder="Enter your NID number" maxLength={17} />
        </Form.Item>
        <Form.Item
          label="Address"
          name={["address"]}
          rules={[{ required: true, message: "Please enter your address!" }]}>
          <Input placeholder="Enter your address" />
        </Form.Item>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Form.Item
          label="Working Place"
          name={["workingPlace"]}
          rules={[
            { required: true, message: "Please enter your working place!" },
          ]}>
          <Input placeholder="Enter your working place" />
        </Form.Item>
        <Form.Item
          label="Date of Birth (DOB)"
          name={["dob"]}
          rules={[
            { required: true, message: "Please select your date of birth!" },
          ]}>
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
export default AddWorkerForm;
