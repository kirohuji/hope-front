import { Service } from './base';

export default class BpmnService extends Service {
  execute(target) {
    return this.api.post(`${this.model}/execute`, target);
  }
}
