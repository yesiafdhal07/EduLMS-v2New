import type { Config } from 'tailwindcss'

const config: Config = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            // Custom Border Radius Design Tokens
            borderRadius: {
                'card': '2.5rem',      // 40px - Standard card radius
                'card-lg': '3rem',     // 48px - Large card radius
                'card-xl': '3.5rem',   // 56px - Extra large card radius
                'btn': '2rem',         // 32px - Button radius
                'btn-lg': '2.5rem',    // 40px - Large button radius
                'icon': '1.5rem',      // 24px - Icon container radius
                'icon-lg': '2rem',     // 32px - Large icon container radius
                'deco': '4rem',        // 64px - Decorative elements
            },
            // Custom Font Size Design Tokens
            fontSize: {
                'micro': ['9px', { lineHeight: '1.4', fontWeight: '900' }],
                'tiny': ['10px', { lineHeight: '1.4', fontWeight: '700' }],
            },
            // Custom Letter Spacing
            letterSpacing: {
                'super-wide': '0.2em',
                'ultra-wide': '0.3em',
                'mega-wide': '0.4em',
            },
            // Extend shadows
            boxShadow: {
                'card': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                'card-hover': '0 35px 60px -12px rgba(0, 0, 0, 0.35)',
            },
            // Font families
            fontFamily: {
                sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
                outfit: ['var(--font-outfit)', 'system-ui', 'sans-serif'],
                // Universe Fonts
                fraunces: ['var(--font-fraunces)', 'Georgia', 'serif'],         // Guru: Literary & warm
                'space-grotesk': ['var(--font-space-grotesk)', 'system-ui', 'sans-serif'], // Siswa: Bold & modern
                'geist-mono': ['var(--font-geist-mono)', 'monospace'],           // Admin: Technical precision
            },
            // Semantic color tokens (global, same across all universes)
            colors: {
                'semantic-success': '#10B981',
                'semantic-warning': '#F59E0B',
                'semantic-error': '#EF4444',
                'semantic-info': '#3B82F6',
            },
            // Z-index scale
            zIndex: {
                'base': '0',
                'raised': '10',
                'dropdown': '100',
                'sticky': '200',
                'overlay': '300',
                'modal': '400',
                'toast': '500',
            },
            // Custom Animations
            keyframes: {
                'flip-in': {
                    '0%': { transform: 'perspective(2000px) rotateX(-60deg) scale(0.95)', opacity: '0' },
                    '100%': { transform: 'perspective(2000px) rotateX(0deg) scale(1)', opacity: '1' }
                },
                'scan': {
                    '0%': { transform: 'translateY(-100%)', opacity: '0' },
                    '50%': { opacity: '1' },
                    '100%': { transform: 'translateY(100vh)', opacity: '0' }
                },
                'float': {
                    '0%, 100%': { transform: 'translateY(0) scale(1)' },
                    '50%': { transform: 'translateY(-20px) scale(1.05)' }
                },
                'twinkle': {
                    '0%, 100%': { opacity: '0.2', transform: 'scale(0.8)' },
                    '50%': { opacity: '1', transform: 'scale(1.2)' }
                },
                'bounce-subtle': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' }
                }
            },
            animation: {
                'flip-in': 'flip-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
                'scan': 'scan 3s linear infinite',
                'float': 'float 6s ease-in-out infinite',
                'float-delayed': 'float 6s ease-in-out 3s infinite',
                'twinkle': 'twinkle 4s ease-in-out infinite',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'bounce-subtle': 'bounce-subtle 3s ease-in-out infinite',
                'ping-slow': 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite',
            }
        },
    },
    plugins: [],
}

export default config
