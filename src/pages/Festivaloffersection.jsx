import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Tag, Flame } from 'lucide-react';
import api from '../Api';

// ── Festival Offer Card ───────────────────────────────────────────────────────
function FestivalOfferCard({ p }) {
  const navigate = useNavigate();
  const discount = p.discountPercent || 0;

  const offerPrice = p.discountFinalPrice;
  const originalPrice = p.price;
  const savings = (originalPrice - offerPrice).toFixed(2);

  return (
    <div
      onClick={() => navigate(`/product/${p.id}`)}
      style={{
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(16px)',
        borderRadius: 22,
        overflow: 'hidden',
        border: '1px solid rgba(255,215,0,0.15)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
        cursor: 'pointer',
        transition: 'all 0.28s cubic-bezier(0.34,1.56,0.64,1)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}
      onMouseOver={e => {
        e.currentTarget.style.transform = 'translateY(-8px) scale(1.01)';
        e.currentTarget.style.boxShadow = '0 20px 50px rgba(0,0,0,0.45)';
        e.currentTarget.style.border = '1px solid rgba(255,215,0,0.45)';
      }}
      onMouseOut={e => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.3)';
        e.currentTarget.style.border = '1px solid rgba(255,215,0,0.15)';
      }}
    >
      {/* ── Badges Row (no overlap) ── */}
      <div style={{
        position: 'absolute', top: 12, left: 12, right: 12, zIndex: 10,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        {discount > 0 ? (
          <div style={{
            background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
            color: '#fff', fontWeight: 800, fontSize: 12,
            borderRadius: 8, padding: '4px 10px',
            boxShadow: '0 2px 10px rgba(239,68,68,0.5)',
            letterSpacing: 0.3,
          }}>
            -{discount}%
          </div>
        ) : <span />}

        {p.festivalOffer && (
          <div style={{
            background: 'rgba(255,215,0,0.12)',
            border: '1px solid rgba(255,215,0,0.4)',
            color: '#fbbf24', fontWeight: 700, fontSize: 10,
            borderRadius: 7, padding: '3px 9px', letterSpacing: 0.6,
            backdropFilter: 'blur(8px)',
          }}>
            🎉 FEST OFFER
          </div>
        )}
      </div>

      {/* ── Product Image ── */}
      <div style={{
        height: 180,
        background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '28px 20px 16px',
      }}>
        <img
          src={p.imageURL || p.image}
          alt={p.title || p.name}
          loading="lazy"
          style={{
            maxHeight: '100%', maxWidth: '100%', objectFit: 'contain',
            filter: 'drop-shadow(0 6px 16px rgba(0,0,0,0.4))',
          }}
        />
      </div>

      {/* ── Divider ── */}
      <div style={{
        height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(255,215,0,0.2), transparent)',
        margin: '0 16px',
      }} />

      {/* ── Info ── */}
      <div style={{ padding: '14px 16px 18px', flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>

        {/* Name */}
        <div style={{
          fontWeight: 700, fontSize: 14, color: '#f1f5f9',
          lineHeight: 1.35,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {p.title || p.name}
        </div>

        {/* Description */}
        {p.description && (
          <div style={{
            fontSize: 11, color: '#64748b', fontWeight: 500,
            lineHeight: 1.4, whiteSpace: 'nowrap',
            overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {p.description}
          </div>
        )}

        {/* Pricing */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
          <span style={{ fontSize: 22, fontWeight: 900, color: '#4ade80', letterSpacing: -0.5 }}>
            ₹{offerPrice}
          </span>
          {discount > 0 && (
            <span style={{
              fontSize: 13, fontWeight: 600, color: '#475569',
              textDecoration: 'line-through',
            }}>
              ₹{originalPrice}
            </span>
          )}
        </div>

        {/* Savings pill */}
        {discount > 0 && savings > 0 && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            fontSize: 11, fontWeight: 700, color: '#4ade80',
            background: 'rgba(74,222,128,0.10)',
            border: '1px solid rgba(74,222,128,0.22)',
            borderRadius: 7, padding: '4px 10px',
            width: 'fit-content',
          }}>
            <Tag size={10} />
            You save ₹{savings}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Festival Offers Section ───────────────────────────────────────────────────
export default function FestivalOfferSection() {
  const [offers, setOffers] = useState([]);
  const [festival, setFestival] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [offersRes, festivalRes] = await Promise.allSettled([
          api.get('/festival/offers'),
          api.get('/current-festival'),
        ]);
        if (offersRes.status === 'fulfilled' && offersRes.value.data?.length) {
          setOffers(offersRes.value.data);
        }
        if (festivalRes.status === 'fulfilled' && festivalRes.value.data) {
          setFestival(festivalRes.value.data);
        }
      } catch (e) {
        // fail silently
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading || !offers.length) return null;

  const festivalName = festival?.name || 'Festival';
  const festivalDescription = festival?.description || 'Exclusive limited-time festival discounts';
  const endDate = festival?.endDate
    ? new Date(festival.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })
    : null;

  return (
    <section style={{
      padding: '48px 40px 56px',
      background: 'linear-gradient(140deg, #0f0700 0%, #1e0d00 30%, #130020 70%, #0a0015 100%)',
      borderRadius: 32,
      marginBottom: 56,
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* ── Background decorations ── */}
      <div style={{
        position: 'absolute', top: -80, right: -80, width: 380, height: 380,
        background: 'radial-gradient(circle, rgba(251,191,36,0.10) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: -100, left: -60, width: 360, height: 360,
        background: 'radial-gradient(circle, rgba(168,85,247,0.09) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      {/* ── Header ── */}
      <div style={{ marginBottom: 36, position: 'relative', zIndex: 1 }}>

        {/* Label + end date row */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 12, marginBottom: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={16} color="#fbbf24" />
            <span style={{
              fontSize: 11, fontWeight: 700, letterSpacing: 2.5,
              textTransform: 'uppercase', color: '#fbbf24',
            }}>
              {festivalName.toUpperCase()} · SPECIAL OFFERS
            </span>
          </div>

          {endDate && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 100, padding: '5px 14px',
              color: '#94a3b8', fontSize: 12, fontWeight: 600,
            }}>
              <Flame size={12} color="#f87171" />
              Ends {endDate}
            </div>
          )}
        </div>

        {/* Heading */}
        <h2 style={{
          fontSize: 34, fontWeight: 900, color: '#fff',
          fontFamily: "'Playfair Display', Georgia, serif",
          margin: '0 0 10px', lineHeight: 1.15,
        }}>
          🎊 {festivalName} Sale
        </h2>

        {/* Accent underline */}
        <div style={{
          width: 64, height: 3, borderRadius: 99,
          background: 'linear-gradient(90deg, #f59e0b, #ef4444)',
          marginBottom: 12,
        }} />

        <p style={{ fontSize: 14, color: '#94a3b8', margin: 0, fontWeight: 500 }}>
          {festivalDescription}
        </p>
      </div>

      {/* ── Cards Grid ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
        gap: 20,
        position: 'relative', zIndex: 1,
      }}>
        {offers.map(p => <FestivalOfferCard key={p.id} p={p} />)}
      </div>

      {/* ── Bottom shimmer ── */}
      <div style={{
        position: 'absolute', bottom: 0, left: '10%', right: '10%', height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(255,215,0,0.15), transparent)',
        pointerEvents: 'none',
      }} />
    </section>
  );
}