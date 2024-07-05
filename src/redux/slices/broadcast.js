import { createSlice } from '@reduxjs/toolkit';
import { broadcastService, userService } from 'src/composables/context-provider';
import _ from 'lodash';
// utils
// ----------------------------------------------------------------------

const initialState = {
  data: [],
  details: { byId: {}, participantsBy: {}, count: {} },
  total: 0,
  error: {},
  isLoading: false,
};

const slice = createSlice({
  name: 'broadcast',
  initialState,
  reducers: {
    // START LOADING
    startLoading(state) {
      state.isLoading = true;
    },
    getDatasSuccess(state, action) {
      const { data, total } = action.payload;
      state.isLoading = false;
      state.data = data;
      state.total = total;
    },
    getDataSuccess(state, action) {
      const { id, data } = action.payload;
      state.isLoading = false;
      state.details.byId[id] = data;
    },
    getParticipantsSuccess(state, action) {
      const { id, data } = action.payload;
      state.isLoading = false;
      if (state.details.byId[id]) {
        state.details.participantsBy[id] = data;
      }
    },
    updateDataPublishedStatusSuccess(state, action) {
      const { id, published } = action.payload;
      console.log('published', published);
      state.isLoading = false;
      if (state.details.byId[id]) {
        state.details.byId[id] = {
          ...state.details.byId[id],
          published,
        };
      }
    },
    addParticipantsSuccess(state, action) {
      const { id, datas } = action.payload;
      state.isLoading = false;
      if (state.details.byId[id]) {
        state.details.participantsBy[id] = _.unionBy(
          state.details.participantsBy[id],
          datas,
          'user_id'
        );
      }
    },
    localParticipantsCountSuccess(state, action) {
      const { id } = action.payload;
      if (state.details.byId[id]) {
        state.details.count[id] = state.details.participantsBy[id]?.length;
      }
    },
    getParticipantsCountSuccess(state, action) {
      const { id, data } = action.payload;
      state.isLoading = false;
      if (state.details.byId[id]) {
        state.details.count[id] = data;
      }
    },
    deleteParticipantSuccess(state, action) {
      const { id, data } = action.payload;
      if (state.details.byId[id]) {
        state.details.participantsBy[id] = state.details.participantsBy[id].filter(
          (participant) => participant.user_id !== data.user_id
        );
        state.details.count[id] = state.details.participantsBy[id]?.length;
      }
    },
    updateParticipantStatusSuccess(state, action) {
      const { id, data, status } = action.payload;
      if (state.details.byId[id]) {
        console.log('data', data);
        state.details.participantsBy[id] = state.details.participantsBy[id].map((participant) => {
          if (participant.user_id === data.user_id) {
            return {
              ...participant,
              status,
            };
          }
          return participant;
        });
      }
    },
    // HAS ERROR
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
  },
});

// Reducer
export default slice.reducer;

export function pagination(query, options) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await broadcastService.pagination(query, options);
      dispatch(slice.actions.getDatasSuccess(response));
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

export function getData({ id, user }) {
  return async (dispatch, getState) => {
    const { details } = getState().broadcast;
    if (!details.byId[id]) {
      dispatch(slice.actions.startLoading());
    }
    try {
      let isAdmin = null;
      const response = await broadcastService.get({
        _id: id,
      });
      if (response?.leaders) {
        const leaders = await userService.paginationByProfile(
          {
            _id: {
              $in: response.leaders,
            },
          },
          {
            fields: {
              photoURL: 1,
              username: 1,
              realName: 1,
              displayName: 1,
              phoneNumber: 1,
            },
          }
        );
        response.leaders = leaders.data;
        isAdmin = _.find(response.leaders, ['_id', user._id]);
      }
      dispatch(
        slice.actions.getDataSuccess({
          id: response._id,
          data: {
            isAdmin,
            ...response,
          },
        })
      );
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

export function addParticipants({ id, datas }) {
  return async (dispatch) => {
    try {
      dispatch(
        slice.actions.addParticipantsSuccess({
          id,
          datas,
        })
      );
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

export function getParticipants(id) {
  return async (dispatch, getState) => {
    try {
      // const { details } = getState().broadcast;
      // if(!details.byId[id]?.participants){
      //   dispatch(slice.actions.startLoading());
      // }
      dispatch(slice.actions.startLoading());
      const response = await broadcastService.getUsers({
        _id: id,
      });
      dispatch(
        slice.actions.getParticipantsSuccess({
          id,
          data: response,
        })
      );
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

export function getParticipantsCount(id) {
  return async (dispatch, getState) => {
    try {
      // const { details } = getState().broadcast;
      // if(!details.byId[id]?.participants){
      //   dispatch(slice.actions.startLoading());
      // }
      dispatch(
        slice.actions.localParticipantsCountSuccess({
          id,
        })
      );
      dispatch(slice.actions.startLoading());
      const response = await broadcastService.getUsersCount({
        _id: id,
      });
      dispatch(
        slice.actions.getParticipantsCountSuccess({
          id,
          data: response,
        })
      );
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

export function deleteParticipant({ id, data }) {
  return async (dispatch) => {
    try {
      dispatch(
        slice.actions.deleteParticipantSuccess({
          id,
          data,
        })
      );
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
export function updateParticipantStatus({ id, data, status }) {
  return async (dispatch) => {
    try {
      dispatch(
        slice.actions.updateParticipantStatusSuccess({
          id,
          data,
          status,
        })
      );
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

export function updateDataPublishedStatus({ id, published }) {
  return async (dispatch) => {
    try {
      dispatch(
        slice.actions.updateDataPublishedStatusSuccess({
          id,
          published,
        })
      );
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
