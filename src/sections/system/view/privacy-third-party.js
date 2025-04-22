import { Container, Typography, Card, Stack } from '@mui/material';
import { useSettingsContext } from 'src/components/settings';
import Scrollbar from 'src/components/scrollbar';

export default function PrivacyThirdPartyView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Scrollbar sx={{ height: '100%' }}>
        <Card sx={{ p: 3 }}>
          <Stack spacing={3}>
            <Typography variant="h4">第三方数据共享说明</Typography>
            
            <Typography variant="body1">
              本说明旨在向您说明我们如何与第三方共享数据，以及相关的保护措施。
            </Typography>

            <Stack spacing={2}>
              <Typography variant="h6">1. 数据共享范围</Typography>
              <Typography variant="body2">
                我们仅在以下情况下与第三方共享数据：
                - 必要的服务支持（如云服务提供商）
                - 数据分析服务
                - 支付处理服务
                - 法律合规要求
              </Typography>
            </Stack>

            <Stack spacing={2}>
              <Typography variant="h6">2. 共享数据类型</Typography>
              <Typography variant="body2">
                共享的数据可能包括：
                - 使用数据
                - 技术数据
                - 交易数据
                - 必要的身份信息
              </Typography>
            </Stack>

            <Stack spacing={2}>
              <Typography variant="h6">3. 第三方责任</Typography>
              <Typography variant="body2">
                我们要求第三方：
                - 遵守数据保护法规
                - 实施安全措施
                - 限制数据使用范围
                - 及时报告安全事件
              </Typography>
            </Stack>

            <Stack spacing={2}>
              <Typography variant="h6">4. 您的权利</Typography>
              <Typography variant="body2">
                您有权：
                - 了解数据共享情况
                - 要求停止特定共享
                - 获取共享数据清单
                - 提出投诉或建议
              </Typography>
            </Stack>
          </Stack>
        </Card>
      </Scrollbar>
    </Container>
  );
}
