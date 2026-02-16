import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import FacultyTable from '../components/FacultyTable';
import AddFacultyModal from '../components/AddFacultyModal';
import FacultyDutiesModal from '../components/FacultyDutiesModal';
import { generateDepartmentReport } from '../utils/exportUtils';

const FacultyManagement = () => {
    const { user } = useContext(AuthContext);
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
                    <h1 className="text-4xl font-black text-retro-dark tracking-tight">
                        Faculty Details
                    </h1>
                </div>

                <div className="flex gap-4 relative z-10">
                    {user && user.role === 'admin' && (
                        <>
                            <button
                                onClick={handleExportAllocations}
                                className="flex items-center gap-3 px-5 py-3 rounded-lg bg-white border-2 border-retro-border text-retro-secondary font-bold hover:border-retro-blue hover:text-retro-blue transition-all text-xs uppercase tracking-wider"
                            >
                                <i className="bi bi-cloud-arrow-down-fill text-lg"></i>
                                <span>Dept Doc</span>
                            </button>
                            <button
                                onClick={() => setShowModal(true)}
                                className="flex items-center gap-3 px-6 py-3 rounded-lg bg-retro-blue text-white font-bold shadow-paper hover:translate-y-[-2px] hover:shadow-lg transition-all border-2 border-retro-dark text-xs uppercase tracking-wider"
                            >
                                <i className="bi bi-plus-lg text-lg"></i>
                                <span>New Faculty</span>
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Filter Bar (Retro Pill) */}
            <div className="bg-retro-white p-2 rounded-xl border-2 border-retro-dark/10 flex flex-col md:flex-row gap-2 shadow-sm items-center">
                <div className="relative flex-1 w-full group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-retro-secondary group-focus-within:text-retro-blue transition-colors">
                        <i className="bi bi-search"></i>
                    </div>
                    <input
                        type="text"
                        className="w-full pl-12 pr-6 py-3 rounded-lg bg-transparent text-retro-dark placeholder-retro-secondary/50 font-bold focus:bg-retro-cream/20 outline-none transition-all text-sm"
                        placeholder="Search faculty..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="md:w-px md:h-8 bg-retro-dark/10 hidden md:block"></div>
                <div className="md:w-64 w-full relative">
                    <select
                        className="w-full pl-4 pr-10 py-3 rounded-lg bg-transparent text-retro-secondary font-bold outline-none cursor-pointer appearance-none hover:bg-retro-cream/20 transition-colors text-xs uppercase tracking-wider"
                        value={departmentFilter}
                        onChange={(e) => setDepartmentFilter(e.target.value)}
                    >
                        <option value="" className="bg-white text-retro-secondary">All Departments</option>
                        {departments.map(dept => (
                            <option key={dept} value={dept} className="bg-white text-retro-dark">{dept}</option>
                        ))}
                    </select>
                    <i className="bi bi-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-retro-secondary pointer-events-none text-xs"></i>
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
                    faculty={faculty}
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
