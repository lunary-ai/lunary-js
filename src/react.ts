import { useEffect, useRef, useState } from "react"
import llmonitor, { Conversation } from "./browser"

/*
 * Separate entrypoint so we can have React as a peer dependency
 */

function useChatMonitor() {
  const [chat, setChat] = useState<Conversation>()

  const restart = () => {
    const newChat = llmonitor.startChat()
    setChat(newChat)
    return newChat
  }

  useEffect(() => {
    restart()
  }, [])

  return {
    restart,
    trackUserMessage: chat?.trackUserMessage,
    trackBotMessage: chat?.trackBotMessage,
    trackFeedback: llmonitor.trackFeedback,
  }
}

/*
 * Helpers to automaitcally track vercel AI sdk messages
 */

const useMonitorVercelAI = (props) => {
  const { messages, isLoading } = props

  const { restart, trackFeedback, trackUserMessage, trackBotMessage } =
    useChatMonitor()

  const previousMessages = useRef(messages)

  useEffect(() => {
    if (previousMessages.current.length < messages.length) {
      const newMessage = messages[messages.length - 1]

      if (newMessage.role === "user") {
        trackUserMessage(newMessage.content, undefined, newMessage.id)
      } else if (
        newMessage.role === "assistant" &&
        // Make sure it's not streaming
        !isLoading
      ) {
        const userMessage = messages[messages.length - 2]
        trackBotMessage(userMessage.id, newMessage.content)
      }
    }
  }, [isLoading, messages])

  return {
    ...props,
    trackFeedback,
  }
}

export default llmonitor

export { useChatMonitor, useMonitorVercelAI }
