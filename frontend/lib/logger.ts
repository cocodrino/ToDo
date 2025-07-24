
const LogLevel = {
  none: 0,
  error: 1,
  warn: 2,
  log: 3,
  debug: 4,
} as const;

type LogLevelString = keyof typeof LogLevel;

const selectedLogLevel =
  (process.env.NEXT_PUBLIC_LOG_LEVEL as LogLevelString) || 
  (process.env.NODE_ENV === "development" ? "debug" : "error");

const currentLogLevel = LogLevel[selectedLogLevel] ?? LogLevel.debug;

const logger = {
  debug: (...args: unknown[]) => {
    if (currentLogLevel >= LogLevel.debug) {
      console.debug(...args);
    }
  },
  log: (...args: unknown[]) => {
    if (currentLogLevel >= LogLevel.log) {
      console.log(...args);
    }
  },
  warn: (...args: unknown[]) => {
    if (currentLogLevel >= LogLevel.warn) {
      console.warn(...args);
    }
  },
  error: (...args: unknown[]) => {
    if (currentLogLevel >= LogLevel.error) {
      console.error(...args);
    }
  },
};

export default logger;
