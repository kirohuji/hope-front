import { createSlice } from '@reduxjs/toolkit';
import { broadcastService } from 'src/composables/context-provider';
// utils
// ----------------------------------------------------------------------

const initialState = {
  data: [],
  total: 0,
  error: null,
};

const slice = createSlice({
  name: 'broadcast',
  initialState,
  reducers: {
    // START LOADING
    startLoading (state) {
      state.isLoading = true;
    },
    getDataSuccess (state, action) {
      const { data, total } =  action.payload;
      state.isLoading = false;
      state.data = data;
      state.total = total;
    },
    // HAS ERROR
    hasError (state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
  }
})

// Reducer
export default slice.reducer;

export function getDatas (query) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try{
      const response = await broadcastService.pagination(query);
      dispatch(slice.actions.getDataSuccess(response));
    } catch(error){
      dispatch(slice.actions.hasError(error));
    }
  };
}