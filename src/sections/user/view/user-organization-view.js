import { useState, useCallback, useEffect } from 'react';
// @mui
import { Stack, Container } from '@mui/material';
// components
import { compact, find } from 'lodash'
import OrganizationalChart from 'src/sections/user/organization/organizational-chart';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
// _mock
// import _mock from 'src/_mock';
// routes
import { paths } from 'src/routes/paths';
// redux
import { useSelector } from 'src/redux/store';

import { roleService } from 'src/composables/context-provider';
import OraginChangeViewButton from '../organization/oragin-change-view-button';

function serverArray (list, parent, data, permissions, maxRole) {
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < list.length; i++) {
    if (list[i]&&list[i].value) {
      if (list[i] && list[i].children && compact(list[i].children).length) {
        serverArray(list[i].children.map(item => find(data, ["_id", item._id])), list[i], data, permissions, maxRole);
      } else {
        list[i].children = undefined;
      }
      if (parent && parent.children) {
        if (list[i]) {
          parent.children[i] = {
            name: list[i].label,
            group: list[i].scope,
            role: list[i].value,
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
function getTree (data, maxRole) {
  const permissions = maxRole && maxRole.children ? maxRole.children.map(item=>item._id) : [];
  const list = data.map(item => ({
    name: item.label,
    group: item.scope,
    role: item.value,
    ...item
  }))
  const root = list.filter((item) => item.isScope).map(item => ({
    name: item.label,
    group: item.scope,
    role: item.value,
    ...item,
    children: list.filter(d => d.root && !d.isScope)
  }))
  serverArray(root, null, list, permissions, maxRole);
  console.log('a-root', root)
  return root;
}

export default function UserOrganizationView () {
  const [org, setOrg] = useState([]);
  const [maxRole, setMaxRole] = useState({});
  const { active } = useSelector((state) => state.scope);
  const [view, setView] = useState('org');
  const { themeStretch } = useSettingsContext();
  const handleChangeView = (event, newView) => {
    if (newView !== null) {
      setView(newView);
    }
  };
  const getData = useCallback(async () => {
    const response = await roleService.getRoleWith({
      selector: {
        scope: active._id,
        type: view,
      },
    });
    const getMaxRole = await roleService.getMaxRole({
      roles: response.map(item => item._id)
    })
    const currentScope = {
      ...active,
      root: true,
      role: active.value,
      scope: active.id,
      isScope: true,
      children: [],
    }
    response.push(currentScope);
    setMaxRole(getMaxRole)
    setOrg(getTree(response, getMaxRole))
  }, [active, view, setOrg, setMaxRole]);


  useEffect(() => {
    getData();
  }, [getData]);

  return (
    <Container maxWidth={themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="组织/角色架构"
        links={[
          // { name: 'Dashboard', href: PATH_DASHBOARD.root },
          { name: '组织/角色架构', href: paths.dashboard.user.organization },
        ]}
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
      {org.length && <OrganizationalChart maxRole={maxRole} type={view} data={org[0]} variant="group" lineHeight="64px" onFlash={getData} />}
    </Container>
  )
}
