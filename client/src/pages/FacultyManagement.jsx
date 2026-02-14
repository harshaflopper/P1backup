import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FacultyTable from '../components/FacultyTable';
import AddFacultyModal from '../components/AddFacultyModal';
import FacultyDutiesModal from '../components/FacultyDutiesModal';
import { generateDepartmentReport } from '../utils/exportUtils';

const FacultyManagement = () => {
    const [faculty, setFaculty] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedFacultyForDuties, setSelectedFacultyForDuties] = useState(null);
    const [departments, setDepartments] = useState([]);

    useEffect(() => {
        fetchFaculty();
    }, []);

    const fetchFaculty = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/api/faculty');
            setFaculty(res.data);

            const uniqueDepts = [...new Set(res.data.map(f => f.department))].sort();
            setDepartments(uniqueDepts);

            setLoading(false);
        } catch (err) {
            console.error('Error fetching faculty:', err);
            setLoading(false);
        }
    };

    const handleExportAllocations = async () => {
        try {
            const res = await axios.get('/api/allocations');
            const allocations = res.data;

            if (allocations.length === 0) {
                alert('No allocations found in database to export.');
                return;
            }

            // Transform DB flat data to sessionData format for generator
            // sessionData structure: { date: { session: { deputies: [], invigilators: [] } } }
            const sessionData = {};

            allocations.forEach(alloc => {
                const { date, session } = alloc;
                if (!sessionData[date]) sessionData[date] = {};
                if (!sessionData[date][session]) sessionData[date][session] = { deputies: [], invigilators: [] };

                const person = {
                    name: alloc.facultyName,
                    initials: alloc.initials,
                    designation: alloc.designation,
                    // Use populated department if available, otherwise 'Unknown'
                    department: alloc.facultyId?.department || 'Unknown',
                    dept: alloc.facultyId?.department || 'Unknown',
                    room: alloc.room,
                    role: alloc.role,
                    // phone/mobile not strictly in DB allocationDetail but might be needed?
                    // AllocationDetail doesn't store phone. Generator uses 'phone' or 'contact'.
                    // We might miss phone numbers here unless we fetch full faculty details.
                    // For now, let's leave phone empty or try to map if we have faculty list loaded.
                };

                // Try to find phone from loaded faculty list
                const facultyDetails = faculty.find(f => f._id === alloc.facultyId?._id || f.initials === alloc.initials);
                if (facultyDetails) {
                    person.phone = facultyDetails.phone;
                    person.contact = facultyDetails.phone;
                    if (!person.department || person.department === 'Unknown') {
                        person.department = facultyDetails.department;
                        person.dept = facultyDetails.department;
                    }
                }

                if (alloc.role === 'Deputy') {
                    sessionData[date][session].deputies.push(person);
                } else {
                    sessionData[date][session].invigilators.push(person);
                }
            });

            generateDepartmentReport(sessionData);

        } catch (err) {
            console.error('Export Error:', err);
            alert('Failed to export allocations.');
        }
    };

    const handleAddFaculty = async (newFaculty) => {
        try {
            const res = await axios.post('/api/faculty', newFaculty);
            setFaculty([...faculty, res.data]);
            setShowModal(false);

            if (!departments.includes(res.data.department)) {
                setDepartments([...departments, res.data.department].sort());
            }
        } catch (err) {
            console.error('Error adding faculty:', err);
            alert('Failed to add faculty');
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            const res = await axios.patch(`/api/faculty/${id}/toggle`);
            setFaculty(faculty.map(f => f._id === id ? { ...f, isActive: res.data.isActive } : f));
        } catch (err) {
            console.error('Error toggling status:', err);
            alert('Failed to update status');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this faculty member?')) return;
        try {
            await axios.delete(`/api/faculty/${id}`);
            setFaculty(faculty.filter(f => f._id !== id));
        } catch (err) {
            console.error('Error deleting faculty:', err);
            alert('Failed to delete faculty');
        }
    };

    const filteredFaculty = faculty.filter(f => {
        const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            f.initials.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDept = departmentFilter ? f.department === departmentFilter : true;
        return matchesSearch && matchesDept;
    });

    return (
        <div className="space-y-8 animate-fade-in-up pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 relative">
                <div className="relative z-10">
                    <h1 className="text-4xl font-bold text-white tracking-tight">
                        Faculty<span className="text-indigo-500">_</span>Directory
                    </h1>
                    <p className="text-slate-500 font-bold tracking-[0.2em] mt-2 text-xs uppercase">Deep Field Data Management</p>
                </div>

                <div className="flex gap-4 relative z-10">
                    <button
                        onClick={handleExportAllocations}
                        className="flex items-center gap-3 px-5 py-3 rounded-lg bg-[#0f172a] border border-slate-700 text-slate-300 font-bold hover:bg-slate-800 hover:text-white transition-all text-xs uppercase tracking-wider"
                    >
                        <i className="bi bi-cloud-arrow-down-fill text-lg"></i>
                        <span>Extract Data</span>
                    </button>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-3 px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-900/20 transition-all text-xs uppercase tracking-wider"
                    >
                        <i className="bi bi-plus-lg text-lg"></i>
                        <span>New Entry</span>
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-[#0f172a]/80 p-1.5 rounded-xl border border-slate-800 flex flex-col md:flex-row gap-2 backdrop-blur-xl shadow-xl items-center">
                <div className="relative flex-1 w-full group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                        <i className="bi bi-search"></i>
                    </div>
                    <input
                        type="text"
                        className="w-full pl-12 pr-6 py-3 rounded-lg bg-transparent text-slate-200 placeholder-slate-600 font-medium focus:bg-white/5 outline-none transition-all text-sm"
                        placeholder="Search faculty signals..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="md:w-px md:h-8 bg-slate-800 hidden md:block"></div>
                <div className="md:w-64 w-full relative">
                    <select
                        className="w-full pl-4 pr-10 py-3 rounded-lg bg-transparent text-slate-300 font-bold outline-none cursor-pointer appearance-none hover:bg-white/5 transition-colors text-xs uppercase tracking-wider"
                        value={departmentFilter}
                        onChange={(e) => setDepartmentFilter(e.target.value)}
                    >
                        <option value="" className="bg-[#0f172a] text-slate-400">All Departments</option>
                        {departments.map(dept => (
                            <option key={dept} value={dept} className="bg-[#0f172a] text-slate-200">{dept}</option>
                        ))}
                    </select>
                    <i className="bi bi-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none text-xs"></i>
                </div>
            </div>

            {/* List Content */}
            {loading ? (
                <div className="flex justify-center py-32">
                    <div className="flex flex-col items-center gap-6">
                        <div className="relative">
                            <div className="w-20 h-20 border-4 border-cyan-900/50 border-t-cyan-400 rounded-full animate-spin"></div>
                            <div className="absolute inset-0 border-4 border-cyan-400/20 rounded-full animate-pulse blur-[1px]"></div>
                        </div>
                        <span className="text-cyan-400 font-bold tracking-[0.3em] uppercase text-xs animate-pulse">Initializing Sonar...</span>
                    </div>
                </div>
            ) : (
                <FacultyTable
                    faculty={filteredFaculty}
                    onToggleStatus={handleToggleStatus}
                    onDelete={handleDelete}
                    onViewDuties={setSelectedFacultyForDuties}
                />
            )}

            {showModal && (
                <AddFacultyModal
                    onClose={() => setShowModal(false)}
                    onSave={handleAddFaculty}
                    departments={departments}
                />
            )}

            {selectedFacultyForDuties && (
                <FacultyDutiesModal
                    faculty={selectedFacultyForDuties}
                    onClose={() => setSelectedFacultyForDuties(null)}
                />
            )}
        </div>
    );
};

export default FacultyManagement;
