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
            },
        },
    },
    plugins: [],
}

export default config
