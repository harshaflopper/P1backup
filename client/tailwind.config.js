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
                mono: ['"JetBrains Mono"', 'monospace'],
                serif: ['"Playfair Display"', 'serif'], // Added for retro feel
            },
            colors: {
                retro: {
                    cream: '#E9D8A6',      // Background
                    blue: '#6FA9C9',       // Primary
                    red: '#D13A3A',        // Accent
                    dark: '#1E1E1E',       // Primary Text
                    secondary: '#5A5A5A',  // Secondary Text
                    white: '#FFFFFF',      // Cards/Containers
                    border: '#DCDCDC',     // Borders
                },
                // Keeping some utilities just in case, but re-mapped
                theme: {
                    primary: '#6FA9C9',
                    accent: '#D13A3A',
                    bg: '#E9D8A6',
                    text: '#1E1E1E',
                }
            },
            boxShadow: {
                'paper': '4px 4px 0px 0px rgba(30,30,30,1)', // Retro hard shadow
                'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'float-horizontal': 'floatHorizontal 20s ease-in-out infinite',
                'star-move': 'starMove 100s linear infinite',
                'saturn-drift': 'saturnDrift 60s ease-in-out infinite',
                'ring-spin': 'spin 20s linear infinite',
                'spin-slow': 'spin 30s linear infinite',
            },
            keyframes: {
                starMove: {
                    '0%': { transform: 'translateY(0)' },
                    '100%': { transform: 'translateY(-100vh)' },
                },
                saturnDrift: {
                    '0%': { transform: 'translate(0, 0)' },
                    '25%': { transform: 'translate(20px, 10px)' },
                    '50%': { transform: 'translate(0, 20px)' },
                    '75%': { transform: 'translate(-20px, 10px)' },
                    '100%': { transform: 'translate(0, 0)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                floatHorizontal: {
                    '0%, 100%': { transform: 'translateX(0)' },
                    '50%': { transform: 'translateX(40px)' },
                },
            }
        },
    },
    plugins: [],
}
