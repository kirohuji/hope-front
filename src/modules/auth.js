import { Service } from './base'

export default class AuthService extends Service {
  login(target) {
    return this.api.post(`${this.model}/login`, target)
  }

  logout() {
    return this.api.post(`${this.model}/logout`)
  }
}
