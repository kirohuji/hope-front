import { useState, useCallback, useEffect } from 'react';
// @mui
import { Stack, Container } from '@mui/material';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
// components
import { compact, find, cloneDeep } from 'lodash'
import OrganizationalChart from 'src/sections/user/organization/organizational-chart';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
// routes
import { paths } from 'src/routes/paths';
// redux
import { useDispatch, useSelector } from 'src/redux/store';
import { getOrganizations } from 'src/redux/slices/role';


// import { roleService } from 'src/composables/context-provider';
import OraginChangeViewButton from '../organization/organ-change-view-button';

function serverArray(list, parent, data, permissions, maxRole) {
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < list.length; i++) {
    if (list[i] && list[i].value) {
      if (list[i] && list[i].children && compact(list[i].children).length) {
        serverArray(list[i].children.map(item => find(data, ["_id", item._id])), list[i], data, permissions, maxRole);
      } else {
        list[i].children = undefined;
      }
      if (parent && parent.children) {
        if (list[i]) {
          parent.children[i] = {
            isMaxRole: maxRole._id === list[i]._id,
            disabled: permissions.indexOf(list[i]._id) === -1,
            ...list[i],
          };
        } else {
          delete parent.children[i];
        }
      }
    }
  }
}
function getTree(data, maxRole) {
  const permissions = maxRole && maxRole.children ? maxRole.children.map(item => item._id) : [];
  const root = data.filter((item) => item.isScope).map(item => ({
    ...item,
    children: data.filter(d => d.root && !d.isScope)
  }))
  serverArray(root, null, data, permissions, maxRole);
  return root;
}

export default function UserOrganizationView() {

  const dispatch = useDispatch();

  const [org, setOrg] = useState([]);

  const [isLoading, setIsLoading] = useState(false);

  const [maxRole, setMaxRole] = useState({});

  const { active } = useSelector((state) => state.scope);

  const { organizations } = useSelector((state) => state.role);

  const [view, setView] = useState('org');

  const { themeStretch } = useSettingsContext();

  const handleChangeView = (event, newView) => {
    if (newView !== null) {
      setView(newView);
    }
  };

  const onRefresh = useCallback(async () => {
    setIsLoading(true)
    await dispatch(getOrganizations({
      selector: {
        scope: active._id,
        type: view,
      }
    }))
    setIsLoading(false)
  }, [active._id, dispatch, view])

  useEffect(() => {
    onRefresh();
  }, [onRefresh]);

  return (
    <Container maxWidth={themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="组织/角色架构"
        links={[
          { name: '组织/角色架构', href: paths.dashboard.user.organization },
        ]}
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
      {
        isLoading && <Box sx={{
          zIndex: 10,
          backgroundColor: "#ffffffc4",
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}>
          <CircularProgress />
        </Box>
      }
      {!!organizations.length && !isLoading &&
        <OrganizationalChart
          maxRole={maxRole}
          type={view}
          data={cloneDeep(organizations[0])}
          variant="group"
          lineHeight="64px"
          onFlash={onRefresh} />}
    </Container>
  )
}
