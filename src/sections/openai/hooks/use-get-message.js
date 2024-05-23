// ----------------------------------------------------------------------

export default function useGetMessage({ message, participants, currentUserId }) {
  const sender = participants.find((participant) => participant._id === message.senderId);

  const senderDetails =
    message.senderId === currentUserId
      ? {
          type: 'me',
        }
      : {
          photoURL: sender?.photoURL,
          username: sender?.username,
          displayName: sender?.displayName,
          realName: sender?.realName,
        };

  const me = senderDetails.type === 'me';

  const hasImage = message.contentType === 'image' || message.contentType === 'jpg';

  return {
    hasImage,
    me,
    senderDetails,
  };
}
