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
      const { profiles, groupByFile, files, overview } = action.payload;
      state.isLoading = false;
      state.data = files.map((file) => {
        if (groupByFile[file._id]) {
          const shared = groupByFile[file._id];
          file.shared = shared.map((item) => {
            if (item.isMain) {
              file.main = profiles[item.user_id];
            }
            return {
              ...item,
              ...profiles[item.user_id],
            };
          });
          return file;
        }
        return file;
      });
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
