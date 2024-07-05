import { createSlice } from '@reduxjs/toolkit';
import { versionService } from '../../composables/context-provider';
// ----------------------------------------------------------------------

const initialState = {
  isLoading: true,
  error: null,
  data: [],
  total: 0,
  details: { byId: {}, participantsBy: {}, count: {} },
  active: null,
};

const slice = createSlice({
  name: 'version',
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
export function pagination(query, options) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await versionService.pagination(query, options);
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
