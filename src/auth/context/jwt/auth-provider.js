import PropTypes from 'prop-types';
import { useEffect, useReducer, useCallback, useMemo } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import DDPClient from 'ddp';
// utils
// import axios, { endpoints } from 'src/utils/axios';
//
import { authService, notificationService, userService } from 'src/composables/context-provider';

// import { useDispatch } from 'src/redux/store';

// eslint-disable-next-line import/no-extraneous-dependencies
// import { io } from "socket.io-client";
import { AuthContext } from './auth-context';
import { setSession } from './utils';

// ----------------------------------------------------------------------

// NOTE:
// We only build demo at basic level.
// Customer will need to do some extra handling yourself if you want to extend the logic and other features...

// ----------------------------------------------------------------------

const initialState = {
  isInitialized: false,
  isAuthenticated: false,
  user: null,
  loading: true,
  notifications: [],
};

const reducer = (state, action) => {
  if (action.type === 'INITIAL') {
    return {
      isInitialized: true,
      isAuthenticated: action.payload.isAuthenticated,
      loading: false,
      user: action.payload.user,
      notifications: [],
    };
  }
  if (action.type === 'LOGIN') {
    return {
      ...state,
      isAuthenticated: true,
      user: action.payload.user,
    };
  }
  if (action.type === 'REGISTER') {
    return {
      ...state,
      isAuthenticated: true,
      user: action.payload.user,
    };
  }
  if (action.type === 'LOGOUT') {
    return {
      ...state,
      isAuthenticated: false,
      user: null,
    };
  }

  if (action.type === 'NOTIFICATION') {
    return {
      ...state,
      notifications: action.payload.notifications
    };
  }
  return state;
};

// ----------------------------------------------------------------------

const STORAGE_KEY = 'accessToken';

export function AuthProvider ({ children }) {

  const [state, dispatch] = useReducer(reducer, initialState);

  const ddpclient = new DDPClient({
    // All properties optional, defaults shown
    host: "localhost",
    port: 3000,
    ssl: false,
    autoReconnect: true,
    autoReconnectTimer: 5000,
    maintainCollections: true,
    ddpVersion: '1',  // ['1', 'pre2', 'pre1'] available
    // uses the SockJs protocol to create the connection
    // this still uses websockets, but allows to get the benefits
    // from projects like meteorhacks:cluster
    // (for load balancing and service discovery)
    // do not use `path` option when you are using useSockJs
    useSockJs: true,
    // Use a full url instead of a set of `host`, `port` and `ssl`
    // do not set `useSockJs` option if `url` is used
    url: 'wss://localhost:3000/websocket'
  });
  ddpclient.subscribe(
    'notifications',                  // name of Meteor Publish function to subscribe to
    [],                       // any parameters used by the Publish function
    () => {             // callback when the subscription is complete
      dispatch({
        type: 'NOTIFICATION',
        payload: {
          notifications: ddpclient.collections.notifications.find().fetch()
        },
      });
    }
  );
  // const reduxDispatch = useDispatch()

  // const socket = io("ws://localhost:5005",{
  //   reconnectionDelayMax: 10000,
  //   ackTimeout: 10000,
  //   timeout: 10000
  // });
  // socket.on("connect", () => {
  //   socket.emit("upsert", state.user);
  // });

  // socket.on("hello", (data) => {
  //   console.log('收到', data)
  // })

  // socket.on("training", () => {
  //   getNotifications();
  // })
  const getNotifications = useCallback(() => async () => {
    const data = await notificationService.getWithCurrentUser()
    dispatch({
      type: 'NOTIFICATION',
      payload: {
        notifications: data
      },
    });
  }, [])

  const initialize = useCallback(async () => {
    try {
      const accessToken = localStorage.getItem(STORAGE_KEY);

      // if (accessToken && isValidToken(accessToken)) {
      if (accessToken) {
        setSession(accessToken);

        // const response = await axios.get(endpoints.auth.me);

        // const { user } = response.data;
        // 获取用户信息
        const { user, profile, roles, permissions } = await userService.info()

        dispatch({
          type: 'INITIAL',
          payload: {
            isAuthenticated: true,
            user: {
              ...user,
              ...profile,
              permissions,
              roles
            }
          },
          // payload: {
          //   user,
          // },
        });
        getNotifications()
      } else {
        dispatch({
          type: 'INITIAL',
          payload: {
            isAuthenticated: false,
            user: null,
          },
        });
      }
    } catch (error) {
      console.error(error);
      dispatch({
        type: 'INITIAL',
        payload: {
          isAuthenticated: false,
          user: null,
        },
      });
    }
  }, [getNotifications]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // LOGIN
  const login = useCallback(async (email, password) => {
    const data = {
      email,
      password,
    };

    // const response = await axios.post(endpoints.auth.login, data);

    // const { accessToken, user } = response.data;

    const response = await authService.login(data);

    const { authToken: accessToken } = response;

    setSession(accessToken);

    const { user, profile, roles, permissions } = await userService.info()

    dispatch({
      type: 'LOGIN',
      payload: {
        user: {
          ...user,
          ...profile,
          permissions,
          roles
        }
      },
    });
  }, []);

  const sendPublish = useCallback(async (data) => {
    // socket.emit("notification", data);
  }, []);

  // REGISTER
  const register = useCallback(async (email, password, firstName, lastName, username) => {
    // const data = {
    //   email,
    //   password,
    //   firstName,
    //   lastName,
    // };

    await userService.register({
      email,
      username,
      password,
    })

    // const response = await axios.post(endpoints.auth.register, data);

    // const { accessToken, user } = response.data;

    const { authToken: accessToken } = await authService.login({
      email,
      password,
    })

    localStorage.setItem(STORAGE_KEY, accessToken);

    const { user, profile, roles, permissions } = await userService.info()

    dispatch({
      type: 'REGISTER',
      payload: {
        user: {
          ...user,
          ...profile,
          permissions,
          roles
        },
      },
    });
  }, []);

  // LOGOUT
  const logout = useCallback(async () => {
    setSession(null);
    dispatch({
      type: 'LOGOUT',
    });
  }, []);

  // ----------------------------------------------------------------------

  const checkAuthenticated = state.user ? 'authenticated' : 'unauthenticated';

  const status = state.loading ? 'loading' : checkAuthenticated;

  const memoizedValue = useMemo(
    () => ({
      user: state.user,
      notifications: state.notifications,
      method: 'jwt',
      loading: status === 'loading',
      authenticated: status === 'authenticated',
      unauthenticated: status === 'unauthenticated',
      isInitialized: state.isInitialized,
      isAuthenticated: state.isAuthenticated,
      permissions: state.user?.permissions?.map(item => item.value),
      isAdmin: state.user?.roles?.map(item => item._id).indexOf("admin") !== -1,
      //
      login,
      sendPublish,
      register,
      logout
    }),
    [login, logout, state.notifications, sendPublish, register, state.isAuthenticated, state.isInitialized, state.user, status]
  );

  return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node,
};
