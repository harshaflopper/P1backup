/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['"Inter"', '"Plus Jakarta Sans"', 'sans-serif'],
            },
            colors: {
                theme: {
                    ice: '#90E0EF',      // Light Water Glow
                    freeze: '#020617',   // Background (Deep Dark)
                    medium: '#0B3D91',   // Deep Ocean Blue
                    pain: '#00F5D4',     // Aqua Neon (Primary)
                    heavy: '#0077B6',    // Teal Blue (Secondary)
                },
                brand: {
                    50: '#F0F9FF',
                    100: '#E0F2FE',
                    200: '#BAE6FD',
                    300: '#7DD3FC',
                    400: '#06B6D4',      // Secondary
                    500: '#2563EB',      // Primary
                    600: '#1D4ED8',
                    700: '#1E40AF',
                    800: '#1E3A8A',
                    900: '#0F172A',      // Text
                    950: '#020617',
                },
                zinc: {
                    850: '#1f2937',
                    900: '#18181b',
                    950: '#09090b',
                }
            },
            boxShadow: {
                'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
                'neon': '0 0 10px rgba(16, 185, 129, 0.5)',
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'cyber-grid': 'linear-gradient(to right, #1f2937 1px, transparent 1px), linear-gradient(to bottom, #1f2937 1px, transparent 1px)',
            },
            animation: {
                'blob': 'blob 10s infinite',
                'float': 'float 6s ease-in-out infinite',
                'float-horizontal': 'floatHorizontal 20s ease-in-out infinite',
                'star-move': 'starMove 100s linear infinite',
                'saturn-drift': 'saturnDrift 60s ease-in-out infinite',
                'ring-spin': 'spin 20s linear infinite',
            },
            keyframes: {
                starMove: {
                    '0%': { transform: 'translateY(0)' },
                    '100%': { transform: 'translateY(-100vh)' }, // Drifts Up
                },
                saturnDrift: {
                    '0%': { transform: 'translate(0, 0)' },
                    '25%': { transform: 'translate(20px, 10px)' },
                    '50%': { transform: 'translate(0, 20px)' },
                    '75%': { transform: 'translate(-20px, 10px)' },
                    '100%': { transform: 'translate(0, 0)' },
                },
                blob: {
                    '0%': { transform: 'translate(0px, 0px) scale(1)' },
                    '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
                    '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
                    '100%': { transform: 'translate(0px, 0px) scale(1)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                floatHorizontal: {
                    '0%, 100%': { transform: 'translateX(0)' },
                    '50%': { transform: 'translateX(40px)' }, // Move sideways
                },
                rotate: {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' },
                }
            }
        },
    },
    plugins: [],
}
