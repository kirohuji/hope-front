import { Service } from './base';

export default class DictionaryService extends Service {
  findOne(target) {
    return this.api.request({
      url: `${this.model}/findOne`,
      method: 'POST',
      data: target,
    });
  }
}
