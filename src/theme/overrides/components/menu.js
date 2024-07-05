//
import { menuItem } from '../../css';

// ----------------------------------------------------------------------

export default function Menu(theme) {
  return {
    MuiMenuItem: {
      styleOverrides: {
        root: {
          ...menuItem(theme),
        },
      },
    },
  };
}
