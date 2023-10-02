// ----------------------------------------------------------------------

export default function useGetMessage ({ message, participants, currentUserId }) {
  const sender = participants.find((participant) => participant._id === message.senderId);

  const senderDetails =
    message.senderId === currentUserId
      ? {
        type: 'me',
      }
      : {
        photoURL: sender?.photoURL,
        username: sender?.username
      };

  const me = senderDetails.type === 'me';

  const hasImage = message.contentType === 'image';

  return {
    hasImage,
    me,
    senderDetails,
  };
}
