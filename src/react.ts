import { useState } from "react"
import LLMonitor, { Conversation } from "./browser"

function useChatMonitor(monitor: LLMonitor) {
  const [chat, setChat] = useState<Conversation>(monitor.startChat())

  const start = () => {
    const newChat = monitor.startChat()
    setChat(newChat)
    return newChat
  }

  return {
    start,
    userMessage: chat.userMessage,
    botMessage: chat.botMessage,
    trackFeedback: chat.trackFeedback,
  }
}

export { useChatMonitor }
