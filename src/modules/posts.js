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
}
