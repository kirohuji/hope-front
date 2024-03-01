import PropTypes from 'prop-types';
import { useState, useEffect, useRef, useCallback } from 'react';
// @mui
import Box from '@mui/material/Box';
// components
import Scrollbar from 'src/components/scrollbar';
import Lightbox, { useLightBox } from 'src/components/lightbox';
//
import { useMessagesScroll } from './hooks';
import ChatMessageItem from './chat-message-item';
// ----------------------------------------------------------------------

export default function ChatMessageList({
  onRefresh,
  sendingMessages = [],
  messages = [],
  conversationId,
  participants,
}) {
  const [loadingHistory, setLoadingHistory] = useState(false);
  const { messagesEndRef } = useMessagesScroll(messages);

  const slides = messages
    .filter((message) => message.contentType === 'image' || message.contentType === 'jpg')
    .map((message) => ({ src: message.body }));

  const lightbox = useLightBox(slides);

  useEffect(() => {
    const handleScroll = () => {
      if (scrollNode.scrollTop === 0 && !loadingHistory) {
        const scrollPosition = scrollNode.scrollHeight - scrollNode.scrollTop;
        setLoadingHistory(true);
        onRefresh(messages.length).then(() => {
          setLoadingHistory(false);
          scrollNode.scrollTop = scrollNode.scrollHeight - scrollPosition;
        });
      }
    };

    const scrollNode = messagesEndRef.current;
    scrollNode.addEventListener('scroll', handleScroll);
    return () => {
      scrollNode.removeEventListener('scroll', handleScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messagesEndRef.current]);

  return (
    <>
      <Scrollbar ref={messagesEndRef} sx={{ px: 3, py: 5, height: 1 }}>
        <Box sx={{ height: 1 }}>
          {messages.map((message, index) => (
            <ChatMessageItem
              conversationId={conversationId}
              key={index}
              message={message}
              participants={participants}
              onOpenLightbox={() => lightbox.onOpen(message.body)}
            />
          ))}
          {sendingMessages.map((message, index) => (
            <ChatMessageItem
              conversationId={conversationId}
              key={index}
              message={message}
              participants={participants}
              onOpenLightbox={() => lightbox.onOpen(message.body)}
            />
          ))}
          {/* {
            sendingMessage && sendingMessage._id && <ChatMessageItem
              message={sendingMessage}
              participants={participants}
              onOpenLightbox={() => lightbox.onOpen(sendingMessage.body)}
            />
          } */}
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
  conversationId: PropTypes.string,
  messages: PropTypes.array,
  onRefresh: PropTypes.func,
  participants: PropTypes.array,
  sendingMessages: PropTypes.array,
};
