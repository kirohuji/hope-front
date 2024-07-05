export default class FileService {
  constructor(options) {
    // eslint-disable-next-line no-restricted-syntax
    for (const name in options) {
      // eslint-disable-next-line no-prototype-builtins
      if (options.hasOwnProperty(name)) {
        this[name] = options[name];
      }
    }
  }

  avatar(target) {
    const token = localStorage.getItem('accessToken');
    if (token) {
      return this.api.post(`${this.model}/storage/avatars/upload?authToken=${token}`, target);
    }
    return this.api.post(`${this.model}/storage/avatars/upload`, target);
  }

  upload(target) {
    const token = localStorage.getItem('accessToken');
    if (token) {
      return this.api.post(`${this.model}/storage/upload?authToken=${token}`, target);
    }
    return this.api.post(`${this.model}/storage/upload`, target);
  }

  uploadToBook(target) {
    const token = localStorage.getItem('accessToken');
    if (token) {
      return this.api.post(`${this.model}/storage/books/upload?authToken=${token}`, target);
    }
    return this.api.post(`${this.model}/storage/books/upload`, target);
  }

  uploadToMessage(target) {
    const token = localStorage.getItem('accessToken');
    if (token) {
      return this.api.post(`${this.model}/storage/messages/upload?authToken=${token}`, target);
    }
    return this.api.post(`${this.model}/storage/messages/upload`, target);
  }

  excel(target) {
    const token = localStorage.getItem('accessToken');
    if (token) {
      return this.api.post(`${this.model}/storage/excel?authToken=${token}`, target);
    }
    return this.api.post(`${this.model}/storage/excel`, target);
  }

  createSession(target) {
    return this.api.post(`${this.model}/sessions`, target, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  createToken(target) {
    return this.api.post(`${this.model}/sessions/${target.customSessionId}/connections`, target, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  getToken(target) {
    return this.api.post(`${this.model}/conversations/${target.customSessionId}`, target, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
