import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
// routes
import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
import { useSearchParams, useRouter } from 'src/routes/hook';
// config
import { PATH_AFTER_LOGIN } from 'src/config-global';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// auth
import { useAuthContext } from 'src/auth/hooks';
// redux
import { useDispatch } from 'src/redux/store';
import { updateBottomNavigationActionValue } from 'src/redux/slices/dashboard';
// components
import Iconify from 'src/components/iconify';
import FormProvider, { RHFTextField } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export default function JwtLoginView() {
  const dispatch = useDispatch();

  const { login } = useAuthContext();

  const router = useRouter();

  const [errorMsg, setErrorMsg] = useState('');

  const searchParams = useSearchParams();

  const returnTo = searchParams.get('returnTo');

  const password = useBoolean();
  const phoneRegExp = /^(\+86)?(1[3-9][0-9])[0-9]{8}$/;
  const LoginSchema = Yup.object().shape({
    email: Yup.lazy((value) => {
      if (value.indexOf('@') === -1) {
        return Yup.string()
          .required('请输入手机号或者电子邮件')
          .matches(phoneRegExp, '手机号格式错误');
      }
      return Yup.string().required('请输入手机号或者电子邮件').email('电子邮件必须是有效的地址');
    }),
    password: Yup.string().required('请输入密码'),
  });

  const defaultValues = {
    email: '',
    password: '',
  };

  const methods = useForm({
    resolver: yupResolver(LoginSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      const email = data.email.indexOf('@') === -1 ? `${data.email}@lourd.online` : data.email;

      await login?.(email, data.password);
      if (returnTo) {
        router.push(returnTo);
      } else {
        // dispatch(updateBottomNavigationActionValue(1));
        router.push(PATH_AFTER_LOGIN);
      }
    } catch (error) {
      console.error(error);
      reset();
      setErrorMsg(typeof error === 'string' ? error : error.message);
    }
  });

  const renderHead = (
    <Stack spacing={2} sx={{ mb: 5 }}>
      <Typography variant="h4">登录到佳麦</Typography>

      <Stack direction="row" spacing={0.5}>
        <Typography variant="body2">欢迎加入社区</Typography>

        {/* <Link component={RouterLink} href={paths.auth.jwt.register} variant="subtitle2">
          Create an account
        </Link> */}
      </Stack>
    </Stack>
  );

  const renderForm = (
    <Stack spacing={2.5}>
      {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}

      <RHFTextField name="email" label="电子邮件 或者 手机号" />

      <RHFTextField
        name="password"
        label="密码"
        type={password.value ? 'text' : 'password'}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={password.onToggle} edge="end">
                <Iconify icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      {/* <Link variant="body2" color="inherit" underline="always" sx={{ alignSelf: 'flex-end' }}>
        Forgot password?
      </Link> */}

      <LoadingButton
        fullWidth
        color="inherit"
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
      >
        登录
      </LoadingButton>
    </Stack>
  );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      {renderHead}

      {/* <Alert severity="info" sx={{ mb: 3 }}>
        Use email : <strong>demo@minimals.cc</strong> / password :<strong> demo1234</strong>
      </Alert> */}

      <Alert severity="info" sx={{ mb: 3 }}>
        遇到什么问题,欢迎及时反馈
      </Alert>
      {renderForm}
      <div style={{ position: 'absolute', bottom: '16px' }} />
    </FormProvider>
  );
}
