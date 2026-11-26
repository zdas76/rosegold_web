import React from 'react';
import { Tabs } from 'antd';
import SoapPackaging from './soapPackaging/SoapPackaging';
import DetergentPackaging from './detergentPackaging/DetergentPackaging';

const Packaging: React.FC = () => {
  const tabItems = [
    {
      key: 'soap',
      label: 'Soap Packaging',
      children: <SoapPackaging />,
    },
    {
      key: 'detergent',
      label: 'Detergent Powder Packaging',
      children: <DetergentPackaging />,
    },
  ];

  return (
    <div>
      <Tabs defaultActiveKey="soap" items={tabItems} />
    </div>
  );
};

export default Packaging;
