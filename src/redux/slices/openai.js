import { createSlice } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-extraneous-dependencies
import { fetchEventSource } from '@microsoft/fetch-event-source';
// ----------------------------------------------------------------------

const initialState = {
  isLoading: false,
  isSending: false,
  error: null,
  generate: { byId: {}, currentMessageId: '' },
};

const slice = createSlice({
  name: 'openai',
  initialState,
  reducers: {
    // START LOADING
    startLoading(state) {
      state.isLoading = true;
    },
    startSending(state) {
      state.isSending = true;
    },
    stopSending(state) {
      state.isSending = false;
    },

    // HAS ERROR
    hasError(state, action) {
      state.sendingMessage = { byId: {} };
      state.isLoading = false;
      state.error = action.payload;
    },
    hasErrorMessage(state, action) {
      state.sendingMessage = { byId: {} };
      state.isLoading = false;
      state.error = action.payload;
      throw new Error(state.error);
    },

    setGenerate(state, action) {
      const { conversationId, messageId, message, isSet } = action.payload;
      if (!state.generate.byId[conversationId]) {
        state.generate.byId[conversationId] = {};
      }
      if (isSet) {
        // state.generate.byId[conversationId] = {};
        state.generate.currentMessageId = messageId;
        state.generate.byId[conversationId][state.generate.currentMessageId] = '';
      } else {
        state.generate.byId[conversationId][state.generate.currentMessageId] += message;
      }
    },
  },
});

// Reducer
export default slice.reducer;

// 合并会话
export function openai(selectedConversationId, message) {
  return async (dispatch) => {
    console.log('启动')
    dispatch(slice.actions.startLoading());

    const controller = new AbortController();
    const { signal } = controller;

    try {
      const text = '';
      const requestData = {
        conversationId: selectedConversationId,
        prompt: message,
      };
      const requestOptions = {
        method: 'POST',
        body: JSON.stringify(requestData),
        headers: {
          'X-Auth-Token': localStorage.getItem('accessToken'),
          'Content-Type': 'application/json',
        },
      };
      fetchEventSource(process.env.NODE_ENV === 'development' ? 'http://localhost:3030/openai/' : 'https://www.lourd.top/openai', {
        openWhenHidden: true,
        ...requestOptions,
        signal,
        // signal: ctrl.signal,
        async onmessage(msg) {
          if (msg.data !== '[DONE]') {
            const msgData = JSON.parse(msg.data);
            if (msgData?.choices) {
              await dispatch(
                slice.actions.setGenerate({
                  conversationId: selectedConversationId,
                  message: msgData.choices[0].delta.content,
                })
              );
            } else if (msgData.messageId) {
              await dispatch(
                slice.actions.setGenerate({
                  conversationId: selectedConversationId,
                  messageId: msgData.messageId,
                  message: '...',
                  isSet: true,
                })
              );
            }
          }
        },
        onclose() {
          console.log(text);
        },
        onerror(err) {
          console.error('EventSource failed:', err);
          controller.abort(); // Abort the request to prevent retries
          dispatch(
            slice.actions.hasError({
              code: err.code,
              message: err.message,
            })
          );
        },
      })
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
