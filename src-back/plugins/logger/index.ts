import {
  createLogger,
  LogEvent,
  LoggerHook,
  // StringifyObjectsHook,
} from "vue-logger-plugin";
// import _axios from "@/plugins/axios";
import { IoLog } from "@/composables";

const ServerLogHook: LoggerHook = {
  async run(event: LogEvent) {
    if (event.level !== "debug" && event.argumentArray.length > 1) {
      if (event.level === "log") {
        console.error("Not Support Log Level : log");
        return;
      }
      const isUserLog =
        event.argumentArray[0] && typeof event.argumentArray[0] === "string";
      const formData = new FormData();
      formData.set("logName", "io-web");
      formData.set("category", "client-side");
      formData.set("txt", event.argumentArray.slice(1).join("&&"));
      formData.set("severity", event.level);
      if (isUserLog) {
        if (typeof event.argumentArray[1] !== "string") {
          console.error(
            "event.argumentArray[1]는 반드시 문자열이어야 합니다.",
            event.argumentArray
          );
        }
        const ctgr = "user-log";
        const ioLog = new IoLog({
          uid: event.argumentArray[0],
          category: ctgr,
          severity: event.level,
          txts: event.argumentArray.slice(1),
        });

        formData.set("categorySub", ctgr);
        await ioLog.save();
        // await _axios.post("/log/ioLogging", formData);
      } else {
        formData.set("categorySub", "server-log");
        // await _axios.post("/log/ioLogging", formData);
      }
    } else {
      console.log(`[${event.level}]`, event.argumentArray);
    }
  },
};

// create logger with options
const logger = createLogger({
  enabled: true,
  // consoleEnabled: process.env.NODE_ENV !== "production",
  prefixFormat: ({ level, caller }) =>
    caller
      ? `[${level.toUpperCase()}] [${caller?.fileName}:${
          caller?.functionName
        }:${caller?.lineNumber}]`
      : `[${level.toUpperCase()}]`,
  // beforeHooks: [StringifyObjectsHook],
  afterHooks: [ServerLogHook],
});

export { logger };
