import { Service } from './base'

export default class ArtcleService extends Service {
    addWithCurrentUser (target) {
        return this.api.post(`${this.model}/users/current`, target)
    }

    addCommentWithCurrentUser (target) {
        return this.api.post(`${this.model}/comments/users/current`, target)
    }

    pagination (selector, options) {
        return this.api.post(`${this.model}/posts/pagination`, {
            selector, options
        })
    }

    get (target) {
        return this.api.get(`${this.model}/posts/${target._id}`)
    }
}
