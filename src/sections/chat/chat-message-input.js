import PropTypes from 'prop-types';
import { useRef, useState, useCallback, useMemo, useEffect } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { useSnackbar } from 'src/components/snackbar';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
// hooks
import { useAuthContext } from 'src/auth/hooks';
import { useMeteorContext } from 'src/meteor/hooks';
import { useBoolean } from 'src/hooks/use-boolean';
// utils
import uuidv4 from 'src/utils/uuidv4';

// redux
import { useDispatch } from 'src/redux/store';
import { sendMessage } from 'src/redux/slices/chat';
// components
import Iconify from 'src/components/iconify';
import { fileService, messagingService } from 'src/composables/context-provider';
import ChatClipboardDialog from './chat-clipboard-dialog';

// ----------------------------------------------------------------------

export default function ChatMessageInput({
  recipients,
  onAddRecipients,
  sendMessageToOpenVidu,
  //
  disabled,
  selectedConversationId,
}) {
  const { server: ddpclient } = useMeteorContext();
  const loading = useBoolean(false);

  const clipboardOpen = useBoolean(false);

  const [clipboard, setClipboard] = useState({});

  const router = useRouter();

  const dispatch = useDispatch();

  const { enqueueSnackbar } = useSnackbar();

  const { user } = useAuthContext();

  const fileRef = useRef(null);

  const clipboardRef = useRef(null);

  const imageRef = useRef(null);

  const [message, setMessage] = useState('');

  const [type, setType] = useState('text');

  const myContact = useMemo(
    () => ({
      _id: user._id,
      role: user.role,
      email: user.email,
      address: user.address,
      name: user.displayName,
      username: user.username,
      lastActivity: new Date(),
      photoURL: user.photoURL,
      phoneNumber: user.phoneNumber,
      status: 'online',
    }),
    [user]
  );

  const messageData = useMemo(
    () => ({
      id: uuidv4(),
      conversationId: selectedConversationId,
      attachments: [],
      body: message,
      message,
      contentType: type,
      // createdAt: sub(new Date(), { minutes: 1 }),
      createdAt: new Date().toISOString(),
      senderId: myContact._id,
    }),
    [message, type, selectedConversationId, myContact._id]
  );

  const conversationData = useMemo(
    () => ({
      id: uuidv4(),
      messages: [messageData],
      participants: [...recipients, myContact],
      type: recipients.length > 1 ? 'GROUP' : 'ONE_TO_ONE',
      unreadCount: 0,
    }),
    [messageData, myContact, recipients]
  );

  const handleAttach = useCallback(() => {
    if (fileRef.current) {
      fileRef.current.click();
    }
  }, []);

  const handleImage = useCallback(() => {
    if (imageRef.current) {
      imageRef.current.click();
    }
  }, []);

  const handleChangeMessage = useCallback((event) => {
    if (event.key !== 'Enter' || !event.shiftKey) {
      setMessage(event.target.value.replace(/\n/g, ''));
    }
  }, []);

  const createConversation = useCallback(async () => {
    let conversationKey = await messagingService.findExistingConversationWithUsers({
      users: recipients.map((recipient) => recipient._id),
    });
    if (!conversationKey) {
      conversationKey = await messagingService.room({
        participants: recipients.map((recipient) => recipient._id),
      });
    }
    return conversationKey;
  }, [recipients]);

  const handleSendMessage = useCallback(
    async (event) => {
      try {
        if (event.key === 'Enter') {
          if (message && message !== '\n') {
            if (selectedConversationId) {
              setType('text');
              try {
                await dispatch(sendMessage(selectedConversationId, messageData));
                setMessage('');
              } catch (e) {
                enqueueSnackbar(e.message);
              }
            } else {
              setMessage('');
              const conversationKey = await createConversation(conversationData);
              router.push(`${paths.chat}?id=${conversationKey}`);
              onAddRecipients([]);
            }
          } else {
            setMessage('');
          }
        }
      } catch (error) {
        console.error(error);
      }
    },
    [
      message,
      selectedConversationId,
      dispatch,
      messageData,
      enqueueSnackbar,
      createConversation,
      conversationData,
      router,
      onAddRecipients,
    ]
  );
  const handlePaste = useCallback(
    (event) => {
      console.log(event);
      const { items } = event.clipboardData || event.originalEvent.clipboardData;
      if (items) {
        for (let i = 0; i < items.length; i += 1) {
          if (items[i].kind === 'file') {
            const blob = items[i].getAsFile();
            const url = URL.createObjectURL(new Blob([blob], { type: blob.type }));
            setClipboard({
              type: blob.type,
              size: blob.size,
              url,
              lastModified: blob.lastModified,
              label: blob.name,
              name: blob.name,
            });
            const file = new File([blob], blob.name);
            const fileList = new DataTransfer();
            fileList.items.add(file);
            fileRef.current.files = fileList.files;
            clipboardOpen.onTrue();
            return;
          }
        }
      }
    },
    [clipboardOpen]
  );
  const uploadImage = async () => {
    try {
      if (imageRef.current) {
        loading.onTrue();
        const file = imageRef.current.files[0];
        const formData = new FormData();
        formData.append('file', file);
        const { link } = await fileService.uploadToMessage(formData);
        // await fileManagerService.createCurrentUser({
        //   url: link,
        //   label: file.name,
        //   size: file.size,
        //   type: `${file.name.split('.').pop()}`,
        //   lastModified: new Date(file.lastModified),
        // });
        await dispatch(
          sendMessage(selectedConversationId, {
            ...messageData,
            body: link,
            message: link,
            attachments: [
              {
                name: file.name,
                preview: link,
                type: 'image',
                createdAt: new Date(),
              },
            ],
            contentType: 'image',
          })
        );
      }
      loading.onFalse();
      enqueueSnackbar('图片上传成功');
    } catch (e) {
      enqueueSnackbar(e?.response?.data?.message);
      loading.onFalse();
    }
  };
  const uploadFile = async () => {
    try {
      loading.onTrue();
      if (fileRef.current) {
        const file = fileRef.current.files[0];
        const formData = new FormData();
        formData.append('file', file);
        const { link } = await fileService.uploadToMessage(formData);
        // await fileManagerService.createCurrentUser({
        //   url: link,
        //   label: file.name,
        //   size: file.size,
        //   type: `${file.name.split('.').pop()}`,
        //   lastModified: new Date(file.lastModified),
        // });
        await dispatch(
          sendMessage(selectedConversationId, {
            ...messageData,
            body: link,
            message: link,
            contentType: `${file.name.split('.').pop()}`,
            attachments: [
              {
                name: file.name,
                preview: link,
                type: `${file.name.split('.').pop()}`,
                createdAt: new Date(),
              },
            ],
          })
        );
        enqueueSnackbar('文件上传成功');
        clipboardOpen.onFalse();
        loading.onFalse();
      }
    } catch (e) {
      enqueueSnackbar(e?.response?.data?.message);
      loading.onFalse();
    }
  };
  // useEffect(() => {
  //   document.addEventListener('paste', handlePaste);
  //   return () => {
  //     document.removeEventListener('paste', handlePaste);
  //   };
  // }, [handlePaste]);

  const triggerPasteEvent = () => {
    try {
      const pasteEvent = new Event('paste', {
        bubbles: true,
        cancelable: true,
      });

      // 手动触发 onPaste 事件
      clipboardRef.current.dispatchEvent(pasteEvent);
    } catch (error) {
      console.error('Error triggering paste event:', error);
    }
  };

  return (
    <>
      <Box sx={{ width: '100%' }}>
        {loading.value && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              zIndex: 10,
              backgroundColor: '#ffffffc4',
              width: '100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Box>
              <CircularProgress />
              <Typography variant="body2">正在上传...</Typography>
            </Box>
          </Box>
        )}
        <InputBase
          type="search"
          className="message-input"
          inputProps={{ enterKeyHint: 'send' }}
          value={message}
          onKeyUp={handleSendMessage}
          onPaste={handlePaste}
          onChange={handleChangeMessage}
          placeholder="请输入内容"
          disabled={disabled || loading.value}
          maxRows={3}
          multiline
          startAdornment={
            false && (
              <IconButton>
                <Iconify icon="eva:smiling-face-fill" />
              </IconButton>
            )
          }
          endAdornment={
            <Stack direction="row" sx={{ flexShrink: 0 }}>
              <IconButton onClick={triggerPasteEvent}>
                <Iconify icon="streamline:copy-paste" />
              </IconButton>
              <IconButton onClick={handleImage}>
                <Iconify icon="solar:gallery-add-bold" />
              </IconButton>
              <IconButton onClick={handleAttach}>
                <Iconify icon="eva:attach-2-fill" />
              </IconButton>
              {false && (
                <IconButton>
                  <Iconify icon="solar:microphone-bold" />
                </IconButton>
              )}
            </Stack>
          }
          sx={{
            px: 1,
            margin: '4px 0',
            flexShrink: 0,
            borderTop: (theme) => `solid 1px ${theme.palette.divider}`,
          }}
        />
      </Box>
      <input
        onChange={uploadImage}
        type="file"
        ref={imageRef}
        style={{ display: 'none' }}
        accept="image/*"
      />
      <input
        onChange={uploadFile}
        type="file"
        ref={fileRef}
        style={{ display: 'none' }}
        accept=".xls,.xlsx,.pdf,.doc,.docx,.ppt,.pptx,.mp4,.mov,.avi,.mkv,.mp3"
      />
      <input
        ref={clipboardRef}
        type="file"
        style={{ display: 'none' }}
        contentEditable="true"
        onPaste={handlePaste}
      />
      <ChatClipboardDialog
        open={clipboardOpen.value}
        onClose={clipboardOpen.onFalse}
        data={clipboard}
        onUpload={uploadFile}
      />
    </>
  );
}

ChatMessageInput.propTypes = {
  disabled: PropTypes.bool,
  onAddRecipients: PropTypes.func,
  recipients: PropTypes.array,
  sendMessageToOpenVidu: PropTypes.func,
  selectedConversationId: PropTypes.string,
};
