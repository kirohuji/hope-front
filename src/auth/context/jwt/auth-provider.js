/* eslint-disable import/no-extraneous-dependencies */
import PropTypes from 'prop-types';
import { useEffect, useReducer, useCallback, useMemo } from 'react';
import _ from 'lodash';

import { userService, versionService } from 'src/composables/context-provider';
import { Capacitor } from '@capacitor/core';
import { CapacitorUpdater } from '@capgo/capacitor-updater';
import { App } from '@capacitor/app';
// import { useLogin, useMethod, useLogout } from 'src/meteor/hooks';
import { useMeteorContext } from 'src/meteor/hooks';
import { AuthContext } from './auth-context';
import { setSession, setInfo } from './utils';

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
      notifications: action.payload.notifications,
    };
  }
  return state;
};

// ----------------------------------------------------------------------

const STORAGE_KEY = 'accessToken';

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const {
    useLogin: loginWithMeteor,
    useLogout: logoutWithMeteor,
    useMethod: callWithMeteor,
    subConversations,
  } = useMeteorContext();
  const meteor = useMeteorContext();

  // const getNotifications = useCallback(async (user) => {
  //   const notifications = await ddpclient.subscribe('notifications', user._id);

  //   await notifications.ready();

  //   const reactiveCollection = ddpclient.collection('notifications').reactive();

  //   dispatch({
  //     type: 'NOTIFICATION',
  //     payload: {
  //       notifications: reactiveCollection.data(),
  //     },
  //   });

  //   reactiveCollection.onChange((newData) => {
  //     dispatch({
  //       type: 'NOTIFICATION',
  //       payload: {
  //         notifications: newData,
  //       },
  //     });
  //   });
  // }, []);

  const refresh = useCallback(async () => {
    const { user, profile, roles, permissions } = await userService.info();
    setInfo({
      user,
      profile,
      roles,
      permissions,
    });
    dispatch({
      type: 'INITIAL',
      payload: {
        isAuthenticated: true,
        user: {
          ...user,
          ...profile,
          permissions,
          roles,
        },
      },
    });
  }, []);

  const initialize = useCallback(async () => {
    try {
      const accessToken = localStorage.getItem(STORAGE_KEY);

      if (accessToken) {
        // ddpclient.connect();
        await callWithMeteor('login', {
          resume: accessToken,
        });
        setSession(accessToken);

        const localInfo = localStorage.getItem('info');

        if (localInfo) {
          const { user, profile, roles, permissions } = JSON.parse(localInfo);
          // getNotifications(user);
          dispatch({
            type: 'INITIAL',
            payload: {
              isAuthenticated: true,
              user: {
                ...user,
                ...profile,
                permissions,
                roles,
              },
            },
          });
        } else {
          // 获取用户信息
          const { user, profile, roles, permissions } = await userService.info();
          // getNotifications(user);
          dispatch({
            type: 'INITIAL',
            payload: {
              isAuthenticated: true,
              user: {
                ...user,
                ...profile,
                permissions,
                roles,
              },
            },
          });
        }
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
      console.log(error);
      dispatch({
        type: 'INITIAL',
        payload: {
          isAuthenticated: false,
          user: null,
        },
      });
    }
    subConversations();
    if (Capacitor.isNativePlatform()) {
      console.log('isNativePlatform');
    }
    if (Capacitor.getPlatform() === 'ios') {
      console.log('iOS!');
      import('../../../ios.css');
    } else if (Capacitor.getPlatform() === 'android') {
      console.log('Android!');
    } else {
      console.log('Web!');
      import('../../../web.css');
    }
  }, [callWithMeteor, subConversations]);

  useEffect(() => {
    if (meteor.isConnected && !state.isInitialized) {
      console.log('初始化');
      initialize();
    }
  }, [initialize, meteor.isConnected, state.isInitialized]);

  // LOGIN
  const login = useCallback(
    async (email, password) => {
      const response = await loginWithMeteor({
        user: {
          email,
        },
        password,
      });

      const { token: accessToken } = response;

      setSession(accessToken);

      const { user, profile, roles, permissions } = await userService.info();

      setInfo({
        user,
        profile,
        roles,
        permissions,
      });
      // getNotifications(user);
      subConversations();
      dispatch({
        type: 'LOGIN',
        payload: {
          user: {
            ...user,
            ...profile,
            permissions,
            roles,
          },
        },
      });
    },
    [loginWithMeteor, subConversations]
  );

  // REGISTER
  const register = useCallback(
    async (email, password, username) => {
      await userService.register({
        email,
        username,
        password,
      });

      const { authToken: accessToken } = await loginWithMeteor({
        user: {
          email,
        },
        password,
      });

      localStorage.setItem(STORAGE_KEY, accessToken);

      const { user, profile, roles, permissions } = await userService.info();

      setInfo({
        user,
        profile,
        roles,
        permissions,
      });

      dispatch({
        type: 'REGISTER',
        payload: {
          user: {
            ...user,
            ...profile,
            permissions,
            roles,
          },
        },
      });
    },
    [loginWithMeteor]
  );

  // LOGOUT
  const logout = useCallback(async () => {
    await logoutWithMeteor();
    setSession(null);
    setInfo(null);
    localStorage.clear();
    dispatch({
      type: 'LOGOUT',
    });
  }, [logoutWithMeteor]);

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
      permissions: state.user?.permissions?.map((item) => item.value),
      isAdmin: state.user?.roles?.map((item) => item._id).indexOf('admin') !== -1,
      login,
      register,
      logout,
      refresh,
    }),
    [login, logout, state, register, status, refresh]
  );

  return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
}

let data = { version: -1 };
CapacitorUpdater.notifyAppReady();
App.addListener('appStateChange', async (state) => {
  if (Capacitor.getPlatform() === 'ios' || Capacitor.getPlatform() === 'android') {
    const current = await CapacitorUpdater.current();
    if (state.isActive) {
      console.log('安装包下载状态');
      console.log('当前正在使用的安装包', current);
      const datas = await versionService.getAll();
      const config = _.maxBy(datas, 'value');
      if (current.bundle.version !== config.value) {
        console.log('从后台拿到的安装包URL', config);
        console.log('从后台拿到的安装包URL开始下载', config);
        data = await CapacitorUpdater.download({
          version: config.value,
          url: config.file,
        });
        console.log('从后台下载好的安装包', data);
      } else {
        console.log('当前安装包已经是最新的了');
      }
    }
    if (
      !state.isActive &&
      data.version !== '' &&
      data.version !== -1 &&
      current.version !== data.version
    ) {
      console.log('安装包安装状态');
      try {
        console.log('安装包bundle list', await CapacitorUpdater.list());
        await CapacitorUpdater.set(data);
        console.log('安装包安装安好了');
      } catch (err) {
        console.log('安装包安装失败了');
        console.log(err);
      }
    }
  }
});

AuthProvider.propTypes = {
  children: PropTypes.node,
};
