import React from 'react';
import { NavLink } from 'react-router-dom';

const Navbar = () => {
    const navLinkClass = ({ isActive }) =>
        `flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${isActive
            ? 'bg-[#1e293b] text-white shadow-lg shadow-black/20 ring-1 ring-white/10'
            : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
        }`;

    return (
        <nav className="h-20 px-8 flex items-center justify-between bg-[#0b1121]/90 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50">

            {/* 1. Brand */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(124,58,237,0.3)]">
                    <i className="bi bi-grid-fill text-lg"></i>
                </div>
                <div>
                    <h1 className="text-lg font-bold text-white tracking-tight leading-none">ExamSys</h1>
                    <p className="text-[9px] font-bold text-slate-500 tracking-[0.2em] uppercase mt-1">Enterprise</p>
                </div>
            </div>

            {/* 2. Navigation Links (Center) */}
            <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-full border border-white/5 backdrop-blur-md">
                <NavLink to="/" className={navLinkClass}>
                    <i className="bi bi-people"></i>
                    <span>Directory</span>
                </NavLink>
                <NavLink to="/exam-allotment" className={navLinkClass}>
                    <i className="bi bi-clipboard-data"></i>
                    <span>Allotment</span>
                </NavLink>
                <NavLink to="/room-allotment" className={navLinkClass}>
                    <i className="bi bi-building"></i>
                    <span>Rooms</span>
                </NavLink>
                <div className="w-px h-5 bg-white/10 mx-1"></div>
                <NavLink to="/reports" className={navLinkClass}>
                    <i className="bi bi-file-earmark-bar-graph"></i>
                    <span>Reports</span>
                </NavLink>
            </div>

            {/* 3. User Profile (Right) */}
            <div className="flex items-center gap-4">
                <button className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 transition-colors">
                    <i className="bi bi-bell"></i>
                </button>
                <div className="flex items-center gap-3 pl-4 border-l border-white/5">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-bold text-slate-200">Administrator</p>
                        <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">System Online</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                        AD
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
