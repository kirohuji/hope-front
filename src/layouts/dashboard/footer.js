/* eslint-disable import/no-extraneous-dependencies */
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
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
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';
import { ICONS } from './config-navigation';
import { clearAllNotifications } from 'src/cap/push-notification';
const navigation = [
  {
    label: '聊天',
    icon: ICONS.chat2,
    to: '/dashboard/chat',
    auth: ['Chat'],
  },
  // {
  //   label: '文件',
  //   icon: ICONS.file,
  //   to: '/dashboard/file-manager',
  //   auth: ['FileManager'],
  // },
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
  // {
  //   label: '阅读',
  //   icon: ICONS.blog,
  //   to: '/dashboard/training/dashboard',
  // },
];

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: 12,
    top: 5,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: '0 4px',
  },
}));

export default function DashboardFooter() {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  const dashboard = useSelector((state) => state.dashboard);

  const chat = useSelector((state) => state.chat);

  const dispatch = useDispatch();

  const pathname = usePathname();

  const { permissions, isAdmin } = useAuthContext();

  React.useEffect(() => {
    const index = _.findIndex(navigation, ['to', pathname]);
    if (index !== -1) {
      dispatch(updateBottomNavigationActionValue(index));
    } else {
      dispatch(updateBottomNavigationActionValue(0));
    }
    if (Capacitor.getPlatform() === 'ios' || Capacitor.getPlatform() === 'android') {
      console.log('执行监听');
      Keyboard.addListener('keyboardWillShow', () => {
        console.log('keyboardWillShow');
        setIsKeyboardVisible(true);
      });

      Keyboard.addListener('keyboardWillHide', () => {
        setIsKeyboardVisible(false);
      });

      return () => {
        Keyboard.removeAllListeners();
      };
    }
    return () => {};
  }, [dispatch, pathname]);

  React.useEffect(() => {
    if (Capacitor.getPlatform() === 'ios' || Capacitor.getPlatform() === 'android') {
      if (chat.conversations.unreadCount === 0) {
        clearAllNotifications();
      }
    }
  }, [chat.conversations.unreadCount]);
  const checkAuth = (nav, index) => {
    if (!nav.auth) {
      return (
        <BottomNavigationAction {...nav} component={Link} key={nav.to} sx={{ pt: 0, opacity: 1 }} />
      );
    }
    if (_.intersection(permissions, nav.auth).length > 0 || isAdmin) {
      if (nav.auth.includes('Chat')) {
        return (
          <BottomNavigationAction
            {...nav}
            key={nav.to}
            component={Link}
            icon={
              <StyledBadge
                color="error"
                overlap="circular"
                badgeContent={chat.conversations.unreadCount}
              >
                {nav.icon}
              </StyledBadge>
            }
            sx={{ pt: 0, opacity: 1 }}
          />
        );
      }
      return (
        <BottomNavigationAction {...nav} component={Link} key={nav.to} sx={{ pt: 0, opacity: 1 }} />
      );
    }
    return null;
  };

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: isKeyboardVisible ? '-100px' : 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: 'none',
      }}
      elevation={5}
      className="bottom-navigation"
    >
      <BottomNavigation
        id="bottom-navigation"
        value={dashboard.bottomNavigationActionValue}
        onChange={(event, newValue) => {
          dispatch(updateBottomNavigationActionValue(newValue));
        }}
      >
        {/**
                <BottomNavigationAction label="聊天" icon={ICONS.chat} />
               <BottomNavigationAction label="联系人" icon={ICONS.mail} />
              <BottomNavigationAction label="动态" icon={ICONS.booking} onClick={() => router.push(PATH_DASHBOARD.active.root)} />
         */}
        {/**         <BottomNavigationAction label="工作台" icon={ICONS.kanban} /> */}
        {/* <BottomNavigationAction label="聊天" icon={ICONS.chat} component={Link} to="/dashboard/chat"/>
        <BottomNavigationAction label="文件" icon={ICONS.file} component={Link} to="/dashboard/file-manager"/> */}
        {navigation.map((navigation, index) => checkAuth(navigation, index))}
      </BottomNavigation>
    </Paper>
  );
}
