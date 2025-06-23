import { m } from 'framer-motion';
import { useState, useCallback, useEffect, useRef } from 'react';
// @mui
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
// redux
import { useDispatch, useSelector } from 'src/redux/store';
import { getNotifications, getOverview } from 'src/redux/slices/notification';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { varHover } from 'src/components/animate';
//
import NotificationItem from './notification-item';

// ----------------------------------------------------------------------

const TABS = [
  {
    value: 'unread',
    label: '未读',
    count: 0,
  },
  {
    value: 'archived',
    label: '已读',
    count: 0,
  },
  {
    value: 'all',
    label: '全部',
    count: 0,
  },
];

// ----------------------------------------------------------------------

export default function NotificationsPopover() {
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [loading, setLoading] = useState(true);

  const notificationListRef = useRef(null);

  const [notificationLimit, setNotificationLimit] = useState(0);

  const dispatch = useDispatch();

  const drawer = useBoolean();

  const smUp = useResponsive('up', 'sm');

  const [currentTab, setCurrentTab] = useState('unread');

  const { data: notifications, overview } = useSelector((state) => state.notification);

  const totalUnRead = notifications.filter((item) => item?.isUnRead).length;

  const handleMarkAllAsRead = () => {};

  const onRefresh = useCallback(async () => {
    await dispatch(
      getNotifications(
        {
          isUnRead: currentTab === 'unread',
          isRemove: false,
        },
        notificationLimit
      )
    );
    setLoading(false);
  }, [currentTab, dispatch, notificationLimit]);

  const handleChangeTab = useCallback(
    async (event, newValue) => {
      setNotificationLimit(0);
      setCurrentTab(newValue);
      const selector = {
        isRemove: false,
      };
      switch (newValue) {
        case 'unread':
          dispatch(
            getNotifications(
              {
                isUnRead: true,
                ...selector,
              },
              0
            )
          );
          break;
        case 'archived':
          dispatch(
            getNotifications(
              {
                isUnRead: false,
                ...selector,
              },
              0
            )
          );
          break;
        default:
          dispatch(
            getNotifications(
              {
                ...selector,
              },
              0
            )
          );
      }
    },
    [dispatch]
  );
  
  const renderHead = (
    <Stack direction="row" alignItems="center" sx={{ py: 2, pl: 2.5, pr: 1, minHeight: 68 }} className='notification-popover'>
      <Typography variant="h6" sx={{ flexGrow: 1 }}>
        消息通知
      </Typography>

      {!!totalUnRead && (
        <Tooltip title="全都标记为已读">
          <IconButton color="primary" onClick={handleMarkAllAsRead}>
            <Iconify icon="eva:done-all-fill" />
          </IconButton>
        </Tooltip>
      )}

      {!smUp && (
        <IconButton onClick={drawer.onFalse}>
          <Iconify icon="mingcute:close-line" />
        </IconButton>
      )}
    </Stack>
  );

  const renderTabs = (
    <Tabs value={currentTab} onChange={handleChangeTab}>
      {TABS.map((tab) => (
        <Tab
          key={tab.value}
          iconPosition="end"
          value={tab.value}
          label={tab.label}
          icon={
            <Label
              variant={((tab.value === 'all' || tab.value === currentTab) && 'filled') || 'soft'}
              color={
                (tab.value === 'unread' && 'info') ||
                (tab.value === 'archived' && 'success') ||
                'default'
              }
            >
              {overview[tab.value] || 0}
            </Label>
          }
          sx={{
            '&:not(:last-of-type)': {
              mr: 3,
            },
          }}
        />
      ))}
    </Tabs>
  );

  const renderList = (
    <Scrollbar ref={notificationListRef}>
      <List disablePadding>
        {notifications.map(
          (notification) =>
            notification && (
              <NotificationItem
                key={notification._id}
                notification={notification}
                onRefresh={() => {
                  onRefresh();
                  dispatch(getOverview());
                }}
              />
            )
        )}
      </List>
    </Scrollbar>
  );

  useEffect(() => {
    if (notifications.length && notificationListRef?.current) {
      const handleScroll = () => {
        if (
          scrollNode.scrollTop + scrollNode.clientHeight >= scrollNode.scrollHeight &&
          !loadingHistory
        ) {
          setLoadingHistory(true);
          setNotificationLimit(notificationLimit + 20);
          onRefresh(notifications.length).then(() => {
            setLoadingHistory(false);
          });
        }
      };

      const scrollNode = notificationListRef?.current;
      scrollNode.addEventListener('scroll', handleScroll);
      return () => {
        scrollNode.removeEventListener('scroll', handleScroll);
      };
    }
    return () => {};

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifications, onRefresh, setNotificationLimit]);

  return (
    <>
      <IconButton
        component={m.button}
        whileTap="tap"
        whileHover="hover"
        variants={varHover(1.05)}
        color={drawer.value ? 'primary' : 'default'}
        onClick={() => {
          setNotificationLimit(0);
          drawer.onTrue();
          dispatch(getOverview());
          dispatch(
            getNotifications(
              {
                isUnRead: currentTab === 'unread',
                isRemove: false,
              },
              0
            )
          );
        }}
      >
        <Badge badgeContent={overview.unread} color="error">
          <Iconify icon="solar:bell-bing-bold-duotone" width={24} />
        </Badge>
      </IconButton>

      <Drawer
        open={drawer.value}
        onClose={drawer.onFalse}
        anchor="right"
        slotProps={{
          backdrop: { invisible: true },
        }}
        PaperProps={{
          sx: { width: 1, maxWidth: 420 },
        }}
      >
        {renderHead}

        <Divider />

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ pl: 2.5, pr: 1 }}
        >
          {renderTabs}
          <IconButton onClick={handleMarkAllAsRead}>
            <Iconify icon="solar:settings-bold-duotone" />
          </IconButton>
        </Stack>

        <Divider />

        {renderList}
        {!!notifications.length && false && (
          <Box sx={{ p: 1 }}>
            <Button fullWidth size="large">
              查看全部
            </Button>
          </Box>
        )}
      </Drawer>
    </>
  );
}
