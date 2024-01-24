import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
// @mui
import { useTheme } from '@mui/material/styles';
import { AppBar, Toolbar, Box } from '@mui/material';
// config
import { HEADER } from 'src/config-global';
// utils
import { bgBlur } from 'src/theme/css';
// routes
import { IconButtonAnimate } from 'src/components/animate';
import { useRouter } from 'src/routes/hook';
// components
import Logo from 'src/components/logo';
import Iconify from 'src/components/iconify';
// ----------------------------------------------------------------------

Header.propTypes = {
  isOffset: PropTypes.bool,
  onClose: PropTypes.func,
};

export default function Header({ isOffset, onClose }) {
  const theme = useTheme();
  const router = useRouter();
  return (
    <AppBar color="transparent" sx={{ boxShadow: 0 }} position="static">
      <Toolbar
        sx={{
          height: {
            xs: HEADER.H_MOBILE,
            md: HEADER.H_MAIN_DESKTOP,
          },
          transition: theme.transitions.create(['height', 'background-color'], {
            easing: theme.transitions.easing.easeInOut,
            duration: theme.transitions.duration.shorter,
          }),
          ...(isOffset && {
            ...bgBlur({ color: theme.palette.background.default }),
            height: {
              md: HEADER.H_MAIN_DESKTOP - 16,
            },
          }),
          position: 'relative',
          justifyContent: 'center',
          background: 'white',
        }}
      >
        <div style={{ position: 'absolute', top: '14px', left: 0 }}>
          <IconButtonAnimate sx={{ mr: 1, color: 'text.primary' }} onClick={onClose}>
            <Iconify icon="eva:arrow-ios-back-fill" />
          </IconButtonAnimate>
        </div>
        我的阅读
      </Toolbar>

      {isOffset && <Shadow />}
    </AppBar>
  );
}

// ----------------------------------------------------------------------

Shadow.propTypes = {
  sx: PropTypes.object,
};

function Shadow({ sx, ...other }) {
  return (
    <Box
      sx={{
        left: 0,
        right: 0,
        bottom: 0,
        height: 24,
        zIndex: -1,
        m: 'auto',
        borderRadius: '50%',
        position: 'absolute',
        width: `calc(100% - 48px)`,
        boxShadow: (theme) => theme.customShadows.z8,
        ...sx,
      }}
      {...other}
    />
  );
}
