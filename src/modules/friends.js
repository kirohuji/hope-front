
export default class FriendService {
    constructor(options) {
        // eslint-disable-next-line no-restricted-syntax
        for (const name in options) {
            // eslint-disable-next-line no-prototype-builtins
            if (options.hasOwnProperty(name)) {
                this[name] = options[name]
            }
        }
    }

    friendsAsUsers(){
        return this.api.post(`${this.model}/friendsAsUsers`)
    }

    friendRequests(){
        return this.api.post(`${this.model}/friendRequests`)
    }

    requestFriendship(result){
        return this.api.get(`${this.model}/requestFriendship/${result._id}`)
    }

    acceptFriendshipRequest(result){
        return this.api.get(`${this.model}/acceptFriendshipRequest/${result._id}`)
    }

    // avatar (target) {
    //     const token = localStorage.getItem('accessToken')
    //     if (token) {
    //         return this.api.post(`${this.model}/avatar?authToken=${token}`, target)
    //     } else {
    //         return this.api.post(`${this.model}/avatar`, target)
    //     }
    //     // return fetch('http://localhost:5005/api/v1/avatar', {
    //     //     method: 'POST',
    //     //     headers: {
    //     //         'x-auth-token': localStorage.getItem('accessToken')
    //     //     },
    //     //     body: target
    //     // })
    // }
}
