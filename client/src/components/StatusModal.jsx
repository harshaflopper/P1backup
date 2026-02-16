import React from 'react';

const StatusModal = ({ isOpen, onClose, title, message, type = 'success' }) => {
    if (!isOpen) return null;

    const isSuccess = type === 'success';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-retro-dark/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative bg-retro-white w-full max-w-sm rounded-xl shadow-2xl border-4 border-retro-dark transform transition-all scale-100 animate-in fade-in zoom-in duration-200">
                <div className="p-6 text-center">
                    {/* Icon */}
                    <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center border-2 border-retro-dark ${isSuccess ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {isSuccess ? (
                            <i className="bi bi-check-lg text-3xl"></i>
                        ) : (
                            <i className="bi bi-x-lg text-3xl"></i>
                        )}
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-black uppercase tracking-tight text-retro-dark mb-2">
                        {title}
                    </h3>

                    {/* Message */}
                    <p className="text-retro-secondary font-medium mb-6 leading-relaxed">
                        {message}
                    </p>

                    {/* Button */}
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-3 bg-retro-dark border-2 border-retro-dark text-white font-black uppercase tracking-wider rounded-lg hover:bg-black shadow-paper hover:translate-y-[-2px] active:translate-y-[0px] transition-all"
                    >
                        Okay
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StatusModal;
