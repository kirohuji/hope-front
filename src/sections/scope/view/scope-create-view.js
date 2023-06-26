// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import ScopeNewEditForm from '../scope-new-edit-form';

// ----------------------------------------------------------------------

export default function ScopeCreateView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="创建一个新的作用域"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Scope',
            href: paths.dashboard.job.root,
          },
          { name: 'New job' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <ScopeNewEditForm />
    </Container>
  );
}
