import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../Api";
import { useAuth } from "../contexts/AuthContext";
import { optimizeImage } from '../utils/imageOptimizer';

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [movingAll, setMovingAll] = useState(false);
  const [actionIds, setActionIds] = useState(new Set());
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (!user) {
      toast.error("Please login to view your wishlist");
      navigate("/login");
      return;
    }
    loadWishlist();
  }, [user]);

  const loadWishlist = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/wishlist/${user.id}`);
      setWishlist(res.data || []);
    } catch {
      toast.error("Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    setActionIds((prev) => new Set(prev).add(productId));
    try {
      await api.delete(`/wishlist/remove`, {
        params: { userId: user.id, productId },
      });
      window.dispatchEvent(new CustomEvent('wishlistCountChanged'));
      toast.success("Removed from wishlist");
      loadWishlist();
    } catch {
      toast.error("Failed to remove item");
    } finally {
      setActionIds((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  const moveToCart = async (productId) => {
    setActionIds((prev) => new Set(prev).add(`cart-${productId}`));
    try {
      await api.post(`/wishlist/move-to-cart`, null, {
        params: { userId: user.id, productId },
      });
      window.dispatchEvent(new CustomEvent('wishlistCountChanged'));
      window.dispatchEvent(new CustomEvent('cartCountChanged'));

      toast.success("Moved to cart 🛒");
      loadWishlist();
    } catch {
      toast.error("Failed to move to cart");
    } finally {
      setActionIds((prev) => {
        const next = new Set(prev);
        next.delete(`cart-${productId}`);
        return next;
      });
    }
  };

  const moveAllToCart = async () => {
    setMovingAll(true);
    try {
      await api.post(`/wishlist/move-all-to-cart/${user.id}`);
      toast.success("All items moved to cart 🛒");
      loadWishlist();
      window.dispatchEvent(new CustomEvent('wishlistCountChanged'));
      window.dispatchEvent(new CustomEvent('cartCountChanged'));

    } catch {
      toast.error("Failed to move all items to cart");
    } finally {
      setMovingAll(false);
    }
  };

  const isActioning = (key) => actionIds.has(key);

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "24px 20px", minHeight: "100vh", background: "#f9fafb" }}>
      
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#111827", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 26 }}>♡</span>
            Wishlist
          </h1>
          {wishlist.length > 0 && (
            <span style={{ background: "#f3f4f6", color: "#6b7280", fontSize: 12, fontWeight: 600, padding: "2px 10px", borderRadius: 20 }}>
              {wishlist.length} {wishlist.length === 1 ? "item" : "items"}
            </span>
          )}
        </div>
        
        <div style={{ display: "flex", gap: 12 }}>
          <Link
            to="/"
            style={{ fontSize: 13, fontWeight: 500, color: "#6b7280", textDecoration: "none", display: "flex", alignItems: "center", gap: 4, transition: "color 0.2s" }}
            onMouseEnter={e => e.target.style.color = "#059669"}
            onMouseLeave={e => e.target.style.color = "#6b7280"}
          >
            ← Continue Shopping
          </Link>
          
          {wishlist.length > 0 && (
            <button
              onClick={moveAllToCart}
              disabled={movingAll}
              style={{
                display: "flex", alignItems: "center", gap: 6, padding: "6px 14px",
                borderRadius: 8, fontSize: 12, fontWeight: 600, border: "none",
                cursor: movingAll ? "not-allowed" : "pointer",
                background: movingAll ? "#e5e7eb" : "#059669",
                color: movingAll ? "#9ca3af" : "#fff",
                transition: "all 0.2s",
              }}
            >
              {movingAll ? (
                <>
                  <svg className="animate-spin" style={{ width: 14, height: 14 }} viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.25" />
                    <path d="M4 12a8 8 0 018-8v8H4z" fill="currentColor" stroke="none" />
                  </svg>
                  Moving...
                </>
              ) : (
                <>🛒 Move All</>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 20px", background: "#fff", borderRadius: 12 }}>
          <svg style={{ width: 32, height: 32, marginBottom: 12, color: "#059669" }} className="animate-spin" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.25" />
            <path d="M4 12a8 8 0 018-8v8H4z" fill="currentColor" stroke="none" />
          </svg>
          <p style={{ color: "#9ca3af", fontSize: 13 }}>Loading your wishlist...</p>
        </div>
      ) : wishlist.length === 0 ? (
        <div style={{ background: "#fff", borderRadius: 12, padding: "48px 24px", textAlign: "center", border: "1px solid #f0f0f0" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>♡</div>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: "#374151", margin: "0 0 6px" }}>Your wishlist is empty</h3>
          <p style={{ fontSize: 13, color: "#9ca3af", margin: "0 0 20px" }}>Save items you love and come back to them later.</p>
          <Link to="/" style={{ display: "inline-block", background: "#059669", color: "#fff", padding: "8px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
            Browse Products
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {wishlist.map((item) => {
            const prod = item.products || item;
            const productId = item.productId ?? prod.id ?? item.id;
            const title = prod.title ?? prod.name ?? `Product #${productId}`;
            const hasDiscount = prod.discountFinalPrice != null && prod.discountFinalPrice !== 0;
            const displayPrice = hasDiscount ? prod.discountFinalPrice : prod.price;
            const strikePrice = hasDiscount ? prod.price : prod.originalPrice;
            const showStrike = strikePrice && strikePrice > displayPrice;
            const stock = prod.stock ?? null;
            const isOutOfStock = stock !== null && stock === 0;
            const isLowStock = stock !== null && stock > 0 && stock < 5;
            const removing = isActioning(productId);
            const carting = isActioning(`cart-${productId}`);

            return (
              <div
                key={item.id ?? productId}
                style={{
                  background: "#fff",
                  borderRadius: 12,
                  padding: "12px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  border: `1px solid ${isOutOfStock ? "#fee2e2" : "#f0f0f0"}`,
                  transition: "box-shadow 0.2s",
                }}
              >
                {/* Image */}
                <div
                  onClick={() => prod.id && navigate(`/products/${prod.id}`)}
                  style={{ width: 56, height: 56, borderRadius: 8, background: "#f9fafb", border: "1px solid #f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}
                >
                  <img src={optimizeImage(prod.imageURL, 100) || "/no-image.png"} alt={title} loading="lazy" width={48} height={48} style={{ width: 48, height: 48, objectFit: "contain" }} />
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    onClick={() => prod.id && navigate(`/products/${prod.id}`)}
                    style={{ fontWeight: 600, fontSize: 13, color: "#111827", marginBottom: 4, cursor: "pointer", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                  >
                    {title}
                  </div>

                  {displayPrice != null && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: 13, color: "#059669" }}>₹{displayPrice}</span>
                      {showStrike && (
                        <span style={{ fontSize: 11, color: "#9ca3af", textDecoration: "line-through" }}>₹{strikePrice}</span>
                      )}
                      {hasDiscount && strikePrice && (
                        <span style={{ fontSize: 10, fontWeight: 600, background: "#fef3c7", color: "#d97706", padding: "1px 6px", borderRadius: 12 }}>
                          {Math.round(((strikePrice - displayPrice) / strikePrice) * 100)}% OFF
                        </span>
                      )}
                    </div>
                  )}

                  {isOutOfStock ? (
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 600, color: "#dc2626", background: "#fef2f2", padding: "2px 8px", borderRadius: 12 }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                      Out of Stock
                    </div>
                  ) : isLowStock ? (
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 600, color: "#d97706", background: "#fffbeb", padding: "2px 8px", borderRadius: 12 }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                      Only {stock} left
                    </div>
                  ) : null}
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  <button
                    onClick={() => moveToCart(productId)}
                    disabled={isOutOfStock || carting}
                    style={{
                      display: "flex", alignItems: "center", gap: 5, padding: "6px 12px",
                      borderRadius: 8, fontSize: 12, fontWeight: 600, border: "none",
                      cursor: (isOutOfStock || carting) ? "not-allowed" : "pointer",
                      background: (isOutOfStock || carting) ? "#f3f4f6" : "#059669",
                      color: (isOutOfStock || carting) ? "#9ca3af" : "#fff",
                      transition: "all 0.2s",
                    }}
                  >
                    {carting ? (
                      <svg style={{ width: 12, height: 12 }} className="animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.25" />
                        <path d="M4 12a8 8 0 018-8v8H4z" fill="currentColor" stroke="none" />
                      </svg>
                    ) : (
                      "🛒"
                    )}
                    Cart
                  </button>

                  <button
                    onClick={() => removeFromWishlist(productId)}
                    disabled={removing}
                    style={{
                      display: "flex", alignItems: "center", gap: 5, padding: "6px 12px",
                      borderRadius: 8, fontSize: 12, fontWeight: 500, border: "1px solid #f0f0f0",
                      cursor: removing ? "not-allowed" : "pointer",
                      background: "#fff",
                      color: removing ? "#d1d5db" : "#ef4444",
                      transition: "all 0.2s",
                    }}
                  >
                    {removing ? (
                      <svg style={{ width: 12, height: 12 }} className="animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.25" />
                        <path d="M4 12a8 8 0 018-8v8H4z" fill="currentColor" stroke="none" />
                      </svg>
                    ) : (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
                      </svg>
                    )}
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Spin animation keyframes */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 0.8s linear infinite;
        }
      `}</style>
    </div>
  );
}