import LLMonitor from "./llmonitor";
type PickMatching<T, V> = {
    [K in keyof T as T[K] extends V ? K : never]: T[K];
};
type ExtractMethods<T> = PickMatching<T, Function>;
type Monitor = LLMonitor["monitor"] & ExtractMethods<LLMonitor>;
declare const monitor: Monitor;
export default monitor;
