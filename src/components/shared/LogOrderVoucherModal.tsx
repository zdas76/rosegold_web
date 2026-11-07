
import { Button, Modal } from 'antd';
import { Link } from 'react-router';

const VoucherModal = ({ isModalOpen, setIsModalOpen, voucherNo }: any) => {
    console.log("voucherNo", voucherNo)

    const showModal = () => {
        setIsModalOpen(true);
    };

    //   const handleOk = () => {
    //     setIsModalOpen(false);
    //   };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    return (
        <>
            <Button type="primary" onClick={showModal}>
                {/* Go To Voucher */}
            </Button>
            <Modal

                // title="Basic Modal"
                closable={{ 'aria-label': 'Custom Close Button' }}
                open={isModalOpen}
                // onOk={handleOk}
                onCancel={handleCancel}
                footer={null}>

                <div className='flex gap-10 justify-center py-20'>
                    <Link to={`/dashboard/voucher-details/${voucherNo}`} className='px-3 py-1 border rounded'>Go To Voucher</Link>
                    <button onClick={() => handleCancel()} className='bg-gold-600 text-white px-3 py-1 rounded cursor-pointer hover:bg-gold-800'>Add More</button>
                </div>

            </Modal>
        </>
    );
};

export default VoucherModal;