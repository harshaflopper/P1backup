import React, { useState } from 'react';
import axios from 'axios';
import { parseSessionData } from '../utils/documentParser';
import { generateRoomReport, generateDepartmentReport } from '../utils/exportUtils';

const ROOM_LIST = [
    'GJCB101', 'GJCB102', 'GJCB105', 'GJCB106', 'GJCB107', 'GJCB201', 'GJCB202', 'GJCB205', 'GJCB207', 'GJCB208',
    'GJCB301', 'GJCB302', 'GJCB305', 'GJCB307', 'GJCB308', 'GJCB401', 'GJCB402', 'GJCB405', 'GJCB407', 'GJCB408',
    'CSL001', 'CSL002', 'CSL003', 'CSL101', 'CSL102', 'CSL103', 'CSL104', 'CSL105',
    'ISE301', 'ISE302', 'ISE303', 'ISE304', 'ISE305', 'ISE306',
    'E&C201A', 'E&C201B', 'E&C301A', 'E&C301B', 'E&C302', 'E&C402', 'E&C403', 'E&C404', 'E&C405', 'E&C406', 'E&C407',
    'TEL101A', 'TEL101B',
    'MEL102', 'MEL103', 'MEL301', 'MEL302', 'MEL303', 'MEL306', 'MEL307',
    'CHL201', 'CHL202', 'CHL203', 'CHL204'
];

const RoomAllotment = () => {
    const [sessionData, setSessionData] = useState({});
    const [status, setStatus] = useState('');

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target.result;
            const parsedData = parseSessionData(content);
            setSessionData(parsedData);
            setStatus(`Loaded data for ${Object.keys(parsedData).length} dates.`);
        };
        reader.readAsText(file);
    };

    const handleRandomize = () => {
        const newSessionData = { ...sessionData };

        Object.keys(newSessionData).forEach(date => {
            Object.keys(newSessionData[date]).forEach(session => {
                const sessionInfo = newSessionData[date][session];

                if (sessionInfo.invigilators && sessionInfo.invigilators.length > 0) {
                    // Shuffle Invigilators
                    let invigilators = [...sessionInfo.invigilators];
                    for (let i = invigilators.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [invigilators[i], invigilators[j]] = [invigilators[j], invigilators[i]];
                    }

                    // Assign Rooms
                    const numberOfRooms = parseInt(sessionInfo.examInfo.rooms) || 0;
                    let i = 0; // invigilator index
                    let r = 0; // room index
                    let allocated = 0;

                    while (allocated < numberOfRooms && r < ROOM_LIST.length && i < invigilators.length) {
                        // Allocate 5 rooms (or remaining)
                        for (let k = 0; k < 5 && allocated < numberOfRooms && r < ROOM_LIST.length && i < invigilators.length; k++) {
                            invigilators[i].room = ROOM_LIST[r];
                            i++;
                            r++;
                            allocated++;
                        }

                        // Allocate 1 Reliever
                        if (allocated < numberOfRooms && i < invigilators.length) {
                            invigilators[i].room = 'Reliever';
                            i++;
                        }
                    }

                    // Mark rest as Extra
                    while (i < invigilators.length) {
                        invigilators[i].room = 'Extra';
                        i++;
                    }

                    // Renumber Sl No
                    invigilators.forEach((inv, idx) => inv.slNo = idx + 1);

                    sessionInfo.invigilators = invigilators;
                }
            });
        });

        setSessionData(newSessionData);
        setSessionData(newSessionData);
        alert('Randomization Complete!');
    };

    const handleSaveToDB = async () => {
        try {
            console.log('Sending sessionData:', JSON.stringify(sessionData, null, 2));
            const res = await axios.post('/api/allocations', sessionData);
            alert(`Allocations saved! Stats: ${JSON.stringify(res.data.stats)}`);
        } catch (err) {
            console.error('Save Error:', err);
            const errMsg = err.response?.data?.msg || err.response?.data || err.message;
            alert(`Error saving allocations: ${errMsg}`);
        }
    };

    const handleClearDB = async () => {
        if (!confirm('Are you sure you want to clear ALL allocations from the database? This action cannot be undone.')) {
            return;
        }

        try {
            const res = await axios.delete('/api/allocations');
            alert(res.data.msg);
        } catch (err) {
            console.error('Clear DB Error:', err);
            const errMsg = err.response?.data?.msg || err.response?.data || err.message;
            alert(`Error clearing database: ${errMsg}`);
        }
    };

    const handleDownloadSession = (date, session) => {
        const singleSessionData = {
            [date]: {
                [session]: sessionData[date][session]
            }
        };
        const filename = `Room_Allotment_${date}_${session}.doc`;
        generateRoomReport(singleSessionData, filename);
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Room Allotment</h1>
                    <p className="text-slate-500 text-sm mt-1">Upload exam schedules, randomize invigilators, and map them to rooms.</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto space-y-8">
                {/* Upload Card */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-8 text-center">
                        <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <i className="bi bi-cloud-upload text-4xl text-brand-600"></i>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Upload Exam Schedule</h3>
                        <p className="text-slate-500 mb-8 max-w-md mx-auto">Drag and drop your HTML/DOC file here to load session data and begin the allotment process.</p>

                        <div className="relative inline-block w-full max-w-md">
                            <input
                                type="file"
                                accept=".html,.htm,.doc,.docx"
                                onChange={handleFileUpload}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className="flex items-center justify-center w-full px-6 py-4 border-2 border-dashed border-slate-300 rounded-xl hover:bg-slate-50 transition-colors">
                                <span className="text-slate-600 font-medium">Choose File</span>
                            </div>
                        </div>
                        <p className="text-xs text-slate-400 mt-2 font-mono">Supported: HTML, DOC</p>
                    </div>

                    <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 flex justify-center gap-4">
                        <button
                            className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-sm active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={handleRandomize}
                            disabled={Object.keys(sessionData).length === 0}
                        >
                            <i className="bi bi-shuffle"></i> Randomize
                        </button>
                        <button
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-sm active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => generateRoomReport(sessionData)}
                            disabled={Object.keys(sessionData).length === 0}
                        >
                            <i className="bi bi-file-earmark-word"></i> Export Report
                        </button>
                        <button
                            className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-sm active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => generateDepartmentReport(sessionData)}
                            disabled={Object.keys(sessionData).length === 0}
                        >
                            <i className="bi bi-building"></i> Dept Report
                        </button>
                        <button
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-sm active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={handleSaveToDB}
                            disabled={Object.keys(sessionData).length === 0}
                        >
                            <i className="bi bi-database-fill-up"></i> Save to DB
                        </button>
                        <button
                            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-sm active:scale-95 transition-all flex items-center gap-2"
                            onClick={handleClearDB}
                        >
                            <i className="bi bi-trash-fill"></i> Clear DB
                        </button>
                    </div>
                </div>

                {/* Preview Section */}
                {Object.keys(sessionData).length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                            <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                <i className="bi bi-eye text-brand-500"></i> Allocation Preview
                            </h4>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-200 px-2 py-1 rounded">
                                {Object.keys(sessionData).length} Dates Loaded
                            </span>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {Object.keys(sessionData).map(date => (
                                    <div key={date} className="p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-md transition-all">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold text-xs">
                                                {new Date(date).getDate()}
                                            </div>
                                            <h6 className="font-bold text-slate-900">{date}</h6>
                                        </div>
                                        <div className="text-xs text-slate-500 pl-10">
                                            {Object.keys(sessionData[date]).length} Sessions Found
                                        </div>
                                        <div className="mt-3 pl-10 flex gap-2 flex-wrap">
                                            {Object.keys(sessionData[date]).map(session => (
                                                <button
                                                    key={session}
                                                    onClick={() => handleDownloadSession(date, session)}
                                                    className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase bg-white border border-slate-200 text-slate-600 hover:border-brand-300 hover:text-brand-600 hover:shadow-sm transition-all"
                                                    title={`Download ${session} Report`}
                                                >
                                                    <span>{session}</span>
                                                    <i className="bi bi-download text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"></i>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RoomAllotment;
