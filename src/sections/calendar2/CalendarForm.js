import PropTypes from 'prop-types';
import * as Yup from 'yup';
import merge from 'lodash/merge';
import { isBefore } from 'date-fns';
// form
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { Box, Stack, Button, Tooltip, TextField, IconButton, DialogActions } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { MobileDateTimePicker } from '@mui/x-date-pickers';

// hooks
import { useResponsive } from 'src/hooks/use-responsive';

// components
import Iconify from 'src/components/iconify';
import { ColorSinglePicker } from 'src/components/color-utils';
import FormProvider, { RHFTextField, RHFSwitch } from 'src/components/hook-form';

// ----------------------------------------------------------------------

const getInitialValues = (event, range) => {
  const initialEvent = {
    label: '',
    description: '',
    color: '#1890FF',
    allDay: false,
    start: range ? new Date(range.start).toISOString() : new Date().toISOString(),
    end: range ? new Date(range.end).toISOString() : new Date().toISOString(),
  };

  if (event || range) {
    return merge({}, initialEvent, event);
  }

  return initialEvent;
};

// ----------------------------------------------------------------------

CalendarForm.propTypes = {
  event: PropTypes.object,
  range: PropTypes.object,
  onCancel: PropTypes.func,
  onDeleteEvent: PropTypes.func,
  onCreateUpdateEvent: PropTypes.func,
  colorOptions: PropTypes.arrayOf(PropTypes.string),
};

export default function CalendarForm ({
  event,
  range,
  colorOptions,
  onCreateUpdateEvent,
  onDeleteEvent,
  onCancel,
}) {
  const hasEventData = !!event;
  const isDesktop = useResponsive('up', 'sm');
  const EventSchema = Yup.object().shape({
    label: Yup.string().max(255).required('请输入 标题'),
    description: Yup.string().max(5000),
  });

  const methods = useForm({
    resolver: yupResolver(EventSchema),
    defaultValues: getInitialValues(event, range),
  });

  const {
    reset,
    watch,
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const onSubmit = async (data) => {
    try {
      const newEvent = {
        label: data.label,
        description: data.description,
        color: data.color,
        allDay: data.allDay,
        start: data.start,
        end: data.end,
      };
      onCreateUpdateEvent(newEvent);
      // onCancel();
      reset();
    } catch (error) {
      console.error(error);
    }
  };

  const isDateError =
    !values.allDay && values.start && values.end
      ? isBefore(new Date(values.end), new Date(values.start))
      : false;

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3} sx={{ p: 3 }}>
        <RHFTextField name="label" label="标题" InputProps={{
          readOnly: !isDesktop || event.isBroadcast,
        }} />

        <RHFTextField name="description" label="描述" multiline rows={3} InputProps={{
          readOnly: !isDesktop || event.isBroadcast,
        }} />

        <RHFSwitch name="allDay" label="全天" disabled={!isDesktop || event.isBroadcast} />

        <Controller
          name="start"
          control={control}
          render={({ field }) => (
            <MobileDateTimePicker
              {...field}
              onChange={(newValue) => field.onChange(newValue)}
              label="开始 时间"
              disabled={!isDesktop || event.isBroadcast}
              inputFormat="yyyy/MM/dd hh:mm a"
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          )}
        />

        <Controller
          name="end"
          control={control}
          render={({ field }) => (
            <MobileDateTimePicker
              {...field}
              onChange={(newValue) => field.onChange(newValue)}
              label="结束 时间"
              disabled={!isDesktop || event.isBroadcast}
              inputFormat="yyyy/MM/dd hh:mm a"
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  error={!!isDateError}
                  helperText={isDateError && '结束时间必须大于开始时间'}
                />
              )}
            />
          )}
        />

        {
          isDesktop && <Controller
            name="color"
            control={control}
            render={({ field }) => (
              <ColorSinglePicker
                disabled={event.isBroadcast}
                value={field.value}
                onChange={field.onChange}
                colors={colorOptions}
              />
            )}
          />
        }
      </Stack>

      {
        isDesktop && <DialogActions>
          {hasEventData && !event.isBroadcast && (
            <Tooltip label="删除 事件">
              <IconButton onClick={onDeleteEvent}>
                <Iconify icon="eva:trash-2-outline" />
              </IconButton>
            </Tooltip>
          )}

          <Box sx={{ flexGrow: 1 }} />

          <Button variant="outlined" color="inherit" onClick={onCancel}>
            返回
          </Button>

          {
            !event.isBroadcast && <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
              {hasEventData ? '更新' : '添加'}
            </LoadingButton>
          }
        </DialogActions>
      }
    </FormProvider>
  );
}
