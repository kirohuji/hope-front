/* eslint-disable import/no-mutable-exports */
import PropTypes from 'prop-types';
import { useMemo, useEffect, useReducer, useCallback } from 'react';
import SimpleDDP from 'simpleddp';
import { simpleDDPLogin } from 'simpleddp-plugin-login';
import _ from 'lodash';
import { useDispatch } from 'src/redux/store';
import { getConversations, getSessions } from 'src/redux/slices/chat';
import { sync } from 'src/redux/slices/dictionary';
import { getOverview } from 'src/redux/slices/notification';
import { MeteorContext } from './meteor-context';
// import { useNotificationSnackbar } from 'src/components/notification-snackbar/index';
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

export let conversationsPublish = null;
export let conversationsCollection = null;
export let conversationsCollectionChange = null;
export let notificationsPublish = null;
export let notificationsCollection = null;
export let notificationsCollectionChange = null;
// const messagesPublish = null;

export const bindConnect = async (server, dispatch) => {
  server.on('connected', () => {
    console.log('连接成功');
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
    console.log('失去连接');
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

  const updateConversationsByDebounce = _.debounce((target, isChatgpt) => {
    if (isChatgpt) {
      reducerDispatch(
        getSessions({
          ids: target.map((item) => item.id),
        })
      );
    } else {
      reducerDispatch(
        getConversations({
          ids: target.map((item) => item.id),
        })
      );
    }
  }, 100);

  const subConversations = useCallback(
    async (callback) => {
      const { server } = state;
      // 关闭上一次的监听
      if (conversationsPublish) {
        conversationsCollectionChange.stop();
      }
      if (conversationsCollection && conversationsPublish.stop) {
        conversationsPublish.stop();
      }
      conversationsPublish = server.subscribe('newMessagesConversations', new Date());
      conversationsPublish.ready();
      conversationsCollection = server.collection('socialize:conversations');
      conversationsCollectionChange = conversationsCollection.onChange(async (target) => {
        if (target.changed && target.changed.next) {
          console.log('target.changed.next', target.changed);
          updateConversationsByDebounce([target.changed.next], !!target.changed.next.sessionId);
          callback(target.changed.next);
        }
      });
    },
    [state, updateConversationsByDebounce]
  );

  const subNotifications = useCallback(async () => {
    const { server } = state;
    // 关闭上一次的监听
    if (notificationsPublish) {
      notificationsCollectionChange.stop();
    }
    if (notificationsCollection && notificationsPublish.stop) {
      notificationsPublish.stop();
    }
    notificationsPublish = await server.subscribe('userUnreadNotifications');
    notificationsPublish.ready();
    notificationsCollection = server.collection('notifications');
    reducerDispatch(getOverview());
    notificationsCollectionChange = notificationsCollection.onChange((target) => {
      console.log('target.added', target.added);
      reducerDispatch(getOverview());
      // if (target.added) {
      //   reducerDispatch(
      //     newNotificationGet({
      //       ...target.added,
      //       _id: target.added.id,
      //       createdAt: new Date(target.added.createdAt).toISOString(),
      //       isUnRead: true,
      //     })
      //   );
      //   reducerDispatch(getOverview());
      // } else if (target.removed) {
      //   reducerDispatch(getOverview());
      //   reducerDispatch(
      //     newNotificationRemove({
      //       _id: target.removed.id,
      //     })
      //   );
      // } else if (target.changed) {
      //   reducerDispatch(getOverview());
      // }
    });
  }, [reducerDispatch, state]);

  const useLogin = useCallback(
    async (opt) => {
      const { server } = state;
      if (server) {
        try {
          return await server.login(opt);
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
    reducerDispatch(sync());
  }, [endpoint, reducerDispatch]);

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
