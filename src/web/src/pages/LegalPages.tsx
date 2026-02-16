/**
 * Legal Pages — TOS, Privacy Policy, AUP rendered from markdown docs
 * FEAT-004, FEAT-005, FEAT-006
 */

import './DocsPage.css';

interface Props {
    onBack: () => void;
}

const LEGAL_PAGES = {
    tos: {
        title: 'Terms of Service',
        lastUpdated: '2026-02-01',
        sections: [
            { heading: '1. Acceptance of Terms', content: 'By accessing or using the Pump Me platform ("Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.' },
            { heading: '2. Description of Service', content: 'Pump Me provides on-demand GPU compute resources for AI inference, training, and related workloads. Users can rent GPU time via pay-per-minute billing or subscription plans.' },
            { heading: '3. Account Registration', content: 'You must provide accurate information when creating an account. You are responsible for maintaining the confidentiality of your credentials. You must be at least 18 years old to use this Service.' },
            { heading: '4. Billing & Payments', content: 'GPU compute is billed per minute of active use. Prepaid credits are non-refundable except as required by law. Subscription fees are billed monthly and auto-renew unless cancelled.' },
            { heading: '5. Acceptable Use', content: 'You agree not to use the Service for any illegal, harmful, or prohibited activities. See our Acceptable Use Policy for full details. We reserve the right to suspend or terminate accounts that violate these terms.' },
            { heading: '6. Intellectual Property', content: 'You retain all rights to content you create using the Service. We claim no ownership over your models, data, or outputs. Open-source models are subject to their respective licenses.' },
            { heading: '7. Limitation of Liability', content: 'The Service is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages. Our total liability is limited to the amount you paid in the 12 months prior.' },
            { heading: '8. Data & Privacy', content: 'We collect and process data as described in our Privacy Policy. GPU sessions may be monitored for abuse prevention. We do not sell your personal data.' },
            { heading: '9. Termination', content: 'Either party may terminate the agreement at any time. Upon termination, your data will be retained for 30 days, then deleted. Active sessions will be terminated and billed for time used.' },
            { heading: '10. Governing Law', content: 'These terms are governed by the laws of the State of Delaware, USA. Disputes will be resolved through binding arbitration.' },
        ],
    },
    privacy: {
        title: 'Privacy Policy',
        lastUpdated: '2026-02-01',
        sections: [
            { heading: '1. Information We Collect', content: 'We collect: account information (name, email, password hash), billing information (processed by Stripe — we never store full card numbers), usage data (session history, GPU metrics), and technical data (IP address, browser type, device info).' },
            { heading: '2. How We Use Your Information', content: 'To provide and maintain the Service, process payments, send service notifications, improve our platform, detect and prevent fraud, and comply with legal obligations.' },
            { heading: '3. Data Sharing', content: 'We share data with: Stripe (payment processing), GPU providers (Vast.ai, RunPod — only technical metadata needed for provisioning), analytics providers (aggregated, non-PII only). We never sell your personal data.' },
            { heading: '4. Data Retention', content: 'Account data: retained until account deletion + 30 days. Session data: retained for 90 days after session end. Billing data: retained for 7 years (tax compliance). Audit logs: retained for 1 year.' },
            { heading: '5. Your Rights (GDPR/CCPA)', content: 'You have the right to: access your data, request data export, request data deletion, opt out of marketing, lodge a complaint with a supervisory authority. Exercise these rights via Settings → Account → Data Export/Delete.' },
            { heading: '6. Security', content: 'We implement industry-standard security measures: bcrypt password hashing, JWT with short expiry, encrypted connections (TLS), rate limiting, audit logging, and regular security reviews.' },
            { heading: '7. Cookies', content: 'We use essential cookies for authentication (httpOnly, SameSite). We do not use third-party tracking cookies. Analytics use aggregated, anonymous data only.' },
            { heading: '8. Changes to This Policy', content: 'We may update this policy from time to time. We will notify you of material changes via email or in-app notification. Continued use constitutes acceptance of updated terms.' },
            { heading: '9. Contact', content: 'For privacy inquiries, contact privacy@pumpme.cloud or use the in-app support chat.' },
        ],
    },
    aup: {
        title: 'Acceptable Use Policy',
        lastUpdated: '2026-02-01',
        sections: [
            { heading: '1. Prohibited Activities', content: 'You may not use the Service for: cryptocurrency mining, DDoS attacks or network abuse, generating CSAM or illegal content, unauthorized access to systems, spam or phishing, circumventing usage limits, reselling compute without a reseller agreement.' },
            { heading: '2. Content Guidelines', content: 'AI-generated content must comply with applicable laws. You are responsible for ensuring your use of AI models complies with their respective licenses. Content that promotes violence, hate speech, or discrimination is prohibited.' },
            { heading: '3. Resource Limits', content: 'Fair use limits apply to prevent resource hogging. Burst sessions: max 24 hours continuous. VPN sessions: subject to plan limits. API rate limits are enforced per API key and per user.' },
            { heading: '4. Security Requirements', content: 'You must: keep API keys secure and rotate them regularly, report security vulnerabilities responsibly, not attempt to access other users\' data or sessions, use strong passwords and enable 2FA when available.' },
            { heading: '5. Enforcement', content: 'Violations may result in: warning notification, temporary account suspension (7 days), permanent account ban, reporting to law enforcement (for illegal activity). We reserve the right to terminate sessions immediately if they pose a risk to our infrastructure.' },
            { heading: '6. Reporting', content: 'Report abuse to abuse@pumpme.cloud or use the in-app reporting feature. Reports are reviewed within 24 hours.' },
        ],
    },
};

export function TermsPage({ onBack }: Props) {
    return <LegalPage page="tos" onBack={onBack} />;
}

export function PrivacyPage({ onBack }: Props) {
    return <LegalPage page="privacy" onBack={onBack} />;
}

export function AUPPage({ onBack }: Props) {
    return <LegalPage page="aup" onBack={onBack} />;
}

function LegalPage({ page, onBack }: { page: keyof typeof LEGAL_PAGES; onBack: () => void }) {
    const data = LEGAL_PAGES[page];

    return (
        <div className="docs-page">
            <button className="link-btn" onClick={onBack}>← Back</button>
            <h1>{data.title}</h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginBottom: '2rem' }}>
                Last updated: {data.lastUpdated}
            </p>

            {data.sections.map((s, i) => (
                <div key={i} className="docs-group">
                    <h2>{s.heading}</h2>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                        {s.content}
                    </p>
                </div>
            ))}

            <div style={{ marginTop: '3rem', padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', textAlign: 'center' }}>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}>
                    © 2026 Pump Me Inc. All rights reserved.
                </p>
            </div>
        </div>
    );
}
