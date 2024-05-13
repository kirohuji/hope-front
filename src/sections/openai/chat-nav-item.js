import PropTypes from 'prop-types';
import { useCallback, useEffect, useRef, useState } from 'react';
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
import ListItemIcon from '@mui/material/ListItemIcon';
import Checkbox from '@mui/material/Checkbox';
import { zhCN } from 'date-fns/locale';
import Iconify from 'src/components/iconify';
import IconButton from '@mui/material/IconButton';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
// hooks
import { useAuthContext } from 'src/auth/hooks';
import { useResponsive } from 'src/hooks/use-responsive';
//
import { messagingService } from 'src/composables/context-provider';
import { use } from 'i18next';
import { useGetNavItem } from './hooks';

import ChatSwipeableNavItem from './chat-swipeable-nav-item';

// ----------------------------------------------------------------------

export default function ChatNavItem({
  deleteConversation,
  onSwipe,
  selected,
  checked,
  onSelect,
  onChildren,
  collapse,
  conversation,
  multi,
  onCloseMobile,
}) {
  const { user } = useAuthContext();

  const mdUp = useResponsive('up', 'md');

  const router = useRouter();

  const {
    group,
    displayName,
    realName,
    displayText,
    type,
    participants,
    lastActivity,
    hasOnlineInGroup,
  } = useGetNavItem({
    conversation,
    currentUserId: user?._id,
  });

  const singleParticipant = participants[0] || {};

  const { username, photoURL, status } = singleParticipant;

  const handleClickConversation = useCallback(async () => {
    if (type === 'org') {
      onChildren(conversation);
    } else {
      try {
        if (user?._id !== conversation._id && !multi) {
          if (!mdUp) {
            // eslint-disable-next-line no-unused-expressions
            onCloseMobile && onCloseMobile();
          }
          if (type === 'contact') {
            console.log('conversation',conversation)
            const newConversation = await messagingService.room({
              sessionId: conversation.sessionId,
              isSession: true,
            });
            router.push(`${paths.openai}?id=${newConversation._id}`);
          } else {
            router.push(`${paths.openai}?id=${conversation._id}`);
          }
        }
      } catch (error) {
        console.error(error);
      }
    }
  }, [type, onChildren, conversation, user?._id, multi, mdUp, onCloseMobile, router]);

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

  const renderlistItemButton = (
    <ListItemButton
      onClick={() => conversation.type !== 'conversation' && handleClickConversation()}
      disableGutters
      sx={{
        width: '100%',
        boxSizing: 'border-box',
        backgroundColor: '#fff',
        // height: '100%',
        py: 1.5,
        px: 2.5,
        ...(selected && {
          bgcolor: 'action.selected',
        }),
      }}
    >
      {multi && type !== 'org' && (
        <ListItemIcon>
          <Checkbox
            edge="start"
            tabIndex={-1}
            disableRipple
            checked={checked}
            onChange={() => onSelect(conversation._id)}
          />
        </ListItemIcon>
      )}
      {/* <Badge color="error" overlap="circular" badgeContent={conversation.unreadCount}>
        {group && participants ? renderGroup : singleParticipant && renderSingle}
      </Badge> */}

      {!collapse && (
        <>
          <ListItemText
            sx={{ ml: 2 }}
            primary={`${displayName}`}
            primaryTypographyProps={{
              noWrap: true,
              variant: 'subtitle2',
            }}
            // secondary={displayText}
            secondaryTypographyProps={{
              noWrap: true,
              component: 'span',
              variant: conversation.unreadCount ? 'subtitle2' : 'body2',
              color: conversation.unreadCount ? 'text.primary' : 'text.secondary',
            }}
          />
          {lastActivity && (
            <Stack alignItems="flex-end" sx={{ ml: 2, height: 44 }}>
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
                  addSuffix: true,
                  locale: zhCN,
                })}
              </Typography>
              {!!conversation.unreadCount && (
                <Box sx={{ width: 8, height: 8, bgcolor: 'info.main', borderRadius: '50%' }} />
              )}
            </Stack>
          )}
        </>
      )}
    </ListItemButton>
  );

  return conversation.type === 'conversation' ? (
    <ChatSwipeableNavItem
      isSwipe={type === 'conversation'}
      onSwipe={() => deleteConversation && deleteConversation()}
      handleClickConversation={handleClickConversation}
    >
      {renderlistItemButton}
    </ChatSwipeableNavItem>
  ) : (
    renderlistItemButton
  );
}

ChatNavItem.propTypes = {
  onSelect: PropTypes.func,
  checked: PropTypes.bool,
  onSwipe: PropTypes.func,
  onChildren: PropTypes.func,
  collapse: PropTypes.bool,
  multi: PropTypes.bool,
  conversation: PropTypes.object,
  onCloseMobile: PropTypes.func,
  selected: PropTypes.bool,
  deleteConversation: PropTypes.func,
};
