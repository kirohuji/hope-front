import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useCallback, useState, useMemo, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, Controller } from 'react-hook-form';
// @mui
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
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
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
// hooks
import { useResponsive } from 'src/hooks/use-responsive';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDebounce } from 'src/hooks/use-debounce';
// routes
import { paths } from 'src/routes/paths';
// components
import { useSnackbar } from 'src/components/snackbar';
import { useRouter } from 'src/routes/hook';
import FormProvider, {
  RHFRadioGroup,
  RHFEditor,
  RHFUpload,
  RHFTextField,
  RHFAutocomplete,
  RHFSwitch,
} from 'src/components/hook-form';

// utils
import { fData } from 'src/utils/format-number';

import { broadcastService, userService, fileService } from 'src/composables/context-provider';
import { useSelector } from 'src/redux/store';
import moment from 'moment';

// ----------------------------------------------------------------------

export const BROADCAST_SERVICE_OPTIONS = [
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

export const BROAECAST_TYPE_OPTIONS = [
  { value: 'activity', label: '活动通知' },
  { value: 'notification', label: '消息公告' },
  { value: 'familyGathering', label: '社交聚会' },
  // { value: 'book', label: '阅读' },
];
export default function BroadcastNewEditForm({ currentBroadcast }) {
  const loading = useBoolean(false);

  const router = useRouter();

  const isEdit = !!currentBroadcast;

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

  const NewBroadcastSchema = Yup.object().shape({
    label: Yup.string().required('请输入标题'),
    content: Yup.string().required('请输入内容'),
    images: Yup.array().required('请选择资源'),
    type: Yup.string().required('请选择类型'),
    leaders: Yup.array().min(1, '至少选择一位负责人'),
    durations: Yup.string().required('请选择时间程度'),
    destination: Yup.string().required('目的地是必填的'),
    published: Yup.boolean(),
    available: Yup.object().shape({
      startDate: Yup.mixed().nullable(),
      endDate: Yup.mixed().nullable(),
    }),
  });

  const defaultValues = useMemo(
    () => ({
      label: currentBroadcast?.label || '',
      content: currentBroadcast?.content || '',
      images: currentBroadcast?.images || [],
      type: currentBroadcast?.type || '',
      leaders: currentBroadcast?.leaders || [],
      durations: currentBroadcast?.durations || '',
      destination: currentBroadcast?.destination || '',
      published: currentBroadcast?.published || false,
      available: {
        startDate: currentBroadcast?.available.startDate || null,
        endDate: currentBroadcast?.available.endDate || null,
      },
    }),
    [currentBroadcast]
  );

  const methods = useForm({
    resolver: yupResolver(NewBroadcastSchema),
    defaultValues,
  });

  const {
    watch,
    reset,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  useEffect(() => {
    if (currentBroadcast) {
      reset(defaultValues);
    }
  }, [currentBroadcast, defaultValues, reset]);

  const onSubmit = handleSubmit(async (data) => {
    if (values.images.filter((file) => file.isLoacl).length > 0) {
      enqueueSnackbar('资源集有资源未上传,请先上传');
      return;
    }
    try {
      if (!isEdit) {
        await broadcastService.post({
          ...data,
          scope: scope.active._id,
          leaders: data.leaders && data.leaders.length > 0 ? data.leaders.map((l) => l._id) : [],
          modifiedDate: moment(new Date()).format('YYYY/MM/DD'),
        });
      } else {
        await broadcastService.patch({
          _id: currentBroadcast._id,
          ...data,
          leaders: data.leaders && data.leaders.length > 0 ? data.leaders.map((l) => l._id) : [],
          modifiedDate: moment(new Date()).format('YYYY/MM/DD'),
        });
      }
      reset();
      enqueueSnackbar(currentBroadcast ? '更新成功!' : '创建成功!');
      router.push(paths.dashboard.broadcast.root);
      console.info('DATA', data);
    } catch (error) {
      console.error(error);
    }
  });

  const handleDrop = useCallback(
    (acceptedFiles) => {
      const files = values.images || [];
      const newFiles = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
          isLoacl: true,
        })
      );

      setValue('images', [...files, ...newFiles], { shouldValidate: true });
    },
    [setValue, values.images]
  );

  const handleRemoveFile = useCallback(
    (inputFile) => {
      console.log('inputFile', inputFile);
      console.log('values.images', values.images);
      const filtered =
        values.images &&
        values.images?.filter((file) => {
          if (file.preview) {
            return file.preview !== inputFile.preview;
          }
          return file !== inputFile;
        });
      setValue('images', filtered);
    },
    [setValue, values.images]
  );

  const handleRemoveAllFiles = useCallback(() => {
    setValue('images', []);
  }, [setValue]);

  const onUpload = () => {
    loading.onTrue();
    try {
      values.images.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const { link } = await fileService.upload(formData);
        Object.assign(file, {
          preview: link,
          isLoacl: false,
        });
      });
      enqueueSnackbar('资源上传成功');
      loading.onFalse();
    } catch (e) {
      enqueueSnackbar('资源上传失败');
      loading.onFalse();
    }
  };

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
              <RHFTextField name="label" placeholder="例如: 劳动节活动 ..." />
            </Stack>

            <Stack spacing={1.5}>
              <Typography variant="subtitle2">内容</Typography>
              <RHFEditor simple name="content" />
            </Stack>

            <Stack spacing={1.5}>
              <Typography variant="subtitle2">资源</Typography>
              {loading.value && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    zIndex: 10,
                    backgroundColor: '#ffffffc4',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <CircularProgress />
                </Box>
              )}
              <RHFUpload
                multiple
                thumbnail
                name="images"
                // maxSize={31457280}
                onDrop={handleDrop}
                onDropRejected={() => {
                  loading.onFalse();
                }}
                onRemove={handleRemoveFile}
                onRemoveAll={handleRemoveAllFiles}
                onUpload={(files) => onUpload(files)}
                helperText={
                  <Typography
                    variant="caption"
                    sx={{
                      mt: 3,
                      mx: 'auto',
                      display: 'block',
                      textAlign: 'center',
                      color: 'text.disabled',
                    }}
                  >
                    允许 *.jpeg, *.jpg, *.png, *.gif
                    <br /> max size of {fData(3145728)}
                  </Typography>
                }
              />
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
              <RHFRadioGroup row spacing={4} name="type" options={BROAECAST_TYPE_OPTIONS} />
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

            <Stack spacing={1.5}>
              <Typography variant="subtitle2">有效期</Typography>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <Controller
                  name="available.startDate"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DatePicker
                      {...field}
                      format="dd/MM/yyyy"
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
                <Controller
                  name="available.endDate"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DatePicker
                      {...field}
                      format="dd/MM/yyyy"
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
              </Stack>
            </Stack>

            <Stack spacing={1.5}>
              <Typography variant="subtitle2">时间长度</Typography>
              <RHFTextField name="durations" placeholder="比如: 2 天, 4 天 3 夜..." />
            </Stack>

            <Stack spacing={1.5}>
              <Typography variant="subtitle2">目的地</Typography>
              <RHFTextField name="destination" placeholder="比如: 详细地址..." />
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
          onClick={() => router.push(paths.dashboard.broadcast.root)}
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
          {!currentBroadcast ? '创建' : '保存变更'}
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

BroadcastNewEditForm.propTypes = {
  currentBroadcast: PropTypes.object,
};
