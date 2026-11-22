/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}"
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px"
      }
    },
    extend: {
      fontFamily: {
        barlow: "var(--font-family-barlow)",
        workSans: "var(--font-family-workSans)",
        unbounded: "var(--font-family-unbounded)",
        display: "var(--font-family-unbounded)"
      },
      colors: {
        brand: {
          aqua: "#00ADB4",
          deep: "#004A55",
          ink: "#4D534C",
          strong: "#232B22",
          muted: "#6A6F69",
          paper: "#FAF7FA",
          mint: "#C4E7E8",
          alert: "#FFB4A6",
          "alert-soft": "#FFD9D2"
        },
        greenAqua: {
          1000: "#00ADB4",
          800: "#31BBC1",
          400: "#93D8DB",
          200: "#C4E7E8"
        },
        greenBebe: {
          1000: "#B6DFDF",
          800: "#B6DFDF",
          600: "#CFE8E8",
          400: "#DCECEC",
          200: "#E8F1F1"
        },
        greenBlue: {
          1000: "#004A55",
          800: "#316C75",
          600: "#628E95",
          400: "#93B1B5",
          200: "#C4D3D5"
        },
        greenDark: {
          1000: "#232B22",
          800: "#4D534C",
          600: "#777C76",
          400: "#A1A4A1",
          200: "#CBCDCB"
        },
        white: {
          1000: "#FAF7FA",
          900: "#FFFFFF",
          800: "#F9F7F9",
          600: "#F8F6F8",
          400: "#F7F6F7",
          200: "#F6F5F6"
        },
        error: "#ED3030"
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" }
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out"
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
};
