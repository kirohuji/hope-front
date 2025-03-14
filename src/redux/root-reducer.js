import { combineReducers } from 'redux';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
// slices
import checkoutReducer from './slices/checkout';
import scopeReducer from './slices/scope';
import versionReducer from './slices/version';
import dashboardReducer from './slices/dashboard';
import calendarReducer from './slices/calendar';
import articleReducer from './slices/article';
import chatReducer from './slices/chat';
import audioReducer from './slices/audio';
import trainningReducer from './slices/trainning';
import roleReducer from './slices/role';
import fileReducer from './slices/file';
import broadcastReducer from './slices/broadcast';
import bookReducer from './slices/book';
import openaiReducer from './slices/openai';
import notificationReducer from './slices/notification';
import dictionaryReducer from './slices/dictionary';
// ----------------------------------------------------------------------

const trainningPersistConfig = {
  key: 'tranning',
  storage,
  keyPrefix: 'redux-',
};

const checkoutPersistConfig = {
  key: 'checkout',
  storage,
  keyPrefix: 'redux-',
};

export const scopePersistConfig = {
  key: 'scope',
  storage,
  keyPrefix: 'redux-',
};

export const bookPersistConfig = {
  key: 'book',
  storage,
  keyPrefix: 'redux-',
};

export const dashboardPersistConfig = {
  key: 'dashboard',
  storage,
  keyPrefix: 'redux-',
};

export const rolePersistConfig = {
  key: 'role',
  storage,
  keyPrefix: 'redux-',
};

export const articlePersistConfig = {
  key: 'article',
  storage,
  keyPrefix: 'redux-',
  whitelist: ['sortBy', 'checkout'],
};

export const filePersistConfig = {
  key: 'file',
  storage,
  keyPrefix: 'redux-',
};

export const broadcastPersistConfig = {
  key: 'broadcast',
  storage,
  keyPrefix: 'redux-',
};

export const calenderPersistConfig = {
  key: 'calender',
  storage,
  keyPrefix: 'redux-',
};

export const chatPersistConfig = {
  key: 'chat',
  storage,
  keyPrefix: 'redux-',
};

export const dictionaryPersistConfig = {
  key: 'dictionary',
  storage,
  keyPrefix: 'redux-',
};

export const rootReducer = combineReducers({
  calendar: persistReducer(calenderPersistConfig, calendarReducer),
  chat: persistReducer(chatPersistConfig, chatReducer),
  audio: audioReducer,
  trainning: persistReducer(trainningPersistConfig, trainningReducer),
  notification: notificationReducer,
  dashboard: persistReducer(dashboardPersistConfig, dashboardReducer),
  dictionary: persistReducer(dictionaryPersistConfig, dictionaryReducer),
  // book: persistReducer(bookPersistConfig, bookReducer),
  book: bookReducer,
  openai: openaiReducer,
  role: persistReducer(rolePersistConfig, roleReducer),
  checkout: persistReducer(checkoutPersistConfig, checkoutReducer),
  scope: persistReducer(scopePersistConfig, scopeReducer),
  version: versionReducer,
  article: articleReducer,
  // article: persistReducer(articlePersistConfig, articleReducer),
  // book: persistReducer(bookPersistConfig, bookPersistConfig),
  file: persistReducer(filePersistConfig, fileReducer),
  // broadcast: persistReducer(broadcastPersistConfig, broadcastReducer),
  broadcast: broadcastReducer,
});
