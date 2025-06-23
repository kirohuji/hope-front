import PropTypes from 'prop-types';
import { m } from 'framer-motion';
// @mui
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Badge, { badgeClasses } from '@mui/material/Badge';
// components
import Iconify from 'src/components/iconify';
import { varHover } from 'src/components/animate';

// ----------------------------------------------------------------------

export default function CalenderButton({ sx, onClick }) {
  return (
    <Badge
      color="error"
      variant="dot"
      invisible
      sx={{
        [`& .${badgeClasses.badge}`]: {
          top: 8,
          right: 8,
        },
        ...sx,
      }}
    >
      <Box
        component={m.div}
        // animate={{
        //   rotate: 360,
        // }}
        // transition={{
        //   duration: 12,
        //   ease: 'linear',
        //   repeat: Infinity,
        // }}
      >
        <IconButton
          component={m.button}
          whileTap="tap"
          whileHover="hover"
          variants={varHover(1.05)}
          aria-label="calendar"
          onClick={onClick}
          sx={{
            width: 40,
            height: 40,
          }}
        >
          <Iconify icon="solar:calendar-line-duotone" width={24} />
        </IconButton>
      </Box>
    </Badge>
  );
}

CalenderButton.propTypes = {
  sx: PropTypes.object,
  onClick: PropTypes.func,
};
