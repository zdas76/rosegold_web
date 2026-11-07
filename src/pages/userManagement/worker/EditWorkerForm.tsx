import { Button, DatePicker, Form, Input } from "antd";
import { useUpdateWorkerMutation } from "../../../redux/features/auth/authApi";
import { TWorker } from "../../../types/types";
import { getResponse } from "../../../utils/getResponse";
import dayjs from "dayjs";

const EditWorker = ({
  workerData,
  setOpenModal,
}: {
    workerData: TWorker;
  setOpenModal: any;
}) => {
  const [form] = Form.useForm();
  const [updateWorker, { isLoading }] = useUpdateWorkerMutation();

  const onFinish = async (values: any) => {
    const formattedValues = {
      ...values,
      dob: values.dob ? dayjs(values.dob).format("YYYY-MM-DD") : null,
    };
    const response = await updateWorker({
      data: formattedValues,
      id: workerData?.id,
    });
    const res = getResponse(response);
    if (res?.success) {
      form.resetFields();
      setOpenModal(false);
    }
    // form.resetFields();
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        ...workerData,
        dob: workerData?.dob ? dayjs(workerData.dob) : null,
      }}
      onFinish={onFinish}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Form.Item label="Name" name={`name`}>
          <Input placeholder="Enter your name" />
        </Form.Item>
        <Form.Item label="Mobile Number" name={`phone`}>
          <Input placeholder="Enter your phone" />
        </Form.Item>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Form.Item label="Working Place" name={`workingPlace`}>
          <Input placeholder="Enter your working place" />
        </Form.Item>
        <Form.Item label="Address" name={`address`}>
          <Input placeholder="Enter your address" />
        </Form.Item>
      </div>
      <div className="grid grid-cols-1 items-center md:grid-cols-2 gap-4">
        <Form.Item label="Nid" name={`nid`}>
          <Input placeholder="Enter your Nid Number" />
        </Form.Item>
        <Form.Item label="DOB" name="dob">
          <DatePicker
            style={{ width: "100%" }}
            // defaultValue={dayjs('2019-09-03', dateFormat)}
            // minDate={dayjs('2019-08-01', dateFormat)}
            // maxDate={dayjs('2020-10-31', dateFormat)}
          />
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

export default EditWorker;
