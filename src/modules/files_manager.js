import { Service } from './base';

export default class FilesManagerService extends Service {
  getWithCurrentUser(target) {
    if (target && target.type === 'mp3') {
      return this.api.get(`${this.model}/current/type/mp3`);
    }
    return this.api.get(`${this.model}/current`);
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

  inviteEmailsWithCurrent(target) {
    return this.api.post(`${this.model}/current/inviteEmails`, target);
  }

  deleteInviteItem(target) {
    return this.api.delete(`${this.model}/${target.file_id}/shared/${target.user_id}`, target);
  }

  accpetShareFile(target) {
    return this.api.post(`${this.model}/current/accpetShareFile`, target);
  }

  denyShareFile(target) {
    return this.api.post(`${this.model}/current/denyShareFile`, target);
  }

  getFileInfo(target) {
    return this.api.get(`${this.model}/mp3/${target}`);
  }
}
