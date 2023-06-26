// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// _mock
import { _jobs } from 'src/_mock';
// components
import { useParams } from 'src/routes/hook';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import ScopeNewEditForm from '../scope-new-edit-form';

// ----------------------------------------------------------------------

export default function ScopeEditView() {
  const settings = useSettingsContext();

  const params = useParams();

  const { id } = params;

  const currentScope = _jobs.find((job) => job.id === id);

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
            name: 'Scope',
            href: paths.dashboard.job.root,
          },
          { name: currentScope?.title },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <ScopeNewEditForm currentScope={currentScope} />
    </Container>
  );
}
