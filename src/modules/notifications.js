import { Service } from './base';

export default class NotificationService extends Service {
  getWithCurrentUser() {
    return this.api.get(`${this.model}/current`);
  }

  paginationWithCurrentUser(target) {
    return this.api.post(`${this.model}/current/pagination`, target);
  }

  createCurrentUser(target) {
    return this.api.post(`${this.model}/current`, target);
  }

  deleteCurrentUser(target) {
    return this.api.delete(`${this.model}/current/${target._id}`);
  }

  updateCurrentUser(target) {
    return this.api.patch(`${this.model}/current/${target._id}`, target);
  }

  checkRead(target) {
    return this.api.post(`${this.model}/current/checkRead/${target._id}`);
  }

  overview() {
    return this.api.get(`${this.model}/current/overview`);
  }
}
