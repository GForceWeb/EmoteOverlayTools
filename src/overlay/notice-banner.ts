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

// Create and show notice banner for non-app users
export function showNoticeBanner(): void {
  if (!notAppUser()) return;

  // Create banner element
  const banner = document.createElement('div');
  banner.id = 'github-notice-banner';
  banner.innerHTML = `
    <div class="banner-content">
      <div class="banner-icon">🎉</div>
      <div class="banner-text">
        <strong>Emote Overlay Tools v0.1.0</strong>
        <span class="banner-subtitle">Visit our <a href="https://github.com/gforceweb/EmoteOverlayTools" target="_blank">GitHub</a> for updates and downloads!</span>
      </div>
      <button class="banner-close" onclick="this.parentElement.parentElement.remove()">×</button>
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
    
    .banner-close {
      background: none;
      border: none;
      color: white;
      font-size: 1.5em;
      cursor: pointer;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: background 0.2s ease;
    }
    
    .banner-close:hover {
      background: rgba(255, 255, 255, 0.2);
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

  // Auto-hide after 10 seconds
  setTimeout(() => {
    if (banner.parentElement) {
      banner.style.animation = 'fadeOut 0.5s ease-in forwards';
      setTimeout(() => {
        if (banner.parentElement) {
          banner.remove();
        }
      }, 500);
    }
  }, 10000);
}
