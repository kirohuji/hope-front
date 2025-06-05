import { Service } from './base'

export default class AlipayService extends Service {

  createPayment(target) {
    return this.api.post(`${this.model}/create-payment`, target);
  }
}
