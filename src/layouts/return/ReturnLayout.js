import { Outlet } from 'react-router-dom';
// hooks
import { Box } from '@mui/material';
import { useSafeArea } from 'src/hooks/use-safe-area';
import { useOffSetTop } from 'src/hooks/use-off-set-top';
// config
import { Capacitor } from '@capacitor/core';
import { HEADER } from '../../config-global';
// components
import Header from './header';
import { SAFE_AREA } from '../config-layout';
// @mui

// ----------------------------------------------------------------------

const SPACING = 8;
export default function ReturnLayout() {
  const isOffset = useOffSetTop(HEADER.H_MAIN_DESKTOP);
  const { constant, env } = useSafeArea();
  // 根据设备支持情况选择合适的安全区域值
  const getSafeAreaTop = () => {
    if (constant) return SAFE_AREA.TOP[0];
    if (env) return SAFE_AREA.TOP[1];
    return '0px'; // 默认值
  };

  return (
    <div style={{ position: 'relative' }} className="return-layout">
      <Header isOffset={isOffset} />
      <Box
        component="main"
        className="return-main"
        sx={{
          pt: Capacitor.getPlatform() === 'web' ? '0px' : `calc(${HEADER.H_MOBILE + SPACING}px + ${getSafeAreaTop()})`,
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
