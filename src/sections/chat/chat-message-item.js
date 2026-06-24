import PropTypes from 'prop-types';
import { useCallback, useEffect, useRef, useState } from 'react';
import CryptoJS from 'crypto-js';
import { formatDistanceToNowStrict } from 'date-fns';
// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
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
import { sendMessage, deleteMessage } from 'src/redux/slices/chat';
import { loadAndCacheAudio } from 'src/utils/audio-cache';
import { useGetMessage } from './hooks';

const secretKey = 'future';

// ----------------------------------------------------------------------

export default function ChatMessageItem({ message, participants, onOpenLightbox, conversationId }) {
  const audioObjRef = useRef(null);
  const containerRef = useRef(null);

  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioEnded, setAudioEnded] = useState(false);
  const [audioLoaded, setAudioLoaded] = useState(false);

  const dispatch = useDispatch();

  const { user } = useAuthContext();

  const { me, senderDetails, hasImage } = useGetMessage({
    message,
    participants,
    currentUserId: user._id,
  });

  const { username, photoURL, displayName, realName } = senderDetails;

  const { body, attachments, contentType, createdAt, isLoading, isFailure } = message;

  const decryptedBody =
    contentType === 'text'
      ? CryptoJS.AES.decrypt(message.body, secretKey).toString(CryptoJS.enc.Utf8)
      : '';
  const hasMentionAll = decryptedBody.includes('@全体');

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

  const handleSendMessage = useCallback(async () => {
    try {
      await dispatch(
        sendMessage(conversationId, {
          ...message,
          message: CryptoJS.AES.decrypt(message.body, secretKey).toString(CryptoJS.enc.Utf8),
        })
      );
    } catch (e) {
      console.error();
    }
  }, [conversationId, dispatch, message]);

  const handleDeleteMessage = useCallback(async () => {
    try {
      await dispatch(deleteMessage(conversationId, message._id));
    } catch (e) {
      console.error(e);
    }
  }, [conversationId, dispatch, message._id]);

  const handleToggleAudio = useCallback(async () => {
    const audio = audioObjRef.current;
    if (!audio) {
      return;
    }

    if (audioPlaying) {
      audio.pause();
      setAudioPlaying(false);
      return;
    }

    if (audioEnded) {
      audio.currentTime = 0;
    }

    try {
      await audio.play();
      setAudioPlaying(true);
      setAudioEnded(false);
    } catch (e) {
      // 用户手势不足或加载失败时静默处理
      console.warn('Audio play failed:', e);
    }
  }, [audioEnded, audioPlaying]);

  const handleAudioEnded = useCallback(() => {
    setAudioPlaying(false);
    setAudioEnded(true);
  }, []);

  // 使用 IntersectionObserver + IndexedDB 缓存在消息进入视口时预加载音频
  useEffect(() => {
    const isAudioType = ['audio', 'mp3', 'wav', 'aac', 'm4a', 'ogg', 'webm'].includes(contentType);
    if (!isAudioType || !message?.body) {
      return undefined;
    }

    const decryptedUrl = CryptoJS.AES.decrypt(message.body, secretKey).toString(CryptoJS.enc.Utf8);
    if (!decryptedUrl) {
      return undefined;
    }

    let observer = null;
    let currentAudio = null;
    let objectUrl = null;
    let cancelled = false;

    const startLoading = async () => {
      if (audioObjRef.current || cancelled) return;

      try {
        // 从 IndexedDB 缓存加载（命中则秒播，未命中则下载并缓存）
        objectUrl = await loadAndCacheAudio(decryptedUrl);
        if (cancelled) {
          URL.revokeObjectURL(objectUrl);
          return;
        }

        currentAudio = new Audio(objectUrl);
        currentAudio.preload = 'auto';
        audioObjRef.current = currentAudio;

        currentAudio.addEventListener('ended', handleAudioEnded);
        currentAudio.addEventListener('error', () => {
          setAudioLoaded(false);
        });
        currentAudio.addEventListener('canplay', () => {
          setAudioLoaded(true);
        });

        currentAudio.load();
      } catch {
        // 加载失败，静默处理
        if (objectUrl) URL.revokeObjectURL(objectUrl);
      }
    };

    // 用 IntersectionObserver 检测消息是否进入视口
    if (containerRef.current) {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            startLoading();
            observer.disconnect();
          }
        },
        { rootMargin: '200px' } // 提前 200px 开始加载
      );
      observer.observe(containerRef.current);
    } else {
      // fallback: 立即加载
      startLoading();
    }

    return () => {
      cancelled = true;
      if (observer) observer.disconnect();
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.removeEventListener('ended', handleAudioEnded);
        currentAudio.src = '';
      }
      if (objectUrl && !currentAudio) {
        // 如果 Audio 对象还没创建但已经拿到了 objectUrl
        URL.revokeObjectURL(objectUrl);
      }
      audioObjRef.current = null;
    };
  }, [contentType, message?.body, handleAudioEnded]);

  const isExpired = (target) => {
    if (target.createAt) {
      const createAt = new Date(target.createAt);
      const now = new Date();
      const threeDaysAgo = new Date(now.setDate(now.getDate() - 3));
      return createAt < threeDaysAgo;
    }
    return false;
  };
  const renderBodyContent = ({ type }) => {
    let audioActionIcon = 'solar:play-bold';

    if (audioPlaying) {
      audioActionIcon = 'solar:pause-bold';
    } else if (audioEnded) {
      audioActionIcon = 'solar:restart-bold';
    }

    switch (type) {
      case 'text':
        return (
          <div
            style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}
            dangerouslySetInnerHTML={{
              __html: decryptedBody.replace(
                /@全体/g,
                '<span style="color: #B76E00; font-weight: 700; font-size: 1.05em;">@全体</span>'
              ),
            }}
          />
        );
      case 'audio':
      case 'mp3':
      case 'wav':
      case 'aac':
      case 'm4a':
      case 'ogg':
      case 'webm':
        return (
          <Stack direction="row" alignItems="center" spacing={1}>
            <IconButton
              size="small"
              onClick={handleToggleAudio}
              disabled={!audioLoaded}
              sx={{
                width: 32,
                height: 32,
                bgcolor: me ? 'primary.main' : 'text.primary',
                color: me ? 'primary.contrastText' : 'background.paper',
                '&:hover': {
                  bgcolor: me ? 'primary.dark' : 'text.secondary',
                },
                ...(!audioLoaded && {
                  opacity: 0.5,
                }),
              }}
            >
              {!audioLoaded ? (
                <CircularProgress size={16} sx={{ color: 'inherit' }} />
              ) : (
                <Iconify width={18} icon={audioActionIcon} />
              )}
            </IconButton>
          </Stack>
        );
      default:
        return (
          <Stack spacing={1} direction="row" alignItems="center" sx={{ position: 'relative' }}>
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
            {isExpired(attachments[0]) && (
              <Chip
                label="已过期"
                color="error"
                size="small"
                sx={{
                  position: 'absolute',
                  top: '-20px',
                  zIndex: 2,
                  left: '-20px',
                }}
              />
            )}
            {isExpired(attachments[0]) && (
              <Box
                sx={{
                  zIndex: 1,
                  position: 'absolute',
                  top: '-12px',
                  left: '-12px',
                  borderRadius: 1.5,
                  width: 'calc(100% + 24px)',
                  height: 'calc(100% + 24px)',
                  backgroundColor: 'rgba(0, 0, 0, 0.2)', // 半透明黑色遮罩
                }}
              />
            )}
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
        ...(hasMentionAll && {
          borderLeft: '3px solid',
          borderColor: 'warning.main',
          bgcolor: (theme) => theme.palette.warning.lighter,
          boxShadow: (theme) => `0 1px 4px ${theme.palette.warning.main}40`,
        }),
        ...(me && {
          color: 'grey.800',
          bgcolor: 'primary.lighter',
        }),
        ...(me &&
          hasMentionAll && {
            color: 'grey.800',
            bgcolor: (theme) => theme.palette.warning.lighter,
            borderColor: 'warning.main',
          }),
        ...(hasImage && {
          p: 0,
          bgcolor: 'transparent',
          borderLeft: 'none',
          boxShadow: 'none',
        }),
      }}
    >
      {hasImage ? (
        <Box
          component="img"
          alt="attachment"
          src={CryptoJS.AES.decrypt(body, secretKey).toString(CryptoJS.enc.Utf8)}
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
        renderBodyContent({ type: contentType })
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
      {/* {false && (
        <IconButton size="small">
          <Iconify icon="eva:smiling-face-fill" width={16} />
        </IconButton>
      )} */}
      {me && (
        <IconButton size="small" onClick={handleDeleteMessage}>
          <Iconify icon="solar:trash-bin-trash-bold" width={16} />
        </IconButton>
      )}
    </Stack>
  );
  return (
    <Stack
      ref={containerRef}
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
