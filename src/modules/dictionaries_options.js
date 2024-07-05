import { Service } from './base';

export default class DictionaryOptionService extends Service {
  findOne(target) {
    return this.api.request({
      url: `${this.model}/findOne`,
      method: 'POST',
      data: target,
    });
  }
}
