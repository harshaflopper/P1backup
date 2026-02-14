import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';

const Layout = ({ children }) => {
    // Generate star positions (Dark dots for retro feel)
    const [stars, setStars] = useState([]);
    const [shootingStar, setShootingStar] = useState(null);

    useEffect(() => {
        setStars(Array.from({ length: 150 }).map((_, i) => ({
            left: Math.random() * 100 + '%',
            top: Math.random() * 100 + '%',
            size: Math.random() * 2 + 1 + 'px', // Slightly larger for "ink dots"
            opacity: Math.random() * 0.3 + 0.1,
        })));

        const interval = setInterval(() => {
            setShootingStar({
                top: Math.random() * 50 + '%',
                left: Math.random() * 50 + '%',
                delay: 0
            });
            setTimeout(() => setShootingStar(null), 2000);
        }, 8000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col h-screen bg-retro-cream text-retro-dark overflow-hidden font-sans relative selection:bg-retro-red selection:text-white">

            {/* --- RETRO STAR CHART (PAPER THEME) --- */}

            {/* 1. Paper Texture/Grain (Optional, simpler to just use color for now) */}
            <div className="fixed inset-0 pointer-events-none z-0 opacity-5 mix-blend-multiply" style={{ backgroundImage: 'url("data:image/svg+xml,...")' }}></div>

            {/* 2. STARFIELD (Ink Dots) */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 animate-star-move" style={{ animationDuration: '200s' }}>
                    <div className="absolute inset-0">
                        {stars.map((s, i) => (
                            <div key={`a-${i}`} className="absolute bg-retro-secondary rounded-full" style={{ left: s.left, top: s.top, width: s.size, height: s.size, opacity: s.opacity }}></div>
                        ))}
                    </div>
                    <div className="absolute inset-0 transform translate-y-full">
                        {stars.map((s, i) => (
                            <div key={`b-${i}`} className="absolute bg-retro-secondary rounded-full" style={{ left: s.left, top: s.top, width: s.size, height: s.size, opacity: s.opacity }}></div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 2b. SHOOTING STAR (Pencil Stroke) */}
            {shootingStar && (
                <div
                    className="fixed w-[200px] h-[2px] bg-retro-red opacity-60"
                    style={{
                        top: shootingStar.top,
                        left: shootingStar.left,
                        transform: 'rotate(45deg) translateX(100vh)',
                        transition: 'transform 1s linear'
                    }}
                ></div>
            )}

            {/* 3. PLANETARY DIAGRAMS (Blueprint Style) */}

            {/* Planet 1: RED GIANT SKETCH (Top Right) */}
            <div className="fixed top-[-10%] right-[-10%] w-[600px] h-[600px] pointer-events-none z-0 flex items-center justify-center animate-saturn-drift opacity-20">
                <div className="absolute w-[400px] h-[400px] rounded-full border-[1px] border-retro-red border-dashed"></div>
                <div className="absolute w-[350px] h-[350px] rounded-full border-[2px] border-retro-red/30"></div>
            </div>

            {/* Planet 2: BLUE RINGS (Bottom Left) */}
            <div className="fixed bottom-[-15%] left-[-5%] w-[700px] h-[700px] pointer-events-none z-0 animate-float opacity-30">
                {/* Main Body Outline */}
                <div className="absolute inset-[15%] rounded-full border-[2px] border-retro-blue bg-retro-blue/5"></div>
                {/* Ring Outline */}
                <div className="absolute inset-0 border-[1px] border-retro-blue/50 rounded-full transform scale-x-150 rotate-12"></div>
            </div>

            {/* Grid Lines (Graph Paper Effect) */}
            <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]"
                style={{
                    backgroundImage: `linear-gradient(to right, #1E1E1E 1px, transparent 1px), linear-gradient(to bottom, #1E1E1E 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }}>
            </div>

            {/* --- UI LAYER --- */}
            <div className="relative z-10 flex flex-col h-full bg-transparent">
                <Navbar />

                <main className="flex-1 overflow-hidden relative">
                    <div className="h-full overflow-y-auto px-10 pb-10 pt-6 scroll-smooth no-scrollbar">
                        <div className="max-w-7xl mx-auto w-full">
                            <div className="flex items-center gap-3 mb-6 opacity-60">
                                <i className="bi bi-geo-alt text-retro-red"></i>
                                <span className="text-[10px] uppercase tracking-[0.2em] text-retro-secondary font-bold font-mono">System_Coordinates_Active</span>
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
