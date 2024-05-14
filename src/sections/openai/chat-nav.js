import PropTypes from 'prop-types';
import { useState, useEffect, useCallback } from 'react';
// @mui
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Link from '@mui/material/Link';

import InputAdornment from '@mui/material/InputAdornment';
import ClickAwayListener from '@mui/material/ClickAwayListener';
// hooks
import { useResponsive } from 'src/hooks/use-responsive';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
import Divider from '@mui/material/Divider';
// components
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
// redux
import { useDispatch, useSelector } from 'src/redux/store';
import { getContacts, getOrganizations, deleteConversation } from 'src/redux/slices/chat';
import _ from 'lodash';
import { Button } from '@mui/material';
import { fileService, messagingService } from 'src/composables/context-provider';
import { useCollapseNav } from './hooks';
import ChatNavItem from './chat-nav-item';
import ChatNavAccount from './chat-nav-account';
import { ChatNavItemSkeleton } from './chat-skeleton';
import ChatNavSearchResults from './chat-nav-search-results';

// ----------------------------------------------------------------------

const NAV_WIDTH = 320;

const NAV_COLLAPSE_WIDTH = 96;

const TABS = [
  {
    value: 'conversations',
    label: '历史记录',
    count: 0,
  },
];

export default function ChatNav({ loading, contacts, conversations, selectedConversationId }) {
  const theme = useTheme();

  const router = useRouter();

  const dispatch = useDispatch();

  const mdUp = useResponsive('up', 'md');

  const { active } = useSelector((state) => state.scope);

  const [currentTab, setCurrentTab] = useState('conversations');

  const { organizations } = useSelector((state) => state.chat);

  const [currentOrganization, setCurrentOrganization] = useState([]);

  const [levels, setLevels] = useState([]);

  const handleChangeTab = useCallback((event, newValue) => {
    setCurrentTab(newValue);
  }, []);

  const onChildren = (organization) => {
    if (organization.children) {
      const level = {
        name: organization.label,
        to: organization._id,
      };
      levels.push(level);
      setCurrentOrganization([
        ...organization.children,
        ...organization.users.map((item) => ({
          name: item.account.username,
          photoURL: item.profile.photoURL,
          _id: item.profile._id,
        })),
      ]);
      setLevels(levels);
    }
  };
  const onGoTo = async (level) => {
    let index = 0;
    const length = _.findIndex(levels, ['to', level.to]);
    let isChildren = false;
    let currentOrganizations = organizations;
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
          _id: item.account._id,
          name: item.account.username,
          photoURL: item.profile.photoURL,
        })),
      ]);
    } else {
      await setCurrentOrganization(currentOrganizations);
    }
    setLevels(levels2);
  };

  const renderTabs = (
    <Tabs value={currentTab} onChange={handleChangeTab}>
      {TABS.map((tab) => (
        <Tab key={tab.value} iconPosition="end" value={tab.value} label={tab.label} />
      ))}
      )
    </Tabs>
  );

  const {
    collapseDesktop,
    onCloseDesktop,
    onCollapseDesktop,
    //
    openMobile,
    onOpenMobile,
    onCloseMobile,
  } = useCollapseNav();

  const [searchContacts, setSearchContacts] = useState({
    query: '',
    results: [],
  });

  useEffect(() => {
    if (!mdUp) {
      onCloseDesktop();
    }
  }, [onCloseDesktop, mdUp]);

  const handleToggleNav = useCallback(() => {
    if (mdUp) {
      onCollapseDesktop();
    } else {
      onCloseMobile();
    }
  }, [mdUp, onCloseMobile, onCollapseDesktop]);

  const handleClickCompose = useCallback(() => {
    if (!mdUp) {
      onCloseMobile();
    }
    router.push(paths.chat);
  }, [mdUp, onCloseMobile, router]);

  const handleSearchContacts = useCallback(
    (inputValue) => {
      setSearchContacts((prevState) => ({
        ...prevState,
        query: inputValue,
      }));

      if (inputValue) {
        const results = contacts.filter((contact) =>
          contact.username.toLowerCase().includes(inputValue)
        );

        setSearchContacts((prevState) => ({
          ...prevState,
          results,
        }));
      }
    },
    [contacts]
  );

  const handleClickAwaySearch = useCallback(() => {
    setSearchContacts({
      query: '',
      results: [],
    });
  }, []);

  const handleClickResult = useCallback(
    (result) => {
      handleClickAwaySearch();

      router.push(`${paths.chat}?id=${result.id}`);
    },
    [handleClickAwaySearch, router]
  );

  const renderToggleBtn = (
    <IconButton
      onClick={onOpenMobile}
      sx={{
        left: 0,
        top: 84,
        zIndex: 9,
        width: 32,
        height: 32,
        position: 'absolute',
        borderRadius: `0 12px 12px 0`,
        bgcolor: theme.palette.primary.main,
        boxShadow: theme.customShadows.primary,
        color: theme.palette.primary.contrastText,
        '&:hover': {
          bgcolor: theme.palette.primary.darker,
        },
      }}
    >
      <Iconify width={16} icon="solar:users-group-rounded-bold" />
    </IconButton>
  );

  const renderSkeleton = (
    <>
      {[...Array(12)].map((chatNavItem, index) => (
        <ChatNavItemSkeleton key={index} />
      ))}
    </>
  );
  const styles = {
    typography: 'body2',
    alignItems: 'center',
    color: 'text.primary',
    display: 'inline-flex',
  };
  const renderOrganizationsMenuItem = (organization, id) => (
    <ChatNavItem
      key={id}
      collapse={collapseDesktop}
      onChildren={onChildren}
      conversation={organization}
      selected={organization._id === selectedConversationId}
      onCloseMobile={onCloseMobile}
    />
  );
  const renderOrganizations = (
    <Scrollbar sx={{ height: 320, ml: 1, mr: 1 }}>
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
      {currentOrganization && currentOrganization.length > 0
        ? currentOrganization.map((item, i) => renderOrganizationsMenuItem(item, i))
        : organizations.map((item, i) => renderOrganizationsMenuItem(item, i))}
    </Scrollbar>
  );
  const renderList = (
    <>
      {/* <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ pl: 2.5, pr: 1 }}
      >
        {renderTabs}
      </Stack> */}
      <Divider />
      {currentTab === 'conversations' &&
        conversations.allIds.map((conversationId) => (
          <ChatNavItem
            key={conversationId}
            deleteConversation={() => dispatch(deleteConversation(conversationId))}
            collapse={collapseDesktop}
            conversation={conversations.byId[conversationId]}
            selected={conversationId === selectedConversationId}
            onCloseMobile={onCloseMobile}
          />
        ))}
    </>
  );

  const renderListResults = (
    <ChatNavSearchResults
      query={searchContacts.query}
      results={searchContacts.results}
      onClickResult={handleClickResult}
    />
  );

  const renderSearchInput = (
    <ClickAwayListener onClickAway={handleClickAwaySearch}>
      <TextField
        fullWidth
        value={searchContacts.query}
        onChange={(event) => handleSearchContacts(event.target.value)}
        placeholder="搜索历史记录..."
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
            </InputAdornment>
          ),
        }}
        sx={{ mt: 2.5 }}
      />
    </ClickAwayListener>
  );

  const renderContent = (
    <>
      <Stack direction="row" alignItems="center" justifyContent="center" sx={{ p: 2.5, pb: 0 }}>
        {!collapseDesktop && (
          <>
            <ChatNavAccount />
            <Box sx={{ flexGrow: 1 }} />
          </>
        )}

        <IconButton onClick={handleToggleNav}>
          <Iconify
            icon={collapseDesktop ? 'eva:arrow-ios-forward-fill' : 'eva:arrow-ios-back-fill'}
          />
        </IconButton>

        {!collapseDesktop && false && (
          <IconButton onClick={handleClickCompose}>
            <Iconify width={24} icon="solar:user-plus-bold" />
          </IconButton>
        )}
      </Stack>

      <Box sx={{ p: 2.5, pt: 0 }}>{!collapseDesktop && renderSearchInput}</Box>

      <Scrollbar sx={{ pb: 1 }}>
        {searchContacts.query && renderListResults}

        {/* {loading && renderSkeleton} */}

        {!searchContacts.query && renderList}
      </Scrollbar>
    </>
  );

  const createConversation = useCallback(async () => {
    const conversation = await messagingService.room({
      participants: ['a5u9kNTzKAdghpr55'],
      isSession: true,
    });
    router.push(`${paths.openai}?id=${conversation._id}`);
    return conversation._id;
  }, [router]);
  return (
    <>
      {/* {!mdUp && renderToggleBtn} */}

      {mdUp ? (
        <Stack
          sx={{
            height: 1,
            flexShrink: 0,
            width: NAV_WIDTH,
            borderRight: `solid 1px ${theme.palette.divider}`,
            transition: theme.transitions.create(['width'], {
              duration: theme.transitions.duration.shorter,
            }),
            ...(collapseDesktop && {
              width: NAV_COLLAPSE_WIDTH,
            }),
          }}
        >
          {renderContent}
          <Divider />
          <Button
            variant="soft"
            size="large"
            sx={{ borderRadius: '0px' }}
            onClick={createConversation}
          >
            新建会话
          </Button>
        </Stack>
      ) : (
        <Drawer
          open={openMobile}
          onClose={onCloseMobile}
          slotProps={{
            backdrop: { invisible: true },
          }}
          PaperProps={{
            sx: { width: NAV_WIDTH },
          }}
        >
          {renderContent}
        </Drawer>
      )}
    </>
  );
}

ChatNav.propTypes = {
  contacts: PropTypes.array,
  conversations: PropTypes.object,
  loading: PropTypes.bool,
  selectedConversationId: PropTypes.string,
};
