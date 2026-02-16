import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-[#66AB96]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-retro-dark border-t-retro-white rounded-full animate-spin"></div>
                    <p className="text-retro-dark font-black uppercase tracking-widest text-xs">Verifying Credentials...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (adminOnly && user.role !== 'admin') {
        // Redirect non-admins to home if they try to access admin routes
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
