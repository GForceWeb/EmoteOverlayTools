// Admin interface script

// Type declaration for the Electron API exposed through preload
declare global {
  interface Window {
    electronAPI: {
      testAnimation: (
        animationType: string,
        params: any
      ) => Promise<{ success: boolean }>;
      getOBSUrl: () => Promise<string>;
      changeServerPort: (
        port: number
      ) => Promise<{ success: boolean; port: number }>;
      onWebSocketMessage: (callback: (data: any) => void) => () => void;
    };
  }
}

// DOM Elements
const tabs = document.querySelectorAll(".tab");
const tabContents = document.querySelectorAll(".tab-content");
const statusIndicator = document.getElementById(
  "status-indicator"
) as HTMLElement;
const statusText = document.getElementById("status-text") as HTMLElement;
const obsUrlElement = document.getElementById("obs-url") as HTMLElement;
const copyUrlButton = document.getElementById(
  "copy-url-button"
) as HTMLButtonElement;
const serverPortInput = document.getElementById(
  "server-port"
) as HTMLInputElement;
const allFeaturesSelect = document.getElementById(
  "all-features"
) as HTMLSelectElement;
const featuresContainer = document.getElementById(
  "features-container"
) as HTMLElement;
const featuresSelect = document.getElementById("features") as HTMLSelectElement;
const maxEmotesInput = document.getElementById(
  "max-emotes"
) as HTMLInputElement;
const subOnlySelect = document.getElementById("sub-only") as HTMLSelectElement;
const saveSettingsButton = document.getElementById(
  "save-settings"
) as HTMLButtonElement;
const animationTypeSelect = document.getElementById(
  "animation-type"
) as HTMLSelectElement;
const emoteCountInput = document.getElementById(
  "emote-count"
) as HTMLInputElement;
const usernameInput = document.getElementById("username") as HTMLInputElement;
const runAnimationButton = document.getElementById(
  "run-animation"
) as HTMLButtonElement;
const previewFrame = document.getElementById(
  "preview-frame"
) as HTMLIFrameElement;
const logOutput = document.getElementById("log-output") as HTMLTextAreaElement;
const clearLogsButton = document.getElementById(
  "clear-logs"
) as HTMLButtonElement;

// Tab navigation
tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    // Remove active class from all tabs and contents
    tabs.forEach((t) => t.classList.remove("active"));
    tabContents.forEach((c) => c.classList.remove("active"));

    // Add active class to clicked tab
    tab.classList.add("active");

    // Get the tab id and activate corresponding content
    const tabId = tab.getAttribute("data-tab");
    document.getElementById(`${tabId}-tab`)?.classList.add("active");
  });
});

// Handle all-features toggle
allFeaturesSelect.addEventListener("change", () => {
  if (allFeaturesSelect.value === "True") {
    featuresContainer.style.display = "none";
  } else {
    featuresContainer.style.display = "block";
  }
});

// Initialize the preview frame
async function initializePreview() {
  try {
    const obsUrl = await window.electronAPI.getOBSUrl();
    // Add parameters to enable all animations and debug mode by default
    previewFrame.src = `${obsUrl}?all=true&debug=true&maxemotes=50`;
    obsUrlElement.textContent = `OBS Browser Source URL: ${obsUrl}`;

    // Update the status to connected
    statusIndicator.classList.remove("bg-red-500");
    statusIndicator.classList.add("bg-green-500");
    statusText.textContent = "Connected";

    // Add event listener for iframe load
    previewFrame.addEventListener("load", () => {
      logMessage("Preview frame loaded successfully");
    });

    // Log the initialization
    logMessage("System initialized. Server running at " + obsUrl);
  } catch (error) {
    logMessage("Error initializing: " + error.message);
    statusText.textContent = "Error";
  }
}

// Function to run an animation test
async function runAnimation() {
  console.log("runAnimation function called");
  logMessage("runAnimation function called");

  const animationType = animationTypeSelect?.value;
  const emoteCount = parseInt(emoteCountInput?.value || "0");
  const username = usernameInput?.value;

  if (!animationType) {
    logMessage("Error: No animation type selected");
    return;
  }

  try {
    // Create params based on animation type
    const params: any = {
      count: emoteCount,
    };

    // Add username if provided
    if (username) {
      params.username = username;
    }

    // Log the test
    logMessage(
      `Testing animation: ${animationType} with ${emoteCount} emotes${
        username ? " for user " + username : ""
      }`
    );

    console.log("Calling testAnimation with:", { animationType, params });
    // Send to electron main process
    const result = await window.electronAPI.testAnimation(
      animationType,
      params
    );

    if (result.success) {
      logMessage(`Animation test sent successfully`);
    } else {
      logMessage(`Failed to send animation test`);
    }
  } catch (error) {
    console.error("Error in runAnimation:", error);
    logMessage(`Error running animation: ${error.message}`);
  }
}

// Function to save settings
async function saveSettings() {
  try {
    const port = parseInt(serverPortInput.value);

    // Update server port if changed
    const currentPort = await window.electronAPI.getOBSUrl().then((url) => {
      const match = url.match(/:(\d+)/);
      return match ? parseInt(match[1]) : 3030;
    });

    if (port !== currentPort) {
      const result = await window.electronAPI.changeServerPort(port);
      if (result.success) {
        logMessage(`Server port changed to ${result.port}`);
        obsUrlElement.textContent = `OBS Browser Source URL: http://localhost:${result.port}`;
      } else {
        logMessage(`Failed to change server port: ${result.error}`);
      }
    }

    // Build URL parameters for the animation settings
    const params = new URLSearchParams();

    if (allFeaturesSelect.value === "True") {
      params.set("all", "true");
    } else {
      // Add selected features
      Array.from(featuresSelect.selectedOptions).forEach((option) => {
        params.set(option.value, "true");
      });
    }

    params.set("maxemotes", maxEmotesInput.value);
    params.set("subonly", subOnlySelect.value === "True" ? "true" : "false");

    // Reload the preview frame with the new settings
    const obsUrl = await window.electronAPI.getOBSUrl();
    previewFrame.src = `${obsUrl}?${params.toString()}`;

    logMessage("Settings saved and applied");
  } catch (error) {
    logMessage(`Error saving settings: ${error.message}`);
  }
}

// Function to copy OBS URL to clipboard
function copyUrlToClipboard() {
  const text = obsUrlElement.textContent?.replace(
    "OBS Browser Source URL: ",
    ""
  );
  if (text) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        logMessage("URL copied to clipboard");
      })
      .catch((err) => {
        logMessage(`Error copying URL: ${err}`);
      });
  }
}

// Log message function
function logMessage(message: string) {
  const timestamp = new Date().toLocaleTimeString();
  const logEntry = `[${timestamp}] ${message}`;
  logOutput.value = logOutput.value + logEntry + "\n";
  logOutput.scrollTop = logOutput.scrollHeight;
}

// Set up WebSocket message listener
function setupWebSocketListeners() {
  const unsubscribe = window.electronAPI.onWebSocketMessage((data) => {
    logMessage(`WebSocket message received: ${JSON.stringify(data)}`);
  });

  // Store unsubscribe function for cleanup
  window.addEventListener("beforeunload", unsubscribe);
}

// Event listeners
runAnimationButton?.addEventListener("click", (e) => {
  console.log("Run animation button clicked");
  logMessage("Run animation button clicked");
  runAnimation();
});
saveSettingsButton.addEventListener("click", saveSettings);
copyUrlButton.addEventListener("click", copyUrlToClipboard);
clearLogsButton.addEventListener("click", () => {
  logOutput.value = "";
});

// Initialize the app
document.addEventListener("DOMContentLoaded", () => {
  initializePreview();
  setupWebSocketListeners();

  // Check if all features is enabled
  if (allFeaturesSelect.value === "True") {
    featuresContainer.style.display = "none";
  }

  logMessage("Admin interface loaded");
});
