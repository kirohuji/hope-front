import PropTypes from 'prop-types';
// @mui
import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import AvatarGroup, { avatarGroupClasses } from '@mui/material/AvatarGroup';
// utils
import { fToNow } from 'src/utils/format-time';
// components
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function ChatHeaderDetail ({ participants }) {
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
        primary={singleParticipant.username}
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
      {
        false && <div>
          <IconButton>
            <Iconify icon="solar:phone-bold" />
          </IconButton>
          <IconButton>
            <Iconify icon="solar:videocamera-record-bold" />
          </IconButton>
          <IconButton>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </div>
      }
    </>
  );
}

ChatHeaderDetail.propTypes = {
  participants: PropTypes.array,
};
