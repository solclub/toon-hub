/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      dropShadow: {
        common: "0px 0px 10px #9e9ea0",
        rare: "0px 0px 10px #5c87ab",
        epic: "0px 0px 10px #8d6ab4",
        legendary: "0px 0px 10px #c8ab00",
        mythic: "0px 0px 10px #ff0337",
        secret: "0px 0px 10px #00dcc7",
      },
    },
  },
  plugins: [require("daisyui")],
};
