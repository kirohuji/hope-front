import { Service } from './base';

export default class OrderService extends Service {
  getInfo() {
    return this.api.get(`${this.model}/info`);
  }

  getPDF(target) {
    window.open(`${this.api.defaults.baseURL}/${this.model}/${target}/pdf`, '_blank');
  }


  completeMembershipChange(target) {
    return this.api.post(`${this.model}/complete-membership-change`, target);
  }

  changeMembership(target) {
    return this.api.post(`${this.model}/change-membership`, target);
  }

  cancelOrder(target) {
    return this.api.post(`${this.model}/${target._id}/cancel`);
  }
}
