import { Container, Card } from '@mui/material';
import { useSettingsContext } from 'src/components/settings';
import Scrollbar from 'src/components/scrollbar';
import Markdown from 'src/components/markdown';
import CollectInfoListContentMDX from '../content/collect-info-list.md';

export default function CollectInfoListPage() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Scrollbar sx={{ height: '100%' }}>
        <Card sx={{ p: 3 }}>
         <CollectInfoListContentMDX />
        </Card>
      </Scrollbar>
    </Container>
  );
} 