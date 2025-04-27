import { useState, useCallback } from 'react';
import { m } from 'framer-motion';
// @mui
import { useTheme } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import InputBase from '@mui/material/InputBase';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Dialog, { dialogClasses } from '@mui/material/Dialog';
import LoadingButton from '@mui/lab/LoadingButton';
import { useSelector, useDispatch } from 'src/redux/store';
import { clearActiveConversation, getConversationByConversationKey } from 'src/redux/slices/chat';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
// hooks
import { useSnackbar } from 'src/components/snackbar';
import { useBoolean } from 'src/hooks/use-boolean';
import { useEventListener } from 'src/hooks/use-event-listener';
// components
import { varHover } from 'src/components/animate';
import Scrollbar from 'src/components/scrollbar';
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import ChatHeaderCompose from 'src/sections/chat/chat-header-compose';
import ChatOrganization from 'src/sections/chat/chat-organization';
import _ from 'lodash';
import { messagingService, roleService } from 'src/composables/context-provider';
// ----------------------------------------------------------------------

export default function ChatPopover() {
  const { enqueueSnackbar } = useSnackbar();

  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  const { contacts } = useSelector((state) => state.chat);

  const router = useRouter();

  const [checkeds, setCheckeds] = useState([]);

  const [selectedContacts, setSelectedContacts] = useState([]);

  const { active } = useSelector((state) => state.scope);

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
  }, [search]);

  const handleKeyDown = (event) => {
    if (event.key === 'k' && event.metaKey) {
      search.onToggle();
      setSearchQuery('');
    }
  };

  const handleChange = (organization) => {
    setData(organization);
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

  const handleSelectCascadeContacts = async (organization, check) => {
    const { data: inheritedRoleNames } = await roleService.getUsersInRole({
      options: {
        scope: active._id,
      },
      roles: organization._id,
    });
    const inheritedRoleNamesIds = [organization._id, ...inheritedRoleNames.map((item) => item._id)];

    if (checkeds.includes(organization._id)) {
      setCheckeds((prevSelectedChecks) =>
        prevSelectedChecks.filter((checkedId) => !inheritedRoleNamesIds.includes(checkedId))
      );
      setSelectedContacts((prevSelectedConatcts) =>
        prevSelectedConatcts.filter(
          (prevSelectedConatct) => !inheritedRoleNamesIds.includes(prevSelectedConatct._id)
        )
      );
    } else {
      setSelectedContacts((prevSelectedConatcts) =>
        _.compact([...prevSelectedConatcts].concat(...inheritedRoleNames))
      );
      setCheckeds((prevSelectedChecks) => [...prevSelectedChecks].concat(inheritedRoleNamesIds));
    }
  };

  useEventListener('keydown', handleKeyDown);

  const handleSearch = useCallback((event) => {
    setSearchQuery(event.target.value);
  }, []);

  const renderButton = (
    <>
      <IconButton
        component={m.button}
        whileTap="tap"
        whileHover="hover"
        variants={varHover(1.05)}
        onClick={popover.onOpen}
        sx={{ pl: '2px' }}
      >
        <Iconify icon="lets-icons:add-duotone" width={30} />
      </IconButton>
      <CustomPopover open={popover.open} onClose={popover.onClose} sx={{ width: 200, p: 0 }}>
        {/* <Divider sx={{ borderStyle: 'dashed' }} /> */}
        <Stack sx={{ p: 0.5 }}>
          <MenuItem
            onClick={() => {
              // onRefreshWithOrganization();
              search.onTrue();
            }}
          >
            新会话
          </MenuItem>
        </Stack>
      </CustomPopover>
    </>
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
      await dispatch(clearActiveConversation());
      console.log('clearActiveConversation',conversationKey);
      await dispatch(getConversationByConversationKey(conversationKey));
      router.push(`${paths.chat}?id=${conversationKey}`);
      setLoading(false);
    } catch (e) {
      enqueueSnackbar('添加失败,请联系管理员!');
      setLoading(false);
    }
  }, [dispatch, enqueueSnackbar, router, selectedContacts]);

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
            placeholder="搜索..."
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
          <ChatOrganization
            isMulti
            cascadeCheck
            searchQuery={searchQuery}
            selectedContacts={selectedContacts}
            checkeds={checkeds}
            handleSelectCascadeContacts={handleSelectCascadeContacts}
            handleSelectContact={handleSelectContact}
          />
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
