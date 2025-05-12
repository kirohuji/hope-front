import PropTypes from 'prop-types';
import { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import WaveSurfer from '@wavesurfer/react';

export function ArticleListeningWave({ loading, audioUrl, currentTime, onSeek, playbackRate = 1, ...other }) {
  const [wavesurfer, setWavesurfer] = useState(null);
  const isSeeking = useRef(false);

  const handleReady = (ws) => {
    setWavesurfer(ws);
  };

  // 手动同步当前播放时间
  useEffect(() => {
    if (wavesurfer && currentTime !== undefined && !isSeeking.current) {
      const duration = wavesurfer.getDuration();
      if (duration) {
        const progress = currentTime / duration;
        wavesurfer.seekTo(progress);
      }
    }
  }, [currentTime, wavesurfer]);

  // 同步播放速度
  useEffect(() => {
    if (wavesurfer) {
      wavesurfer.setPlaybackRate(playbackRate);
      console.log('playbackRate', playbackRate);
    }
  }, [playbackRate, wavesurfer]);

  // 用户点击波形跳转
  const handleSeek = (progress) => {
    if (wavesurfer && onSeek) {
      isSeeking.current = true;
      const duration = wavesurfer.getDuration();
      onSeek(progress * duration);
      setTimeout(() => {
        isSeeking.current = false;
      }, 100);
    }
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', height: 50 }} {...other}>
        <Skeleton variant="rectangular" width="100%" height="100%" />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: '100%',
        height: 50,
        borderRadius: 1,
        cursor: 'pointer',
        p: 1,
        '&:hover': { opacity: 0.8 },
      }}
      {...other}
    >
      {audioUrl && (
        <WaveSurfer
          height={40}
          waveColor="rgba(201, 223, 242, 1)"
          cursorColor="transparent"
          progressColor="#000000"
          url={audioUrl}
          barWidth={3}
          barGap={3}
          barHeight={1}
          barRadius={8}
          responsive
          normalize
          fillParent
          autoCenter
          interact
          onSeek={handleSeek}
          onReady={handleReady}
        />
      )}
    </Box>
  );
}

ArticleListeningWave.propTypes = {
  loading: PropTypes.bool,
  audioUrl: PropTypes.string,
  currentTime: PropTypes.number,
  onSeek: PropTypes.func,
  playbackRate: PropTypes.number,
};
