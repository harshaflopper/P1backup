import React, { useState } from 'react';
import axios from 'axios';
import { parseSessionData } from '../utils/documentParser';
import { generateRoomReport, generateDepartmentReport, generateRoomPDF, generateDepartmentPDF } from '../utils/exportUtils';

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

    const handleDownloadPDF = (date, session) => {
        try {
            const singleSessionData = {
                [date]: {
                    [session]: sessionData[date][session]
                }
            };
            const filename = `Room_Allotment_${date}_${session}.pdf`;
            generateRoomPDF(singleSessionData, filename);
        } catch (error) {
            console.error("PDF Download Error:", error);
            alert("Error initiating PDF download.");
        }
    };

    return (
        <div className="space-y-10 pb-20 font-sans text-retro-dark">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b-2 border-retro-dark/10 pb-6">
                <div>
                    <h1 className="text-3xl font-black text-retro-dark tracking-tight uppercase">Room Allotment</h1>
                    <p className="text-retro-secondary text-sm font-bold mt-1 tracking-wide uppercase">Upload exam schedules to allocate rooms.</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Upload Card */}
                <div className="bg-retro-white rounded-xl shadow-paper border-2 border-retro-dark overflow-hidden">
                    <div className="p-10 text-center">
                        <div className="w-24 h-24 bg-retro-cream rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-retro-dark shadow-sm">
                            <i className="bi bi-cloud-upload text-4xl text-retro-dark"></i>
                        </div>
                        <h3 className="text-2xl font-black text-retro-dark mb-2 uppercase tracking-tight">Upload Exam Schedule</h3>
                        <p className="text-retro-secondary mb-8 max-w-md mx-auto font-bold text-sm">Drag and drop your HTML/DOC file here to load session data and begin the allotment process.</p>

                        <div className="relative inline-block w-full max-w-md group">
                            <input
                                type="file"
                                accept=".html,.htm,.doc,.docx"
                                onChange={handleFileUpload}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className="flex items-center justify-center w-full px-6 py-5 border-2 border-dashed border-retro-secondary/50 rounded-xl bg-retro-cream/20 group-hover:bg-retro-cream/50 group-hover:border-retro-dark transition-all">
                                <span className="text-retro-dark font-black uppercase tracking-wider text-sm group-hover:scale-105 transition-transform">Choose File</span>
                            </div>
                        </div>
                        <p className="text-[10px] text-retro-secondary mt-3 font-bold uppercase tracking-widest">Supported: HTML, DOC</p>
                    </div>

                    <div className="bg-retro-cream/30 px-8 py-6 border-t-2 border-retro-dark flex flex-wrap justify-center gap-4">
                        <button
                            className="bg-retro-blue hover:bg-retro-blue/90 text-white px-6 py-3 rounded-lg font-black shadow-paper active:translate-y-[0px] hover:translate-y-[-2px] transition-all flex items-center gap-2 border-2 border-retro-dark uppercase tracking-wider text-xs disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0"
                            onClick={handleRandomize}
                            disabled={Object.keys(sessionData).length === 0}
                        >
                            Allocate Room
                        </button>
                        <button
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-lg font-black shadow-paper active:translate-y-[0px] hover:translate-y-[-2px] transition-all flex items-center gap-2 border-2 border-retro-dark uppercase tracking-wider text-xs disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0"
                            onClick={() => generateRoomReport(sessionData)}
                            disabled={Object.keys(sessionData).length === 0}
                        >
                            Export Report
                        </button>
                        <button
                            className="bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-lg font-black shadow-paper active:translate-y-[0px] hover:translate-y-[-2px] transition-all flex items-center gap-2 border-2 border-retro-dark uppercase tracking-wider text-xs disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0"
                            onClick={() => generateRoomPDF(sessionData)}
                            disabled={Object.keys(sessionData).length === 0}
                        >
                            Export PDF
                        </button>
                        <button
                            className="bg-teal-600 hover:bg-teal-500 text-white px-6 py-3 rounded-lg font-black shadow-paper active:translate-y-[0px] hover:translate-y-[-2px] transition-all flex items-center gap-2 border-2 border-retro-dark uppercase tracking-wider text-xs disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0"
                            onClick={() => generateDepartmentReport(sessionData)}
                            disabled={Object.keys(sessionData).length === 0}
                        >
                            Dept Report
                        </button>
                        <button
                            className="bg-rose-600 hover:bg-rose-500 text-white px-6 py-3 rounded-lg font-black shadow-paper active:translate-y-[0px] hover:translate-y-[-2px] transition-all flex items-center gap-2 border-2 border-retro-dark uppercase tracking-wider text-xs disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0"
                            onClick={() => generateDepartmentPDF(sessionData)}
                            disabled={Object.keys(sessionData).length === 0}
                        >
                            Dept PDF
                        </button>
                        <button
                            className="bg-retro-dark hover:bg-retro-dark/90 text-white px-6 py-3 rounded-lg font-black shadow-paper active:translate-y-[0px] hover:translate-y-[-2px] transition-all flex items-center gap-2 border-2 border-retro-dark uppercase tracking-wider text-xs disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0"
                            onClick={handleSaveToDB}
                            disabled={Object.keys(sessionData).length === 0}
                        >
                            Save Allocation
                        </button>
                        <button
                            className="bg-retro-red hover:bg-retro-red/90 text-white px-6 py-3 rounded-lg font-black shadow-paper active:translate-y-[0px] hover:translate-y-[-2px] transition-all flex items-center gap-2 border-2 border-retro-dark uppercase tracking-wider text-xs"
                            onClick={handleClearDB}
                        >
                            Delete Allocation
                        </button>
                    </div>
                </div>

                {/* Preview Section */}
                {Object.keys(sessionData).length > 0 && (
                    <div className="bg-retro-white rounded-xl shadow-paper border-2 border-retro-dark overflow-hidden">
                        <div className="px-6 py-4 border-b-2 border-retro-dark bg-retro-cream/30 flex justify-between items-center">
                            <h4 className="font-black text-retro-dark flex items-center gap-3 uppercase tracking-tight">
                                Downloads
                            </h4>
                            <span className="text-[10px] font-black text-retro-dark uppercase tracking-widest bg-retro-white px-3 py-1.5 rounded-lg border-2 border-retro-dark shadow-sm">
                                {Object.keys(sessionData).length} Dates Loaded
                            </span>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {Object.keys(sessionData).map(date => (
                                    <div key={date} className="p-5 rounded-xl border-2 border-retro-dark bg-retro-white hover:bg-retro-cream/20 hover:shadow-paper hover:translate-y-[-2px] transition-all group">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 rounded-lg bg-retro-dark text-retro-cream flex items-center justify-center font-black text-lg border-2 border-retro-dark group-hover:rotate-6 transition-transform">
                                                {new Date(date).getDate()}
                                            </div>
                                            <div>
                                                <h6 className="font-black text-retro-dark uppercase tracking-tight text-sm">{date}</h6>
                                                <div className="text-[10px] font-bold text-retro-secondary uppercase tracking-wider">
                                                    {Object.keys(sessionData[date]).length} Sessions
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-4 flex gap-2 flex-wrap">
                                            {Object.keys(sessionData[date]).map(session => (
                                                <div key={session} className="flex items-center bg-white border-2 border-retro-border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                                    <div className="px-3 py-1.5 text-[10px] font-black uppercase text-retro-secondary bg-retro-cream/20 border-r-2 border-retro-border">
                                                        {session}
                                                    </div>
                                                    <button
                                                        onClick={() => handleDownloadSession(date, session)}
                                                        className="px-2 py-1.5 text-retro-blue hover:bg-retro-blue hover:text-white transition-colors border-r-2 border-retro-border"
                                                        title="Download Word Doc"
                                                    >
                                                        <i className="bi bi-file-word-fill"></i>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDownloadPDF(date, session)}
                                                        className="px-2 py-1.5 text-retro-red hover:bg-retro-red hover:text-white transition-colors"
                                                        title="Download PDF"
                                                    >
                                                        <i className="bi bi-file-pdf-fill"></i>
                                                    </button>
                                                </div>
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
