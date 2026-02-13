import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FacultyTable from '../components/FacultyTable';
import AddFacultyModal from '../components/AddFacultyModal';

const FacultyManagement = () => {
    const [faculty, setFaculty] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('');
    const [showModal, setShowModal] = useState(false);
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
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Faculty Management</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage faculty details, departments, and active status.</p>
                </div>
                <button
                    className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-xl font-medium shadow-sm shadow-brand-600/20 active:scale-95 transition-all flex items-center gap-2"
                    onClick={() => setShowModal(true)}
                >
                    <i className="bi bi-person-plus-fill"></i>
                    Add Faculty
                </button>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    <input
                        type="text"
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition"
                        placeholder="Search by name or initials..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="md:w-64">
                    <select
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition appearance-none bg-white"
                        value={departmentFilter}
                        onChange={(e) => setDepartmentFilter(e.target.value)}
                        style={{ backgroundImage: 'none' }} // Custom arrow can be added with CSS or a wrapper
                    >
                        <option value="">All Departments</option>
                        {departments.map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
                </div>
            ) : (
                <FacultyTable
                    faculty={filteredFaculty}
                    onToggleStatus={handleToggleStatus}
                    onDelete={handleDelete}
                />
            )}

            {showModal && (
                <AddFacultyModal
                    onClose={() => setShowModal(false)}
                    onSave={handleAddFaculty}
                    departments={departments}
                />
            )}
        </div>
    );
};

export default FacultyManagement;
