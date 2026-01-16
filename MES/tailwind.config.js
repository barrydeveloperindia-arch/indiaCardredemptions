/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Englabs Modern Corporate Light Palette
        englabs: {
          bg: '#F8FAFC',       // Slate 50 (App Background)
          surface: '#FFFFFF',  // Pure White (Cards/Sidebar)
          primary: '#2563EB',  // Royal Blue 600 (Primary Action)
          primary_hover: '#1D4ED8', // Royal Blue 700
          secondary: '#64748B', // Slate 500 (Muted Text)
          success: '#10B981',  // Emerald 500
          danger: '#EF4444',   // Red 500
          warning: '#F59E0B',  // Amber 500
          border: '#E2E8F0',   // Slate 200 (Subtle Borders)
          text: {
            primary: '#0F172A',   // Slate 900 (Headings)
            secondary: '#475569', // Slate 600 (Body)
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'sans-serif'], // High-legibility industrial standard
      },
      boxShadow: {
        // Minimalist elevation for cards (floating look)
        'englabs-card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'englabs-floating': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
      spacing: {
        '128': '32rem', // for wide Gantt charts
        '144': '36rem',
      }
    },
  },
  plugins: [],
}
