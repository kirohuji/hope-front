import * as Yup from 'yup';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
// auth
import { useAuthContext } from 'src/auth/hooks';
// utils
import { fData } from 'src/utils/format-number';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// assets
import { countries } from 'src/assets/data';
// components
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  RHFSwitch,
  RHFTextField,
  RHFUploadAvatar,
  RHFAutocomplete,
} from 'src/components/hook-form';

import { profileService, fileService } from 'src/composables/context-provider';

// ----------------------------------------------------------------------

export default function AccountGeneral() {
  const { enqueueSnackbar } = useSnackbar();

  const { user, refresh } = useAuthContext();

  const UpdateUserSchema = Yup.object().shape({
    displayName: Yup.string().required('请输入名字'),
    email: Yup.string().required('请输入邮件').email('必须是一个有效的邮件地址'),
    // photoURL: Yup.mixed().nullable().required('Avatar is required'),
    // phoneNumber: Yup.string().required('Phone number is required'),
    // country: Yup.string().required('Country is required'),
    // address: Yup.string().required('Address is required'),
    // state: Yup.string().required('State is required'),
    // city: Yup.string().required('City is required'),
    // zipCode: Yup.string().required('Zip code is required'),
    // about: Yup.string().required('About is required'),
    // // not required
    // isPublic: Yup.boolean(),
  });

  const loading = useBoolean(false);

  const defaultValues = {
    displayName: user?.displayName || '',
    email: user?.email || '',
    photoURL: user?.photoURL || null,
    phoneNumber: user?.phoneNumber || '',
    country: user?.country || '',
    address: user?.address || '',
    state: user?.state || '',
    city: user?.city || '',
    zipCode: user?.zipCode || '',
    about: user?.about || '',
    isPublic: user?.isPublic || false,
  };

  const methods = useForm({
    resolver: yupResolver(UpdateUserSchema),
    defaultValues,
  });

  const {
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await profileService.patch({
        _id: user._id,
        ...data,
        photoURL: data.photoURL instanceof Object ? data.photoURL.preview : data.photoURL,
      });
      enqueueSnackbar('更新 成功!');
      refresh();
    } catch (error) {
      console.error(error);
    }
  });

  const handleDrop = useCallback(
    async (acceptedFiles) => {
      try {
        const file = acceptedFiles[0];
        console.log('file.size', file.size);
        if (file.size < 3145728) {
          const formData = new FormData();
          formData.append('file', file);
          loading.onTrue();
          const { link } = await fileService.avatar(formData);
          if (file) {
            setValue(
              'photoURL',
              Object.assign(file, {
                preview: link,
              })
            );
          }
          loading.onFalse();
          enqueueSnackbar('头像上传成功!');
        }
      } catch (e) {
        loading.onFalse();
      }
    },
    [setValue, enqueueSnackbar, loading]
  );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid xs={12} md={4}>
          <Card sx={{ pt: 10, pb: 5, px: 3, textAlign: 'center', position: 'relative' }}>
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
            <RHFUploadAvatar
              name="photoURL"
              // maxSize={3145728}
              onDrop={handleDrop}
              onDropRejected={() => {
                loading.onFalse();
              }}
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
                  <br /> 最大限制 {fData(3145728)}
                </Typography>
              }
            />
            {false && (
              <div>
                <RHFSwitch name="isPublic" labelPlacement="start" label="是否公开" sx={{ mt: 5 }} />

                <Button variant="soft" color="error" sx={{ mt: 3 }}>
                  Delete User
                </Button>
              </div>
            )}
          </Card>
        </Grid>

        <Grid xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
            >
              <RHFTextField name="displayName" label="昵称" />
              <RHFTextField name="email" label="电子邮件" />
              <RHFTextField name="phoneNumber" label="手机号码" />
              <RHFTextField name="address" label="详细地址" />

              <RHFAutocomplete
                name="country"
                label="请选择国家"
                options={countries.map((country) => country.label)}
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

              <RHFTextField name="state" label="省份" />
              <RHFTextField name="city" label="城市" />
              <RHFTextField name="zipCode" label="邮政编码" />
            </Box>

            <Stack spacing={3} alignItems="flex-end" sx={{ mt: 3 }}>
              <RHFTextField name="about" multiline rows={4} label="结束" />

              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                保存修改
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
