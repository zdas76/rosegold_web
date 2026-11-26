import React, { useState } from 'react';
import { Form, Select, Input, DatePicker, Button, Table } from 'antd';
import { useGetVoucherReportQuery } from '../../../redux/features/transactions/transactons.api';
import { formateData } from '../../../utils/getFormateData';
import { ColumnsType } from 'antd/es/table';
import { Link, } from 'react-router';
import { EyeOutlined, PrinterOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;
const { Search } = Input;

const typeOptions = [
    'SALES',
    'PURCHASE',
    'RECEIPT',
    'PAYMENT',
    'JOURNAL',
    'CONTRA',
    'LOGORADES',
    'CREATEPRODUCT',
];
type TvoucherReport = {
    id: number;
    voucherNo: string;
    invoiceNo: string | null;
    date: string;
    voucherType: string;
    paymentType: string | null;
    createdAt: string;
};

type FilterSearchBarProps = {
    onSearch?: (values: any) => void;
};

const LogVoucherList: React.FC<FilterSearchBarProps> = ({ onSearch }) => {
    const [form] = Form.useForm();
    const [queryParams, setQueryParams] = useState<any>({});
    const { data, isLoading, isFetching } = useGetVoucherReportQuery(queryParams)
    // const allVoucherData = data?.data;
    // const tableData = 
    const tableData = formateData(data?.data, "");

    const handleSearch = () => {
        form.validateFields().then(values => {
            const formattedValues = {
                ...values,
                startDate: values.startDate ? dayjs(values.startDate).format('YYYY-MM-DD') : undefined,
                endDate: values.endDate ? dayjs(values.endDate).format('YYYY-MM-DD') : undefined,
            };
            setQueryParams(formattedValues);
            if (onSearch) {
                onSearch(formattedValues);
            }
        });
    };
    const columns: ColumnsType<TvoucherReport> = [
        {
            title: 'No.',
            dataIndex: 'sNo',
            key: 'sNo',
            render: (_, __, index) => index + 1,
        },
        {
            title: 'Voucher Name',
            dataIndex: 'voucherType',
            key: 'voucherType',
        },
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            render: (date: string) => new Date(date).toLocaleDateString(),
        },
        {
            title: 'Voucher No',
            dataIndex: 'voucherNo',
            key: 'voucherNo',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <div className='flex gap-2'>
                    <Link to={`/dashboard/voucher-details/${record.voucherNo}`} target="_blank">
                        <Button
                            type="primary"
                            size="small"
                            icon={<EyeOutlined />}
                            className="bg-gold-500 hover:bg-gold-600 border-none flex items-center"
                        >
                            View Details
                        </Button>
                    </Link>
                    <Link to={`/dashboard/voucher-details/${record.voucherNo}`} target="_blank">
                        <Button
                            size="small"
                            icon={<PrinterOutlined />}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white border-none flex items-center"
                        >
                            Print
                        </Button>
                    </Link>
                </div>
            ),
        },
    ];

    const handleReset = () => {
        form.resetFields();
        setQueryParams({});
    };

    return (
        <>
            <Form form={form} layout='vertical'>
                <div className='flex gap-3 justify-between items-center'>
                    <div className='grid sm:grid-cols-4 gap-5 w-full font-semibold'>
                        <Form.Item name="type" label="Type" style={{ marginBottom: 0 }}>
                            <Select placeholder="Select Type" style={{ width: '100%' }}>
                                {typeOptions.map(type => (
                                    <Option key={type} value={type}>
                                        {type}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item name="startDate" label="Start Date" style={{ marginBottom: 0 }}>
                            <DatePicker style={{ width: '100%' }} />
                        </Form.Item>
                        <Form.Item name="endDate" label="End Date" style={{ marginBottom: 0 }}>
                            <DatePicker style={{ width: '100%' }} />
                        </Form.Item>

                        <Form.Item name="searchTerm" label="Search" style={{ marginBottom: 0 }}>
                            <Search
                                placeholder="Enter keyword to search"
                                allowClear
                                onSearch={handleSearch}
                                enterButton
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                    </div>
                    {/* Submit Button */}
                    <div className='flex items-end mt-2.5 gap-2'>
                        <Button type="primary" onClick={handleReset} style={{ height: '32px' }}>
                            Reset
                        </Button>
                        <Button type="primary" onClick={handleSearch} style={{ height: '32px' }}>
                            Submit
                        </Button>
                    </div>
                </div>
            </Form>
            <Table
                loading={isLoading || isFetching}
                columns={columns}
                dataSource={tableData}
                rowKey="id"
                pagination={{ pageSize: 15 }}
            />

        </>
    );
};

export default LogVoucherList;
