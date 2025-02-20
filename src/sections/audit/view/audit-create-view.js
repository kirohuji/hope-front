// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import AuditNewEditForm from '../audit-new-edit-form';

// ----------------------------------------------------------------------

export default function AuditCreateView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Create a new audit"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Audit',
            href: paths.dashboard.audit.root,
          },
          {
            name: 'New Audit',
          },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <AuditNewEditForm />
    </Container>
  );
}
