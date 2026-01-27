import winston from "winston";
// import config from "../../config";

interface LoggingInfo extends winston.Logform.TransformableInfo {
  level: string;
  message: string;
  timestamp?: string;
  [key: string]: any;
}

const enumerateErrorFormat = winston.format((info: any) => {
  if (info instanceof Error) {
    return {
      ...info,
      message: `${info.message}${info.stack ? `\n${info.stack}` : ''}`
    };
  }
  return info;
});

const logger = winston.createLogger({
  level: (process.env.NODE_ENV as string) === "development" ? "debug" : "info",
  format: winston.format.combine(
    enumerateErrorFormat(),
    (process.env.NODE_ENV as string) === "development"
      ? winston.format.colorize()
      : winston.format.uncolorize(),
    winston.format.splat(),
    winston.format.printf(
      (info: any) => `${info.level}: ${info.message}`
    )
  ),
  transports: [
    new winston.transports.Console({
      stderrLevels: ["error"],
    }),
  ],
});

export default logger;
