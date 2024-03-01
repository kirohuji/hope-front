import { createSlice } from '@reduxjs/toolkit';
// utils
import { notificationService } from 'src/composables/context-provider';
import _ from 'lodash';
// ----------------------------------------------------------------------

const initialState = {
  data: [],
  overview: {},
};

const slice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    // HAS ERROR
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    getNotificationsSuccess(state, action) {
      const { data, notificationLimit } = action.payload;
      if (notificationLimit) {
        state.data = [...state.data, ...data];
      } else {
        state.data = data;
      }
    },
    getNotificationSuccess(state, action) {
      const data = action.payload;
      state.data.unshift(data);
    },
    removeNotificationSuccess(state, action) {
      const data = action.payload;
      state.data = state.data.filter((item) => item._id !== data._id);
    },
    getOverviewSuccess(state, action) {
      if (action.payload && Array.isArray(action.payload)) {
        state.overview = _.chain(action.payload)
          .keyBy('value')
          .mapValues('count')
          .set('all', _.sumBy(action.payload, 'count'))
          .value();
      }
    },
  },
});

// Reducer
export default slice.reducer;

export function getNotifications(selector, notificationLimit) {
  return async (dispatch) => {
    try {
      const data = await notificationService.paginationWithCurrentUser({
        selector,
        options: {
          limit: 20,
          skip: notificationLimit,
          sort: { createdAt: -1 },
        },
      });
      dispatch(
        slice.actions.getNotificationsSuccess({
          data,
          notificationLimit,
        })
      );
    } catch (error) {
      console.log(error);
    }
  };
}

// 获取最新消息
export function newNotificationGet(data) {
  return async (dispatch) => {
    try {
      dispatch(slice.actions.getNotificationSuccess(data));
    } catch (error) {
      console.log(error);
      dispatch(
        slice.actions.hasError({
          code: error.code,
          message: error.message,
        })
      );
    }
  };
}
// 获取最新消息
export function newNotificationRemove(data) {
  return async (dispatch) => {
    try {
      dispatch(slice.actions.removeNotificationSuccess(data));
    } catch (error) {
      console.log(error);
      dispatch(
        slice.actions.hasError({
          code: error.code,
          message: error.message,
        })
      );
    }
  };
}

export function getOverview() {
  return async (dispatch) => {
    try {
      const data = await notificationService.overview();
      dispatch(slice.actions.getOverviewSuccess(data));
    } catch (error) {
      dispatch(
        slice.actions.hasError({
          code: error.code,
          message: error.message,
        })
      );
    }
  };
}
