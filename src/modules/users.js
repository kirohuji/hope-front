import { Service } from './base'

export default class UserService extends Service {
  info(target) {
    return this.api.get(`${this.model}/info`, target)
  }

  infoById(target) {
    return this.api.get(`${this.model}/info/${target._id}`, target)
  }

  register(target) {
    return this.api.post(`${this.model}/register`, target)
  }
}
