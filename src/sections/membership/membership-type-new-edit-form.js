import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useCallback, useState, useMemo, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, Controller } from 'react-hook-form';
// @mui
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Autocomplete from '@mui/material/Autocomplete';
import LoadingButton from '@mui/lab/LoadingButton';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import Switch from '@mui/material/Switch';
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
import { useAuthContext } from 'src/auth/hooks';
import { useDebounce } from 'src/hooks/use-debounce';
// routes
import { paths } from 'src/routes/paths';
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
  RHFSwitch,
} from 'src/components/hook-form';

// utils
import { fData } from 'src/utils/format-number';

import { membershipTypeService, userService, fileService } from 'src/composables/context-provider';
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
  // { value: 'book', label: '阅读' },
];

export const NOTIFICATION_DIRECTION_OPTIONS = [
  { value: 'everyone', label: '所有人' },
  { value: 'specific', label: '指定用户' },
];

export const NOTIFICATION_PUBLISH_OPTIONS = [
  { value: 'immediate', label: '立即发送' },
  { value: 'scheduled', label: '定时发送' },
];

export default function MembershipTypeNewEditForm({
  onCancel,
  currentMembershipType,
  onSubmitData,
}) {
  const loading = useBoolean(false);

  const router = useRouter();

  const isEdit = !!currentMembershipType;

  const mdUp = useResponsive('up', 'md');

  const [users, setUsers] = useState([]);

  const { user } = useAuthContext();

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

  // const getTableData = useCallback(async (selector = {}, options = {}) => {
  //   try {
  //     const response = await userService.pagination(
  //       {
  //         ...selector,
  //         ..._.pickBy(_.omit(debouncedFilters, ["role"]))
  //       },
  //       options
  //     )
  //     setTableData(response.data);
  //     setTableDataCount(response.total);
  //   } catch (error) {
  //     enqueueSnackbar(error.message)
  //   }
  // }, [debouncedFilters, setTableData, setTableDataCount, enqueueSnackbar]);

  const { enqueueSnackbar } = useSnackbar();

  const NewMembershipSchema = Yup.object().shape({
    label: Yup.string().required('请输入会员名'),
    value: Yup.string().required('请输入编码'),
    description: Yup.string().required('请输入内容'),
    price: Yup.string().required('请输入价格'),
    // images: Yup.array().required('请选择资源'),
    // type: Yup.string().required('请选择类型'),
    // leaders: Yup.array().min(1, '至少选择一位负责人'),
    // durations: Yup.string().required('请选择时间程度'),
    // tags: Yup.array().min(2, 'Must have at least 2 tags'),
    // services: Yup.array().min(2, 'Must have at least 2 services'),
    // destination: Yup.string().required('目的地是必填的'),
    // published: Yup.boolean(),
    // available: Yup.object().shape({
    //   startDate: Yup.mixed().nullable(),
    //   endDate: Yup.mixed().nullable(),
    // }),
  });

  const defaultValues = useMemo(
    () => ({
      value: currentMembershipType?.value || '',
      label: currentMembershipType?.label || '',
      description: currentMembershipType?.description || '',
      price: currentMembershipType?.price || '',
      // images: currentMembershipType?.images || [],
      // type: currentMembershipType?.type || '',
      // //
      // leaders: currentMembershipType?.leaders || [],
      // // tags: currentMembershipType?.tags || [],
      // durations: currentMembershipType?.durations || '',
      // destination: currentMembershipType?.destination || '',
      // published: currentMembershipType?.published || false,
      // // services: currentMembershipType?.services || [],
      // available: {
      //   startDate: currentMembershipType?.available.startDate || null,
      //   endDate: currentMembershipType?.available.endDate || null,
      // },
    }),
    [currentMembershipType]
  );

  const methods = useForm({
    resolver: yupResolver(NewMembershipSchema),
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
    if (currentMembershipType) {
      reset(defaultValues);
    }
  }, [currentMembershipType, defaultValues, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (!isEdit) {
        await membershipTypeService.post({
          ...data,
          // scope: scope.active._id,
          modifiedDate: moment(new Date()).format('YYYY/MM/DD'),
        });
        reset();
      } else {
        await membershipTypeService.patch({
          _id: currentMembershipType._id,
          ...data,
          modifiedDate: moment(new Date()).format('YYYY/MM/DD'),
        });
      }
      enqueueSnackbar(currentMembershipType ? '更新成功!' : '创建成功!');
      onSubmitData();
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
              <Typography variant="subtitle2">会员名</Typography>
              <RHFTextField name="label" />
            </Stack>

            <Stack spacing={1.5}>
              <Typography variant="subtitle2">编码</Typography>
              <RHFTextField name="value" />
            </Stack>

            <Stack spacing={1.5}>
              <Typography variant="subtitle2">描述</Typography>
              <RHFTextField name="description" multiline rows={3} />
            </Stack>

            {/* <Stack spacing={1.5}>
              <Typography variant="subtitle2">标题</Typography>
              <RHFTextField name="title" placeholder="例如: 消息通知 ..." />
            </Stack>

            <Stack spacing={1.5}>
              <Typography variant="subtitle2">内容</Typography>
              <RHFEditor simple name="description" />
            </Stack> */}

            {/* <Stack spacing={1.5}>
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
            </Stack> */}
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
            {/* <Stack spacing={1}>
              <Typography variant="subtitle2">类型</Typography>
              <RHFRadioGroup row spacing={4} name="type" options={NOTIFICATION_TYPE_OPTIONS} />
            </Stack> */}

            {/* <Stack>
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
            </Stack> */}

            <Stack spacing={1}>
              <Typography variant="subtitle2">价格</Typography>
              <RHFTextField name="price" label="价格" />
            </Stack>

            {/* <Stack spacing={1}>
              <Typography variant="subtitle2">发送时机</Typography>
              <RHFRadioGroup
                row
                spacing={4}
                name="direction"
                options={NOTIFICATION_DIRECTION_OPTIONS}
              />
            </Stack> */}

            {/* <Stack spacing={1.5}>
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
            </Stack> */}

            {/* <Stack spacing={1.5}>
              <Typography variant="subtitle2">时间长度</Typography>
              <RHFTextField name="durations" placeholder="比如: 2 天, 4 天 3 夜..." />
            </Stack> */}

            {/* <Stack spacing={1.5}>
              <Typography variant="subtitle2">目的地</Typography>
              <RHFTextField name="destination" placeholder="比如: 详细地址..." />
            </Stack> */}
            {/**
               *            <Stack spacing={1}>
              <Typography variant="subtitle2">活动提供情况</Typography>
              <RHFMultiCheckbox
                name="services"
                options={NOTIFICATION_SERVICE_OPTIONS}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                }}
              />
            </Stack>
               * */}
            {/**
               
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
               * */}
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

        <Button color="error" variant="contained" onClick={() => onCancel()} sx={{ mr: 1 }}>
          返回
        </Button>
        <LoadingButton
          type="submit"
          variant="contained"
          size="large"
          loading={isSubmitting}
          sx={{ ml: 2 }}
        >
          {!currentMembershipType ? '创建' : '保存变更'}
        </LoadingButton>
      </Grid>
    </>
  );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3} sx={{ p: 2 }}>
        {renderDetails}

        {renderProperties}

        {renderActions}
      </Grid>
    </FormProvider>
  );
}

MembershipTypeNewEditForm.propTypes = {
  currentMembershipType: PropTypes.object,
  onSubmitData: PropTypes.func,
  onCancel: PropTypes.func,
};
