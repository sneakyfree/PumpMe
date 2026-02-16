/**
 * White-Label Configuration — branding, theming, and customization
 *
 * Allows enterprise customers to white-label the platform with their own
 * branding, colors, logo, and domain.
 */

export interface WhiteLabelConfig {
    // Branding
    brandName: string;
    logoUrl?: string;
    faviconUrl?: string;
    tagline?: string;

    // Colors
    primaryColor: string;      // Main accent (default: #00d4ff)
    secondaryColor: string;    // Secondary accent (default: #7b61ff)
    backgroundColor: string;   // App background (default: #0a0a1a)
    surfaceColor: string;      // Card/surface background (default: rgba(255,255,255,0.04))
    textColor: string;         // Primary text (default: #ffffff)
    textMuted: string;         // Secondary text (default: rgba(255,255,255,0.5))

    // Features
    showPoweredBy: boolean;    // Show "Powered by PumpMe" footer
    customDomain?: string;     // Custom domain for the platform
    supportEmail?: string;     // Override support email
    supportUrl?: string;       // Override support link

    // Tiers
    hideFreeTier: boolean;     // Hide the free tier option
    customTierNames?: Record<string, string>; // Rename tiers

    // Footer
    customFooterHtml?: string;
    privacyPolicyUrl?: string;
    termsOfServiceUrl?: string;
}

// Default config (PumpMe branding)
export const defaultConfig: WhiteLabelConfig = {
    brandName: 'Pump Me',
    tagline: 'GPU Compute for Normies',
    primaryColor: '#00d4ff',
    secondaryColor: '#7b61ff',
    backgroundColor: '#0a0a1a',
    surfaceColor: 'rgba(255,255,255,0.04)',
    textColor: '#ffffff',
    textMuted: 'rgba(255,255,255,0.5)',
    showPoweredBy: false,
    hideFreeTier: false,
};

/**
 * Load white-label config from environment or API
 */
export function loadWhiteLabelConfig(): WhiteLabelConfig {
    // Check for environment-injected config (set at build time or via API)
    const injected = (window as unknown as { __PUMPME_WL_CONFIG__?: Partial<WhiteLabelConfig> }).__PUMPME_WL_CONFIG__;

    if (injected) {
        return { ...defaultConfig, ...injected };
    }

    return defaultConfig;
}

/**
 * Apply white-label config to CSS custom properties
 */
export function applyWhiteLabelTheme(config: WhiteLabelConfig): void {
    const root = document.documentElement;

    root.style.setProperty('--wl-primary', config.primaryColor);
    root.style.setProperty('--wl-secondary', config.secondaryColor);
    root.style.setProperty('--wl-bg', config.backgroundColor);
    root.style.setProperty('--wl-surface', config.surfaceColor);
    root.style.setProperty('--wl-text', config.textColor);
    root.style.setProperty('--wl-text-muted', config.textMuted);

    // Update page title and favicon
    document.title = `${config.brandName}${config.tagline ? ` — ${config.tagline}` : ''}`;

    if (config.faviconUrl) {
        const link = document.querySelector<HTMLLinkElement>("link[rel*='icon']") || document.createElement('link');
        link.type = 'image/x-icon';
        link.rel = 'shortcut icon';
        link.href = config.faviconUrl;
        document.head.appendChild(link);
    }
}

/**
 * Get the current white-label config (singleton)
 */
let _config: WhiteLabelConfig | null = null;

export function getWhiteLabelConfig(): WhiteLabelConfig {
    if (!_config) {
        _config = loadWhiteLabelConfig();
    }
    return _config;
}
