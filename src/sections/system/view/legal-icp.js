import { Container, Typography, Card, Stack } from '@mui/material';
import { useSettingsContext } from 'src/components/settings';
import Scrollbar from 'src/components/scrollbar';

export default function LegalICPView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Scrollbar sx={{ height: '100%' }}>
        <Card sx={{ p: 3 }}>
          <Stack spacing={3}>
            <Typography variant="h4">ICP备案信息</Typography>
            
            <Typography variant="body1">
              根据中国相关法律法规要求，我们已完成网站ICP备案，以下是备案相关信息。
            </Typography>

            <Stack spacing={2}>
              <Typography variant="h6">1. 备案主体信息</Typography>
              <Typography variant="body2">
                备案主体：
                - 单位名称：示例科技有限公司
                - 备案号：京ICP备XXXXXXXX号
                - 备案时间：2023年XX月XX日
                - 备案状态：正常
              </Typography>
            </Stack>

            <Stack spacing={2}>
              <Typography variant="h6">2. 网站信息</Typography>
              <Typography variant="body2">
                网站详情：
                - 网站名称：示例教育平台
                - 网站域名：example.com
                - 网站负责人：张三
                - 网站类型：教育类
              </Typography>
            </Stack>

            <Stack spacing={2}>
              <Typography variant="h6">3. 备案审核信息</Typography>
              <Typography variant="body2">
                审核记录：
                - 初审通过时间：2023年XX月XX日
                - 终审通过时间：2023年XX月XX日
                - 审核机构：北京市通信管理局
                - 审核状态：已通过
              </Typography>
            </Stack>

            <Stack spacing={2}>
              <Typography variant="h6">4. 备案更新记录</Typography>
              <Typography variant="body2">
                更新历史：
                - 首次备案：2023年XX月XX日
                - 最近更新：2023年XX月XX日
                - 更新内容：网站名称变更
                - 更新状态：已完成
              </Typography>
            </Stack>
          </Stack>
        </Card>
      </Scrollbar>
    </Container>
  );
} 