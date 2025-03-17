import { Service } from './base';

export default class AuditService extends Service {
  moderation(target) {
    return this.api.post(`${this.model}/${target._id}/moderation`, target);
  }
}
