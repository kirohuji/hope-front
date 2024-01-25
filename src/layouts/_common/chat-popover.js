import { useState, memo, useCallback } from 'react';
import { m } from 'framer-motion';
// @mui
import { useTheme } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import MenuItem from '@mui/material/MenuItem';
import InputBase from '@mui/material/InputBase';
import Avatar from '@mui/material/Avatar';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Dialog, { dialogClasses } from '@mui/material/Dialog';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';

import { useDispatch, useSelector } from 'src/redux/store';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';
import { useEventListener } from 'src/hooks/use-event-listener';
import {
  getOrganizations,
  getConversations,
  resetActiveConversation,
  getMessages,
  getConversation,
  getContacts,
  deleteConversation,
  newMessageGet,
} from 'src/redux/slices/chat';
// components
import { varHover } from 'src/components/animate';
import Label from 'src/components/label';
import Scrollbar from 'src/components/scrollbar';
import Iconify from 'src/components/iconify';
import SearchNotFound from 'src/components/search-not-found';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import ChatNavItem from 'src/sections/chat/chat-nav-item';
import _ from 'lodash';

// ----------------------------------------------------------------------

export default function ChatPopover() {
  const { contacts } = useSelector((state) => state.chat);

  const dispatch = useDispatch();

  const { active } = useSelector((state) => state.scope);

  const [currentOrganization, setCurrentOrganization] = useState([]);

  const [currentFirstOrganization, setCurrentFirstOrganization] = useState([]);

  const [levels, setLevels] = useState([]);

  const [data, setData] = useState([]);

  const theme = useTheme();

  const search = useBoolean();

  const popover = usePopover();

  const [searchQuery, setSearchQuery] = useState('');

  const handleClose = useCallback(() => {
    search.onFalse();
    setSearchQuery('');
  }, [search]);

  const handleKeyDown = (event) => {
    if (event.key === 'k' && event.metaKey) {
      search.onToggle();
      setSearchQuery('');
    }
  };

  useEventListener('keydown', handleKeyDown);

  const handleSearch = useCallback((event) => {
    setSearchQuery(event.target.value);
  }, []);

  const onRefreshWithOrganization = useCallback(async () => {
    const organizationData = await dispatch(getOrganizations(active._id));
    setCurrentFirstOrganization(organizationData);
    setCurrentOrganization(organizationData);
  }, [active._id, dispatch]);

  const notFound = searchQuery && !data.length;

  const renderButton = (
    <>
      <IconButton
        component={m.button}
        whileTap="tap"
        whileHover="hover"
        variants={varHover(1.05)}
        onClick={popover.onOpen}
      >
        <Iconify icon="lets-icons:add-duotone" width={32} />
      </IconButton>
      <CustomPopover open={popover.open} onClose={popover.onClose} sx={{ width: 200, p: 0 }}>
        <Divider sx={{ borderStyle: 'dashed' }} />

        <Stack sx={{ p: 0.5 }}>
          <MenuItem
            onClick={() => {
              onRefreshWithOrganization();
              search.onTrue();
            }}
          >
            新会话
          </MenuItem>
        </Stack>
      </CustomPopover>
    </>
  );

  const onChildren = (organization) => {
    if (organization.children || organization.users) {
      const level = {
        name: organization.label,
        to: organization._id,
      };
      levels.push(level);
      setCurrentOrganization(
        _.compact([
          ...(organization.children || []),
          ...(organization.users || []).map((item) => ({
            name: item.username,
            photoURL: item.photoURL,
            _id: item._id,
            email: item.email,
            displayName: item.displayName,
            realName: item.realName,
          })),
        ])
      );
      setLevels(levels);
      console.log('currentOrganization', currentOrganization);
    }
  };

  const onGoTo = async (level) => {
    let index = 0;
    const length = _.findIndex(levels, ['to', level.to]);
    let isChildren = false;
    let currentOrganizations = currentFirstOrganization;
    const levels2 = [];
    while (index < length) {
      isChildren = true;
      const currentLevel = levels[index];
      currentOrganizations = _.find(currentOrganizations, ['_id', currentLevel.to]);
      index += 1;
      levels2.push(currentLevel);
    }
    if (isChildren) {
      await setCurrentOrganization([
        ...currentOrganizations.children,
        ...currentOrganizations.users.map((item) => ({
          _id: item._id,
          name: item.username,
          photoURL: item.photoURL,
          email: item.email,
          displayName: item.displayName,
          realName: item.realName,
        })),
      ]);
    } else {
      await setCurrentOrganization(currentOrganizations);
    }
    setLevels(levels2);
  };

  const styles = {
    typography: 'body2',
    alignItems: 'center',
    color: 'text.primary',
    display: 'inline-flex',
  };

  const renderOrganizationsMenuItem = (organization, id) => (
    <ChatNavItem
      key={id}
      onChildren={onChildren}
      conversation={organization}
      multi
      sx={{ height: 'unset' }}
    />
  );
  const renderOrganizations = (
    <Scrollbar sx={{ height: '100%', ml: 1, mr: 1 }}>
      {levels && levels.length > 0 && (
        <Stack direction="row" alignItems="center" justifyContent="flex-start" sx={{ m: 1 }}>
          {levels.map((level, index) => (
            <Box key={index} sx={{ display: 'flex' }}>
              <Link onClick={() => onGoTo(level)} sx={styles}>
                {`${level.name}`}{' '}
              </Link>
              <div style={{ margin: '0 4px' }}> /</div>
            </Box>
          ))}
        </Stack>
      )}
      {currentOrganization.map((item, i) => renderOrganizationsMenuItem(item, i))}
    </Scrollbar>
  );
  const renderItems = () => (
    <List disablePadding>
      {contacts.allIds
        .map((id) => contacts.byId[id])
        .map((item) => (
          <ListItemButton
            key={item._id}
            disableGutters
            sx={{
              width: '100%',
              boxSizing: 'border-box',
              backgroundColor: '#fff',
              height: '100%',
              py: 1.5,
              px: 2.5,
            }}
          >
            <Avatar alt={item.username} src={item.photoURL} sx={{ width: 48, height: 48 }} />
            <ListItemText
              sx={{ ml: 2 }}
              primary={`${item.displayName}${item.realName ? `(${item.realName})` : ''}`}
              primaryTypographyProps={{
                noWrap: true,
                variant: 'subtitle2',
              }}
              secondary={item.displayText}
              secondaryTypographyProps={{
                noWrap: true,
                component: 'span',
                variant: 'body2',
                color: 'text.secondary',
              }}
            />
          </ListItemButton>
        ))}
    </List>
  );
  return (
    <>
      {renderButton}
      <Dialog
        fullWidth
        open={search.value}
        onClose={handleClose}
        transitionDuration={{
          enter: theme.transitions.duration.shortest,
          exit: 0,
        }}
        PaperProps={{
          sx: {
            mt: 5,
            overflow: 'unset',
          },
        }}
        sx={{
          [`& .${dialogClasses.container}`]: {
            alignItems: 'flex-start',
          },
        }}
      >
        <Box sx={{ p: 3, borderBottom: `solid 1px ${theme.palette.divider}` }}>
          <InputBase
            fullWidth
            autoFocus
            placeholder="Search..."
            value={searchQuery}
            onChange={handleSearch}
            startAdornment={
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" width={24} sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            }
            inputProps={{
              sx: { typography: 'h6' },
            }}
          />
        </Box>
        <Scrollbar sx={{ p: 0, pb: 2, height: 500 }}>
          {notFound ? <SearchNotFound query={searchQuery} sx={{ py: 10 }} /> : renderOrganizations}
        </Scrollbar>
      </Dialog>
    </>
  );
}
