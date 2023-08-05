import { Helmet } from 'react-helmet-async';
import { useState, useCallback, useEffect } from 'react';
// @mui
import { Stack, Container } from '@mui/material';
// components
import { find } from 'lodash'
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


function getTree (data) {
  const root = data
    .filter((item) => item.root).map(item => ({
      name: item.label,
      group: item.scope,
      role: item.value,
      // avatar: _mock.image.avatar(1),
      ...item,
    }))
  const tree = [];
  function serverArray (list, parent) {
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < list.length; i++) {
      if (list[i]) {
        const item = find(data, ['_id', list[i]._id]);
        if (item && item.children) {
          if (item.children.length) {
            serverArray(item.children, item);
          } else {
            delete item.children;
          }
        }
        if (parent && parent.children) {
          if (item) {
            parent.children[i] = {
              name: item.label,
              group: item.scope,
              role: item.value,
              // avatar: _mock.image.avatar(i),
              ...item,
            };
          } else {
            delete parent.children[i];
          }
        }
      }
    }
    return tree;
  }
  serverArray(root, null);
  return root;
}

export default function UserOrganizationView () {
  const [org, setOrg] = useState([]);
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
    setOrg(response)
    console.log(getTree(response))
  }, [active,view]);


  useEffect(() => {
    getData();
  }, [getData]);

  return (
    <>
      <Helmet>
        <title> 组织/角色架构 | Hope Family</title>
      </Helmet>
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
        {view === 'org' ?
          (org.length && <OrganizationalChart type={view} data={getTree(org)[0]} variant="group" lineHeight="64px" onFlash={getData} />) :
          (org.length && <OrganizationalChart type={view} data={getTree(org)[0]} variant="group" lineHeight="64px" onFlash={getData} />)

        }

      </Container>
    </>

  )
}
