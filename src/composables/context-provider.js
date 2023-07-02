import api, { fileService as fileApi } from "../utils/request";
import AuthService from "../modules/auth";
import UserService from "../modules/users";
import BookService from "../modules/books";
import ProfileService from "../modules/profiles";
import FlieService from "../modules/files";
import FriendService from "../modules/friends";
import MessagingService from "../modules/messaging";
import ScopeService from "../modules/scopes";
import RoleService from "../modules/roles";
import EventService from "../modules/events";
import DictionaryService from "../modules/dictionaries";
import DictionaryOptionService from "../modules/dictionaries_options";
import ArticleService from "../modules/articles";
// export const serviceContainer = {
//   authService: new AuthService({ api: api, model: 'auth' })
// };
export const authService = new AuthService({ api, model: '' })
export const userService = new UserService({ api, model: 'users' })
export const roleService = new RoleService({ api, model: 'roles' })
export const profileService = new ProfileService({ api, model: 'profiles' })
export const fileService = new FlieService({ api: fileApi, model: '' })
export const friendService = new FriendService({ api, model: 'friendships' })
export const messagingService = new MessagingService({ api, model: 'messaging' })
export const bookService = new BookService({ api, model: 'books' })
export const eventService = new EventService({ api, model: 'events' })
export const scopeService = new ScopeService({ api, model: 'scopes' })
export const dictionaryService = new DictionaryService({ api, model: 'dictionaries' })
export const dictionaryOptionService = new DictionaryOptionService({ api, model: 'dictionaries/options' })
export const articleService = new ArticleService({ api, model: 'articles' })