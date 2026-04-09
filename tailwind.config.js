/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: [
    "./App.tsx",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        void: {
          black: "#000000",
          white: "#ffffff",
          text: {
            primary: "#f0f0f0",
            secondary: "#a1a4a5",
            tertiary: "#464a4d",
          },
          frost: "rgba(214, 235, 253, 0.19)",
          frostHover: "rgba(214, 235, 253, 0.4)",
          ring: "rgba(176, 199, 217, 0.145)",
          accent: {
            blue: "#3b9eff",
            blueBg: "rgba(0, 117, 255, 0.34)",
            red: "#ff2047",
            redBg: "rgba(255, 32, 71, 0.34)",
            green: "#11ff99",
            greenBg: "rgba(34, 255, 153, 0.12)",
            orange: "#ff801f",
            orangeBg: "rgba(255, 89, 0, 0.22)",
            yellow: "#ffc53d",
            yellowBg: "rgba(255, 197, 161, 0.2)",
          },
        },
      },
      fontFamily: {
        display: ["PlayfairDisplay_400Regular"],
        section: ["SpaceGrotesk_400Regular"],
        body: ["Inter_400Regular"],
        mono: ["JetBrainsMono_400Regular"],
      },
    },
  },
  plugins: [],
};
