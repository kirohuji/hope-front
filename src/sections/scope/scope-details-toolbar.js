import PropTypes from 'prop-types';
// @mui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
// routes
import { RouterLink } from 'src/routes/components';
// components
import Iconify from 'src/components/iconify';
// ----------------------------------------------------------------------

export default function ScopeDetailsToolbar({ backLink, editLink, sx, ...other }) {
  return (
    <Stack
      spacing={1.5}
      direction="row"
      sx={{
        mb: { xs: 3, md: 5 },
        ...sx,
      }}
      {...other}
    >
      <Button
        component={RouterLink}
        href={backLink}
        startIcon={<Iconify icon="eva:arrow-ios-back-fill" width={16} />}
      >
        返回
      </Button>

      <Box sx={{ flexGrow: 1 }} />

      <Tooltip title="编辑">
        <IconButton component={RouterLink} href={editLink}>
          <Iconify icon="solar:pen-bold" />
        </IconButton>
      </Tooltip>
    </Stack>
  );
}

ScopeDetailsToolbar.propTypes = {
  backLink: PropTypes.string,
  editLink: PropTypes.string,
  sx: PropTypes.object,
};
