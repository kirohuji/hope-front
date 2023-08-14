import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
// assets
// import { countries } from 'src/assets/data';
// components
// import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFSelect, RHFTextField } from 'src/components/hook-form';

import { profileService, userService } from 'src/composables/context-provider';

// ----------------------------------------------------------------------

export const USER_STATUS_OPTIONS = [
  { value: 'active', label: '激活' },
  { value: 'banned', label: '禁用' },
];
export default function UserQuickEditForm ({ currentUser, open, onClose }) {
  const { enqueueSnackbar } = useSnackbar();

  const NewUserSchema = Yup.object().shape({
    username: Yup.string().required('请输入名字'),
    displayName: Yup.string().required('请输入展示名'),
    email: Yup.string().required('请输入电子邮件').email('Email must be a valid email address'),
    phoneNumber: Yup.string().required('请输入手机号'),
    address: Yup.string().required('请选择地址'),
    age: Yup.string().required('请选择年龄'),
    gender: Yup.string().required('请选择性别'),
    status: Yup.string(),
    baptized: Yup.boolean().required('请选择是否受洗'),
    // country: Yup.string().required('Country is required'),
    // company: Yup.string().required('Company is required'),
    // state: Yup.string().required('State is required'),
    // city: Yup.string().required('City is required'),
    // role: Yup.string().required('Role is required'),
    // photoURL: Yup.mixed().required('请选择头像'),
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
      status: currentUser?.status || '',
      baptized: currentUser?.baptized || false,
      // country: currentUser?.country || '',
      // state: currentUser?.state || '',
      // city: currentUser?.city || '',
      // zipCode: currentUser?.zipCode || '',
      // photoURL: currentUser?.photoURL || null,
      // isVerified: currentUser?.isVerified || true,
      // status: currentUser?.status,
      // company: currentUser?.company || '',
      // role: currentUser?.role || '',
    }),
    [currentUser]
  );

  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await userService.patch({
        _id: currentUser._id,
        ...data
      });
      await profileService.patch({
        _id: currentUser._id,
        ...data
      });
      reset();
      onClose();
      enqueueSnackbar('更新成功!');
    } catch (error) {
      console.error(error);
    }
  });

  return (
    <Dialog
      fullWidth
      maxWidth={false}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { maxWidth: 720 },
      }}
    >
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogTitle>快速更新</DialogTitle>

        <DialogContent>
          <Alert variant="outlined" severity="info" sx={{ mb: 3 }}>
            更新基本信息
          </Alert>

          <Box
            rowGap={3}
            columnGap={2}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)',
            }}
          >
            <RHFSelect name="status" label="状态">
              {USER_STATUS_OPTIONS.map((status) => (
                <MenuItem key={status.value} value={status.value}>
                  {status.label}
                </MenuItem>
              ))}
            </RHFSelect>

            <Box sx={{ display: { xs: 'none', sm: 'block' } }} />

            <RHFTextField name="username" label="用户名" />
            <RHFTextField name="displayName" label="展示名" />
            <RHFTextField name="age" label=" 年龄" />

            <RHFSelect name="gender" label="性别" placeholder="性别">
              <MenuItem value="male">
                男
              </MenuItem>
              <MenuItem value="female">
                女
              </MenuItem>
            </RHFSelect>
            <RHFTextField name="email" label="电子邮件" />
            <RHFTextField name="phoneNumber" label="手机号" />
            <RHFSelect name="baptized" label="是否受洗" placeholder="是否受洗">
              <MenuItem value="true">
                是
              </MenuItem>
              <MenuItem value="false">
                否
              </MenuItem>
            </RHFSelect>
            <RHFTextField name="address" label="地址" />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            取消
          </Button>

          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            更新
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}

UserQuickEditForm.propTypes = {
  currentUser: PropTypes.object,
  onClose: PropTypes.func,
  open: PropTypes.bool,
};
