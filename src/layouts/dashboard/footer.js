import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { styled } from '@mui/material/styles';
import BottomNavigation from '@mui/material/BottomNavigation';
import Badge from '@mui/material/Badge';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Paper from '@mui/material/Paper';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'src/redux/store';
import { updateBottomNavigationActionValue } from 'src/redux/slices/dashboard';
import { usePathname } from 'src/routes/hook';
import _ from 'lodash';
import { useAuthContext } from 'src/auth/hooks';
import { ICONS } from './config-navigation';

const navigations = [
  {
    label: '聊天',
    icon: ICONS.chat2,
    to: '/dashboard/chat',
    auth: ['Chat'],
  },
  {
    label: '文件',
    icon: ICONS.file,
    to: '/dashboard/file-manager',
  },
  {
    label: '活动',
    icon: ICONS.tour,
    to: '/dashboard/broadcast',
  },
  {
    label: '日程',
    icon: ICONS.user,
    to: '/dashboard/calendar',
  },
  {
    label: '阅读',
    icon: ICONS.blog,
    to: '/dashboard/training/dashboard',
  },
];

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: 12,
    top: 5,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: '0 4px',
  },
}));

const NavigationItem = ({ nav, unreadCount }) => (
  <BottomNavigationAction
    {...nav}
    component={Link}
    key={nav.to}
    icon={
      <StyledBadge color="error" overlap="circular" badgeContent={unreadCount}>
        {nav.icon}
      </StyledBadge>
    }
    sx={{ pt: 0, opacity: 1 }}
  />
);

NavigationItem.propTypes = {
  nav: PropTypes.object,
  unreadCount: PropTypes.number,
};

export default function DashboardFooter() {
  const dispatch = useDispatch();
  const dashboard = useSelector((state) => state.dashboard);
  const chat = useSelector((state) => state.chat);
  const pathname = usePathname();
  const { permissions, isAdmin } = useAuthContext();

  useEffect(() => {
    const index = _.findIndex(navigations, ['to', pathname]);
    dispatch(updateBottomNavigationActionValue(index !== -1 ? index : 0));
  }, [dispatch, pathname]);

  const checkAuth = (nav, index) => {
    if (!nav.auth || _.intersection(permissions, nav.auth).length > 0 || isAdmin) {
      return <NavigationItem nav={nav} unreadCount={chat.conversations.unreadCount} />;
    }
    return null;
  };
  return (
    <Paper
      sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100, background: 'none' }}
      elevation={5}
      className="bottom-navigation"
    >
      <BottomNavigation
        value={dashboard.bottomNavigationActionValue}
        onChange={(event, newValue) => {
          dispatch(updateBottomNavigationActionValue(newValue));
        }}
      >
        {navigations.map((navigation, index) => checkAuth(navigation, index))}
      </BottomNavigation>
    </Paper>
  );
}
