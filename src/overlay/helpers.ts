// Randomizer
function Randomizer(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function TopOrBottom(): number {
  var topOrBottom = Math.random();
  if (topOrBottom < 0.5) {
    return -200;
  } else {
    return innerHeight + 200;
  }
}

// Check if string ends with number
function countvalues(str: string): RegExpMatchArray | null {
  return str.match(/\s[0-9]+/g);
}

let lastExecutionTime = 0;

function executeWithInterval(
  func: Function,
  interval: number
): (...args: any[]) => void {
  return function (...args: any[]) {
    const currentTime = Date.now();

    if (currentTime - lastExecutionTime >= interval) {
      // Sufficient time has passed, execute the function
      func(...args);
      lastExecutionTime = currentTime;
    } else {
      // Not enough time has passed, wait for the remaining time
      setTimeout(() => {
        func(...args);
        lastExecutionTime = Date.now();
      }, interval - (currentTime - lastExecutionTime));
    }
  };
}

async function getTwitchAvatar(
  user: string,
  id: boolean = false
): Promise<string> {
  // Try the local cached API first (served by Electron)
  try {
    const localUrl = `/api/twitch-avatar/${encodeURIComponent(user)}${id ? "?id=true" : ""}`;
    const response = await fetch(localUrl);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`Avatar for ${user}:`, data.avatar, data.cached ? "(cached)" : "(fresh)");
      return data.avatar;
    }
  } catch (error) {
    console.warn("Local avatar API unavailable, falling back to decapi.me:", error);
  }
  
  // Fallback to direct decapi.me call (when running without Electron)
  const decapiUrl = `https://decapi.me/twitch/avatar/${encodeURIComponent(user)}${id ? "?id=true" : ""}`;
  const avatar = await makeRequest(decapiUrl);
  console.log(`Avatar for ${user} (direct):`, avatar);
  return avatar;
}

function makeRequest(url: string): Promise<string> {
  return new Promise(function (resolve, reject) {
    var xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function () {
      if (xhttp.readyState === 4) {
        if (xhttp.status === 200) {
          resolve(xhttp.responseText); // Resolve the Promise with the response
        } else {
          reject("Error: " + xhttp.status); // Reject the Promise with an error message
        }
      }
    };

    xhttp.open("GET", url, true);
    xhttp.send();
  });
}

// Get number at end of string
function getCommandValue(
  str: string,
  type: "count" | "interval"
): number | null {
  let values = countvalues(str);

  if (values === null) {
    return null;
  }

  if (type == "count") {
    if (values.length == 2) {
      return parseInt(values[0].trim());
    } else if (values.length == 1) {
      return parseInt(values[0].trim());
    } else {
      return null;
    }
  }

  if (type == "interval") {
    if (values.length == 2) {
      return parseInt(values[1].trim());
    } else {
      return null;
    }
  }

  return null;
}

function delay(time: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, time));
}

function randomSign(): number {
  return Math.random() < 0.5 ? -1 : 1;
}

function removeelement(div: string): void {
  const element = document.getElementById(div);
  if (element) {
    element.remove();
  }
}

export default {
  delay,
  randomSign,
  removeelement,
  getCommandValue,
  Randomizer,
  TopOrBottom,
  getTwitchAvatar,
  executeWithInterval,
};
