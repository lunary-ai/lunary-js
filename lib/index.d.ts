import LLMonitor from "./llmonitor";
export declare const llmonitor: LLMonitor;
declare const monitor: (entities: import("./types").EntityToMonitor | [import("./types").EntityToMonitor], { tags }?: {
    tags?: string[];
}) => void;
export default monitor;
