import { createSlice } from '@reduxjs/toolkit';

// utils
import { fileManagerService } from 'src/composables/context-provider';
// ----------------------------------------------------------------------

const initialState = {
  data: []
};

const slice = createSlice({
  name: 'file',
  initialState,
  reducers: {
    getSuccess (state, action) {
      state.data = action.payload;;
    },
  }
})

// Reducer
export default slice.reducer;

export function getFiles () {
  return async (dispatch) => {
    try {

      const data = await fileManagerService.getWithCurrentUser()

      dispatch(slice.actions.getSuccess(data));

    } catch (error) {
      console.log(error)
    }
  };
}