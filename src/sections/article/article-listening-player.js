import PropTypes from 'prop-types';
import { forwardRef } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
// components
import Iconify from 'src/components/iconify';
import AudioPlayer from 'react-audio-player';

// ----------------------------------------------------------------------

export const ArticleListeningPlayer = forwardRef(({ 
  loading, 
  playing, 
  onPlay, 
  onPause, 
  onPreviousSentence,
  onNextSentence,
  onRewind10,
  onForward10,
  audioUrl,
  onTimeUpdate,
  onLoadedMetadata,
  ...other 
}, ref) => {
  if (loading) {
    return (
      <Stack direction="row" alignItems="center" spacing={2} {...other}>
        <Skeleton variant="circular" width={56} height={56} />
        <Skeleton variant="circular" width={56} height={56} />
        <Skeleton variant="circular" width={72} height={72} />
        <Skeleton variant="circular" width={56} height={56} />
        <Skeleton variant="circular" width={56} height={56} />
      </Stack>
    );
  }

  const iconButtonStyle = {
    width: 56,
    height: 56,
    '& .MuiSvgIcon-root': {
      width: 32,
      height: 32,
    }
  };

  const centerButtonStyle = {
    width: 72,
    height: 72,
    '& .MuiSvgIcon-root': {
      width: 48,
      height: 48,
    }
  };

  return (
    <Stack direction="row" alignItems="center" justifyContent="center" spacing={2} {...other}>
      <IconButton onClick={onPreviousSentence} sx={iconButtonStyle}>
        <Iconify icon="solar:double-alt-arrow-left-bold" width={32} />
      </IconButton>

      <IconButton onClick={onRewind10} sx={iconButtonStyle}>
        <Iconify icon="solar:rewind-10-seconds-back-broken" width={32} />
      </IconButton>

      <IconButton 
        onClick={playing ? onPause : onPlay} 
        sx={centerButtonStyle}
      >
        {playing ? (
          <Iconify icon="solar:pause-circle-broken" width={48} />
        ) : (
          <Iconify icon="solar:play-circle-broken" width={48} />
        )}
      </IconButton>

      <IconButton onClick={onForward10} sx={iconButtonStyle}>
        <Iconify icon="solar:rewind-10-seconds-forward-broken" width={32} />
      </IconButton>

      <IconButton onClick={onNextSentence} sx={iconButtonStyle}>
        <Iconify icon="solar:double-alt-arrow-right-bold" width={32} />
      </IconButton>

      <AudioPlayer
        ref={ref}
        src={audioUrl}
        autoPlay={false}
        controls={false}
        onPlay={onPlay}
        onPause={onPause}
        onListen={(value) => {
          if(playing){
            onTimeUpdate(value);
          }
        }}
        onCanPlay={(e) => {
          if (onLoadedMetadata) {
            onLoadedMetadata(e.target.duration);
          }
        }}
        listenInterval={1000}
        style={{ display: 'none' }}
      />
    </Stack>
  );
});

ArticleListeningPlayer.propTypes = {
  loading: PropTypes.bool,
  playing: PropTypes.bool,
  onPlay: PropTypes.func,
  onPause: PropTypes.func,
  onPreviousSentence: PropTypes.func,
  onNextSentence: PropTypes.func,
  onRewind10: PropTypes.func,
  onForward10: PropTypes.func,
  audioUrl: PropTypes.string,
  onTimeUpdate: PropTypes.func,
  onLoadedMetadata: PropTypes.func,
};
