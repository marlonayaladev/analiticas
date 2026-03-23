/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: { colors: { sap: { blue: '#0070f3', dark: '#1a1a1a', gray: '#f5f7f9' } } } },
  plugins: [],
}