// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// _mock
// import { _bpmns } from 'src/_mock';
// components
import { useParams } from 'src/routes/hook';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import BpmnDetails from '../bpmn-details';

// ----------------------------------------------------------------------

export default function BpmnDetailsView() {
  const settings = useSettingsContext();

  const params = useParams();

  const { id } = params;

  // const currentBpmn = _bpmns.filter((bpmn) => bpmn.id === id)[0];

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        // heading={currentBpmn?.bpmnNumber}
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
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {/* <BpmnDetails bpmn={currentBpmn} /> */}
    </Container>
  );
}
