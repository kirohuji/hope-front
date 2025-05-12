import PropTypes from 'prop-types';
// @mui
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

export function ArticleListeningProcess({ loading, currentTime, duration, ...other }) {
  if (loading) {
    return (
      <Stack direction="row" justifyContent="space-between" {...other}>
        <Skeleton width={80} height={28} />
        <Skeleton width={80} height={28} />
      </Stack>
    );
  }

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Stack direction="row" justifyContent="space-between" {...other}>
      <Typography variant="h7" sx={{ fontWeight: 'normal' }}>
        {formatTime(currentTime)}
      </Typography>
      <Typography variant="h7" sx={{ fontWeight: 'normal' }}>
        {formatTime(duration)}
      </Typography>
    </Stack>
  );
}

ArticleListeningProcess.propTypes = {
  loading: PropTypes.bool,
  currentTime: PropTypes.number,
  duration: PropTypes.number,
};
