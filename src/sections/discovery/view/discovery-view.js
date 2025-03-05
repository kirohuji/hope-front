// setting
import { useSettingsContext } from 'src/components/settings';
import { useState, useCallback } from 'react';
// @mui
import { Container, Stack } from '@mui/material';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Divider from '@mui/material/Divider';
import { _ecommerceNewProducts, _userFeeds } from 'src/_mock';
import DiscoveryPostItem from '../discovery-post-item';
import DiscoveryKanban from '../discovery-kanban';

const TABS = [
  {
    value: 'Offcial',
    label: '社区',
  },
  {
    value: 'Following',
    label: '你的关注',
  },
  {
    value: 'Recommendation',
    label: '为你推荐',
  },
];

export default function DiscoveryView() {
  const { themeStretch } = useSettingsContext();

  const [currentTab, setCurrentTab] = useState('Offcial');

  const handleChangeTab = useCallback((event, newValue) => {
    setCurrentTab(newValue);
  }, []);

  return (
    <Container maxWidth={themeStretch ? false : 'xl'}>
      <Tabs
        value={currentTab}
        onChange={handleChangeTab}
        sx={{
          m: 0,
        }}
      >
        {TABS.map((tab) => (
          <Tab key={tab.value} label={tab.label} icon={tab.icon} value={tab.value} />
        ))}
      </Tabs>
      <Divider />
      <Stack spacing={3} sx={{ mt: 1 }}>
        <DiscoveryKanban list={_ecommerceNewProducts} />
        {_userFeeds.map((post) => (
          <DiscoveryPostItem key={post.id} post={post} />
        ))}
      </Stack>
    </Container>
  );
}
