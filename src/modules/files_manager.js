import { Service } from './base'

export default class FilesManagerService extends Service {
    getWithCurrentUser () {
        return this.api.get(`${this.model}/current`)
    }

    createCurrentUser (target) {
        return this.api.post(`${this.model}/current`,target)
    }

    deleteCurrentUser (target) {
        return this.api.delete(`${this.model}/current/${target._id}`)
    }

    updateCurrentUser (target) {
        return this.api.patch(`${this.model}/current/${target._id}`, target)
    }
}
