import PropTypes from 'prop-types';
// @mui
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
// utils
import { fShortenNumber } from 'src/utils/format-number';
// components
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function MembershipAnalytic({ title, level, total, icon, color, percent, content }) {
  return (
    <Stack
      spacing={2.5}
      direction="row"
      alignItems="center"
      justifyContent="center"
      sx={{ width: 1, minWidth: 200 }}
    >
      <Stack alignItems="center" justifyContent="center" sx={{ position: 'relative' }}>
        <Iconify icon={icon} width={32} sx={{ color, position: 'absolute' }} />

        <CircularProgress
          variant="determinate"
          value={percent}
          size={56}
          thickness={2}
          sx={{ color, opacity: 0.48 }}
        />

        <CircularProgress
          variant="determinate"
          value={100}
          size={56}
          thickness={3}
          sx={{
            top: 0,
            left: 0,
            opacity: 0.48,
            position: 'absolute',
            color: (theme) => alpha(theme.palette.grey[500], 0.16),
          }}
        />
      </Stack>

      <Stack spacing={0.5}>
        <Typography variant="subtitle1">{title}</Typography>
        {/* <Typography variant="subtitle2">{fCurrency(price)}</Typography> */}
        {/* <Typography variant="subtitle2">
          <Button>查看</Button>
        </Typography> */}
        {/* <Typography variant="subtitle2" sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="subtitle2" sx={{ color: 'text.disabled' }}>
            {1000000} 条
          </Typography>
        </Typography> */}
        <Box
          component="span"
          sx={{
            color: 'text.disabled',
            typography: 'body2',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          共{fShortenNumber(total)} 条
        </Box>
      </Stack>
    </Stack>
  );
}

MembershipAnalytic.propTypes = {
  color: PropTypes.string,
  icon: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
  percent: PropTypes.number,
  title: PropTypes.string,
  level: PropTypes.number,
  content: PropTypes.string,
  total: PropTypes.number,
};
