import PropTypes from 'prop-types';
import { useRef, useState, useCallback, useMemo } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Editor from 'src/components/editor';
import InputBase from '@mui/material/InputBase';
import Button from '@mui/material/Button';
import emitter from "src/utils/eventEmitter";
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
import {
  useRTVIClient,
  useRTVIClientMediaTrack,
  useRTVIClientTransportState,
} from "@pipecat-ai/client-react";

// ----------------------------------------------------------------------

export default function ChatMessageInput({
  recipients,
  onAddRecipients,
  sendMessageToOpenVidu,
  participants,
  //
  disabled,
  selectedConversationId,
}) {
  const loading = useBoolean(false);

  const clipboardOpen = useBoolean(false);

  const [clipboard, setClipboard] = useState({});

  const router = useRouter();

  const dispatch = useDispatch();

  const { enqueueSnackbar } = useSnackbar();

  const { user } = useAuthContext();

  const [sendingType, setSendingType] = useState('send');

  const fileRef = useRef(null);

  const clipboardRef = useRef(null);

  const imageRef = useRef(null);

  const [message, setMessage] = useState('');

  const [type, setType] = useState('text');

  const rtviClient = useRTVIClient();

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

  const handleSendAudio = useCallback(async () => {
    console.log('send audio');
    await rtviClient.connect()
    enqueueSnackbar("连接成功");
    // await rtviClient.
  }, [rtviClient, enqueueSnackbar]);

  const handleRTVIMessage = useCallback(async (currentMessage) => {
    // const content = [
    //   {
    //     type: "text",
    //     text: message,
    //   },
    // ];

    emitter.emit("userTextMessage", message);
    rtviClient.params.requestData = {
      ...(rtviClient.params.requestData ?? {}),
      conversation_id: selectedConversationId,
      user_id: user._id,
      participant_id: participants[0]._id,
    };
    await rtviClient.action({
      service: "llm",
      action: "append_to_messages",
      arguments: [
        {
          name: "messages",
          value: [
            {
              role: "user",
              content: currentMessage,
            },
          ],
        },
      ],
    });
  }, [message, participants, rtviClient, selectedConversationId, user._id]);

  const handleSendMessage = useCallback(
    async (event) => {
      try {
        if (message && message !== '\n') {
          if (selectedConversationId) {
            setType('text');
            try {
              // await dispatch(sendMessage(selectedConversationId, messageData));
              // dispatch(openai(selectedConversationId, message));
              await handleRTVIMessage(message);
              setMessage('');
            } catch (e) {
              enqueueSnackbar(e);
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
      } catch (error) {
        console.error(error);
      }
    },
    [message, selectedConversationId, handleRTVIMessage, enqueueSnackbar, createConversation, conversationData, router, onAddRecipients]
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
        <Stack spacing={2} flexGrow={1} sx={{ p: 2 }}>
          <InputBase
            type="search"
            className="message-input"
            inputProps={{ enterKeyHint: sendingType }}
            value={message}
            // onKeyUp={handleSendMessage}
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
            sx={{
              px: 1,
              margin: '4px 0',
              flexShrink: 0,
              borderTop: (theme) => `solid 1px ${theme.palette.divider}`,
            }}
          />
          {/* <Editor
            simple
            value={message}
            onChange={setMessage}
            placeholder="输入消息"
            sx={{
              '& .ql-editor': {},
              ...(true && {
                height: 1,
                '& .quill': {
                  height: 1,
                },
                '& .ql-editor': {
                  maxHeight: 'unset',
                },
              }),
            }}
          /> */}

          <Stack direction="row" alignItems="center">
            <Stack direction="row" alignItems="center" flexGrow={1}>
              <IconButton onClick={handleSendAudio}>
                <Iconify icon="solar:soundwave-broken" />
              </IconButton>
              <IconButton>
                <Iconify icon="solar:gallery-add-bold" />
              </IconButton>

              <IconButton>
                <Iconify icon="eva:attach-2-fill" />
              </IconButton>
            </Stack>

            <Button
              variant="contained"
              color="primary"
              onClick={handleSendMessage}
              endIcon={<Iconify icon="iconamoon:send-fill" />}
            >
              发送
            </Button>
          </Stack>
        </Stack>
        {/* <InputBase
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
        /> */}
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
      {/* <ChatClipboardDialog
        open={clipboardOpen.value}
        onClose={clipboardOpen.onFalse}
        data={clipboard}
        onUpload={uploadFile}
      /> */}
    </>
  );
}

ChatMessageInput.propTypes = {
  disabled: PropTypes.bool,
  onAddRecipients: PropTypes.func,
  recipients: PropTypes.array,
  sendMessageToOpenVidu: PropTypes.func,
  participants: PropTypes.array,
  selectedConversationId: PropTypes.string,
};
