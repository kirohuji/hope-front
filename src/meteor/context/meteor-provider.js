import PropTypes from 'prop-types';
import { useMemo, useEffect, useReducer, useCallback } from 'react';
import SimpleDDP from 'simpleddp';
import { simpleDDPLogin } from 'simpleddp-plugin-login';
import _ from 'lodash';
import { useDispatch } from 'src/redux/store';
import { getConversations } from 'src/redux/slices/chat';
import { MeteorContext } from './meteor-context';

const initialState = {
  server: null,
  isInitialized: true,
  isConnected: false,
  isLoggingIn: false,
};
const reducer = (state, action) => {
  switch (action.type) {
    case 'INITIAL':
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state;
  }
};

let conversationsPublish = null;
let conversationsCollection = null;
const messagesPublish = null;

export const bindConnect = async (server, dispatch) => {
  server.on('connected', () => {
    dispatch({
      type: 'INITIAL',
      payload: {
        server,
        isInitialized: true,
        isConnected: true,
      },
    });
  });
  server.on('disconnected', () => {
    dispatch({
      type: 'INITIAL',
      payload: {
        server,
        isInitialized: true,
        isConnected: false,
      },
    });
  });
  server.on('logout', (m) => {
    dispatch({
      type: 'SETLOGGINGIN',
      payload: {
        isLoggingIn: false,
      },
    });
  });
  server.on('login', (m) => {
    dispatch({
      type: 'SETLOGGINGIN',
      payload: {
        isLoggingIn: true,
      },
    });
  });
  server.on('loginResume', (m) => {
    dispatch({
      type: 'SETLOGGINGIN',
      payload: {
        isLoggingIn: true,
      },
    });
  });
  server.on('error', (m) => {
    console.log('报错', m);
  });
  await server.connect();
};
export function MeteorProvider({ endpoint, children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const reducerDispatch = useDispatch();

  const updateConversationsByDebounce = _.debounce((target) => {
    reducerDispatch(
      getConversations({
        ids: target.map((item) => item.id),
      })
    );
  }, 2000);

  const subConversations = useCallback(async () => {
    const { server } = state;
    conversationsPublish = server.subscribe('newMessagesConversations', new Date());
    conversationsPublish.ready();
    conversationsCollection = server.collection('socialize:conversations');
    conversationsCollection.onChange((target) => {
      if (target.changed && target.changed.next) {
        updateConversationsByDebounce([target.changed.next]);
      }
    });
  }, [state, updateConversationsByDebounce]);

  const subNotifications = useCallback(async () => {
    const { server } = state;
    // notificationsPublish = await server.subscribe('userUnreadNotifications');
    // notificationsPublish.ready();
    // notificationsCollection = server.collection('notifications');
    // reducerDispatch(getOverview());
    // notificationsCollection.onChange((target) => {
    //   console.log('target.added', target.added);
    //   reducerDispatch(getOverview());
    //   // if (target.added) {
    //   //   // reducerDispatch(
    //   //   //   newNotificationGet({
    //   //   //     ...target.added,
    //   //   //     _id: target.added.id,
    //   //   //     createdAt: new Date(target.added.createdAt).toISOString(),
    //   //   //     isUnRead: true,
    //   //   //   })
    //   //   // );
    //   //   reducerDispatch(getOverview());
    //   // } else if (target.removed) {
    //   //   reducerDispatch(getOverview());
    //   //   // reducerDispatch(
    //   //   //   newNotificationRemove({
    //   //   //     _id: target.removed.id,
    //   //   //   })
    //   //   // );
    //   // } else if (target.changed) {
    //   //   reducerDispatch(getOverview());
    //   // }
    // });
    // messagesPublish = await server.subscribe('socialize.unreadConversations');
    // messagesPublish.ready();
    // messagesCollection = server.collection('socialize:messages');
    // messagesCollection.onChange((target) => {
    //   if (target.added) {
    //     console.log('有未读消息')
    //     console.log('messages', target.added);
    //   }
    // });
    // messagesPublish = await server.subscribe('unreadConversations');
    // messagesPublish.ready();
  }, [state]);
  const useLogin = useCallback(
    async (opt) => {
      const { server } = state;
      if (server) {
        try {
          const response = await server.login(opt);
          return response;
        } catch (e) {
          console.log(e);
          dispatch({
            type: 'SETLOGGINGIN',
            payload: {
              isLoggingIn: false,
            },
          });
        }
      }
      return () => {
        console.warn('server not ready yet');
      };
    },
    [state]
  );

  const useLogout = useCallback(() => {
    const { server } = state;
    if (server) {
      return server.logout();
    }
    return () => {
      console.warn('server not ready yet');
    };
  }, [state]);

  const useMethod = useCallback(
    (name, ...args) => {
      const { server } = state;
      if (server) {
        return server.call(name, ...args);
      }
      return () => {
        console.warn('server not ready yet');
      };
    },
    [state]
  );

  const initialize = useCallback(async () => {
    const opts = {
      endpoint,
      SocketConstructor: WebSocket,
      reconnectInterval: 5000,
      clearDataOnReconnection: false,
      maxTimeout: 15000,
    };
    const server = new SimpleDDP(opts, [simpleDDPLogin]);
    await bindConnect(server, dispatch);
  }, [endpoint]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const memoizedValue = useMemo(
    () => ({
      server: state.server,
      isConnected: state.isConnected,
      useLogin,
      useLogout,
      subConversations,
      subNotifications,
      useMethod,
    }),
    [
      state.isConnected,
      state.server,
      subNotifications,
      subConversations,
      useLogin,
      useLogout,
      useMethod,
    ]
  );

  return <MeteorContext.Provider value={memoizedValue}>{children}</MeteorContext.Provider>;
}

MeteorProvider.propTypes = {
  children: PropTypes.node,
  endpoint: PropTypes.string,
};
