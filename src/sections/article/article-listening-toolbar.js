import PropTypes from 'prop-types';
import { useState } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import IconButton from '@mui/material/IconButton';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
// components
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export function ArticleListeningToolbar({ loading, playbackRate = 1, onPlaybackRateChange, ...other }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeDrawer, setActiveDrawer] = useState('');

  const handleDrawerOpen = (type) => {
    setActiveDrawer(type);
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setActiveDrawer('');
  };

  const handleSpeedChange = (speed) => {
    if (onPlaybackRateChange) {
      onPlaybackRateChange(speed);
    }
    handleDrawerClose();
  };

  const renderDrawerContent = () => {
    switch (activeDrawer) {
      case 'speed': {
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>播放速度</Typography>
            <Stack direction="row" spacing={1}>
              {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                <Button 
                  key={speed} 
                  variant={playbackRate === speed ? "contained" : "outlined"}
                  onClick={() => handleSpeedChange(speed)}
                >
                  {speed}x
                </Button>
              ))}
            </Stack>
          </Box>
        );
      }
      case 'bookmark': {
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>书签</Typography>
            {/* 书签内容 */}
          </Box>
        );
      }
      case 'summary': {
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>总结</Typography>
            {/* 总结内容 */}
          </Box>
        );
      }
      case 'timer': {
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>睡眠定时</Typography>
            <Stack direction="row" spacing={1}>
              {[15, 30, 45, 60].map((minutes) => (
                <Button key={minutes} variant="outlined">
                  {minutes}分钟
                </Button>
              ))}
            </Stack>
          </Box>
        );
      }
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Stack direction="row" alignItems="center" spacing={2} {...other}>
        <Skeleton variant="circular" width={48} height={48} />
        <Skeleton variant="circular" width={48} height={48} />
        <Skeleton variant="circular" width={48} height={48} />
        <Skeleton variant="circular" width={48} height={48} />
      </Stack>
    );
  }

  const iconButtonStyle = {
    width: 48,
    height: 48,
    '& .MuiSvgIcon-root': {
      width: 28,
      height: 28,
    }
  };

  return (
    <>
      <Stack 
        direction="row" 
        alignItems="center" 
        justifyContent="space-evenly"
        spacing={4}
        sx={{ 
          width: '100%',
          py: 0,
          ...other 
        }}
      >
        <IconButton onClick={() => handleDrawerOpen('speed')} sx={iconButtonStyle}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 'bold',
              '& .speed': {
                fontSize: '1.2em',
              },
              '& .unit': {
                fontSize: '0.9em',
                ml: 0.2,
              }
            }}
          >
            <span className="speed">{playbackRate.toFixed(1)}</span>
            <span className="unit">x</span>
          </Typography>
        </IconButton>
        <IconButton onClick={() => handleDrawerOpen('bookmark')} sx={iconButtonStyle}>
          <Iconify icon="solar:bookmark-broken" width={28} />
        </IconButton>
        <IconButton onClick={() => handleDrawerOpen('summary')} sx={iconButtonStyle}>
          <Iconify icon="solar:atom-broken" width={28} />
        </IconButton>
        <IconButton onClick={() => handleDrawerOpen('timer')} sx={iconButtonStyle}>
          <Iconify icon="solar:moon-fog-broken" width={28} />
        </IconButton>
      </Stack>

      <Drawer
        anchor="bottom"
        open={drawerOpen}
        onClose={handleDrawerClose}
        PaperProps={{
          sx: {
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            backgroundColor: '#fff',
          },
        }}
      >
        {renderDrawerContent()}
      </Drawer>
    </>
  );
}

ArticleListeningToolbar.propTypes = {
  loading: PropTypes.bool,
  playbackRate: PropTypes.number,
  onPlaybackRateChange: PropTypes.func,
};
