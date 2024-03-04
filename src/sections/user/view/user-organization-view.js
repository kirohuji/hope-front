import { useState, useCallback, useEffect } from 'react';
// @mui
import { Stack, Container } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
// routes
import { paths } from 'src/routes/paths';
// redux
import { useDispatch, useSelector } from 'src/redux/store';
import { getOrganizations, getPermissions } from 'src/redux/slices/role';
// hooks
import { useDebounce } from 'src/hooks/use-debounce';
// components
import { cloneDeep } from 'lodash';
import OrganizationalChart from 'src/sections/user/organization/organizational-chart';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import OraginChangeViewButton from '../organization/organ-change-view-button';

export default function UserOrganizationView() {
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(false);

  const { active } = useSelector((state) => state.scope);

  const { organizations, permissions } = useSelector((state) => state.role);

  const [view, setView] = useState('org');

  const debouncedView = useDebounce(view, 1000);

  const { themeStretch } = useSettingsContext();

  const handleChangeView = (event, newView) => {
    if (newView !== null) {
      setIsLoading(true);
      setView(newView);
    }
  };

  const onRefresh = useCallback(async () => {
    setIsLoading(true);
    await dispatch(
      getOrganizations({
        selector: {
          scope: active._id,
          type: debouncedView,
        },
      })
    );
    if (debouncedView === 'role') {
      await dispatch(
        getPermissions({
          selector: {
            type: 'permission',
          },
        })
      );
    }
    setIsLoading(false);
  }, [active._id, dispatch, debouncedView]);

  useEffect(() => {
    onRefresh();
  }, [onRefresh]);

  return (
    <Container maxWidth={themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="组织/角色架构"
        links={[{ name: '组织/角色架构', href: paths.dashboard.user.organization }]}
      />
      <Stack
        spacing={2.5}
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ xs: 'flex-end', md: 'center' }}
        justifyContent="space-between"
        sx={{ mb: 5 }}
      >
        <OraginChangeViewButton value={view} onChange={handleChangeView} />
      </Stack>
      {isLoading && (
        <Box
          sx={{
            zIndex: 10,
            backgroundColor: '#ffffffc4',
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <CircularProgress />
        </Box>
      )}
      {!!organizations.length && !isLoading && (
        <OrganizationalChart
          type={view}
          permissions={permissions}
          data={cloneDeep(organizations[0])}
          variant="group"
          lineHeight="64px"
          onFlash={onRefresh}
        />
      )}
    </Container>
  );
}
