import {
  createLogger,
  LogEvent,
  LoggerHook,
  StringifyObjectsHook,
} from "vue-logger-plugin";
import { IoLog } from "./model";
import _axios from "@/plugin/axios";

const ServerLogHook: LoggerHook = {
  async run(event: LogEvent) {
    if (event.level !== "debug" && event.argumentArray.length > 1) {
      if (event.level === "log") {
        console.error("not support log level : log");
        return;
      }
      if (import.meta.env.MODE !== "production") {
        if (event.level === "error") {
          console.error(event);
        } else if (event.level === "warn") {
          console.warn(event);
        } else {
          console.log(event);
        }
      }
      const isUserLog =
        event.argumentArray[0] && typeof event.argumentArray[0] === "string";
      const formData = new FormData();
      const txt = event.argumentArray.join("&&");

      formData.set("logName", "io-web-app");
      formData.set("category", "client-side");
      formData.set("txt", txt);
      formData.set("severity", event.level);
      if (isUserLog) {
        const txts = event.argumentArray
          .slice(1)
          .map((x) => (typeof x === "string" ? x : JSON.stringify(x)));
        const ctgr = "user-log";
        const ioLog = new IoLog({
          uid: event.argumentArray[0],
          category: ctgr,
          severity: event.level,
          txts,
        });

        formData.set("categorySub", ctgr);
        await ioLog.save();
        await _axios.post("/log/ioLogging", formData);
      } else {
        formData.set("categorySub", "server-log");
        await _axios.post("/log/ioLogging", formData);
      }
    } else {
      console.log(`[${event.level}]`, event.argumentArray);
    }
  },
};

// create logger with options
const logger = createLogger({
  enabled: true,
  // consoleEnabled: import.meta.env.MODE !== "production",
  prefixFormat: ({ level, caller }) =>
    caller
      ? `[${level.toUpperCase()}] [${caller?.fileName}:${
          caller?.functionName
        }:${caller?.lineNumber}]`
      : `[${level.toUpperCase()}]`,
  beforeHooks: [StringifyObjectsHook],
  afterHooks: [ServerLogHook],
});

export { logger };
export * from "./model";
