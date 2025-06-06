/* eslint-disable import/no-extraneous-dependencies */
import PropTypes from 'prop-types';
import { useEffect, useReducer, useCallback, useMemo } from 'react';
import { Device } from '@capacitor/device';

import { userService, versionService, messagingService } from 'src/composables/context-provider';
import { Capacitor } from '@capacitor/core';
import { CapacitorUpdater } from '@capgo/capacitor-updater';
import { registerNotifications } from 'src/cap/push-notification';
// import { registerNotificationsByHuawei } from 'src/huawei/push-notification';
import { App } from '@capacitor/app';
import { useMeteorContext } from 'src/meteor/hooks';
import { StatusBar } from '@capacitor/status-bar';
import { AuthContext } from './auth-context';
import { setSession, setInfo } from './utils';

const initialState = {
  isInitialized: false,
  isAuthenticated: false,
  user: null,
  loading: true,
};

const reducer = (state, action) => {
  if (action.type === 'INITIAL') {
    return {
      isInitialized: true,
      isAuthenticated: action.payload.isAuthenticated,
      loading: false,
      user: action.payload.user,
    };
  }
  if (action.type === 'DISCONNECTED') {
    return {
      ...state,
      isInitialized: false,
      isAuthenticated: true,
      loading: false,
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
    // subConversations,
    subNotifications,
  } = useMeteorContext();
  const meteor = useMeteorContext();

  const refresh = useCallback(async () => {
    const { user, profile, roles, permissions, membership } = await userService.info();
    setInfo({
      user,
      profile,
      roles,
      permissions,
      membership,
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
          membership,
        },
      },
    });
  }, []);

  const initialize = useCallback(async () => {
    try {
      const accessToken = localStorage.getItem(STORAGE_KEY);

      if (accessToken) {
        callWithMeteor('login', {
          resume: accessToken,
        });
        setSession(accessToken);

        const localInfo = localStorage.getItem('info');

        if (localInfo) {
          const { user, profile, roles, permissions, membership } = JSON.parse(localInfo);
          dispatch({
            type: 'INITIAL',
            payload: {
              isAuthenticated: true,
              user: {
                ...user,
                ...profile,
                permissions,
                roles,
                membership,
              },
            },
          });
        } else {
          // 获取用户信息
          const { user, profile, roles, permissions, membership } = await userService.info();
          dispatch({
            type: 'INITIAL',
            payload: {
              isAuthenticated: true,
              user: {
                ...user,
                ...profile,
                permissions,
                roles,
                membership,
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

    // subConversations();
    subNotifications();

    if (Capacitor.isNativePlatform()) {
      console.log('isNativePlatform');
    }
    if (Capacitor.getPlatform() === 'ios') {
      console.log('iOS!');
      import('../../../ios.css');
      const deviceId = await Device.getId();
      messagingService.updateDeviceStatus({
        deviceId,
        status: 'active',
      });
      await registerNotifications();
      StatusBar.setOverlaysWebView({ overlay: true });

    } else if (Capacitor.getPlatform() === 'android') {
      console.log('Android!');
      import('../../../android.css');
      // await registerNotificationsByHuawei();
      StatusBar.setOverlaysWebView({ overlay: false });
    } else {
      console.log('Web!');
      import('../../../web.css');
    }
  }, [callWithMeteor, subNotifications]);

  useEffect(() => {
    if (meteor.isConnected && !state.isInitialized) {
      console.log('因为Meteor 连接成功,执行初始化,initialize');
      initialize();
    } else if (!meteor.isConnected && state.isInitialized) {
      console.log('因为Meteor 失去了连接,所以修改状态为未初始化');
      dispatch({
        type: 'DISCONNECTED',
        payload: {},
      });
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

      const { user, profile, roles, permissions, membership } = await userService.info();

      setInfo({
        user,
        profile,
        roles,
        permissions,
        membership,
      });
      subNotifications();
      // subConversations();
      dispatch({
        type: 'LOGIN',
        payload: {
          user: {
            ...user,
            ...profile,
            permissions,
            roles,
            membership,
          },
        },
      });
    },
    [loginWithMeteor, subNotifications]
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

      const { user, profile, roles, permissions, membership } = await userService.info();

      setInfo({
        user,
        profile,
        roles,
        permissions,
        membership,
      });

      dispatch({
        type: 'REGISTER',
        payload: {
          user: {
            ...user,
            ...profile,
            permissions,
            roles,
            membership,
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
    // 重置 Redux store
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

// ----------------------------------------------------------------------

// const data = { version: -1 };
CapacitorUpdater.notifyAppReady();
// App.addListener('appStateChange', async (state) => {
//   if (Capacitor.getPlatform() === 'ios' || Capacitor.getPlatform() === 'android') {
//     const current = await CapacitorUpdater.current();
//     if (state.isActive) {
//       console.log('当前正在使用的安装包', current);
//       const allVersion = await versionService.getAll();
//       const config = _.maxBy(allVersion, 'value');
//       // 当前版本不是最新版本时获取最新的版本
//       if (current.bundle.version !== config.value) {
//         console.log('从后台拿到的安装包URL开始下载', config);
//         data = await CapacitorUpdater.download({
//           version: config.value,
//           url: config.file,
//         });
//         console.log('从后台下载好的安装包', data);
//       } else {
//         console.log('当前安装包已经是最新的了');
//       }
//     }
//     // 确保在后台状态进行安装最新的安装包
//     if (
//       !state.isActive &&
//       data.version !== '' &&
//       data.version !== -1 &&
//       current.version !== data.version
//     ) {
//       console.log('安装包安装状态');
//       try {
//         console.log('安装包bundle list', await CapacitorUpdater.list());
//         await CapacitorUpdater.set(data);
//         console.log('安装包安装安好了');
//       } catch (err) {
//         console.log('安装包安装失败了');
//         console.log(err);
//       }
//     }
//   }
// });
let data = { version: -1 };
App.addListener('appStateChange', async (state) => {
  if (Capacitor.getPlatform() === 'ios' || Capacitor.getPlatform() === 'android') {
    const current = await CapacitorUpdater.current();
    const deviceId = await Device.getId();
    if (state.isActive) {
      messagingService.updateDeviceStatus({
        deviceId,
        status: 'active',
      });
      const config = await versionService.getActive();
      const version = `${config.majorVersion}.${config.minorVersion}.${config.patchVersion}`;
      // 当前版本不是最新版本时获取最新的版本
      if (current.bundle.version !== version && config.majorVersion) {
        console.log('从后台拿到的安装包URL开始下载', config);
        if (config.file) {
          data = await CapacitorUpdater.download({
            version,
            url: config.file,
          });
          console.log('从后台下载好的安装包', data);
        } else {
          console.log('后台没有配置安装包');
        }
      } else {
        console.log('当前安装包已经是最新的了');
      }
    } else {
      messagingService.updateDeviceStatus({
        deviceId,
        status: 'deactive',
      });
    }
    // 确保在后台状态进行安装最新的安装包
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
