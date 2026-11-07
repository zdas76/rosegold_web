import React, { useState } from 'react';
import { Form, Select, Input, DatePicker, Button, Table } from 'antd';
import { useGetAllLogOrderVoucherQuery } from '../../../redux/features/logAndGrade/LogAndGrade.api';
import { ColumnsType } from 'antd/es/table';
import { Link } from 'react-router';
import { EyeOutlined, PrinterOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useDebounce } from '../../../hook/useDevounch';

const { Search } = Input;
const LogVoucherList = () => {
    const [form] = Form.useForm();
    const [queryParams, setQueryParams] = useState<any>({});
    const debouncedQueryParams = useDebounce(queryParams);
    const { data: voucherData, isLoading, isFetching } = useGetAllLogOrderVoucherQuery(debouncedQueryParams);

    const handleReset = () => {
        form.resetFields();
        setQueryParams({});
    };
    const columns: ColumnsType<any> = [
        // ... (columns remain unchanged, showing them here for context in real implementation)
        {
            title: 'No.',
            dataIndex: 'sNo',
            key: 'sNo',
            align: 'center',
            width: 70,
            render: (_, __, index) => index + 1,
        },
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            render: (date: string) => date ? dayjs(date).format('DD-MM-YYYY') : "-",
        },
        {
            title: 'Voucher No',
            dataIndex: 'voucherNo',
            key: 'voucherNo',
            className: 'font-semibold',
        },
        {
            title: 'Invoice No',
            dataIndex: 'invoiceNo',
            key: 'invoiceNo',
        },
        {
            title: 'Party Name',
            dataIndex: ['party', 'name'],
            key: 'partyName',
        },
        {
            title: 'Contact No',
            dataIndex: ['party', 'contactNo'],
            key: 'contactNo',
        },
        {
            title: 'Address',
            dataIndex: ['party', 'address'],
            key: 'address',
        },
        {
            title: 'Actions',
            key: 'actions',
            align: 'center',
            render: (_, record) => (
                <div className='flex gap-2 justify-center'>
                    <Link to={`/dashboard/voucher-details/${record.voucherNo}`} target="_blank">
                        <Button
                            type="primary"
                            size="small"
                            icon={<EyeOutlined />}
                            className="bg-gold-500 hover:bg-gold-600 border-none flex items-center"
                        >
                            View
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

    return (
        <div className="p-4">
            <div className="bg-white p-3 rounded-lg shadow-sm mb-3">
                <Form form={form} layout='vertical'>
                    <div className='flex items-center gap-4 sm:gap-8'>
                        <div className='flex gap-2 sm:gap-4 items-center justify-between w-full'>
                            {/* <Form.Item name="searchTerm" label="Party Name" style={{ marginBottom: 0, minWidth: '200px' }}>
                            <Select
                                showSearch
                                placeholder="Select Party"
                                optionFilterProp="children"
                                allowClear
                                style={{ width: '100%' }}
                            >
                                {allSuppliers.map((party: TParty) => (
                                    <Option key={party.id} value={party.name}>
                                        {party.name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item> */}
                            <Form.Item name="searchTerm" label="Search" style={{ marginBottom: 0, width: '100%' }}>
                                <Search
                                    onChange={(e) => {
                                        setQueryParams({ searchTerm: e.target.value })
                                    }}
                                    placeholder="Voucher Number / Party Name"
                                    allowClear
                                    enterButton
                                />
                            </Form.Item>
                            <Form.Item name="startDate" label="Start Date" style={{ marginBottom: 0, width: '50%' }}>
                                <DatePicker style={{ width: '100%' }} onChange={(e) => setQueryParams({ startDate: e?.toDate() })} />
                            </Form.Item>
                            <Form.Item name="endDate" label="End Date" style={{ marginBottom: 0, width: '50%' }}>
                                <DatePicker style={{ width: '100%' }} onChange={(e) => setQueryParams({ endDate: e?.toDate() })} />
                            </Form.Item>

                        </div>
                        <div className='flex gap-2 mt-3'>
                            <Button onClick={handleReset} style={{ width: "200px", background: "#C58D2F", color: "white" }}>
                                Reset
                            </Button>
                        </div>
                    </div>
                </Form> 
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden p-4">
                <Table
                    loading={isLoading || isFetching}
                    columns={columns}
                    dataSource={voucherData?.data}
                    rowKey="id"
                    pagination={{
                        pageSize: 15,
                        showSizeChanger: true,
                        pageSizeOptions: ['15', '30', '50', '100'],
                    }}
                    bordered
                    size="small"
                />
            </div>
        </div>
    );
};

export default LogVoucherList;