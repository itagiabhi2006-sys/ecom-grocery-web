import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../Api';
import { ArrowRight, Package } from 'lucide-react';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    api.get('/categories')
      .then(res => setCategories(res.data || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = categories.filter(cat =>
    cat.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ background: '#f9fafb', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px' }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#111827', margin: 0 }}>
            Shop by Category
          </h1>
          <p style={{ color: '#6b7280', fontSize: 13, margin: '6px 0 0' }}>
            Browse products by your favorite categories
          </p>
        </div>

        {/* Search Bar */}
        <div style={{ marginBottom: 32 }}>
          <input
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              maxWidth: 400,
              padding: '10px 16px',
              border: '1px solid #e5e7eb',
              borderRadius: 10,
              fontSize: 13,
              outline: 'none',
              background: '#fff',
            }}
            onFocus={(e) => e.target.style.borderColor = '#1e3a8a'}
            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
          />
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px 20px' }}>
            <svg style={{ width: 32, height: 32, animation: 'spin 0.8s linear infinite' }} viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#1e3a8a" strokeWidth="4" strokeOpacity="0.25" />
              <path d="M4 12a8 8 0 018-8v8H4z" fill="#1e3a8a" stroke="none" />
            </svg>
          </div>
        )}

        {/* Categories Grid */}
        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 12, border: '1px solid #f0f0f0' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111827', marginBottom: 6 }}>No categories found</h3>
            <p style={{ fontSize: 12, color: '#6b7280' }}>Try searching with different keywords</p>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '20px',
          }}>
            {filtered.map((cat) => (
              <div
                key={cat.id}
                onClick={() => navigate(`/category/${cat.id}`)}
                style={{
                  background: '#fff',
                  borderRadius: 12,
                  border: '1px solid #f0f0f0',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'
                  e.currentTarget.style.borderColor = '#1e3a8a'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.borderColor = '#f0f0f0'
                }}
              >
                {/* Category Image */}
                <div style={{
                  height: 140,
                  background: '#f9fafb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 20,
                }}>
                  {cat.imageURL ? (
                    <img
                      src={cat.imageURL}
                      alt={cat.name}
                      style={{
                        maxHeight: '100%',
                        maxWidth: '100%',
                        objectFit: 'contain',
                      }}
                    />
                  ) : (
                    <Package size={48} color="#9ca3af" />
                  )}
                </div>

                {/* Category Info */}
                <div style={{ padding: '16px' }}>
                  <h3 style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: '#111827',
                    margin: '0 0 4px',
                    textAlign: 'center',
                  }}>
                    {cat.name}
                  </h3>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    marginTop: 8,
                    color: '#1e3a8a',
                    fontSize: 12,
                    fontWeight: 500,
                  }}>
                    <span>Shop Now</span>
                    <ArrowRight size={12} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results Count */}
        {!loading && filtered.length > 0 && (
          <div style={{
            textAlign: 'center',
            marginTop: 32,
            padding: '16px',
            color: '#6b7280',
            fontSize: 12,
            fontWeight: 500,
          }}>
            Showing <strong style={{ color: '#1e3a8a' }}>{filtered.length}</strong> categories
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}