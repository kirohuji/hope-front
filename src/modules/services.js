import { Service } from './base';

export default class ServiceService extends Service {
  execute(target) {
    return this.api.post(`${this.model}/execute`, target);
  }
}
