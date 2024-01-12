import { useCallback, useEffect, useState } from 'react';
// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// components
import { useSnackbar } from 'src/components/snackbar';
import { useParams } from 'src/routes/hook';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import { versionService } from 'src/composables/context-provider';
import VersionNewEditForm from '../version-new-edit-form';

// ----------------------------------------------------------------------

export default function VersionEditView() {
  const { enqueueSnackbar } = useSnackbar();
  const settings = useSettingsContext();

  const params = useParams();

  const [currentVersion, setCurrentVersion] = useState(null);

  const { id } = params;

  const getCurrentVersion = useCallback(
    async (selector = {}, options = {}) => {
      try {
        const response = await versionService.get({
          _id: id,
        });
        setCurrentVersion(response);
      } catch (error) {
        enqueueSnackbar(error.message);
      }
    },
    [id, setCurrentVersion, enqueueSnackbar]
  );

  useEffect(() => {
    getCurrentVersion();
  }, [getCurrentVersion]);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="编辑"
        links={[
          {
            name: '作用域',
            href: paths.dashboard.job.root,
          },
          { name: currentVersion?.label },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      {!!currentVersion && <VersionNewEditForm currentVersion={currentVersion} />}
    </Container>
  );
}
