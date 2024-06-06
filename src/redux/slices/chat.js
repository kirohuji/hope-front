import keyBy from 'lodash/keyBy';
import { createSlice } from '@reduxjs/toolkit';
import _ from 'lodash';
// eslint-disable-next-line import/no-extraneous-dependencies
import { fetchEventSource } from '@microsoft/fetch-event-source';
// utils
import uuidv4 from 'src/utils/uuidv4';
import { friendService, roleService, messagingService } from 'src/composables/context-provider';

// ----------------------------------------------------------------------

function objFromArray(array, key = '_id') {
  return array.reduce((accumulator, current) => {
    accumulator[current[key]] = current;
    return accumulator;
  }, {});
}

const initialState = {
  isLoading: false,
  isSending: false,
  error: null,
  contacts: { byId: {}, allIds: [] },
  organizations: [],
  conversations: { byId: {}, allIds: [], unreadCount: 0 },
  conversationsByAll: [],
  messages: { byId: {}, allIds: [], unreadCount: 0 },
  messagesByAll: [],
  contactsByAll: [],
  activeConversationId: null,
  participants: [],
  recipients: [],
  lastMessage: {},
  sendingMessage: { byId: {} },
  generate: { byId: {}, currentMessageId: '' },
};

const slice = createSlice({
  name: 'chat',
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

    // GET CONTACT SSUCCESS
    getContactsSuccess(state, action) {
      const contacts = action.payload;
      state.contactsByAll = contacts;
      state.contacts.byId = objFromArray(contacts);
      state.contacts.allIds = Object.keys(state.contacts.byId);
    },

    getOrganizationsSuccess(state, action) {
      state.organizations = action.payload;
    },

    // GET CONVERSATIONS
    getConversationsSuccess(state, action) {
      const conversations = action.payload;
      state.conversationsByAll = conversations;
      state.conversations.byId = keyBy(conversations, '_id');
      state.conversations.allIds = Object.keys(state.conversations.byId);
      state.conversations.unreadCount = conversations.reduce(
        (previous, current) => previous + current.unreadCount,
        0
      );
    },

    // GET CONVERSATION
    getConversationSuccess(state, action) {
      const conversation = action.payload;
      if (conversation) {
        const index = _.findIndex(state.conversationsByAll, ['_id', conversation._id]);
        state.conversationsByAll[index] = conversation;
        state.conversations.byId[conversation._id] = conversation;
        state.activeConversationId = conversation._id;
        if (!state.conversations.allIds.includes(conversation._id)) {
          state.conversations.allIds.push(conversation._id);
        }
      } else {
        state.activeConversationId = null;
      }
      state.conversations.unreadCount = state.conversationsByAll.reduce(
        (previous, current) => previous + current.unreadCount,
        0
      );
    },

    getConversationByConversationKeySuccess(state, action) {
      const conversationKey = action.payload;
      state.activeConversationId = conversationKey;
    },

    // ON SEND MESSAGE
    onSendMessage(state, action) {
      const conversation = action.payload;
      const {
        conversationId,
        messageId,
        message,
        contentType,
        attachments,
        createdAt,
        sendingMessageId,
        senderId,
        isLoading,
      } = conversation;
      const newMessage = {
        _id: messageId,
        body: message,
        contentType,
        isLoading,
        attachments,
        createdAt,
        senderId,
        sendingMessageId,
      };
      if (!state.sendingMessage.byId[conversationId]) {
        state.sendingMessage.byId[conversationId] = [];
      }
      state.sendingMessage.byId[conversationId].push(newMessage);
    },

    onSendMessageFailure(state, action) {
      const { conversationId, messageId } = action.payload;
      state.sendingMessage.byId[conversationId] = state.sendingMessage.byId[conversationId].map(
        (item) => {
          if (item._id === messageId) {
            item.isFailure = true;
            item.isLoading = false;
          }
          return item;
        }
      );
    },
    // 获取所有数据
    getMessagesSuccess(state, action) {
      const { conversationId, data, messageLimit } = action.payload;
      if (!state.messages.byId[conversationId] || messageLimit === 0) {
        state.messages.byId[conversationId] = [];
      }
      // 合并新数据和现有数据
      const mergedData = [...state.messages.byId[conversationId], ...data];
      // 根据日期排序
      const orderedData = _.unionBy(_.orderBy(mergedData, ['createdAt'], ['asc']), '_id');

      // 更新状态
      state.messages.byId[conversationId] = orderedData;
      state.lastMessage = _.last(orderedData);
      state.sendingMessage.byId[conversationId] = [];
    },

    // 获取最新数据
    getNewMessagesSuccess(state, action) {
      const { conversationId, data } = action.payload;
      const orderData = _.orderBy(data, ['createdAt', 'asc']);
      // state.sendingMessage.byId[conversationId] = [];
      if (!state.messages.byId[conversationId]) {
        state.messages.byId[conversationId] = [];
      }
      const newMessages = _.uniqBy(
        [...state.messages.byId[conversationId].filter((item) => item._id !== '-1'), ...orderData],
        '_id'
      );
      state.lastMessage = _.last(newMessages);
      state.messages.byId[conversationId] = newMessages;
      state.sendingMessage.byId[conversationId] = _.differenceBy(
        state.sendingMessage.byId[conversationId],
        newMessages,
        'sendingMessageId'
      );
    },

    markConversationAsReadSuccess(state, action) {
      const { conversationId } = action.payload;
      const conversation = state.conversations.byId[conversationId];
      if (conversation) {
        conversation.unreadCount = 0;
      }
    },

    // GET PARTICIPANTS
    getParticipantsSuccess(state, action) {
      const participants = action.payload;
      state.participants = participants;
    },

    // RESET ACTIVE CONVERSATION
    resetActiveConversation(state) {
      state.activeConversationId = null;
    },

    addRecipients(state, action) {
      const recipients = action.payload;
      state.recipients = recipients;
    },

    mergeConversationsUnique(state, action) {
      const { newData } = action.payload;
      state.conversationsByAll = newData;
      state.conversations.byId = keyBy(newData, '_id');
      state.conversations.allIds = Object.keys(state.conversations.byId);
    },
    setGenerate(state, action) {
      const { conversationId, messageId, message, isSet } = action.payload;
      if (!state.generate.byId[conversationId]) {
        state.generate.byId[conversationId] = {};
      }
      if (isSet) {
        state.generate.byId[conversationId] = {};
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

// Actions
export const { addRecipients, onSendMessage, resetActiveConversation } = slice.actions;

// 发送消息
export function sendMessage(conversationKey, body) {
  return async (dispatch) => {
    dispatch(slice.actions.startSending());
    const uuid = uuidv4();
    try {
      // 先存在本地
      dispatch(
        slice.actions.onSendMessage({
          conversationId: conversationKey,
          messageId: uuid,
          message: body.message,
          contentType: body.contentType,
          attachments: body.attachments,
          senderId: body.senderId,
          sendingMessageId: body.sendingMessageId || uuid,
          isLoading: true, // 表示正在加载
          createdAt: body.createdAt,
        })
      );
      // 发送消息到后端
      await messagingService.sendMessage({
        _id: conversationKey,
        body: body.message,
        contentType: body.contentType,
        attachments: body.attachments,
        sendingMessageId: body.sendingMessageId || uuid,
      });
      // dispatch(
      //   slice.actions.onSendMessageSuccess({ conversationId: conversationKey, messageId: uuid })
      // );
      dispatch(slice.actions.stopSending());
    } catch (error) {
      console.log('收到报错信息');
      dispatch(
        slice.actions.onSendMessageFailure({
          conversationId: conversationKey,
          messageId: body.sendingMessageId || uuid,
        })
      );
      dispatch(slice.actions.hasErrorMessage(error));
    }
  };
}

// 获取消息
export function getMessages(conversationKey, messageLimit) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const data = await messagingService.getConversationMessagesById({
        _id: conversationKey,
        options: {
          limit: 20,
          skip: messageLimit,
          sort: { createdAt: -1 },
        },
      });
      dispatch(
        slice.actions.getMessagesSuccess({
          conversationId: conversationKey,
          data,
          messageLimit,
        })
      );
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

// 获取最新消息
export function newMessageGet(conversationId) {
  return async (dispatch, getState) => {
    try {
      const { lastMessage } = getState().chat;
      if (lastMessage && lastMessage._id) {
        const data = await messagingService.getLastMessageBy({
          _id: conversationId,
          lastId: lastMessage._id,
        });
        await dispatch(
          slice.actions.getNewMessagesSuccess({
            conversationId,
            data,
          })
        );
      } else {
        const data = await messagingService.getConversationMessagesById({
          _id: conversationId,
          options: {
            limit: 20,
            sort: { createdAt: -1 },
          },
        });
        dispatch(
          slice.actions.getMessagesSuccess({
            conversationId,
            data,
          })
        );
      }
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

// 获取联系人
export function getContacts() {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const data = await friendService.friendsAsUsers();
      dispatch(slice.actions.getContactsSuccess(data));
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

// 获取组织架构
export function getOrganizations(scope) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const data = await roleService.getRoleWith({
        selector: {
          scope,
          type: 'org',
        },
      });
      dispatch(slice.actions.getOrganizationsSuccess(data));
      return data;
    } catch (error) {
      dispatch(
        slice.actions.hasError({
          code: error.code,
          message: error.message,
        })
      );
      return [];
    }
  };
}

// 获取组织架构
export function getOrganizationsOnlyChildren(scope, id, query) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const data = await roleService.getChildrenRoleNamesWithUser({
        scope,
        _id: id,
        type: 'org',
        query,
      });
      dispatch(slice.actions.getOrganizationsSuccess(data));
      return data;
    } catch (error) {
      dispatch(
        slice.actions.hasError({
          code: error.code,
          message: error.message,
        })
      );
      return [];
    }
  };
}
// 获取聊天会话
export function getConversations(conversationsId) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const data = await messagingService.usersAndConversations(conversationsId);
      if (conversationsId) {
        dispatch(slice.actions.getConversationSuccess(data[0]));
      } else {
        dispatch(
          slice.actions.getConversationsSuccess(
            data.map((conversation) => ({
              ...conversation,
              messages: _.compact(conversation.messages),
            }))
          )
        );
      }
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
// 获取聊天会话 // 需要优化,因为 每次自动刷新都会影响所有的会话
export function getSessions(conversationsId) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const data = await messagingService.usersAndConversations(conversationsId, true);
      if (conversationsId) {
        // dispatch(slice.actions.getConversationSuccess(data[0]));
        dispatch(slice.actions.getConversationsSuccess(data));
      } else {
        dispatch(
          slice.actions.getConversationsSuccess(
            data.map((conversation) => ({
              ...conversation,
              messages: _.compact(conversation.messages),
            }))
          )
        );
      }
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

// 获取单个聊天会话
export function getConversation(conversationKey) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const data = await messagingService.getConversationById({ _id: conversationKey });
      dispatch(slice.actions.getConversationSuccess(data));
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
export function getConversationByConversationKey(conversationKey) {
  return async (dispatch, getState) => {
    try {
      const { conversations } = getState().chat;
      if (conversations.byId[conversationKey]) {
        dispatch(slice.actions.getConversationByConversationKeySuccess(conversationKey));
      } else {
        const data = await messagingService.getConversationById({ _id: conversationKey });
        dispatch(slice.actions.getConversationSuccess(data));
      }
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

// 删除聊天会话
export function deleteConversation(conversationKey, isChatgpt) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      await messagingService.deleteConversation({ _id: conversationKey });
      if (isChatgpt) {
        const data = await messagingService.usersAndConversations(null, true);
        dispatch(slice.actions.getConversationsSuccess(data));
      } else {
        const data = await messagingService.usersAndConversations();
        dispatch(slice.actions.getConversationsSuccess(data));
      }
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

export function markConversationAsRead(conversationId) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      // await axios.get('/api/chat/conversation/mark-as-seen', {
      //   params: { conversationId },
      // });
      // dispatch(slice.actions.markConversationAsReadSuccess({ conversationId }));
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

// 获取参与者
export function getParticipants(conversationKey) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const data = await messagingService.getConversationParticipantsById({ _id: conversationKey });
      dispatch(slice.actions.getParticipantsSuccess(data));
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

// 合并会话
export function mergeConversations(newData) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      await dispatch(
        slice.actions.mergeConversationsUnique({
          newData,
        })
      );
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

// 合并会话
export function openai(selectedConversationId, message) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
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
      fetchEventSource('http://localhost:3030/openai', {
        ...requestOptions,
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
      }).catch((e) => {
        console.log(e);
      });
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
