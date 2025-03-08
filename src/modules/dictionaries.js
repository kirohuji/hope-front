import { Service } from './base';

export default class DictionaryService extends Service {
  findOne(target) {
    return this.api.request({
      url: `${this.model}/findOne`,
      method: 'POST',
      data: target,
    });
  }

  dict(target) {
    return this.api.post(`${this.model}/dict`, target);
  }

  sync(target) {
    return this.api.post(`${this.model}/sync`, target);
  }
}
