/**
 * FloodGuard AI - Language & Localization Service
 * Ensures that the user's chosen language persists across:
 * - Tab navigations (Dashboard, Map, Prediction, Alerts, etc.)
 * - Page reloads & browser restarts
 * - Google Translate / Chrome auto-translate interventions
 *
 * Prevents unwanted automatic reverts (e.g. reverting to Telugu or default language).
 */

export interface SupportedLanguage {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
];

const STORAGE_KEY = 'floodguard_selected_language';
const EVENT_NAME = 'floodguard:languageChanged';

export const languageService = {
  /**
   * Get the current persisted language, defaulting to 'en'
   */
  getCurrentLanguage(): string {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && SUPPORTED_LANGUAGES.some((l) => l.code === saved)) {
        return saved;
      }
    } catch {
      // fallback
    }
    return 'en';
  },

  /**
   * Persist user's selected language and sync with Google Translate cookies
   */
  setLanguage(langCode: string, reloadIfNeeded: boolean = false): void {
    const prevLang = this.getCurrentLanguage();
    if (!SUPPORTED_LANGUAGES.some((l) => l.code === langCode)) {
      langCode = 'en';
    }

    try {
      localStorage.setItem(STORAGE_KEY, langCode);
    } catch (e) {
      console.error('Failed to save language to localStorage:', e);
    }

    // Set document lang attribute
    document.documentElement.lang = langCode;

    // Synchronize Google Translate cookie (googtrans)
    this.syncGoogleTranslateCookie(langCode);

    // If switching back to English from a translated state, reload to restore pristine English DOM
    if (langCode === 'en' && (prevLang !== 'en' || document.querySelector('.goog-te-combo'))) {
      window.location.reload();
      return;
    }

    // Trigger Google Translate DOM element if initialized
    this.triggerGoogleTranslateCombo(langCode);

    // Dispatch global event for React components
    window.dispatchEvent(
      new CustomEvent(EVENT_NAME, {
        detail: { language: langCode },
      })
    );

    if (reloadIfNeeded) {
      window.location.reload();
    }
  },

  /**
   * Keep Google Translate cookie in strict sync with user choice.
   * If user chose English, clear / set /en/en so it NEVER resets back to Telugu.
   */
  syncGoogleTranslateCookie(langCode: string): void {
    const hostname = window.location.hostname;
    const cookieVal = langCode === 'en' ? '/en/en' : `/en/${langCode}`;

    // Clear stale cookies across potential domains
    const domains = ['', hostname, `.${hostname}`];
    domains.forEach((dom) => {
      const domPart = dom ? `; domain=${dom}` : '';
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/${domPart};`;
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${domPart};`;
    });

    // Write persistent cookie (1 year expiry)
    const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `googtrans=${cookieVal}; expires=${expires}; path=/;`;
    if (hostname && hostname !== 'localhost') {
      document.cookie = `googtrans=${cookieVal}; expires=${expires}; path=/; domain=.${hostname};`;
    }
  },

  /**
   * Programmatically update Google Translate dropdown if active
   */
  triggerGoogleTranslateCombo(langCode: string): boolean {
    try {
      const combo = document.querySelector<HTMLSelectElement>('.goog-te-combo');
      if (combo) {
        const targetValue = langCode === 'en' ? '' : langCode;
        if (combo.value !== targetValue) {
          combo.value = targetValue;
          combo.dispatchEvent(new Event('change'));
          return true;
        }
      }
    } catch (e) {
      console.warn('Google Translate combo not ready:', e);
    }
    return false;
  },

  /**
   * Initializes language enforcement on page boot
   */
  init(): void {
    const active = this.getCurrentLanguage();
    document.documentElement.lang = active;
    this.syncGoogleTranslateCookie(active);

    // Watch for Google Translate combo injection to enforce user's selected language
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      const success = this.triggerGoogleTranslateCombo(this.getCurrentLanguage());
      if (success || attempts > 20) {
        clearInterval(interval);
      }
    }, 400);
  },
};
