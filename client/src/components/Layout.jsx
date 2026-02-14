import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';

const Layout = ({ children }) => {
    // Generate star positions
    const [stars, setStars] = useState([]);
    const [shootingStar, setShootingStar] = useState(null);

    useEffect(() => {
        setStars(Array.from({ length: 200 }).map((_, i) => ({
            left: Math.random() * 100 + '%',
            top: Math.random() * 100 + '%',
            size: Math.random() * 1.5 + 0.5 + 'px',
            opacity: Math.random() * 0.4 + 0.1,
        })));

        // Random shooting star generator
        const interval = setInterval(() => {
            setShootingStar({
                top: Math.random() * 50 + '%',
                left: Math.random() * 50 + '%',
                delay: 0
            });
            setTimeout(() => setShootingStar(null), 2000); // Reset
        }, 8000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col h-screen bg-[#020617] text-slate-300 overflow-hidden font-sans relative">

            {/* --- DEEP MATTE UNIVERSE (NO NEON) --- */}

            {/* 1. The Void */}
            <div className="fixed inset-0 bg-[#050505] z-0 pointer-events-none"></div>

            {/* 2. STARFIELD (Moving) */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 animate-star-move" style={{ animationDuration: '150s' }}>
                    <div className="absolute inset-0">
                        {stars.map((s, i) => (
                            <div key={`a-${i}`} className="absolute bg-slate-400 rounded-full" style={{ left: s.left, top: s.top, width: s.size, height: s.size, opacity: s.opacity }}></div>
                        ))}
                    </div>
                    {/* Seamless Loop Duplicate */}
                    <div className="absolute inset-0 transform translate-y-full">
                        {stars.map((s, i) => (
                            <div key={`b-${i}`} className="absolute bg-slate-400 rounded-full" style={{ left: s.left, top: s.top, width: s.size, height: s.size, opacity: s.opacity }}></div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 2b. SHOOTING STAR (Occasional Moment) */}
            {shootingStar && (
                <div
                    className="fixed w-[200px] h-[1px] bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"
                    style={{
                        top: shootingStar.top,
                        left: shootingStar.left,
                        transform: 'rotate(45deg) translateX(100vh)',
                        transition: 'transform 1s linear' // Simplified for CSS animation usually, but using div movement here
                    }}
                >
                    {/* CSS Animation is better for this, using a pre-defined class or style */}
                    <div className="absolute top-0 left-0 w-[100px] h-[2px] bg-gradient-to-r from-transparent to-slate-200 opacity-50 blur-[1px] animate-swim-right" style={{ animationDuration: '1s' }}></div>
                </div>
            )}

            {/* 3. EXPANDED PLANETARY SYSTEM (Dim & Matte) */}

            {/* Planet 1: SATURN (Top Right - Kinetic) */}
            <div className="fixed top-[-15%] right-[-10%] w-[900px] h-[900px] pointer-events-none z-0 flex items-center justify-center animate-saturn-drift opacity-40">
                <div className="absolute w-[280px] h-[280px] rounded-full bg-[#0f172a] shadow-[inset_-20px_-20px_60px_#000,0_0_20px_rgba(255,255,255,0.02)] border border-slate-800/30"></div>
                {/* Rings */}
                <div className="absolute inset-0 flex items-center justify-center transform rotate-x-[70deg] rotate-y-[15deg]">
                    <div className="absolute inset-0 animate-ring-spin">
                        <div className="absolute inset-[20%] rounded-full border-[30px] border-slate-800/30 border-l-slate-600/20 border-r-slate-600/20"></div>
                    </div>
                </div>
            </div>

            {/* Planet 2: ICE GIANT (Bottom Left - Deep Blue Matte) */}
            <div className="fixed bottom-[-10%] left-[-5%] w-[500px] h-[500px] pointer-events-none z-0 opacity-20 animate-float">
                <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#0f172a] to-[#1e293b] shadow-[inset_-40px_-40px_80px_#000]"></div>
                {/* Tiny Moon Orbiting Ice Giant */}
                <div className="absolute inset-[-50px] animate-spin-slow" style={{ animationDuration: '30s' }}>
                    <div className="absolute top-0 left-1/2 w-4 h-4 bg-slate-600 rounded-full shadow-[inset_-2px_-2px_4px_#000]"></div>
                </div>
            </div>

            {/* Planet 3: RED DWARF (Top Left - Matte Rust) */}
            <div className="fixed top-[10%] left-[5%] w-[150px] h-[150px] pointer-events-none z-0 opacity-15 animate-float-horizontal" style={{ animationDuration: '40s' }}>
                <div className="w-full h-full rounded-full bg-gradient-to-br from-[#3f2e2e] to-[#1a1010] shadow-[inset_-10px_-10px_30px_#000]"></div>
            </div>

            {/* Planet 4: GAS GIANT SILHOUETTE (Bottom Right - Massive) */}
            <div className="fixed bottom-[-30%] right-[-20%] w-[1200px] h-[1200px] pointer-events-none z-0 opacity-10">
                <div className="w-full h-full rounded-full bg-[#0a0a0a] border-t border-slate-800/20">
                    {/* Faint Banding */}
                    <div className="absolute top-[30%] left-[-10%] right-[-10%] h-[50px] bg-slate-900/10 blur-xl transform -rotate-12"></div>
                    <div className="absolute top-[45%] left-[-10%] right-[-10%] h-[30px] bg-slate-900/10 blur-xl transform -rotate-12"></div>
                </div>
            </div>

            {/* Planet 5: ROCKY ASTEROID (Drifting Foreground) */}
            <div className="fixed top-1/2 left-[-200px] w-[60px] h-[60px] pointer-events-none z-0 animate-swim-right opacity-30" style={{ animationDuration: '90s' }}>
                <div className="w-full h-full rounded-[40%] bg-[#334155] shadow-[inset_-5px_-5px_15px_#000] rotate-12"></div>
            </div>


            {/* --- UI (Clean Matte Top Nav) --- */}
            <div className="relative z-10 flex flex-col h-full bg-transparent">
                <Navbar />

                <main className="flex-1 overflow-hidden relative">
                    {/* Optional: Scrolling Content Area */}
                    <div className="h-full overflow-y-auto px-10 pb-10 pt-6 scroll-smooth no-scrollbar">
                        <div className="max-w-7xl mx-auto w-full">
                            {/* Small Sub-Header for Context if needed, or just children */}
                            <div className="flex items-center gap-3 mb-6 opacity-50">
                                <i className="bi bi-bullseye text-slate-600"></i>
                                <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-semibold font-mono">System_Telemetry_Active</span>
                            </div>
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
