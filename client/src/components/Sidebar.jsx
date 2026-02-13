import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
    const navLinkClass = ({ isActive }) =>
        `flex items-center px-4 py-3 mb-1 rounded-xl transition-all duration-200 group ${isActive
            ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30'
            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
        }`;

    return (
        <aside className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 h-screen transition-all duration-300">
            {/* Logo Area */}
            <div className="p-6">
                <a href="/" className="flex items-center gap-3 text-white decoration-none hover:opacity-90 transition">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-brand-500/20">
                        <i className="bi bi-mortarboard-fill text-xl text-white"></i>
                    </div>
                    <div>
                        <h1 className="text-lg font-bold tracking-tight leading-none">ExamSys</h1>
                        <span className="text-xs text-slate-500 font-medium">Management Console</span>
                    </div>
                </a>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 px-2">Main Menu</div>

                <NavLink to="/" className={navLinkClass}>
                    <i className="bi bi-people-fill text-lg opacity-70 group-hover:opacity-100 transition-opacity mr-3"></i>
                    <span className="font-medium">Faculty</span>
                </NavLink>

                <NavLink to="/exam-allotment" className={navLinkClass}>
                    <i className="bi bi-calendar-check-fill text-lg opacity-70 group-hover:opacity-100 transition-opacity mr-3"></i>
                    <span className="font-medium">Exam Allotment</span>
                </NavLink>

                <NavLink to="/room-allotment" className={navLinkClass}>
                    <i className="bi bi-door-open-fill text-lg opacity-70 group-hover:opacity-100 transition-opacity mr-3"></i>
                    <span className="font-medium">Room Allotment</span>
                </NavLink>
            </nav>

            {/* User Profile / Bottom Section */}
            <div className="p-4 border-t border-slate-800">
                <button className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-slate-800 transition-colors group">
                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 group-hover:text-white group-hover:bg-slate-600 transition">
                        <i className="bi bi-person-fill text-lg"></i>
                    </div>
                    <div className="text-left flex-1">
                        <p className="text-sm font-semibold text-white group-hover:text-brand-100 transition">Admin User</p>
                        <p className="text-xs text-slate-500">View Profile</p>
                    </div>
                    <i className="bi bi-three-dots-vertical text-slate-500"></i>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
