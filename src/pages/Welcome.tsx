import LoginPage from "./loginRegister/Login";
import AuthLayout from "../components/shared/AuthLayout";

const Welcome = () => {
    return (
        <AuthLayout
            title="Welcome Back"
            subtitle="Sign in to your account to continue">
            <LoginPage />
        </AuthLayout>
    );
};

export default Welcome;