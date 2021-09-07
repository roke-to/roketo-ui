module.exports = {
  purge: [],
  prefix: 'twind-',
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        dark: '#1F1D37',
        dark60: '#1f1d3773', // opacity20
        gray: '#9794B6',
        gray40: '#9794B650',
        blue: '#8DA6FF',
        white: '#FFFFFF',
        input: '#272543',
        border: '#45426D',
        border2: '#413E61', // delimiteres
        hover: '#0D0B26',
        progressBar: '#090818',
        card2: '#353354',
        special: {
          active: '#2EDDD9',
          inactive: '#F56173',
          hold: '#FFAB6A',
        },
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
