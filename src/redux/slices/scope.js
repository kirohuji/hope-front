import { createSlice } from '@reduxjs/toolkit';
import _ from 'lodash';
import { scopeService } from '../../composables/context-provider';
// ----------------------------------------------------------------------

const initialState = {
  isLoading: true,
  error: null,
  scopes: [],
  data: [],
  total: 0,
  details: { byId: {}, participantsBy: {}, count: {} },
  active: null,
};

const slice = createSlice({
  name: 'scope',
  initialState,
  reducers: {
    setActive(state, action) {
      state.active = action.payload;
    },
    // START LOADING
    startLoading(state) {
      state.isLoading = true;
    },

    // HAS ERROR
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },

    // GET Scopes
    getScopesSuccess(state, action) {
      state.isLoading = false;
      state.scopes = action.payload;
    },
    getDatasSuccess(state, action) {
      const { data, total } = action.payload;
      state.isLoading = false;
      state.data = data;
      state.total = total;
    },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const { setActive } = slice.actions;

// ----------------------------------------------------------------------

export function getScopes() {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await scopeService.getAll();
      dispatch(slice.actions.getScopesSuccess(response));
    } catch (error) {
      console.error(error);
      dispatch(
        slice.actions.hasError({
          code: error.code,
          message: error.message,
        })
      );
    }
  };
}
export function setScope(profile) {
  return async (dispatch, getState) => {
    dispatch(slice.actions.startLoading());
    const { scopes } = getState().scope;
    try {
      dispatch(slice.actions.setActive(_.find(scopes, { _id: profile.scope })));
    } catch (error) {
      console.error(error);
      dispatch(
        slice.actions.hasError({
          code: error.code,
          message: error.message,
        })
      );
    }
  };
}

export function pagination(query, options) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await scopeService.pagination(query, options);
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
