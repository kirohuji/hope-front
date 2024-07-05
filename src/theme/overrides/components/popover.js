import { listClasses } from '@mui/material/List';
//
import { paper } from '../../css';

// ----------------------------------------------------------------------

export default function Popover(theme) {
  return {
    MuiPopover: {
      styleOverrides: {
        paper: {
          ...paper({ theme, dropdown: true }),
          [`& .${listClasses.root}`]: {
            paddingTop: 0,
            paddingBottom: 0,
          },
        },
      },
    },
  };
}
