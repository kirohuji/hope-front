import { useEffect, useState, useCallback } from 'react';
// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Link from '@mui/material/Link';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Scrollbar from 'src/components/scrollbar';
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
import { getOrganizations, getConversations, resetActiveConversation, getMessages, getConversation, getContacts, deleteConversation, newMessageGet, mergeConversations } from 'src/redux/slices/chat';
import { fileService, ddpclient } from 'src/composables/context-provider';
// eslint-disable-next-line import/no-extraneous-dependencies
import { OpenVidu } from 'openvidu-browser';
import { useBoolean } from 'src/hooks/use-boolean';
import _ from 'lodash'
import ChatNav from '../chat-nav';
import ChatRoom from '../chat-room';
import ChatMessageList from '../chat-message-list';
import ChatMessageInput from '../chat-message-input';
import ChatHeaderDetail from '../chat-header-detail';
import ChatHeaderCompose from '../chat-header-compose';
import ChatNavItem from '../chat-nav-item';
import UserModel from './user-model'

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

function calcHeight (isDesktop, selectedConversationId) {
  if (isDesktop) {
    return '72vh'
  }
  return selectedConversationId ? 'calc(100vh - 70px)' : 'calc(100vh - 140px)';
}

const getToken = async (mySessionId) => fileService.getToken({ customSessionId: mySessionId })

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

const TABS = [
  {
    value: 'conversations',
    label: '聊天会话',
    count: 0,
  },
  {
    value: 'contacts',
    label: ' 联系人',
    count: 0,
  },
  {
    value: 'organizations',
    label: '组织架构',
    count: 0,
  },
];


// ----------------------------------------------------------------------

const OV = null;
// const OV = new OpenVidu();

let OVSession = null;

let reactiveCollection = null;
let getMessage = null;

let conversations2Publish = null;
let conversations2Collection = null;

export default function ChatView () {
  const dispatch = useDispatch();
  const [currentTab, setCurrentTab] = useState('conversations');
  const { conversations, contacts } = useSelector((state) => state.chat);

  const conversation = useSelector((state) => conversationSelector(state));

  const { active } = useSelector((state) => state.scope);

  const isDesktop = useResponsive('up', 'md');

  const { organizations } = useSelector((state) => state.chat);

  const [currentOrganization, setCurrentOrganization] = useState([]);

  const [levels, setLevels] = useState([]);

  const { user } = useAuthContext();

  const settings = useSettingsContext();

  const [token, setToken] = useState(null);

  const [messageLimit, setMessageLimit] = useState(20);

  const searchParams = useSearchParams();

  const selectedConversationId = searchParams.get('id') || null;

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

  const onChildren = (organization) => {
    if (organization.children) {
      const level = {
        name: organization.label,
        to: organization._id,
      }
      levels.push(level);
      setCurrentOrganization([...organization.children, ...organization.users.map(item => ({
        name: item.account.username,
        photoURL: item.profile.photoURL,
        _id: item.profile._id
      }))])
      setLevels(levels)
    }
  }
  const onGoTo = async (level) => {
    let index = 0;
    const length = _.findIndex(levels, ["to", level.to])
    let isChildren = false;
    let currentOrganizations = organizations
    const levels2 = []
    while (index < length) {
      isChildren = true;
      const currentLevel = levels[index];
      currentOrganizations = _.find(currentOrganizations, ["_id", currentLevel.to]);
      index += 1;
      levels2.push(currentLevel)
    }
    if (isChildren) {
      await setCurrentOrganization([...currentOrganizations.children, ...currentOrganizations.users.map(item => ({
        _id: item.account._id,
        name: item.account.username,
        photoURL: item.profile.photoURL
      }))]);
    } else {
      await setCurrentOrganization(currentOrganizations);
    }
    setLevels(levels2);
  }

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
      console.log('session.localUser', session.localUser)
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
  }, [deleteSubscriber])

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
  }, [session])


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
    setConversationsLoading(true)
    if (selectedConversationId) {
      getDetails()
      if (ddpclient.connected) {
        getMessage = ddpclient.subscribe("socialize.messagesFor2", selectedConversationId, user._id, new Date());
        getMessage.ready();
        reactiveCollection = ddpclient.collection('socialize:messages').reactive();
        reactiveCollection.onChange(() => {
          dispatch(newMessageGet(selectedConversationId))
        });
      }
    } else {
      dispatch(resetActiveConversation());
    }
    setConversationsLoading(false)
    return () => {
      if (reactiveCollection) {
        reactiveCollection.stop();
        getMessage.stop();
      }
    }
  }, [dispatch, active._id, getDetails, selectedConversationId, user._id]);

  useEffect(() => {
    if (!selectedConversationId) {
      // eslint-disable-next-line default-case
      switch (currentTab) {
        case 'organizations':
          dispatch(getOrganizations(active._id));
          break;
        case 'conversations':
          dispatch(getConversations());
          try {
            conversations2Publish = ddpclient.subscribe("socialize.conversations2", user._id);
            conversations2Publish.ready();
            conversations2Collection = ddpclient.collection('socialize:conversations').reactive();
            conversations2Collection.onChange(async () => {
              dispatch(getConversations());
            });
          } catch (e) {
            console.log(e)
          }
          break;
        case 'contacts':
          dispatch(getContacts());
          break;
      }
      return () => {
        if (conversations2Publish) {
          conversations2Publish.stop();
          conversations2Collection.stop();
        }
      }
    }
    return () => { };
  }, [active._id, currentTab, dispatch, selectedConversationId, user._id])

  const participants = conversation
    ? conversation.participants.filter((participant) => participant._id !== user._id)
    : [];

  const handleAddRecipients = useCallback((selected) => {
    setRecipients(selected);
  }, []);

  const details = !!conversation && conversation._id;

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
        // sendMessageToOpenVidu={(message) => {
        //   OVSession.signal({
        //     to: [],
        //     data: JSON.stringify({
        //       message,
        //       nickname: session.localUser.getNickname(),
        //     }),
        //     type: 'chat'
        //   })
        // }}
        selectedConversationId={selectedConversationId}
        disabled={!recipients.length && !selectedConversationId}
      />
    </Stack>
  );

  const handleChangeTab = useCallback((event, newValue) => {
    setCurrentTab(newValue);
  }, []);

  const renderTabs = (
    <Tabs sx={{ width: "100%" }} variant="fullWidth" value={currentTab} onChange={handleChangeTab}>
      {TABS.map((tab) => (
        <Tab
          key={tab.value}
          iconPosition="end"
          value={tab.value}
          label={tab.label} />
      ))})
    </Tabs>
  )
  const styles = {
    typography: 'body2',
    alignItems: 'center',
    color: 'text.primary',
    display: 'inline-flex',
  };
  const renderOrganizationsMenuItem = (organization, id) => <ChatNavItem
    key={id}
    onChildren={onChildren}
    conversation={organization}
    selected={organization._id === selectedConversationId}
  />
  const renderOrganizations = (
    <Scrollbar sx={{ height: 320, ml: 1, mr: 1 }}>
      {
        levels && levels.length > 0 && <Stack
          direction="row"
          alignItems="center"
          justifyContent="flex-start"
          sx={{ m: 1 }}
        >
          {
            levels.map((level, index) => (<Box key={index} sx={{ display: 'flex' }}>
              <Link onClick={() => onGoTo(level)} sx={styles}>{`${level.name}`} </Link>
              <div style={{ margin: '0 4px' }}> /</div>
            </Box>))
          }
        </Stack>
      }
      {currentOrganization && currentOrganization.length > 0 ? currentOrganization.map((item, i) => renderOrganizationsMenuItem(item, i)) : organizations.map((item, i) => renderOrganizationsMenuItem(item, i))}
    </Scrollbar>
  )

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
      {
        (isDesktop || selectedConversationId) && <Stack component={!isDesktop && selectedConversationId ? null : Card} direction="row" sx={{ height: calcHeight(isDesktop, selectedConversationId) }}>
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
      }
      {
        !selectedConversationId && <Stack>
          {!isDesktop && <>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="center"
              sx={{ pl: 0, pr: 0 }}
            >
              {renderTabs}
            </Stack>
            <Divider />
            {currentTab === "organizations" && renderOrganizations}
            {currentTab === "contacts" && contacts.allIds.map(id => contacts.byId[id]).map((contact) => (
              <ChatNavItem
                key={contact._id}
                conversation={{
                  ...contact,
                  type: 'contact'
                }}
                selected={contact._id === selectedConversationId}
              />
            ))}
            {
              currentTab === "conversations" && conversations.allIds.map((conversationId) => (
                <ChatNavItem
                  key={conversationId}
                  deleteConversation={() => dispatch(deleteConversation(conversationId))}
                  conversation={conversations.byId[conversationId]}
                  selected={conversationId === selectedConversationId}
                />
              ))
            }
          </>
          }
        </Stack>
      }
    </Container>
  );
}
