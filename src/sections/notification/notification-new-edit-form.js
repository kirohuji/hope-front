import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useCallback, useState, useMemo, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
// @mui
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import LoadingButton from '@mui/lab/LoadingButton';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
// hooks
import { useResponsive } from 'src/hooks/use-responsive';
import { useDebounce } from 'src/hooks/use-debounce';
// routes
import { paths } from 'src/routes/paths';
// components
import { useSnackbar } from 'src/components/snackbar';
import { useRouter } from 'src/routes/hook';
import FormProvider, {
  RHFRadioGroup,
  RHFEditor,
  RHFTextField,
  RHFAutocomplete,
  RHFSwitch,
} from 'src/components/hook-form';

import { notificationService, userService } from 'src/composables/context-provider';
import { useSelector } from 'src/redux/store';
import moment from 'moment';

// ----------------------------------------------------------------------

export const type = [
  { value: 'system', label: '系统通知' },
  { value: 'message', label: '消息通知' },
  { value: 'broadcast', label: '活动通知' },
  { value: 'book', label: '阅读通知' },
];

export const categories = [
  { value: 'announcement', label: '运营公告' },
  { value: 'system', label: '系统应用' },
  { value: 'feedback', label: '问题反馈' },
];

export const NOTIFICATION_SERVICE_OPTIONS = [
  { value: 'Audio guide', label: 'Audio guide' },
  { value: 'Food and drinks', label: 'Food and drinks' },
  { value: 'Lunch', label: 'Lunch' },
  { value: 'Private tour', label: 'Private tour' },
  { value: 'Special activities', label: 'Special activities' },
  { value: 'Entrance fees', label: 'Entrance fees' },
  { value: 'Gratuities', label: 'Gratuities' },
  { value: 'Pick-up and drop off', label: 'Pick-up and drop off' },
  { value: 'Professional guide', label: 'Professional guide' },
  { value: 'Transport by air-conditioned', label: 'Transport by air-conditioned' },
];

export const NOTIFICATION_TYPE_OPTIONS = [
  { value: 'announcement', label: '运营公告' },
  { value: 'system', label: '系统应用' },
];

export const NOTIFICATION_DIRECTION_OPTIONS = [
  { value: 'everyone', label: '所有人' },
  { value: 'specific', label: '指定用户' },
];

export const NOTIFICATION_PUBLISH_OPTIONS = [
  { value: 'immediate', label: '立即发送' },
  { value: 'scheduled', label: '定时发送' },
];

export default function NotificationNewEditForm({ currentNotification }) {
  const router = useRouter();

  const isEdit = !!currentNotification;

  const mdUp = useResponsive('up', 'md');

  const [users, setUsers] = useState([]);

  const scope = useSelector((state) => state.scope);

  const [searchLeaders, setSearchLeaders] = useState('');

  const debouncedFilters = useDebounce(searchLeaders);

  const handleSearchLeaders = useCallback(async () => {
    if (debouncedFilters) {
      const response = await userService.paginationByProfile(
        {
          username: debouncedFilters,
          scope: scope.active._id,
        },
        {
          fields: {
            photoURL: 1,
            username: 1,
          },
        }
      );
      setUsers(response.data);
    }
  }, [debouncedFilters, scope.active]);

  useEffect(() => {
    handleSearchLeaders();
  }, [debouncedFilters, handleSearchLeaders]);

  const { enqueueSnackbar } = useSnackbar();

  const NewNotificationSchema = Yup.object().shape({
    title: Yup.string().required('请输入标题'),
    description: Yup.string().required('请输入内容'),
  });

  const defaultValues = useMemo(
    () => ({
      title: currentNotification?.title || '',
      description: currentNotification?.description || '',
      sendingTiming: currentNotification?.sendingTiming || '',
    }),
    [currentNotification]
  );

  const methods = useForm({
    resolver: yupResolver(NewNotificationSchema),
    defaultValues,
  });

  const {
    watch,
    reset,
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  useEffect(() => {
    if (currentNotification) {
      reset(defaultValues);
    }
  }, [currentNotification, defaultValues, reset]);

  const onSubmit = handleSubmit(async (data) => {
    // if (values.images.filter((file) => file.isLoacl).length > 0) {
    //   enqueueSnackbar('资源集有资源未上传,请先上传');
    //   return;
    // }
    try {
      if (!isEdit) {
        await notificationService.post({
          ...data,
          scope: scope.active._id,
          leaders: data.leaders && data.leaders.length > 0 ? data.leaders.map((l) => l._id) : [],
          modifiedDate: moment(new Date()).format('YYYY/MM/DD'),
        });
      } else {
        await notificationService.patch({
          _id: currentNotification._id,
          ...data,
          leaders: data.leaders && data.leaders.length > 0 ? data.leaders.map((l) => l._id) : [],
          modifiedDate: moment(new Date()).format('YYYY/MM/DD'),
        });
      }
      reset();
      enqueueSnackbar(currentNotification ? '更新成功!' : '创建成功!');
      router.push(paths.dashboard.notification.root);
      console.info('DATA', data);
    } catch (error) {
      console.error(error);
    }
  });

  const renderDetails = (
    <>
      {mdUp && (
        <Grid md={4}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            基本描述
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            标题, 基本描述, 背景...
          </Typography>
        </Grid>
      )}

      <Grid xs={12} md={8}>
        <Card>
          {!mdUp && <CardHeader title="Details" />}

          <Stack spacing={3} sx={{ p: 3 }}>
            <Stack spacing={1.5}>
              <Typography variant="subtitle2">标题</Typography>
              <RHFTextField name="title" placeholder="例如: 消息通知 ..." />
            </Stack>

            <Stack spacing={1.5}>
              <Typography variant="subtitle2">内容</Typography>
              <RHFEditor simple name="description" />
            </Stack>
          </Stack>
        </Card>
      </Grid>
    </>
  );

  const renderProperties = (
    <>
      {mdUp && (
        <Grid md={4}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            属性
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            额外的功能和属性
          </Typography>
        </Grid>
      )}

      <Grid xs={12} md={8}>
        <Card>
          {!mdUp && <CardHeader title="Properties" />}

          <Stack spacing={3} sx={{ p: 3 }}>
            <Stack spacing={1}>
              <Typography variant="subtitle2">类型</Typography>
              <RHFRadioGroup row spacing={4} name="type" options={NOTIFICATION_TYPE_OPTIONS} />
            </Stack>

            <Stack>
              <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
                负责人
              </Typography>

              <RHFAutocomplete
                multiple
                name="leaders"
                placeholder="+ 负责人"
                disableCloseOnSelect
                options={users}
                onInputChange={(event, newValue) => {
                  setSearchLeaders(newValue);
                }}
                getOptionLabel={(option) => option.username}
                isOptionEqualToValue={(option, value) => option._id === value._id}
                renderOption={(props, currentUser) => (
                  <li {...props} key={currentUser._id}>
                    <Avatar
                      key={currentUser._id}
                      alt={currentUser?.photoURL}
                      src={currentUser?.photoURL}
                      sx={{ width: 24, height: 24, flexShrink: 0, mr: 1 }}
                    />

                    {currentUser.username}
                  </li>
                )}
                renderTags={(selected, getTagProps) =>
                  selected.map((currentUser, index) => (
                    <Chip
                      {...getTagProps({ index })}
                      key={currentUser._id}
                      size="small"
                      variant="soft"
                      label={currentUser.username}
                      avatar={<Avatar alt={currentUser.username} src={currentUser?.photoURL} />}
                    />
                  ))
                }
              />
            </Stack>

            {/* <Stack spacing={1}>
              <Typography variant="subtitle2">目标人群</Typography>
              <RHFRadioGroup
                row
                spacing={4}
                name="targetType"
                options={NOTIFICATION_DIRECTION_OPTIONS}
              />
            </Stack> */}
            <Stack spacing={1}>
              <Typography variant="subtitle2">发送时机</Typography>
              <Controller
                  name="sendingTiming"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DateTimePicker
                      {...field}
                      // format="dd/MM/yyyy"
                      renderInput={(params) => <TextField {...params} />}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!error,
                          helperText: error?.message,
                        },
                      }}
                    />
                  )}
                />
              {/* <RHFRadioGroup
                row
                spacing={4}
                name="sendingTiming"
                options={NOTIFICATION_PUBLISH_OPTIONS}
              /> */}
            </Stack>
          </Stack>
        </Card>
      </Grid>
    </>
  );

  const renderActions = (
    <>
      {mdUp && <Grid md={4} />}
      <Grid xs={12} md={8} sx={{ display: 'flex', justifyContent: 'right' }}>
        {false && (
          <FormControlLabel
            control={<RHFSwitch name="published" label="是否发布" />}
            sx={{ flexGrow: 1, pl: 3 }}
          />
        )}

        <Button
          color="error"
          variant="contained"
          onClick={() => router.push(paths.dashboard.notification.root)}
          sx={{ mr: 1 }}
        >
          返回
        </Button>
        <LoadingButton
          type="submit"
          variant="contained"
          size="large"
          loading={isSubmitting}
          sx={{ ml: 2 }}
        >
          {!currentNotification ? '创建' : '保存变更'}
        </LoadingButton>
      </Grid>
    </>
  );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        {renderDetails}

        {renderProperties}

        {renderActions}
      </Grid>
    </FormProvider>
  );
}

NotificationNewEditForm.propTypes = {
  currentNotification: PropTypes.object,
};
