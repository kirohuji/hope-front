// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import VersionNewEditForm from '../version-new-edit-form';

// ----------------------------------------------------------------------

export default function VersionCreateView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="创建一个新的版本"
        links={[
          // {
          //   name: '版本',
          //   href: paths.dashboard.job.root,
          // },
          { name: '' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <VersionNewEditForm />
    </Container>
  );
}
