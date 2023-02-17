/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      dropShadow: {
        common: "3px 3px 5px #cbd5e1",
        rare: "3px 3px 5px #1e40af",
        "super-rare": "3px 3px 5px #6b21a8",
        legend: "3px 3px 5px #854d0e",
        "ultra-legend": "3px 3px 5px #991b1b",
        secret: "3px 3px 5px #9f1239",
      },
    },
  },
  plugins: [require("daisyui")],
};
