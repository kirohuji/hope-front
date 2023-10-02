import PropTypes from 'prop-types';
import { useCallback } from 'react';
import { formatDistanceToNowStrict } from 'date-fns';
// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import AvatarGroup from '@mui/material/AvatarGroup';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
// hooks
import { useAuthContext } from 'src/auth/hooks';
import { useResponsive } from 'src/hooks/use-responsive';
//
import { useGetNavItem } from './hooks';

// ----------------------------------------------------------------------

export default function ChatNavItem ({ selected, onChildren, collapse, conversation, onCloseMobile }) {
  const { user } = useAuthContext();

  const mdUp = useResponsive('up', 'md');

  const router = useRouter();

  const { group, displayName, displayText, type, participants, lastActivity, hasOnlineInGroup } =
    useGetNavItem({
      conversation,
      currentUserId: user._id,
    });

  const singleParticipant = participants[0];

  const { username, photoURL, status } = singleParticipant;

  const handleClickConversation = useCallback(async () => {
    if (type === "org") {
      onChildren(conversation)
    } else {
      try {
        if (!mdUp) {
          onCloseMobile();
        }
        router.push(`${paths.chat}?id=${conversation._id}`);
      } catch (error) {
        console.error(error);
      }
    }
  }, [conversation, type, onChildren, mdUp, onCloseMobile, router]);

  const renderGroup = (
    <Badge
      variant={hasOnlineInGroup ? 'online' : 'invisible'}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <AvatarGroup variant="compact" sx={{ width: 48, height: 48 }}>
        {participants.slice(0, 2).map((participant) => (
          <Avatar key={participant._id} alt={participant.username} src={participant.photoURL} />
        ))}
      </AvatarGroup>
    </Badge>
  );

  const renderSingle = (
    <Badge key={status} variant={status} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
      <Avatar alt={username} src={photoURL} sx={{ width: 48, height: 48 }} />
    </Badge>
  );

  return (
    <ListItemButton
      disableGutters
      onClick={handleClickConversation}
      sx={{
        py: 1.5,
        px: 2.5,
        ...(selected && {
          bgcolor: 'action.selected',
        }),
      }}
    >
      <Badge
        color="error"
        overlap="circular"
        badgeContent={collapse ? conversation.unreadCount : 0}
      >
        {group && participants ? renderGroup : renderSingle}
      </Badge>

      {!collapse && (
        <>
          <ListItemText
            sx={{ ml: 2 }}
            primary={displayName}
            primaryTypographyProps={{
              noWrap: true,
              variant: 'subtitle2',
            }}
            secondary={displayText}
            secondaryTypographyProps={{
              noWrap: true,
              component: 'span',
              variant: conversation.unreadCount ? 'subtitle2' : 'body2',
              color: conversation.unreadCount ? 'text.primary' : 'text.secondary',
            }}
          />
          {
            lastActivity && <Stack alignItems="flex-end" sx={{ ml: 2, height: 44 }}>
              <Typography
                noWrap
                variant="body2"
                component="span"
                sx={{
                  mb: 1.5,
                  fontSize: 12,
                  color: 'text.disabled',
                }}
              >
                {formatDistanceToNowStrict(new Date(lastActivity), {
                  addSuffix: false,
                })}
              </Typography>

              {!!conversation.unreadCount && (
                <Box sx={{ width: 8, height: 8, bgcolor: 'info.main', borderRadius: '50%' }} />
              )}
            </Stack>
          }
        </>
      )}
    </ListItemButton>
  );
}

ChatNavItem.propTypes = {
  onChildren: PropTypes.func,
  collapse: PropTypes.bool,
  conversation: PropTypes.object,
  onCloseMobile: PropTypes.func,
  selected: PropTypes.bool,
};
