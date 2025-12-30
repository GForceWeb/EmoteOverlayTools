// Overlay logger - sends logs to the Express server for file-based persistence

type LogType = "info" | "warning" | "error";

/**
 * Send a log entry to the server for persistent storage.
 * This allows overlay logs to be viewed in the admin UI's log viewer.
 */
export function log(type: LogType, message: string): void {
  // Also log to console for development debugging
  const prefix = "[OVERLAY]";
  if (type === "error") {
    console.error(prefix, message);
  } else if (type === "warning") {
    console.warn(prefix, message);
  } else {
    console.log(prefix, message);
  }

  // Send to server (fire and forget - don't block on this)
  fetch(`${window.location.origin}/api/log`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type,
      message,
      source: "overlay",
    }),
  }).catch((error) => {
    // Silently fail - we don't want logging failures to cause issues
    console.error("Failed to send log to server:", error);
  });
}

/**
 * Log an info message
 */
export function logInfo(message: string): void {
  log("info", message);
}

/**
 * Log a warning message
 */
export function logWarning(message: string): void {
  log("warning", message);
}

/**
 * Log an error message
 */
export function logError(message: string): void {
  log("error", message);
}

export default {
  log,
  info: logInfo,
  warning: logWarning,
  error: logError,
};

