/*
 * This is the entry point for the browser
 */

import { debounce, formatLog } from "./utils"

import {
  Event,
  EventName,
  EventType,
  LLMonitorOptions,
  LogEvent,
  RunEvent,
  cJSON,
} from "./types"

/*
 * Flow:
 * - const convo = monitor.startConvo()
 * - const message = convo.userMessage(string)
 * - message.botAnswer(string)
 * - message.feedback(string)
 */

export class Conversation {
  private monitor: LLMonitor
  convoId: string

  constructor(monitor: LLMonitor) {
    this.monitor = monitor
    this.convoId = crypto.randomUUID()
    this.monitor.trackEvent("convo", "start", { runId: this.convoId })
  }

  async userMessage(text: string, props: cJSON) {
    const runId = crypto.randomUUID()

    this.monitor.trackEvent("chat", "start", {
      runId,
      input: text,
      parentRunId: this.convoId,
      extra: props,
      text,
    })

    return runId
  }

  async botMessage(replyToId: string, text: string, props: cJSON) {
    this.monitor.trackEvent("chat", "end", {
      runId: replyToId,
      output: text,
      extra: props,
      text,
    })

    // report end of convo ID to update the end timestamp, can be sent multiple times
    this.monitor.trackEvent("convo", "end", {
      runId: this.convoId,
    })
  }

  async trackFeedback(messageId: string, feedback: cJSON) {
    this.monitor.trackEvent("chat", "feedback", {
      runId: messageId,
      extra: feedback,
    })
  }
}

class LLMonitor {
  appId?: string
  verbose?: boolean
  apiUrl?: string
  userId?: string
  userProps?: cJSON

  private queue: any[] = []
  private queueRunning: boolean = false

  /**ti
   * @param {LLMonitorOptions} options
   */
  constructor(params: LLMonitorOptions = {}) {
    this.init({
      apiUrl: "https://app.llmonitor.com",
      ...params,
    })
  }

  init({ appId, verbose, apiUrl }: LLMonitorOptions = {}) {
    if (appId) this.appId = appId
    if (verbose) this.verbose = verbose
    if (apiUrl) this.apiUrl = apiUrl
  }

  identify({ userId, userProps }: { userId: string; userProps: cJSON }) {
    this.userId = userId
    this.userProps = userProps
  }

  async trackEvent(
    type: EventType,
    event: EventName,
    data: Partial<RunEvent | LogEvent>
  ) {
    if (!this.appId)
      return console.warn(
        "LLMonitor: App ID not set. Not reporting anything. Get one on the dashboard: https://app.llmonitor.com"
      )

    // Add 1ms to timestamp if it's the same/lower than the last event
    // Keep the order of events in case they are sent in the same millisecond
    let timestamp = Date.now()
    const lastEvent = this.queue?.[this.queue.length - 1]
    if (lastEvent?.timestamp >= timestamp) {
      timestamp = lastEvent.timestamp + 1
    }

    const runtime = data.runtime ?? "llmonitor-browser"

    const eventData: Event = {
      event,
      type,
      userId: this.userId,
      userProps: this.userProps,
      app: this.appId,
      timestamp,
      runtime,
      ...data,
    }

    if (this.verbose) {
      console.log(formatLog(eventData))
    }

    this.queue.push(eventData)

    this.debouncedProcessQueue()
  }

  // Wait 500ms to allow other events to be added to the queue
  private debouncedProcessQueue = debounce(() => this.processQueue())

  private async processQueue() {
    if (!this.queue.length || this.queueRunning) return

    this.queueRunning = true

    try {
      const copy = this.queue.slice()

      await fetch(`${this.apiUrl}/api/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ events: copy }),
      })

      // Clear the events we just sent (don't clear it all in case new events were added while sending)
      this.queue = this.queue.slice(copy.length)

      this.queueRunning = false

      // If there are new events in the queue
      if (this.queue.length) this.processQueue()
    } catch (error) {
      this.queueRunning = false
      console.error("Error sending event(s) to LLMonitor", error)
    }
  }

  startChat() {
    return new Conversation(this)
  }
}

export default LLMonitor

// Example usage:

// import { useChatMonitor }, monitor from '';

// function ChatApp() {
//     const [chatLog, setChatLog] = useState([]);
//     const [inputValue, setInputValue] = useState('');

//     const {
//         startConvo,
//         userMessage,
//         botMessage,
//         trackFeedback
//     } = useChatMonitor();

//     useEffect(() => {
//       startConvo();
//       monitor.identify({ userId: '123' })
//     }, []);

//     // Handler for when a user sends a message.
//     const handleUserMessage = () => {
//         const messageId = userMessage(inputValue);
//         setChatLog([...chatLog, { type: 'user', text: inputValue, id: messageId }]);
//         setInputValue('');

//         // Assume this fetches a bot's reply, just for demonstration.
//         fetch(inputValue).then(reply => {
//             botMessage(messageId, reply);
//             setChatLog([...chatLog, { type: 'bot', text: reply, id: messageId }]);
//         });
//     };

//     return (
//         <div>
//             <div className="chatLog">
//                 {chatLog.map((msg, index) => (
//                     <div key={index} className={msg.type}>
//                         {msg.text}
//                         {msg.type === 'bot' && <Button onClick={() => trackFeedback(msg.id, { thumbs: 'up })} />}
//                     </div>
//                 ))}
//             </div>
//             <div className="chatInput">
//                 <input value={inputValue} onChange={e => setInputValue(e.target.value)} />
//                 <button onClick={handleUserMessage}>Send</button>
//             </div>
//         </div>
//     );
// }
