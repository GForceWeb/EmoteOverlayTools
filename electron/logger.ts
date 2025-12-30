import { app } from "electron";
import * as path from "path";
import fs from "fs";

export type LogType = "info" | "warning" | "error";
export type LogSource = "main" | "overlay" | "admin";

export interface LogEntry {
  timestamp: string;
  type: LogType;
  source: LogSource;
  message: string;
}

// Logs directory path - initialized lazily since app may not be ready at import time
let logsDir: string | null = null;

function getLogsDir(): string {
  if (!logsDir) {
    logsDir = path.join(app.getPath("userData"), "logs");
    // Ensure logs directory exists
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
  }
  return logsDir;
}

// Get today's date in YYYY-MM-DD format
function getTodayDateString(): string {
  const now = new Date();
  return now.toISOString().split("T")[0];
}

// Get the log file path for a specific date
function getLogFilePath(dateString: string): string {
  return path.join(getLogsDir(), `${dateString}.jsonl`);
}

// Write a log entry to today's log file
export function writeLog(type: LogType, message: string, source: LogSource): void {
  try {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      type,
      source,
      message,
    };

    const logFilePath = getLogFilePath(getTodayDateString());
    const line = JSON.stringify(entry) + "\n";

    // Append to log file (creates file if it doesn't exist)
    fs.appendFileSync(logFilePath, line, "utf8");

    // Also log to console for development debugging
    const prefix = `[${source.toUpperCase()}]`;
    if (type === "error") {
      console.error(prefix, message);
    } else if (type === "warning") {
      console.warn(prefix, message);
    } else {
      console.log(prefix, message);
    }
  } catch (error) {
    // Fallback to console if file write fails
    console.error("Failed to write log:", error);
    console.log(`[${source}] ${type}: ${message}`);
  }
}

// Read logs for a specific date
export function getLogs(dateString: string): LogEntry[] {
  try {
    const logFilePath = getLogFilePath(dateString);

    if (!fs.existsSync(logFilePath)) {
      return [];
    }

    const content = fs.readFileSync(logFilePath, "utf8");
    const lines = content.trim().split("\n").filter(Boolean);

    return lines.map((line) => {
      try {
        return JSON.parse(line) as LogEntry;
      } catch {
        // Handle malformed lines gracefully
        return {
          timestamp: new Date().toISOString(),
          type: "error" as LogType,
          source: "main" as LogSource,
          message: `[Malformed log entry]: ${line}`,
        };
      }
    });
  } catch (error) {
    console.error("Failed to read logs:", error);
    return [];
  }
}

// Get list of available log dates (past 7 days that have log files)
export function getAvailableDates(): string[] {
  try {
    const logsDirectory = getLogsDir();

    if (!fs.existsSync(logsDirectory)) {
      return [];
    }

    const files = fs.readdirSync(logsDirectory);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dates = files
      .filter((file) => file.endsWith(".jsonl"))
      .map((file) => file.replace(".jsonl", ""))
      .filter((dateStr) => {
        // Only include dates from the past 7 days
        const date = new Date(dateStr);
        return !isNaN(date.getTime()) && date >= sevenDaysAgo;
      })
      .sort((a, b) => b.localeCompare(a)); // Sort descending (newest first)

    return dates;
  } catch (error) {
    console.error("Failed to get available log dates:", error);
    return [];
  }
}

// Clean up log files older than 7 days
export function cleanOldLogs(): void {
  try {
    const logsDirectory = getLogsDir();

    if (!fs.existsSync(logsDirectory)) {
      return;
    }

    const files = fs.readdirSync(logsDirectory);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    let deletedCount = 0;

    for (const file of files) {
      if (!file.endsWith(".jsonl")) continue;

      const dateStr = file.replace(".jsonl", "");
      const date = new Date(dateStr);

      if (!isNaN(date.getTime()) && date < sevenDaysAgo) {
        const filePath = path.join(logsDirectory, file);
        fs.unlinkSync(filePath);
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      writeLog("info", `Cleaned up ${deletedCount} old log file(s)`, "main");
    }
  } catch (error) {
    console.error("Failed to clean old logs:", error);
  }
}

// Helper function for main process logging
export function log(type: LogType, message: string): void {
  writeLog(type, message, "main");
}

