import { Container, Card } from '@mui/material';
import { useSettingsContext } from 'src/components/settings';
import Scrollbar from 'src/components/scrollbar';
import Markdown from 'src/components/markdown';
import thirdPartyPrivacyContent from '../content/privacy-third-party.md';

export default function PrivacyThirdPartyView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Scrollbar sx={{ height: '100%' }}>
        <Card sx={{ p: 3 }}>
          <Markdown>{thirdPartyPrivacyContent}</Markdown>
        </Card>
      </Scrollbar>
    </Container>
  );
}
