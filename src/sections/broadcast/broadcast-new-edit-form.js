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
import Switch from '@mui/material/Switch';
import Grid from '@mui/material/Unstable_Grid2';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
// hooks
import { useResponsive } from 'src/hooks/use-responsive';
// routes
import { paths } from 'src/routes/paths';
// assets
import { countries } from 'src/assets/data';
// _mock
import { _tourGuides, TOUR_SERVICE_OPTIONS, _tags } from 'src/_mock';
// components
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import { useRouter } from 'src/routes/hook';
import FormProvider, {
  RHFRadioGroup,
  RHFEditor,
  RHFUpload,
  RHFTextField,
  RHFAutocomplete,
  RHFMultiCheckbox,
} from 'src/components/hook-form';

import { broadcastService, userService, fileService } from 'src/composables/context-provider';
import moment from 'moment';

// ----------------------------------------------------------------------

export const BROAECAST_TYPE_OPTIONS = [
  { value: 'activity', label: '活动通知' },
  { value: 'notification', label: '消息公告' },
  { value: 'book', label: '灵修' },
];
export default function BroadcastNewEditForm ({ currentBroadcast }) {
  const router = useRouter();

  const [users, setUsers] = useState([])

  const isEdit = !!currentBroadcast;

  const mdUp = useResponsive('up', 'md');

  const { enqueueSnackbar } = useSnackbar();

  const NewBroadcastSchema = Yup.object().shape({
    label: Yup.string().required('请输入标题'),
    content: Yup.string().required('Content is required'),
    images: Yup.array().min(1, 'Images is required'),
    type: Yup.string().required(1, 'Type is required'),
    //
    tourGuides: Yup.array().min(1, 'Must have at least 1 guide'),
    durations: Yup.string().required('Duration is required'),
    tags: Yup.array().min(2, 'Must have at least 2 tags'),
    services: Yup.array().min(2, 'Must have at least 2 services'),
    destination: Yup.string().required('Destination is required'),
    available: Yup.object().shape({
      startDate: Yup.mixed().nullable().required('Start date is required'),
      endDate: Yup.mixed()
        .required('End date is required')
      // .test(
      //   'date-min',
      //   'End date must be later than start date',
      //   (value, { parent }) => value.getTime() > parent.startDate.getTime()
      // ),
    }),
  });

  const defaultValues = useMemo(
    () => ({
      label: currentBroadcast?.label || '',
      content: currentBroadcast?.content || '',
      images: currentBroadcast?.images || [],
      type: currentBroadcast?.type || '',
      //
      tourGuides: currentBroadcast?.tourGuides || [],
      tags: currentBroadcast?.tags || [],
      durations: currentBroadcast?.durations || '',
      destination: currentBroadcast?.destination || '',
      services: currentBroadcast?.services || [],
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

  const getUserData = useCallback(async () => {
    try {
      const response = await userService.pagination({
        status: "active",
      },
        {});
      setUsers(response.data)
      console.log('setUsers', response.data)
    } catch (error) {
      console.log(error)
    }
  }, [setUsers]);

  useEffect(() => {
    if (currentBroadcast) {
      reset(defaultValues);
    }
    getUserData()
  }, [currentBroadcast, getUserData, defaultValues, reset]);

  const onSubmit = handleSubmit(async (data) => {
    console.log('执行')
    try {
      if (!isEdit) {
        await broadcastService.post({
          ...data,
          modifiedDate: moment(new Date()).format('YYYY/MM/DD')
        });
      } else {
        await broadcastService.patch({
          _id: currentBroadcast._id,
          ...data,
          modifiedDate: moment(new Date()).format('YYYY/MM/DD')
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
        })
      );

      setValue('images', [...files, ...newFiles], { shouldValidate: true });
    },
    [setValue, values.images]
  );

  const handleRemoveFile = useCallback(
    (inputFile) => {
      const filtered = values.images && values.images?.filter((file) => file !== inputFile);
      setValue('images', filtered);
    },
    [setValue, values.images]
  );

  const handleRemoveAllFiles = useCallback(() => {
    setValue('images', []);
  }, [setValue]);

  const onUpload = () => {
    values.images.map(async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      const { link } = await fileService.avatar(formData)
      Object.assign(file, {
        preview: link
      })
    })
  }

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
              <RHFTextField name="label" placeholder="Ex: Adventure Seekers Expedition..." />
            </Stack>

            <Stack spacing={1.5}>
              <Typography variant="subtitle2">内容</Typography>
              <RHFEditor simple name="content" />
            </Stack>

            <Stack spacing={1.5}>
              <Typography variant="subtitle2">照片集</Typography>
              <RHFUpload
                multiple
                thumbnail
                name="images"
                maxSize={3145728}
                onDrop={handleDrop}
                onRemove={handleRemoveFile}
                onRemoveAll={handleRemoveAllFiles}
                onUpload={(files) => onUpload(files)}
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
                name="tourGuides"
                placeholder="+ Broadcast Guides"
                disableCloseOnSelect
                options={users}
                getOptionLabel={(option) => option.username}
                isOptionEqualToValue={(option, value) => option._id === value._id}
                renderOption={(props, user) => (
                  <li {...props} key={user._id}>
                    <Avatar
                      key={user._id}
                      alt={user?.photoURL}
                      src={user?.photoURL}
                      sx={{ width: 24, height: 24, flexShrink: 0, mr: 1 }}
                    />

                    {user.username}
                  </li>
                )}
                renderTags={(selected, getTagProps) =>
                  selected.map((user, index) => (
                    <Chip
                      {...getTagProps({ index })}
                      key={user._id}
                      size="small"
                      variant="soft"
                      label={user.username}
                      avatar={<Avatar alt={user.username} src={user?.photoURL} />}
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
              <RHFAutocomplete
                name="destination"
                placeholder="+ Destination"
                options={countries.map((option) => option.label)}
                getOptionLabel={(option) => option}
                renderOption={(props, option) => {
                  const { code, label, phone } = countries.filter(
                    (country) => country.label === option
                  )[0];

                  if (!label) {
                    return null;
                  }

                  return (
                    <li {...props} key={label}>
                      <Iconify
                        key={label}
                        icon={`circle-flags:${code.toLowerCase()}`}
                        width={28}
                        sx={{ mr: 1 }}
                      />
                      {label} ({code}) +{phone}
                    </li>
                  );
                }}
              />
            </Stack>

            <Stack spacing={1}>
              <Typography variant="subtitle2">活动提供情况</Typography>
              <RHFMultiCheckbox
                name="services"
                options={TOUR_SERVICE_OPTIONS}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                }}
              />
            </Stack>

            <Stack spacing={1.5}>
              <Typography variant="subtitle2">标签</Typography>
              <RHFAutocomplete
                name="tags"
                placeholder="+ 标签"
                multiple
                freeSolo
                options={_tags.map((option) => option)}
                getOptionLabel={(option) => option}
                renderOption={(props, option) => (
                  <li {...props} key={option}>
                    {option}
                  </li>
                )}
                renderTags={(selected, getTagProps) =>
                  selected.map((option, index) => (
                    <Chip
                      {...getTagProps({ index })}
                      key={option}
                      label={option}
                      size="small"
                      color="info"
                      variant="soft"
                    />
                  ))
                }
              />
            </Stack>
          </Stack>
        </Card>
      </Grid>
    </>
  );

  const renderActions = (
    <>
      {mdUp && <Grid md={4} />}
      <Grid xs={12} md={8} sx={{ display: 'flex', alignItems: 'center' }}>
        <FormControlLabel
          control={<Switch defaultChecked />}
          label="Publish"
          sx={{ flexGrow: 1, pl: 3 }}
        />


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
