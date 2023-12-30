import { useState, useCallback, useEffect } from 'react';
// @mui
import { Stack, Container } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
// components
import { cloneDeep } from 'lodash';
import OrganizationalChart from 'src/sections/user/organization/organizational-chart';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
// routes
import { paths } from 'src/routes/paths';
// redux
import { useDispatch, useSelector } from 'src/redux/store';
import { getOrganizations } from 'src/redux/slices/role';
// hooks
import { useDebounce } from 'src/hooks/use-debounce';

// import { roleService } from 'src/composables/context-provider';
import OraginChangeViewButton from '../organization/organ-change-view-button';

export default function UserOrganizationView() {
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(false);

  const [maxRole, setMaxRole] = useState({});

  const { active } = useSelector((state) => state.scope);

  const { organizations } = useSelector((state) => state.role);

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
      {/* <Backdrop
        sx={{ background: '#fff', color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop> */}
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
          maxRole={maxRole}
          type={view}
          data={cloneDeep(organizations[0])}
          variant="group"
          lineHeight="64px"
          onFlash={onRefresh}
        />
      )}
    </Container>
  );
}
