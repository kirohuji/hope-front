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

  delete(target) {
    return this.api.delete(`${this.model}/delete/${target._id}`, target)
  }

  deleteMany(target) {
    return this.api.post(`${this.model}/deleteMany`, target)
  }

  changePassword(target) {
    return this.api.post(`${this.model}/changePassword`, target)
  }

  paginationByProfile(selector, options) {
    return this.api.post(`${this.model}/profiles/pagination`, {
      selector, options
    })
  }
}
