import { useEffect, useState, useCallback,useLayoutEffect } from 'react';
// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Divider from '@mui/material/Divider';
// routes
import { useSearchParams } from 'src/routes/hook';
// hooks
import Live2DCanvas from 'src/components/live2d';
import { useAuthContext } from 'src/auth/hooks';
import { useResponsive } from 'src/hooks/use-responsive';
import { useMeteorContext } from 'src/meteor/hooks';
// components
import { useSettingsContext } from 'src/components/settings';
//
import { useDispatch, useSelector } from 'src/redux/store';
import {
  getSessions,
  resetActiveConversation,
  getMessages,
  getConversationByConversationKey,
  deleteConversation,
  // newMessageGet,
} from 'src/redux/slices/chat';
import {
  SmallWebRTCTransport
} from "@pipecat-ai/small-webrtc-transport";

import { useSnackbar } from 'src/components/snackbar';
import { RTVIClient } from "@pipecat-ai/client-js";
import { RTVIClientProvider, RTVIClientAudio } from '@pipecat-ai/client-react';
import ChatNav from '../chat-nav';
import ChatRoom from '../chat-room';
import ChatMessageList from '../chat-message-list';
import ChatMessageInput from '../chat-message-input';
import ChatNavItem from '../chat-nav-item';

const conversationSelector = (state) => {
  const { conversations, activeConversationId } = state.chat;
  const conversation = activeConversationId ? conversations.byId[activeConversationId] : null;
  if (conversation) {
    return conversation;
  }
  const initState = {
    _id: '',
    messages: [],
    participants: [],
    unreadCount: 0,
    type: '',
  };
  return initState;
};

function calcHeight(isDesktop, selectedConversationId) {
  if (isDesktop) {
    return '72vh';
  }
  return selectedConversationId ? 'calc(100vh - 70px)' : 'calc(100vh - 140px)';
}

const TABS = [
  {
    value: 'conversations',
    label: '历史记录',
    count: 0,
  },
];

const transport = new SmallWebRTCTransport();
const connectUrl =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:7860/api/bot'
    : 'http://192.168.110.137:7860/api/bot';
    // : 'https://hope.lourd.top:7860/api/bot';
const client = new RTVIClient({
  params: {
    baseUrl: connectUrl,
    endpoint: {
      connect: "/bot/offer",
      action: "/action",
    },
  },
  transport,
  enableMic: true,
  customConnectHandler: () => Promise.resolve(),
  callbacks: {
    onTransportStateChanged: (state) => {
      console.log(`Transport state: ${state}`)
    },
    onConnected: () => {
      console.log("onConnected")
    },
    onBotReady: () => {
      console.log("onBotReady")
      transport.state = 'ready'
    },
    onDisconnected: () => {
      console.log("onDisconnected")
    },
    onUserStartedSpeaking: () => {
      console.log("User started speaking.")
    },
    onUserStoppedSpeaking: () => {
      console.log("User stopped speaking.")
    },
    onBotStartedSpeaking: () => {
      console.log("Bot started speaking.")
    },
    onBotStoppedSpeaking: () => {
      console.log("Bot stopped speaking.")
    },
    onUserTranscript: async (transcript) => {
      if (transcript.final) {
        console.log(`User transcript: ${transcript.text}`)
      }
    },
    onBotTranscript: (transcript) => {
      console.log(`Bot transcript: ${transcript.text}`)
    },
    onServerMessage: (msg) => {
      console.log(`Server message: ${msg}`)
    }
  },
});

export default function ChatView() {
  const { server: ddpclient } = useMeteorContext();
  const { enqueueSnackbar } = useSnackbar();

  const dispatch = useDispatch();

  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  
  const [currentTab, setCurrentTab] = useState('conversations');

  const [loading, setLoading] = useState(true);

  const { conversations, messages, sendingMessage, contacts } = useSelector((state) => state.chat);

  const conversation = useSelector((state) => conversationSelector(state));

  // const { active } = useSelector((state) => state.scope);

  const isDesktop = useResponsive('up', 'md');

  const { user } = useAuthContext();

  const settings = useSettingsContext();

  const [messageLimit, setMessageLimit] = useState(20);

  const searchParams = useSearchParams();

  const selectedConversationId = searchParams.get('id') || null;

  const [recipients, setRecipients] = useState([]);

  const [conversationsLoading, setConversationsLoading] = useState(true);

  const getDetails = useCallback(async () => {
    setConversationsLoading(true);
    await dispatch(getConversationByConversationKey(selectedConversationId));
    await dispatch(getMessages(selectedConversationId, 0));
    setConversationsLoading(false);
  }, [dispatch, selectedConversationId]);

  // 刷新 Conversations
  const onRefreshWithConversations = useCallback(async () => {
    setLoading(true);
    await dispatch(getSessions());
    setLoading(false);
  }, [dispatch]);

  // useLayoutEffect(() => {
  //   const handleScroll = () => {
  //     console.log('handleScroll');
  //     const scroller = document.scrollingElement;
  //     if (!scroller) return;
  //     const scrollBottom =
  //       scroller.scrollHeight - scroller.clientHeight - scroller.scrollTop;
  //     setShowScrollToBottom(
  //       scroller.scrollHeight > scroller.clientHeight && scrollBottom > 150,
  //     );
  //   };
  //   document.addEventListener("scroll", handleScroll);
  //   return () => {
  //     document.removeEventListener("scroll", handleScroll);
  //   };
  // }, []);

  useEffect(() => {
    if (!selectedConversationId) {
      switch (currentTab) {
        case 'conversations':
          onRefreshWithConversations();
          break;
        default:
          break;
      }
      dispatch(resetActiveConversation());
    } else {
      getDetails();
    }
  }, [
    currentTab,
    ddpclient,
    dispatch,
    getDetails,
    onRefreshWithConversations,
    selectedConversationId,
    user._id,
  ]);

  let participants = [];

  if (conversation) {
    if (conversation.participants) {
      participants =
        conversation.type !== 'GROUP'
          ? conversation.participants.filter((participant) => participant._id !== user?._id)
          : conversation.participants;
    } else {
      participants =
        conversation.type !== 'GROUP'
          ? conversation._participants.filter((participant) => participant._id !== user?._id)
          : conversation._participants;
    }
  } else {
    participants = [];
  }

  const removeConversation = async (conversationId) => {
    await dispatch(deleteConversation(conversationId));
    enqueueSnackbar('删除成功');
  };
  const details = !!conversation && conversation._id;

  const renderNav = (
    <ChatNav
      contacts={contacts.allIds.map((id) => contacts.byId[id])}
      conversations={conversations}
      loading={conversationsLoading}
      selectedConversationId={selectedConversationId}
    />
  );

  const onRefresh = async (currentMessageLimit) => {
    setMessageLimit(currentMessageLimit + 20);
    await dispatch(getMessages(selectedConversationId, messageLimit));
  };

  const renderMessages = (
    <Stack
      sx={{
        width: 1,
        height: 1,
        overflow: 'hidden',
      }}
    >
      <Live2DCanvas />
      <ChatMessageList  
        autoscroll={showScrollToBottom}
        conversationId={selectedConversationId}
        messages={messages.byId[selectedConversationId]}
        sendingMessages={(sendingMessage.byId && sendingMessage.byId[selectedConversationId]) || []}
        participants={participants}
        onRefresh={onRefresh}
        user={user}
      />

      <ChatMessageInput
        recipients={recipients}
        participants={participants}
        selectedConversationId={selectedConversationId}
        disabled={!recipients.length && !selectedConversationId}
      />
    </Stack>
  );

  const handleChangeTab = useCallback((event, newValue) => {
    setCurrentTab(newValue);
  }, []);

  const renderTabs = (
    <Tabs sx={{ width: '100%' }} variant="fullWidth" value={currentTab} onChange={handleChangeTab}>
      {TABS.map((tab) => (
        <Tab key={tab.value} iconPosition="end" value={tab.value} label={tab.label} />
      ))}
      )
    </Tabs>
  );

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      {isDesktop && (
        <Typography
          variant="h4"
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        >
          Chatgpt(AI 聊天)
        </Typography>
      )}
      {(isDesktop || selectedConversationId) && (
        <RTVIClientProvider client={client}>
          <Stack
            component={Card}
            direction="row"
            className="bottom-chat"
            sx={{ height: calcHeight(isDesktop, selectedConversationId) }}
          >
            {renderNav}
            <Stack
              sx={{
                width: 1,
                height: 1,
                overflow: 'hidden',
              }}
            >
              <Stack
                direction="row"
                sx={{
                  width: 1,
                  height: 1,
                  overflow: 'hidden',
                  borderTop: (theme) => `solid 1px ${theme.palette.divider}`,
                }}
              >
                {renderMessages}

                {details && (
                  <ChatRoom
                    conversation={conversation}
                    messages={messages.byId[selectedConversationId]}
                    participants={participants}
                  />
                )}
              </Stack>
            </Stack>
          </Stack>
          <RTVIClientAudio />
        </RTVIClientProvider>
      )}
      {!selectedConversationId && (
        <Stack>
          {!isDesktop && (
            <>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="center"
                sx={{ pl: 0, pr: 0 }}
              >
                {renderTabs}
              </Stack>
              <Divider />
              {currentTab === 'conversations' && (
                <>
                  {conversations.allIds.map(
                    (conversationId) =>
                      !conversations.byId[conversationId].isRemove &&
                      conversations.byId[conversationId].sessionId && (
                        <ChatNavItem
                          key={conversationId}
                          deleteConversation={() => {
                            removeConversation(conversationId);
                          }}
                          conversation={{
                            ...conversations.byId[conversationId],
                            isGroup: conversations.byId[conversationId].type,
                            type: 'conversation',
                          }}
                          selected={conversationId === selectedConversationId}
                        />
                      )
                  )}
                </>
              )}
            </>
          )}
        </Stack>
      )}
    </Container>
  );
}
