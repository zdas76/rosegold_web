import { Input, Select, Table, Tag } from "antd";
import {
  useDeletePartyMutation,
  useGetPartiesQuery,
} from "../../../redux/features/auth/authApi";
import Column from "antd/es/table/Column";
import { FaEdit, FaPlus, FaTrash } from "react-icons/fa";
import CommonModal from "../../../components/modals/CommonModal";
import { useEffect, useState } from "react";
import { TParty } from "../../../types/types";
import Swal from "sweetalert2";
import EditPartyForm from "./EditPartyForm.tsx";
import { getResponse } from "../../../utils/getResponse";
import AddSupplierForm from "./addPartyForm.tsx";
import dayjs from "dayjs";

const { Search } = Input;

const Party = () => {
  const [deleteparty] = useDeletePartyMutation();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<string>("desc");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data, isLoading, isFetching } = useGetPartiesQuery({
    partyType: "DISTRIBUTOR",
    searchTerm: debouncedSearch,
    sortBy: "createdAt",
    sortOrder: sortOrder,
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editModalData, setEditModalData] = useState<TParty | null>(null);

  const tableData = data?.data?.map((item: TParty, idx: number) => ({
    key: idx,
    ...item,
  }));

  const handleDelete = (id: number) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#C58D2F",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const res = await deleteparty(id);
        getResponse(res);
      }
    });
  };

  return (
    <div>
      <div className="mb-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="bg-white rounded-lg px-4 py-2">
            <h1 className="font-bold text-lg md:text-xl m-0">Distributor</h1>
          </div>
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            <Search
              placeholder="Search distributor..."
              allowClear
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: 250 }}
            />
            <Select
              defaultValue="desc"
              style={{ width: 120 }}
              onChange={(value) => setSortOrder(value)}
              options={[
                { value: "desc", label: "Newest" },
                { value: "asc", label: "Oldest" },
              ]}
            />
            <CommonModal
              btnClass="px-4 bg-slate-800 text-white py-2"
              title="Add Distributor"
              isModalOpen={isAddModalOpen}
              setIsModalOpen={setIsAddModalOpen}
              btnText={
                <span className="flex items-center gap-1 justify-center">
                  <FaPlus size={10} /> <small>Create Distributor</small>
                </span>
              }
            >
              <AddSupplierForm setIsModalOpen={setIsAddModalOpen} />
            </CommonModal>
          </div>
        </div>
      </div>
      <div className="bg-white p-4 rounded-md shadow pb-1">
        <Table
          dataSource={tableData}
          loading={isFetching || isLoading}
          size="small"
        >
          <Column
            title="Name"
            dataIndex="name"
            key="name"
            className="font-bold"
          />
          <Column title="Contact" dataIndex="contactNo" key="contact" />
          <Column title="Address" dataIndex="address" key="address" />
          <Column
            title="Distributor Type"
            dataIndex="partyType"
            key="Type"
            render={(type) => (
              <Tag color={`${type == "DISTRIBUTOR" ? "indigo" : "blue"}`}>
                {type}
              </Tag>
            )}
          />
          <Column
            title="Create Date"
            dataIndex="createdAt"
            key="categoryName"
            render={(timestamp: string) => (
              <b>{dayjs(timestamp).format("DD-MMM-YYYY")}</b>
            )}
          />
          <Column
            title="Action"
            render={(item: TParty) => (
              <div className="flex gap-4">
                {/* Edit Modal Trigger */}
                <CommonModal
                  title="Edit Distributor"
                  isModalOpen={editModalData?.id === item.id}
                  setIsModalOpen={(state: TParty | null) =>
                    setEditModalData(state ? item : null)
                  }
                  btnText={
                    <span className="flex items-center gap-1 justify-center">
                      <FaEdit size={10} /> Edit
                    </span>
                  }
                >
                  {editModalData && <EditPartyForm item={editModalData} />}
                </CommonModal>

                {/* Delete Button */}
                <button
                  onClick={() => handleDelete(item.id)}
                  className="hover:text-white cursor-pointer flex items-center gap-1 bg-gray-300 p-1 px-2 rounded hover:bg-slate-500"
                >
                  <FaTrash /> Delete
                </button>
              </div>
            )}
          />
        </Table>
      </div>
    </div>
  );
};

export default Party;
