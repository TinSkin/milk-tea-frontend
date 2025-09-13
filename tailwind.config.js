/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark_blue: "rgb(11, 48, 66)", // thêm màu tuỳ chỉnh ở đây
        camel: "rgb(167, 129, 92)",
        logo_color: "rgb(229, 156, 54)",
        green_starbuck: "#006241"
      },
      fontFamily: {
        baloo: ['"Baloo 2"', 'cursive'],
        fredoka: ['Fredoka', 'sans-serif'],
        quicksand: ['Quicksand', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
        // font mặc định của Tailwind
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        roboto: ['Roboto', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
        nunito: ['Nunito', 'sans-serif'],
        opensans: ['"Open Sans"', 'sans-serif'],
        lato: ['Lato', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

