// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hook';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import BpmnNewEditForm from '../bpmn-new-edit-form';

// ----------------------------------------------------------------------

export default function BpmnEditView() {
  const settings = useSettingsContext();

  const params = useParams();

  const { id } = params;

  // const currentBpmn = _bpmns.find((bpmn) => bpmn.id === id);

  return (
    <Container
      maxWidth={settings.themeStretch ? false : 'lg'}
      sx={{ height: 'calc(100% - 200px)' }}
    >
      <CustomBreadcrumbs
        heading="Edit"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Bpmn',
            href: paths.dashboard.bpmn.root,
          },
          // { name: currentBpmn?.bpmnNumber },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      {/* <BpmnNewEditForm currentBpmn={currentBpmn} /> */}
    </Container>
  );
}
