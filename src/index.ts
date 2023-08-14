import LLMonitor from "./llmonitor"

const llmonitor = new LLMonitor()

type PickMatching<T, V> = { [K in keyof T as T[K] extends V ? K : never]: T[K] }
type ExtractMethods<T> = PickMatching<T, Function>

type Monitor = LLMonitor["monitor"] & ExtractMethods<LLMonitor>

const monitor: Monitor = (...args) =>
  llmonitor.monitor.bind(llmonitor).apply(llmonitor, [...args])

// It's safer to attach the methods manually because we get typesafety
monitor.load = llmonitor.load.bind(llmonitor)
monitor.monitor = llmonitor.monitor.bind(llmonitor)
monitor.wrapAgent = llmonitor.wrapAgent.bind(llmonitor)
monitor.wrapTool = llmonitor.wrapTool.bind(llmonitor)
monitor.wrapModel = llmonitor.wrapModel.bind(llmonitor)
monitor.info = llmonitor.info.bind(llmonitor)
monitor.log = llmonitor.log.bind(llmonitor)
monitor.warn = llmonitor.warn.bind(llmonitor)
monitor.error = llmonitor.error.bind(llmonitor)

export default monitor
