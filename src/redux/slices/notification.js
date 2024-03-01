import { createSlice } from '@reduxjs/toolkit';
import moment from 'moment';
// utils
// import { fileManagerService } from 'src/composables/context-provider';
// ----------------------------------------------------------------------

const initialState = {
  data: [],
};

const slice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    getSuccess(state, action) {
      state.data = action.payload;
    },
  },
});

// Reducer
export default slice.reducer;

export function getNotification(data) {
  return async (dispatch) => {
    try {
      dispatch(
        slice.actions.getSuccess(
          data.map((item) => ({
            ...item,
            createdAt: moment(item.createdAt).format('YYYY/MM/DD'),
          }))
        )
      );
    } catch (error) {
      console.log(error);
    }
  };
}
