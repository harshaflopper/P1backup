import React, { useState } from 'react';

const AddFacultyModal = ({ onClose, onSave, departments, faculty }) => {
    const [formData, setFormData] = useState({
        name: '',
        initials: '',
        designation: '',
        department: '',
        email: '',
        phone: ''
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (name === 'initials') {
            const exists = faculty.some(f => f.initials.toLowerCase() === value.toLowerCase());
            if (exists) {
                setError('Initials must be unique.');
            } else {
                setError('');
            }
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (error) return;
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-retro-dark/80 backdrop-blur-sm transition-opacity">
            <div className="bg-white rounded-xl shadow-paper w-full max-w-lg overflow-hidden transform transition-all scale-100 border-2 border-retro-dark">

                {/* Header (Bold Blue Banner) */}
                <div className="px-6 py-5 border-b-2 border-retro-dark bg-retro-blue flex justify-between items-center">
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">Add New Faculty</h3>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20"
                    >
                        <i className="bi bi-x-lg text-lg"></i>
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="p-8 space-y-5 bg-retro-white">

                        {/* Name Field */}
                        <div>
                            <label className="block text-xs font-black text-retro-dark uppercase tracking-wider mb-2">
                                Full Name <span className="text-retro-red">*</span>
                            </label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 rounded-lg border-2 border-retro-border bg-retro-cream/20 text-retro-dark placeholder-retro-secondary/50 font-bold focus:border-retro-blue focus:bg-white focus:outline-none transition-all shadow-sm"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g. Dr. John Doe"
                            />
                        </div>

                        {/* Initials & Designation */}
                        <div className="grid grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-black text-retro-dark uppercase tracking-wider mb-2">
                                    Initials <span className="text-retro-red">*</span>
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 rounded-lg border-2 border-retro-border bg-retro-cream/20 text-retro-dark placeholder-retro-secondary/50 font-bold focus:border-retro-blue focus:bg-white focus:outline-none transition-all shadow-sm"
                                    name="initials"
                                    required
                                    value={formData.initials}
                                    onChange={handleChange}
                                    placeholder="e.g. JD"
                                />
                                {error && <p className="text-[10px] font-bold text-retro-red mt-1 uppercase tracking-wide">{error}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-black text-retro-dark uppercase tracking-wider mb-2">
                                    Designation <span className="text-retro-red">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        className="w-full px-4 py-3 rounded-lg border-2 border-retro-border bg-retro-cream/20 text-retro-dark font-bold focus:border-retro-blue focus:bg-white focus:outline-none transition-all appearance-none shadow-sm cursor-pointer"
                                        name="designation"
                                        required
                                        value={formData.designation}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select...</option>
                                        <option value="Professor">Professor</option>
                                        <option value="Associate Professor">Associate Professor</option>
                                        <option value="Assistant Professor">Assistant Professor</option>
                                        <option value="Lecturer">Lecturer</option>
                                    </select>
                                    <i className="bi bi-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-retro-secondary pointer-events-none text-xs"></i>
                                </div>
                            </div>
                        </div>

                        {/* Department */}
                        <div>
                            <label className="block text-xs font-black text-retro-dark uppercase tracking-wider mb-2">
                                Department <span className="text-retro-red">*</span>
                            </label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 rounded-lg border-2 border-retro-border bg-retro-cream/20 text-retro-dark placeholder-retro-secondary/50 font-bold focus:border-retro-blue focus:bg-white focus:outline-none transition-all shadow-sm"
                                name="department"
                                required
                                list="deptList"
                                value={formData.department}
                                onChange={handleChange}
                                placeholder="Select or Type New Department"
                            />
                            <datalist id="deptList">
                                {departments.map(dept => (
                                    <option key={dept} value={dept} />
                                ))}
                            </datalist>
                        </div>

                        {/* Contact Info */}
                        <div className="grid grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-black text-retro-dark uppercase tracking-wider mb-2">Email</label>
                                <input
                                    type="email"
                                    className="w-full px-4 py-3 rounded-lg border-2 border-retro-border bg-retro-cream/20 text-retro-dark placeholder-retro-secondary/50 font-bold focus:border-retro-blue focus:bg-white focus:outline-none transition-all shadow-sm"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-retro-dark uppercase tracking-wider mb-2">Phone</label>
                                <input
                                    type="tel"
                                    className="w-full px-4 py-3 rounded-lg border-2 border-retro-border bg-retro-cream/20 text-retro-dark placeholder-retro-secondary/50 font-bold focus:border-retro-blue focus:bg-white focus:outline-none transition-all shadow-sm"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-8 py-5 bg-retro-cream/30 border-t-2 border-retro-dark/10 flex justify-end gap-4">
                        <button
                            type="button"
                            className="px-6 py-2.5 rounded-lg font-bold text-retro-secondary hover:text-retro-dark hover:bg-retro-dark/5 transition-colors uppercase tracking-wider text-xs"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-8 py-2.5 rounded-lg font-black text-white bg-retro-blue hover:bg-retro-blue/90 shadow-paper hover:translate-y-[-2px] active:translate-y-[0px] transition-all border-2 border-retro-dark uppercase tracking-wider text-xs flex items-center gap-2"
                        >
                            <i className="bi bi-check-lg text-lg"></i>
                            Save Faculty
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddFacultyModal;
