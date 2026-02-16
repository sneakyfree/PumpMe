import { useState, useMemo } from 'react';
import './FAQPage.css';

interface FAQ {
    question: string;
    answer: string;
}

interface FAQCategory {
    id: string;
    title: string;
    icon: string;
    faqs: FAQ[];
}

const FAQ_CATEGORIES: FAQCategory[] = [
    {
        id: 'getting-started',
        title: 'Getting Started',
        icon: '🚀',
        faqs: [
            { question: 'What is Pump Me?', answer: 'Pump Me is the most normie-friendly GPU compute platform. Rent H100s, A100s, RTX 5090s without touching a terminal or knowing Docker.' },
            { question: 'Do I need technical experience?', answer: 'No! We\'ve eliminated terminal commands, Docker configs, and CUDA setup. Click a button, pick a model, and you\'re live.' },
            { question: 'How fast can I get started?', answer: 'Under 60 seconds. Select your GPU tier, choose a pre-loaded model, and you\'re running inference immediately.' },
            { question: 'Is there a free trial?', answer: 'Yes! 5 minutes of Beast Mode free. Feel H100-class speed before committing.' },
        ],
    },
    {
        id: 'gpus',
        title: 'GPU Hardware',
        icon: '🖥️',
        faqs: [
            { question: 'What GPUs are available?', answer: 'We offer RTX 4090, RTX 5090, A100, H100, and B300 clusters. From hobby projects to enterprise training.' },
            { question: 'What\'s the difference between tiers?', answer: 'RTX 4090/5090 for inference. A100 for medium training. H100/B300 for maximum throughput and large model training.' },
            { question: 'How fast is local vs cloud API?', answer: 'Local GPU is 10-30x faster than cloud APIs. You feel the difference immediately—no more "sipping tokens through a straw."' },
            { question: 'Can I rent multiple GPUs?', answer: 'Yes! Beast Mode offers 8x H100 clusters for massive parallelization.' },
        ],
    },
    {
        id: 'pricing',
        title: 'Pricing & Billing',
        icon: '💰',
        faqs: [
            { question: 'How does pricing work?', answer: 'Pay per minute, not per hour. Use 47 minutes? Pay for 47 minutes. No hour-block anxiety.' },
            { question: 'What does Pump Burst cost?', answer: 'RTX 4090 starts at $0.59/hr. H100 8x Beast Mode is $3.99/hr. Ten to 100x cheaper than cloud APIs.' },
            { question: 'What\'s Pump VPN?', answer: 'Monthly subscription ($49/mo) with persistent virtual lab, included hours, and saved environments.' },
            { question: 'Can I use prepaid credits?', answer: 'Yes! Buy credits upfront and enable auto-topup to never run out mid-session.' },
        ],
    },
    {
        id: 'models',
        title: 'AI Models',
        icon: '🧠',
        faqs: [
            { question: 'Which models are pre-loaded?', answer: 'Llama 3.3-70B, Qwen 2.5-72B, DeepSeek-V3, Mistral Large, and 50+ more. No download wait—instant access.' },
            { question: 'Can I use my own models?', answer: 'Yes! Upload custom models or fine-tuned checkpoints to your Pump VPN or Pump Home storage.' },
            { question: 'Do you support image/video generation?', answer: 'Yes! Stable Diffusion XL, FLUX, Runway, and cinematic rendering models for creative workflows.' },
            { question: 'Are models updated regularly?', answer: 'We add new models within 48 hours of major releases. Always access the latest capabilities.' },
        ],
    },
    {
        id: 'security',
        title: 'Security & Privacy',
        icon: '🔒',
        faqs: [
            { question: 'Is my data private?', answer: 'Absolutely. Your data never leaves your private session. Models run locally on your rented GPU.' },
            { question: 'Do you train on my data?', answer: 'Never. We don\'t access, store, or train on any of your inputs or outputs. Your work is yours.' },
            { question: 'What about enterprise compliance?', answer: 'ISO 27001 compliant. GDPR-ready. SOC 2 Type II in progress for enterprise customers.' },
            { question: 'How are sessions isolated?', answer: 'Each session runs in an isolated container with dedicated GPU resources. No cross-contamination.' },
        ],
    },
    {
        id: 'use-cases',
        title: 'Use Cases',
        icon: '💡',
        faqs: [
            { question: 'Can I render a film?', answer: 'Yes! Solo filmmakers have rendered 2000+ scenes in hours instead of months. Cinematic AI models included.' },
            { question: 'What about coding assistants?', answer: 'Run local Copilot alternatives like DeepSeek Coder, CodeLlama, or fine-tuned models with zero API latency.' },
            { question: 'Is this good for vibe coding?', answer: 'Perfect. Pump through 47 platform builds in 4 hours. MVP in a day instead of a quarter.' },
            { question: 'Can agencies use this for clients?', answer: 'Pump Home supports per-client isolated environments—white-label AI for agencies.' },
        ],
    },
];

interface FAQPageProps {
    onBack?: () => void;
}

export default function FAQPage({ onBack }: FAQPageProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [openItems, setOpenItems] = useState<Set<string>>(new Set());

    const toggleItem = (id: string) => {
        setOpenItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            return newSet;
        });
    };

    const filteredCategories = useMemo(() => {
        if (!searchQuery.trim()) return FAQ_CATEGORIES;
        const query = searchQuery.toLowerCase();
        return FAQ_CATEGORIES.map(cat => ({
            ...cat,
            faqs: cat.faqs.filter(f => f.question.toLowerCase().includes(query) || f.answer.toLowerCase().includes(query)),
        })).filter(cat => cat.faqs.length > 0);
    }, [searchQuery]);

    const count = filteredCategories.reduce((a, c) => a + c.faqs.length, 0);

    return (
        <div className="faq-page">
            <div className="faq-container">
                {onBack && (
                    <button className="faq-back" onClick={onBack}>← Back</button>
                )}
                <header className="faq-header">
                    <h1>Frequently Asked Questions</h1>
                    <p>Everything you need to know about Pump Me</p>
                </header>

                <div className="faq-search">
                    <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search questions..." />
                    {searchQuery && <span className="faq-count">{count} results</span>}
                </div>

                <div className="faq-content">
                    {count === 0 ? (
                        <div className="faq-empty"><h3>No questions found</h3><p>Try a different search term.</p></div>
                    ) : (
                        filteredCategories.map(cat => (
                            <div key={cat.id} className="faq-category">
                                <div className="faq-category-header">
                                    <span className="faq-icon">{cat.icon}</span>
                                    <h2>{cat.title}</h2>
                                    <span className="faq-badge">{cat.faqs.length}</span>
                                </div>
                                <div className="faq-items">
                                    {cat.faqs.map((faq, i) => {
                                        const id = `${cat.id}-${i}`;
                                        const isOpen = openItems.has(id);
                                        return (
                                            <div key={i} className={`faq-item ${isOpen ? 'open' : ''}`}>
                                                <button className="faq-question" onClick={() => toggleItem(id)}>
                                                    <span>{faq.question}</span>
                                                    <span className="faq-chevron">{isOpen ? '▲' : '▼'}</span>
                                                </button>
                                                {isOpen && <div className="faq-answer"><p>{faq.answer}</p></div>}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
