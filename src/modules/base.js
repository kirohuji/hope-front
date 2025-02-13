export class Service {
  constructor(options) {
    // eslint-disable-next-line no-restricted-syntax
    for (const name in options) {
      // eslint-disable-next-line no-prototype-builtins
      if (options.hasOwnProperty(name)) {
        this[name] = options[name]
      }
    }
  }

  makeUserService({ api }) {
    this.api = api
    return this
  }

  delete(target) {
    return this.api.delete(`${this.model}/${target._id}`, target)
  }

  patch(target) {
    return this.api.patch(`${this.model}/${target._id}`, target)
  }

  post(target) {
    return this.api.post(`${this.model}`, target)
  }

  active(target) {
    return this.api.post(`${this.model}/active`, target)
  }

  put(target) {
    return this.api.put(`${this.model}/${target._id}`, target)
  }

  get(target) {
    return this.api.get(`${this.model}/${target._id}`, target)
  }

  getAll(target) {
    return this.api.get(`${this.model}`, target)
  }

  getModel() {
    return this.api.get(`${this.model}/model`)
  }

  pagination(selector, options) {
    return this.api.post(`${this.model}/pagination`, {
      selector, options
    })
  }

  search(selector, options) {
    return this.api.post(`${this.model}/search`, {
      selector, options
    })
  }
}
