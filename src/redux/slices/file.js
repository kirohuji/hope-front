import { createSlice } from '@reduxjs/toolkit';
import { fileManagerService } from 'src/composables/context-provider';
// utils
// ----------------------------------------------------------------------

const initialState = {
  data: [],
  overview: {},
  error: null,
};

const slice = createSlice({
  name: 'file',
  initialState,
  reducers: {
    // START LOADING
    startLoading(state) {
      state.isLoading = true;
    },
    getDataSuccess(state, action) {
      const { files, overview } = action.payload;
      state.isLoading = false;
      state.data = files;
      state.overview = overview;
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

export function getFiles() {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await fileManagerService.getWithCurrentUser();
      dispatch(slice.actions.getDataSuccess(response));
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
