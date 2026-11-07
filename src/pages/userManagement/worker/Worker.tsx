import { FaEdit, FaPlus, FaTrash } from "react-icons/fa";
import { Button, Table, Tag } from "antd";
import Column from "antd/es/table/Column";
import { useState } from "react";
import { TUser, TWorker } from "../../../types/types";
import {
  useDeleteWorkerMutation,
  useGetWorkersQuery,
} from "../../../redux/features/auth/authApi";
import CommonModal from "../../../components/modals/CommonModal";
import Swal from "sweetalert2";
import { getResponse } from "../../../utils/getResponse";
import AddWorkerForm from "./AddWorkerForm";
import EditWorker from "./EditWorkerForm";

const Worker = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editWorkerData, setEditWorkerData] = useState<TWorker | null>(
    null
  );
  const { data: workers, isFetching, isLoading } = useGetWorkersQuery({});
  const [deleteWorker] = useDeleteWorkerMutation();
  const user = workers?.data;


  const tableData = user?.map((item: TWorker, idx: number) => {
    return {
      key: idx,
      ...item,
    };
  });
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
        const res = await deleteWorker(id);
        getResponse(res);
      }
    });
  };
  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="bg-white rounded-lg px-4 py-2">
          <h1 className="font-bold text-lg md:text-xl m-0">Worker</h1>
        </div>
        <div>
          <CommonModal
            title="Add Worker"
            btnClass="px-4 bg-slate-800 text-white py-2"
            isModalOpen={isModalOpen}
            btnText={
              <span className="text-xs flex items-center gap-2">
                <FaPlus size={10} />
                Add Worker
              </span>
            }
            setIsModalOpen={setIsModalOpen}
          >
            <AddWorkerForm setIsModalOpen={setIsModalOpen} />
          </CommonModal>
        </div>
      </div>
      {/* display workers */}
      <div className="mt-4 bg-white p-4 rounded-md shadow pb-1">
        <Table
          dataSource={tableData}
          loading={isFetching || isLoading}
          className=""
          size="small"
        >
          <Column title="Name" dataIndex="name" key="name" />
          <Column title="NID" dataIndex="nid" key="nid" />
          <Column title="Mobile" dataIndex="phone" key="phone" />
          <Column title="Address" dataIndex="address" key="address" />
          <Column title="Working Place" dataIndex="workingPlace" key="workingPlace" />
          <Column title="Date of Birth" render={(item: TWorker) => item.dob?.split("T")[0]} />
          <Column
            title="Action"
            render={(item: TWorker) => {
              return (
                <div className="space-x-2 text-lg flex gap-2 items-center">
                  <CommonModal
                    btnText={
                      <span className="flex gap-1 items-center">
                        <FaEdit /> <small>Edit</small>
                      </span>
                    }
                    isModalOpen={editWorkerData?.id === item?.id}
                    setIsModalOpen={(state: any) =>
                      setEditWorkerData(state ? item : null)
                    }
                    title="Edit Worker">
                    {editWorkerData && (
                      <EditWorker
                        setOpenModal={setEditWorkerData}
                        workerData={editWorkerData}
                      />
                    )}
                  </CommonModal>
                  <Button
                    onClick={() => handleDelete(item?.id)}
                    className="hover:text-red-500 cursor-pointer flex gap-2 items-center border px-1"
                  >
                    <FaTrash />
                    Delete
                  </Button>
                </div>
              );
            }}
          />
        </Table>
      </div>
    </div>
  );
};

export default Worker;
