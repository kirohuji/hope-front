import { createSlice } from '@reduxjs/toolkit';
import { broadcastService, userService } from 'src/composables/context-provider';
import _ from 'lodash'
// utils
// ----------------------------------------------------------------------

const initialState = {
  data: [],
  details: { byId: {}, participantsBy: {} },
  total: 0,
  error: null,
  isLoading: false
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
      if(state.details.byId[id]){
        state.details.participantsBy[id] = data;
      }
    },
    // setParticipantsLoading(state, action){
    //   const { participantsById, id } = action.payload;
    //   state.details.participantsBy[participantsById][id] = data.map(item=> ({
    //     ...item,
    //     isLoading: false,
    //   }));
    // },
    // HAS ERROR
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    // stopLoading(state) {
    //   state.isLoading = false;
    // },
  }
})

// Reducer
export default slice.reducer;

export function getDatas(query) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await broadcastService.pagination(query);
      dispatch(slice.actions.getDatasSuccess(response));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function getData({
  id,
  user
}) {
  return async (dispatch, getState) => {
    const { details } = getState().broadcast;
    if(!details.byId[id]){
      dispatch(slice.actions.startLoading());
    }
    try {
      let isAdmin = null;
      const response = await broadcastService.get({
        _id: id
      })
      if (response?.leaders) {
        const leaders = await userService.paginationByProfile(
          {
            _id: {
              $in: response.leaders
            }
          },
          {
            fields: {
              photoURL: 1,
              username: 1,
              phoneNumber: 1
            }
          }
        )
        response.leaders = leaders.data;
        isAdmin = _.find(response.leaders, ["_id", user._id])
      }
      dispatch(slice.actions.getDataSuccess({
        id: response._id,
        data: {
          isAdmin,
          ...response,
        }
      }));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
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
        _id: id
      })
      dispatch(slice.actions.getParticipantsSuccess({
        id,
        data: response
      }));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}