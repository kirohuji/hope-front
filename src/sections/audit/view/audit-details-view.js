// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// _mock
// import { _audits } from 'src/_mock';
// components
import { useParams } from 'src/routes/hook';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import AuditDetails from '../audit-details';

// ----------------------------------------------------------------------

export default function AuditDetailsView() {
  const settings = useSettingsContext();

  const params = useParams();

  const { id } = params;

  // const currentAudit = _audits.filter((audit) => audit.id === id)[0];

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        // heading={currentAudit?.auditNumber}
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
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {/* <AuditDetails audit={currentAudit} /> */}
    </Container>
  );
}
