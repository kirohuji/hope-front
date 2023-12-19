import { Service } from './base'

export default class BroadcastService extends Service {
    addCurrentUser (target) {
        return this.api.post(`${this.model}/users/current`, {
            broadcast_id: target._id
        })
    }

    addUser (target) {
        return this.api.post(`${this.model}/users`, {
            user_id: target.user_id,
            broadcast_id: target.broadcast_id
        })
    }

    deleteUser (target) {
        return this.api.delete(`${this.model}/${target.broadcast_id}/users/${target.user_id}`)
    }

    getUsers (target) {
        return this.api.get(`${this.model}/${target._id}/users`)
    }

    getBook (target) {
        return this.api.get(`${this.model}/book`)
    }

    getUsersCount (target) {
        return this.api.get(`${this.model}/${target._id}/users/count`)
    }

    signIn (target) {
        return this.api.post(`${this.model}/${target.broadcast_id}/users/${target.user_id}/${target.status === "signIn" ? "signOut" : "signIn"}`)
    }

    publish (target) {
        return this.api.post(`${this.model}/${target.broadcast_id}/publish`)
    }

    unpublish (target) {
        return this.api.post(`${this.model}/${target.broadcast_id}/unpublish`)
    }
}
