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

  cancelSubscription(target) {
    return this.api.post(`${this.model}/subscriptions/${target._id}/cancel`);
  }

  createSubscription(target) {
    return this.api.post(`${this.model}/subscriptions`, target);
  }

  changeSubscription(target) {
    return this.api.post(`${this.model}/subscriptions/change`, target);
  }

  completePayment(target) {
    return this.api.post(`${this.model}/${target._id}/subscriptions/complete-payment`);
  }

  cancelPayment(target) {
    return this.api.post(`${this.model}/${target._id}/subscriptions/cancel-payment`);
  }

  syncSubscription(target) {
    return this.api.post(`${this.model}/${target._id}/subscriptions/sync`);
  }


}
