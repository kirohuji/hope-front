import { createSlice } from '@reduxjs/toolkit';
// utils
import { bookService } from '../../composables/context-provider';
// ----------------------------------------------------------------------

const initialState = {
  data: [],
  total: 0,
  details: { byId: {} },
  error: null,
};

const slice = createSlice({
  name: 'book',
  initialState,
  reducers: {
    // START LOADING
    startLoading(state) {
      state.isLoading = true;
    },
    getDatasSuccess(state, action) {
      state.isLoading = false;
      state.data = action.payload.data;
      state.total = action.payload.total;
    },
    getDataSuccess(state, action) {
      const { id, data } = action.payload;
      state.isLoading = false;
      state.details.byId[id] = data;
    },
    // HAS ERROR
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
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
  },
});

// Reducer
export default slice.reducer;

export function pagination(query, options) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await bookService.pagination(query, options);
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
      const response = await bookService.get({
        _id: id,
      });
      const isAdmin = response.createdBy === user._id;
      dispatch(
        slice.actions.getDataSuccess({
          id: response._id,
          data: {
            ...response,
            isAdmin,
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
