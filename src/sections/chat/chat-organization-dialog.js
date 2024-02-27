import PropTypes from 'prop-types';
import { useState, useCallback, useEffect } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import LoadingButton from '@mui/lab/LoadingButton';
import Dialog, { dialogClasses } from '@mui/material/Dialog';
import InputBase from '@mui/material/InputBase';
import InputAdornment from '@mui/material/InputAdornment';
// hooks
import { useSnackbar } from 'src/components/snackbar';
import { useSelector } from 'src/redux/store';
// components
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import ChatHeaderCompose from 'src/sections/chat/chat-header-compose';
import ChatOrganization from 'src/sections/chat/chat-organization';
import _ from 'lodash';
//
import { messagingService } from 'src/composables/context-provider';

export default function ChatOrganizationDialog({ open, onClose, conversation, participants }) {
  const { enqueueSnackbar } = useSnackbar();

  const { contacts } = useSelector((state) => state.chat);

  const [selectedContacts, setSelectedContacts] = useState(participants);

  const [loading, setLoading] = useState(false);

  const theme = useTheme();

  const [searchQuery, setSearchQuery] = useState('');

  const [checkeds, setCheckeds] = useState(participants.map((item) => item._id));

  const handleClose = useCallback(() => {
    setSearchQuery('');
    setCheckeds([]);
    setSelectedContacts([]);
    onClose();
  }, [onClose]);

  const handleSearch = useCallback((event) => {
    setSearchQuery(event.target.value);
  }, []);

  const handleSelectContact = (contact) => {
    if (checkeds.includes(contact._id)) {
      console.log('包含');
      setCheckeds((prevSelectedChecks) =>
        prevSelectedChecks.filter((checkedId) => checkedId !== contact._id)
      );
      setSelectedContacts((prevSelectedConatcts) =>
        prevSelectedConatcts.filter(
          (prevSelectedConatct) => prevSelectedConatct?._id !== contact._id
        )
      );
    } else {
      console.log('去除');
      setSelectedContacts((prevSelectedConatcts) =>
        _.compact([...prevSelectedConatcts].concat(contact))
      );
      setCheckeds((prevSelectedChecks) => [...prevSelectedChecks].concat(contact._id));
    }
  };

  const updateConversation = useCallback(async () => {
    if (!selectedContacts.length) {
      enqueueSnackbar('未选择聊天对象');
      return;
    }
    setLoading(true);
    try {
      if (participants.length === checkeds.length) {
        enqueueSnackbar('未修改参与者列表!');
        setLoading(false);
        return;
      }
      if (participants.length > checkeds.length) {
        await messagingService.removeParticipants({
          _id: conversation._id,
          participants: _.difference(
            participants.map((item) => item._id),
            checkeds
          ),
        });
        enqueueSnackbar('删除成功');
      } else {
        await messagingService.addParticipants({
          _id: conversation._id,
          participants: _.difference(
            checkeds,
            participants.map((item) => item._id)
          ),
        });
        enqueueSnackbar('添加成功');
      }
      handleClose();
      setLoading(false);
    } catch (e) {
      enqueueSnackbar('添加失败,请联系管理员!');
      setLoading(false);
    }
  }, [
    checkeds,
    conversation._id,
    enqueueSnackbar,
    handleClose,
    participants,
    selectedContacts.length,
  ]);

  useEffect(() => {
    if (open) {
      setSelectedContacts(participants);
      setCheckeds(participants.map((item) => item._id));
    }
  }, [open, participants]);

  return (
    <Dialog
      fullWidth
      open={open}
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
        <ChatOrganization
          isMulti
          selectedContacts={selectedContacts}
          checkeds={checkeds}
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
          onClick={updateConversation}
        >
          确定
        </LoadingButton>
      </Stack>
    </Dialog>
  );
}

ChatOrganizationDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  participants: PropTypes.array,
  conversation: PropTypes.object,
};
