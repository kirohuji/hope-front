import { useEffect, useState, useCallback } from 'react';
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
  newMessageGet,
} from 'src/redux/slices/chat';
import _ from 'lodash';
import { useSnackbar } from 'src/components/snackbar';
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

export default function ChatView() {
  const { server: ddpclient } = useMeteorContext();
  const { enqueueSnackbar } = useSnackbar();

  const dispatch = useDispatch();

  const [currentTab, setCurrentTab] = useState('conversations');

  const [loading, setLoading] = useState(true);

  const { conversations, messages, sendingMessage, contacts } = useSelector((state) => state.chat);

  const conversation = useSelector((state) => conversationSelector(state));

  const { active } = useSelector((state) => state.scope);

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

  useEffect(() => {
    let sub = null;
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
      if (user._id) {
        sub = ddpclient.subscribe(
          'socialize.messagesFor2',
          selectedConversationId,
          user._id,
          new Date()
        );
        sub.ready().then(() => {
          ddpclient.onChangeFuncs = ddpclient.onChangeFuncs.filter(
            (item) => item.collection !== 'socialize:messages'
          );
          const collection = ddpclient.collection('socialize:messages');
          collection.onChange((target) => {
            if (target.added) {
              dispatch(newMessageGet(selectedConversationId));
            }
          });
        });
      }
      getDetails();
    }
    return () => {
      if (sub) {
        sub.stop();
      }
    };
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
      <ChatMessageList
        conversationId={selectedConversationId}
        messages={messages.byId[selectedConversationId]}
        sendingMessages={(sendingMessage.byId && sendingMessage.byId[selectedConversationId]) || []}
        participants={participants}
        onRefresh={onRefresh}
      />

      <ChatMessageInput
        recipients={recipients}
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
      {isDesktop && (
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
                      !conversations.byId[conversationId].isRemove && (
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
