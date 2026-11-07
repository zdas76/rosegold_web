
import { TAccountsItem, TPiller } from '../../types/types'
import { Button, Form, FormProps, Input, Select } from 'antd'
import { useGetPillersQuery, useUpdateAccountItemMutation } from '../../redux/features/transactions/transactons.api'
import { getResponse } from '../../utils/getResponse'
import { toast } from 'sonner'

const EditAccountsItem = ({ item, setModalOpen }: { item: TAccountsItem, setModalOpen: (item: TAccountsItem | null) => void }) => {

    const { data } = useGetPillersQuery({})
    const [updateAccountItem, { isLoading: isUpdating }] = useUpdateAccountItemMutation()
    const ledger = data?.data;
    const ledgerHead = ledger?.map((piller: TPiller) => {
        return {
            key: piller?.id,
            value: piller?.headId,
            label: piller?.headName
        }
    });

    const onFinish: FormProps['onFinish'] = async (values) => {
        const updateData = {
            ...values,
            id: item.id
        }
        const res = await updateAccountItem(updateData)
        const result = getResponse(res)
        if (result?.success) {
            toast.success("Accounts Item Updated successfully")
            setModalOpen(null)
        }
    };
    return (
        <div>
            <Form
                name="basic"
                layout="vertical"
                wrapperCol={{ span: 24 }}
                style={{ maxWidth: 600 }}
                initialValues={item}
                onFinish={onFinish}
                autoComplete="off">
                <Form.Item
                    label="Accounts Item Name"
                    name="accountsItemName"
                    rules={[{ required: true, message: 'Please account item name' }]}>
                    <Input placeholder="Accounts Item Name" />
                </Form.Item>
                <Form.Item
                    label="Account Head"
                    name={`accountHeadId`}
                    rules={[{ required: true, message: 'Please a Account head' }]}>
                    <Select options={ledgerHead} />
                </Form.Item>
                <Form.Item label={null}>
                    <Button type="primary" htmlType="submit" loading={isUpdating}>
                        Submit
                    </Button>
                </Form.Item>
            </Form>
        </div>
    )
}

export default EditAccountsItem