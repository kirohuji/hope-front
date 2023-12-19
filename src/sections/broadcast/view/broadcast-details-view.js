import { useState, useEffect, useCallback } from 'react';
// @mui
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hook';
// _mock
import { Divider, Stack } from '@mui/material';
import Button from '@mui/material/Button';
import { useAuthContext } from 'src/auth/hooks';
// components
import Label from 'src/components/label';
import { useSettingsContext } from 'src/components/settings';
//
import { broadcastService, userService } from 'src/composables/context-provider';
import _ from 'lodash';
// redux
import { useSnackbar } from 'src/components/snackbar';
import BoradcastContactsDialog from '../boradcast-contacts-dialog';
import BroadcastDetailsBookers from '../broadcast-details-bookers';
import BroadcastDetailsContent from '../broadcast-details-content';
import BroadcastDetailsToolbar from '../broadcast-details-toolbar';

export const TOUR_DETAILS_TABS = [
  { value: 'content', label: '内容' },
  { value: 'participants', label: '参加者列表' },
];

export const TOUR_PUBLISH_OPTIONS = [
  {
    value: 'published',
    label: 'Published',
  },
  {
    value: 'draft',
    label: 'Draft',
  },
];
// ----------------------------------------------------------------------

export default function BroadcastDetailsView () {
  const { enqueueSnackbar } = useSnackbar();
  const [participants, setParticipants] = useState([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [participantsCount, setParticipantsCount] = useState([])
  const [openContacts, setOpenContacts] = useState(false);
  const { user } = useAuthContext();
  const handleOpenContacts = () => {
    setOpenContacts(true);
  };

  const handleCloseContacts = () => {
    setOpenContacts(false);
    onRefresh()
  };
  const settings = useSettingsContext();

  const params = useParams();

  const { id, selectedTab } = params;

  const getParticipants = useCallback(async () => {
    try {
      const response = await broadcastService.getUsers({
        _id: id
      })
      setParticipants(response)
    } catch (error) {
      console.log(error)
    }
  }, [id])

  const [currentBroadcast, setCurrentBroadcast] = useState(null)

  const [publish, setPublish] = useState(currentBroadcast?.publish);

  const [currentTab, setCurrentTab] = useState('content');

  const handleChangeTab = useCallback((event, newValue) => {
    setCurrentTab(newValue);
  }, []);

  const handleChangePublish = useCallback((newValue) => {
    setPublish(newValue);
  }, []);

  const onRefresh = useCallback(async () => {
    getParticipants()
    const getUsersCount = await broadcastService.getUsersCount({
      _id: id
    })
    setParticipantsCount(getUsersCount);
  }, [getParticipants, id])

  const getData = useCallback(async () => {
    try {
      if (currentTab === 'content') {
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
                username: 1,
                phoneNumber: 1
              }
            }
          )
          response.leaders = leaders.data;
        }
        setIsAdmin(_.find(response.leaders, ["_id", user._id]))
        setCurrentBroadcast(response)
      } else {
        getParticipants()
      }
      const getUsersCount = await broadcastService.getUsersCount({
        _id: id
      })
      setParticipantsCount(getUsersCount);
    } catch (error) {
      console.log(error)
    }
  }, [id, currentTab, setCurrentBroadcast, user, getParticipants])

  const handlePublish = useCallback(async () => {
    await broadcastService.publish({
      broadcast_id: id
    })
    getData(id)
    enqueueSnackbar('发布成功');
  }, [enqueueSnackbar,getData, id])

  const handleCancelPublish = useCallback(async () => {
    await broadcastService.unpublish({
      broadcast_id: id
    })
    getData(id)
    enqueueSnackbar('取消发布成功');
  }, [enqueueSnackbar, getData,id])

  useEffect(() => {
    console.log('获取')
    if (id) {
      getData(id)
    }
  }, [getData, id]);

  const renderTabs = (
    <Tabs
      value={currentTab}
      onChange={handleChangeTab}
      sx={{
        mb: { xs: 3, md: 5 },
      }}
    >
      {TOUR_DETAILS_TABS.map((tab) => (
        <Tab
          key={tab.value}
          iconPosition="end"
          value={tab.value}
          label={tab.label}
          icon={
            tab.value === 'participants' ? (
              <Label variant="filled">{participantsCount || 0}</Label>
            ) : (
              ''
            )
          }
        />
      ))}
    </Tabs>
  );

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <BroadcastDetailsToolbar
        backLink={paths.dashboard.broadcast.root}
        editLink={paths.dashboard.broadcast.edit(`${currentBroadcast?._id}`)}
        liveLink="#"
        publish={publish || ''}
        onChangePublish={handleChangePublish}
        publishOptions={TOUR_PUBLISH_OPTIONS}
      />
      {renderTabs}

      {currentTab === 'content' && currentBroadcast && <BroadcastDetailsContent broadcast={currentBroadcast} />}

      {currentTab === 'participants' && <BroadcastDetailsBookers participants={participants} onRefresh={onRefresh} />}
      <Divider sx={{ m: 2 }} />
      <Stack direction="row" justifyContent="center" alignItems="center" spacing={2}>
        <Button variant="contained" color="primary">
          联系负责人
        </Button>
        {
          isAdmin && <Button variant="contained" color="secondary" onClick={() => handleOpenContacts()}>
            添加参加者
          </Button>
        }
        {
          isAdmin && !currentBroadcast.published && <Button variant="contained" color="success" onClick={() => handlePublish()}>
            发布公告
          </Button>
        }
        {
          isAdmin && currentBroadcast.published && <Button variant="contained" color="success" onClick={() => handleCancelPublish()}>
            取消发布
          </Button>
        }
      </Stack>
      {
        currentBroadcast && <BoradcastContactsDialog
          current={currentBroadcast}
          open={openContacts}
          onClose={handleCloseContacts}
        />
      }
    </Container>
  );
}
