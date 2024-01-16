import { createSlice } from '@reduxjs/toolkit';
import _ from 'lodash';
// utils
import { fileManagerService } from 'src/composables/context-provider';

// ----------------------------------------------------------------------

const initialState = {
  isLoading: true,
  error: null,
  list: null,
  current: null,
  index: -1,
};

const slice = createSlice({
  name: 'audio',
  initialState,
  reducers: {
    next(state) {
      if (state.index + 1 > state.list.length) {
        state.index = -1;
      }
      state.index += 1;
      state.current = state.list[state.index];
    },
    // setList (state, action) {
    //     state.list = action.payload;
    // },
    play(state, action) {
      state.current = action.payload;
      state.index = _.findIndex(state.list, ['_id', state.current._id]);
    },
    setCurrent(state, action) {
      state.current = action.payload;
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

    // GET POSTS
    getListSuccess(state, action) {
      state.isLoading = false;
      state.list = action.payload;
    },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const { setArticle, nextStep, backStep } = slice.actions;

// ----------------------------------------------------------------------

export function next() {
  return async (dispatch) => {
    try {
      dispatch(slice.actions.next());
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

export function select(item) {
  return async (dispatch) => {
    try {
      dispatch(slice.actions.play(item));
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

export function getList(file) {
  return async (dispatch) => {
    console.log('133');
    dispatch(slice.actions.startLoading());
    try {
      const response = await fileManagerService.getWithCurrentUser({
        type: 'mp3',
      });
      dispatch(slice.actions.getListSuccess(response));
      dispatch(slice.actions.play(file));
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
