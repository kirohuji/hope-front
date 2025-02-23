import api, { fileService as fileApi } from '../utils/request';
import AuthService from '../modules/auth';
import UserService from '../modules/users';
import BookService from '../modules/books';
import BroadcastService from '../modules/broadcasts';
import ProfileService from '../modules/profiles';
import FlieService from '../modules/files';
import FilesManagerService from '../modules/files_manager';
import FriendService from '../modules/friends';
import MessagingService from '../modules/messaging';
import ScopeService from '../modules/scopes';
import VersionService from '../modules/versions';
import RoleService from '../modules/roles';
import EventService from '../modules/events';
import DictionaryService from '../modules/dictionaries';
import DictionaryOptionService from '../modules/dictionaries_options';
import ArticleService from '../modules/articles';
import NotificationService from '../modules/notifications';
import SensitiveWordService from '../modules/sensitiveWords';
import AuditService from '../modules/audits';

export const authService = new AuthService({ api, model: '' });
export const userService = new UserService({ api, model: 'users' });
export const roleService = new RoleService({ api, model: 'roles' });
export const profileService = new ProfileService({ api, model: 'profiles' });
export const fileManagerService = new FilesManagerService({ api, model: 'files' });
export const friendService = new FriendService({ api, model: 'friendships' });
export const messagingService = new MessagingService({ api, model: 'messaging' });
export const bookService = new BookService({ api, model: 'books' });
export const eventService = new EventService({ api, model: 'events' });
export const scopeService = new ScopeService({ api, model: 'scopes' });
export const versionService = new VersionService({ api, model: 'versions' });
export const dictionaryService = new DictionaryService({ api, model: 'dictionaries' });
export const dictionaryOptionService = new DictionaryOptionService({
  api,
  model: 'dictionaries/options',
});
export const articleService = new ArticleService({ api, model: 'articles' });
export const broadcastService = new BroadcastService({ api, model: 'broadcasts' });
export const notificationService = new NotificationService({ api, model: 'notifications' });
export const auditService = new AuditService({ api, model: 'audits' });
export const sensitiveWordService = new SensitiveWordService({ api, model: 'sensitve/words' });

export const fileService = new FlieService({ api: fileApi, model: '' });
