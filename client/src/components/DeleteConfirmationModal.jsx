import React, { useState } from 'react';

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, loading }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!password) {
            setError('Password is required');
            return;
        }

        // Pass password to parent handler
        try {
            await onConfirm(password);
            setPassword(''); // Clear on success/close
            setError('');
        } catch (err) {
            // Error handling usually done in parent, but we can set local error if promise rejects
            setError('Authentication failed or operation error.');
            console.error(err);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-retro-dark/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative bg-retro-white w-full max-w-md rounded-xl shadow-2xl border-4 border-retro-dark transform transition-all scale-100 animate-in fade-in zoom-in duration-200">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-6 text-retro-red">
                        <div className="w-12 h-12 rounded-full bg-retro-red/10 flex items-center justify-center border-2 border-retro-red">
                            <i className="bi bi-exclamation-triangle-fill text-2xl"></i>
                        </div>
                        <div>
                            <h3 className="text-xl font-black uppercase tracking-tight text-retro-dark">Confirm Deletion</h3>
                            <p className="text-xs font-bold uppercase tracking-wide opacity-60 text-retro-dark">Permanent Action</p>
                        </div>
                    </div>

                    {/* Body */}
                    <p className="text-retro-secondary font-medium mb-6 leading-relaxed">
                        This will permanently delete <span className="font-black text-retro-dark">ALL</span> exam and room allocation data from the database. This action cannot be undone.
                    </p>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-black uppercase tracking-wide text-retro-dark mb-2">
                                Enter Admin Password to Confirm
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setError('');
                                }}
                                className="w-full bg-retro-white border-2 border-retro-dark rounded-lg px-4 py-3 text-retro-dark font-bold placeholder-retro-secondary/50 focus:outline-none focus:ring-0 focus:border-retro-blue transition-colors"
                                placeholder="Your password..."
                                autoFocus
                            />
                            {error && <p className="text-retro-red text-xs font-bold mt-2 animate-pulse">{error}</p>}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3 mt-8">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-3 bg-retro-white border-2 border-retro-dark text-retro-dark font-black uppercase tracking-wider rounded-lg hover:bg-gray-50 transition-colors"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-4 py-3 bg-retro-red border-2 border-retro-dark text-white font-black uppercase tracking-wider rounded-lg hover:bg-red-600 shadow-paper hover:translate-y-[-2px] active:translate-y-[0px] transition-all flex items-center justify-center gap-2"
                                disabled={loading}
                            >
                                {loading ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <i className="bi bi-trash-fill"></i> Delete
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal;
