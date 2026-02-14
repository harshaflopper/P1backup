import React from 'react';

const FacultyTable = ({ faculty, onToggleStatus, onDelete, onViewDuties }) => {
    if (faculty.length === 0) {
        return (
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-8 text-center">
                <div className="w-16 h-16 bg-indigo-100 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="bi bi-people-fill text-2xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-indigo-900">No Faculty Found</h3>
                <p className="text-indigo-600/80">Try adjusting your filters or add a new faculty member.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Initials</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Designation</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Department</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Phone</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {faculty.map(fac => (
                            <tr key={fac._id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="font-semibold text-slate-900">{fac.name}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                                        {fac.initials}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{fac.designation}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{fac.department}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{fac.email || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{fac.phone || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <button
                                        onClick={() => onToggleStatus(fac._id)}
                                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${fac.isActive ? 'bg-green-500' : 'bg-slate-200'}`}
                                    >
                                        <span className="sr-only">Use setting</span>
                                        <span
                                            aria-hidden="true"
                                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${fac.isActive ? 'translate-x-5' : 'translate-x-0'}`}
                                        />
                                    </button>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => onDelete(fac._id)}
                                        className="text-slate-400 hover:text-red-600 transition-colors p-2 rounded-full hover:bg-red-50"
                                        title="Delete Faculty"
                                    >
                                        <i className="bi bi-trash-fill text-lg"></i>
                                    </button>
                                    <button
                                        onClick={() => onViewDuties(fac)}
                                        className="text-slate-400 hover:text-indigo-600 transition-colors p-2 rounded-full hover:bg-indigo-50 ml-1"
                                        title="View Duties"
                                    >
                                        <i className="bi bi-calendar-week-fill text-lg"></i>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default FacultyTable;
