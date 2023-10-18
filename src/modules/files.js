
export default class FileService {
    constructor(options) {
        // eslint-disable-next-line no-restricted-syntax
        for (const name in options) {
            // eslint-disable-next-line no-prototype-builtins
            if (options.hasOwnProperty(name)) {
                this[name] = options[name]
            }
        }
    }

    avatar (target) {
        const token = localStorage.getItem('accessToken')
        if (token) {
            return this.api.post(`${this.model}/avatar?authToken=${token}`, target)
        }
        return this.api.post(`${this.model}/avatar`, target)

        // return fetch('http://localhost:5005/api/v1/avatar', {
        //     method: 'POST',
        //     headers: {
        //         'x-auth-token': localStorage.getItem('accessToken')
        //     },
        //     body: target
        // })
    }

    upload (target) {
        const token = localStorage.getItem('accessToken')
        if (token) {
            return this.api.post(`${this.model}/upload?authToken=${token}`, target)
        }
        return this.api.post(`${this.model}/upload`, target)

        // return fetch('http://localhost:5005/api/v1/avatar', {
        //     method: 'POST',
        //     headers: {
        //         'x-auth-token': localStorage.getItem('accessToken')
        //     },
        //     body: target
        // })
    }

    excel (target) {
        const token = localStorage.getItem('accessToken')
        if (token) {
            return this.api.post(`${this.model}/excel?authToken=${token}`, target)
        }
        return this.api.post(`${this.model}/excel`, target)

        // return fetch('http://localhost:5005/api/v1/avatar', {
        //     method: 'POST',
        //     headers: {
        //         'x-auth-token': localStorage.getItem('accessToken')
        //     },
        //     body: target
        // })
    }

    createSession (target) {
        return this.api.post(`${this.model}/sessions`, target, {
            headers: {
                "Content-Type": "application/json"
            },
        })
    }

    createToken (target) {
        return this.api.post(`${this.model}/sessions/${target.customSessionId}/connections`, target, {
            headers: {
                "Content-Type": "application/json"
            },
        })
    }

    getToken (target) {
        return this.api.post(`${this.model}/conversations/${target.customSessionId}`, target, {
            headers: {
                "Content-Type": "application/json"
            },
        })
    }
}
