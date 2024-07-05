import { Service } from './base'

export default class ArticleService extends Service {
    addWithCurrentUser (target) {
        return this.api.post(`${this.model}/users/current`, target)
    }

    addCommentWithCurrentUser (target) {
        return this.api.post(`${this.model}/comments/users/current`, target)
    }

    pagination (selector, options) {
        return this.api.post(`${this.model}/pagination`, {
            selector, options
        })
    }

    updateArticleCurrentUser (target) {
        return this.api.post(`${this.model}/users/current`, target)
    }

    getArticleCurrentUser (target) {
        return this.api.get(`${this.model}/users/current/${target._id}`, target)
    }
}
