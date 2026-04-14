import { createContext, useState, useEffect } from "react";
import { getMe } from "./services/auth.api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // ✅ runs once when app starts — not inside a component that might be blocked
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const data = await getMe();
                setUser(data.user);
            } catch (err) {
                setUser(null); // not logged in, that's fine
            } finally {
                setLoading(false); // ✅ always runs no matter what
            }
        };

        fetchUser();
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, loading, setLoading }}>
            {/* ✅ block ALL children until we know auth status */}
            {loading ? <main><h1>Loading...</h1></main> : children}
        </AuthContext.Provider>
    );
};