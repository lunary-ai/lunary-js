import { useEffect, useState } from "react"
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

export default llmonitor

export { useChatMonitor }
