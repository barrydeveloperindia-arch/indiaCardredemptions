/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./context/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Englabs Modern Corporate Light Palette
        englabs: {
          bg: '#FFFFFF',       // Pure White
          surface: '#FFFFFF',  // Pure White
          primary: '#4F46E5',  // Indigo 600 (High Contrast "Easy to Use")
          primary_hover: '#4338CA', // Indigo 700
          secondary: '#64748B', // Slate 500
          success: '#10B981',  // Emerald 500
          danger: '#EF4444',   // Red 500
          warning: '#F59E0B',  // Amber 500
          border: '#E2E8F0',   // Slate 200
          text: {
            primary: '#0F172A',   // Slate 900
            secondary: '#475569', // Slate 600
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'englabs-card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'englabs-floating': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
}
