import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../Api';
import { Sparkles, ArrowRight } from 'lucide-react';
import ProductCard from '../components/ProductCard';

export default function RecommendedSection() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    api.get(`/track/${user.id}`)
      .then(r => setProducts(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  if (!user || loading || products.length === 0) return null;

  return (
    <section style={{ padding: '0 0 56px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Sparkles size={20} color="#16a34a" />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#94a3b8' }}>
              JUST FOR YOU
            </span>
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', fontFamily: "'Playfair Display',Georgia,serif", margin: 0 }}>
            ✨ Recommended For You
          </h2>
          <p style={{ fontSize: 13, color: '#94a3b8', fontWeight: 500, marginTop: 5 }}>
            Based on your browsing — all with active offers
          </p>
        </div>

        <button
          onClick={() => navigate('/recommended')}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: '#0f172a', color: '#fff',
            border: 'none', borderRadius: 12,
            padding: '10px 20px', fontWeight: 700, fontSize: 13,
            cursor: 'pointer', transition: 'background 0.2s',
            whiteSpace: 'nowrap',
          }}
          onMouseOver={e => e.currentTarget.style.background = '#1e293b'}
          onMouseOut={e => e.currentTarget.style.background = '#0f172a'}
        >
          See All <ArrowRight size={14} />
        </button>
      </div>

      {/* Grid — 3 columns, max 6 products */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
        {products.slice(0, 6).map(p => (
          <ProductCard key={p.id} p={p} />
        ))}
      </div>

    </section>
  );
}