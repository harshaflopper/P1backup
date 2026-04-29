import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navLinkClass = ({ isActive }) =>
        `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 border border-transparent ${isActive
            ? 'bg-retro-blue text-white shadow-paper border-retro-dark'
            : 'text-retro-secondary hover:text-retro-blue hover:bg-retro-blue/10'
        }`;

    return (
        <nav className="h-20 px-8 flex items-center justify-between bg-[#66AB96] backdrop-blur-md border-b-2 border-retro-dark sticky top-0 z-50">

            {/* 1. Brand */}
            <div className="flex items-center gap-4">
                <img src="/sit-logo.png" alt="Siddaganga Institute of Technology" className="w-12 h-12 object-contain filter drop-shadow-sm" />

                <div>
                    <h1 className="text-lg font-black text-retro-dark tracking-tight leading-tight uppercase max-w-[200px] md:max-w-none">Siddaganga Institute of Technology</h1>
                </div>
            </div>

            {/* 2. Navigation Links (Center) */}
            {user && (
                <div className="flex items-center gap-2 bg-retro-white/50 p-1.5 rounded-xl border-2 border-retro-dark/10">
                    <NavLink to="/" className={navLinkClass}>
                        <i className="bi bi-people-fill"></i>
                        <span>Faculty Details</span>
                    </NavLink>

                    {user.role === 'admin' && (
                        <>
                            <NavLink to="/exam-allotment" className={navLinkClass}>
                                <i className="bi bi-clipboard-data-fill"></i>
                                <span>Allotment</span>
                            </NavLink>
                            <NavLink to="/room-allotment" className={navLinkClass}>
                                <i className="bi bi-building-fill"></i>
                                <span>Reports</span>
                            </NavLink>
                        </>
                    )}
                </div>
            )}

            {/* 3. User Profile & Actions (Right) */}
            <div className="flex items-center gap-4">
                {user && (
                    <div className="flex items-center gap-3 bg-retro-white/80 px-3 py-1.5 rounded-full border-2 border-retro-dark">
                        <div className="flex flex-col items-end leading-none">
                            <span className="text-xs font-black text-retro-dark uppercase">{user.username}</span>
                            <span className="text-[10px] font-bold text-retro-secondary uppercase tracking-wider">{user.role}</span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-retro-blue border-2 border-retro-dark flex items-center justify-center text-white font-bold text-xs shadow-sm">
                            {user.username.charAt(0).toUpperCase()}
                        </div>
                    </div>
                )}

                {/* Settings (Admin Only) */}
                {user && user.role === 'admin' && (
                    <NavLink to="/settings" className={({ isActive }) =>
                        `w-10 h-10 flex items-center justify-center rounded-full border-2 border-retro-dark transition-all duration-300 ${isActive
                            ? 'bg-retro-dark text-white shadow-paper'
                            : 'bg-retro-white text-retro-dark hover:bg-retro-blue hover:text-white hover:shadow-paper hover:translate-y-[-2px]'
                        }`
                    }>
                        <i className="bi bi-gear-fill text-lg"></i>
                    </NavLink>
                )}

                {/* Logout Button (For Everyone) */}
                {user && (
                    <button
                        onClick={handleLogout}
                        className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-retro-dark bg-retro-red text-white shadow-paper hover:bg-red-600 hover:translate-y-[-2px] transition-all duration-300"
                        title="Logout"
                    >
                        <i className="bi bi-box-arrow-right text-lg"></i>
                    </button>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
