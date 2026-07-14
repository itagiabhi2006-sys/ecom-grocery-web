import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../Api';
import ProductCard from '../components/ProductCard';
import { Eye, ArrowRight } from 'lucide-react';

export default function FrequentlyViewedSection() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    
    if (!user) return;
    api.get(`/track/frequently-viewed/${user.id}`)
      .then(r => setProducts(r.data))
      .catch(() => {});
  }, [user]);

  // Don't render if not logged in or no data
  if (!user || products.length === 0) return null;

  return (
    <section style={{ padding: '0 0 56px' }}>

      {/* Header row — matches your SectionHeader pattern exactly */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Eye size={20} color="#3b82f6" />
            <span style={{
              fontSize: 11, fontWeight: 700, letterSpacing: 2,
              textTransform: 'uppercase', color: '#94a3b8',
            }}>
              RECENTLY VIEWED
            </span>
          </div>
          <h2 style={{
            fontSize: 28, fontWeight: 900, color: '#0f172a',
            fontFamily: "'Playfair Display', Georgia, serif",
            margin: 0,
          }}>
            👁️ Frequently Viewed
          </h2>
          <p style={{ fontSize: 14, color: '#94a3b8', fontWeight: 500, marginTop: 6 }}>
            Products you keep coming back to
          </p>
        </div>
      </div>

      {/* 3-column grid — same as every other product section in Home */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
        {products.slice(0, 6).map(p => (
          <ProductCard key={p.id} p={p} />
        ))}
      </div>

    </section>
  );
}