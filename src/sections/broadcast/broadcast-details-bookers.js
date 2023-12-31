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
import LoadingButton from '@mui/lab/LoadingButton';
import CircularProgress from '@mui/material/CircularProgress';
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

export default function BroadcastDetailsBookers({ onRefresh, participants }) {
  const [loading, setLoading] = useState(false);

  const [buttonLoading, setButtonLoading] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(-1);

  const { user } = useAuthContext();

  const router = useRouter();

  const [openConfirm, setOpenConfirm] = useState(false);

  const { enqueueSnackbar } = useSnackbar();

  const [currentParticipant, setCurrentParticipant] = useState({});

  const handleOpenConfirm = (p) => {
    setCurrentParticipant(p);
    setOpenConfirm(true);
  };

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
  };

  const handleDelete = async (item, index) => {
    try {
      setLoading(true);
      setButtonLoading(true);
      setCurrentIndex(index);
      await broadcastService.deleteUser(currentParticipant);
      enqueueSnackbar('删除成功');
      handleCloseConfirm();
      onRefresh({
        data: currentParticipant,
        type: 'delete',
      });
      setLoading(false);
      setCurrentIndex(-1);
      setButtonLoading(false);
    } catch (e) {
      enqueueSnackbar('删除失败,请联系管理员!');
      setLoading(false);
      setCurrentIndex(-1);
      setButtonLoading(false);
    }
  };

  const signIn = useCallback(
    async (item, index) => {
      try {
        setLoading(true);
        setCurrentIndex(index);
        await broadcastService.signIn(item);
        enqueueSnackbar('更新成功');
        onRefresh({
          data: item,
          type: item.status === 'signIn' ? 'signOut' : 'signIn',
        });
        setLoading(false);
        setCurrentIndex(-1);
      } catch (e) {
        enqueueSnackbar('更新失败,请联系管理员!');
        setLoading(false);
        setCurrentIndex(-1);
      }
    },
    [enqueueSnackbar, onRefresh]
  );

  const handleChat = async (target) => {
    enqueueSnackbar('功能待开发!');
    // const newConversation = await messagingService.room({
    //   participants: [user._id, target.user_id],
    // });
    // router.push(`${paths.chat}?id=${newConversation._id}`);
  };

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
      {participants.map((participant, index) => (
        <BookerItem
          key={index}
          isOwner={user._id === participant.user_id}
          participant={participant}
          loading={index === currentIndex && loading}
          currentIndex={currentIndex}
          onDelete={() => handleOpenConfirm(participant)}
          onChat={() => handleChat(participant)}
          selected={participant.status === 'signIn'}
          onSelected={() => signIn(participant, index)}
        />
      ))}

      <ConfirmDialog
        open={openConfirm}
        onClose={handleCloseConfirm}
        title="删除"
        content="你确定删除吗?"
        action={
          <LoadingButton
            variant="contained"
            color="error"
            onClick={handleDelete}
            loading={buttonLoading}
          >
            删除
          </LoadingButton>
        }
      />
    </Box>
  );
}
BroadcastDetailsBookers.propTypes = {
  onRefresh: PropTypes.func,
  // isLoading: PropTypes.bool,
  participants: PropTypes.array,
};

// ----------------------------------------------------------------------

function BookerItem({ isOwner, participant, selected, onDelete, onSelected, onChat, loading }) {
  return (
    <Stack component={Card} direction="row" spacing={2} key={participant._id} sx={{ p: 3 }}>
      <Avatar
        alt={participant.username}
        src={participant.profile?.photoURL}
        sx={{ width: 48, height: 48 }}
      />

      <Stack spacing={2} flexGrow={1}>
        <ListItemText
          primary={`${participant.profile.displayName}(${participant.profile?.realName || '无'})`}
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
          {true && (
            <LoadingButton
              size="small"
              onClick={onSelected}
              loading={loading}
              color="error"
              sx={{
                borderRadius: 1,
                bgcolor: (theme) => alpha(theme.palette.error.main, 0.08),
                '&:hover': {
                  bgcolor: (theme) => alpha(theme.palette.error.main, 0.16),
                },
              }}
            >
              <Iconify
                width={18}
                icon={
                  selected
                    ? 'streamline:interface-logout-arrow-exit-frame-leave-logout-rectangle-right'
                    : 'ph:hand'
                }
              />
            </LoadingButton>
          )}

          {!isOwner && false && (
            <LoadingButton
              onClick={onChat}
              size="small"
              loading={loading}
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
            </LoadingButton>
          )}

          <LoadingButton
            onClick={onDelete}
            size="small"
            loading={loading}
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
          </LoadingButton>
        </Stack>
      </Stack>

      <LoadingButton
        loading={loading}
        size="small"
        variant={selected ? 'text' : 'outlined'}
        color={selected ? 'success' : 'inherit'}
        startIcon={
          selected ? <Iconify width={18} icon="eva:checkmark-fill" sx={{ mr: -0.75 }} /> : null
        }
        onClick={onSelected}
      >
        {selected ? '已签到' : '签到'}
      </LoadingButton>
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
  loading: PropTypes.bool,
};
