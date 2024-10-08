import { Outlet } from 'react-router-dom';
// hooks
import { Box } from '@mui/material';
import { useOffSetTop } from 'src/hooks/use-off-set-top';
// config
import { HEADER } from '../../config-global';
// components
import Header from './header';

// @mui

// ----------------------------------------------------------------------

export default function ReturnLayout() {
  const isOffset = useOffSetTop(HEADER.H_MAIN_DESKTOP);

  return (
    <div style={{ position: 'relative' }}  className='return-layout'>
      <Header isOffset={isOffset} />
      <Box
        component="main"
        className='return-main'
        sx={{
          // display: { lg: 'flex' },
          display: 'flex',
          // minHeight: 1,
          // minHeight: { lg: 1 },
          // height: 'calc(100vh - 72px)',
          // height: '400px',
        }}
      >
        <Outlet />
      </Box>
    </div>
  );
}
