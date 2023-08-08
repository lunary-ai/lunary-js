import LLMonitor from "./llmonitor"

// Export the class to give ability to create multiple instances for advanced use cases
export { LLMonitor }

// Create a default shared instance to use in the app
const monitor = new LLMonitor()
export default monitor
