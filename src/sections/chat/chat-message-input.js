import PropTypes from 'prop-types';
import { sub } from 'date-fns';
import { useRef, useState, useCallback, useMemo } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import { useSnackbar } from 'src/components/snackbar';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
// hooks
import { useAuthContext } from 'src/auth/hooks';
// utils
import uuidv4 from 'src/utils/uuidv4';

// redux
import { useDispatch } from 'src/redux/store';
import { sendMessage } from 'src/redux/slices/chat';
// components
import Iconify from 'src/components/iconify';
import moment from 'moment';
import {
  fileManagerService,
  fileService,
  messagingService,
} from 'src/composables/context-provider';

// ----------------------------------------------------------------------

export default function ChatMessageInput({
  recipients,
  onAddRecipients,
  sendMessageToOpenVidu,
  //
  disabled,
  selectedConversationId,
}) {
  const router = useRouter();

  const dispatch = useDispatch();

  const { enqueueSnackbar } = useSnackbar();

  const { user } = useAuthContext();

  const fileRef = useRef(null);

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
    if (event.key !== 'Enter' && !event.shiftKey) {
      setMessage(event.target.value);
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
        console.log('event', message);
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
      conversationData,
      message,
      messageData,
      dispatch,
      createConversation,
      onAddRecipients,
      router,
      selectedConversationId,
      enqueueSnackbar,
    ]
  );

  const uploadImage = async () => {
    if (imageRef.current) {
      const file = imageRef.current.files[0];
      const formData = new FormData();
      formData.append('file', file);
      const { link } = await fileService.upload(formData);
      await fileManagerService.createCurrentUser({
        url: link,
        label: file.name,
        size: file.size,
        type: `${file.name.split('.').pop()}`,
        lastModified: new Date(file.lastModified),
      });
      await dispatch(
        sendMessage(selectedConversationId, {
          ...messageData,
          body: link,
          message: link,
          contentType: 'image',
        })
      );
    }
  };
  const uploadFile = async () => {
    if (fileRef.current) {
      const file = fileRef.current.files[0];
      const formData = new FormData();
      formData.append('file', file);
      const { link } = await fileService.upload(formData);
      await fileManagerService.createCurrentUser({
        url: link,
        label: file.name,
        size: file.size,
        type: `${file.name.split('.').pop()}`,
        lastModified: new Date(file.lastModified),
      });
      await dispatch(
        sendMessage(selectedConversationId, {
          ...messageData,
          body: link,
          message: link,
          contentType: `${file.name.split('.').pop()}`,
        })
      );
    }
  };
  return (
    <>
      <InputBase
        type="search"
        inputProps={{ enterKeyHint: 'send' }}
        value={message}
        onKeyUp={handleSendMessage}
        onChange={handleChangeMessage}
        placeholder="请输入内容"
        disabled={disabled}
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

      <input
        onChange={uploadImage}
        type="file"
        ref={imageRef}
        style={{ display: 'none' }}
        accept="image/*"
      />
      <input onChange={uploadFile} type="file" ref={fileRef} style={{ display: 'none' }} />
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
