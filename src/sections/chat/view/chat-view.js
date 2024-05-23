import { useEffect, useState, useCallback } from 'react';
// @mui
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
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
  getConversations,
  resetActiveConversation,
  getMessages,
  getConversationByConversationKey,
  getContacts,
  deleteConversation,
  newMessageGet,
} from 'src/redux/slices/chat';
import _ from 'lodash';
import { useSnackbar } from 'src/components/snackbar';
import ChatOrganization from 'src/sections/chat/chat-organization';
import ChatNav from '../chat-nav';
import ChatRoom from '../chat-room';
import ChatMessageList from '../chat-message-list';
import ChatMessageInput from '../chat-message-input';
import ChatHeaderDetail from '../chat-header-detail';
import ChatHeaderCompose from '../chat-header-compose';
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
    label: '聊天会话',
    count: 0,
  },
  // {
  //   value: 'contacts',
  //   label: ' 联系人',
  //   count: 0,
  // },
  {
    value: 'organizations',
    label: '组织架构',
    count: 0,
  },
  // {
  //   value: 'organizations',
  //   label: '组织架构',
  //   count: 0,
  // },
  // {
  //   value: 'contacts',
  //   label: '我的小组',
  //   count: 0,
  // },
];

let reactiveCollection = null;
let getMessage = null;
// const conversations2Publish = null;
// const conversations2Collection = null;

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

  // 会话获取详情
  const getDetails = useCallback(async () => {
    setConversationsLoading(true);
    // await dispatch(getConversations());
    // 根据会话列表获取当前会话的数据
    await dispatch(getConversationByConversationKey(selectedConversationId));
    // 获取聊天数据,默认从0开始
    await dispatch(getMessages(selectedConversationId, 0));
    setConversationsLoading(false);
  }, [dispatch, selectedConversationId]);

  // 刷新 Organization
  const onRefreshWithOrganization = useCallback(async () => {
    if (active?._id) {
      setLoading(true);
      // onRefreshWithOrganization();
      setLoading(false);
    }
  }, [active?._id, setLoading]);

  // 刷新 Conversations
  const onRefreshWithConversations = useCallback(async () => {
    setLoading(true);
    await dispatch(getConversations());
    setLoading(false);
  }, [dispatch]);

  useEffect(() => {
    if (!selectedConversationId) {
      dispatch(resetActiveConversation());
      switch (currentTab) {
        case 'organizations':
          onRefreshWithOrganization();
          break;
        case 'conversations':
          onRefreshWithConversations();
          break;
        case 'contacts':
          dispatch(getContacts());
          break;
        default:
          break;
      }
    } else {
      console.log('获取数据')
      getDetails();
      if (ddpclient?.connected && user) {
        getMessage = ddpclient.subscribe(
          'socialize.messagesFor2',
          selectedConversationId,
          user._id,
          new Date()
        );
        getMessage.ready();
        reactiveCollection = ddpclient.collection('socialize:messages').reactive();
        reactiveCollection.onChange(
          (target) => {
            if (target.added) {
              console.log('更新了');
              dispatch(newMessageGet(selectedConversationId));
            }
          },
          {
            added: true,
          }
        );
      }
    }

    return () => {
      if (reactiveCollection) {
        reactiveCollection.stop();
        getMessage.stop();
      }
    };
  }, [active._id, currentTab, ddpclient, dispatch, getDetails, onRefreshWithConversations, onRefreshWithOrganization, selectedConversationId, user]);

  let participants = [];

  if (conversation) {
    participants =
      conversation.type !== 'GROUP'
        ? conversation.participants.filter((participant) => participant._id !== user?._id)
        : conversation.participants;
  } else {
    participants = [];
  }

  const handleAddRecipients = useCallback((selected) => {
    setRecipients(selected);
  }, []);

  const removeConversation = async (conversationId) => {
    await dispatch(deleteConversation(conversationId));
    enqueueSnackbar('删除成功');
  };
  const details = !!conversation && conversation._id;

  const renderHead = (
    <Stack
      direction="row"
      alignItems="center"
      flexShrink={0}
      sx={{ pr: 1, pl: 2.5, py: 1, minHeight: 72 }}
    >
      {selectedConversationId ? (
        <>{details && <ChatHeaderDetail participants={participants} />}</>
      ) : (
        <ChatHeaderCompose
          contacts={contacts.allIds.map((id) => contacts.byId[id])}
          onAddRecipients={handleAddRecipients}
        />
      )}
    </Stack>
  );

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
    console.log('messageLimit', messageLimit);
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
        onAddRecipients={handleAddRecipients}
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
          聊天
        </Typography>
      )}
      {(isDesktop || selectedConversationId) && 
        // (conversationsLoading ? (
        //   <Box
        //     sx={{
        //       zIndex: 10,
        //       backgroundColor: '#ffffffc4',
        //       width: '100%',
        //       height: '100%',
        //       display: 'flex',
        //       padding: '16px',
        //       justifyContent: 'center',
        //       alignItems: 'center',
        //     }}
        //   >
        //     <CircularProgress />
        //   </Box>
        // ) : (
          <Stack
            component={!isDesktop && selectedConversationId ? null : Card}
            direction="row"
            className="bottom-chat"
            sx={{ height: calcHeight(isDesktop, selectedConversationId) }}
          >
            {isDesktop && renderNav}

            <Stack
              sx={{
                width: 1,
                height: 1,
                overflow: 'hidden',
              }}
            >
              {renderHead}

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
        // ))
        }
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
              {currentTab === 'organizations' &&
                (loading ? (
                  <Box
                    sx={{
                      zIndex: 10,
                      backgroundColor: '#ffffffc4',
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      padding: '16px',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <CircularProgress />
                  </Box>
                ) : (
                  <ChatOrganization />
                ))}
              {currentTab === 'contacts' &&
                contacts.allIds
                  .map((id) => contacts.byId[id])
                  .map((contact) => (
                    <ChatNavItem
                      key={contact._id}
                      conversation={{
                        ...contact,
                        type: 'contact',
                      }}
                      selected={contact._id === selectedConversationId}
                    />
                  ))}
              {currentTab === 'conversations' && (
                <>
                  {/* {loading && <LinearProgress color="inherit" sx={{ mt: 1, mb: 1, width: 1 }} />} */}
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
