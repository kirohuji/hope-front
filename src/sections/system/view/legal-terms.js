import { Container, Card } from '@mui/material';
import { useSettingsContext } from 'src/components/settings';
import Scrollbar from 'src/components/scrollbar';
import Markdown from 'src/components/markdown';
import LegalTermsContent from '../content/legal-terms.md';

export default function PrivacyConcisePage() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Scrollbar sx={{ height: '100%' }}>
        <Card sx={{ p: 1 }}>
          <Markdown children={LegalTermsContent} />
        </Card>
      </Scrollbar>
    </Container>
  );
}
