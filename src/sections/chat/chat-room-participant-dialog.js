import PropTypes from 'prop-types';
// @mui
import { useCallback } from 'react';
import { alpha } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogContent from '@mui/material/DialogContent';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
// components
import Iconify from 'src/components/iconify';
import { messagingService } from 'src/composables/context-provider';
// ----------------------------------------------------------------------

export default function ChatRoomParticipantDialog({ participant, open, onClose, user }) {
  const router = useRouter();
  const handleChat = useCallback(async () => {
    if (user._id !== participant._id) {
      let conversationKey = await messagingService.findExistingConversationWithUsers({
        users: [participant._id],
      });
      if (!conversationKey) {
        conversationKey = await messagingService.room({
          participants: [participant._id],
        });
      }
      router.push(`${paths.chat}?id=${conversationKey}`);
    }
  }, [participant._id, router, user._id]);
  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose}>
      <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
        <Iconify icon="mingcute:close-line" />
      </IconButton>

      <DialogContent sx={{ py: 5, px: 3, display: 'flex' }}>
        <Avatar
          alt={participant.username}
          src={participant.photoURL}
          sx={{ width: 96, height: 96, mr: 3 }}
        />

        <Stack spacing={1}>
          <Typography variant="caption" sx={{ color: 'primary.main' }}>
            {participant.role}
          </Typography>

          <Typography variant="subtitle1">{`${participant.displayName}(${participant.realName})`}</Typography>

          <Stack direction="row" sx={{ typography: 'caption', color: 'text.disabled' }}>
            <Iconify
              icon="mingcute:location-fill"
              width={16}
              sx={{ flexShrink: 0, mr: 0.5, mt: '2px' }}
            />
            {participant.address}
          </Stack>
          <Stack direction="row" sx={{ typography: 'caption', color: 'text.disabled' }}>
            <Iconify
              icon="solar:phone-bold"
              width={16}
              sx={{ flexShrink: 0, mr: 0.5, mt: '2px' }}
            />
            {participant.phoneNumber}
          </Stack>

          <Stack spacing={1} direction="row" sx={{ pt: 1.5 }}>
            {/* <IconButton
              size="small"
              color="error"
              sx={{
                borderRadius: 1,
                bgcolor: (theme) => alpha(theme.palette.error.main, 0.08),
                '&:hover': {
                  bgcolor: (theme) => alpha(theme.palette.error.main, 0.16),
                },
              }}
            >
              <Iconify width={18} icon="solar:phone-bold" />
            </IconButton> */}

            <IconButton
              size="small"
              color="info"
              onClick={() => handleChat()}
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

            {/* <IconButton
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
              <Iconify width={18} icon="fluent:mail-24-filled" />
            </IconButton> */}

            {/* <IconButton
              size="small"
              color="secondary"
              sx={{
                borderRadius: 1,
                bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.08),
                '&:hover': {
                  bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.16),
                },
              }}
            >
              <Iconify width={18} icon="solar:videocamera-record-bold" />
            </IconButton> */}
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

ChatRoomParticipantDialog.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
  participant: PropTypes.object,
  user: PropTypes.object,
};
