import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            console.log("Token found:", token); // DEBUG
            try {
                const decoded = jwtDecode(token);
                console.log("Decoded Token:", decoded); // DEBUG

                // Check expiry if needed (decoded.exp)

                // Validate token structure (legacy tokens might lack role/username)
                if (!decoded.role || !decoded.username) {
                    throw new Error("Invalid token structure (missing fields)");
                }

                // Set user state from decoded token
                setUser({
                    id: decoded.id,
                    username: decoded.username,
                    role: decoded.role
                });

                // Add token to axios default headers
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            } catch (error) {
                console.error('Invalid token on load:', error);
                localStorage.removeItem('token');
                setUser(null);
                delete axios.defaults.headers.common['Authorization'];
            }
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            const { data } = await axios.post('/api/auth/login', { username, password });
            localStorage.setItem('token', data.token);

            // Set user state
            // Provide consistent user object structure from both login response and decoded token
            const userPayload = {
                id: data._id,
                username: data.username,
                role: data.role
            };
            setUser(userPayload);

            axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
            return { success: true };
        } catch (error) {
            console.error('Login failed', error);
            const msg = error.response && error.response.data.msg
                ? error.response.data.msg
                : 'Login failed';
            return { success: false, msg };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
