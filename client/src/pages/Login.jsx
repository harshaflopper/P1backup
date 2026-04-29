import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!username || !password) {
            setError('Please enter both username and password.');
            return;
        }

        const res = await login(username, password);
        if (res.success) {
            navigate('/');
        } else {
            setError(res.msg);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#66AB96]">
            <div className="bg-retro-white p-8 rounded-xl shadow-paper border-2 border-retro-dark w-full max-w-md animate-in fade-in zoom-in duration-300">
                <div className="text-center mb-8">
                    <img src="/sit-logo.png" alt="SIT Logo" className="w-16 h-16 mx-auto mb-4 object-contain" />
                    <h2 className="text-2xl font-black text-retro-dark uppercase tracking-tight">Access Control</h2>
                    <p className="text-retro-secondary text-xs font-bold uppercase tracking-widest mt-1">Authorized Personnel Only</p>
                </div>

                {error && (
                    <div className="bg-retro-red/10 border-2 border-retro-red text-retro-red px-4 py-3 rounded-lg mb-6 text-sm font-bold text-center uppercase tracking-wide">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-retro-dark text-xs font-black uppercase tracking-wider mb-2">Username</label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 rounded-lg border-2 border-retro-border bg-white focus:border-retro-blue focus:outline-none focus:shadow-sm transition-all font-mono text-sm"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter username"
                        />
                    </div>
                    <div>
                        <label className="block text-retro-dark text-xs font-black uppercase tracking-wider mb-2">Password</label>
                        <input
                            type="password"
                            className="w-full px-4 py-3 rounded-lg border-2 border-retro-border bg-white focus:border-retro-blue focus:outline-none focus:shadow-sm transition-all font-mono text-sm"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-retro-dark text-white py-3 rounded-lg font-black uppercase tracking-wider shadow-paper hover:translate-y-[-2px] active:translate-y-[0px] active:shadow-none transition-all border-2 border-retro-dark"
                    >
                        Authenticate
                    </button>
                </form>

                <div className="mt-8 text-center border-t-2 border-retro-dark/10 pt-4">
                    <p className="text-[10px] text-retro-secondary uppercase font-bold tracking-widest">
                        Default:user / user123
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
