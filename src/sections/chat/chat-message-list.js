import PropTypes from 'prop-types';
// @mui
import Box from '@mui/material/Box';
// components
import Scrollbar from 'src/components/scrollbar';
import Lightbox, { useLightBox } from 'src/components/lightbox';
//
import { useMessagesScroll } from './hooks';
import ChatMessageItem from './chat-message-item';
// ----------------------------------------------------------------------

export default function ChatMessageList ({ onRefresh, sendingMessage = {}, messages = [], participants }) {
  const { messagesEndRef } = useMessagesScroll(messages);

  const slides = messages
    .filter((message) => message.contentType === 'image')
    .map((message) => ({ src: message.body }));

  const lightbox = useLightBox(slides);

  return (
    <>
      <Scrollbar ref={messagesEndRef} sx={{ px: 3, py: 5, height: 1 }}>
        <Box sx={{ height: 1 }}>
          {messages.map((message, index) => (
            <ChatMessageItem
              key={index}
              message={message}
              participants={participants}
              onOpenLightbox={() => lightbox.onOpen(message.body)}
            />
          ))}
          {
            sendingMessage && sendingMessage._id && <ChatMessageItem
              message={sendingMessage}
              participants={participants}
              onOpenLightbox={() => lightbox.onOpen(sendingMessage.body)}
            />
          }
        </Box>
      </Scrollbar>

      <Lightbox
        index={lightbox.selected}
        slides={slides}
        open={lightbox.open}
        close={lightbox.onClose}
      />
    </>
  );
}

ChatMessageList.propTypes = {
  messages: PropTypes.array,
  onRefresh: PropTypes.func,
  participants: PropTypes.array,
  sendingMessage: PropTypes.object,
};
