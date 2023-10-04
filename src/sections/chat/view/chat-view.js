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
import { fileService } from 'src/composables/context-provider';
// eslint-disable-next-line import/no-extraneous-dependencies
import { OpenVidu } from 'openvidu-browser';
import { useBoolean } from 'src/hooks/use-boolean';
import ChatNav from '../chat-nav';
import ChatRoom from '../chat-room';
import ChatMessageList from '../chat-message-list';
import ChatMessageInput from '../chat-message-input';
import ChatHeaderDetail from '../chat-header-detail';
import ChatHeaderCompose from '../chat-header-compose';

import UserModel from './user-model'

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

const getToken = async (mySessionId) => fileService.getToken({ customSessionId: mySessionId })
// const sessionId = await createSession(mySessionId);
// return createToken(sessionId);



// const createSession = async (sessionId) => {
//   const response = await fileService.createSession({ customSessionId: sessionId })
//   return response; // The sessionId
// }

// const createToken = async (sessionId) => {
//   const response = await fileService.createToken({ customSessionId: sessionId })
//   return response; // The token
// }

function checkSomeoneShareScreen (subscribers) {
  const isScreenShared = subscribers.some((user) => user.isScreenShareActive());
  return {
    maxRatio: 3 / 2,
    minRatio: 9 / 16,
    fixedRatio: isScreenShared,
    bigClass: 'OV_big',
    bigPercentage: 0.8,
    bigFixedRatio: false,
    bigMaxRatio: 3 / 2,
    bigMinRatio: 9 / 16,
    bigFirst: true,
    animate: true,
  };
}

const sendSignalUserChanged = (data) => {
  const signalOptions = {
    data: JSON.stringify(data),
    type: 'userChanged',
  };
  OVSession.signal(signalOptions);
}

// ----------------------------------------------------------------------

const OV = new OpenVidu();

let OVSession = null;
export default function ChatView () {
  const dispatch = useDispatch();

  const { conversations, contacts } = useSelector((state) => state.chat);

  const conversation = useSelector((state) => conversationSelector(state));

  const { active } = useSelector((state) => state.scope);

  const isDesktop = useResponsive('up', 'md');

  const router = useRouter();

  const { user } = useAuthContext();

  const settings = useSettingsContext();

  const [token, setToken] = useState(null);

  const localUserAccessAllowed = useBoolean();

  const [messageLimit, setMessageLimit] = useState(20);

  const searchParams = useSearchParams();

  const selectedConversationId = searchParams.get('id') || '';

  const [recipients, setRecipients] = useState([]);

  const [remotes, setRemotes] = useState([]);

  const [conversationsLoading, setConversationsLoading] = useState(true);

  const [session, setSession] = useState({
    mySessionId: selectedConversationId || 'sessionA',
    myUserName: user.username,
    localUser: new UserModel(),
    mainStreamManager: undefined,  // Main video of the page. Will be the 'publisher' or one of the 'subscribers'
    publisher: undefined,
    subscribers: [],
  })

  const subscribeToChatCreated = useCallback(async () => {
    OVSession.on('signal:chat', async (event) => {
      console.log('获取到新数据')
      // await dispatch(getConversation(selectedConversationId, 0));
    })
  }, [])

  const connectToSession = useCallback(async () => {
    try {
      console.log('connectToSession')
      const tempToken = await getToken(session.mySessionId);
      await setToken(tempToken)
      OVSession
        .connect(
          tempToken, { clientData: session.myUserName },
        )
        .then(() => {
          subscribeToChatCreated();
          session.localUser.setNickname(session.myUserName);
          session.localUser.setScreenShareActive(false);
        })
    } catch (error) {
      console.error('There was an error getting the token:', error.code, error.message);
      alert('There was an error getting the token:', error.message);
    }
  }, [session.mySessionId, session.localUser, session.myUserName, subscribeToChatCreated])

  const joinSession = useCallback(async () => {
    console.log('joinSession', joinSession)
    OVSession = OV.initSession();
    connectToSession()
  }, [connectToSession]);


  const subscribeToStreamCreated = useCallback(async () => {
    OVSession.on('streamCreated', (event) => {
      console.log('streamCreated开始数据流')
      const subscriber = OVSession.subscribe(event.stream, undefined);
      subscriber.on('streamPlaying', (e) => {
        checkSomeoneShareScreen(session.subscribers);
      });
      session.localUser.setStreamManager(subscriber);
      session.localUser.setConnectionId(event.stream.connection.connectionId);
      session.localUser.setType('remote');
      // setSession({
      //   ...session,
      //   localUser: session.localUser
      // })
      console.log('session.localUser',session.localUser)
    });
  }, [session])

  const updateSubscribers = useCallback(async () => {
    session.subscribers = remotes;
    if (session.localUser) {
      sendSignalUserChanged({
        isAudioActive: session.localUser.isAudioActive(),
        isVideoActive: session.localUser.isVideoActive(),
        nickname: session.localUser.getNickname(),
        isScreenShareActive: session.localUser.isScreenShareActive(),
      })
    }
  }, [session, remotes])


  const deleteSubscriber = useCallback((stream) => {
    const remoteUsers = session.subscribers;
    const userStream = remoteUsers.filter((currentUser) => currentUser.getStreamManager().stream === stream)[0];
    const index = remoteUsers.indexOf(userStream, 0);
    if (index > -1) {
      remoteUsers.splice(index, 1);
      setSession({
        ...session,
        subscribers: remoteUsers
      })
    }
  }, [session])


  const subscribeToStreamDestroyed = useCallback(() => {
    OVSession.on('streamDestroyed', (event) => {
      // Remove the stream from 'subscribers' array
      deleteSubscriber(event.stream);
    });
  },[deleteSubscriber])

  const subscribeToUserChanged = useCallback(() => {
    OVSession.on('signal:userChanged', (event) => {
      const remoteUsers = session.subscribers;
      remoteUsers.forEach((remoteUser) => {
        if (remoteUser.getConnectionId() === event.from.connectionId) {
          const data = JSON.parse(event.data);
          console.log('EVENTO REMOTE: ', event.data);
          if (data.isAudioActive !== undefined) {
            remoteUser.setAudioActive(data.isAudioActive);
          }
          if (data.isVideoActive !== undefined) {
            remoteUser.setVideoActive(data.isVideoActive);
          }
          if (data.nickname !== undefined) {
            remoteUser.setNickname(data.nickname);
          }
          if (data.isScreenShareActive !== undefined) {
            remoteUser.setScreenShareActive(data.isScreenShareActive);
          }
        }
      });
      setSession({
        ...session,
        subscribers: remoteUsers,
      })
    });
  },[session])


  const connectWebCam = useCallback(async () => {
    await subscribeToStreamCreated()
    await OV.getUserMedia({ audioSource: undefined, videoSource: undefined });
    const devices = await OV.getDevices();
    const videoDevices = devices.filter(device => device.kind === 'videoinput');

    const publisher = OV.initPublisher(undefined, {
      audioSource: undefined,
      videoSource: videoDevices[0].deviceId,
      publishAudio: session.localUser.isAudioActive(),
      publishVideo: session.localUser.isVideoActive(),
      resolution: '640x480',
      frameRate: 30,
      insertMode: 'APPEND',
    });

    if (OVSession.capabilities?.publish) {
      publisher.on('accessAllowed', () => {
        OVSession.publish(publisher).then(() => {
          updateSubscribers();
        });
      });

    }
    session.localUser.setStreamManager(publisher);
    subscribeToUserChanged();
    subscribeToStreamDestroyed()
    sendSignalUserChanged({ isScreenShareActive: session.localUser.isScreenShareActive() });
  }, [updateSubscribers, subscribeToStreamDestroyed, subscribeToUserChanged, subscribeToStreamCreated, session.localUser])

  const getDetails = useCallback(async () => {
    setConversationsLoading(true)
    await dispatch(getConversations());
    await dispatch(getConversation(selectedConversationId))
    await dispatch(getMessages(selectedConversationId, 0));
    setConversationsLoading(false)
  }, [dispatch, selectedConversationId]);

  useEffect(() => {
    console.log('触发了一次')
    setConversationsLoading(true)
    dispatch(getOrganizations(active._id));
    dispatch(getContacts());
    if (selectedConversationId) {
      getDetails()
      joinSession()
    } else {
      dispatch(getConversations());
      dispatch(resetActiveConversation());
    }
    setConversationsLoading(false)
  }, [dispatch, active._id, joinSession, getDetails, selectedConversationId]);

  const participants = conversation
    ? conversation.participants.filter((participant) => participant._id !== user._id)
    : [];

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
        <>{details && <ChatHeaderDetail
          mainStreamManager={session.localUser.getStreamManager()}
          openMedia={() => connectWebCam()}
          participants={participants} />}</>
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
        sendMessageToOpenVidu={(message) => {
          OVSession.signal({
            to: [],
            data: JSON.stringify({
              message,
              nickname: session.localUser.getNickname(),
            }),
            type: 'chat'
          })
          // session.localUser.getStreamManager().steam.session.signal({
          //   data: JSON.stringify({
          //     message,
          //     nickname: session.localUser.getNickname(),
          //     streamId: session.localUser.getStreamManager().stream.streamId
          //   }),
          //   type: 'chat'
          // })
        }}
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
