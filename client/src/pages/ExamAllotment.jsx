import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useExamAllocation from '../hooks/useExamAllocation';
import { generateDeputyReport } from '../utils/exportUtils';

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
    }, []);

    const fetchFaculty = async () => {
        try {
            const res = await axios.get('/api/faculty');
            setFaculty(res.data);
        } catch (err) {
            console.error(err);
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
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Exam Control Center</h1>
                    <p className="text-slate-500 mt-2 text-base max-w-2xl">Orchestrate exam schedules, configure session capacities, and manage faculty allocations with precision.</p>
                </div>
                <div>
                    <span className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-sm font-semibold shadow-sm">
                        <i className="bi bi-people-fill text-slate-500"></i>
                        {faculty.length} Active Faculty
                    </span>
                </div>
            </div>

            {/* Steps Indicator */}
            <div className="max-w-4xl mx-auto">
                <div className="relative">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -z-10 -translate-y-1/2 rounded-full"></div>
                    <div className="flex justify-between w-full">
                        {[
                            { num: 1, label: 'Schedule', icon: 'bi-calendar-range' },
                            { num: 2, label: 'Capacity', icon: 'bi-sliders' },
                            { num: 3, label: 'Allotment', icon: 'bi-kanban' }
                        ].map((s) => (
                            <div key={s.num} className="flex flex-col items-center gap-3 bg-white px-4 cursor-default group">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all duration-300 shadow-sm border ${step >= s.num
                                    ? 'bg-slate-900 text-white border-slate-900 shadow-slate-900/20'
                                    : 'bg-white text-slate-300 border-slate-100'
                                    }`}>
                                    {step > s.num ? <i className="bi bi-check-lg text-2xl"></i> : <i className={`bi ${s.icon}`}></i>}
                                </div>
                                <span className={`text-xs font-bold uppercase tracking-widest transition-colors ${step >= s.num ? 'text-slate-900' : 'text-slate-300'}`}>
                                    {s.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Step 1: Date Selection */}
            {step === 1 && (
                <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                    <div className="bg-slate-50/50 px-8 py-6 border-b border-slate-100">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center"><i className="bi bi-calendar-week-fill"></i></span>
                            Define Exam Window
                        </h3>
                    </div>
                    <div className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Start Date</label>
                                <input type="date" className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-semibold text-slate-700 bg-slate-50/30 focus:bg-white"
                                    value={dateRange.start}
                                    onChange={e => setDateRange({ ...dateRange, start: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">End Date</label>
                                <input type="date" className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-semibold text-slate-700 bg-slate-50/30 focus:bg-white"
                                    value={dateRange.end}
                                    onChange={e => setDateRange({ ...dateRange, end: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="mt-10">
                            <button
                                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-slate-900/10 active:scale-[0.99] transition-all flex items-center justify-center gap-3"
                                onClick={generateDates}
                            >
                                Initialize Sessions <i className="bi bi-arrow-right"></i>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Step 2: Session Configuration */}
            {step >= 2 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-5 rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/50 sticky top-20 z-20 backdrop-blur-md bg-white/90">
                        <div>
                            <h4 className="font-bold text-slate-800 text-lg">Configuration</h4>
                            <p className="text-sm text-slate-400">Set room counts for {dates.length} days</p>
                        </div>
                        <div className="flex gap-3 mt-4 sm:mt-0">
                            {step === 3 && (
                                <button className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition" onClick={() => setStep(2)}>
                                    Back
                                </button>
                            )}
                            {step === 2 && (
                                <button className="px-8 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/30 active:scale-95 transition-all flex items-center gap-2" onClick={() => setStep(3)}>
                                    Generate Allocation <i className="bi bi-lightning-charge-fill"></i>
                                </button>
                            )}
                        </div>
                    </div>

                    {step === 2 && (
                        <div className="grid gap-8">
                            {dates.map(date => (
                                <div key={date} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-300 group">
                                    <div className="px-8 py-5 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-700 shadow-sm font-bold text-lg group-hover:scale-110 transition-transform duration-300">
                                                {new Date(date).getDate()}
                                            </div>
                                            <div>
                                                <h5 className="font-bold text-slate-900 text-lg">
                                                    {new Date(date).toLocaleDateString('en-GB', { weekday: 'long' })}
                                                </h5>
                                                <p className="text-slate-400 text-sm font-medium uppercase tracking-wide">
                                                    {new Date(date).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-8 grid lg:grid-cols-2 gap-12 relative">
                                        {/* Divider */}
                                        <div className="hidden lg:block absolute left-1/2 top-8 bottom-8 w-px bg-slate-100"></div>

                                        {/* AM Session */}
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-amber-100 text-amber-600"><i className="bi bi-brightness-high-fill text-xl"></i></div>
                                                <span className="font-extrabold text-slate-700 tracking-tight">MORNING SESSION</span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-[11px] font-extrabold text-slate-400 mb-2 uppercase tracking-widest">Total Rooms</label>
                                                    <input type="number" className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 outline-none transition font-bold text-slate-800 text-xl"
                                                        value={config[date]?.morning?.rooms || 0}
                                                        onChange={(e) => handleRoomChange(date, 'morning', e.target.value)}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[11px] font-extrabold text-slate-400 mb-2 uppercase tracking-widest">Relievers + Extra</label>
                                                    <input type="number" className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 text-slate-400 font-bold text-xl" readOnly
                                                        value={config[date]?.morning?.relievers || 0}
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex gap-4">
                                                <div className="flex-1 bg-amber-50/50 rounded-xl p-4 border border-amber-100 flex flex-col items-center">
                                                    <span className="text-[10px] font-bold text-amber-800/60 uppercase tracking-widest mb-1">Deputies</span>
                                                    <span className="text-2xl font-black text-amber-600">{calculateRequirements(config[date]?.morning?.rooms, 0).profs}</span>
                                                </div>
                                                <div className="flex-1 bg-slate-50/50 rounded-xl p-4 border border-slate-100 flex flex-col items-center">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Invigilators</span>
                                                    <span className="text-2xl font-black text-slate-600">{calculateRequirements(config[date]?.morning?.rooms, config[date]?.morning?.relievers).nonProfs}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* PM Session */}
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600"><i className="bi bi-moon-stars-fill text-xl"></i></div>
                                                <span className="font-extrabold text-slate-700 tracking-tight">AFTERNOON SESSION</span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-[11px] font-extrabold text-slate-400 mb-2 uppercase tracking-widest">Total Rooms</label>
                                                    <input type="number" className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/10 outline-none transition font-bold text-slate-800 text-xl"
                                                        value={config[date]?.afternoon?.rooms || 0}
                                                        onChange={(e) => handleRoomChange(date, 'afternoon', e.target.value)}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[11px] font-extrabold text-slate-400 mb-2 uppercase tracking-widest">Relievers + Extra</label>
                                                    <input type="number" className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 text-slate-400 font-bold text-xl" readOnly
                                                        value={config[date]?.afternoon?.relievers || 0}
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex gap-4">
                                                <div className="flex-1 bg-indigo-50/50 rounded-xl p-4 border border-indigo-100 flex flex-col items-center">
                                                    <span className="text-[10px] font-bold text-indigo-800/60 uppercase tracking-widest mb-1">Deputies</span>
                                                    <span className="text-2xl font-black text-indigo-600">{calculateRequirements(config[date]?.afternoon?.rooms, 0).profs}</span>
                                                </div>
                                                <div className="flex-1 bg-slate-50/50 rounded-xl p-4 border border-slate-100 flex flex-col items-center">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Invigilators</span>
                                                    <span className="text-2xl font-black text-slate-600">{calculateRequirements(config[date]?.afternoon?.rooms, config[date]?.afternoon?.relievers).nonProfs}</span>
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
                    <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/40 border border-slate-100 p-6 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xl animate-pulse">
                                <i className="bi bi-cpu-fill"></i>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 text-lg">System Ready</h4>
                                <p className="text-slate-500 font-medium">Ready to allocate duties for <span className="text-slate-900 font-bold">{dates.length} days</span>.</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button className="bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 px-6 py-3 rounded-xl font-bold shadow-sm transition active:scale-95" onClick={handleAllocate}>
                                <i className="bi bi-arrow-repeat mr-2"></i> Re-Run
                            </button>
                            <button className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-xl font-bold shadow-xl shadow-slate-900/20 active:scale-95 transition-all flex items-center gap-2" onClick={handleAllocate} disabled={dates.length === 0}>
                                <i className="bi bi-magic mr-2"></i> Auto Allocate
                            </button>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <button className="bg-white hover:bg-red-50 text-red-600 border border-slate-200 px-4 py-4 rounded-xl font-bold shadow-sm transition flex items-center justify-center gap-3 group" onClick={() => setAllocations({})}>
                            <i className="bi bi-trash3 group-hover:scale-110 transition-transform"></i> Clear All
                        </button>
                        <button className="col-span-1 lg:col-span-3 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-100 px-4 py-4 rounded-xl font-bold shadow-sm transition flex items-center justify-center gap-3 group" onClick={() => generateDeputyReport(allocations, config)} disabled={Object.keys(allocations).length === 0}>
                            <i className="bi bi-file-earmark-word-fill text-xl group-hover:scale-110 transition-transform"></i> Download Official Allocation Report (.doc)
                        </button>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                        <div className="overflow-x-auto max-h-[700px]">
                            <table className="w-full text-left border-collapse bg-white">
                                <thead className="bg-slate-900 text-white sticky top-0 z-20 shadow-xl">
                                    <tr>
                                        <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-slate-400 border-b border-slate-800">Faculty Member</th>
                                        <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-slate-400 border-b border-slate-800">Department</th>
                                        <th className="px-4 py-4 text-center text-[11px] font-extrabold uppercase tracking-widest text-white bg-indigo-600 border-b border-indigo-700 w-24">Total</th>
                                        {dates.map(date => (
                                            <th key={date} colSpan="2" className="text-center px-2 py-2 border-l border-slate-700/50 bg-slate-800">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] uppercase tracking-wider text-slate-400">{new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                    <tr>
                                        <th colSpan="3" className="bg-slate-950 h-1"></th>
                                        {dates.map(date => (
                                            <React.Fragment key={date}>
                                                <th className="px-1 py-1.5 text-[9px] text-center uppercase font-bold text-amber-500 bg-slate-900 border-l border-slate-800">AM</th>
                                                <th className="px-1 py-1.5 text-[9px] text-center uppercase font-bold text-indigo-400 bg-slate-900">PM</th>
                                            </React.Fragment>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
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
                                            <tr key={prof._id} className={`hover:bg-slate-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                                                <td className="px-6 py-3.5 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isProf ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                                                            {prof.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-slate-800 text-sm">{prof.name}</div>
                                                            {isProf && <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-600 border border-amber-100 mt-0.5">PROFESSOR</span>}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3.5 whitespace-nowrap">
                                                    <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
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
                                                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm ${count > 0 ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'text-slate-300 bg-slate-100'}`}>
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
                                <tfoot className="sticky bottom-0 bg-white font-bold z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] border-t border-slate-200">
                                    <tr className="bg-slate-50">
                                        <td className="p-4 text-left font-extrabold text-slate-400 text-xs uppercase tracking-widest pl-6">Grand Totals</td>
                                        <td className="p-4"></td>
                                        <td className="p-4 text-center">
                                            <div className="flex items-center justify-center">
                                                <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-bold">
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
                                                <td className="p-3 text-center border-l border-slate-200/50">
                                                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md border border-amber-100">
                                                        {(() => {
                                                            const am = allocations[date]?.morning;
                                                            return (am?.deputies?.length || 0) + (am?.invigilators?.length || 0);
                                                        })()}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-center">
                                                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100">
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
        </div>
    );
};

// Helper sub-component for cleaner table cells
const DutyCell = ({ session, allocated }) => {
    if (!allocated) return <td className="p-2 border-l border-slate-50"></td>;

    const isDep = allocated === 'DEP';
    const isAm = session === 'morning';

    // AM colors: Amber, PM colors: Indigo
    // Deputy: Solid Badge, Invigilator: Check Icon

    return (
        <td className={`p-2 text-center border-l border-dashed ${isAm ? 'border-amber-100/50 bg-amber-50/30' : 'border-indigo-100/50 bg-indigo-50/30'}`}>
            {isDep ? (
                <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black tracking-wide shadow-sm ${isAm ? 'bg-amber-500 text-white' : 'bg-indigo-600 text-white'
                    }`}>
                    DEP
                </span>
            ) : (
                <div className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center text-xs ${isAm ? 'bg-emerald-100 text-emerald-600' : 'bg-emerald-100 text-emerald-600'
                    }`}>
                    <i className="bi bi-check-lg font-bold"></i>
                </div>
            )}
        </td>
    );
};

export default ExamAllotment;
