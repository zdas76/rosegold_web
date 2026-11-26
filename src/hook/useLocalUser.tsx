import { useAppSelector } from "../redux/hooks";
import { Department } from "../pages/store RMPM/productTransfer/types";

export const useLocalUser = () => {
    const { department, user, token } = useAppSelector((state) => state.auth);

    return {
        department: (department || "") as Department | string,
        user,
        token
    };
};

export default useLocalUser;
