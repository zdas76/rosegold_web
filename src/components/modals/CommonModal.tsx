/* eslint-disable @typescript-eslint/no-explicit-any */
import { ReactNode } from 'react';
import { Button, Modal } from 'antd';

const CommonModal = ({ children, btnText, isModalOpen, setIsModalOpen, title, btnClass, modalWidth }: { title: string; children: ReactNode; btnText: string | ReactNode; isModalOpen: boolean; setIsModalOpen: any; btnClass?: string; modalWidth?: string }) => {


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
                title={title || 'Basic Modal'}
                open={isModalOpen}
                onCancel={handleCancel}
                footer={[
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