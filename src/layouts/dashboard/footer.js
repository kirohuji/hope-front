import * as React from 'react';
// import { useRouter } from 'next/router';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Paper from '@mui/material/Paper';
import { Link } from 'react-router-dom';
// redux
import { useDispatch, useSelector } from 'src/redux/store';
import { updateBottomNavigationActionValue } from 'src/redux/slices/dashboard';
import { ICONS } from './config-navigation'

export default function DashboardFooter () {
  const dashboard = useSelector((state) => state.dashboard);
  const dispatch = useDispatch();
  return (
    <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100, background: 'none' }} elevation={5} className="bottom-navigation">
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
        {
          /**         <BottomNavigationAction label="工作台" icon={ICONS.kanban} /> */
        }
        <BottomNavigationAction label="聊天" icon={ICONS.chat} component={Link} to="/dashboard/chat"/>
        <BottomNavigationAction label="日程" icon={ICONS.user} component={Link} to="/dashboard/calendar"/>
        <BottomNavigationAction label="灵修" icon={ICONS.blog} component={Link} to="/dashboard/training/dashboard" />
      </BottomNavigation>
    </Paper>
  );
}