import { Outlet } from 'react-router-dom';
// hooks
import { Box } from '@mui/material';
import { useOffSetTop } from 'src/hooks/use-off-set-top';
// config
import { HEADER } from '../../config-global';
// components
import Header from './header'

// @mui

// ----------------------------------------------------------------------

export default function ReturnLayout () {
  const isOffset = useOffSetTop(HEADER.H_MAIN_DESKTOP);

  return (
    <div style={{ position: 'relative'}}>
      <Header isOffset={isOffset} />
      <Box
        sx={{
          display: { lg: 'flex' },
          minHeight: { lg: 1 },
          height: 'calc(100% - 64px)'
        }}
      >
        <Outlet />
      </Box>
    </div>
  );
}
