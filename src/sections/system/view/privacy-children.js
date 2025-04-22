import { Container, Typography, Card, Stack } from '@mui/material';
import { useSettingsContext } from 'src/components/settings';
import Scrollbar from 'src/components/scrollbar';

export default function PrivacyChildrenView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Scrollbar sx={{ height: '100%' }}>
        <Card sx={{ p: 3 }}>
          <Stack spacing={3}>
            <Typography variant="h4">儿童信息保护政策</Typography>
            
            <Typography variant="body1">
              本儿童信息保护政策旨在说明我们如何保护儿童的个人信息，以及家长或监护人的权利和责任。
            </Typography>

            <Stack spacing={2}>
              <Typography variant="h6">1. 儿童信息收集</Typography>
              <Typography variant="body2">
                我们仅在获得家长或监护人同意的情况下收集儿童信息，包括：
                - 基本信息（如姓名、年龄）
                - 学习数据（如学习进度、成绩）
                - 使用行为（如访问时间、功能使用）
              </Typography>
            </Stack>

            <Stack spacing={2}>
              <Typography variant="h6">2. 信息使用目的</Typography>
              <Typography variant="body2">
                我们使用儿童信息仅用于：
                - 提供教育服务
                - 改进学习体验
                - 确保使用安全
                - 提供必要支持
              </Typography>
            </Stack>

            <Stack spacing={2}>
              <Typography variant="h6">3. 家长权利</Typography>
              <Typography variant="body2">
                家长或监护人有权：
                - 查看儿童信息
                - 要求更正信息
                - 要求删除信息
                - 撤回同意
                - 限制信息处理
              </Typography>
            </Stack>

            <Stack spacing={2}>
              <Typography variant="h6">4. 安全保护措施</Typography>
              <Typography variant="body2">
                我们采取以下措施保护儿童信息：
                - 严格的数据加密
                - 访问权限控制
                - 定期安全评估
                - 员工培训
              </Typography>
            </Stack>
          </Stack>
        </Card>
      </Scrollbar>
    </Container>
  );
}
