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

      router.push(`${paths.dashboard.openai}?id=${result.id}`);
    },
    [handleClickAwaySearch, router]
  );

  const renderList = (
    <>
      <Divider />
      {currentTab === 'conversations' &&
        conversations.allIds.map((conversationId) => (
          <ChatNavItem
            key={conversationId}
            deleteConversation={async (callback) => {
              await dispatch(deleteConversation(conversationId, true));
              callback();
            }}
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
    router.push(`${paths.dashboard.openai}?id=${conversation._id}`);
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
