
export default class MessagingService {
    constructor(options) {
        // eslint-disable-next-line no-restricted-syntax
        for (const name in options) {
            // eslint-disable-next-line no-prototype-builtins
            if (options.hasOwnProperty(name)) {
                this[name] = options[name]
            }
        }
    }

    usersAndConversations () {
        return this.api.get(`${this.model}/users/conversations`)
    }

    getConversationById (target) {
        return this.api.get(`${this.model}/conversations/${target._id}`)
    }

    getLastMessageBy (target) {
        return this.api.get(`${this.model}/conversations/${target._id}/lastMessage/${target.lastId}`)
    }

    getConversationParticipantsById (target) {
        return this.api.get(`${this.model}/conversations/${target._id}/participantsAsUsers`)
    }

    getConversationMessagesById (target) {
        return this.api.post(`${this.model}/conversations/${target._id}/messages`, target)
    }

    sendMessage (target) {
        return this.api.post(`${this.model}/conversations/${target._id}/sendMessage`, target)
    }

    findExistingConversationWithUsers (target) {
        return this.api.post(`${this.model}/findExistingConversationWithUsers`, target)
    }

    room (target) {
        return this.api.post(`${this.model}/conversations/room`, target)
    }

    deleteConversation (target) {
        return this.api.delete(`${this.model}/conversations/${target._id}`, target)
    }
}
