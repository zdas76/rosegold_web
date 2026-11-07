
interface ProtectedRouteProps {
    allowedRoles: string[];
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({  children }) => {
    // const navigate = useNavigate()
    // const user = useSelector((state: RootState) => state.auth.user);
    // useEffect(() => {
    //     if (!user || !allowedRoles.includes(user.role)) {
    //         navigate("/")
    //     }
    // }, [user, allowedRoles, navigate]);

    // if (!user || !allowedRoles.includes(user.role)) {
    //     navigate("/"); // Prevent rendering unauthorized content
    // }
    // else {
    //     return <>{children}</>;
    // }
    return <>{children}</>; // Placeholder for actual implementation
};

export default ProtectedRoute;
