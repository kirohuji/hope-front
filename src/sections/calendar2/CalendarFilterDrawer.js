import PropTypes from 'prop-types';
import orderBy from 'lodash/orderBy';
// @mui
import { DatePicker } from '@mui/x-date-pickers';
import {
  Box,
  Stack,
  Drawer,
  Divider,
  Tooltip,
  TextField,
  Typography,
  IconButton,
  ListItemText,
  ListItemButton,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
// utils
import { fDateTime } from 'src/utils/format-time';
// components
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { ColorMultiPicker } from 'src/components/color-utils';

// ----------------------------------------------------------------------

CalendarFilterDrawer.propTypes = {
  events: PropTypes.array,
  picker: PropTypes.object,
  openFilter: PropTypes.bool,
  onCloseFilter: PropTypes.func,
  onResetFilter: PropTypes.func,
  onSelectEvent: PropTypes.func,
  onFilterEventColor: PropTypes.func,
  colorOptions: PropTypes.arrayOf(PropTypes.string),
  filterEventColor: PropTypes.arrayOf(PropTypes.string),
};

export default function CalendarFilterDrawer({
  events,
  picker,
  openFilter,
  colorOptions,
  onCloseFilter,
  onResetFilter,
  onSelectEvent,
  filterEventColor,
  onFilterEventColor,
}) {
  const notDefault = (picker.startDate && picker.endDate) || !!filterEventColor.length;

  return (
    <Drawer
      anchor="right"
      open={openFilter}
      onClose={onCloseFilter}
      BackdropProps={{
        invisible: true,
      }}
      PaperProps={{
        sx: { width: 320 },
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ pl: 2, pr: 1, py: 2 }}
      >
        <Typography variant="subtitle1">过滤</Typography>

        <Tooltip title="Reset">
          <Box sx={{ position: 'relative' }}>
            <IconButton onClick={onResetFilter}>
              <Iconify icon="ic:round-refresh" />
            </IconButton>

            {notDefault && (
              <Box
                sx={{
                  top: 6,
                  right: 4,
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  position: 'absolute',
                  bgcolor: 'error.main',
                }}
              />
            )}
          </Box>
        </Tooltip>
      </Stack>

      <Divider />

      <Typography
        variant="caption"
        sx={{
          color: 'text.secondary',
          fontWeight: 'fontWeightMedium',
          p: (theme) => theme.spacing(2, 2, 1, 2),
        }}
      >
        颜色
      </Typography>

      <ColorMultiPicker
        colors={colorOptions}
        selected={filterEventColor}
        onChangeColor={onFilterEventColor}
        sx={{ mx: 2 }}
      />

      <Typography
        variant="caption"
        sx={{
          p: 2,
          color: 'text.secondary',
          fontWeight: 'fontWeightMedium',
        }}
      >
        间隔
      </Typography>

      <Stack spacing={2} sx={{ px: 2 }}>
        <DatePicker
          label="开始时间"
          value={picker.startDate}
          onChange={picker.onChangeStartDate}
          renderInput={(params) => <TextField size="small" {...params} />}
        />

        <DatePicker
          label="结束时间"
          value={picker.endDate}
          onChange={picker.onChangeEndDate}
          renderInput={(params) => (
            <TextField
              size="small"
              {...params}
              error={picker.isError}
              helperText={picker.isError && '结束时间必须大于开始时间'}
            />
          )}
        />
      </Stack>

      <Typography
        variant="caption"
        sx={{
          p: 2,
          color: 'text.secondary',
          fontWeight: 'fontWeightMedium',
        }}
      >
        事件 ({events.length})
      </Typography>

      <Scrollbar sx={{ height: 1 }}>
        {orderBy(events, ['end'], ['desc']).map((event) => (
          <ListItemButton
            key={event._id}
            onClick={() => onSelectEvent(event.id)}
            sx={{ py: 1.5, borderBottom: (theme) => `dashed 1px ${theme.palette.divider}` }}
          >
            <Box
              sx={{
                top: 16,
                left: 0,
                width: 0,
                height: 0,
                position: 'absolute',
                borderRight: '10px solid transparent',
                borderTop: `10px solid ${event.color}`,
              }}
            />

            <ListItemText
              disableTypography
              primary={
                <Typography variant="subtitle2" sx={{ fontSize: 13, mt: 0.5 }}>
                  {event.label}
                </Typography>
              }
              secondary={
                <Typography
                  variant="caption"
                  component="div"
                  sx={{ fontSize: 11, color: 'text.disabled' }}
                >
                  {event.allDay ? (
                    fDateTime(event.start)
                  ) : (
                    <>
                      {`${fDateTime(event.start)} - ${fDateTime(event.end)}`}
                    </>
                  )}
                </Typography>
              }
              sx={{ display: 'flex', flexDirection: 'column-reverse' }}
            />
          </ListItemButton>
        ))}
      </Scrollbar>
    </Drawer>
  );
}
