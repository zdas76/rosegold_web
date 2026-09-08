import React from "react";
import { Modal, Button } from "antd";
import { FileAddOutlined } from "@ant-design/icons";
import { Link } from "react-router";

interface PostSubmitModalProps {
    isOpen: boolean;
    onClose: () => void;
    voucherNo?: string;
    onNewVoucher: () => void;
}

const PostSubmitModal: React.FC<PostSubmitModalProps> = ({
    isOpen,
    onClose,
    voucherNo,
    onNewVoucher,
}) => {
    return (
        <Modal
            title="Submission Successful"
            open={isOpen}
            onCancel={onClose}
            footer={null}
            centered
        >
            <div className="flex flex-col items-center gap-4 py-6">
                <p className="text-lg text-gray-600">What would you like to do next?</p>
                <div className="flex gap-4">
                    <Link to={`/dashboard/voucher-details/${voucherNo}`}
                        target="_blank"
                        className="flex items-center">
                        Go To Print Voucher
                    </Link>

                    <Button
                        type="primary"
                        icon={<FileAddOutlined />}
                        onClick={onNewVoucher}
                        className="bg-black text-white flex items-center">
                        New Voucher
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default PostSubmitModal;
