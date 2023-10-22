import keyBy from 'lodash/keyBy';
import { createSlice } from '@reduxjs/toolkit';
import _ from 'lodash'
// utils
import { friendService, roleService, messagingService } from 'src/composables/context-provider';

// ----------------------------------------------------------------------


function serverArray (list, parent, data, parentList) {
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < list.length; i++) {
    if (list[i] && list[i].value) {
      if (list[i] && list[i].children && _.compact(list[i].children).length) {
        serverArray(list[i].children.map(item => _.find(data, ["_id", item._id])), list[i], data, list);
      } else {
        list[i].children = undefined;
      }
      if (parent && parent.children) {
        if (list[i]) {
          parent.children[i] = {
            name: list[i].label,
            group: list[i].scope,
            role: list[i].value,
            ...list[i],
          };
        } else {
          delete parent.children[i];
        }
      }
    }
  }
}
function getTree (data) {
  const list = data.map(item => ({
    name: item.label,
    group: item.scope,
    role: item.value,
    ...item
  }))
  const root = list.filter((item) => item.root).map(item => ({
    name: item.label,
    group: item.scope,
    role: item.value,
    ...item,
  }))
  serverArray(root, null, list);
  return root;
}


function objFromArray (array, key = '_id') {
  return array.reduce((accumulator, current) => {
    accumulator[current[key]] = current;
    return accumulator;
  }, {});
}

const initialState = {
  isLoading: false,
  error: null,
  contacts: { byId: {}, allIds: [] },
  organizations: [],
  conversations: { byId: {}, allIds: [] },
  conversationsByAll: [],
  contactsByAll: [],
  activeConversationId: null,
  participants: [],
  recipients: [],
  lastMessage: {},
};

const slice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    // START LOADING
    startLoading (state) {
      state.isLoading = true;
    },

    // HAS ERROR
    hasError (state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },

    // GET CONTACT SSUCCESS
    getContactsSuccess (state, action) {
      const contacts = action.payload;

      state.contactsByAll = contacts;
      state.contacts.byId = objFromArray(contacts);
      state.contacts.allIds = Object.keys(state.contacts.byId);
    },

    getOrganizationsSuccess (state, action) {
      const organizations = action.payload;

      state.organizations = getTree(organizations);
      console.log(state.organizations)
    },

    // GET CONVERSATIONS
    getConversationsSuccess (state, action) {
      const conversations = action.payload;
      state.conversationsByAll = conversations;
      state.conversations.byId = keyBy(conversations, '_id');
      state.conversations.allIds = Object.keys(state.conversations.byId);
    },

    // GET CONVERSATION
    getConversationSuccess (state, action) {
      const conversation = action.payload;

      if (conversation) {
        state.conversations.byId[conversation._id] = conversation;
        state.activeConversationId = conversation._id;
        if (!state.conversations.allIds.includes(conversation._id)) {
          state.conversations.allIds.push(conversation._id);
        }
      } else {
        state.activeConversationId = null;
      }
    },

    // ON SEND MESSAGE
    onSendMessage (state, action) {
      const conversation = action.payload;
      const { conversationId, messageId, message, contentType, attachments, createdAt, senderId } =
        conversation;

      const newMessage = {
        _id: messageId,
        body: message,
        contentType,
        attachments,
        createdAt,
        senderId,
      };

      state.conversations.byId[conversationId].messages.push(newMessage);
    },

    getMessagesSuccess (state, action) {
      const { conversationId, data } = action.payload;
      const orderData = _.orderBy(data, ["createdAt", "asc"]);
      if (!state.conversations.byId[conversationId]?.messages) {
        state.conversations.byId[conversationId].messages = [];
      }
      state.conversations.byId[conversationId].messages.unshift(...orderData)
      state.lastMessage = orderData[orderData.length - 1];
    },

    getNewMessagesSuccess (state, action) {
      const { conversationId, data } = action.payload;
      const orderData = _.orderBy(data, ["createdAt", "asc"]);
      if (!state.conversations.byId[conversationId]?.messages) {
        state.conversations.byId[conversationId].messages = [];
      }
      state.conversations.byId[conversationId].messages = _.uniqBy([...state.conversations.byId[conversationId].messages, ...orderData], "_id")
      state.lastMessage = state.conversations.byId[conversationId].messages[state.conversations.byId[conversationId].messages.length - 1];
    },

    markConversationAsReadSuccess (state, action) {
      const { conversationId } = action.payload;
      const conversation = state.conversations.byId[conversationId];
      if (conversation) {
        conversation.unreadCount = 0;
      }
    },

    // GET PARTICIPANTS
    getParticipantsSuccess (state, action) {
      const participants = action.payload;
      state.participants = participants;
    },

    // RESET ACTIVE CONVERSATION
    resetActiveConversation (state) {
      state.activeConversationId = null;
    },

    addRecipients (state, action) {
      const recipients = action.payload;
      state.recipients = recipients;
    },

    mergeConversationsUnique (state, action) {
      const { newData } = action.payload;
      state.conversationsByAll = newData;
      state.conversations.byId = keyBy(newData, '_id');
      state.conversations.allIds = Object.keys(state.conversations.byId);
    },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const { addRecipients, onSendMessage, resetActiveConversation } = slice.actions;


export function sendMessage (conversationKey, body) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      // debugger
      await messagingService.sendMessage({ _id: conversationKey, body: body.message, contentType: body.contentType })
      // dispatch(slice.actions.onSendMessage(body));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function getMessages (conversationKey, messageLimit) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const data = await messagingService.getConversationMessagesById({
        _id: conversationKey, options: {
          limit: 20,
          skip: messageLimit,
          sort: { createdAt: -1 }
        }
      })
      dispatch(slice.actions.getMessagesSuccess({
        conversationId: conversationKey,
        data
      }));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ----------------------------------------------------------------------

export function getContacts () {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const data = await friendService.friendsAsUsers()
      dispatch(slice.actions.getContactsSuccess(data));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function getOrganizations (scope) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const data = await roleService.getRoleWith({
        selector: {
          scope,
          type: 'org',
        },
      })
      dispatch(slice.actions.getOrganizationsSuccess(data));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ----------------------------------------------------------------------

export function getConversations () {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const data = await messagingService.usersAndConversations()
      dispatch(slice.actions.getConversationsSuccess(data.map(conversation => ({
          ...conversation,
          messages: _.compact(conversation.messages)
        }))));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ----------------------------------------------------------------------

export function getConversation (conversationKey) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const data = await messagingService.getConversationById({ _id: conversationKey })
      dispatch(slice.actions.getConversationSuccess(data));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function deleteConversation (conversationKey) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      await messagingService.deleteConversation({ _id: conversationKey })
      const data = await messagingService.usersAndConversations()
      dispatch(slice.actions.getConversationsSuccess(data));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}


// ----------------------------------------------------------------------

export function markConversationAsRead (conversationId) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      // await axios.get('/api/chat/conversation/mark-as-seen', {
      //   params: { conversationId },
      // });
      // dispatch(slice.actions.markConversationAsReadSuccess({ conversationId }));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ----------------------------------------------------------------------

export function getParticipants (conversationKey) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const data = await messagingService.getConversationParticipantsById({ _id: conversationKey })
      dispatch(slice.actions.getParticipantsSuccess(data));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function newMessageGet (conversationId) {
  return async (dispatch, getState) => {
    try {
      const { lastMessage } = getState().chat;
      if (lastMessage._id) {
        const data = await messagingService.getLastMessageBy({ _id: conversationId, lastId: lastMessage._id })
        await dispatch(slice.actions.getNewMessagesSuccess({
          conversationId,
          data
        }))
      }
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function mergeConversations (newData) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      await dispatch(slice.actions.mergeConversationsUnique({
        newData,
      }));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}
