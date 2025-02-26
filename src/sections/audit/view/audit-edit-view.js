// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hook';
// _mock
// import { _audits } from 'src/_mock';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import AuditNewEditForm from '../audit-new-edit-form';

// ----------------------------------------------------------------------

export default function AuditEditView() {
  const settings = useSettingsContext();

  const params = useParams();

  const { id } = params;

  // const currentAudit = _audits.find((audit) => audit.id === id);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Edit"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Audit',
            href: paths.dashboard.audit.root,
          },
          // { name: currentAudit?.auditNumber },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      {/* <AuditNewEditForm currentAudit={currentAudit} /> */}
    </Container>
  );
}
