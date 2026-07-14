import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../Api';
import {
  Sparkles, Tag, TrendingUp,
  Star, Zap, Gift, ArrowLeft, Home
} from 'lucide-react';

// ── Badge helper ─────────────────────────────────────────────────────────────
function OfferBadge({ product }) {
  if (product.dealOfWeek) return (
    <div style={{
      position: 'absolute', top: 12, left: 12, zIndex: 10,
      background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
      color: '#fff', fontWeight: 800, fontSize: 9,
      borderRadius: 6, padding: '3px 8px', letterSpacing: 0.5,
      display: 'flex', alignItems: 'center', gap: 4,
    }}>
      <Zap size={9} fill="#fff" /> DEAL
    </div>
  );
  if (product.festivalOffer) return (
    <div style={{
      position: 'absolute', top: 12, left: 12, zIndex: 10,
      background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
      color: '#fff', fontWeight: 800, fontSize: 9,
      borderRadius: 6, padding: '3px 8px', letterSpacing: 0.5,
      display: 'flex', alignItems: 'center', gap: 4,
    }}>
      <Gift size={9} fill="#fff" /> FESTIVAL
    </div>
  );
  if (product.discountPercent > 0) return (
    <div style={{
      position: 'absolute', top: 12, left: 12, zIndex: 10,
      background: '#1e3a8a', color: '#fff',
      fontWeight: 800, fontSize: 10, borderRadius: 6,
      padding: '3px 8px',
    }}>
      -{product.discountPercent}%
    </div>
  );
  return null;
}

// ── Product Card ──────────────────────────────────────────────────────────────
function RecommendedCard({ product, index }) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const saving = product.price - product.discountFinalPrice;

  return (
    <div
      onClick={() => navigate(`/product/${product.id}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: hovered ? '#1e3a8a' : '#f0f0f0',
        boxShadow: hovered
          ? '0 8px 24px rgba(30,58,138,0.12)'
          : '0 2px 8px rgba(0,0,0,0.04)',
        cursor: 'pointer',
        transition: 'all 0.25s ease',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        position: 'relative',
      }}
    >
      <OfferBadge product={product} />

      {/* Stock warning */}
      {product.stock <= 5 && (
        <div style={{
          position: 'absolute', top: 12, right: 12, zIndex: 10,
          background: '#fef2f2', color: '#dc2626',
          fontSize: 9, fontWeight: 700, borderRadius: 6,
          padding: '2px 6px', border: '1px solid #fee2e2',
        }}>
          Only {product.stock} left
        </div>
      )}

      {/* Image area */}
      <div style={{
        height: 180,
        background: '#f9fafb',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
        transition: 'background 0.3s',
      }}>
        <img
          src={product.imageURL}
          alt={product.title}
          loading="lazy"
          style={{
            maxHeight: '100%', maxWidth: '100%', objectFit: 'contain',
            transition: 'transform 0.25s',
            transform: hovered ? 'scale(1.05)' : 'scale(1)',
          }}
        />
      </div>

      {/* Info */}
      <div style={{ padding: '14px 16px 16px' }}>
        <div style={{
          fontWeight: 700, fontSize: 13, color: '#111827',
          marginBottom: 4, lineHeight: 1.35,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {product.title}
        </div>
        <div style={{
          fontSize: 11, color: '#6b7280', fontWeight: 500,
          marginBottom: 10, lineHeight: 1.4,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          overflow: 'hidden', minHeight: 30,
        }}>
          {product.description}
        </div>

        {/* Price row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 18, fontWeight: 800, color: '#1e3a8a' }}>
            ₹{product.discountFinalPrice}
          </span>
          {product.discountPercent > 0 && (
            <span style={{ fontSize: 11, fontWeight: 500, color: '#9ca3af', textDecoration: 'line-through' }}>
              ₹{product.price}
            </span>
          )}
          {saving > 0 && (
            <span style={{
              fontSize: 9, fontWeight: 700, color: '#1e3a8a',
              background: '#eff6ff', borderRadius: 12, padding: '2px 6px',
            }}>
              Save ₹{saving.toFixed(0)}
            </span>
          )}
        </div>

        {/* Offer tag strip */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {product.dealOfWeek && (
            <span style={{ fontSize: 8, fontWeight: 700, color: '#f59e0b', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: '2px 8px' }}>
              ⚡ DEAL
            </span>
          )}
          {product.festivalOffer && (
            <span style={{ fontSize: 8, fontWeight: 700, color: '#8b5cf6', background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: 12, padding: '2px 8px' }}>
              🎉 FESTIVAL
            </span>
          )}
          {product.discountPercent > 0 && !product.dealOfWeek && !product.festivalOffer && (
            <span style={{ fontSize: 8, fontWeight: 700, color: '#1e3a8a', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, padding: '2px 8px' }}>
              🏷️ {product.discountPercent}% OFF
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Skeleton Card ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', border: '1px solid #f0f0f0' }}>
      <div style={{ height: 180, background: 'linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
      <div style={{ padding: '14px 16px 16px' }}>
        <div style={{ height: 14, background: '#f3f4f6', borderRadius: 6, marginBottom: 6, width: '70%' }} />
        <div style={{ height: 10, background: '#f9fafb', borderRadius: 4, marginBottom: 10, width: '90%' }} />
        <div style={{ height: 18, background: '#f3f4f6', borderRadius: 6, width: '40%' }} />
      </div>
    </div>
  );
}

// ── Stats Bar ─────────────────────────────────────────────────────────────────
function StatsBar({ products }) {
  const totalDeals = products.filter(p => p.dealOfWeek || p.festivalOffer || p.discountPercent > 0).length;
  const maxSaving = Math.max(...products.map(p => p.price - p.discountFinalPrice));
  const avgDiscount = products.length
    ? (products.reduce((s, p) => s + (p.discountPercent || 0), 0) / products.length).toFixed(0)
    : 0;

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
      gap: 12, marginBottom: 32,
    }}>
      {[
        { icon: <Tag size={16} color="#1e3a8a" />, val: `${totalDeals}`, label: 'Active Offers', bg: '#eff6ff', border: '#bfdbfe', valColor: '#1e3a8a' },
        { icon: <TrendingUp size={16} color="#f59e0b" />, val: `₹${maxSaving.toFixed(0)}`, label: 'Max Saving', bg: '#fffbeb', border: '#fde68a', valColor: '#d97706' },
        { icon: <Star size={16} color="#8b5cf6" />, val: `${avgDiscount}%`, label: 'Avg Discount', bg: '#faf5ff', border: '#e9d5ff', valColor: '#8b5cf6' },
      ].map((stat, i) => (
        <div key={i} style={{
          background: stat.bg, borderRadius: 10,
          border: `1px solid ${stat.border}`,
          padding: '12px 14px',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {stat.icon}
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: stat.valColor, lineHeight: 1 }}>{stat.val}</div>
            <div style={{ fontSize: 10, color: '#6b7280', fontWeight: 600, marginTop: 2 }}>{stat.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Filter Tabs ───────────────────────────────────────────────────────────────
const FILTERS = [
  { key: 'all', label: 'All', icon: '✨' },
  { key: 'dealOfWeek', label: 'Deal', icon: '⚡' },
  { key: 'festivalOffer', label: 'Festival', icon: '🎉' },
  { key: 'discount', label: 'Sale', icon: '🏷️' },
];

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function RecommendedForYou() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (!user) return;
    api.get(`/track/${user.id}`)
      .then(r => setProducts(r.data))
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, [user]);

  const filtered = products.filter(p => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'dealOfWeek') return p.dealOfWeek;
    if (activeFilter === 'festivalOffer') return p.festivalOffer;
    if (activeFilter === 'discount') return p.discountPercent > 0;
    return true;
  });

  return (
    <div style={{
      background: '#f9fafb', minHeight: '100vh',
      maxWidth: 1200, margin: '0 auto', padding: '32px 20px 64px',
    }}>

      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .rec-card-anim { animation: fadeUp 0.4s ease both; }
      `}</style>

      {/* ── PAGE TITLE ───────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#9ca3af', marginBottom: 6 }}>
          JUST FOR YOU
        </div>
        <h1 style={{
          fontSize: 28, fontWeight: 800, color: '#111827',
          margin: '0 0 6px',
        }}>
          ✨ Recommended For You
        </h1>
        <p style={{ color: '#6b7280', fontSize: 13, fontWeight: 500, margin: 0 }}>
          Handpicked from your browsing history
        </p>
      </div>

      {/* ── STATS ────────────────────────────────────────────────────────── */}
      {!loading && products.length > 0 && <StatsBar products={products} />}

      {/* ── FILTER TABS ──────────────────────────────────────────────────── */}
      {!loading && products.length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
          {FILTERS.map(f => {
            const count = f.key === 'all' ? products.length
              : f.key === 'dealOfWeek' ? products.filter(p => p.dealOfWeek).length
              : f.key === 'festivalOffer' ? products.filter(p => p.festivalOffer).length
              : products.filter(p => p.discountPercent > 0).length;

            return (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 14px', borderRadius: 20,
                  border: '1px solid',
                  borderColor: activeFilter === f.key ? '#1e3a8a' : '#e5e7eb',
                  background: activeFilter === f.key ? '#1e3a8a' : '#fff',
                  color: activeFilter === f.key ? '#fff' : '#6b7280',
                  fontWeight: 600, fontSize: 12, cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <span>{f.icon}</span> {f.label}
                <span style={{
                  background: activeFilter === f.key ? 'rgba(255,255,255,0.25)' : '#f3f4f6',
                  color: activeFilter === f.key ? '#fff' : '#6b7280',
                  borderRadius: 12, fontSize: 9, fontWeight: 700,
                  padding: '1px 6px',
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* ── LOADING SKELETONS ─────────────────────────────────────────────── */}
      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
          {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* ── EMPTY STATE ───────────────────────────────────────────────────── */}
      {!loading && products.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '60px 20px',
          background: '#fff', borderRadius: 12,
          border: '1px solid #f0f0f0',
        }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🛍️</div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 8 }}>
            No recommendations yet
          </h2>
          <p style={{ color: '#6b7280', fontSize: 13, marginBottom: 20, maxWidth: 340, margin: '0 auto 20px' }}>
            Start browsing products and we'll suggest personalized deals for you!
          </p>
          <button
            onClick={() => navigate('/products')}
            style={{
              background: '#1e3a8a', color: '#fff',
              border: 'none', borderRadius: 8,
              padding: '8px 20px', fontWeight: 600,
              fontSize: 12, cursor: 'pointer',
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#1e40af'}
            onMouseOut={(e) => e.currentTarget.style.background = '#1e3a8a'}
          >
            Browse Products
          </button>
        </div>
      )}

      {/* ── FILTERED EMPTY ────────────────────────────────────────────────── */}
      {!loading && products.length > 0 && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 20px', background: '#fff', borderRadius: 12, border: '1px solid #f0f0f0' }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🔍</div>
          <p style={{ color: '#6b7280', fontSize: 13, fontWeight: 500, marginBottom: 12 }}>
            No products match this filter
          </p>
          <button onClick={() => setActiveFilter('all')} style={{
            background: 'transparent', border: 'none',
            color: '#1e3a8a', fontWeight: 600, cursor: 'pointer', fontSize: 12
          }}>
            Show All →
          </button>
        </div>
      )}

      {/* ── PRODUCT GRID ─────────────────────────────────────────────────── */}
      {!loading && filtered.length > 0 && (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '24px 20px',
          }}>
            {filtered.map((product, i) => (
              <div key={product.id} className="rec-card-anim" style={{ animationDelay: `${i * 60}ms` }}>
                <RecommendedCard product={product} index={i} />
              </div>
            ))}
          </div>

          {/* Count footer */}
          <div style={{
            textAlign: 'center', marginTop: 32, padding: '16px',
            color: '#6b7280', fontSize: 12, fontWeight: 500,
          }}>
            Showing <strong style={{ color: '#1e3a8a' }}>{filtered.length}</strong> recommended products
            {activeFilter !== 'all' && ` · ${FILTERS.find(f=>f.key===activeFilter)?.label}`}
          </div>
        </>
      )}
    </div>
  );
}