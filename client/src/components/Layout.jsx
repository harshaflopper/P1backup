import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
            {/* Sidebar Component - Fixed width handled internally by Sidebar or flex-none */}
            <Sidebar />

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* Top Header */}
                <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <span className="text-slate-400 font-medium text-sm tracking-wide">DASHBOARD</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="w-8 h-8 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 transition relative">
                            <i className="bi bi-bell-fill"></i>
                            <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 transition">
                            <i className="bi bi-gear-fill"></i>
                        </button>
                    </div>
                </header>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 scroll-smooth">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Layout;
