import React from 'react';

const FacultyTable = ({ faculty, onToggleStatus, onDelete, onViewDuties }) => {
    if (faculty.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-80 rounded-3xl bg-[#0f172a]/60 backdrop-blur-xl border border-slate-800/50">
                <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4">
                    <i className="bi bi-list-ul text-3xl text-slate-600"></i>
                </div>
                <h3 className="text-slate-400 font-medium">Directory Empty</h3>
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Glass Container */}
            <div className="rounded-3xl bg-[#0f172a]/70 backdrop-blur-2xl border border-white/5 overflow-hidden shadow-2xl shadow-black/50">

                {/* Header (Integrated) */}
                <div className="px-8 py-5 border-b border-white/5 flex items-center justify-between bg-[#020617]/30">
                    <div className="flex items-center gap-3">
                        <i className="bi bi-table text-slate-500"></i>
                        <h2 className="text-sm font-bold text-slate-300 uppercase tracking-widest">Personnel List</h2>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-white/5 text-[10px] font-bold text-slate-400 border border-white/5">
                        {faculty.length} RECORDS
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-[11px] text-slate-500 uppercase tracking-wider font-bold border-b border-white/5 bg-[#1e293b]/20">
                                <th className="px-8 py-4 pl-10 w-[30%]">Identity</th>
                                <th className="px-6 py-4 w-[20%]">Role</th>
                                <th className="px-6 py-4 w-[25%]">Department</th>
                                <th className="px-6 py-4 w-[15%] text-center">Status</th>
                                <th className="px-8 py-4 w-[10%] text-right pr-10">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {faculty.map((fac) => (
                                <tr
                                    key={fac._id}
                                    className="group hover:bg-white/[0.02] transition-colors duration-200"
                                >
                                    {/* Identity */}
                                    <td className="px-8 py-4 pl-10">
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 shadow-sm group-hover:border-slate-600 transition-colors">
                                                    {fac.initials}
                                                </div>
                                                {fac.isActive && (
                                                    <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-[#0f172a]"></div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-slate-200 text-sm group-hover:text-white transition-colors">
                                                    {fac.name}
                                                </div>
                                                <div className="text-[10px] text-slate-500 font-mono tracking-wide">
                                                    {fac.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Role */}
                                    <td className="px-6 py-4">
                                        <span className="text-xs text-slate-400 font-medium bg-white/5 px-2 py-1 rounded border border-white/5">
                                            {fac.designation}
                                        </span>
                                    </td>

                                    {/* Department */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                                            <span className="text-xs text-slate-400 font-medium truncate">
                                                {fac.department}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Status Toggle (Pill) */}
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => onToggleStatus(fac._id)}
                                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all ${fac.isActive
                                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                                                    : 'bg-slate-800/50 text-slate-500 border-slate-700 hover:bg-slate-700'
                                                }`}
                                        >
                                            <span className={`w-1.5 h-1.5 rounded-full ${fac.isActive ? 'bg-emerald-400' : 'bg-slate-500'}`}></span>
                                            {fac.isActive ? 'Active' : 'Offline'}
                                        </button>
                                    </td>

                                    {/* Actions */}
                                    <td className="px-8 py-4 pr-10 text-right">
                                        <div className="flex items-center justify-end gap-3 opacity-80 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => onViewDuties(fac)}
                                                className="px-3 py-1.5 rounded-md bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 text-[10px] font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95"
                                            >
                                                DUTIES
                                            </button>
                                            <button
                                                onClick={() => onDelete(fac._id)}
                                                className="px-3 py-1.5 rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-[10px] font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95"
                                            >
                                                DELETE
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default FacultyTable;
