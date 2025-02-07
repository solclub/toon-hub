/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  important: true,
  theme: {
    extend: {
      dropShadow: {
        none: "0px 0px 10px #074f40",
        common: "0px 0px 10px #9e9ea0",
        rare: "0px 0px 10px #5c87ab",
        epic: "0px 0px 10px #8d6ab4",
        legendary: "0px 0px 10px #c8ab00",
        mythic: "0px 0px 10px #ff0337",
        secret: "0px 0px 10px #00dcc7",
      },
      colors: {
        none: "#074f40",
        common: "#9e9ea0",
        rare: "#5c87ab",
        epic: "#8d6ab4",
        legendary: "#c8ab00",
        mythic: "#ff0337",
        secret: "#00dcc7",
      },
      keyframes: {
        scroll: {
          "0%": { transform: "translateX(0%)" },
          "50%": { transform: "translateX(-30%)" },
          "100%": { transform: "translateX(0%)" },
        },
      },
      animation: {
        scrollText: "scroll 5s linear infinite",
      },
      fontFamily: {
        "inknut-antiqua": ['"Inknut Antiqua"', "Helvetica"],
        "medieval-sharp": ['"MedievalSharp"', "Helvetica"],
      },
    },
  },
  plugins: [require("daisyui")],
};
