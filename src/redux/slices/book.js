import { createSlice } from '@reduxjs/toolkit';
// utils
import { bookService } from '../../composables/context-provider';
// ----------------------------------------------------------------------

const initialState = {
  data: [],
  error: null,
};

const slice = createSlice({
  name: 'book',
  initialState,
  reducers: {
    // START LOADING
    startLoading (state) {
      state.isLoading = true;
    },
    getDataSuccess (state, action) {
      state.isLoading = false;
      state.data = action.payload;
    },
    // HAS ERROR
    hasError (state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
  },
});

// Reducer
export default slice.reducer;

export function getDatas (query) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try{
      const response = await bookService.pagination(query);
      dispatch(slice.actions.getDataSuccess(response.data));
    } catch(error){
      dispatch(slice.actions.hasError(error));
    }
  };
}