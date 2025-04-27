import  { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'src/redux/store';
import _ from 'lodash'
import {
  pushMessage,
} from 'src/redux/slices/chat';

export const useMessageQueue = () => {
  const dispatch = useDispatch();
  const [messageQueue, setMessageQueue] = useState([]);
  const processing = useRef(false); // 用于追踪是否正在处理消息

  // 队列处理函数
  const processQueue = async () => {
    if (processing.current || messageQueue.length === 0) return; // 阻止重复处理

    processing.current = true; // 标记为正在处理

    const message = messageQueue[0]; // 取出队列中的第一条消息

    await dispatch(pushMessage(message)); // Dispatch 消息处理

    setMessageQueue((prevQueue) => prevQueue.slice(1)); // 处理完后移除该消息
    processing.current = false; // 处理完成
  };

  // 每当 messageQueue 变化时，尝试处理队列中的消息
  useEffect(() => {
    if (messageQueue.length > 0) {
      processQueue();
    }
  }, [messageQueue]); // 当 messageQueue 变化时触发

  // 添加消息到队列
  const addMessageToQueue = (message) => {
    setMessageQueue((prevQueue) => _.orderBy([...prevQueue, message],['createdAt'], ['asc']));
  };

  return { addMessageToQueue };
};

export default useMessageQueue;
