import { useCallback, useEffect, useState } from 'react';
// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// _mock
import { _jobs } from 'src/_mock';
// components
import { useSnackbar } from 'src/components/snackbar';
import { useParams } from 'src/routes/hook';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import { scopeService } from 'src/composables/context-provider';
import ScopeNewEditForm from '../scope-new-edit-form';

// ----------------------------------------------------------------------

export default function ScopeEditView () {
  const { enqueueSnackbar } = useSnackbar();
  const settings = useSettingsContext();

  const params = useParams();

  const [currentScope, setCurrentScope] = useState(null);

  const { id } = params;

  const getCurrentScope = useCallback(async (selector = {}, options = {}) => {
    try {
      const response = await scopeService.get({
        _id: id
      })
      setCurrentScope(response);
    } catch (error) {
      enqueueSnackbar(error.message);
    }
  }, [id, setCurrentScope, enqueueSnackbar]);

  useEffect(() => {
    getCurrentScope()
  }, [getCurrentScope]);
  // const currentScope = _jobs.find((job) => job.id === id);

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

      {!!currentScope && <ScopeNewEditForm currentScope={currentScope} />}
    </Container>
  );
}
