import { Service } from './base'

export default class RevenueCatService extends Service {

  setUser(target) {
    return this.api.post(`${this.model}/user`, target);
  }

  getUser() {
    return this.api.get(`${this.model}/user`);
  }

  entitlements(target) {
    return this.api.post(`${this.model}/entitlements`, target);
  }
}
