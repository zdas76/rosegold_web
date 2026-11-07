/* eslint-disable @typescript-eslint/no-explicit-any */
import { ReactNode } from 'react';
import { Button, Modal } from 'antd';

const CommonModal = ({
    children,
    btnText,
    isModalOpen,
    setIsModalOpen,
    title,
    btnClass,
    modalWidth = '650px',
    footer,
    centered = true,
}: {
    title: string;
    children: ReactNode;
    btnText: string | ReactNode;
    isModalOpen: boolean;
    setIsModalOpen: any;
    btnClass?: string;
    modalWidth?: string | number;
    footer?: ReactNode | null;
    centered?: boolean;
}) => {
    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    return (
        <>
            <button className={`border border-slate-200 shadow px-2 py-1 md:text-md flex items-center gap-1 rounded-md font-semibold cursor-pointer ${btnClass && btnClass}`} onClick={showModal}>
                {btnText}
            </button>

            <Modal
                destroyOnClose
                width={modalWidth}
                centered={centered}
                title={title || 'Basic Modal'}
                open={isModalOpen}
                onCancel={handleCancel}
                footer={footer !== undefined ? footer : [
                    <Button key="cancel" onClick={handleCancel}>
                        Cancel
                    </Button>,
                ]}
            >
                {children}
            </Modal>
        </>
    );
};

export default CommonModal;