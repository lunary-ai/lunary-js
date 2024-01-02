import { useEffect, useRef, useState } from "react"
import monitor from "./browser"
import { Thread } from "./thread"

/*
 * Separate entrypoint so we can have React as a peer dependency
 */

function useChatMonitor() {
  const [thread, setThread] = useState<Thread>()

  const restart = () => {
    const newThread = monitor.openThread()
    setThread(newThread)
    return newThread
  }

  const resumeThread = (id: string) => {
    const newThread = monitor.openThread(id)
    setThread(newThread)
    return newThread
  }

  useEffect(() => {
    restart()
  }, [])

  return {
    restart, // Deprecated TODO: remove
    restartThread: restart,
    resumeThread,
    trackMessage: thread?.trackMessage,
    trackFeedback: monitor.trackFeedback,
    identify: monitor.identify,
  }
}

/*
 * Helpers to automaitcally track vercel AI sdk messages
 */

const useMonitorVercelAI = (props) => {
  const { messages, isLoading } = props

  const {
    trackFeedback,

    trackMessage,
    resumeThread,
    restartThread,
    identify,
    restart,
  } = useChatMonitor()

  const previousMessages = useRef(messages)

  useEffect(() => {
    if (previousMessages.current.length < messages.length) {
      const newMessage = messages[messages.length - 1]

      if (newMessage.role === "user") {
        // trackUserMessage(newMessage.content, undefined, newMessage.id)

        trackMessage({
          role: "user",
          id: newMessage.id,
          content: newMessage.content,
        })
      } else if (
        newMessage.role === "assistant" &&
        // Make sure it's not streaming
        !isLoading
      ) {
        const userMessage = messages[messages.length - 2]
        trackMessage({
          role: "assistant",
          id: userMessage.id,
          content: newMessage.content,
        })
      }
    }
  }, [isLoading, messages])

  return {
    ...props,
    trackFeedback,
    trackMessage,
    resumeThread,
    restartThread,
    identify,
  }
}

export default monitor

export { useChatMonitor, useMonitorVercelAI }
