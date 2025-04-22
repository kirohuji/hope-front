import { Container, Typography, Card, Stack } from '@mui/material';
import { useSettingsContext } from 'src/components/settings';
import Scrollbar from 'src/components/scrollbar';

export default function LegalTermsView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Scrollbar sx={{ height: '100%' }}>
        <Card sx={{ p: 3 }}>
          <Stack spacing={3}>
            <Typography variant="h4">服务条款</Typography>
            
            <Typography variant="body1">
              本服务条款是您与我们之间关于使用我们服务的法律协议。请仔细阅读并理解本条款。
            </Typography>

            <Stack spacing={2}>
              <Typography variant="h6">1. 服务说明</Typography>
              <Typography variant="body2">
                我们提供的服务包括：
                - 在线教育平台
                - 学习资源访问
                - 用户互动功能
                - 技术支持服务
              </Typography>
            </Stack>

            <Stack spacing={2}>
              <Typography variant="h6">2. 用户责任</Typography>
              <Typography variant="body2">
                用户在使用服务时应：
                - 遵守法律法规
                - 维护平台秩序
                - 保护账户安全
                - 尊重知识产权
              </Typography>
            </Stack>

            <Stack spacing={2}>
              <Typography variant="h6">3. 服务限制</Typography>
              <Typography variant="body2">
                我们保留以下权利：
                - 修改服务内容
                - 限制用户访问
                - 终止违规账户
                - 更新服务条款
              </Typography>
            </Stack>

            <Stack spacing={2}>
              <Typography variant="h6">4. 免责声明</Typography>
              <Typography variant="body2">
                我们不对以下情况负责：
                - 不可抗力导致的服务中断
                - 用户操作导致的损失
                - 第三方服务的问题
                - 法律法规变更的影响
              </Typography>
            </Stack>
          </Stack>
        </Card>
      </Scrollbar>
    </Container>
  );
} 