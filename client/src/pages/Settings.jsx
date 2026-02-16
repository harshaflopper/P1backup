import React, { useContext, useState } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import StatusModal from '../components/StatusModal';

const Settings = () => {
    const { logout } = useContext(AuthContext);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Status Modal State
    const [statusModal, setStatusModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'success'
    });

    const handleClearDB = async (password) => {
        if (!password) return;

        setLoading(true);
        try {
            const res = await axios.delete('/api/allocations', {
                data: { password } // Send password in body
            });
            setIsDeleteModalOpen(false); // Close delete modal

            // Show Success Modal
            setStatusModal({
                isOpen: true,
                title: 'Success!',
                message: res.data.msg,
                type: 'success'
            });
        } catch (err) {
            console.error('Clear DB Error:', err);
            const errMsg = err.response?.data?.msg || err.response?.data || err.message;

            // Show Error Modal (keep delete modal open or close? user might want to retry. Let's close it but show error)
            // Actually, showing error on top of delete modal might be messy with z-index.
            // Let's close delete modal and show error.
            // Or better, update error state INSIDE delete modal? 
            // The request was specifically to replace the "Database cleared successfully" popup.
            // Let's stick to replacing alerts.

            // If it's a password error, maybe we should keep the delete modal open?
            // But let's follow the pattern of replacing 'alert'.

            setStatusModal({
                isOpen: true,
                title: 'Error',
                message: errMsg,
                type: 'error'
            });
        } finally {
            setLoading(false);
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
                                onClick={() => setIsDeleteModalOpen(true)}
                            >
                                <i className="bi bi-trash-fill"></i>
                                Delete Allocation Data
                            </button>
                        </div>
                    </div>
                </div>

                {/* Account Actions */}
                <div className="bg-retro-white rounded-xl shadow-paper border-2 border-retro-dark overflow-hidden">
                    <div className="p-6">
                        <h3 className="text-xl font-black text-retro-dark mb-4 uppercase tracking-tight">Account</h3>
                        <button
                            onClick={logout}
                            className="w-full bg-retro-dark text-retro-white hover:bg-black px-6 py-3 rounded-lg font-black shadow-paper active:translate-y-[0px] hover:translate-y-[-2px] transition-all flex items-center justify-center gap-2 border-2 border-retro-dark uppercase tracking-wider text-xs"
                        >
                            <i className="bi bi-box-arrow-right"></i>
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleClearDB}
                loading={loading}
            />

            {/* Status Modal (Success/Error) */}
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

export default Settings;
