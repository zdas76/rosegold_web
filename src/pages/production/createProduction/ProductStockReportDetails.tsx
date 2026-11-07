import { useParams, useNavigate } from "react-router";
import { useGetProductStockReportByIdQuery } from "../../../redux/features/product/product.api";
import { Card, Descriptions, Table, Tag, Button, Spin, Empty } from "antd";
import { ArrowLeftOutlined, FallOutlined, RiseOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { ColumnsType } from "antd/es/table";

interface Product {
  id: number;
  name: string;
  description: string;
  subCategoryId: number;
  minPrice: number;
  size: string;
  openingDate: string;
  amount: number;
  quantity: number;
  unitPrice: number;
  unitId: number;
  itemType: string;
  isDeleted: boolean;
  status: string;
  createdAt: string;
  updateAt: string;
}

interface ReportItem {
  id: number;
  date: string;
  productId: number;
  rawId: number | null;
  transactionId: number | null;
  unitPrice: number;
  quantityAdd: number;
  quantityLess: number;
  discount: number;
  debitAmount: number;
  creditAmount: number;
  isClosing: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
  quantityBalance: number;
  amountBalance: number;
}

export default function ProductStockReportDetails() {
  const { productId } = useParams<{ productId: string }>();
  // In v7 useNavigate is exported from react-router natively, and it is a client-rendered feature. 
  // Depending on whether it's using the dom or Native router, this is standard. 
  const navigate = useNavigate();
  const { data, isLoading, isError } = useGetProductStockReportByIdQuery(Number(productId), { skip: !productId });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <Spin size="large" />
      </div>
    );
  }

  if (isError || !data?.success || !data?.data) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <Empty description="Failed to load report or product not found" />
      </div>
    );
  }

  const product: Product = data.data.product;

  let qtybalnce = 0;
  let amountblnce = 0;

  const report: ReportItem[] = data.data.report?.map((item: ReportItem) => {
    qtybalnce += item?.quantityAdd - item?.quantityLess;
    amountblnce += item?.debitAmount - item?.creditAmount;

    return {
      ...item,
      key: item.id,
      quantityBalance: qtybalnce,
      amountBalance: amountblnce,
    }
  });

  const columns: ColumnsType<ReportItem> = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date) => <span className="font-semibold">{dayjs(date).format("DD MMM YYYY")}</span>,
    },
    {
      title: "Stock In (+)",
      dataIndex: "quantityAdd",
      key: "quantityAdd",
      align: "center",
      render: (qty) => (
        <span className={qty > 0 ? "text-green-600 font-semibold" : "text-gray-400"}>
          {qty > 0 && <RiseOutlined className="mr-1" />}
          {qty}
        </span>
      ),
    },
    {
      title: "Stock Out (-)",
      dataIndex: "quantityLess",
      key: "quantityLess",
      align: "center",
      render: (qty) => (
        <span className={qty > 0 ? "text-red-500 font-semibold" : "text-gray-400"}>
          {qty > 0 && <FallOutlined className="mr-1" />}
          {qty}
        </span>
      ),
    },
    {
      title: "QTY Balance",
      dataIndex: "quantityBalance",
      key: "quantityBalance",
      align: "right",
      render: (quantityBalance) => `${quantityBalance?.toFixed(2) || 0}`,
    },
    {
      title: "Debit Amount",
      dataIndex: "debitAmount",
      key: "debitAmount",
      align: "right",
      render: (amount) => <span className="text-green-700 font-semibold font-mono">{`৳ ${amount?.toFixed(2) || 0}`}</span>,
    },
    {
      title: "Credit Amount",
      dataIndex: "creditAmount",
      key: "creditAmount",
      align: "right",
      render: (amount) => <span className="text-red-700 font-semibold font-mono">{`৳ ${amount?.toFixed(2) || 0}`}</span>,
    },
    {
      title: "Amount Balance",
      dataIndex: "amountBalance",
      key: "amountBalance",
      align: "right",
      render: (amountBalance) => <span className="text-green-700 font-semibold font-mono">{`৳ ${amountBalance?.toFixed(2) || 0}`}</span>,
    },

  ];

  return (
    <div className="space-y-2">
      {/* Header Section */}
      <div className="flex items-center space-x-2 mb-2 bg-white rounded-lg px-4 py-2">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          className="rounded-full shadow-sm hover:shadow-md transition-shadow bg-white"
        />
        <h1 className="text-xl font-bold text-gray-800 m-0">Product Ledger Details</h1>
      </div>

      {/* Product Summary Card */}
      <Card className="shadow-sm rounded-xl border-gray-100 overflow-hidden">
        <div className="flex flex-col md:flex-row items-start justify-between mb-2 gap-2">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3 m-0">
              {product.name}
              <Tag color={product.status === "ACTIVE" ? "success" : "default"} className="text-sm px-3 py-0.5 rounded-full">
                {product.status}
              </Tag>
            </h2>
            <p className="text-gray-500 mt-1 mb-0 text-base">{product.description || "No description provided"}</p>
          </div>
          <div className="text-left md:text-right bg-blue-50/80 border border-blue-100 px-3 py-2 rounded-xl shadow-sm">
            <p className="text-xs text-gold-600 font-semibold uppercase tracking-wider m-0">Current Stock</p>
            <p className="text-2xl font-extrabold text-blue-700 m-0 flex items-baseline gap-2">
              {qtybalnce?.toLocaleString()}
              <span className="text-base font-medium text-gold-600">units</span>
            </p>
          </div>
        </div>
        <Descriptions
          column={5}
          size="small"
          layout="vertical"
          className="border-t border-gray-100 pt-3 mt-2"
        >
          <Descriptions.Item label={<span className="text-gray-500 font-medium text-sm">Size</span>} className="pb-0" style={{ paddingBottom: 0 }}>
            <span className="text-base font-semibold text-gray-700">{product.size}</span>
          </Descriptions.Item>
          <Descriptions.Item label={<span className="text-gray-500 font-medium text-sm">Item Type</span>} className="pb-0" style={{ paddingBottom: 0 }}>
            <Tag color="cyan" className="m-0 border-transparent bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded text-xs font-medium">
              {product.itemType}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label={<span className="text-gray-500 font-medium text-sm">Unit Price</span>} className="pb-0" style={{ paddingBottom: 0 }}>
            <span className="text-base font-bold text-gray-800 font-mono">৳ {product.unitPrice?.toLocaleString() || 0}</span>
          </Descriptions.Item>

          <Descriptions.Item label={<span className="text-gray-500 font-medium text-sm">Current Amount</span>} className="pb-0" style={{ paddingBottom: 0 }}>
            <span className={`text-base font-bold ${amountblnce > 0 ? "text-green-700" : "text-red-600"} font-mono`}>৳ {amountblnce?.toFixed(2) || 0}</span>
          </Descriptions.Item>

          <Descriptions.Item label={<span className="text-gray-500 font-medium text-sm">Opening Date</span>} className="pb-0" style={{ paddingBottom: 0 }}>
            <span className="text-base text-gray-700 font-medium">{dayjs(product.openingDate).format("DD MMM YYYY")}</span>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Report Table Card */}
      <Card
        style={{ marginTop: "5px" }}
        title={<span className="text-xl font-bold text-gray-800">Transaction History</span>}
        className="shadow-sm rounded-xl border-gray-100"
        styles={{ header: { borderBottom: '1px solid #f3f4f6', backgroundColor: '#fafafa' } }}>
        <Table
          columns={columns}
          dataSource={report}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} transactions`
          }}
          scroll={{ x: 1000 }}
          bordered={false}
          size="middle"
          rowClassName="hover:bg-gray-50/80 transition-colors" />
      </Card>
    </div>
  );
}
