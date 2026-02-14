import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
    // Professional Nav Item Styles
    const navLinkClass = ({ isActive }) =>
        `relative flex items-center gap-3 px-4 py-3 mx-3 rounded-lg text-sm font-medium transition-all duration-200 group ${isActive
            ? 'bg-slate-800 text-white shadow-lg shadow-black/20'
            : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
        }`;

    return (
        <aside className="w-72 h-screen flex flex-col bg-[#0f172a]/90 backdrop-blur-2xl border-r border-white/5 relative z-30 shrink-0">

            {/* 1. Header / Brand */}
            <div className="h-24 flex items-center px-8 border-b border-white/5">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                        <i className="bi bi-grid-1x2-fill text-lg"></i>
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-white tracking-tight">ExamSys</h1>
                        <p className="text-[10px] font-bold text-slate-500 tracking-[0.2em] uppercase">Enterprise</p>
                    </div>
                </div>
            </div>

            {/* 2. Navigation Scroll Area */}
            <div className="flex-1 overflow-y-auto py-8">

                {/* Section: Main Modules */}
                <div className="mb-8">
                    <div className="px-8 mb-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        Core Modules
                    </div>
                    <nav className="space-y-1">
                        <NavLink to="/" className={navLinkClass}>
                            <i className="bi bi-people text-lg opacity-70"></i>
                            <span>Faculty Directory</span>
                            {/* Active Indicator Line (Left) */}
                            {({ isActive }) => isActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-indigo-500"></div>
                            )}
                        </NavLink>

                        <NavLink to="/exam-allotment" className={navLinkClass}>
                            <i className="bi bi-clipboard-data text-lg opacity-70"></i>
                            <span>Exam Allotment</span>
                            {({ isActive }) => isActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-indigo-500"></div>
                            )}
                        </NavLink>

                        <NavLink to="/room-allotment" className={navLinkClass}>
                            <i className="bi bi-building text-lg opacity-70"></i>
                            <span>Room Matrix</span>
                            {({ isActive }) => isActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-indigo-500"></div>
                            )}
                        </NavLink>
                    </nav>
                </div>

                {/* Section: Administration */}
                <div>
                    <div className="px-8 mb-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        System
                    </div>
                    <nav className="space-y-1">
                        <NavLink to="/reports" className={navLinkClass}>
                            <i className="bi bi-file-earmark-bar-graph text-lg opacity-70"></i>
                            <span>Reports & Logs</span>
                        </NavLink>
                        <NavLink to="/settings" className={navLinkClass}>
                            <i className="bi bi-gear text-lg opacity-70"></i>
                            <span>Configuration</span>
                        </NavLink>
                    </nav>
                </div>

            </div>

            {/* 3. User Profile (Bottom Dock) */}
            <div className="p-4 mt-auto">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#1e293b]/50 border border-white/5 hover:bg-[#1e293b] transition-all cursor-pointer group shadow-lg">
                    <div className="w-10 h-10 rounded-full bg-slate-700/50 flex items-center justify-center text-xs font-bold text-slate-300 ring-2 ring-[#0b1121]">
                        AD
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">Administrator</p>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgb(16,185,129)]"></span>
                            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">System Online</p>
                        </div>
                    </div>
                    <i className="bi bi-box-arrow-right text-slate-500 group-hover:text-white transition-colors"></i>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
