// ----------------------------------------------------------------------

export default function useGetNavItem({ currentUserId, conversation, user }) {
  const { messages, participants } = conversation;

  let participantsInConversation = [];
  if (conversation.isGroup === 'GROUP') {
    participantsInConversation = participants || [
      {
        ...conversation,
        username: conversation.name || conversation.username,
        photoURL: conversation?.avatarUrl?.preview || conversation.photoURL,
      },
    ];
  } else {
    participantsInConversation = participants?.filter(
      (participant) => participant._id !== currentUserId
    ) || [
      {
        ...conversation,
        username: conversation.name || conversation.username,
        photoURL: conversation?.avatarUrl?.preview || conversation.photoURL,
      },
    ];
  }
  const lastMessage = messages ? messages[messages.length - 1] : { body: '' };

  const group = participantsInConversation.length > 2 || conversation.isGroup === 'GROUP';

  const displayName = group
    ? conversation.label || participantsInConversation.map((participant) => participant.realName).join(', ')
    : participantsInConversation[0]?.displayName || participantsInConversation[0]?.username || conversation.label;
  const realName = group
    ? // ? participantsInConversation.map((participant) => participant.realName).join(', ')
      '群聊'
    : participantsInConversation[0]?.realName;

  const hasOnlineInGroup = group
    ? participantsInConversation.map((item) => item.status).includes('online')
    : false;

  let displayText = '';

  if (lastMessage) {
    const sender = lastMessage.senderId === currentUserId ? ' 你: ' : '';

    const message = lastMessage.contentType === 'image' ? '发送了一张照片' : lastMessage.body;

    displayText = `${sender}${message}`;
  }

  return {
    group,
    displayName,
    realName,
    type: conversation.type || 'contact',
    displayText,
    participants: participantsInConversation,
    lastActivity: lastMessage?.createdAt,
    hasOnlineInGroup,
  };
}
