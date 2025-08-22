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
        "gentle-pulse": {
          "0%, 100%": { 
            transform: "scale(1)",
            opacity: "0.8"
          },
          "50%": { 
            transform: "scale(1.05)",
            opacity: "1"
          },
        },
        "attention-pulse": {
          "0%, 100%": { 
            transform: "scale(1)",
            boxShadow: "0 0 0 0 rgba(59, 130, 246, 0.7)"
          },
          "50%": { 
            transform: "scale(1.1)",
            boxShadow: "0 0 0 8px rgba(59, 130, 246, 0)"
          },
        },
        "ready-glow": {
          "0%, 100%": { 
            boxShadow: "0 0 10px rgba(34, 197, 94, 0.5)",
            backgroundColor: "rgb(34, 197, 94)"
          },
          "50%": { 
            boxShadow: "0 0 20px rgba(34, 197, 94, 0.8)",
            backgroundColor: "rgb(21, 128, 61)"
          },
        },
        "waiting-pulse": {
          "0%, 100%": { 
            backgroundColor: "rgb(234, 179, 8)",
            boxShadow: "0 0 10px rgba(234, 179, 8, 0.5)"
          },
          "50%": { 
            backgroundColor: "rgb(202, 138, 4)",
            boxShadow: "0 0 20px rgba(234, 179, 8, 0.8)"
          },
        },
        "button-glow": {
          "0%, 100%": {
            boxShadow: "0 0 10px rgba(59, 130, 246, 0.4), 0 4px 8px rgba(0, 0, 0, 0.3)"
          },
          "50%": {
            boxShadow: "0 0 20px rgba(59, 130, 246, 0.6), 0 6px 12px rgba(0, 0, 0, 0.4)"
          },
        },
        "cartoon-bounce": {
          "0%, 100%": { transform: "translateY(0) scale(1)" },
          "50%": { transform: "translateY(-2px) scale(1.02)" },
        },
      },
      animation: {
        scrollText: "scroll 5s linear infinite",
        "gentle-pulse": "gentle-pulse 2s ease-in-out infinite",
        "attention-pulse": "attention-pulse 2s ease-in-out infinite",
        "ready-glow": "ready-glow 1.5s ease-in-out infinite",
        "waiting-pulse": "waiting-pulse 1s ease-in-out infinite",
        "button-glow": "button-glow 2s ease-in-out infinite",
        "cartoon-bounce": "cartoon-bounce 1s ease-in-out infinite",
      },
      fontFamily: {
        "inknut-antiqua": ['"Inknut Antiqua"', "Helvetica"],
        "medieval-sharp": ['"MedievalSharp"', "Helvetica"],
      },
    },
  },
  plugins: [require("daisyui")],
};
