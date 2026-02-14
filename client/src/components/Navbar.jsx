import React from 'react';
import { NavLink } from 'react-router-dom';

const Navbar = () => {
    const navLinkClass = ({ isActive }) =>
        `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 border border-transparent ${isActive
            ? 'bg-retro-blue text-white shadow-paper border-retro-dark'
            : 'text-retro-secondary hover:text-retro-blue hover:bg-retro-blue/10'
        }`;

    return (
        <nav className="h-20 px-8 flex items-center justify-between bg-retro-cream/90 backdrop-blur-md border-b-2 border-retro-dark sticky top-0 z-50">

            {/* 1. Brand */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-retro-blue border-2 border-retro-dark flex items-center justify-center text-white shadow-paper">
                    <i className="bi bi-grid-fill text-lg"></i>
                </div>
                <div>
                    <h1 className="text-xl font-black text-retro-dark tracking-tight leading-none uppercase">ExamSys</h1>
                    <p className="text-[10px] font-bold text-retro-red tracking-[0.2em] uppercase mt-1">Enterprise</p>
                </div>
            </div>

            {/* 2. Navigation Links (Center) */}
            <div className="flex items-center gap-2 bg-retro-white/50 p-1.5 rounded-xl border-2 border-retro-dark/10">
                <NavLink to="/" className={navLinkClass}>
                    <i className="bi bi-people-fill"></i>
                    <span>Directory</span>
                </NavLink>
                <NavLink to="/exam-allotment" className={navLinkClass}>
                    <i className="bi bi-clipboard-data-fill"></i>
                    <span>Allotment</span>
                </NavLink>
                <NavLink to="/room-allotment" className={navLinkClass}>
                    <i className="bi bi-building-fill"></i>
                    <span>Rooms</span>
                </NavLink>
                <div className="w-px h-5 bg-retro-dark/20 mx-1"></div>
                <NavLink to="/reports" className={navLinkClass}>
                    <i className="bi bi-pie-chart-fill"></i>
                    <span>Reports</span>
                </NavLink>
            </div>

            {/* 3. User Profile (Right) */}
            <div className="flex items-center gap-4">
                <button className="w-10 h-10 rounded-full bg-white border-2 border-retro-border text-retro-secondary hover:text-retro-blue hover:border-retro-blue transition-colors flex items-center justify-center">
                    <i className="bi bi-bell-fill"></i>
                </button>
                <div className="flex items-center gap-3 pl-4 border-l-2 border-retro-dark/10">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-bold text-retro-dark">Administrator</p>
                        <p className="text-[10px] text-retro-blue font-bold uppercase tracking-wider">System Online</p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-retro-dark border-2 border-retro-border flex items-center justify-center text-xs font-bold text-white shadow-sm">
                        AD
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
