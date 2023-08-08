import LLMonitor from "./llmonitor"

export const llmonitor = new LLMonitor()
const monitor = llmonitor.monitor.bind(llmonitor)

export default monitor
