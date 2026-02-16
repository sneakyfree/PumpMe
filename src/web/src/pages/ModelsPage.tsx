/**
 * Model Browser — browse, filter, and launch 50+ AI models
 */

import { useState, useEffect, useMemo } from 'react';
import api from '../lib/api';
import './ModelsPage.css';

interface Model {
    slug: string;
    name: string;
    provider: string;
    parameterSize: string;
    contextLength: number;
    minVram: number;
    category: string;
    tags: string[];
    isPreloaded?: boolean;
}

const CATEGORY_ICONS: Record<string, string> = {
    chat: '💬',
    code: '💻',
    image: '🎨',
    video: '🎬',
    audio: '🎵',
    embedding: '🔍',
    multimodal: '👁️',
    '3d': '🧊',
};

interface Props {
    onNavigate: (page: string) => void;
}

export default function ModelsPage({ onNavigate }: Props) {
    const [models, setModels] = useState<Model[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    useEffect(() => {
        async function load() {
            try {
                const res = await api.get<{ models: Model[] }>('/models');
                if (res.success && res.data) setModels(res.data.models);
            } catch { /* ignore */ }
            setLoading(false);
        }
        load();
    }, []);

    const categories = useMemo(() => {
        const cats = [...new Set(models.map(m => m.category))];
        return ['all', ...cats];
    }, [models]);

    const filtered = useMemo(() => {
        let result = models;
        if (selectedCategory !== 'all') {
            result = result.filter(m => m.category === selectedCategory);
        }
        if (search) {
            const s = search.toLowerCase();
            result = result.filter(m =>
                m.name.toLowerCase().includes(s) ||
                m.provider.toLowerCase().includes(s) ||
                m.tags.some(t => t.includes(s))
            );
        }
        return result;
    }, [models, selectedCategory, search]);

    function handleUseModel(slug: string) {
        // Navigate to pump wizard with model pre-selected (store in sessionStorage)
        sessionStorage.setItem('preselectedModel', slug);
        onNavigate('pump');
    }

    return (
        <div className="models-page">
            <div className="models-header">
                <h1>AI Model Library</h1>
                <p style={{ color: 'rgba(255,255,255,0.5)' }}>
                    {models.length} models across {categories.length - 1} categories — click to launch
                </p>
            </div>

            {/* Search & Filters */}
            <div className="models-toolbar">
                <input
                    type="text"
                    className="models-search"
                    placeholder="Search models, providers, tags..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <div className="category-pills">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            className={`cat-pill ${selectedCategory === cat ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(cat)}
                        >
                            {cat !== 'all' && <span className="cat-icon">{CATEGORY_ICONS[cat] || '📦'}</span>}
                            <span>{cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Model Grid */}
            {loading ? (
                <p style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '3rem' }}>Loading models...</p>
            ) : filtered.length === 0 ? (
                <p style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '3rem' }}>No models match your search.</p>
            ) : (
                <div className="models-grid">
                    {filtered.map(model => (
                        <div key={model.slug} className="model-card-lg">
                            <div className="model-card-header">
                                <span className="model-icon">{CATEGORY_ICONS[model.category] || '📦'}</span>
                                {model.isPreloaded && <span className="preloaded-badge">⚡ Preloaded</span>}
                            </div>
                            <h3 className="model-title">{model.name}</h3>
                            <p className="model-provider">{model.provider}</p>
                            <div className="model-specs">
                                <span>{model.parameterSize}</span>
                                <span>·</span>
                                <span>{model.minVram}GB VRAM</span>
                                {model.contextLength > 0 && (
                                    <>
                                        <span>·</span>
                                        <span>{(model.contextLength / 1000).toFixed(0)}K ctx</span>
                                    </>
                                )}
                            </div>
                            <div className="model-tags">
                                {model.tags.slice(0, 3).map(tag => (
                                    <span key={tag} className="tag">{tag}</span>
                                ))}
                            </div>
                            <button className="btn btn-primary btn-sm model-use-btn" onClick={() => handleUseModel(model.slug)}>
                                Use Model →
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
