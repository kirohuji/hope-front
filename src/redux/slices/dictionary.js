import { createSlice } from '@reduxjs/toolkit';
// utils
import { dictionaryService } from '../../composables/context-provider';
// ----------------------------------------------------------------------

const initialState = {
  isLoading: true,
  error: null,
  dictionary: {},
};

const slice = createSlice({
  name: 'dictionary',
  initialState,
  reducers: {
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
    getDictionarySuccess(state, action) {
      console.log('action.payload', action.payload);
      state.isLoading = false;
      state.dictionary[action.payload.value] = action.payload;
    },

    getDatasSuccess(state, action) {
      state.isLoading = false;
      state.data = action.payload.data;
      state.total = action.payload.total;
    },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const { setDictionary, nextStep, backStep } = slice.actions;

// ----------------------------------------------------------------------

export function getDictionary(value) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await dictionaryService.dict({
        value,
      });
      dispatch(slice.actions.getDictionarySuccess(response));
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
      const response = await dictionaryService.pagination(query, options);
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
