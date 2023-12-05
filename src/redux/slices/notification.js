import { createSlice } from '@reduxjs/toolkit';

// utils
import { ddpclient } from 'src/composables/context-provider';
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
    // try {

    //   const notificationsSub = await ddpclient.subscribe("notifications");

    //   await notificationsSub.ready();

    //   const reactiveCollection = ddpclient.collection('notifications').reactive();

    //   dispatch(slice.actions.getNotificationsSuccess(reactiveCollection.data()));

    //   reactiveCollection.onChange((newData) => {
    //     console.log('更新更新')
    //     dispatch(slice.actions.getNotificationsSuccess(newData));
    //   });
    // } catch (error) {
    //   console.log(error)
    //   // dispatch(slice.actions.hasError(error));
    // }
  };
}