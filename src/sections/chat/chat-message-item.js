import PropTypes from 'prop-types';
import { useCallback } from 'react';
import { formatDistanceToNowStrict } from 'date-fns';
// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
// hooks
import { useAuthContext } from 'src/auth/hooks';

import CircularProgress from '@mui/material/CircularProgress';
// components
import Iconify from 'src/components/iconify';
import FileThumbnail from 'src/components/file-thumbnail';
//
import { zhCN } from 'date-fns/locale';

// redux
import { useDispatch } from 'src/redux/store';
import { sendMessage } from 'src/redux/slices/chat';
// hooks
import { useGetMessage } from './hooks';

// ----------------------------------------------------------------------

export default function ChatMessageItem({ message, participants, onOpenLightbox, conversationId }) {
  const dispatch = useDispatch();

  const { user } = useAuthContext();

  const { me, senderDetails, hasImage } = useGetMessage({
    message,
    participants,
    currentUserId: user._id,
  });

  const { username, photoURL, displayName, realName } = senderDetails;

  const { body, attachments, contentType, createdAt, isLoading, isFailure } = message;

  const renderInfo = (
    <Typography
      noWrap
      variant="caption"
      sx={{
        mb: 1,
        color: 'text.disabled',
        ...(!me && {
          mr: 'auto',
        }),
      }}
    >
      {!me && `${displayName}(${realName}),`} &nbsp;
      {formatDistanceToNowStrict(new Date(createdAt), {
        addSuffix: true,
        locale: zhCN,
      })}
    </Typography>
  );

  const handleSendMessage = useCallback(
    async (event) => {
      try {
        // // eslint-disable-next-line no-debugger
        // debugger;
        await dispatch(
          sendMessage(conversationId, {
            ...message,
            message: message.body,
          })
        );
      } catch (e) {
        console.error();
      }
    },
    [conversationId, dispatch, message]
  );

  const renderBodyContent = ({ bodyContent, type }) => {
    switch (type) {
      case 'text':
        // eslint-disable-next-line react/no-danger
        return (
          <div
            style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}
            dangerouslySetInnerHTML={{ __html: bodyContent }}
          />
        );
      case 'mp3':
        return (
          <Stack spacing={1} direction="row" alignItems="center">
            <FileThumbnail file="audio" />
            <Typography variant="body2">{attachments[0]?.name}</Typography>
          </Stack>
        );
      default:
        return (
          <Stack spacing={1} direction="row" alignItems="center">
            <FileThumbnail file={type} />
            <Typography
              sx={{
                whiteSpace: 'nowrap' /* 防止文本换行 */,
                overflow: 'hidden' /* 隐藏溢出的文本 */,
                textOverflow: 'ellipsis' /* 显示省略号 */,
              }}
              variant="body2"
            >
              {attachments[0]?.name}
            </Typography>
          </Stack>
        );
    }
  };
  const renderBody = (
    <Stack
      sx={{
        p: 1.5,
        minWidth: 48,
        maxWidth: 'calc(100vw - 120px)',
        borderRadius: 1,
        typography: 'body2',
        bgcolor: 'background.neutral',
        ...(me && {
          color: 'grey.800',
          bgcolor: 'primary.lighter',
        }),
        ...(hasImage && {
          p: 0,
          bgcolor: 'transparent',
        }),
      }}
    >
      {hasImage ? (
        <Box
          component="img"
          alt="attachment"
          src={body}
          onClick={() => onOpenLightbox(body)}
          sx={{
            minHeight: 220,
            borderRadius: 1.5,
            cursor: 'pointer',
            '&:hover': {
              opacity: 0.9,
            },
          }}
        />
      ) : (
        renderBodyContent({ bodyContent: body, type: contentType })
      )}
    </Stack>
  );

  const renderActions = (
    <Stack
      direction="row"
      className="message-actions"
      sx={{
        pt: 0.5,
        opacity: 0,
        top: '100%',
        left: 0,
        position: 'absolute',
        transition: (theme) =>
          theme.transitions.create(['opacity'], {
            duration: theme.transitions.duration.shorter,
          }),
        ...(me && {
          left: 'unset',
          right: 0,
        }),
      }}
    >
      {me && (
        <IconButton size="small" onClick={() => handleSendMessage()}>
          <Iconify icon="solar:reply-bold" width={16} />
        </IconButton>
      )}
      {false && (
        <IconButton size="small">
          <Iconify icon="eva:smiling-face-fill" width={16} />
        </IconButton>
      )}
      {false && (
        <IconButton size="small">
          <Iconify icon="solar:trash-bin-trash-bold" width={16} />
        </IconButton>
      )}
    </Stack>
  );
  return (
    <Stack
      direction="row"
      justifyContent={me ? 'flex-end' : 'unset'}
      sx={{ mb: 5 }}
      alignItems="center"
    >
      {isLoading && <CircularProgress size={20} sx={{ mr: 0.5 }} />}

      {isFailure && (
        <IconButton sx={{ mt: 3, mr: -0.5 }} size="medium" color="error">
          <Iconify icon="material-symbols:error-outline" width={16} />
        </IconButton>
      )}

      {!me && <Avatar alt={username} src={photoURL} sx={{ width: 32, height: 32, mr: 2 }} />}

      <Stack alignItems={me ? 'flex-end' : 'flex-start'}>
        {!isLoading && renderInfo}

        <Stack
          direction="row"
          alignItems="center"
          sx={{
            position: 'relative',
            ...(!isFailure
              ? {
                  '&:hover': {
                    '& .message-actions': {
                      opacity: 1,
                    },
                  },
                }
              : {
                  '& .message-actions': {
                    opacity: 1,
                  },
                }),
          }}
        >
          {renderBody}
          {renderActions}
        </Stack>
      </Stack>
    </Stack>
  );
}

ChatMessageItem.propTypes = {
  conversationId: PropTypes.string,
  message: PropTypes.object,
  onOpenLightbox: PropTypes.func,
  participants: PropTypes.array,
};
