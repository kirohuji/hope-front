import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useCallback, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Switch from '@mui/material/Switch';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';
// utils
import { fData } from 'src/utils/format-number';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';

// redux
import { useSelector } from 'src/redux/store';

// components
import Label from 'src/components/label';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFSelect, RHFTextField, RHFUploadAvatar } from 'src/components/hook-form';
import { profileService, userService, fileService } from 'src/composables/context-provider';
// ----------------------------------------------------------------------

export default function UserNewEditForm({ currentUser }) {
  const router = useRouter();
  const isEdit = !!currentUser;
  const scope = useSelector((state) => state.scope);
  const loading = useBoolean(false);

  const { enqueueSnackbar } = useSnackbar();

  const NewUserSchema = Yup.object().shape({
    username: Yup.string().required('请输入名字'),
    displayName: Yup.string().required('请输入展示名'),
    email: Yup.string().required('请输入电子邮件').email('电子邮件必须是有效的'),
    phoneNumber: Yup.string().required('请输入手机号'),
    realName: Yup.string().required('请输入真实名'),
    address: Yup.string().required('请选择地址'),
    age: Yup.string().required('请选择年龄'),
    gender: Yup.string().required('请选择性别'),
    available: Yup.string(),
    scope: Yup.string().required('请选择组织'),
    baptized: Yup.boolean().required('请选择是否受洗'),
    // country: Yup.string().required('Country is required'),
    // company: Yup.string().required('Company is required'),
    // state: Yup.string().required('State is required'),
    // city: Yup.string().required('City is required'),
    // role: Yup.string().required('Role is required'),
    photoURL: Yup.mixed().required('请选择头像'),
  });
  const defaultValues = useMemo(
    () => ({
      username: currentUser?.username || '',
      displayName: currentUser?.displayName || '',
      email: currentUser?.email || '',
      phoneNumber: currentUser?.phoneNumber || '',
      address: currentUser?.address || '',
      age: currentUser?.age || '',
      gender: currentUser?.gender || '',
      available: currentUser?.available || '',
      scope: currentUser?.scope || '',
      realName: currentUser?.realName || '',
      baptized: currentUser?.baptized || false,
      photoURL: currentUser?.photoURL || null,
    }),
    [currentUser]
  );

  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (!isEdit) {
        const user = await userService.register({
          ...data,
        });
        await profileService.patch({
          _id: user._id || user.id || user,
          ...data,
          photoURL: data.photoURL instanceof Object ? data.photoURL.preview : data.photoURL,
        });
      } else {
        // await userService.patch({
        //   _id: currentUser._id,
        //   ...data,
        //   photoURL: data.photoURL instanceof Object ? data.photoURL.preview : data.photoURL,
        // });
        await profileService.patch({
          _id: currentUser._id,
          ...data,
          photoURL: data.photoURL instanceof Object ? data.photoURL.preview : data.photoURL,
        });
      }
      reset();
      enqueueSnackbar(currentUser ? '更新成功!' : '创建成功!');
      router.push(paths.dashboard.user.list);
      console.info('DATA', data);
    } catch (e) {
      enqueueSnackbar(e?.response?.data?.message);
      console.error(e);
    }
  });

  const handleDrop = useCallback(
    async (acceptedFiles) => {
      try {
        const file = acceptedFiles[0];
        const formData = new FormData();
        formData.append('file', file);
        loading.onTrue();
        const { link } = await fileService.avatar(formData);
        if (file) {
          setValue('photoURL', link, { shouldValidate: true });
          loading.onFalse();
          enqueueSnackbar('头像上传成功!');
        }
      } catch (e) {
        enqueueSnackbar(e?.response?.data?.message);
        loading.onFalse();
      }
    },
    [setValue, enqueueSnackbar, loading]
  );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid xs={12} md={4}>
          <Card sx={{ pt: 10, pb: 5, px: 3 }}>
            {currentUser && (
              <Label
                color={values.available === 'active' ? 'success' : 'error'}
                sx={{ textTransform: 'uppercase', position: 'absolute', top: 24, right: 24 }}
              >
                {values.available === 'active' ? '激活' : '禁用'}
              </Label>
            )}

            <Box sx={{ mb: 5 }}>
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
                    <br /> max size of {fData(3145728)}
                  </Typography>
                }
              />
            </Box>

            {currentUser && (
              <FormControlLabel
                labelPlacement="start"
                control={
                  <Controller
                    name="available"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        {...field}
                        checked={field.value !== 'active'}
                        onChange={(event) =>
                          field.onChange(event.target.checked ? 'banned' : 'active')
                        }
                      />
                    )}
                  />
                }
                label={
                  <>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      禁用
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      开启禁用
                    </Typography>
                  </>
                }
                sx={{ mx: 0, mb: 3, width: 1, justifyContent: 'space-between' }}
              />
            )}
            {currentUser && (
              <Stack justifyContent="center" alignItems="center" sx={{ mt: 3 }}>
                <Button variant="soft" color="error">
                  删除用户
                </Button>
              </Stack>
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
              <RHFTextField name="username" label="用户名" />
              <RHFTextField name="displayName" label="展示名" />
              <RHFTextField name="realName" label="真实名" />
              <RHFTextField name="age" label=" 年龄" />
              <RHFSelect name="gender" label="性别" placeholder="性别">
                <MenuItem value="male">男</MenuItem>
                <MenuItem value="female">女</MenuItem>
              </RHFSelect>
              <RHFTextField name="email" label="电子邮件" disabled={currentUser} />
              <RHFTextField name="phoneNumber" label="手机号" disabled={currentUser} />
              <RHFSelect name="baptized" label="是否受洗" placeholder="是否受洗">
                <MenuItem value="true">是</MenuItem>
                <MenuItem value="false">否</MenuItem>
              </RHFSelect>
              <RHFTextField name="address" label="地址" />
              <RHFSelect name="scope" label="所属组织" placeholder="请选择组织架构">
                {scope.scopes.map((option) => (
                  <MenuItem key={option._id} value={option._id}>
                    {option.label}
                  </MenuItem>
                ))}
              </RHFSelect>
            </Box>

            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <div>
                <Button
                  color="error"
                  variant="contained"
                  onClick={() => router.push(paths.dashboard.user.list)}
                  sx={{ mr: 1 }}
                >
                  返回
                </Button>
                <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                  {!currentUser ? '创建用户' : '保存修改'}
                </LoadingButton>
              </div>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}

UserNewEditForm.propTypes = {
  currentUser: PropTypes.object,
};
