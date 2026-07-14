import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import api from '../Api';
import ProductCard from '../components/ProductCard';
import { ShoppingCart, Zap, ArrowLeft, Package, Shield, RotateCcw, Truck, Star, ChevronRight, ChevronLeft } from 'lucide-react';

// ─── Advanced Product Slider ────────────────────────────────────────────────
function ProductSlider({ title, emoji, label, products }) {
  const [index, setIndex] = useState(0);
  const [animDir, setAnimDir] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hoveredArrow, setHoveredArrow] = useState(null);
  const PER_PAGE = 4;
  const totalPages = Math.ceil(products.length / PER_PAGE);
  const canPrev = index > 0;
  const canNext = index < totalPages - 1;

  const slide = (dir) => {
    if (isAnimating) return;
    if (dir === 'next' && !canNext) return;
    if (dir === 'prev' && !canPrev) return;
    setAnimDir(dir === 'next' ? 'left' : 'right');
    setIsAnimating(true);
    setTimeout(() => {
      setIndex(i => dir === 'next' ? i + 1 : i - 1);
      setAnimDir(null);
      setIsAnimating(false);
    }, 360);
  };

  const jumpTo = (i) => {
    if (isAnimating || i === index) return;
    setAnimDir(i > index ? 'left' : 'right');
    setIsAnimating(true);
    setTimeout(() => {
      setIndex(i);
      setAnimDir(null);
      setIsAnimating(false);
    }, 360);
  };

  const visible = products.slice(index * PER_PAGE, index * PER_PAGE + PER_PAGE);

  return (
    <section style={{ marginTop: 80 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            fontSize: 10, fontWeight: 800, letterSpacing: 3,
            textTransform: 'uppercase', color: '#94a3b8', marginBottom: 10,
          }}>
            <span style={{ display: 'inline-block', width: 28, height: 2, background: 'linear-gradient(90deg,#16a34a,#86efac)', borderRadius: 2 }} />
            {label}
            <span style={{ display: 'inline-block', width: 28, height: 2, background: 'linear-gradient(90deg,#86efac,transparent)', borderRadius: 2 }} />
          </div>
          <h2 style={{
            fontSize: 'clamp(22px,2.5vw,30px)', fontWeight: 900, color: '#0f172a',
            fontFamily: "'Playfair Display',Georgia,serif", lineHeight: 1.15, margin: 0,
          }}>
            {emoji} {title}
          </h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginRight: 4 }}>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => jumpTo(i)}
                  style={{
                    width: i === index ? 26 : 8, height: 8, borderRadius: 100, border: 'none', cursor: 'pointer',
                    background: i === index ? 'linear-gradient(90deg,#16a34a,#4ade80)' : '#e2e8f0',
                    padding: 0, transition: 'all 0.35s cubic-bezier(.4,0,.2,1)',
                    boxShadow: i === index ? '0 2px 8px rgba(22,163,74,0.4)' : 'none',
                  }}
                />
              ))}
            </div>
          )}
          <button
            onClick={() => slide('prev')}
            disabled={!canPrev || isAnimating}
            onMouseEnter={() => canPrev && setHoveredArrow('prev')}
            onMouseLeave={() => setHoveredArrow(null)}
            style={{
              width: 46, height: 46, borderRadius: '50%',
              border: `2px solid ${canPrev && hoveredArrow === 'prev' ? '#16a34a' : canPrev ? '#e2e8f0' : '#f1f5f9'}`,
              background: '#fff',
              color: canPrev ? (hoveredArrow === 'prev' ? '#16a34a' : '#0f172a') : '#cbd5e1',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: canPrev ? 'pointer' : 'not-allowed',
              boxShadow: canPrev && hoveredArrow === 'prev' ? '0 4px 16px rgba(22,163,74,0.2)' : canPrev ? '0 2px 10px rgba(0,0,0,0.07)' : 'none',
              transition: 'all 0.22s cubic-bezier(.4,0,.2,1)',
              transform: hoveredArrow === 'prev' && canPrev ? 'scale(1.08)' : 'scale(1)',
            }}
          >
            <ChevronLeft size={20} strokeWidth={2.5} />
          </button>
          <button
            onClick={() => slide('next')}
            disabled={!canNext || isAnimating}
            onMouseEnter={() => canNext && setHoveredArrow('next')}
            onMouseLeave={() => setHoveredArrow(null)}
            style={{
              width: 46, height: 46, borderRadius: '50%', border: 'none',
              background: canNext ? (hoveredArrow === 'next' ? 'linear-gradient(135deg,#15803d,#16a34a)' : 'linear-gradient(135deg,#16a34a,#15803d)') : '#f1f5f9',
              color: canNext ? '#fff' : '#cbd5e1',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: canNext ? 'pointer' : 'not-allowed',
              boxShadow: canNext ? (hoveredArrow === 'next' ? '0 6px 24px rgba(22,163,74,0.55)' : '0 4px 16px rgba(22,163,74,0.35)') : 'none',
              transition: 'all 0.22s cubic-bezier(.4,0,.2,1)',
              transform: hoveredArrow === 'next' && canNext ? 'scale(1.08)' : 'scale(1)',
            }}
          >
            <ChevronRight size={20} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 20 }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16,
          transform: isAnimating ? `translateX(${animDir === 'left' ? '-6%' : '6%'})` : 'translateX(0)',
          opacity: isAnimating ? 0 : 1,
          transition: isAnimating ? 'transform 0.36s cubic-bezier(.4,0,.2,1), opacity 0.28s ease' : 'opacity 0.28s ease',
        }}>
          {visible.map((p, i) => (
            <div
              key={`${p.id}-${index}`}
              style={{
                opacity: isAnimating ? 0 : 1,
                transform: isAnimating ? 'scale(0.96) translateY(6px)' : 'scale(1) translateY(0)',
                transition: `opacity 0.32s ${i * 0.07}s ease, transform 0.32s ${i * 0.07}s cubic-bezier(.4,0,.2,1)`,
              }}
            >
              <ProductCard p={p} />
            </div>
          ))}
          {visible.length < PER_PAGE && Array.from({ length: PER_PAGE - visible.length }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <div style={{ height: 3, background: '#f1f5f9', borderRadius: 100, overflow: 'hidden', marginBottom: 10 }}>
          <div style={{
            height: '100%', borderRadius: 100,
            background: 'linear-gradient(90deg,#16a34a,#4ade80)',
            width: `${((index + 1) / totalPages) * 100}%`,
            transition: 'width 0.45s cubic-bezier(.4,0,.2,1)',
            boxShadow: '0 0 8px rgba(22,163,74,0.5)',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, color: '#94a3b8' }}>
          <span>Showing {index * PER_PAGE + 1}–{Math.min((index + 1) * PER_PAGE, products.length)} of {products.length} items</span>
          <span>Page {index + 1} of {totalPages}</span>
        </div>
      </div>
    </section>
  );
}

// ─── Main ProductPage ────────────────────────────────────────────────────────
export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [imgZoomed, setImgZoomed] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    loadProduct();
    loadSimilar();
  }, [id]);

  const trackView = async (productId) => {
    if (!user) return;
    try {
      await api.post(`/track/view?userId=${user.id}&productId=${productId}`);
    } catch {
      // silently fail
    }
  };

  const loadProduct = async () => {
    try {
      const res = await api.get(`/products/${id}`);
      setProduct(res.data);
      loadRecommended(res.data.title);
      trackView(id);
    } catch {
      toast.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const loadSimilar = async () => {
    try {
      const res = await api.get(`/ml/similar/${id}`);
      setSimilarProducts(res.data.similar_products || []);
    } catch {
      setSimilarProducts([]);
    }
  };

  const loadRecommended = async (title) => {
    try {
      const res = await api.get(`/ml/recommend?product=${encodeURIComponent(title)}`);
      setRecommendedProducts(res.data || []);
    } catch {
      setRecommendedProducts([]);
    }
  };

  const addToCart = async () => {
    if (!user) { toast.error('Please login to add items to cart'); navigate('/login'); return; }
    if (!product) return;
    const payload = [{ products: { id: product.id }, quantity: 1, prices: product.price, user: { id: user.id, email: user.email } }];
    try {
      setAdding(true);
      await api.post(`/add-to-cart/${user.id}`, payload);
      window.dispatchEvent(new CustomEvent('cartCountChanged'));
      toast.success('Added to cart!');
      navigate('/cart');
    } catch {
      toast.error('Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  // ── Only change: removed localStorage, pass product via navigate state ──
  const buyNow = () => {
    if (!user) { toast.error('Please login to buy'); navigate('/login'); return; }
    navigate('/checkout2', { state: { product: product, quantity: 1 } });
  };

  if (loading) return (
    <div style={{ width: '80%', margin: '0 auto', padding: '80px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <div style={{ width: 44, height: 44, border: '3px solid #e5e7eb', borderTopColor: '#16a34a', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: '#94a3b8', fontSize: 14, fontWeight: 600 }}>Loading product...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!product) return (
    <div style={{ width: '80%', margin: '60px auto', textAlign: 'center' }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>😕</div>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Product not found</h2>
      <button onClick={() => navigate('/products')} style={{ background: '#16a34a', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 28px', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>Browse Products</button>
    </div>
  );

  const stock = product.stock || 0;
  const isOutOfStock = stock === 0;
  const isLowStock = stock > 0 && stock < 5;

  const hasDiscount = product.discountFinalPrice != null && product.discountFinalPrice !== 0;
  const displayPrice = hasDiscount ? product.discountFinalPrice : product.price;
  const strikePrice = hasDiscount ? product.price : product.originalPrice;
  const showStrike = strikePrice && strikePrice > displayPrice;
  const discountPct = showStrike ? Math.round((1 - displayPrice / strikePrice) * 100) : 0;

  return (
    <div style={{ width: '80%', margin: '0 auto', padding: '32px 0 64px' }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28, fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, fontSize: 13 }}>
          <ArrowLeft size={15} /> Home
        </button>
        <ChevronRight size={14} />
        <button onClick={() => navigate('/products')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontWeight: 600, fontSize: 13 }}>Products</button>
        <ChevronRight size={14} />
        <span style={{ color: '#0f172a' }}>{product.title}</span>
      </div>

      {/* Main Product Card */}
      <div style={{
        background: '#fff', borderRadius: 28, overflow: 'hidden',
        border: '1px solid #f1f5f9', boxShadow: '0 4px 32px rgba(0,0,0,0.07)',
        display: 'grid', gridTemplateColumns: '1fr 1fr',
      }}>
        {/* LEFT — Image */}
        <div style={{
          background: 'linear-gradient(135deg, #f8fafc, #f0fdf4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 48, minHeight: 440, position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'radial-gradient(circle, #16a34a 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          {isLowStock && (
            <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 2, background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 100, padding: '5px 12px', fontSize: 11, fontWeight: 800, letterSpacing: 0.5 }}>
              ⚠️ Only {stock} left!
            </div>
          )}
          {isOutOfStock && (
            <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 2, background: '#f1f5f9', color: '#64748b', borderRadius: 100, padding: '5px 12px', fontSize: 11, fontWeight: 800 }}>
              OUT OF STOCK
            </div>
          )}
          <img
            src={product.imageURL}
            alt={product.title}
            onClick={() => setImgZoomed(true)}
            style={{
              maxHeight: 320, maxWidth: '100%', objectFit: 'contain',
              position: 'relative', zIndex: 1, cursor: 'zoom-in',
              transition: 'transform 0.3s ease',
              filter: isOutOfStock ? 'grayscale(0.4) opacity(0.7)' : 'none',
            }}
            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.06)'}
            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
          />
        </div>

        {/* RIGHT — Info */}
        <div style={{ padding: '48px 44px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {product.category?.name && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: 100, padding: '4px 14px', fontSize: 11, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16, width: 'fit-content' }}>
              🏷️ {product.category.name}
            </div>
          )}
          <h1 style={{ fontSize: 'clamp(22px,3vw,34px)', fontWeight: 900, color: '#0f172a', fontFamily: "'Playfair Display',Georgia,serif", lineHeight: 1.2, marginBottom: 12 }}>
            {product.title}
          </h1>
          <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.7, marginBottom: 24, fontWeight: 500 }}>
            {product.description}
          </p>

          {/* Price */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 20 }}>
            <span style={{ fontSize: 42, fontWeight: 900, color: '#0f172a', fontFamily: 'Georgia,serif', lineHeight: 1 }}>
              ₹{displayPrice}
            </span>
            {showStrike && (
              <>
                <span style={{ fontSize: 18, color: '#94a3b8', textDecoration: 'line-through', fontWeight: 600 }}>₹{strikePrice}</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#16a34a', background: '#f0fdf4', padding: '3px 10px', borderRadius: 100 }}>{discountPct}% OFF</span>
              </>
            )}
          </div>

          {/* Stock Status */}
          <div style={{ marginBottom: 28 }}>
            {isOutOfStock ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#dc2626', fontWeight: 700, fontSize: 14, background: '#fef2f2', padding: '10px 16px', borderRadius: 12, border: '1px solid #fecaca' }}>
                <span>✗</span> Out of Stock — Check back soon
              </div>
            ) : isLowStock ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#d97706', fontWeight: 700, fontSize: 14, background: '#fffbeb', padding: '10px 16px', borderRadius: 12, border: '1px solid #fde68a' }}>
                <span>⚠</span> Only {stock} left — Order soon!
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#16a34a', fontWeight: 700, fontSize: 14, background: '#f0fdf4', padding: '10px 16px', borderRadius: 12, border: '1px solid #bbf7d0' }}>
                <span>✓</span> In Stock — Ready to ship
              </div>
            )}
          </div>

          {/* CTA Buttons */}
          {isOutOfStock ? (
            <div style={{ background: '#f1f5f9', color: '#94a3b8', borderRadius: 14, padding: '15px 28px', fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', gap: 10, width: 'fit-content' }}>
              <Package size={18} /> Available Soon
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
              <button
                onClick={addToCart}
                disabled={adding}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  background: adding ? '#86efac' : '#16a34a', color: '#fff', border: 'none',
                  borderRadius: 14, padding: '15px 20px', fontWeight: 800, fontSize: 15,
                  cursor: adding ? 'not-allowed' : 'pointer',
                  boxShadow: '0 6px 20px rgba(22,163,74,0.3)', transition: 'all 0.2s',
                }}
                onMouseOver={e => { if (!adding) e.currentTarget.style.background = '#15803d'; }}
                onMouseOut={e => { if (!adding) e.currentTarget.style.background = '#16a34a'; }}
              >
                <ShoppingCart size={18} />
                {adding ? 'Adding...' : 'Add to Cart'}
              </button>
              <button
                onClick={buyNow}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  background: '#0f172a', color: '#fff', border: 'none',
                  borderRadius: 14, padding: '15px 20px', fontWeight: 800, fontSize: 15,
                  cursor: 'pointer', transition: 'all 0.2s',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
                }}
                onMouseOver={e => e.currentTarget.style.background = '#1e293b'}
                onMouseOut={e => e.currentTarget.style.background = '#0f172a'}
              >
                <Zap size={18} /> Buy Now
              </button>
            </div>
          )}

          {/* Trust badges */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { icon: <Truck size={15} />, text: '30-min delivery' },
              { icon: <Shield size={15} />, text: '100% authentic' },
              { icon: <RotateCcw size={15} />, text: '7-day returns' },
              { icon: <Star size={15} />, text: 'Farm direct' },
            ].map((b, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f8fafc', borderRadius: 10, padding: '9px 13px', fontSize: 12, fontWeight: 700, color: '#475569', border: '1px solid #f1f5f9' }}>
                <span style={{ color: '#16a34a' }}>{b.icon}</span> {b.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Image Zoom Modal */}
      {imgZoomed && (
        <div
          onClick={() => setImgZoomed(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out', backdropFilter: 'blur(8px)' }}
        >
          <img src={product.imageURL} alt={product.title} style={{ maxHeight: '85vh', maxWidth: '85vw', objectFit: 'contain', borderRadius: 16 }} />
        </div>
      )}

      {similarProducts.length > 0 && (
        <ProductSlider title="Similar Products" emoji="🔁" label="You May Also Like" products={similarProducts} />
      )}

      {recommendedProducts.length > 0 && (
        <ProductSlider title="Frequently Bought Together" emoji="🛍️" label="Recommendations" products={recommendedProducts} />
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&display=swap');
      `}</style>
    </div>
  );
}