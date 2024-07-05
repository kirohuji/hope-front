// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import BroadcastNewEditForm from '../broadcast-new-edit-form';

// ----------------------------------------------------------------------

export default function BroadcastCreateView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="创建新的活动通知"
        links={[
          // {
          //   name: 'Dashboard',
          //   href: paths.dashboard.root,
          // },
          {
            name: '消息通知',
            href: paths.dashboard.broadcast.root,
          },
          { name: '创建新的活动通知t' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <BroadcastNewEditForm />
    </Container>
  );
}
