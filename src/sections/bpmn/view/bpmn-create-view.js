// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import BpmnNewEditForm from '../bpmn-new-edit-form';

// ----------------------------------------------------------------------

export default function BpmnCreateView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Create a new bpmn"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Bpmn',
            href: paths.dashboard.bpmn.root,
          },
          {
            name: 'New Bpmn',
          },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <BpmnNewEditForm />
    </Container>
  );
}
