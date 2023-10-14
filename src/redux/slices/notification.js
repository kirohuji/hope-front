import { createSlice } from '@reduxjs/toolkit';

// utils
import { notificationService } from 'src/composables/context-provider';
// ----------------------------------------------------------------------

const initialState = {
  notifications: []
};

const slice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    // GET CONVERSATIONS
    getNotificationsSuccess (state, action) {
      const notifications = action.payload;
      state.notifications = notifications;
    },
  }
})

// Reducer
export default slice.reducer;

export function getNotifications () {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const data = await notificationService.getWithCurrentUser()
      dispatch(slice.actions.getConversationsSuccess(data));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}