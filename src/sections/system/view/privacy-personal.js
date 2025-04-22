import { Container, Typography, Card, Stack } from '@mui/material';
import { useSettingsContext } from 'src/components/settings';
import Scrollbar from 'src/components/scrollbar';

export default function PrivacyPersonalView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Scrollbar sx={{ height: '100%' }}>
        <Card sx={{ p: 3 }}>
          <Stack spacing={3}>
            <Typography variant="h4">个人信息保护政策</Typography>
            
            <Typography variant="body1">
              本个人信息保护政策旨在向您说明我们如何收集、使用、存储和保护您的个人信息，以及您享有的相关权利。
            </Typography>

            <Stack spacing={2}>
              <Typography variant="h6">1. 信息收集</Typography>
              <Typography variant="body2">
                我们收集的信息包括但不限于：
                - 基本信息（如姓名、联系方式）
                - 账户信息（如用户名、密码）
                - 使用数据（如访问记录、操作日志）
              </Typography>
            </Stack>

            <Stack spacing={2}>
              <Typography variant="h6">2. 信息使用</Typography>
              <Typography variant="body2">
                我们使用收集的信息用于：
                - 提供和改进服务
                - 与您沟通
                - 确保服务安全
                - 遵守法律法规
              </Typography>
            </Stack>

            <Stack spacing={2}>
              <Typography variant="h6">3. 信息保护</Typography>
              <Typography variant="body2">
                我们采取严格的安全措施保护您的个人信息，包括：
                - 数据加密
                - 访问控制
                - 安全审计
              </Typography>
            </Stack>

            <Stack spacing={2}>
              <Typography variant="h6">4. 您的权利</Typography>
              <Typography variant="body2">
                您有权：
                - 访问您的个人信息
                - 更正不准确的信息
                - 删除您的信息
                - 限制信息处理
                - 数据可携性
              </Typography>
            </Stack>
          </Stack>
        </Card>
      </Scrollbar>
    </Container>
  );
}
