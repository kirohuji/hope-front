

import PropTypes from 'prop-types';
import { useCallback, useEffect, useRef, useState } from "react";
import emitter from "src/utils/eventEmitter";
import { useRTVIClient, useRTVIClientEvent } from "@pipecat-ai/client-react";
import { getScrollableParent } from 'src/utils/dom';
import {
  RTVIEvent,
} from "@pipecat-ai/client-js";
import { normalizeMessageText, addNewLinesBeforeCodeblocks } from 'src/utils/messages';
import { v4 as uuidv4 } from "uuid";
import ChatMessageItem from './chat-message-item'

export default function ChatListMessageList({ autoscroll, user, onOpenLightbox, participants, isBotSpeaking, messages, interactionMode = "informational", conversationId }) {
  
  const [liveMessages, setLiveMessages] = useState([]);

  const client = useRTVIClient();

  useEffect(() => {
    if (!client) return;
    client.params = {
      ...client.params,
      requestData: {
        conversation_id: conversationId,
      },
    };
  }, [client, conversationId]);

  const firstBotResponseTime = useRef();
  const userStartedSpeakingTime = useRef();
  const userStoppedSpeakingTimeout = useRef();

  const revalidateAndRefresh = useCallback(async () => {
    console.log('nih')
  }, []);

  const addMessageChunk = useCallback(
    ({
      createdAt = new Date(),
      final,
      replace = false,
      role,
      text,
      updatedAt = createdAt,
    }) => {
      const createdAtIso = createdAt.toISOString();
      const updatedAtIso = updatedAt.toISOString();

      setLiveMessages((currentLiveMessages) => {
        const matchingMessageIdx = currentLiveMessages.findIndex(
          (m) => m.content.role === role && m.created_at === createdAtIso,
        );
        const matchingMessage = currentLiveMessages[matchingMessageIdx];
        const isSameMessage =
          matchingMessage?.final === final &&
          normalizeMessageText(matchingMessage) ===
          addNewLinesBeforeCodeblocks(text);

        if (isSameMessage) return currentLiveMessages;
        if (!matchingMessage || matchingMessage?.final) {
          // Append new message
          const message = {
            content: {
              content: text,
              role,
            },
            conversation_id: conversationId,
            created_at: createdAtIso,
            extra_metadata: {},
            final,
            message_id: uuidv4(),
            // message_number: messages.length + currentLiveMessages.length + 1,
            updated_at: updatedAtIso,
          };
          return [...currentLiveMessages, message];
        }
        const updatedMessages = [...currentLiveMessages];
        const prevText = normalizeMessageText(
          updatedMessages[matchingMessageIdx],
        );
        const updatedMessage = {
          ...updatedMessages[matchingMessageIdx],
          content: {
            content: addNewLinesBeforeCodeblocks(
              replace ? text : prevText + text,
            ),
            role,
          },
          final,
          updated_at: updatedAtIso,
        };

        return currentLiveMessages
          .map((liveMessage, idx) =>
            idx === matchingMessageIdx ? updatedMessage : liveMessage,
          )
          .filter((m, idx, arr) => {
            const normalizedText = normalizeMessageText(m);
            const isEmptyMessage =
              normalizedText.trim() === "" && idx < arr.length - 1;
            return !isEmptyMessage;
          });
      })
    }, [conversationId])

  const cleanupUserMessages = useCallback(() => {
    setLiveMessages((currentLiveMessages) => currentLiveMessages.filter((m) => {
      if (m.content.role !== "user") return true;
      const normalizedText = normalizeMessageText(m);
      return normalizedText.length > 0;
    }));
  }, []);

  const isTextResponse = useRef(false);

  useRTVIClientEvent(
    RTVIEvent.BotLlmStarted,
    useCallback(() => {
      firstBotResponseTime.current = new Date();
      addMessageChunk({
        createdAt: firstBotResponseTime.current,
        final: false,
        role: "assistant",
        text: "",
      });
    }, [addMessageChunk]),
  );

  useRTVIClientEvent(
    RTVIEvent.BotLlmText,
    useCallback(
      (text) => {
        if (interactionMode !== "informational" && !isTextResponse.current)
          return;
        if (firstBotResponseTime.current) {
          addMessageChunk({
            createdAt: firstBotResponseTime.current,
            final: false,
            role: "assistant",
            text: text.text,
            updatedAt: new Date(),
          });
        }
      },
      [addMessageChunk, interactionMode],
    ),
  );

  useRTVIClientEvent(
    RTVIEvent.BotLlmStopped,
    useCallback(async () => {
      const textResponse = isTextResponse.current;
      isTextResponse.current = false;

      if (interactionMode !== "informational" && !textResponse) return;

      if (firstBotResponseTime.current) {
        addMessageChunk({
          createdAt: firstBotResponseTime.current,
          final: true,
          role: "assistant",
          text: "",
          updatedAt: new Date(),
        });
        firstBotResponseTime.current = undefined;
        // TODO: Move to StorageItemStored handler, once that is emitted in text-mode
        setTimeout(revalidateAndRefresh, 2000);
      }
    }, [addMessageChunk, interactionMode, revalidateAndRefresh]),
  );

  useRTVIClientEvent(
    RTVIEvent.BotStartedSpeaking,
    useCallback(() => {
      if (interactionMode !== "conversational") return;
      if (!firstBotResponseTime.current) {
        firstBotResponseTime.current = new Date();
      }
      addMessageChunk({
        createdAt: firstBotResponseTime.current,
        final: false,
        role: "assistant",
        text: "",
        updatedAt: new Date(),
      });
    }, [addMessageChunk, interactionMode]),
  );

  useRTVIClientEvent(
    RTVIEvent.BotTtsText,
    useCallback(
      (text) => {
        if (interactionMode !== "conversational") return;
        if (firstBotResponseTime.current) {
          addMessageChunk({
            createdAt: firstBotResponseTime.current,
            final: false,
            role: "assistant",
            text: ` ${text.text}`,
            updatedAt: new Date(),
          });
        }
      },
      [addMessageChunk, interactionMode],
    ),
  );

  useRTVIClientEvent(
    RTVIEvent.BotStoppedSpeaking,
    useCallback(() => {
      if (interactionMode !== "conversational") return;
      const createdAt = firstBotResponseTime.current;
      firstBotResponseTime.current = undefined;
      addMessageChunk({
        createdAt,
        final: true,
        role: "assistant",
        text: "",
        updatedAt: new Date(),
      });
    }, [addMessageChunk, interactionMode]),
  );

  useRTVIClientEvent(
    RTVIEvent.UserStartedSpeaking,
    useCallback(() => {
      clearTimeout(userStoppedSpeakingTimeout.current);
      const now = userStartedSpeakingTime.current ?? new Date();
      userStartedSpeakingTime.current = now;
      addMessageChunk({
        createdAt: now,
        final: false,
        role: "user",
        text: "",
      });
    }, [addMessageChunk]),
  );

  useRTVIClientEvent(
    RTVIEvent.UserStoppedSpeaking,
    useCallback(() => {
      userStoppedSpeakingTimeout.current = setTimeout(
        cleanupUserMessages,
        5000,
      );
    }, [cleanupUserMessages]),
  );

  useRTVIClientEvent(
    RTVIEvent.UserTranscript,
    useCallback(
      (data) => {
        if (!userStartedSpeakingTime.current) {
          userStartedSpeakingTime.current = new Date();
        }
        addMessageChunk({
          createdAt: userStartedSpeakingTime.current,
          final: data.final,
          replace: true,
          role: "user",
          text: data.text,
          updatedAt: new Date(),
        });
        if (data.final) {
          userStartedSpeakingTime.current = undefined;
        }
      },
      [addMessageChunk],
    ),
  );

  useRTVIClientEvent(RTVIEvent.Disconnected, revalidateAndRefresh);

  useRTVIClientEvent(
    RTVIEvent.StorageItemStored,
    useCallback(
      (data) => {
        const { items } = data;
        if (items.some((i) => i.role === "assistant")) {
          revalidateAndRefresh();
        }
      },
      [revalidateAndRefresh],
    ),
  );

  const handleUserTextMessage = useCallback(
    (content) => {
    console.log("收到了", content);
    isTextResponse.current = true;
    const now = new Date();
    setLiveMessages((currentLiveMessages) => [
        ...currentLiveMessages,
        {
          content: {
            role: "user",
            content,
          },
          conversation_id: conversationId,
          created_at: now.toISOString(),
          extra_metadata: {},
          final: true,
          message_id: uuidv4(),
          updated_at: now.toISOString(),
        },
      ]);
  }, [conversationId]);

  useEffect(() => {
    emitter.on("userTextMessage", handleUserTextMessage);
    // Server-stored messages updated. Remove final messages.
    setLiveMessages((lm) => lm.filter((m) => !m.final));
    return () => {
      emitter.off("userTextMessage", handleUserTextMessage);
    };
  }, [handleUserTextMessage]);

  useEffect(() => {
    // if (!autoscroll) return;
    const scroller = getScrollableParent(document.querySelector(".chat-openai-message-list"));
    if (!scroller) return;
    const isScrollLocked = document.body.hasAttribute("data-scroll-locked");
    if (!liveMessages.length) return;
    scroller.scrollTo({
      behavior: isScrollLocked ? "instant" : "smooth",
      top: scroller.scrollHeight,
    });
  }, [liveMessages]);

  return liveMessages.map((m, i) => (
    <ChatMessageItem
      key={i}
      message={{
        ...m,
        createdAt: m.created_at,
        senderId: m.content.role === 'user' ? user._id : 'a5u9kNTzKAdghpr55',
        contentType: m.content?.content?.type === 'image_url' || 'text',
        body: m.content?.content?.type ? (m.content.text || m.content.image_url) : m.content.content,
        isLoading: i === liveMessages.length - 1 &&
          m.content.role === "assistant" &&
          isBotSpeaking
      }}
      conversationId={conversationId}
      participants={participants}
      onOpenLightbox={() => onOpenLightbox(m)}
    />
  ));
}

ChatListMessageList.propTypes = {
  user: PropTypes.object,
  conversationId: PropTypes.string,
  autoscroll: PropTypes.bool,
  messages: PropTypes.array,
  isBotSpeaking: PropTypes.bool,
  interactionMode: PropTypes.string,
  participants: PropTypes.array,
  onOpenLightbox: PropTypes.func
};
