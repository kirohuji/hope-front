import { createSlice } from '@reduxjs/toolkit';
// utils
import { bookService } from '../../composables/context-provider';
// ----------------------------------------------------------------------

const initialState = {
  data: [],
  total: 0,
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
    getDataSuccess(state, action) {
      state.isLoading = false;
      state.data = action.payload.data;
      state.total = action.payload.total;
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
      const response = await bookService.pagination(query, options);
      dispatch(slice.actions.getDataSuccess(response));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}
