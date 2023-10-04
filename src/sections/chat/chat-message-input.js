import PropTypes from 'prop-types';
import { sub } from 'date-fns';
import { useRef, useState, useCallback, useMemo } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
// hooks
import { useAuthContext } from 'src/auth/hooks';
// utils
import uuidv4 from 'src/utils/uuidv4';

// redux
import { useDispatch } from 'src/redux/store';
import {
  sendMessage,
} from 'src/redux/slices/chat';
// components
import Iconify from 'src/components/iconify';
import moment from 'moment';
import { fileService, messagingService } from 'src/composables/context-provider';

// ----------------------------------------------------------------------

export default function ChatMessageInput ({
  recipients,
  onAddRecipients,
  sendMessageToOpenVidu,
  //
  disabled,
  selectedConversationId,
}) {
  const router = useRouter();

  const dispatch = useDispatch();

  const { user } = useAuthContext();

  const fileRef = useRef(null);

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
      createdAt: moment(new Date()).format("YYYY/MM/DD hh:mm:ss"),
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

  const handleChangeMessage = useCallback((event) => {
    if (event.key !== 'Enter' && !event.shiftKey) {
      setMessage(event.target.value);
    }
  }, []);

  const createConversation = useCallback(async () => {
    let conversationKey = await messagingService.findExistingConversationWithUsers({
      users: recipients.map(recipient => recipient._id)
    })
    console.log('conversationKey', conversationKey)
    if (!conversationKey) {
      conversationKey = await messagingService.room({
        participants: recipients.map(recipient => recipient._id)
      })
    }
    return conversationKey;
  }, [recipients])
  const handleSendMessage = useCallback(
    async (event) => {
      try {
        console.log('event', event.shiftKey)
        if (event.shiftKey && event.key === 'Enter') {
          if (message) {
            if (selectedConversationId) {
              setType('text')
              await dispatch(sendMessage(selectedConversationId, messageData));
              sendMessageToOpenVidu(message)
            } else {
              const conversationKey = await createConversation(conversationData);
              router.push(`${paths.chat}?id=${conversationKey}`);

              onAddRecipients([]);
            }
          }
          setMessage('');
        }
      } catch (error) {
        console.error(error);
      }
    },
    [conversationData, message, sendMessageToOpenVidu, messageData, dispatch, createConversation, onAddRecipients, router, selectedConversationId]
  );

  const uploadImage = async () => {
    if (fileRef.current) {
      const file = fileRef.current.files[0]
      const formData = new FormData();
      formData.append('file', file);
      const { link } = await fileService.avatar(formData)
      await dispatch(sendMessage(selectedConversationId, {
        ...messageData,
        body: link,
        message: link,
        contentType: 'image'
      }));
    }
  }
  return (
    <>
      <InputBase
        value={message}
        onKeyUp={handleSendMessage}
        onChange={handleChangeMessage}
        placeholder="Type a message"
        disabled={disabled}
        maxRows={3}
        multiline
        startAdornment={
          false && <IconButton>
            <Iconify icon="eva:smiling-face-fill" />
          </IconButton>
        }
        endAdornment={
          <Stack direction="row" sx={{ flexShrink: 0 }}>
            <IconButton onClick={handleAttach}>
              <Iconify icon="solar:gallery-add-bold" />
            </IconButton>
            {
              false && <IconButton onClick={handleAttach}>
                <Iconify icon="eva:attach-2-fill" />
              </IconButton>
            }
            {
              false && <IconButton>
                <Iconify icon="solar:microphone-bold" />
              </IconButton>
            }
          </Stack>
        }
        sx={{
          px: 1,
          margin: '4px 0',
          flexShrink: 0,
          borderTop: (theme) => `solid 1px ${theme.palette.divider}`,
        }}
      />

      <input onChange={uploadImage} type="file" ref={fileRef} style={{ display: 'none' }} />
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
