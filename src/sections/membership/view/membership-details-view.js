import { useState, useEffect, useCallback } from 'react';
// @mui
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import LoadingButton from '@mui/lab/LoadingButton';
// routes
import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hook';
// _mock
import { Divider, Stack, Backdrop, CircularProgress } from '@mui/material';
import Button from '@mui/material/Button';
import { useAuthContext } from 'src/auth/hooks';
// components
import Label from 'src/components/label';
import { useSettingsContext } from 'src/components/settings';
//
import { membershipService } from 'src/composables/context-provider';
// redux
import { useDispatch, useSelector } from 'src/redux/store';
import {
  getData,
  getParticipants,
  deleteParticipant,
  updateParticipantStatus,
  getParticipantsCount,
  addParticipants,
  updateDataPublishedStatus,
} from 'src/redux/slices/broadcast';
import { useSnackbar } from 'src/components/snackbar';
import MembershipContactsDialog from '../membership-contacts-dialog';
import MembershipDetailsBookers from '../membership-details-bookers';
import MembershipDetailsContent from '../membership-details-content';
import MembershipDetailsToolbar from '../membership-details-toolbar';

export const TOUR_DETAILS_TABS = [
  { value: 'content', label: '内容' },
  { value: 'participants', label: '参加者列表', auth: ['MembershipListPersonSignOrDelete'] },
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

export default function MembershipDetailsView() {
  const { enqueueSnackbar } = useSnackbar();
  const [openContacts, setOpenContacts] = useState(false);
  const { user } = useAuthContext();
  const { details } = useSelector((state) => state.membership);
  const [loading, setLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState(false);
  const dispatch = useDispatch();
  const handleOpenContacts = () => {
    setOpenContacts(true);
  };

  const handleCloseContacts = () => {
    setOpenContacts(false);
  };
  const settings = useSettingsContext();

  const params = useParams();

  const { id, selectedTab } = params;

  const [currentMembership, setCurrentMembership] = useState(null);

  const [publish, setPublish] = useState(currentMembership?.publish);

  const [currentTab, setCurrentTab] = useState('content');

  const handleChangePublish = useCallback((newValue) => {
    setPublish(newValue);
  }, []);

  const onRefresh = useCallback(
    async (target) => {
      if (!target) {
        dispatch(getParticipants(id));
        dispatch(getParticipantsCount(id));
        return;
      }
      switch (target.type) {
        case 'delete':
          dispatch(
            deleteParticipant({
              data: target.data,
              id,
            })
          );
          break;
        case 'add':
          dispatch(
            addParticipants({
              datas: target.datas,
              id,
            })
          );
          dispatch(getParticipantsCount(id));
          break;
        case 'signIn':
        case 'signOut':
          dispatch(
            updateParticipantStatus({
              data: target.data,
              id,
              status: target.type,
            })
          );
          break;
        default:
          dispatch(getParticipants(id));
          dispatch(getParticipantsCount(id));
          break;
      }
    },
    [dispatch, id]
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      if (currentTab === 'content') {
        dispatch(
          getData({
            id,
            user,
          })
        );
      } else {
        dispatch(getParticipants(id));
      }
      dispatch(getParticipantsCount(id));
      setLoading(false);
    } catch (error) {
      setLoading(false);
      enqueueSnackbar('获取数据失败,请重试');
    }
  }, [currentTab, dispatch, id, user, enqueueSnackbar]);

  const handleChangeTab = useCallback((event, newValue) => {
    setLoading(true);
    setCurrentTab(newValue);
  }, []);

  const handlePublish = useCallback(async () => {
    setButtonLoading(true);
    try {
      await membershipService.publish({
        membership_id: id,
      });
      dispatch(
        updateDataPublishedStatus({
          id,
          published: true,
        })
      );
      // refresh(id);
      setButtonLoading(false);
      enqueueSnackbar('发布成功');
    } catch (e) {
      setButtonLoading(false);
      enqueueSnackbar('发布失败');
    }
  }, [dispatch, enqueueSnackbar, id]);

  const handleCancelPublish = useCallback(async () => {
    try {
      setButtonLoading(true);
      await membershipService.unpublish({
        membership_id: id,
      });
      dispatch(
        updateDataPublishedStatus({
          id,
          published: false,
        })
      );
      enqueueSnackbar('取消发布成功');
      setButtonLoading(false);
    } catch (e) {
      enqueueSnackbar('取消发布失败');
      setButtonLoading(false);
    }
  }, [dispatch, enqueueSnackbar, id]);

  useEffect(() => {
    console.log('获取');
    if (id) {
      refresh(id);
    }
  }, [refresh, id]);

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
              <Label variant="filled">{details.count[id] || 0}</Label>
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
      <Backdrop
        sx={{ background: 'white', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <MembershipDetailsToolbar
        backLink={paths.dashboard.membership.root}
        editLink={paths.dashboard.membership.edit(`${details.byId[id]?._id}`)}
        liveLink="#"
        publish={publish || ''}
        onChangePublish={handleChangePublish}
        publishOptions={TOUR_PUBLISH_OPTIONS}
      />
      {renderTabs}
      {currentTab === 'content' && details.byId[id] && (
        <MembershipDetailsContent membership={details.byId[id]} />
      )}

      {currentTab === 'participants' && (
        <MembershipDetailsBookers
          participants={(details.participantsBy && details.participantsBy[id]) || []}
          onRefresh={onRefresh}
        />
      )}
      <Divider sx={{ m: 2 }} />
      <Stack direction="row" justifyContent="center" alignItems="center" spacing={2}>
        {details.byId[id]?.isAdmin && (
          <LoadingButton
            variant="contained"
            color="secondary"
            onClick={() => handleOpenContacts()}
            loading={loading}
          >
            添加参加者
          </LoadingButton>
        )}
        {details.byId[id]?.isAdmin && !details.byId[id]?.published && (
          <LoadingButton
            variant="contained"
            color="success"
            onClick={() => handlePublish()}
            loading={buttonLoading}
          >
            发布公告
          </LoadingButton>
        )}
        {details.byId[id]?.isAdmin && details.byId[id]?.published && (
          <LoadingButton
            variant="contained"
            color="error"
            onClick={() => handleCancelPublish()}
            loading={buttonLoading}
          >
            取消发布
          </LoadingButton>
        )}
      </Stack>

      {details.byId[id] && (
        <MembershipContactsDialog
          current={details.byId[id]}
          open={openContacts}
          onUpdateRefresh={onRefresh}
          onClose={handleCloseContacts}
        />
      )}
    </Container>
  );
}
