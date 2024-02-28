import PropTypes from 'prop-types';
import { forwardRef, useState } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { OpenVidu } from 'openvidu-browser';
// @mui
import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import AvatarGroup, { avatarGroupClasses } from '@mui/material/AvatarGroup';
import Dialog from '@mui/material/Dialog';
import Slide from '@mui/material/Slide';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';

// utils
import { fToNow } from 'src/utils/format-time';
// components
import Iconify from 'src/components/iconify';
import { fileService } from 'src/composables/context-provider';
import UserVideoComponent from './user-video-component';

// ----------------------------------------------------------------------

const Transition = forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);
export default function ChatHeaderDetail({ openMedia, mainStreamManager, participants }) {
  const dialog = useBoolean();
  const group = participants.length > 2;

  const singleParticipant = participants[0] || {};

  const renderGroup = (
    <AvatarGroup
      max={3}
      sx={{
        [`& .${avatarGroupClasses.avatar}`]: {
          width: 32,
          height: 32,
        },
      }}
    >
      {participants.map((participant) => (
        <Avatar key={participant._id} alt={participant.username} src={participant.photoURL} />
      ))}
    </AvatarGroup>
  );

  const renderSingle = (
    <Stack flexGrow={1} direction="row" alignItems="center" spacing={2}>
      <Badge
        variant={singleParticipant.status}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Avatar src={singleParticipant.photoURL} alt={singleParticipant.username} />
      </Badge>

      <ListItemText
        primary={`${singleParticipant.displayName}(${singleParticipant.realName})`}
        secondary={
          singleParticipant.status === 'offline'
            ? fToNow(singleParticipant.lastActivity)
            : singleParticipant.status
        }
        secondaryTypographyProps={{
          component: 'span',
          ...(singleParticipant.status !== 'offline' && {
            textTransform: 'capitalize',
          }),
        }}
      />
    </Stack>
  );
  return (
    <>
      {group ? renderGroup : renderSingle}

      <Stack flexGrow={1} />

      {false && (
        <div>
          <IconButton>
            <Iconify icon="solar:phone-bold" />
          </IconButton>
          <IconButton
            onClick={() => {
              dialog.onTrue();
              openMedia();
            }}
          >
            <Iconify icon="solar:videocamera-record-bold" />
          </IconButton>
          <IconButton>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </div>
      )}
      <Dialog
        fullScreen
        open={dialog.value}
        onClose={dialog.onFalse}
        TransitionComponent={Transition}
      >
        {mainStreamManager && <UserVideoComponent streamManager={mainStreamManager} />}
        <IconButton onClick={() => {}}>
          <Iconify icon="solar:videocamera-record-bold" />
        </IconButton>

        <IconButton
          onClick={() => {
            dialog.onFalse();
          }}
        >
          <Iconify icon="solar:phone-bold" />
        </IconButton>
      </Dialog>
    </>
  );
}

ChatHeaderDetail.propTypes = {
  participants: PropTypes.array,
  mainStreamManager: PropTypes.any,
  openMedia: PropTypes.func,
};
