import PropTypes from 'prop-types';
import { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from 'src/auth/hooks';
// @mui
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import ConfirmDialog from 'src/components/confirm-dialog';
import { useSnackbar } from 'src/components/snackbar';
// components
import Iconify from 'src/components/iconify';

// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';

import { broadcastService, messagingService } from 'src/composables/context-provider';

// ----------------------------------------------------------------------

export default function BroadcastDetailsBookers ({ onRefresh, participants }) {

  const { user } = useAuthContext();

  const router = useRouter();

  const [openConfirm, setOpenConfirm] = useState(false);

  const { enqueueSnackbar } = useSnackbar();

  const [currentParticipant, setCurrentParticipant] = useState({});

  const handleOpenConfirm = (p) => {
    setCurrentParticipant(p)
    setOpenConfirm(true);
  };

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
  };

  const handleDelete = async () => {
    await broadcastService.deleteUser(currentParticipant)
    enqueueSnackbar('删除成功');
    handleCloseConfirm();
    onRefresh();
  }

  const signIn = useCallback(async (item) => {
    await broadcastService.signIn(item)
    enqueueSnackbar('更新成功');
    onRefresh()
  }, [onRefresh, enqueueSnackbar]);

  const handleChat = async (target) => {
    const newConversation = await messagingService.room({
      participants: [user._id, target.user_id]
    })
    router.push(`${paths.chat}?id=${newConversation._id}`);
  }

  return (
    <Box
      gap={3}
      display="grid"
      gridTemplateColumns={{
        xs: 'repeat(1, 1fr)',
        sm: 'repeat(2, 1fr)',
        md: 'repeat(3, 1fr)',
      }}
    >
      {participants.map((participant) => (
        <BookerItem
          key={participant._id}
          isOwner={user._id === participant.user_id}
          participant={participant}
          onDelete={() => handleOpenConfirm(participant)}
          onChat={() => handleChat(participant)}
          selected={participant.status === "signIn"}
          onSelected={() => signIn(participant)}
        />
      ))}
      <ConfirmDialog
        open={openConfirm}
        onClose={handleCloseConfirm}
        title="删除"
        content="你确定删除吗?"
        action={
          <Button variant="contained" color="error" onClick={handleDelete}>
            删除
          </Button>
        }
      />
    </Box>
  );
}
BroadcastDetailsBookers.propTypes = {
  onRefresh: PropTypes.func,
  participants: PropTypes.array,
};

// ----------------------------------------------------------------------

function BookerItem ({ isOwner, participant, selected, onDelete, onSelected, onChat }) {
  return (
    <Stack component={Card} direction="row" spacing={2} key={participant._id} sx={{ p: 3 }}>
      <Avatar alt={participant.username} src={participant.profile?.photoURL} sx={{ width: 48, height: 48 }} />

      <Stack spacing={2} flexGrow={1}>
        <ListItemText
          primary={participant.username}
          secondary={
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Iconify icon="solar:users-group-rounded-bold" width={16} />
              {participant.profile.email}
            </Stack>
          }
          secondaryTypographyProps={{
            mt: 0.5,
            component: 'span',
            typography: 'caption',
            color: 'text.disabled',
          }}
        />

        <Stack spacing={1} direction="row">
          {
            true && <IconButton
              size="small"
              onClick={onSelected}
              color="error"
              sx={{
                borderRadius: 1,
                bgcolor: (theme) => alpha(theme.palette.error.main, 0.08),
                '&:hover': {
                  bgcolor: (theme) => alpha(theme.palette.error.main, 0.16),
                },
              }}
            >
              <Iconify width={18} icon={selected ? "streamline:interface-logout-arrow-exit-frame-leave-logout-rectangle-right" : "ph:hand"} />
            </IconButton>
          }

          {
            !isOwner && <IconButton
              onClick={onChat}
              size="small"
              color="info"
              sx={{
                borderRadius: 1,
                bgcolor: (theme) => alpha(theme.palette.info.main, 0.08),
                '&:hover': {
                  bgcolor: (theme) => alpha(theme.palette.info.main, 0.16),
                },
              }}
            >
              <Iconify width={18} icon="solar:chat-round-dots-bold" />
            </IconButton>
          }

          <IconButton
            onClick={onDelete}
            size="small"
            color="primary"
            sx={{
              borderRadius: 1,
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
              '&:hover': {
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.16),
              },
            }}
          >
            <Iconify width={18} icon="fluent:delete-24-filled" />
          </IconButton>
        </Stack>
      </Stack>

      <Button
        size="small"
        variant={selected ? 'text' : 'outlined'}
        color={selected ? 'success' : 'inherit'}
        startIcon={
          selected ? <Iconify width={18} icon="eva:checkmark-fill" sx={{ mr: -0.75 }} /> : null
        }
        onClick={onSelected}
      >
        {selected ? '已签到' : '签到'}
      </Button>
    </Stack>
  );
}

BookerItem.propTypes = {
  isOwner: PropTypes.bool,
  participant: PropTypes.object,
  onSelected: PropTypes.func,
  onDelete: PropTypes.func,
  onChat: PropTypes.func,
  selected: PropTypes.bool,
};
