import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const Loading = ({ 
    tip = "Loading...", 
    minHeight = "400px",
    size = "large" 
}: { 
    tip?: string; 
    minHeight?: string;
    size?: "small" | "default" | "large";
}) => {
    const antIcon = <LoadingOutlined style={{ fontSize: size === "large" ? 48 : 24 }} spin />;

    return (
        <div 
            style={{ 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: minHeight,
                width: '100%'
            }}
            className="loading-container"
        >
            <Spin indicator={antIcon} tip={tip} size={size} />
            {tip && <p className="mt-4 text-gray-500 font-medium tracking-wide uppercase text-xs">{tip}</p>}
        </div>
    );
};

export default Loading;
