import PropTypes from 'prop-types';
import { useEffect, useReducer, useCallback, useMemo } from 'react';
// utils
import axios, { endpoints } from 'src/utils/axios';
//
import { authService, userService } from 'src/composables/context-provider';
import { AuthContext } from './auth-context';
import { isValidToken, setSession } from './utils';
// ----------------------------------------------------------------------

// NOTE:
// We only build demo at basic level.
// Customer will need to do some extra handling yourself if you want to extend the logic and other features...

// ----------------------------------------------------------------------

const initialState = {
  user: null,
  loading: true,
};

const reducer = (state, action) => {
  if (action.type === 'INITIAL') {
    return {
      loading: false,
      user: action.payload.user,
    };
  }
  if (action.type === 'LOGIN') {
    return {
      ...state,
      user: action.payload.user,
    };
  }
  if (action.type === 'REGISTER') {
    return {
      ...state,
      user: action.payload.user,
    };
  }
  if (action.type === 'LOGOUT') {
    return {
      ...state,
      user: null,
    };
  }
  return state;
};

// ----------------------------------------------------------------------

const STORAGE_KEY = 'accessToken';

export function AuthProvider ({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const initialize = useCallback(async () => {
    try {
      const accessToken = localStorage.getItem(STORAGE_KEY);

      if (accessToken && isValidToken(accessToken)) {
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
  }, []);

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
      method: 'jwt',
      loading: status === 'loading',
      authenticated: status === 'authenticated',
      unauthenticated: status === 'unauthenticated',
      //
      login,
      register,
      logout,
    }),
    [login, logout, register, state.user, status]
  );

  return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node,
};
