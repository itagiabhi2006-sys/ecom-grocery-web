import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import api from '../Api';
import { ArrowLeft } from 'lucide-react';

export default function CategoryProductsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadCategoryProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const [productsRes, categoryRes] = await Promise.all([
        api.get(`/categories/${id}/products`),
        api.get(`/categories/${id}/products`)
      ]);
      setProducts(productsRes.data || []);
      setCategory(categoryRes.data);
    } catch (err) {
      console.error("Error loading category products:", err);
      setError(err.response?.data?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (id) {
      loadCategoryProducts();
    }
  }, [id]);

  return (
    <div style={{ background: '#f9fafb', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px' }}>

        {/* Back Button */}
        <button
          onClick={() => navigate('/categories')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            marginBottom: 24,
            background: 'none',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 500,
            color: '#6b7280',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = '#f9fafb';
            e.currentTarget.style.borderColor = '#1e3a8a';
            e.currentTarget.style.color = '#1e3a8a';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'none';
            e.currentTarget.style.borderColor = '#e5e7eb';
            e.currentTarget.style.color = '#6b7280';
          }}
        >
          <ArrowLeft size={14} />
          Back to Categories
        </button>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          {category && (
            <>
              <div style={{
                display: 'inline-block',
                background: '#eff6ff',
                color: '#1e3a8a',
                border: '1px solid #bfdbfe',
                borderRadius: 20,
                padding: '4px 12px',
                fontSize: 11,
                fontWeight: 600,
                marginBottom: 12,
              }}>
                Category
              </div>
              <h1 style={{
                fontSize: 28,
                fontWeight: 800,
                color: '#111827',
                margin: '0 0 6px',
              }}>
                {category.name || category.title || 'Products'}
              </h1>
              <p style={{
                color: '#6b7280',
                fontSize: 13,
                margin: 0,
              }}>
                {products.length} {products.length === 1 ? 'product' : 'products'} available
              </p>
            </>
          )}
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

        {/* Error State */}
        {!loading && error && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: '#fff',
            borderRadius: 12,
            border: '1px solid #fee2e2',
          }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#dc2626', marginBottom: 8 }}>Error Loading Products</h3>
            <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 20 }}>{error}</p>
            <button
              onClick={loadCategoryProducts}
              style={{
                padding: '6px 16px',
                background: '#1e3a8a',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 500,
                cursor: 'pointer',
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#1e40af'}
              onMouseOut={(e) => e.currentTarget.style.background = '#1e3a8a'}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && products.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: '#fff',
            borderRadius: 12,
            border: '1px solid #f0f0f0',
          }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111827', marginBottom: 6 }}>No products found</h3>
            <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 20 }}>
              This category doesn't have any products yet.
            </p>
            <button
              onClick={() => navigate('/categories')}
              style={{
                padding: '6px 16px',
                background: '#1e3a8a',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 500,
                cursor: 'pointer',
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#1e40af'}
              onMouseOut={(e) => e.currentTarget.style.background = '#1e3a8a'}
            >
              Browse Categories
            </button>
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && products.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '24px 20px',
          }}>
            {products.map((product) => (
              <ProductCard key={product.id} p={product} />
            ))}
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