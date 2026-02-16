// Breadcrumbs component

interface Props { currentPage: string; onNavigate: (page: string) => void; }

const PAGE_HIERARCHY: Record<string, { label: string; parent?: string }> = {
    home: { label: 'Home' },
    dashboard: { label: 'Dashboard', parent: 'home' },
    pump: { label: 'Start Pumping', parent: 'dashboard' },
    // AI Tools
    playground: { label: 'Playground', parent: 'dashboard' },
    'playground-presets': { label: 'Presets', parent: 'playground' },
    'playground-history': { label: 'History', parent: 'playground' },
    'multi-modal': { label: 'Multi-Modal', parent: 'playground' },
    'image-gen': { label: 'Image Gen', parent: 'playground' },
    tts: { label: 'Text to Speech', parent: 'playground' },
    embeddings: { label: 'Embeddings', parent: 'playground' },
    'fine-tuning': { label: 'Fine-Tuning', parent: 'dashboard' },
    'batch-jobs': { label: 'Batch Jobs', parent: 'dashboard' },
    'saved-prompts': { label: 'Saved Prompts', parent: 'playground' },
    'prompt-library': { label: 'Prompt Library', parent: 'playground' },
    contexts: { label: 'Contexts', parent: 'playground' },
    'eval-suite': { label: 'Evaluation Suite', parent: 'dashboard' },
    // Models
    models: { label: 'Models', parent: 'home' },
    'model-detail': { label: 'Model Detail', parent: 'models' },
    'model-catalog': { label: 'Catalog', parent: 'models' },
    'model-leaderboard': { label: 'Leaderboard', parent: 'models' },
    'model-compare': { label: 'Compare', parent: 'models' },
    'custom-models': { label: 'Custom Models', parent: 'models' },
    'deployment-logs': { label: 'Deployments', parent: 'models' },
    vram: { label: 'VRAM Calculator', parent: 'models' },
    'gpu-compare': { label: 'GPU Compare', parent: 'models' },
    // Analytics
    analytics: { label: 'Analytics', parent: 'dashboard' },
    'api-usage': { label: 'API Usage', parent: 'analytics' },
    'api-request-logs': { label: 'Request Logs', parent: 'analytics' },
    'inference-logs': { label: 'Inference Logs', parent: 'analytics' },
    'cost-breakdown': { label: 'Cost Breakdown', parent: 'analytics' },
    'cost-calculator': { label: 'Cost Calculator', parent: 'analytics' },
    'usage-alerts': { label: 'Usage Alerts', parent: 'analytics' },
    'token-counter': { label: 'Token Counter', parent: 'analytics' },
    benchmarks: { label: 'Benchmarks', parent: 'analytics' },
    // Config
    'api-keys': { label: 'API Keys', parent: 'dashboard' },
    webhooks: { label: 'Webhooks', parent: 'dashboard' },
    'webhook-logs': { label: 'Webhook Logs', parent: 'webhooks' },
    guardrails: { label: 'Guardrails', parent: 'dashboard' },
    'rate-limits': { label: 'Rate Limits', parent: 'dashboard' },
    caching: { label: 'Caching', parent: 'dashboard' },
    'region-selector': { label: 'Regions', parent: 'dashboard' },
    integrations: { label: 'Integrations', parent: 'dashboard' },
    // Org
    teams: { label: 'Teams', parent: 'dashboard' },
    'org-settings': { label: 'Org Settings', parent: 'dashboard' },
    billing: { label: 'Billing', parent: 'dashboard' },
    subscription: { label: 'Subscription', parent: 'billing' },
    referrals: { label: 'Referrals', parent: 'dashboard' },
    'invite-tracker': { label: 'Invites', parent: 'referrals' },
    'data-exports': { label: 'Data Exports', parent: 'dashboard' },
    marketplace: { label: 'Marketplace', parent: 'home' },
    // Security
    security: { label: 'Security', parent: 'dashboard' },
    'audit-trail': { label: 'Audit Trail', parent: 'security' },
    'audit-log': { label: 'Audit Log', parent: 'security' },
    compliance: { label: 'Compliance', parent: 'security' },
    'trust-safety': { label: 'Trust & Safety', parent: 'security' },
    // Developer
    'dev-portal': { label: 'Developer Portal', parent: 'home' },
    docs: { label: 'Docs', parent: 'dev-portal' },
    quickstart: { label: 'Quickstart', parent: 'docs' },
    'code-samples': { label: 'Code Samples', parent: 'docs' },
    'sdk-docs': { label: 'SDK Docs', parent: 'docs' },
    'api-versioning': { label: 'API Versioning', parent: 'docs' },
    'error-codes': { label: 'Error Codes', parent: 'docs' },
    migration: { label: 'Migration Guide', parent: 'docs' },
    glossary: { label: 'Glossary', parent: 'docs' },
    // Resources
    blog: { label: 'Blog', parent: 'home' },
    changelog: { label: 'Changelog', parent: 'home' },
    'release-notes': { label: 'Release Notes', parent: 'changelog' },
    roadmap: { label: 'Roadmap', parent: 'home' },
    faq: { label: 'FAQ', parent: 'home' },
    help: { label: 'Help Center', parent: 'home' },
    'support-tickets': { label: 'Support Tickets', parent: 'help' },
    community: { label: 'Community', parent: 'home' },
    feedback: { label: 'Feedback', parent: 'home' },
    // Company
    about: { label: 'About', parent: 'home' },
    careers: { label: 'Careers', parent: 'about' },
    contact: { label: 'Contact', parent: 'home' },
    partners: { label: 'Partners', parent: 'home' },
    'open-source': { label: 'Open Source', parent: 'home' },
    enterprise: { label: 'Enterprise', parent: 'home' },
    // Infrastructure
    status: { label: 'Status', parent: 'home' },
    uptime: { label: 'Uptime', parent: 'status' },
    'system-health': { label: 'System Health', parent: 'status' },
    'incident-history': { label: 'Incidents', parent: 'status' },
    'data-centers': { label: 'Data Centers', parent: 'home' },
    'network-peering': { label: 'Network Peering', parent: 'data-centers' },
    sla: { label: 'SLA', parent: 'home' },
    // Account
    profile: { label: 'Profile', parent: 'dashboard' },
    settings: { label: 'Settings', parent: 'dashboard' },
    preferences: { label: 'Preferences', parent: 'settings' },
    history: { label: 'Session History', parent: 'dashboard' },
    'session-logs': { label: 'Session Logs', parent: 'history' },
    shortcuts: { label: 'Shortcuts', parent: 'settings' },
    storage: { label: 'Storage', parent: 'dashboard' },
    'export': { label: 'Export', parent: 'dashboard' },
    // Legal
    terms: { label: 'Terms', parent: 'home' },
    privacy: { label: 'Privacy', parent: 'home' },
    aup: { label: 'Acceptable Use', parent: 'home' },
    pricing: { label: 'Pricing', parent: 'home' },
    // Auth
    login: { label: 'Sign In', parent: 'home' },
    register: { label: 'Get Started', parent: 'home' },
    'forgot-password': { label: 'Forgot Password', parent: 'login' },
};

export default function Breadcrumbs({ currentPage, onNavigate }: Props) {
    const crumbs: { page: string; label: string }[] = [];
    let current = currentPage;
    while (current && PAGE_HIERARCHY[current]) {
        crumbs.unshift({ page: current, label: PAGE_HIERARCHY[current].label });
        current = PAGE_HIERARCHY[current].parent || '';
    }

    if (crumbs.length <= 1) return null;

    return (
        <nav style={{ display: 'flex', gap: '0.3rem', alignItems: 'center', padding: '0.5rem 0', fontSize: '0.75rem', color: 'rgba(255,255,255,0.25)' }}>
            {crumbs.map((c, i) => (
                <span key={c.page} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    {i > 0 && <span style={{ color: 'rgba(255,255,255,0.15)' }}>/</span>}
                    {i < crumbs.length - 1 ? (
                        <button onClick={() => onNavigate(c.page)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem', padding: 0 }}>{c.label}</button>
                    ) : (
                        <span style={{ color: '#00d4ff', fontWeight: 600 }}>{c.label}</span>
                    )}
                </span>
            ))}
        </nav>
    );
}
