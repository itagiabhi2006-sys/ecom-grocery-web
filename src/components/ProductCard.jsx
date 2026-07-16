// ================== ProductCard.jsx ==================
// Blue-themed card — matches modern e-commerce design
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, Eye, Star, Heart } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../Api'
import { useAuth } from '../contexts/AuthContext'
import { optimizeImage } from '../utils/imageOptimizer'

// Module-level cache to prevent multiple identical requests when rendering many ProductCards
let wishlistCache = {};
let wishlistPromises = {};

const fetchUserWishlist = (userId) => {
  if (!wishlistPromises[userId]) {
    wishlistPromises[userId] = api.get(`/wishlist/${userId}`)
      .then(res => {
        wishlistCache[userId] = res.data || [];
        // Cache the promise/result for a short time to deduplicate concurrent requests
        setTimeout(() => { wishlistPromises[userId] = null; }, 5000);
        return wishlistCache[userId];
      })
      .catch(err => {
        wishlistPromises[userId] = null;
        console.error('Error fetching wishlist:', err);
        return [];
      });
  }
  return wishlistPromises[userId];
};

// Force a cache invalidation (useful after updates)
const invalidateWishlistCache = (userId) => {
  wishlistPromises[userId] = null;
};

export default function ProductCard({ p }) {
  const [isHovered, setIsHovered]            = useState(false)
  const [isLiked, setIsLiked]                = useState(false)
  const [wishlistLoading, setWishlistLoading] = useState(false)
  const [addingToCart, setAddingToCart]       = useState(false)
  const [checkingWishlist, setCheckingWishlist] = useState(true)
  const [imageLoaded, setImageLoaded]         = useState(false)
  const { user } = useAuth()

  // ── Price resolution ──────────────────────────────────────────────────────
  const hasDiscount =
    p.discountFinalPrice != null &&
    p.discountFinalPrice > 0 &&
    p.discountFinalPrice < p.price
  const displayPrice = hasDiscount ? p.discountFinalPrice : p.price
  const discountPct  = hasDiscount
    ? Math.round(((p.price - p.discountFinalPrice) / p.price) * 100)
    : null
  const rating = p.rating || (Math.random() * 1 + 4).toFixed(1)

  // ── Check if product is in wishlist on component mount ───────────────────
  const checkWishlistStatus = async () => {
    if (!user) {
      setIsLiked(false)
      setCheckingWishlist(false)
      return
    }

    try {
      // Fetch user's wishlist using the shared cache
      let wishlistItems = []
      try {
        wishlistItems = await fetchUserWishlist(user.id)
      } catch (err) {
        console.error('Error fetching wishlist:', err)
      }
      
      // Check if current product is in wishlist
      const isInWishlist = wishlistItems.some(item => {
        // Handle different possible data structures
        const productId = item.productId || item.product?.id || item.id
        return productId === p.id
      })
      
      setIsLiked(isInWishlist)
    } catch (error) {
      console.error('Error checking wishlist status:', error)
      setIsLiked(false)
    } finally {
      setCheckingWishlist(false)
    }
  }

  // Check wishlist status on mount and when user changes
  useEffect(() => {
    checkWishlistStatus()
  }, [user, p.id])

  // ── Listen for wishlist updates from other components ────────────────────
  useEffect(() => {
    const handleWishlistUpdate = async (event) => {
      // If the updated product is this product, update directly
      if (event.detail?.productId === p.id) {
        setIsLiked(event.detail?.isLiked || false)
      } else {
        // Otherwise, refresh from API
        await checkWishlistStatus()
      }
    }

    // Listen for storage events (for cross-tab updates)
    const handleStorageChange = (e) => {
      if (e.key === 'wishlistUpdate') {
        checkWishlistStatus()
      }
    }

    window.addEventListener('wishlist-updated', handleWishlistUpdate)
    window.addEventListener('wishlistCountChanged', handleWishlistUpdate)
    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('wishlist-updated', handleWishlistUpdate)
      window.removeEventListener('wishlistCountChanged', handleWishlistUpdate)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [user, p.id])

  // ── Wishlist ───────────────────────────────────────────────────────────────
  const handleWishlist = async (e) => {
    e.preventDefault(); e.stopPropagation()
    if (!user) { 
      toast.error('Please login to add to wishlist')
      return
    }
    
    setWishlistLoading(true)
    try {
      if (isLiked) {
        // Remove from wishlist
        const response = await api.delete(`/wishlist/remove`, { 
          params: { userId: user.id, productId: p.id } 
        })
        
        if (response.status === 200 || response.status === 204) {
          setIsLiked(false)
          toast.success('Removed from wishlist!')
          
          // Force cache invalidation on success
          invalidateWishlistCache(user.id);

          // Store the update in localStorage for cross-tab sync
          localStorage.setItem('wishlistUpdate', JSON.stringify({ 
            productId: p.id, 
            isLiked: false, 
            timestamp: Date.now() 
          }))
          
          // Dispatch event for other components
          window.dispatchEvent(new CustomEvent('wishlist-updated', { 
            detail: { productId: p.id, isLiked: false }
          }))
          window.dispatchEvent(new CustomEvent('wishlistCountChanged'))
        }
      } else {
        // Add to wishlist
        const response = await api.post('/wishlist/add', null, { 
          params: { userId: user.id, productId: p.id } 
        })
        
        if (response.status === 200 || response.status === 201) {
          setIsLiked(true)
          toast.success('Added to wishlist!')
          
          // Force cache invalidation on success
          invalidateWishlistCache(user.id);
          
          // Store the update in localStorage for cross-tab sync
          localStorage.setItem('wishlistUpdate', JSON.stringify({ 
            productId: p.id, 
            isLiked: true, 
            timestamp: Date.now() 
          }))
          
          // Dispatch event for other components
          window.dispatchEvent(new CustomEvent('wishlist-updated', { 
            detail: { productId: p.id, isLiked: true }
          }))
          window.dispatchEvent(new CustomEvent('wishlistCountChanged'))
        }
      }
    } catch (error) {
      console.error('Wishlist operation failed:', error)
      // Refresh status from server to ensure consistency
      await checkWishlistStatus()
      toast.error(isLiked ? 'Failed to remove from wishlist' : 'Failed to add to wishlist')
    } finally { 
      setWishlistLoading(false) 
    }
  }

  // ── Add to Cart ──────────────────────────────────────────────────────────────
  const handleAddToCart = async (e) => {
    e.preventDefault(); e.stopPropagation()
    if (!user) { 
      toast.error('Please login to add to cart')
      return
    }
    
    setAddingToCart(true)
    try {
      const payload = [
        {
          products: { id: p.id },
          quantity: 1,
          prices: p.price,
          user: { id: user.id, email: user.email },
        },
      ]
      const response = await api.post(`/add-to-cart/${user.id}`, payload)
      
      if (response.status === 200 || response.status === 201) {
        toast.success('Added to cart!')
        window.dispatchEvent(new CustomEvent('cartCountChanged'))
      }
    } catch (error) {
      console.error('Add to cart failed:', error)
      toast.error('Failed to add to cart')
    } finally { 
      setAddingToCart(false) 
    }
  }

  // ── Blue palette constants ─────────────────────────────────────────────────
  const BLUE_DARK   = '#0f3460'
  const BLUE_MID    = '#1565c0'
  const BLUE_PALE   = '#e3f0ff'
  const BLUE_BORDER = '#90caf9'
  const BLUE_GLOW   = 'rgba(21,101,192,0.18)'

  // Show loading state while checking wishlist
  if (checkingWishlist) {
    return (
      <div style={{
        background: '#fff',
        borderRadius: 20,
        border: `2px solid ${BLUE_BORDER}`,
        padding: '20px',
        textAlign: 'center',
        minHeight: '300px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          width: 24, height: 24,
          border: `2px solid ${BLUE_PALE}`,
          borderTopColor: BLUE_MID,
          borderRadius: '50%',
          animation: 'pcSpin 0.8s linear infinite',
        }} />
      </div>
    )
  }

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'relative',
        background: '#fff',
        borderRadius: 20,
        border: isHovered
          ? `2px solid ${BLUE_MID}`
          : `2px solid ${BLUE_BORDER}`,
        boxShadow: isHovered
          ? `0 16px 48px ${BLUE_GLOW}, 0 2px 12px rgba(0,0,0,0.07)`
          : '0 2px 12px rgba(21,101,192,0.07)',
        overflow: 'hidden',
        transition: 'all 0.26s ease',
        cursor: 'pointer',
      }}
    >
      {/* ── Top Badges ── */}
      <div style={{
        position: 'absolute', top: 10, left: 10, right: 10,
        zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      }}>
        {discountPct ? (
          <span style={{
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            color: '#fff', fontSize: 10, fontWeight: 800,
            borderRadius: 7, padding: '3px 9px',
            boxShadow: '0 2px 8px rgba(239,68,68,0.35)',
            letterSpacing: '0.3px',
          }}>
            -{discountPct}%
          </span>
        ) : <span />}

        <button
          onClick={handleWishlist}
          disabled={wishlistLoading}
          style={{
            width: 34, height: 34, borderRadius: '50%',
            background: isLiked ? '#fef2f2' : 'rgba(255,255,255,0.95)',
            border: isLiked ? '1.5px solid #fca5a5' : `1.5px solid ${BLUE_BORDER}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: wishlistLoading ? 'not-allowed' : 'pointer',
            opacity: wishlistLoading ? 0.6 : 1,
            transition: 'all 0.2s',
            boxShadow: '0 1px 6px rgba(0,0,0,0.10)',
            flexShrink: 0,
          }}
          onMouseOver={e => {
            if (!wishlistLoading && !isLiked) {
              e.currentTarget.style.background = '#fef2f2'
              e.currentTarget.style.borderColor = '#fca5a5'
              e.currentTarget.style.transform = 'scale(1.15)'
            }
          }}
          onMouseOut={e => {
            if (!isLiked) {
              e.currentTarget.style.background = 'rgba(255,255,255,0.95)'
              e.currentTarget.style.borderColor = BLUE_BORDER
            }
            e.currentTarget.style.transform = 'scale(1)'
          }}
        >
          {wishlistLoading ? (
            <div style={{
              width: 13, height: 13,
              border: '2px solid #fecaca',
              borderTopColor: '#ef4444',
              borderRadius: '50%',
              animation: 'pcSpin 0.8s linear infinite',
            }} />
          ) : (
            <Heart
              size={14}
              style={{
                fill: isLiked ? '#f43f5e' : 'none',
                color: isLiked ? '#f43f5e' : '#9ca3af',
                transition: 'all 0.2s',
              }}
            />
          )}
        </button>
      </div>

      {/* ── Product Image ── */}
      <Link to={`/product/${p.id}`} style={{ textDecoration: 'none' }}>
        <div style={{
          height: 190,
          background: isHovered
            ? 'linear-gradient(145deg, #dbeafe, #eff6ff)'
            : 'linear-gradient(145deg, #f0f7ff, #f8fbff)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20, position: 'relative', overflow: 'hidden',
          transition: 'background 0.28s',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            opacity: isHovered ? 0.07 : 0.04,
            backgroundImage: 'radial-gradient(circle, #1565c0 1px, transparent 1px)',
            backgroundSize: '22px 22px',
            transition: 'opacity 0.28s',
          }} />

          {/* Image skeleton loader */}
          {!imageLoaded && (
            <div style={{
              position: 'absolute', inset: 20,
              background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
              borderRadius: 12,
              zIndex: 0
            }} />
          )}

          <img
            src={optimizeImage(p.imageURL, 300) || '/no-image.png'}
            alt={p.title}
            loading="lazy"
            width={300}
            height={300}
            onLoad={() => setImageLoaded(true)}
            style={{
              maxWidth: '100%', maxHeight: '100%', objectFit: 'contain',
              transform: isHovered ? 'scale(1.09)' : 'scale(1)',
              transition: 'transform 0.38s ease, opacity 0.3s ease',
              opacity: imageLoaded ? 1 : 0,
              position: 'relative', zIndex: 1,
              filter: isHovered
                ? `drop-shadow(0 10px 22px ${BLUE_GLOW})`
                : 'drop-shadow(0 2px 8px rgba(0,0,0,0.09))',
            }}
            onError={e => { e.target.onerror = null; e.target.src = '/no-image.png'; setImageLoaded(true); }}
          />

          <div style={{
            position: 'absolute', inset: 0,
            background: `linear-gradient(to top, ${BLUE_DARK}cc 0%, transparent 55%)`,
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            paddingBottom: 14,
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.22s',
            zIndex: 2,
          }}>
            <Link
              to={`/product/${p.id}`}
              onClick={e => e.stopPropagation()}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'rgba(255,255,255,0.18)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.32)',
                color: '#fff', fontSize: 11.5, fontWeight: 700,
                padding: '7px 18px', borderRadius: 9,
                cursor: 'pointer', textDecoration: 'none',
                transition: 'background 0.2s',
                letterSpacing: '0.2px',
              }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.30)'}
              onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
            >
              <Eye size={13} />
              Quick View
            </Link>
          </div>
        </div>

        {/* ── Product Details ── */}
        <div style={{ padding: '14px 16px 0' }}>
          {p.category && (
            <span style={{
              display: 'inline-block',
              background: BLUE_PALE,
              color: BLUE_MID,
              border: `1px solid ${BLUE_BORDER}`,
              fontSize: 9.5, fontWeight: 800,
              borderRadius: 6, padding: '2px 9px',
              letterSpacing: '0.5px', textTransform: 'uppercase',
              marginBottom: 7,
            }}>
              {p.category}
            </span>
          )}

          <h3 style={{
            fontWeight: 700, fontSize: 13.5, lineHeight: 1.35,
            color: '#0f172a',
            marginBottom: 7, overflow: 'hidden',
            display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical',
          }}>
            {p.title}
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={11}
                  style={{
                    fill: i < Math.floor(rating) ? '#f59e0b' : '#e5e7eb',
                    color: i < Math.floor(rating) ? '#f59e0b' : '#e5e7eb',
                  }}
                />
              ))}
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b' }}>{rating}</span>
            <span style={{ fontSize: 10.5, color: '#9ca3af' }}>
              ({Math.floor(Math.random() * 500 + 100)})
            </span>
          </div>

          {/* Price + Add to Cart */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            paddingTop: 11,
            borderTop: `1px solid ${BLUE_PALE}`,
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontSize: 20, fontWeight: 900, color: BLUE_DARK }}>
                  ₹{displayPrice}
                </span>
                {hasDiscount && (
                  <span style={{ fontSize: 12, fontWeight: 500, color: '#9ca3af', textDecoration: 'line-through' }}>
                    ₹{p.price}
                  </span>
                )}
              </div>
              {hasDiscount && (
                <div style={{ fontSize: 10.5, fontWeight: 700, marginTop: 1, color: '#16a34a' }}>
                  Save ₹{(p.price - p.discountFinalPrice).toFixed(0)}
                </div>
              )}
            </div>

            <button
              onClick={handleAddToCart}
              disabled={addingToCart || p.stock === 0}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '8px 15px', borderRadius: 10,
                fontSize: 11.5, fontWeight: 700,
                cursor: addingToCart || p.stock === 0 ? 'not-allowed' : 'pointer',
                background: isHovered ? BLUE_MID : BLUE_PALE,
                color: isHovered ? '#fff' : BLUE_MID,
                border: isHovered ? 'none' : `1.5px solid ${BLUE_BORDER}`,
                boxShadow: isHovered ? `0 4px 16px ${BLUE_GLOW}` : 'none',
                opacity: addingToCart || p.stock === 0 ? 0.5 : 1,
                transition: 'all 0.26s',
              }}
              onMouseOver={e => {
                if (!addingToCart && p.stock !== 0) {
                  e.currentTarget.style.transform = 'scale(1.06)'
                  e.currentTarget.style.background = BLUE_DARK
                  e.currentTarget.style.color = '#fff'
                }
              }}
              onMouseOut={e => {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.background = isHovered ? BLUE_MID : BLUE_PALE
                e.currentTarget.style.color = isHovered ? '#fff' : BLUE_MID
              }}
            >
              {addingToCart ? (
                <div style={{
                  width: 12, height: 12,
                  border: `2px solid ${isHovered ? 'rgba(255,255,255,0.35)' : BLUE_BORDER}`,
                  borderTopColor: isHovered ? '#fff' : BLUE_MID,
                  borderRadius: '50%',
                  animation: 'pcSpin 0.8s linear infinite',
                }} />
              ) : (
                <ShoppingCart size={13} />
              )}
              <span>{addingToCart ? 'Adding…' : 'Add'}</span>
            </button>
          </div>

          {/* Stock + Free Delivery */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginTop: 10, paddingTop: 10, paddingBottom: 14,
            borderTop: `1px solid ${BLUE_PALE}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{
                width: 6, height: 6, borderRadius: '50%',
                background: p.stock > 0 ? '#16a34a' : '#ef4444',
                boxShadow: p.stock > 0
                  ? '0 0 0 3px rgba(22,163,74,0.15)'
                  : '0 0 0 3px rgba(239,68,68,0.15)',
              }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: '#6b7280' }}>
                {p.stock > 0 ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>
            <span style={{
              fontSize: 10, fontWeight: 800,
              color: BLUE_MID,
              background: BLUE_PALE,
              border: `1px solid ${BLUE_BORDER}`,
              borderRadius: 6, padding: '2px 8px',
              letterSpacing: '0.2px',
            }}>
              ⚡ Free delivery
            </span>
          </div>
        </div>
      </Link>

      <style>{`@keyframes pcSpin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}