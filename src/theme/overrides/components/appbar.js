// ----------------------------------------------------------------------

export default function AppBar(theme) {
  return {
    MuiAppBar: {
      defaultProps: {
        color: 'transparent',
      },

      styleOverrides: {
        root: {
          boxShadow: 'none',
        },
      },
    },
  };
}
