import { Container, Card } from '@mui/material';
import { useSettingsContext } from 'src/components/settings';
import Scrollbar from 'src/components/scrollbar';
import Markdown from 'src/components/markdown';
import icpContent from '../content/legal-icp.md';

export default function LegalICPView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Scrollbar sx={{ height: '100%' }}>
        <Card sx={{ p: 3, mt: 1 }}>
          <Markdown>{icpContent}</Markdown>
        </Card>
      </Scrollbar>
    </Container>
  );
} 