import { Service } from './base'

export default class BookService extends Service {
    addBookPost (target) {
        return this.api.post(`${this.model}/${target.book_id}/post`, target)
    }

    addBookArticle (target) {
        return this.api.post(`${this.model}/${target.book_id}/article`, target)
    }

    updateBookPost (target) {
        return this.api.patch(`${this.model}/${target.book_id}/post/${target._id}`, target)
    }

    deleteBookPost (target) {
        return this.api.delete(`${this.model}/posts/${target._id}`, target)
    }

    paginationWithPostsByBookId (target) {
        return this.api.post(`${this.model}/posts/pagination`, target)
    }

    getPostsByBookId (target) {
        return this.api.get(`${this.model}/posts/${target.book_id}`, target)
    }

    getPost (target) {
        return this.api.get(`${this.model}/posts/${target._id}`, target)
    }

    publish (target) {
        return this.api.post(`${this.model}/${target._id}/publish`, target)
    }

    getBooksWithCurrentUser () {
        return this.api.get(`${this.model}/users/current`)
    }

    addBookCurrentUser (target) {
        return this.api.post(`${this.model}/users/current`, {
            book_id: target.book_id
        })
    }

    activeBookWithCurrentUser (target) {
        return this.api.patch(`${this.model}/users/current`, {
            book_id: target.book_id,
            status: 'active'
        })
    }

    startWithCurrentUser (){
        return this.api.post(`${this.model}/users/current/start`,{
            date: new Date()
        })
    }

    submitWithCurrentUser (target){
        return this.api.post(`${this.model}/users/current/${target._id}/submit`)
    }
}
