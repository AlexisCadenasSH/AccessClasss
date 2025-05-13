/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        Bebas_Neue: ['BebasNeue-Regular' , 'sans-serif'],
        "Big_Shoulders_Stencil_18pt-Black" : ["Big_Shoulders_Stencil_18pt-Black", "sans-serif"],
        "Big_Shoulders_Stencil_18pt-Bold" : ["Big_Shoulders_Stencil_18pt-Bold", "sans-serif"],
        "Big_Shoulders_Stencil_18pt-Light" : ["Big_Shoulders_Stencil_18pt-Light", "sans-serif"],
        "Big_Shoulders_Stencil_18pt-Medium" : ["Big_Shoulders_Stencil_18pt-Medium", "sans-serif"],
        "BigShouldersStencil-VariableFont_opsz,wght" : ["BigShouldersStencil-VariableFont_opsz,wght", "sans-serif"],
        "ChakraPetch-Bold"  : ["ChakraPetch-Bold', 'sans-serif"],
        "ChakraPetch-Italic"  : ["ChakraPetch-Italic", "sans-serif"],
        "ChakraPetch-Light"  : ["ChakraPetch-Light", "sans-serif"],
        "ChakraPetch-Medium" : ["ChakraPetch-Medium", "sans-serif"],

      },
      colors: {
        "primary": {
          100: '#A71F210A' ,
          200: '#A71F211A' , 
          300: '#A71F212A' ,
        },
        accent: {
          100: '#FBFBFD',
          200: '#FFFFF0' ,
        },
        black: {
          default:'#000000',
          100: '#8C8E98' ,
          200: '#666876' ,
          300: '#191d31' ,
          
        }
      }
    },
  },
  plugins: [],
}