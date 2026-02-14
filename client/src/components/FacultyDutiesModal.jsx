import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FacultyDutiesModal = ({ faculty, onClose }) => {
    const [duties, setDuties] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDuties = async () => {
            try {
                const res = await axios.get(`/api/allocations/faculty/${faculty._id}`);
                setDuties(res.data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };

        if (faculty) {
            fetchDuties();
        }
    }, [faculty]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden transform transition-all scale-100 flex flex-col max-h-[90vh]">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">Exam Duties</h3>
                        <p className="text-sm text-slate-500">
                            Schedule for <span className="font-bold text-slate-900">{faculty.name}</span> ({faculty.initials})
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100"
                    >
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
                        </div>
                    ) : duties.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">
                            <i className="bi bi-calendar-x text-4xl mb-3 block text-slate-300"></i>
                            No duties assigned yet.
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-lg border border-slate-200">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50 text-slate-500">
                                    <tr>
                                        <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider border-b border-slate-200">Date</th>
                                        <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider border-b border-slate-200">Session</th>
                                        <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider border-b border-slate-200">Role</th>
                                        <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider border-b border-slate-200">Room</th>
                                        <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider border-b border-slate-200">Designation Recorded</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {duties.map((duty, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                                                {new Date(duty.date).toLocaleDateString('en-GB', {
                                                    weekday: 'short',
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase ${duty.session === 'morning'
                                                        ? 'bg-amber-100 text-amber-700'
                                                        : 'bg-indigo-100 text-indigo-700'
                                                    }`}>
                                                    {duty.session}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                <span className={`font-bold ${duty.role === 'Deputy' ? 'text-purple-600' : 'text-slate-600'
                                                    }`}>
                                                    {duty.role}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm font-mono font-bold text-slate-700">
                                                {duty.room}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-500 italic">
                                                {duty.designation}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg font-medium text-slate-600 hover:bg-slate-200 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FacultyDutiesModal;
