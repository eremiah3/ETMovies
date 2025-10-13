// Ad blocker utility for vidsrc video player
class AdBlocker {
  constructor() {
    this.adSelectors = [
      // Common ad selectors
      '[id*="ad"]',
      '[class*="ad"]',
      '[id*="banner"]',
      '[class*="banner"]',
      '[id*="popup"]',
      '[class*="popup"]',
      '[id*="overlay"]',
      '[class*="overlay"]',
      '[id*="interstitial"]',
      '[class*="interstitial"]',
      '[id*="preroll"]',
      '[class*="preroll"]',
      '[id*="midroll"]',
      '[class*="midroll"]',
      '[id*="postroll"]',
      '[class*="postroll"]',
      '[id*="sponsor"]',
      '[class*="sponsor"]',
      '[id*="promo"]',
      '[class*="promo"]',
      '[id*="commercial"]',
      '[class*="commercial"]',
      // VidSrc specific selectors
      '.jwplayer-ad',
      '.ima-ad-container',
      '.vast-container',
      '.ad-container',
      '.advertisement',
      '.adsbygoogle',
      '.google-ad',
      '.fb-ad',
      '.twitter-ad',
      '.instagram-ad',
      '.youtube-ad',
      '.vimeo-ad',
      '.dailymotion-ad'
    ];

    this.adDomains = [
      'googlesyndication.com',
      'googleadservices.com',
      'doubleclick.net',
      'googletagmanager.com',
      'google-analytics.com',
      'adsystem.amazon.com',
      'facebook.com',
      'facebook.net',
      'twitter.com',
      'instagram.com',
      'pinterest.com',
      'linkedin.com',
      'youtube.com',
      'vimeo.com',
      'dailymotion.com'
    ];
  }

  // Block ads in iframe by injecting CSS
  blockAdsInIframe(iframe) {
    if (!iframe) return;

    try {
      // Create a style element to inject into the iframe
      const style = document.createElement('style');
      style.textContent = `
        ${this.adSelectors.join(', ')} {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          height: 0 !important;
          width: 0 !important;
          position: absolute !important;
          left: -9999px !important;
          top: -9999px !important;
        }

        /* Block ad scripts */
        script[src*="googlesyndication"],
        script[src*="googleadservices"],
        script[src*="doubleclick"],
        script[src*="googletagmanager"],
        script[src*="adsystem"],
        script[src*="facebook"],
        script[src*="twitter"],
        script[src*="instagram"],
        script[src*="youtube"],
        script[src*="vimeo"],
        script[src*="dailymotion"] {
          display: none !important;
        }

        /* Hide ad iframes */
        iframe[src*="googlesyndication"],
        iframe[src*="googleadservices"],
        iframe[src*="doubleclick"],
        iframe[src*="googletagmanager"],
        iframe[src*="adsystem"],
        iframe[src*="facebook"],
        iframe[src*="twitter"],
        iframe[src*="instagram"],
        iframe[src*="youtube"],
        iframe[src*="vimeo"],
        iframe[src*="dailymotion"] {
          display: none !important;
        }
      `;

      // Try to inject the style into the iframe's document
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (iframeDoc) {
        iframeDoc.head.appendChild(style);
      }
    } catch (error) {
      console.warn('Could not inject ad blocking styles into iframe:', error);
    }
  }

  // Create an ad-blocked iframe wrapper
  createAdBlockedIframe(src, options = {}) {
    const wrapper = document.createElement('div');
    wrapper.className = 'ad-blocked-video-wrapper';
    wrapper.style.position = 'relative';
    wrapper.style.width = options.width || '100%';
    wrapper.style.height = options.height || '400px';

  const iframe = document.createElement('iframe');
  iframe.src = src;
  iframe.width = '100%';
  iframe.height = '100%';
  iframe.allowFullscreen = true; // Enable fullscreen for better compatibility
  iframe.setAttribute('allowfullscreen', 'true');
  iframe.frameBorder = '0';

    // Add ad blocking when iframe loads
    iframe.onload = () => {
      this.blockAdsInIframe(iframe);
    };

    wrapper.appendChild(iframe);

    // Add a blocking overlay for known ad domains
    if (this.isAdDomain(src)) {
      const overlay = document.createElement('div');
      overlay.style.position = 'absolute';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100%';
      overlay.style.height = '100%';
      overlay.style.background = 'rgba(0, 0, 0, 0.8)';
      overlay.style.color = 'white';
      overlay.style.display = 'flex';
      overlay.style.alignItems = 'center';
      overlay.style.justifyContent = 'center';
      overlay.style.fontSize = '18px';
      overlay.style.zIndex = '9999';
      overlay.textContent = 'Ad blocked for better viewing experience';

      wrapper.appendChild(overlay);
      return wrapper;
    }

    return wrapper;
  }

  // Check if URL contains ad domain
  isAdDomain(url) {
    try {
      const urlObj = new URL(url);
      return this.adDomains.some(domain => urlObj.hostname.includes(domain));
    } catch {
      return false;
    }
  }

  // Apply ad blocking to all iframes on the page
  blockAllAds() {
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach(iframe => {
      if (this.isAdDomain(iframe.src)) {
        this.blockAdsInIframe(iframe);
      }
    });
  }

  // Initialize ad blocking for the entire page
  init() {
    // Block ads on page load
    document.addEventListener('DOMContentLoaded', () => {
      this.blockAllAds();
    });

    // Block ads when new iframes are added
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.tagName === 'IFRAME') {
            if (this.isAdDomain(node.src)) {
              this.blockAdsInIframe(node);
            }
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Block ads periodically
    setInterval(() => {
      this.blockAllAds();
    }, 5000);
  }
}

// Export singleton instance
const adBlocker = new AdBlocker();
export default adBlocker;

// Helper function to create ad-blocked video player
export const createAdBlockedVideo = (src, options = {}) => {
  return adBlocker.createAdBlockedIframe(src, options);
};

// Initialize ad blocking globally
if (typeof window !== 'undefined') {
  adBlocker.init();
}
