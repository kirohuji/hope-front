import * as React from 'react';
// import { useRouter } from 'next/router';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Paper from '@mui/material/Paper';
import { Link } from 'react-router-dom';
// redux
import { useDispatch, useSelector } from 'src/redux/store';
import { updateBottomNavigationActionValue } from 'src/redux/slices/dashboard';
import { usePathname } from 'src/routes/hook';
import _ from 'lodash';
// auth
import { useAuthContext } from 'src/auth/hooks';
import { ICONS } from './config-navigation';

const navigations = [
  {
    label: '聊天',
    icon: ICONS.chat,
    to: '/dashboard/chat',
    auth: ['Chat'],
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
    label: '灵修',
    icon: ICONS.blog,
    to: '/dashboard/training/dashboard',
  },
];
export default function DashboardFooter() {
  const dashboard = useSelector((state) => state.dashboard);
  const dispatch = useDispatch();
  const pathname = usePathname();
  const { permissions, isAdmin } = useAuthContext();
  React.useEffect(() => {
    const index = _.findIndex(navigations, ['to', pathname]);
    if (index !== -1) {
      dispatch(updateBottomNavigationActionValue(index));
    } else {
      dispatch(updateBottomNavigationActionValue(0));
    }
  }, [dispatch, pathname]);

  const checkAuth = (nav) => {
    if (!nav.auth) {
      return <BottomNavigationAction {...nav} component={Link} key={nav.to} />;
    }
    if (_.intersection(permissions, nav.auth).length > 0 || isAdmin) {
      return <BottomNavigationAction {...nav} component={Link} key={nav.to} />;
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
        showLabels
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
        {navigations.map((navigation) => checkAuth(navigation))}
      </BottomNavigation>
    </Paper>
  );
}
