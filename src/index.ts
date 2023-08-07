import LLMonitor from "./llmonitor"

export { LLMonitor }

const llmonitor = new LLMonitor()
const monitor = llmonitor.monitor.bind(llmonitor)

export default monitor
