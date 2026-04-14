import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router";

const Protected = ({ children }) => {
    const { user } = useAuth(); // ✅ no need to check loading here anymore

    if (!user) {
        return <Navigate to="/login" />;
    }

    return children;
};

export default Protected;