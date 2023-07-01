import PropTypes from 'prop-types';
// @mui
import {
  Box,
  Stack,
  Tooltip,
  Checkbox,
  Typography,
  IconButton,
  InputAdornment,
  Button,
  TextField,
} from '@mui/material';
// hooks
import { useResponsive } from 'src/hooks/use-responsive';
// components
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------
Header.propTypes = {
  onOpenNav: PropTypes.func,
  mailsLength: PropTypes.number,
  onToggleDense: PropTypes.func,
  onSelectAllMails: PropTypes.func,
  onDeselectAllMails: PropTypes.func,
  onCreate: PropTypes.func,
  selectedMailsLength: PropTypes.number,
  current: PropTypes.object,
  onPublic:  PropTypes.func,
};

export default function Header ({
  onOpenNav,
  mailsLength,
  selectedMailsLength,
  onSelectAllMails,
  onDeselectAllMails,
  onToggleDense,
  current,
  onPublic,
  onCreate,
  ...other
}) {
  const smUp = useResponsive('up', 'sm');

  const mdUp = useResponsive('up', 'md');

  const selectedAllMails = mailsLength > 0 && selectedMailsLength === mailsLength;

  const selectedSomeMails = selectedMailsLength > 0 && selectedMailsLength < mailsLength;

  return (
    <Stack
      spacing={2}
      direction="row"
      alignItems="center"
      flexShrink={0}
      sx={{
        px: 2,
        height: 80,
        borderBottom: (theme) => `solid 1px ${theme.palette.divider}`,
      }}
      {...other}
    >
      <Stack direction="row" alignItems="center" flexGrow={1}>
        {!mdUp && (
          <IconButton onClick={onOpenNav}>
            <Iconify icon="eva:menu-fill" />
          </IconButton>
        )}
        <Typography>{current.label}</Typography>
        {smUp && false && (
          <>
            <Checkbox
              checked={selectedAllMails}
              indeterminate={selectedSomeMails}
              onChange={(event) =>
                event.target.checked ? onSelectAllMails() : onDeselectAllMails()
              }
            />
            <Tooltip title="Refresh">
              <IconButton>
                <Iconify icon="eva:refresh-fill" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Dense">
              <IconButton onClick={onToggleDense}>
                <Iconify icon="eva:collapse-fill" />
              </IconButton>
            </Tooltip>

            <Tooltip title="More">
              <IconButton>
                <Iconify icon="eva:more-vertical-fill" />
              </IconButton>
            </Tooltip>
          </>
        )}
      </Stack>

      {
        false && <TextField
          size="small"
          placeholder="Search"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 180 }}
        />
      }

      <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        <Tooltip title=" 发布">
          <Button color="inherit" variant="contained" onClick={onPublic}>
            发布
          </Button>
        </Tooltip>
      </Box>
    </Stack>
  );
}
