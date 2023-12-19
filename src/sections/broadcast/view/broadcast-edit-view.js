import { useState, useEffect, useCallback } from 'react';
// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// _mock
import { _tours } from 'src/_mock';
// components
import { useParams } from 'src/routes/hook';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import { broadcastService, userService } from 'src/composables/context-provider';
import BroadcastNewEditForm from '../broadcast-new-edit-form';


// ----------------------------------------------------------------------

export default function BroadcastEditView() {
  const settings = useSettingsContext();

  const params = useParams();

  const [currentBroadcast, setCurrentBroadcast] = useState(null)

  const { id } = params;

  const getData = useCallback(async () => {
    try {
      const response = await broadcastService.get({
        _id: id
      })
      if(response?.leaders){
        const leaders = await userService.paginationByProfile(
          {
            _id: {
              $in: response.leaders
            }
          },
          {
            fields: {
              photoURL: 1,
              username: 1
            }
          }
        )
        response.leaders = leaders.data;
      }
      setCurrentBroadcast(response)
    } catch (error) {
      console.log(error)
    }
  }, [id, setCurrentBroadcast])

  useEffect(() => {
    if (id) {
      getData(id)
    }
  }, [getData, id]);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="编辑"
        links={[
          // {
          //   name: 'Dashboard',
          //   href: paths.dashboard.root,
          // },
          {
            name: '活动通知',
            href: paths.dashboard.broadcast.root,
          },
          { name: currentBroadcast?.label },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <BroadcastNewEditForm currentBroadcast={currentBroadcast} />
    </Container>
  );
}
