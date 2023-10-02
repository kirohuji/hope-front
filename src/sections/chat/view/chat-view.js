import { useEffect, useState, useCallback } from 'react';
// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
// routes
import { paths } from 'src/routes/paths';
import { useRouter, useSearchParams } from 'src/routes/hook';
// hooks
import { useAuthContext } from 'src/auth/hooks';
import { useResponsive } from 'src/hooks/use-responsive';
// components
import { useSettingsContext } from 'src/components/settings';
//
import { useDispatch, useSelector } from 'src/redux/store';
import { getOrganizations, getConversations, resetActiveConversation, getMessages, getConversation, getContacts } from 'src/redux/slices/chat';
import ChatNav from '../chat-nav';
import ChatRoom from '../chat-room';
import ChatMessageList from '../chat-message-list';
import ChatMessageInput from '../chat-message-input';
import ChatHeaderDetail from '../chat-header-detail';
import ChatHeaderCompose from '../chat-header-compose';


const conversationSelector = (state) => {
  const { conversations, activeConversationId } = state.chat;
  const conversation = activeConversationId ? conversations.byId[activeConversationId] : null;
  if (conversation) {
    return conversation;
  }
  const initState = {
    id: '',
    messages: [],
    participants: [],
    unreadCount: 0,
    type: '',
  };
  return initState;
};

function calcHeight (isDesktop, selectedConversationId) {
  if (isDesktop) {
    return '72vh'
  }
  return selectedConversationId ? 'calc(100vh - 70px)' : 'calc(100vh - 140px)';
}

// ----------------------------------------------------------------------

export default function ChatView () {

  const dispatch = useDispatch();


  const { conversations, contacts } = useSelector((state) => state.chat);

  const conversation = useSelector((state) => conversationSelector(state));

  const { active } = useSelector((state) => state.scope);

  const isDesktop = useResponsive('up', 'md');

  const router = useRouter();

  const { user } = useAuthContext();

  const settings = useSettingsContext();

  const [messageLimit, setMessageLimit] = useState(20);

  const searchParams = useSearchParams();

  const selectedConversationId = searchParams.get('id') || '';

  const [recipients, setRecipients] = useState([]);

  const [conversationsLoading, setConversationsLoading] = useState(true);

  const getDetails = useCallback(async () => {
    await dispatch(getConversations());
    await dispatch(getConversation(selectedConversationId))
    await dispatch(getMessages(selectedConversationId, 0));
  }, [dispatch, selectedConversationId]);

  useEffect(() => {
    setConversationsLoading(true)
    dispatch(getOrganizations(active._id));
    dispatch(getContacts());
    if (selectedConversationId) {
      getDetails()
    } else {
      dispatch(getConversations());
      dispatch(resetActiveConversation());
    }
    setConversationsLoading(false)
  }, [dispatch, active._id, getDetails, selectedConversationId, setConversationsLoading]);

  const participants = conversation
    ? conversation.participants.filter((participant) => participant._id !== user._id)
    : [];

  useEffect(() => {
    if (!selectedConversationId) {
      router.push(paths.dashboard.chat);
    }
  }, [router, selectedConversationId]);

  const handleAddRecipients = useCallback((selected) => {
    setRecipients(selected);
  }, []);

  const details = !!conversation;

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
        <ChatHeaderCompose contacts={contacts.allIds.map(id => contacts.byId[id])} onAddRecipients={handleAddRecipients} />
      )}
    </Stack>
  );

  const renderNav = (
    <ChatNav
      contacts={contacts.allIds.map(id => contacts.byId[id])}
      conversations={conversations}
      loading={conversationsLoading}
      selectedConversationId={selectedConversationId}
    />
  );

  const onRefresh = async () => {
    setMessageLimit(messageLimit + 20);
    console.log(messageLimit)
    await dispatch(getMessages(selectedConversationId, messageLimit))
  }
  const renderMessages = (
    <Stack
      sx={{
        width: 1,
        height: 1,
        overflow: 'hidden',
      }}
    >
      <ChatMessageList messages={conversation?.messages} participants={participants} onRefresh={onRefresh} />

      <ChatMessageInput
        recipients={recipients}
        onAddRecipients={handleAddRecipients}
        //
        selectedConversationId={selectedConversationId}
        disabled={!recipients.length && !selectedConversationId}
      />
    </Stack>
  );

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      {
        isDesktop && <Typography
          variant="h4"
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        >
          聊天
        </Typography>
      }

      <Stack component={!isDesktop && selectedConversationId ? null : Card} direction="row" sx={{ height: calcHeight(isDesktop, selectedConversationId) }}>
        {renderNav}

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

            {details && <ChatRoom conversation={conversation} participants={participants} />}
          </Stack>
        </Stack>
      </Stack>
    </Container>
  );
}
