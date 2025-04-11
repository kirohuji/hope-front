import PropTypes from 'prop-types';
import { useState, useEffect, useRef, useCallback } from 'react';
import CryptoJS from 'crypto-js';
// @mui
import Box from '@mui/material/Box';
// components
import Scrollbar from 'src/components/scrollbar';
import Lightbox, { useLightBox } from 'src/components/lightbox';
//
import { useMessagesScroll } from './hooks';
import ChatMessageItem from './chat-message-item';
// ----------------------------------------------------------------------
const secretKey = 'future';
export default function ChatMessageList({
  onRefresh,
  sendingMessages = [],
  messages = [],
  conversationId,
  participants,
}) {
  const [isFetching, setIsFetching] = useState(false); // 是否正在加载更多消息
  const { messagesEndRef } = useMessagesScroll(messages);

  const slides = messages
    .filter((message) => message.contentType === 'image' || message.contentType === 'jpg')
    .map((message) => ({ src: CryptoJS.AES.decrypt(message.body, secretKey).toString(CryptoJS.enc.Utf8) }));

  const lightbox = useLightBox(slides);

  const handleScroll = useCallback(async () => {
    if (messagesEndRef.current.scrollTop === 0 && !isFetching) {
      console.log('滚到顶部了');
      const scrollPosition = messagesEndRef.current.scrollHeight - messagesEndRef.current.scrollTop;
      if (!isFetching) {
        setIsFetching(true);
        console.log('请求数据');
        await onRefresh(messages.length); // 获取更多消息
        setIsFetching(false); // 加载完成后重置状态
        messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight - scrollPosition;
      }
    }
  }, [messagesEndRef, isFetching, onRefresh, messages.length]);

  useEffect(() => {
    const scrollNode = messagesEndRef.current;
    scrollNode.addEventListener('scroll', handleScroll);
    return () => {
      scrollNode.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll, messagesEndRef]);

  return (
    <>
      <Scrollbar ref={messagesEndRef} sx={{ px: 3, py: 5, height: 1 }} className="message-list">
        <Box sx={{ height: 1 }}>
          {messages.map((message, index) => (
            <ChatMessageItem
              conversationId={conversationId}
              key={index}
              message={message}
              participants={participants}
              onOpenLightbox={() => lightbox.onOpen(CryptoJS.AES.decrypt(message.body, secretKey).toString(CryptoJS.enc.Utf8))}
            />
          ))}
          {sendingMessages.map((message, index) => (
            <ChatMessageItem
              conversationId={conversationId}
              key={index}
              message={message}
              participants={participants}
              onOpenLightbox={() => lightbox.onOpen(CryptoJS.AES.decrypt(message.body, secretKey).toString(CryptoJS.enc.Utf8))}
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
