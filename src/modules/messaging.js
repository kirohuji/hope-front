import { Service } from './base';

export default class MessagingService extends Service {
  usersAndConversations(conversationsId, isChatgpt) {
    if (isChatgpt) {
      return this.api.post(`${this.model}/users/conversations/participants`, {
        participants: ['a5u9kNTzKAdghpr55'],
        isSession: true,
      });
    }
    if (conversationsId) {
      return this.api.post(`${this.model}/users/conversations`, conversationsId);
      // return this.api.post(`${this.model}/users/conversations`, target);
    }
    return this.api.get(`${this.model}/users/conversations`);
  }

  getConversationById(target) {
    return this.api.get(`${this.model}/conversations/${target._id}`);
  }

  updateConversationById(target) {
    return this.api.patch(`${this.model}/conversations/${target._id}`, target);
  }

  participantsAsUsers(target) {
    return this.api.get(`${this.model}/conversations/${target._id}/participants`);
  }

  addParticipants(target) {
    return this.api.post(`${this.model}/conversations/${target._id}/addParticipants`, target);
  }

  removeParticipants(target) {
    return this.api.post(`${this.model}/conversations/${target._id}/removeParticipants`, target);
  }

  removeParticipant(target) {
    return this.api.post(`${this.model}/conversations/${target._id}/removeParticipant`, target);
  }

  getLastMessageBy(target) {
    return this.api.get(`${this.model}/conversations/${target._id}/lastMessage/${target.lastId}`);
  }

  getLastMessage(target) {
    return this.api.get(`${this.model}/conversations/${target._id}/lastMessage`);
  }

  getConversationParticipantsById(target) {
    return this.api.get(`${this.model}/conversations/${target._id}/participantsAsUsers`);
  }

  getConversationMessagesById(target) {
    return this.api.post(`${this.model}/conversations/${target._id}/messages`, target);
  }

  getConversationMessagesByIdWithDate(target) {
    return this.api.post(`${this.model}/conversations/${target._id}/messages/date`, target);
  }

  getConversationMessagesAttachmentsById(target) {
    return this.api.post(`${this.model}/conversations/${target._id}/messages/attachments`, target);
  }

  sendMessage(target) {
    return this.api.post(`${this.model}/conversations/${target._id}/sendMessage`, target);
  }

  findExistingConversationWithUsers(target) {
    return this.api.post(`${this.model}/findExistingConversationWithUsers`, target);
  }

  room(target) {
    return this.api.post(`${this.model}/conversations/room`, target);
  }

  deleteConversation(target) {
    // return this.api.delete(`${this.model}/conversations/${target._id}`, target)
    return this.api.post(`${this.model}/conversations/delete/${target._id}`, target);
  }

  savePushNotificationToken(target) {
    // return this.api.delete(`${this.model}/conversations/${target._id}`, target)
    return this.api.post(`${this.model}/conversations/savePushNotificationToken`, target);
  }

  updateDeviceStatus(target) {
    return this.api.post(`${this.model}/conversations/updateDeviceStatus`, target);
  }
}
