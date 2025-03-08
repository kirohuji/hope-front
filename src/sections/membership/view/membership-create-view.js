// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import MembershipNewEditForm from '../membership-new-edit-form';

// ----------------------------------------------------------------------

export default function MembershipCreateView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="创建新的消息通知"
        links={[
          // {
          //   name: 'Dashboard',
          //   href: paths.dashboard.root,
          // },
          {
            name: '消息通知',
            href: paths.dashboard.membership.root,
          },
          { name: '创建新的消息通知' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <MembershipNewEditForm />
    </Container>
  );
}
