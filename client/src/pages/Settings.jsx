import React from 'react';
import axios from 'axios';

const Settings = () => {

    const handleClearDB = async () => {
        const pin = prompt("Enter Administrator PIN to DELETE all records:");
        if (pin !== "1234") {
            alert("Incorrect PIN. Action cancelled.");
            return;
        }

        if (!confirm('CRITICAL WARNING: This will permanently DELETE ALL exam and room allocation data from the database. This cannot be undone. Are you sure?')) {
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

    return (
        <div className="space-y-10 pb-20 font-sans text-retro-dark">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b-2 border-retro-dark/10 pb-6">
                <div>
                    <h1 className="text-3xl font-black text-retro-dark tracking-tight uppercase">Settings</h1>
                    <p className="text-retro-secondary text-sm font-bold mt-1 tracking-wide uppercase">Manage application data and configurations.</p>
                </div>
            </div>

            <div className="max-w-xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-retro-white rounded-xl shadow-paper border-2 border-retro-dark overflow-hidden">
                    <div className="p-6">
                        <h3 className="text-xl font-black text-retro-dark mb-4 uppercase tracking-tight">Data Management</h3>

                        <div className="bg-retro-red/10 border-2 border-retro-red/20 rounded-lg p-5">
                            <h4 className="font-bold text-retro-red mb-2 uppercase text-sm flex items-center gap-2">
                                <i className="bi bi-exclamation-triangle-fill"></i> Danger Zone
                            </h4>
                            <p className="text-retro-secondary text-xs font-bold mb-4 uppercase tracking-wide leading-relaxed">
                                Deleting allocation data is irreversible. Please ensure you have exported any necessary reports before proceeding.
                            </p>
                            <button
                                className="w-full bg-retro-red hover:bg-retro-red/90 text-white px-6 py-3 rounded-lg font-black shadow-paper active:translate-y-[0px] hover:translate-y-[-2px] transition-all flex items-center justify-center gap-2 border-2 border-retro-dark uppercase tracking-wider text-xs"
                                onClick={handleClearDB}
                            >
                                <i className="bi bi-trash-fill"></i>
                                Delete Allocation Data
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
