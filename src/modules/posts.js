import { Service } from './base';

export default class PostService extends Service {
  comments(selector, options) {
    return this.api.post(`${this.model}/${selector.linkedObjectId}/comments/pagination`, {
      selector,
      options,
    });
  }

  addComment(target) {
    return this.api.post(`${this.model}/${target.linkedObjectId}/comments`, target);
  }

  isLike(target) {
    return this.api.get(`${this.model}/${target._id}/like`, target);
  }

  like(target) {
    return this.api.post(`${this.model}/${target._id}/like`, target);
  }

  unLike(target) {
    return this.api.delete(`${this.model}/${target._id}/like`, target);
  }
}
