import { Service } from './base';

export default class OrderService extends Service {
  getInfo() {
    return this.api.get(`${this.model}/info`);
  }
}
