/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: { felt: "#0a572f" },
      boxShadow: { card: "0 6px 14px rgba(0,0,0,.25)" }
    }
  },
  plugins: []
}
