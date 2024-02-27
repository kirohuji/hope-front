import PropTypes from 'prop-types';
import { useMemo, useEffect, useReducer, useCallback } from 'react';
import SimpleDDP from 'simpleddp';
import { simpleDDPLogin } from 'simpleddp-plugin-login';
import { MeteorContext } from './meteor-context';

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
  await server.connect();
};
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

export const createServer = (endpoint) => {
  const opts = {
    endpoint,
    SocketConstructor: WebSocket,
    reconnectInterval: 5000,
    clearDataOnReconnection: false,
  };

  return new SimpleDDP(opts, [simpleDDPLogin]);
};

export function MeteorProvider({ endpoint, children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const useLogin = useCallback(
    async (opt) => {
      const { server } = state;
      console.log(server);
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
      useLogin,
      useLogout,
      useMethod,
    }),
    [state.server, useLogin, useLogout, useMethod]
  );

  return <MeteorContext.Provider value={memoizedValue}>{children}</MeteorContext.Provider>;
}

MeteorProvider.propTypes = {
  children: PropTypes.node,
  endpoint: PropTypes.string,
};
