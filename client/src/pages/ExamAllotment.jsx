import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useExamAllocation from '../hooks/useExamAllocation';
import { generateDeputyReport } from '../utils/exportUtils';
import PasswordConfirmationModal from '../components/PasswordConfirmationModal';
import StatusModal from '../components/StatusModal';

const ExamAllotment = () => {
    const [faculty, setFaculty] = useState([]);
    const [dates, setDates] = useState([]);
    const [config, setConfig] = useState({});
    const {
        allocations,
        setAllocations,
        startAllocation
    } = useExamAllocation(faculty);

    useEffect(() => {
        fetchFaculty();
        restoreStateFromDB();
    }, []);

    const fetchFaculty = async () => {
        try {
            const res = await axios.get('/api/faculty');
            setFaculty(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const restoreStateFromDB = async () => {
        try {
            const res = await axios.get('/api/allocations');
            const data = res.data;

            if (data && Object.keys(data).length > 0) {
                console.log('Restoring state from DB...');
                const restoredDates = Object.keys(data).sort();
                const restoredConfig = {};
                const restoredAllocations = {};

                restoredDates.forEach(date => {
                    restoredConfig[date] = {};
                    restoredAllocations[date] = {};

                    ['morning', 'afternoon'].forEach(session => {
                        if (data[date][session]) {
                            const sData = data[date][session];

                            // Restore Config
                            restoredConfig[date][session] = {
                                rooms: sData.examInfo?.rooms || 0,
                                relievers: sData.examInfo?.relievers || 0,
                                roomsPerProf: 7, // Default/Assumed
                                required: (sData.examInfo?.rooms || 0) + (sData.examInfo?.relievers || 0)
                            };

                            // Restore Allocations
                            restoredAllocations[date][session] = {
                                deputies: sData.deputies || [],
                                invigilators: sData.invigilators || []
                            };
                        } else {
                            // Default empty config if session missing but date exists
                            restoredConfig[date][session] = { rooms: 40, roomsPerProf: 7, relievers: 12 };
                        }
                    });
                });

                setDates(restoredDates);
                setConfig(restoredConfig);
                setAllocations(restoredAllocations);
                setStep(3); // Jump to Allocation View

                // Also set Date Range for UI consistency if needed
                if (restoredDates.length > 0) {
                    setDateRange({ start: restoredDates[0], end: restoredDates[restoredDates.length - 1] });
                }
            }
        } catch (err) {
            console.error('Failed to restore state:', err);
        }
    };

    const handleConfigChange = (date, session, field, value) => {
        const newConfig = { ...config };
        newConfig[date][session][field] = parseInt(value) || 0;
        const rooms = newConfig[date][session].rooms;
        const relievers = newConfig[date][session].relievers;
        newConfig[date][session].required = rooms + relievers;
        setConfig(newConfig);
    };

    const handleAllocate = () => {
        if (dates.length === 0) {
            alert('Please add dates first.');
            return;
        }

        const result = startAllocation(config, faculty);
        console.log('Allocation result:', result);
        alert('Allocation complete!');
    };

    const [statusModal, setStatusModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'success'
    });
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);

    const handleSaveAllotment = async (password) => {
        if (!password) return;

        setSaveLoading(true);
        try {
            // Construct sessionData from allocations and config
            const sessionData = {};
            Object.keys(allocations).forEach(date => {
                sessionData[date] = {};
                ['morning', 'afternoon'].forEach(session => {
                    if (allocations[date][session]) {
                        sessionData[date][session] = {
                            examInfo: {
                                rooms: config[date][session].rooms,
                                relievers: config[date][session].relievers
                            },
                            deputies: allocations[date][session].deputies || [],
                            invigilators: allocations[date][session].invigilators || []
                        };
                    }
                });
            });

            // Include password in payload
            const payload = { ...sessionData, password };

            console.log('Saving sessionData...');
            await axios.post('/api/allocations', payload);

            setIsConfirmModalOpen(false);
            setStatusModal({
                isOpen: true,
                title: 'Success!',
                message: 'Allotment Confirmed and Saved successfully!',
                type: 'success'
            });

        } catch (err) {
            console.error(err);
            const errMsg = err.response?.data?.msg || "Failed to save to database.";
            setStatusModal({
                isOpen: true,
                title: 'Error',
                message: errMsg,
                type: 'error'
            });
        } finally {
            setSaveLoading(false);
        }
    };

    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [step, setStep] = useState(1); // 1: Dates, 2: Config, 3: Allocation

    const generateDates = () => {
        if (!dateRange.start || !dateRange.end) {
            alert("Please select both start and end dates.");
            return;
        }

        const start = new Date(dateRange.start);
        const end = new Date(dateRange.end);

        if (start > end) {
            alert("Start date must be before end date.");
            return;
        }

        const dateArray = [];
        let current = new Date(start);

        while (current <= end) {
            if (current.getDay() !== 0) { // Exclude Sundays
                dateArray.push(new Date(current).toISOString().split('T')[0]);
            }
            current.setDate(current.getDate() + 1);
        }

        setDates(dateArray);

        const initialConfig = {};
        dateArray.forEach(date => {
            initialConfig[date] = {
                morning: { rooms: 40, roomsPerProf: 7, relievers: 12 },
                afternoon: { rooms: 40, roomsPerProf: 7, relievers: 12 }
            };
        });
        setConfig(initialConfig);
        setStep(2);
    };

    const handleRoomChange = (date, session, value) => {
        const rooms = parseInt(value) || 0;
        const relievers = Math.ceil((rooms / 5) + (rooms * 0.1));

        setConfig(prev => ({
            ...prev,
            [date]: {
                ...prev[date],
                [session]: {
                    ...prev[date][session],
                    rooms: rooms,
                    relievers: relievers
                }
            }
        }));
    };

    const calculateRequirements = (rooms, relievers) => {
        const profs = Math.ceil(rooms / 7);
        const nonProfs = rooms + relievers;
        return { profs, nonProfs };
    };

    return (
        <div className="space-y-10 pb-20 font-sans text-slate-900">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-200 pb-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Allotment</h1>
                </div>
                <div>
                    <span className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-sm font-semibold shadow-sm">
                        <i className="bi bi-people-fill text-slate-500"></i>
                        {faculty.length} Active Faculty
                    </span>
                </div>
            </div>

            {/* Steps Indicator */}


            {/* Step 1: Date Selection */}
            {step === 1 && (
                <div className="max-w-xl mx-auto bg-retro-white rounded-xl shadow-paper border-2 border-retro-dark overflow-hidden mt-10">
                    <div className="bg-retro-cream/30 px-8 py-6 border-b-2 border-retro-dark flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-retro-blue border-2 border-retro-dark flex items-center justify-center text-white shadow-sm">
                            <i className="bi bi-calendar-range-fill text-xl"></i>
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-retro-dark uppercase tracking-tight leading-none">
                                Exam Window
                            </h3>
                            <p className="text-xs font-bold text-retro-secondary uppercase tracking-widest mt-1">Select Schedule Range</p>
                        </div>
                    </div>

                    <div className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-retro-dark uppercase tracking-wider pl-1">Start Date</label>
                                <div className="relative">
                                    <input type="date" className="w-full px-4 py-3 rounded-lg border-2 border-retro-border bg-retro-white focus:border-retro-blue focus:bg-white focus:shadow-paper focus:translate-y-[-2px] outline-none transition-all font-bold text-retro-dark cursor-pointer hover:bg-retro-cream/20"
                                        value={dateRange.start}
                                        onChange={e => setDateRange({ ...dateRange, start: e.target.value })}
                                    />
                                    <i className="bi bi-calendar absolute right-4 top-1/2 -translate-y-1/2 text-retro-secondary pointer-events-none"></i>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-retro-dark uppercase tracking-wider pl-1">End Date</label>
                                <div className="relative">
                                    <input type="date" className="w-full px-4 py-3 rounded-lg border-2 border-retro-border bg-retro-white focus:border-retro-blue focus:bg-white focus:shadow-paper focus:translate-y-[-2px] outline-none transition-all font-bold text-retro-dark cursor-pointer hover:bg-retro-cream/20"
                                        value={dateRange.end}
                                        onChange={e => setDateRange({ ...dateRange, end: e.target.value })}
                                    />
                                    <i className="bi bi-calendar-fill absolute right-4 top-1/2 -translate-y-1/2 text-retro-secondary pointer-events-none"></i>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t-2 border-retro-border/50">
                            <button
                                className="w-full bg-retro-dark hover:bg-retro-blue text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-paper hover:translate-y-[-2px] active:translate-y-[0px] active:shadow-sm transition-all flex items-center justify-center gap-3 border-2 border-retro-dark group"
                                onClick={generateDates}
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Step 2: Session Configuration */}
            {step >= 2 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex flex-col sm:flex-row justify-between items-center bg-retro-white p-5 rounded-xl border-2 border-retro-dark shadow-paper sticky top-20 z-20 backdrop-blur-md">
                        <div>
                            <h4 className="font-black text-retro-dark text-lg uppercase tracking-tight">Enter Rooms Required</h4>
                            <p className="text-xs font-bold text-retro-secondary uppercase tracking-widest mt-1">Set room counts for {dates.length} days</p>
                        </div>
                        <div className="flex gap-3 mt-4 sm:mt-0">
                            {step === 3 && (
                                <button className="px-6 py-2.5 rounded-lg font-bold text-retro-secondary hover:text-retro-dark hover:bg-retro-dark/5 transition uppercase tracking-wider text-xs" onClick={() => setStep(2)}>
                                    Back
                                </button>
                            )}
                            {step === 2 && (
                                <button className="px-6 py-3 rounded-lg font-black text-white bg-retro-blue hover:bg-retro-blue/90 shadow-paper hover:translate-y-[-2px] active:translate-y-[0px] transition-all border-2 border-retro-dark uppercase tracking-wider text-xs flex items-center gap-2" onClick={() => setStep(3)}>
                                    Allocate <i className="bi bi-lightning-charge-fill"></i>
                                </button>
                            )}
                        </div>
                    </div>

                    {step === 2 && (
                        <div className="grid gap-8">
                            {dates.map(date => (
                                <div key={date} className="bg-retro-white rounded-xl shadow-paper border-2 border-retro-dark overflow-hidden group">
                                    <div className="px-8 py-5 bg-retro-cream/30 border-b-2 border-retro-dark flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-lg bg-retro-dark border-2 border-retro-dark flex items-center justify-center text-retro-cream shadow-sm font-black text-lg group-hover:rotate-3 transition-transform duration-300">
                                                {new Date(date).getDate()}
                                            </div>
                                            <div>
                                                <h5 className="font-black text-retro-dark text-lg uppercase tracking-tight">
                                                    {new Date(date).toLocaleDateString('en-GB', { weekday: 'long' })}
                                                </h5>
                                                <p className="text-retro-secondary text-xs font-bold uppercase tracking-widest">
                                                    {new Date(date).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-8 grid lg:grid-cols-2 gap-12 relative">
                                        {/* Divider */}
                                        <div className="hidden lg:block absolute left-1/2 top-8 bottom-8 w-0.5 bg-retro-dark/10 border-l-2 border-dashed border-retro-dark/20"></div>

                                        {/* AM Session (Blue Theme) */}
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-3 border-b-2 border-retro-dark/10 pb-2">
                                                <div className="p-2 rounded-lg bg-retro-blue text-white border-2 border-retro-dark shadow-sm"><i className="bi bi-brightness-high-fill text-lg"></i></div>
                                                <span className="font-black text-retro-dark tracking-tight uppercase">MORNING SESSION</span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-[10px] font-black text-retro-secondary mb-2 uppercase tracking-widest">Total Rooms</label>
                                                    <input type="number" className="w-full px-4 py-3 rounded-lg border-2 border-retro-border bg-retro-cream/20 focus:border-retro-blue focus:bg-white focus:shadow-paper outline-none transition-all font-bold text-retro-dark text-xl"
                                                        value={config[date]?.morning?.rooms || 0}
                                                        onChange={(e) => handleRoomChange(date, 'morning', e.target.value)}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-black text-retro-secondary mb-2 uppercase tracking-widest">Relievers + Extra</label>
                                                    <input type="number" className="w-full px-4 py-3 rounded-lg border-2 border-retro-border bg-retro-dark/5 text-retro-secondary font-bold text-xl" readOnly
                                                        value={config[date]?.morning?.relievers || 0}
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex gap-4">
                                                <div className="flex-1 bg-retro-blue/10 rounded-lg p-4 border-2 border-retro-blue/20 flex flex-col items-center">
                                                    <span className="text-[10px] font-black text-retro-blue uppercase tracking-widest mb-1">Deputies</span>
                                                    <span className="text-2xl font-black text-retro-blue">{calculateRequirements(config[date]?.morning?.rooms, 0).profs}</span>
                                                </div>
                                                <div className="flex-1 bg-retro-secondary/5 rounded-lg p-4 border-2 border-retro-secondary/10 flex flex-col items-center">
                                                    <span className="text-[10px] font-black text-retro-secondary uppercase tracking-widest mb-1">Invigilators</span>
                                                    <span className="text-2xl font-black text-retro-secondary">{calculateRequirements(config[date]?.morning?.rooms, config[date]?.morning?.relievers).nonProfs}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* PM Session (Red Theme) */}
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-3 border-b-2 border-retro-dark/10 pb-2">
                                                <div className="p-2 rounded-lg bg-retro-red text-white border-2 border-retro-dark shadow-sm"><i className="bi bi-moon-stars-fill text-lg"></i></div>
                                                <span className="font-black text-retro-dark tracking-tight uppercase">AFTERNOON SESSION</span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-[10px] font-black text-retro-secondary mb-2 uppercase tracking-widest">Total Rooms</label>
                                                    <input type="number" className="w-full px-4 py-3 rounded-lg border-2 border-retro-border bg-retro-cream/20 focus:border-retro-red focus:bg-white focus:shadow-paper outline-none transition-all font-bold text-retro-dark text-xl"
                                                        value={config[date]?.afternoon?.rooms || 0}
                                                        onChange={(e) => handleRoomChange(date, 'afternoon', e.target.value)}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-black text-retro-secondary mb-2 uppercase tracking-widest">Relievers + Extra</label>
                                                    <input type="number" className="w-full px-4 py-3 rounded-lg border-2 border-retro-border bg-retro-dark/5 text-retro-secondary font-bold text-xl" readOnly
                                                        value={config[date]?.afternoon?.relievers || 0}
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex gap-4">
                                                <div className="flex-1 bg-retro-red/10 rounded-lg p-4 border-2 border-retro-red/20 flex flex-col items-center">
                                                    <span className="text-[10px] font-black text-retro-red uppercase tracking-widest mb-1">Deputies</span>
                                                    <span className="text-2xl font-black text-retro-red">{calculateRequirements(config[date]?.afternoon?.rooms, 0).profs}</span>
                                                </div>
                                                <div className="flex-1 bg-retro-secondary/5 rounded-lg p-4 border-2 border-retro-secondary/10 flex flex-col items-center">
                                                    <span className="text-[10px] font-black text-retro-secondary uppercase tracking-widest mb-1">Invigilators</span>
                                                    <span className="text-2xl font-black text-retro-secondary">{calculateRequirements(config[date]?.afternoon?.rooms, config[date]?.afternoon?.relievers).nonProfs}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Step 3: Allocation Table */}
            {step === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-retro-white rounded-xl shadow-paper border-2 border-retro-dark p-6 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-4">
                            <div>
                                <h4 className="font-black text-retro-dark text-lg uppercase tracking-tight">Allocate duties for {dates.length} days</h4>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button className="bg-retro-dark hover:bg-retro-blue text-white px-8 py-3 rounded-lg font-black shadow-paper active:translate-y-[0px] hover:translate-y-[-2px] transition-all flex items-center gap-2 border-2 border-retro-dark uppercase tracking-wider text-xs" onClick={handleAllocate} disabled={dates.length === 0}>
                                Allocate
                            </button>
                            <button
                                className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-lg font-black shadow-paper active:translate-y-[0px] hover:translate-y-[-2px] transition-all flex items-center gap-2 border-2 border-retro-dark uppercase tracking-wider text-xs"
                                onClick={() => setIsConfirmModalOpen(true)}
                                disabled={Object.keys(allocations).length === 0}
                            >
                                Confirm Allotment
                            </button>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="w-full">
                        <button className="w-full bg-retro-white hover:bg-green-50 text-green-700 border-2 border-retro-border hover:border-green-600 px-4 py-4 rounded-xl font-bold shadow-sm transition flex items-center justify-center gap-3 group uppercase tracking-wider text-xs" onClick={() => generateDeputyReport(allocations, config)} disabled={Object.keys(allocations).length === 0}>
                            <i className="bi bi-file-earmark-word-fill text-xl group-hover:scale-110 transition-transform"></i> Download Official Allocation Report (.doc)
                        </button>
                    </div>

                    {/* Table */}
                    <div className="bg-retro-white rounded-xl shadow-paper border-2 border-retro-dark overflow-hidden">
                        <div className="overflow-x-auto max-h-[700px]">
                            <table className="w-full text-left border-collapse bg-retro-white">
                                <thead className="bg-retro-dark text-white sticky top-0 z-20 shadow-md">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-retro-border/60 border-b border-retro-secondary">Faculty Member</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-retro-border/60 border-b border-retro-secondary">Department</th>
                                        <th className="px-4 py-4 text-center text-[10px] font-black uppercase tracking-widest text-white bg-retro-blue border-b border-retro-blue w-24">Total</th>
                                        {dates.map(date => (
                                            <th key={date} colSpan="2" className="text-center px-2 py-2 border-l border-retro-secondary/50 bg-retro-secondary/20">
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] uppercase tracking-wider text-retro-border">{new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                    <tr>
                                        <th colSpan="3" className="bg-retro-dark h-1"></th>
                                        {dates.map(date => (
                                            <React.Fragment key={date}>
                                                <th className="px-1 py-1.5 text-[8px] text-center uppercase font-black text-retro-cream bg-retro-dark border-l border-retro-secondary/30">AM</th>
                                                <th className="px-1 py-1.5 text-[8px] text-center uppercase font-black text-retro-blue bg-retro-dark">PM</th>
                                            </React.Fragment>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-retro-border/50">
                                    {faculty.sort((a, b) => {
                                        if (a.designation === 'Professor' && b.designation !== 'Professor') return -1;
                                        if (a.designation !== 'Professor' && b.designation === 'Professor') return 1;
                                        if (a.department < b.department) return -1;
                                        if (a.department > b.department) return 1;
                                        return a.name.localeCompare(b.name);
                                    }).map((prof, idx) => {
                                        let total = 0;
                                        const isProf = prof.designation === 'Professor';
                                        return (
                                            <tr key={prof._id} className={`hover:bg-retro-cream/30 transition-colors ${idx % 2 === 0 ? 'bg-retro-white' : 'bg-retro-cream/10'}`}>
                                                <td className="px-6 py-3.5 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${isProf ? 'bg-retro-cream border-retro-dark text-retro-dark' : 'bg-retro-white border-retro-border text-retro-secondary'}`}>
                                                            {prof.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-retro-dark text-sm">{prof.name}</div>
                                                            {isProf && <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black bg-retro-cream border border-retro-dark/20 text-retro-dark mt-0.5 uppercase tracking-wide">PROF</span>}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3.5 whitespace-nowrap">
                                                    <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-retro-white text-retro-secondary border-2 border-retro-border">
                                                        {prof.department}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3.5 whitespace-nowrap text-center">
                                                    {(() => {
                                                        let count = 0;
                                                        Object.values(allocations).forEach(day => {
                                                            ['morning', 'afternoon'].forEach(sess => {
                                                                if (day[sess]?.deputies?.some(p => p._id === prof._id)) count++;
                                                                if (day[sess]?.invigilators?.some(p => p._id === prof._id)) count++;
                                                            });
                                                        });
                                                        return (
                                                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-black text-sm border-2 ${count > 0 ? 'bg-retro-blue text-white border-retro-dark shadow-sm' : 'text-retro-border bg-retro-white border-retro-border'}`}>
                                                                {count || 0}
                                                            </span>
                                                        );
                                                    })()}
                                                </td>
                                                {dates.map(date => (
                                                    <React.Fragment key={date}>
                                                        <DutyCell
                                                            session="morning"
                                                            allocated={allocations[date]?.morning?.deputies?.some(p => p._id === prof._id) ? 'DEP' : allocations[date]?.morning?.invigilators?.some(p => p._id === prof._id) ? 'INV' : null}
                                                        />
                                                        <DutyCell
                                                            session="afternoon"
                                                            allocated={allocations[date]?.afternoon?.deputies?.some(p => p._id === prof._id) ? 'DEP' : allocations[date]?.afternoon?.invigilators?.some(p => p._id === prof._id) ? 'INV' : null}
                                                        />
                                                    </React.Fragment>
                                                ))}
                                            </tr>
                                        )
                                    })}
                                </tbody>
                                <tfoot className="sticky bottom-0 bg-retro-white font-bold z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] border-t-2 border-retro-dark">
                                    <tr className="bg-retro-cream/20">
                                        <td className="p-4 text-left font-black text-retro-secondary text-xs uppercase tracking-widest pl-6">Grand Totals</td>
                                        <td className="p-4"></td>
                                        <td className="p-4 text-center">
                                            <div className="flex items-center justify-center">
                                                <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-retro-dark text-white text-xs font-black border-2 border-retro-secondary">
                                                    {faculty.reduce((sum, f) => {
                                                        let count = 0;
                                                        Object.values(allocations).forEach(day => {
                                                            ['morning', 'afternoon'].forEach(sess => {
                                                                if (day[sess]?.deputies?.some(p => p._id === f._id)) count++;
                                                                if (day[sess]?.invigilators?.some(p => p._id === f._id)) count++;
                                                            });
                                                        });
                                                        return sum + count;
                                                    }, 0)}
                                                </span>
                                            </div>
                                        </td>
                                        {dates.map(date => (
                                            <React.Fragment key={date}>
                                                <td className="p-3 text-center border-l border-retro-border">
                                                    <span className="text-xs font-black text-retro-dark bg-retro-cream px-2 py-1 rounded-md border border-retro-dark/20">
                                                        {(() => {
                                                            const am = allocations[date]?.morning;
                                                            return (am?.deputies?.length || 0) + (am?.invigilators?.length || 0);
                                                        })()}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-center">
                                                    <span className="text-xs font-black text-white bg-retro-blue px-2 py-1 rounded-md border border-retro-dark/20">
                                                        {(() => {
                                                            const pm = allocations[date]?.afternoon;
                                                            return (pm?.deputies?.length || 0) + (pm?.invigilators?.length || 0);
                                                        })()}
                                                    </span>
                                                </td>
                                            </React.Fragment>
                                        ))}
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>
            )}
            {/* Password Confirmation Modal */}
            <PasswordConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleSaveAllotment}
                loading={saveLoading}
                title="Save & Publish"
                message="This will save the current allocation to the database, effectively publishing it. Please enter your administrator password to confirm."
                confirmText="Save Allotment"
                confirmColor="bg-emerald-600"
                icon="bi-cloud-upload-fill"
            />

            {/* Status Modal */}
            <StatusModal
                isOpen={statusModal.isOpen}
                onClose={() => setStatusModal({ ...statusModal, isOpen: false })}
                title={statusModal.title}
                message={statusModal.message}
                type={statusModal.type}
            />
        </div>
    );
};

// Helper sub-component for cleaner table cells
const DutyCell = ({ session, allocated }) => {
    if (!allocated) return <td className="p-2 border-l border-retro-border/50"></td>;

    const isDep = allocated === 'DEP';
    const isAm = session === 'morning';

    // AM colors: Cream/Dark, PM colors: Blue/White
    // Deputy: Solid Badge, Invigilator: Check Icon

    return (
        <td className={`p-2 text-center border-l border-retro-border/50 bg-retro-white`}>
            {isDep ? (
                <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black tracking-wide shadow-sm border ${isAm ? 'bg-retro-cream text-retro-dark border-retro-dark' : 'bg-retro-blue text-white border-retro-dark'
                    }`}>
                    DEP
                </span>
            ) : (
                <div className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center text-xs ${isAm ? 'text-retro-dark bg-retro-cream/50' : 'text-retro-blue bg-retro-blue/10'
                    }`}>
                    <i className="bi bi-check-lg font-bold"></i>
                </div>
            )}
        </td>
    );
};

export default ExamAllotment;
