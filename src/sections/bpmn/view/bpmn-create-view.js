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
    <Container maxWidth={settings.themeStretch ? false : 'xl'} sx={{ height: 'calc(100% - 10px)' }}>
      {/* <CustomBreadcrumbs
        heading="创建一个流程图"
        links={[
          {
            name: '',
            href: paths.dashboard.root,
          },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      /> */}

      <BpmnNewEditForm currentBpmn={{}} backLink={paths.dashboard.bpmn.root} />
    </Container>
  );
}
