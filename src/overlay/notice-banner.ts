import pkg from '../../package.json';
const appVersion = pkg.version as string;

// Check if user is NOT using the desktop app
export function notAppUser(): boolean {
  const urlParams = new URLSearchParams(window.location.search);
  const hasUrlParams = urlParams.toString().length > 0;
  const isGitHubPages = window.location.hostname === 'gforceweb.github.io';
  const isLocalhost = window.location.hostname === 'localhost';
  
  // App users: localhost with no URL parameters
  // Non-app users: GitHub Pages OR any URL parameters
  return isGitHubPages || hasUrlParams || !isLocalhost;
}

export function showNoticeBanner(): void {
  if (!notAppUser()) return;

  // Create banner element
  const banner = document.createElement('div');
  banner.id = 'github-notice-banner';
  banner.innerHTML = `
    <div class="banner-content">
      <div class="banner-icon">🎉</div>
      <div class="banner-text">
        <strong>Emote Overlay Tools v${appVersion}</strong>
        <span class="banner-subtitle">Visit https://github.com/gforceweb/EmoteOverlayTools for updates and downloads.</span>
      </div>
      <div class="banner-countdown" role="status" aria-label="Notice will close automatically">
        <span class="countdown-number">10</span>
      </div>
    </div>
  `;

  // Add banner styles
  const style = document.createElement('style');
  style.textContent = `
    #github-notice-banner {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
      animation: slideDown 0.5s ease-out;
    }
    
    .banner-content {
      display: flex;
      align-items: center;
      padding: 12px 20px;
      max-width: 100%;
    }
    
    .banner-icon {
      font-size: 1.2em;
      margin-right: 12px;
    }
    
    .banner-text {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    
    .banner-text strong {
      font-size: 0.95em;
      font-weight: 600;
    }
    
    .banner-subtitle {
      font-size: 0.8em;
      opacity: 0.9;
    }
    
    .banner-subtitle a {
      color: #FFD700;
      text-decoration: none;
      font-weight: 500;
    }
    
    .banner-subtitle a:hover {
      text-decoration: underline;
    }

    .banner-countdown {
      --deg: 0deg;
      position: relative;
      width: 26px;
      height: 26px;
      flex: 0 0 26px;
      border-radius: 50%;
      background:
        conic-gradient(rgba(255,255,255,0.95) var(--deg), rgba(255,255,255,0.25) 0deg);
      display: grid;
      place-items: center;
      margin-left: 12px;
    }

    .banner-countdown::after {
      content: '';
      position: absolute;
      inset: 2px;
      background: rgba(0,0,0,0.25);
      border-radius: 50%;
      box-shadow: inset 0 1px 2px rgba(0,0,0,0.25);
    }

    .countdown-number {
      position: relative;
      font-size: 0.7rem;
      font-weight: 700;
      line-height: 1;
      color: #fff;
      text-shadow: 0 1px 1px rgba(0,0,0,0.4);
    }
    
    @keyframes slideDown {
      from {
        transform: translateY(-100%);
      }
      to {
        transform: translateY(0);
      }
    }
    
    @keyframes fadeOut {
      from {
        opacity: 1;
        transform: translateY(0);
      }
      to {
        opacity: 0;
        transform: translateY(-100%);
      }
    }
  `;

  // Add styles and banner to document
  document.head.appendChild(style);
  document.body.appendChild(banner);

  // Countdown and auto-hide logic (10 seconds)
  const duration = 10; // seconds
  let remaining = duration;
  const countdownEl = banner.querySelector('.banner-countdown') as HTMLDivElement | null;
  const numberEl = banner.querySelector('.countdown-number') as HTMLSpanElement | null;

  const updateCountdown = () => {
    if (!countdownEl || !numberEl) return;
    numberEl.textContent = String(remaining);
    const progress = Math.max(0, Math.min(1, (duration - remaining) / duration));
    const deg = Math.round(progress * 360);
    countdownEl.style.setProperty('--deg', `${deg}deg`);
  };

  updateCountdown();

  const interval = window.setInterval(() => {
    remaining -= 1;
    if (remaining <= 0) {
      window.clearInterval(interval);
      // Final full progress
      if (countdownEl) countdownEl.style.setProperty('--deg', '360deg');
      // Trigger fade out and remove
      if (banner.parentElement) {
        banner.style.animation = 'fadeOut 0.5s ease-in forwards';
        window.setTimeout(() => banner.remove(), 500);
      }
      return;
    }
    updateCountdown();
  }, 1000);
}
