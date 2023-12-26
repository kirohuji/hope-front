/* eslint-disable import/no-extraneous-dependencies */
import PropTypes from 'prop-types';
import { useEffect, useReducer, useCallback, useMemo } from 'react';

import { authService, userService, ddpclient } from 'src/composables/context-provider';

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


export function AuthProvider({ children }) {

  const [state, dispatch] = useReducer(reducer, initialState);

  const getNotifications = useCallback(async (user) => {

    const notifications = await ddpclient.subscribe("notifications", user._id);

    await notifications.ready();

    const reactiveCollection = ddpclient.collection('notifications').reactive();

    dispatch({
      type: 'NOTIFICATION',
      payload: {
        notifications: reactiveCollection.data()
      },
    });

    reactiveCollection.onChange((newData) => {
      dispatch({
        type: 'NOTIFICATION',
        payload: {
          notifications: newData
        },
      });
    });

  }, [])

  const refresh = useCallback(async () => {
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
      }
    });
  }, []);

  const initialize = useCallback(async () => {
    try {
      const accessToken = localStorage.getItem(STORAGE_KEY);

      if (accessToken) {

        await ddpclient.call("login", {
          resume: accessToken
        })

        setSession(accessToken);

        // 获取用户信息
        const { user, profile, roles, permissions } = await userService.info();

        getNotifications(user);

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
          }
        });
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
    const response = await ddpclient.login({
      password,
      user: {
        email
      }
    });

    const { token: accessToken } = response;

    setSession(accessToken);

    const { user, profile, roles, permissions } = await userService.info()
    getNotifications(user)
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
  }, [getNotifications]);

  // REGISTER
  const register = useCallback(async (email, password, username) => {

    await userService.register({
      email,
      username,
      password,
    })

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
    // await authService.logout()
    await ddpclient.logout();
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
      state,
      method: 'jwt',
      loading: status === 'loading',
      authenticated: status === 'authenticated',
      unauthenticated: status === 'unauthenticated',
      isInitialized: state.isInitialized,
      isAuthenticated: state.isAuthenticated,
      permissions: state.user?.permissions?.map(item => item.value),
      isAdmin: state.user?.roles?.map(item => item._id).indexOf("admin") !== -1,
      login,
      register,
      logout,
      refresh,
    }),
    [login, logout, state, register, status, refresh]
  );

  return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node,
};
