import { Container, Card } from '@mui/material';
import { useSettingsContext } from 'src/components/settings';
import Scrollbar from 'src/components/scrollbar';
import Markdown from 'src/components/markdown';
import childrenPrivacyContent from '../content/privacy-children.md';

export default function PrivacyChildrenView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Scrollbar sx={{ height: '100%' }}>
        <Card sx={{ p: 3 }}>
          <Markdown>{childrenPrivacyContent}</Markdown>
        </Card>
      </Scrollbar>
    </Container>
  );
}
