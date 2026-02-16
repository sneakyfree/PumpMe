import { useState, lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Core shell — always loaded
import AIChatWidget from './components/AIChatWidget';
import FAQPage from './components/FAQPage';
import PricingPage from './components/PricingPage';
import Sidebar from './components/Sidebar';
import CommandPalette from './components/CommandPalette';
import Breadcrumbs from './components/Breadcrumbs';
import PageSkeleton from './components/PageSkeleton';
import './App.css';

// Lazy-loaded pages (code-split per page)
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const SessionWizard = lazy(() => import('./pages/SessionWizard'));
const BillingPage = lazy(() => import('./pages/BillingPage'));
const ModelsPage = lazy(() => import('./pages/ModelsPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const SessionHistory = lazy(() => import('./pages/SessionHistory'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const VramCalculator = lazy(() => import('./pages/VramCalculator'));
const ModelDetail = lazy(() => import('./pages/ModelDetail'));
const DocsPage = lazy(() => import('./pages/DocsPage'));
const LegalTermsPage = lazy(() => import('./pages/LegalPages').then(m => ({ default: m.TermsPage })));
const LegalPrivacyPage = lazy(() => import('./pages/LegalPages').then(m => ({ default: m.PrivacyPage })));
const LegalAUPPage = lazy(() => import('./pages/LegalPages').then(m => ({ default: m.AUPPage })));
const SessionWorkspace = lazy(() => import('./pages/SessionWorkspace'));
const PumpReport = lazy(() => import('./pages/PumpReport'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const StorageBrowser = lazy(() => import('./pages/StorageBrowser'));
const SubscriptionPage = lazy(() => import('./pages/SubscriptionPage'));
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage'));
const ApiKeysPage = lazy(() => import('./pages/ApiKeysPage'));
const ModelCompare = lazy(() => import('./pages/ModelCompare'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const ReferralPage = lazy(() => import('./pages/ReferralPage'));
const FeedbackPage = lazy(() => import('./pages/FeedbackPage'));
const TeamPage = lazy(() => import('./pages/TeamPage'));
const StatusPage = lazy(() => import('./pages/StatusPage'));
const ChangelogPage = lazy(() => import('./pages/ChangelogPage'));
const AuditLogPage = lazy(() => import('./pages/AuditLogPage'));
const ExportPage = lazy(() => import('./pages/ExportPage'));
const MarketplacePage = lazy(() => import('./pages/MarketplacePage'));
const PreferencesPage = lazy(() => import('./pages/PreferencesPage'));
const WebhookPage = lazy(() => import('./pages/WebhookPage'));
const CommunityPage = lazy(() => import('./pages/CommunityPage'));
const ApiUsagePage = lazy(() => import('./pages/ApiUsagePage'));
const SecurityPage = lazy(() => import('./pages/SecurityPage'));
const HelpCenterPage = lazy(() => import('./pages/HelpCenterPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const CostCalculatorPage = lazy(() => import('./pages/CostCalculatorPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const QuickstartPage = lazy(() => import('./pages/QuickstartPage'));
const UsageLimitsPage = lazy(() => import('./pages/UsageLimitsPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const SessionLogsPage = lazy(() => import('./pages/SessionLogsPage'));
const GpuComparePage = lazy(() => import('./pages/GpuComparePage'));
const ShortcutsPage = lazy(() => import('./pages/ShortcutsPage'));
const PlaygroundPage = lazy(() => import('./pages/PlaygroundPage'));
const InviteTrackerPage = lazy(() => import('./pages/InviteTrackerPage'));
const DevBlogPage = lazy(() => import('./pages/DevBlogPage'));
const RoadmapPage = lazy(() => import('./pages/RoadmapPage'));
const IntegrationsPage = lazy(() => import('./pages/IntegrationsPage'));
const ActivityFeedPage = lazy(() => import('./pages/ActivityFeedPage'));
const SavedPromptsPage = lazy(() => import('./pages/SavedPromptsPage'));
const BenchmarksPage = lazy(() => import('./pages/BenchmarksPage'));
const SlaPage = lazy(() => import('./pages/SlaPage'));
const CareersPage = lazy(() => import('./pages/CareersPage'));
const MigrationGuidePage = lazy(() => import('./pages/MigrationGuidePage'));
const TokenCounterPage = lazy(() => import('./pages/TokenCounterPage'));
const PartnersPage = lazy(() => import('./pages/PartnersPage'));
const DataCentersPage = lazy(() => import('./pages/DataCentersPage'));
const OpenSourcePage = lazy(() => import('./pages/OpenSourcePage'));
const FineTuningPage = lazy(() => import('./pages/FineTuningPage'));
const SdkDocsPage = lazy(() => import('./pages/SdkDocsPage'));
const BatchJobsPage = lazy(() => import('./pages/BatchJobsPage'));
const EnterprisePage = lazy(() => import('./pages/EnterprisePage'));
const ErrorCodesPage = lazy(() => import('./pages/ErrorCodesPage'));
const UptimeMonitorPage = lazy(() => import('./pages/UptimeMonitorPage'));
const ModelCatalogPage = lazy(() => import('./pages/ModelCatalogPage'));
const TrustSafetyPage = lazy(() => import('./pages/TrustSafetyPage'));
const CompliancePage = lazy(() => import('./pages/CompliancePage'));
const WebhookLogsPage = lazy(() => import('./pages/WebhookLogsPage'));
const CustomModelsPage = lazy(() => import('./pages/CustomModelsPage'));
const ApiVersioningPage = lazy(() => import('./pages/ApiVersioningPage'));
const GuardrailsPage = lazy(() => import('./pages/GuardrailsPage'));
const RateLimitConfigPage = lazy(() => import('./pages/RateLimitConfigPage'));
const EmbeddingsPage = lazy(() => import('./pages/EmbeddingsPage'));
const PromptLibraryPage = lazy(() => import('./pages/PromptLibraryPage'));
const SystemHealthPage = lazy(() => import('./pages/SystemHealthPage'));
const InferenceLogsPage = lazy(() => import('./pages/InferenceLogsPage'));
const CostBreakdownPage = lazy(() => import('./pages/CostBreakdownPage'));
const NetworkPeeringPage = lazy(() => import('./pages/NetworkPeeringPage'));
const PlaygroundHistoryPage = lazy(() => import('./pages/PlaygroundHistoryPage'));
const ModelLeaderboardPage = lazy(() => import('./pages/ModelLeaderboardPage'));
const GlossaryPage = lazy(() => import('./pages/GlossaryPage'));
const CachingPage = lazy(() => import('./pages/CachingPage'));
const AuditTrailPage = lazy(() => import('./pages/AuditTrailPage'));
const SupportTicketsPage = lazy(() => import('./pages/SupportTicketsPage'));
const OrgSettingsPage = lazy(() => import('./pages/OrgSettingsPage'));
const UsageAlertsPage = lazy(() => import('./pages/UsageAlertsPage'));
const DataExportsPage = lazy(() => import('./pages/DataExportsPage'));
const IncidentHistoryPage = lazy(() => import('./pages/IncidentHistoryPage'));
const CodeSamplesPage = lazy(() => import('./pages/CodeSamplesPage'));
const ReleaseNotesPage = lazy(() => import('./pages/ReleaseNotesPage'));
const TextToSpeechPage = lazy(() => import('./pages/TextToSpeechPage'));
const ImageGenPage = lazy(() => import('./pages/ImageGenPage'));
const ContextsPage = lazy(() => import('./pages/ContextsPage'));
const PlaygroundPresetsPage = lazy(() => import('./pages/PlaygroundPresetsPage'));
const DeploymentLogsPage = lazy(() => import('./pages/DeploymentLogsPage'));
const RegionSelectorPage = lazy(() => import('./pages/RegionSelectorPage'));
const MultiModalPage = lazy(() => import('./pages/MultiModalPage'));
const EvalSuitePage = lazy(() => import('./pages/EvalSuitePage'));
const ApiRequestLogsPage = lazy(() => import('./pages/ApiRequestLogsPage'));
const DevPortalPage = lazy(() => import('./pages/DevPortalPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

type Page = 'home' | 'login' | 'register' | 'dashboard' | 'pump' | 'models' | 'model-detail' | 'billing' | 'profile' | 'history' | 'settings' | 'vram' | 'docs' | 'faq' | 'pricing' | 'terms' | 'privacy' | 'aup' | 'forgot-password' | 'reset-password' | 'verify-email' | 'workspace' | 'pump-report' | 'admin' | 'storage' | 'subscription' | 'leaderboard' | 'api-keys' | 'model-compare' | 'analytics' | 'referrals' | 'feedback' | 'teams' | 'status' | 'changelog' | 'audit-log' | 'export' | 'marketplace' | 'preferences' | 'webhooks' | 'community' | 'api-usage' | 'security' | 'help' | 'notifications' | 'cost-calculator' | 'contact' | 'quickstart' | 'usage-limits' | 'about' | 'session-logs' | 'gpu-compare' | 'shortcuts' | 'playground' | 'invite-tracker' | 'blog' | 'roadmap' | 'integrations' | 'activity' | 'saved-prompts' | 'benchmarks' | 'sla' | 'careers' | 'migration' | 'token-counter' | 'partners' | 'data-centers' | 'open-source' | 'fine-tuning' | 'sdk-docs' | 'batch-jobs' | 'enterprise' | 'error-codes' | 'uptime' | 'model-catalog' | 'trust-safety' | 'compliance' | 'webhook-logs' | 'custom-models' | 'api-versioning' | 'guardrails' | 'rate-limits' | 'embeddings' | 'prompt-library' | 'system-health' | 'inference-logs' | 'cost-breakdown' | 'network-peering' | 'playground-history' | 'model-leaderboard' | 'glossary' | 'caching' | 'audit-trail' | 'support-tickets' | 'org-settings' | 'usage-alerts' | 'data-exports' | 'incident-history' | 'code-samples' | 'release-notes' | 'tts' | 'image-gen' | 'contexts' | 'playground-presets' | 'deployment-logs' | 'region-selector' | 'multi-modal' | 'eval-suite' | 'api-request-logs' | 'dev-portal' | 'not-found';

const NO_SIDEBAR_PAGES: Page[] = ['home', 'login', 'register', 'forgot-password', 'reset-password', 'verify-email'];

function AppContent() {
    const { user, loading, logout } = useAuth();
    const [page, setPage] = useState<Page>('home');
    const [selectedModel, setSelectedModel] = useState('');
    const [activeSessionId, _setActiveSessionId] = useState('demo-session-1');

    // Auto-redirect to dashboard if logged in and on home
    if (user && page === 'home') {
        // Don't auto-redirect, let user click
    }

    if (loading) {
        return (
            <div className="app" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚀</div>
                    <p style={{ color: 'rgba(255,255,255,0.5)' }}>Loading...</p>
                </div>
            </div>
        );
    }

    const showSidebar = !NO_SIDEBAR_PAGES.includes(page);

    return (
        <div className="app">
            <header className="header">
                <div className="header-content">
                    <div className="logo" onClick={() => setPage(user ? 'dashboard' : 'home')}>
                        <span className="logo-icon">🚀</span>
                        <span className="logo-text">Pump Me</span>
                    </div>
                    <nav className="nav">
                        {user ? (
                            <>
                                <button onClick={() => setPage('dashboard')} className={page === 'dashboard' ? 'active' : ''}>Dashboard</button>
                                <button onClick={() => setPage('pump')} className={page === 'pump' ? 'active' : ''}>Pump</button>
                                <button onClick={() => setPage('models')} className={page === 'models' ? 'active' : ''}>Models</button>
                                <button onClick={() => setPage('docs')} className={page === 'docs' ? 'active' : ''}>Docs</button>
                                <span style={{ color: 'rgba(255,255,255,0.3)' }}>|</span>
                                <span style={{ color: '#00d4ff', fontSize: '0.85rem', cursor: 'pointer' }} onClick={() => setPage('profile')}>${((user.creditBalance || 0) / 100).toFixed(2)}</span>
                                <button onClick={async () => { await logout(); setPage('home'); }} style={{ color: 'rgba(255,255,255,0.5)' }}>Logout</button>
                            </>
                        ) : (
                            <>
                                <button onClick={() => setPage('home')} className={page === 'home' ? 'active' : ''}>Home</button>
                                <button onClick={() => setPage('faq')} className={page === 'faq' ? 'active' : ''}>FAQ</button>
                                <button onClick={() => setPage('pricing')} className={page === 'pricing' ? 'active' : ''}>Pricing</button>
                                <span style={{ color: 'rgba(255,255,255,0.3)' }}>|</span>
                                <button onClick={() => setPage('login')} className="nav-login">Sign In</button>
                                <button onClick={() => setPage('register')} className="btn btn-primary btn-sm">Get Started</button>
                            </>
                        )}
                    </nav>
                </div>
            </header>

            <CommandPalette currentPage={page} onNavigate={(p) => setPage(p as Page)} />

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                {showSidebar && <Sidebar currentPage={page} onNavigate={(p) => setPage(p as Page)} isLoggedIn={!!user} />}
                <main className="main" style={{ flex: 1, overflow: 'auto' }}>
                    {showSidebar && <Breadcrumbs currentPage={page} onNavigate={(p) => setPage(p as Page)} />}
                    <Suspense fallback={<PageSkeleton />}>
                        {page === 'home' && !user && <LandingPage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'home' && user && (
                            <div className="hero">
                                <h1>Welcome back! 🔥</h1>
                                <p className="hero-sub">Ready to pump? Head to your dashboard or start a new session.</p>
                                <div className="hero-ctas">
                                    <button className="btn btn-primary" onClick={() => setPage('dashboard')}>Go to Dashboard</button>
                                    <button className="btn btn-secondary" onClick={() => setPage('pump')}>Start Pumping</button>
                                </div>
                            </div>
                        )}

                        {page === 'login' && <LoginPage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'register' && <RegisterPage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'forgot-password' && <ForgotPasswordPage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'reset-password' && <ResetPasswordPage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'verify-email' && <VerifyEmailPage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'dashboard' && user && <DashboardPage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'pump' && user && <SessionWizard onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'billing' && user && <BillingPage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'profile' && user && <ProfilePage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'history' && user && <SessionHistory onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'settings' && user && <SettingsPage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'models' && <ModelsPage onNavigate={(p) => { if (p.startsWith('model:')) { setSelectedModel(p.slice(6)); setPage('model-detail'); } else { setPage(p as Page); } }} />}
                        {page === 'model-detail' && <ModelDetail modelSlug={selectedModel} onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'vram' && <VramCalculator onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'docs' && <DocsPage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'faq' && <FAQPage onBack={() => setPage(user ? 'dashboard' : 'home')} />}
                        {page === 'pricing' && <PricingPage onBack={() => setPage(user ? 'dashboard' : 'home')} />}
                        {page === 'terms' && <LegalTermsPage onBack={() => setPage(user ? 'dashboard' : 'home')} />}
                        {page === 'privacy' && <LegalPrivacyPage onBack={() => setPage(user ? 'dashboard' : 'home')} />}
                        {page === 'aup' && <LegalAUPPage onBack={() => setPage(user ? 'dashboard' : 'home')} />}
                        {page === 'workspace' && user && <SessionWorkspace sessionId={activeSessionId} modelName="Llama 3 70B" onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'pump-report' && <PumpReport sessionId={activeSessionId} onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'admin' && user && <AdminPage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'storage' && user && <StorageBrowser onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'subscription' && user && <SubscriptionPage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'leaderboard' && <LeaderboardPage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'api-keys' && user && <ApiKeysPage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'model-compare' && <ModelCompare onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'analytics' && user && <AnalyticsPage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'referrals' && user && <ReferralPage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'feedback' && user && <FeedbackPage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'teams' && user && <TeamPage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'status' && <StatusPage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'changelog' && <ChangelogPage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'audit-log' && user && <AuditLogPage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'export' && user && <ExportPage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'marketplace' && <MarketplacePage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'preferences' && user && <PreferencesPage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'webhooks' && user && <WebhookPage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'community' && <CommunityPage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'api-usage' && user && <ApiUsagePage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'security' && user && <SecurityPage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'help' && <HelpCenterPage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'notifications' && user && <NotificationsPage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'cost-calculator' && <CostCalculatorPage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'contact' && <ContactPage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'quickstart' && <QuickstartPage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'usage-limits' && user && <UsageLimitsPage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'about' && <AboutPage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'session-logs' && user && <SessionLogsPage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'gpu-compare' && <GpuComparePage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'shortcuts' && <ShortcutsPage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'playground' && <PlaygroundPage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'invite-tracker' && user && <InviteTrackerPage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'blog' && <DevBlogPage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'roadmap' && <RoadmapPage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'integrations' && <IntegrationsPage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'activity' && user && <ActivityFeedPage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'saved-prompts' && user && <SavedPromptsPage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'benchmarks' && <BenchmarksPage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'sla' && <SlaPage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'careers' && <CareersPage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'migration' && <MigrationGuidePage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'token-counter' && <TokenCounterPage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'partners' && <PartnersPage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'data-centers' && <DataCentersPage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'open-source' && <OpenSourcePage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'fine-tuning' && <FineTuningPage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'sdk-docs' && <SdkDocsPage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'batch-jobs' && user && <BatchJobsPage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'enterprise' && <EnterprisePage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'error-codes' && <ErrorCodesPage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'uptime' && <UptimeMonitorPage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'model-catalog' && <ModelCatalogPage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'trust-safety' && <TrustSafetyPage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'compliance' && <CompliancePage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'webhook-logs' && user && <WebhookLogsPage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'custom-models' && user && <CustomModelsPage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'api-versioning' && <ApiVersioningPage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'guardrails' && user && <GuardrailsPage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'rate-limits' && <RateLimitConfigPage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'embeddings' && <EmbeddingsPage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'prompt-library' && <PromptLibraryPage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'system-health' && <SystemHealthPage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'inference-logs' && user && <InferenceLogsPage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'cost-breakdown' && user && <CostBreakdownPage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'network-peering' && <NetworkPeeringPage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'playground-history' && user && <PlaygroundHistoryPage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'model-leaderboard' && <ModelLeaderboardPage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'glossary' && <GlossaryPage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'caching' && user && <CachingPage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'audit-trail' && user && <AuditTrailPage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'support-tickets' && user && <SupportTicketsPage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'org-settings' && user && <OrgSettingsPage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'usage-alerts' && user && <UsageAlertsPage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'data-exports' && user && <DataExportsPage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'incident-history' && <IncidentHistoryPage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'code-samples' && <CodeSamplesPage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'release-notes' && <ReleaseNotesPage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'tts' && <TextToSpeechPage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'image-gen' && <ImageGenPage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'contexts' && user && <ContextsPage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'playground-presets' && <PlaygroundPresetsPage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'deployment-logs' && user && <DeploymentLogsPage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'region-selector' && user && <RegionSelectorPage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'multi-modal' && <MultiModalPage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'eval-suite' && user && <EvalSuitePage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'api-request-logs' && user && <ApiRequestLogsPage onNavigate={(p) => setPage(p as Page)} />}
                        {page === 'dev-portal' && <DevPortalPage onNavigate={(p) => setPage(p as Page)} />}
                        {!['home', 'login', 'register', 'forgot-password', 'dashboard', 'pump', 'models', 'model-detail', 'billing', 'profile', 'history', 'settings', 'vram', 'docs', 'faq', 'pricing', 'terms', 'privacy', 'aup', 'workspace', 'pump-report', 'admin', 'storage', 'subscription', 'leaderboard', 'api-keys', 'model-compare', 'analytics', 'referrals', 'feedback', 'teams', 'status', 'changelog', 'audit-log', 'export', 'marketplace', 'preferences', 'webhooks', 'community', 'api-usage', 'security', 'help', 'notifications', 'cost-calculator', 'contact', 'quickstart', 'usage-limits', 'about', 'session-logs', 'gpu-compare', 'shortcuts', 'playground', 'invite-tracker', 'blog', 'roadmap', 'integrations', 'activity', 'saved-prompts', 'benchmarks', 'sla', 'careers', 'migration', 'token-counter', 'partners', 'data-centers', 'open-source', 'fine-tuning', 'sdk-docs', 'batch-jobs', 'enterprise', 'error-codes', 'uptime', 'model-catalog', 'trust-safety', 'compliance', 'webhook-logs', 'custom-models', 'api-versioning', 'guardrails', 'rate-limits', 'embeddings', 'prompt-library', 'system-health', 'inference-logs', 'cost-breakdown', 'network-peering', 'playground-history', 'model-leaderboard', 'glossary', 'caching', 'audit-trail', 'support-tickets', 'org-settings', 'usage-alerts', 'data-exports', 'incident-history', 'code-samples', 'release-notes', 'tts', 'image-gen', 'contexts', 'playground-presets', 'deployment-logs', 'region-selector', 'multi-modal', 'eval-suite', 'api-request-logs', 'dev-portal'].includes(page) && <NotFoundPage onNavigate={(p) => setPage(p as Page)} />}
                    </Suspense>
                </main>
            </div>

            <footer className="footer">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', maxWidth: '700px', margin: '0 auto 1rem', textAlign: 'left' }}>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: '0.75rem', marginBottom: '0.4rem', color: 'rgba(255,255,255,0.5)' }}>Product</div>
                        {[{ p: 'playground', l: 'Playground' }, { p: 'models', l: 'Models' }, { p: 'pricing', l: 'Pricing' }, { p: 'enterprise', l: 'Enterprise' }, { p: 'benchmarks', l: 'Benchmarks' }].map(i => <button key={i.p} className="link-btn" onClick={() => setPage(i.p as Page)} style={{ display: 'block', color: 'rgba(255,255,255,0.25)', fontSize: '0.7rem', background: 'none', border: 'none', cursor: 'pointer', padding: '0.1rem 0' }}>{i.l}</button>)}
                    </div>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: '0.75rem', marginBottom: '0.4rem', color: 'rgba(255,255,255,0.5)' }}>Developers</div>
                        {[{ p: 'dev-portal', l: 'Portal' }, { p: 'docs', l: 'Docs' }, { p: 'quickstart', l: 'Quickstart' }, { p: 'sdk-docs', l: 'SDKs' }, { p: 'api-versioning', l: 'Versioning' }].map(i => <button key={i.p} className="link-btn" onClick={() => setPage(i.p as Page)} style={{ display: 'block', color: 'rgba(255,255,255,0.25)', fontSize: '0.7rem', background: 'none', border: 'none', cursor: 'pointer', padding: '0.1rem 0' }}>{i.l}</button>)}
                    </div>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: '0.75rem', marginBottom: '0.4rem', color: 'rgba(255,255,255,0.5)' }}>Company</div>
                        {[{ p: 'about', l: 'About' }, { p: 'careers', l: 'Careers' }, { p: 'blog', l: 'Blog' }, { p: 'partners', l: 'Partners' }, { p: 'contact', l: 'Contact' }].map(i => <button key={i.p} className="link-btn" onClick={() => setPage(i.p as Page)} style={{ display: 'block', color: 'rgba(255,255,255,0.25)', fontSize: '0.7rem', background: 'none', border: 'none', cursor: 'pointer', padding: '0.1rem 0' }}>{i.l}</button>)}
                    </div>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: '0.75rem', marginBottom: '0.4rem', color: 'rgba(255,255,255,0.5)' }}>Legal</div>
                        {[{ p: 'terms', l: 'Terms' }, { p: 'privacy', l: 'Privacy' }, { p: 'aup', l: 'Acceptable Use' }, { p: 'sla', l: 'SLA' }, { p: 'compliance', l: 'Compliance' }].map(i => <button key={i.p} className="link-btn" onClick={() => setPage(i.p as Page)} style={{ display: 'block', color: 'rgba(255,255,255,0.25)', fontSize: '0.7rem', background: 'none', border: 'none', cursor: 'pointer', padding: '0.1rem 0' }}>{i.l}</button>)}
                    </div>
                </div>
                <p style={{ textAlign: 'center' }}>© 2026 Pump Me. Show up. Click. Feel the speed.</p>
            </footer>

            <AIChatWidget />
        </div>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}
