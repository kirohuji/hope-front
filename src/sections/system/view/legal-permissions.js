import { Container, Typography, Card, Stack } from '@mui/material';
import { useSettingsContext } from 'src/components/settings';
import Scrollbar from 'src/components/scrollbar';

export default function LegalPermissionsView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Scrollbar sx={{ height: '100%' }}>
        <Card sx={{ p: 3 }}>
          <Stack spacing={3}>
            <Typography variant="h4">应用权限说明</Typography>
            
            <Typography variant="body1">
              本说明详细介绍了应用所需的各种权限及其用途，以帮助您了解我们如何使用这些权限来提供更好的服务。
            </Typography>

            <Stack spacing={2}>
              <Typography variant="h6">1. 必要权限</Typography>
              <Typography variant="body2">
                应用运行必需的基本权限：
                - 网络访问权限
                - 存储权限（缓存数据）
                - 设备信息（设备标识）
                - 通知权限（消息推送）
              </Typography>
            </Stack>

            <Stack spacing={2}>
              <Typography variant="h6">2. 功能相关权限</Typography>
              <Typography variant="body2">
                特定功能所需的权限：
                - 相机（扫描二维码）
                - 麦克风（语音输入）
                - 位置（附近服务）
                - 通讯录（邀请好友）
              </Typography>
            </Stack>

            <Stack spacing={2}>
              <Typography variant="h6">3. 权限管理</Typography>
              <Typography variant="body2">
                您可以：
                - 随时修改权限设置
                - 拒绝非必要权限
                - 查看权限使用记录
                - 撤销已授权限
              </Typography>
            </Stack>

            <Stack spacing={2}>
              <Typography variant="h6">4. 权限使用说明</Typography>
              <Typography variant="body2">
                我们承诺：
                - 仅用于声明用途
                - 最小化权限范围
                - 保护用户隐私
                - 定期权限审查
              </Typography>
            </Stack>
          </Stack>
        </Card>
      </Scrollbar>
    </Container>
  );
} 