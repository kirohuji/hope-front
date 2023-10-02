import { m } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
// @mui
import Badge from '@mui/material/Badge';
import Avatar from '@mui/material/Avatar';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Tabs from '@mui/material/Tabs';
import Divider from '@mui/material/Divider';
import Tab from '@mui/material/Tab';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';

// utils
import { fToNow } from 'src/utils/format-time';
// components
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { varHover } from 'src/components/animate';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

// redux
import { useDispatch, useSelector } from 'src/redux/store';
import { getContacts, getOrganizations } from 'src/redux/slices/chat';
import _ from 'lodash';

// ----------------------------------------------------------------------

const TABS = [
  {
    value: 'contacts',
    label: ' 联系人',
    count: 0,
  },
  {
    value: 'organizations',
    label: '组织架构',
    count: 0,
  },
];

export default function ContactsPopover () {
  const dispatch = useDispatch();

  const [currentTab, setCurrentTab] = useState('contacts');

  const { contacts, organizations } = useSelector((state) => state.chat);

  const [currentOrganization, setCurrentOrganization] = useState([]);

  const { active } = useSelector((state) => state.scope);

  const [levels, setLevels] = useState([]);

  const handleChangeTab = useCallback((event, newValue) => {
    setCurrentTab(newValue);
  }, []);
  const popover = usePopover();

  useEffect(() => {
    if (currentTab === "contacts") {
      dispatch(getContacts());
    } else {
      dispatch(getOrganizations(active._id));
      setLevels([])
      setCurrentOrganization([])
    }
  }, [dispatch, setCurrentOrganization, currentTab, active._id]);

  const onChildren = (organization) => {
    if (organization.children) {
      const level = {
        name: organization.label,
        to: organization._id,
      }
      levels.push(level);
      setCurrentOrganization([...organization.children, ...organization.users.map(item => ({
        name: item.account.username,
        photoURL: item.profile.photoURL
      }))])
      setLevels(levels)
    }
  }
  const onGoTo = async (level) => {
    let index = 0;
    const length = _.findIndex(levels, ["to", level.to])
    let isChildren = false;
    let currentOrganizations = organizations
    const levels2 = []
    while (index < length) {
      isChildren = true;
      const currentLevel = levels[index];
      currentOrganizations = _.find(currentOrganizations, ["_id", currentLevel.to]);
      index += 1;
      levels2.push(currentLevel)
    }
    if (isChildren) {
      await setCurrentOrganization([...currentOrganizations.children, ...currentOrganizations.users.map(item => ({
        _id: item.account._id,
        name: item.account.username,
        photoURL: item.profile.photoURL
      }))]);
    } else {
      await setCurrentOrganization(currentOrganizations);
    }
    setLevels(levels2);
  }

  const renderTabs = (
    <Tabs value={currentTab} onChange={handleChangeTab}>
      {TABS.map((tab) => (
        <Tab
          key={tab.value}
          iconPosition="end"
          value={tab.value}
          label={tab.label} />
      ))})
    </Tabs>
  )
  const renderContacts = (
    <>
      <Typography variant="h6" sx={{ p: 1.5 }}>
        联系人 <Typography component="span">({contacts.allIds.length})</Typography>
      </Typography>

      <Scrollbar sx={{ height: 320, ml: 1, mr: 1 }}>
        {contacts.allIds.map((id) => (
          <MenuItem key={contacts.byId[id]._id} sx={{ p: 1 }}>
            <Badge
              variant={contacts.byId[id].status}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              sx={{ mr: 2 }}
            >
              <Avatar alt={contacts.byId[id].username} src={contacts.byId[id].photoURL} />
            </Badge>

            <ListItemText
              primary={contacts.byId[id].username}
              secondary={contacts.byId[id].status === 'offline' ? fToNow(contacts.byId[id].lastActivity) : ''}
              primaryTypographyProps={{ typography: 'subtitle2' }}
              secondaryTypographyProps={{ typography: 'caption', color: 'text.disabled' }}
            />
          </MenuItem>
        ))}
      </Scrollbar>
    </>
  )
  const styles = {
    typography: 'body2',
    alignItems: 'center',
    color: 'text.primary',
    display: 'inline-flex',
  };
  const renderOrganizationsMenuItem = (organization) => <MenuItem key={organization._id} sx={{ p: 1 }} onClick={() => onChildren(organization)}>
    <Badge
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      sx={{ mr: 2 }}
      badgeContent={organization.count}
      size="small"
      color={organization?.type === "org" ? "error" : "default"}
    >
      <Avatar alt={organization.name} src={organization.avatarUrl?.preview || organization.photoURL} />
    </Badge>
    <ListItemText
      primary={organization.name}
      primaryTypographyProps={{ typography: 'subtitle2' }}
      secondaryTypographyProps={{ typography: 'caption', color: 'text.disabled' }}
    />
  </MenuItem>
  const renderOrganizations = (
    <>
      <Typography variant="h6" sx={{ p: 1.5 }}>
        组织架构
      </Typography>

      <Scrollbar sx={{ height: 320, ml: 1, mr: 1 }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="flex-start"
          sx={{ mb: 1 }}
        >
          {
            levels && levels.length > 0 && (
              levels.map((level, index) => (<Box key={index} sx={{ display: 'flex' }}>
                <Link onClick={() => onGoTo(level)} sx={styles}>{`${level.name}`} </Link>
                <div style={{ margin: '0 4px' }}> /</div>
              </Box>))
            )
          }
        </Stack>
        <Divider />
        {currentOrganization && currentOrganization.length > 0 ? currentOrganization.map(item => renderOrganizationsMenuItem(item)) : organizations.map(item => renderOrganizationsMenuItem(item))}
      </Scrollbar>
    </>
  )
  return (
    <>
      <IconButton
        component={m.button}
        whileTap="tap"
        whileHover="hover"
        variants={varHover(1.05)}
        color={popover.open ? 'inherit' : 'default'}
        onClick={popover.onOpen}
        sx={{
          ...(popover.open && {
            bgcolor: (theme) => theme.palette.action.selected,
          }),
        }}
      >
        <Iconify icon="solar:users-group-rounded-bold-duotone" width={24} />
      </IconButton>

      <CustomPopover open={popover.open} onClose={popover.onClose} sx={{ width: 320 }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ pl: 2.5, pr: 1 }}
        >
          {renderTabs}
        </Stack>
        <Divider />
        {currentTab === "contacts" && renderContacts}
        {currentTab === "organizations" && renderOrganizations}
      </CustomPopover>
    </>
  );
}
