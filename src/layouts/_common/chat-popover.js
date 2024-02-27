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
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Dialog, { dialogClasses } from '@mui/material/Dialog';
import LoadingButton from '@mui/lab/LoadingButton';
import { useDispatch, useSelector } from 'src/redux/store';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
// hooks
import { useSnackbar } from 'src/components/snackbar';
import { useBoolean } from 'src/hooks/use-boolean';
import { useEventListener } from 'src/hooks/use-event-listener';
import { getOrganizations } from 'src/redux/slices/chat';
// components
import { varHover } from 'src/components/animate';
import Scrollbar from 'src/components/scrollbar';
import Iconify from 'src/components/iconify';
import SearchNotFound from 'src/components/search-not-found';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import ChatNavItem from 'src/sections/chat/chat-nav-item';
import ChatHeaderCompose from 'src/sections/chat/chat-header-compose';
import _ from 'lodash';
import { fileService, messagingService } from 'src/composables/context-provider';
// ----------------------------------------------------------------------

export default function ChatPopover() {
  const { enqueueSnackbar } = useSnackbar();

  const [loading, setLoading] = useState(false);

  const { contacts } = useSelector((state) => state.chat);

  const router = useRouter();

  const [checkeds, setCheckeds] = useState([]);

  const [selectedContacts, setSelectedContacts] = useState([]);

  const dispatch = useDispatch();

  const { active } = useSelector((state) => state.scope);

  const [currentOrganization, setCurrentOrganization] = useState([]);

  const [currentFirstOrganization, setCurrentFirstOrganization] = useState([]);

  const [levels, setLevels] = useState([]);

  const [data, setData] = useState([]);

  const theme = useTheme();

  const search = useBoolean();

  const popover = usePopover();

  const [recipients, setRecipients] = useState([]);

  const [searchQuery, setSearchQuery] = useState('');

  const handleClose = useCallback(() => {
    search.onFalse();
    setSearchQuery('');
    setCheckeds([]);
    setSelectedContacts([]);
    setCurrentOrganization([]);
    setLevels([]);
  }, [search]);

  const handleKeyDown = (event) => {
    if (event.key === 'k' && event.metaKey) {
      search.onToggle();
      setSearchQuery('');
    }
  };

  const handleSelectContact = (contact) => {
    if (checkeds.includes(contact._id)) {
      setCheckeds((prevSelectedChecks) =>
        prevSelectedChecks.filter((checkedId) => checkedId !== contact._id)
      );
      setSelectedContacts((prevSelectedConatcts) =>
        prevSelectedConatcts.filter(
          (prevSelectedConatct) => prevSelectedConatct?._id !== contact._id
        )
      );
    } else {
      setSelectedContacts((prevSelectedConatcts) =>
        _.compact([...prevSelectedConatcts].concat(contact))
      );
      setCheckeds((prevSelectedChecks) => [...prevSelectedChecks].concat(contact._id));
    }
  };

  useEventListener('keydown', handleKeyDown);

  const handleSearch = useCallback((event) => {
    setSearchQuery(event.target.value);
  }, []);

  const onRefreshWithOrganization = useCallback(async () => {
    if (active?._id) {
      const organizationData = await dispatch(getOrganizations(active?._id));
      setCurrentFirstOrganization(organizationData);
      setCurrentOrganization(organizationData);
    }
  }, [active?._id, dispatch]);

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
      onSelect={() => handleSelectContact(organization)}
      checked={checkeds.includes(organization._id) > 0}
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

  const handleAddRecipients = useCallback((selected) => {
    setRecipients(selected);
  }, []);

  const createConversation = useCallback(async () => {
    if (!selectedContacts.length) {
      enqueueSnackbar('未选择聊天对象');
      return;
    }
    setLoading(true);
    try {
      let conversationKey = await messagingService.findExistingConversationWithUsers({
        users: selectedContacts.map((recipient) => recipient._id),
      });
      if (!conversationKey || conversationKey === -1) {
        const newConversation = await messagingService.room({
          participants: selectedContacts.map((recipient) => recipient._id),
        });
        console.log('newConversation', newConversation);
        conversationKey = newConversation._id;
      }
      router.push(`${paths.chat}?id=${conversationKey}`);
      setLoading(false);
    } catch (e) {
      enqueueSnackbar('添加失败,请联系管理员!');
      setLoading(false);
    }
  }, [enqueueSnackbar, router, selectedContacts]);

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
            p: 0,
            width: '100%',
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
          <ChatHeaderCompose
            selectedContacts={selectedContacts}
            onAddRecipients={handleAddRecipients}
            contacts={contacts.allIds.map((id) => contacts.byId[id])}
          />
          <InputBase
            fullWidth
            autoFocus
            placeholder="Search..."
            value={searchQuery}
            sx={{ mt: 1 }}
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
        <Stack>
          <LoadingButton
            fullWidth
            size="large"
            type="submit"
            variant="soft"
            loading={loading}
            onClick={createConversation}
          >
            确定
          </LoadingButton>
        </Stack>
      </Dialog>
    </>
  );
}
