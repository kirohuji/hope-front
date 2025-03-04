import { m } from 'framer-motion';
// @mui
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useAuthContext } from 'src/auth/hooks';
//
import { varFade, MotionViewport } from 'src/components/animate';

// ----------------------------------------------------------------------

export default function FaqsForm() {
  const { user } = useAuthContext();

  return (
    <Stack component={MotionViewport} spacing={3}>
      <m.div variants={varFade().inUp}>
        <Typography variant="h4">反馈您自己遇到的问题</Typography>
      </m.div>

      <m.div variants={varFade().inUp}>
        <TextField fullWidth label="名称" value={user.username} disabled />
      </m.div>

      <m.div variants={varFade().inUp}>
        <TextField fullWidth label="电子邮件" value={user.email} disabled />
      </m.div>

      <m.div variants={varFade().inUp}>
        <TextField fullWidth label="手机号" value={user.phone} disabled />
      </m.div>

      <m.div variants={varFade().inUp}>
        <TextField fullWidth label="请输入你的问题" multiline rows={4} />
      </m.div>

      <m.div variants={varFade().inUp}>
        <Button size="large" variant="contained">
          提交
        </Button>
      </m.div>
    </Stack>
  );
}
