/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "selector",
  theme: {
    extend: {
      colors: {
        blackPrimary: "#0a0e17",
        blackSecondary: "#111827",
        blackTertiary: "#1f2937",
        whiteSecondary: "#f8fafc",
        whiteTertiary: "#f1f5f9",
        brandPrimary: "#124330",
        brandSecondary: "#1a5b42",
        brandAccent: "#457c63",
        brandEmerald: "#10b981",
        brandRose: "#f43f5e",
        brandAmber: "#f59e0b",
        borderDark: "rgba(255, 255, 255, 0.08)",
        borderLight: "rgba(0, 0, 0, 0.08)",
      },
      boxShadow: {
        "custom-white": "0px 4px 10px 0px rgba(255, 255, 255, 0.90)",
        "premium-card": "0 4px 20px -2px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)",
      },
      backgroundImage: {
        "login-background": "url('/src/assets/dark login bg 1.jpg')",
      },
    },
  },
  plugins: [],
};
