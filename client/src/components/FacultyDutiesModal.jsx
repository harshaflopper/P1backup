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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-retro-dark/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-200">
            <div className="bg-retro-white rounded-xl shadow-paper border-2 border-retro-dark w-full max-w-4xl overflow-hidden transform transition-all scale-100 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                <div className="px-8 py-5 border-b-2 border-retro-dark flex justify-between items-center bg-retro-cream/50">
                    <div>
                        <h3 className="text-xl font-black text-retro-dark uppercase tracking-tight">Exam Duties</h3>
                        <p className="text-xs font-bold text-retro-secondary uppercase tracking-widest mt-1">
                            Schedule for <span className="text-retro-blue">{faculty.name}</span> ({faculty.initials})
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-retro-secondary hover:text-retro-red transition-colors w-10 h-10 flex items-center justify-center rounded-lg hover:bg-retro-dark/5 border-2 border-transparent hover:border-retro-dark"
                    >
                        <i className="bi bi-x-lg text-lg"></i>
                    </button>
                </div>

                <div className="p-8 overflow-y-auto flex-1 bg-retro-white">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-retro-dark border-t-retro-blue"></div>
                        </div>
                    ) : duties.length === 0 ? (
                        <div className="text-center py-16 flex flex-col items-center gap-4">
                            <div className="w-20 h-20 rounded-full bg-retro-cream border-2 border-retro-dark flex items-center justify-center text-retro-secondary">
                                <i className="bi bi-calendar-x text-4xl"></i>
                            </div>
                            <div>
                                <h4 className="font-black text-retro-dark text-lg uppercase tracking-tight">No Duties Found</h4>
                                <p className="text-retro-secondary font-bold text-sm">This faculty member has not been assigned any duties yet.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-xl border-2 border-retro-dark shadow-sm">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-retro-cream text-retro-secondary">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider border-b-2 border-retro-dark">Date</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider border-b-2 border-retro-dark">Session</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider border-b-2 border-retro-dark">Role</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider border-b-2 border-retro-dark">Room</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider border-b-2 border-retro-dark">Recorded As</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-retro-dark/10 bg-retro-white">
                                    {duties.map((duty, idx) => (
                                        <tr key={idx} className="hover:bg-retro-cream/30 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-retro-dark text-sm">
                                                    {new Date(duty.date).toLocaleDateString('en-GB', {
                                                        weekday: 'short',
                                                        day: 'numeric',
                                                        month: 'short'
                                                    })}
                                                </div>
                                                <div className="text-[10px] font-bold text-retro-secondary uppercase tracking-wider">
                                                    {new Date(duty.date).getFullYear()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border-2 ${duty.session === 'morning' || duty.session === 'Morning'
                                                    ? 'bg-retro-blue/10 text-retro-blue border-retro-blue'
                                                    : 'bg-retro-red/10 text-retro-red border-retro-red'
                                                    }`}>
                                                    {duty.session}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`font-black text-xs uppercase tracking-wide ${duty.role === 'Deputy' ? 'text-purple-600' : 'text-retro-dark'
                                                    }`}>
                                                    {duty.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-mono font-bold text-retro-dark bg-retro-cream px-2 py-1 rounded border border-retro-dark/20 inline-block text-xs">
                                                    {duty.room}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-xs font-bold text-retro-secondary italic">
                                                {duty.designation}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="px-8 py-5 bg-retro-cream/30 border-t-2 border-retro-dark flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 rounded-lg font-black text-retro-dark bg-retro-white border-2 border-retro-dark hover:bg-retro-dark hover:text-retro-white shadow-paper active:translate-y-[0px] hover:translate-y-[-2px] transition-all uppercase tracking-wider text-xs"
                    >
                        Close Window
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FacultyDutiesModal;
