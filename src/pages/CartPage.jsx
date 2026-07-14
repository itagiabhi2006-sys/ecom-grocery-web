import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../Api";
import { useAuth } from "../contexts/AuthContext";

export default function CartPage() {
  const [cart, setCart] = useState([]);
  const [cartRecommended, setCartRecommended] = useState([]);
  const [sliderIndex, setSliderIndex] = useState(0);
  const [isSliding, setIsSliding] = useState(false);
  const [offerAmount, setOfferAmount] = useState(0);
  const [offerApplied, setOfferApplied] = useState(false);
  const [movingItems, setMovingItems] = useState(new Set());
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const navigate = useNavigate();
  const { user } = useAuth();

  const ITEMS_PER_SLIDE = 2;
  const totalSlides = Math.ceil(cartRecommended.length / ITEMS_PER_SLIDE);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (!user) {
      toast.error("Please login to view your cart");
      navigate("/login");
      return;
    }
    loadCart();
  }, [user]);

  const loadCart = async () => {
    try {
      const res = await api.get(`/get-cart-details/${user.id}`);
      const items = Array.isArray(res.data) ? res.data : [];
      setCart(items);
      loadCartRecommend(items);
      fetchOfferIfEligible(items);
    } catch {
      toast.error("Failed to load cart details");
    } finally {
      setIsInitialLoad(false);
    }
  };

  const fetchOfferIfEligible = async (items) => {
    const rawTotal = calcRawTotal(items);
    if (rawTotal > 1000) {
      try {
        const res = await api.get(`/special-offer/${user.id}`);
        setOfferAmount(res.data || 0);
      } catch { setOfferAmount(0); }
    } else {
      setOfferAmount(0);
      setOfferApplied(false);
    }
  };

  const loadCartRecommend = async (cartItems) => {
    try {
      const titles = cartItems.map(i => i.products?.title).filter(Boolean);
      if (!titles.length) return;
      const res = await api.post("ml/cart-recommend", titles);
      setCartRecommended(res.data || []);
      setSliderIndex(0);
    } catch { setCartRecommended([]); }
  };

  const slideTo = (dir) => {
    if (isSliding) return;
    setIsSliding(true);
    setSliderIndex(prev =>
      dir === "next" ? Math.min(prev + 1, totalSlides - 1) : Math.max(prev - 1, 0)
    );
    setTimeout(() => setIsSliding(false), 350);
  };

  const updateQuantity = async (item, delta) => {
    const stock = item.products?.stock || 0;
    const newQty = Math.max(1, item.quantity + delta);
    if (item.quantity === 1 && delta < 0) { await removeItem(item.id); return; }
    if (delta > 0 && newQty > stock) { toast.error(`Only ${stock} items available`); return; }
    try {
      await api.post(`/update-cart-item/${item.id}/${newQty}`);
      delta < 0 ? toast.success("Quantity decreased") : newQty === stock && toast.success("Maximum quantity added");
      loadCart();
    } catch { toast.error("Failed to update quantity"); }
  };

  const removeItem = async (cartID) => {
    try {
      await api.delete(`/remove-from-cart/${cartID}`);
      toast.success("Item removed from cart");
      window.dispatchEvent(new CustomEvent('cartCountChanged'));

      loadCart();
    } catch { toast.error("Failed to remove item"); }
  };

  const validateCart = () => {
    const issues = [];
    cart.forEach(item => {
      const stock = item.products?.stock || 0;
      if (stock === 0) issues.push(`${item.products?.title} is out of stock`);
      else if (item.quantity > stock) issues.push(`${item.products?.title} — only ${stock} available`);
    });
    return issues;
  };

  const checkout = () => {
    if (!user) { toast.error("Please login first"); navigate("/login"); return; }
    const issues = validateCart();
    if (issues.length) { toast.error("Fix cart issues before checkout"); issues.forEach(i => toast.error(i)); return; }
    navigate("/checkout", { state: { offerApplied, offerAmount: offerApplied ? offerAmount : 0 } });
  };

  const calcRawTotal = (items) =>
    items.reduce((sum, c) => {
      const prod = c.products || {};
      const hasDiscount = prod.discountFinalPrice != null && prod.discountFinalPrice !== 0;
      return sum + (hasDiscount ? prod.discountFinalPrice : prod.price || 0) * (c.quantity || 1);
    }, 0);

  const rawTotal = calcRawTotal(cart);
  const finalTotal = offerApplied ? rawTotal - offerAmount : rawTotal;
  const visibleRecommended = cartRecommended.slice(
    sliderIndex * ITEMS_PER_SLIDE,
    sliderIndex * ITEMS_PER_SLIDE + ITEMS_PER_SLIDE
  );

  const isMoving = (id) => movingItems.has(id);

  /* ─── EMPTY STATE ─── */
  if (isInitialLoad) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#f9fafb", fontSize: "16px", fontWeight: "600", color: "#6b7280" }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div className="animate-spin" style={{ fontSize: 32 }}>⏳</div>
          Loading cart...
        </div>
      </div>
    );
  }

  if (!cart.length) {
    return (
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "48px 24px", textAlign: "center", minHeight: "100vh", background: "#f9fafb" }}>
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f0f0f0", padding: "60px 32px", display: "inline-block", minWidth: 340 }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🛒</div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#111827", margin: "0 0 8px" }}>Your cart is empty</h2>
          <p style={{ color: "#9ca3af", fontSize: 14, marginBottom: 24 }}>Looks like you haven't added anything yet.</p>
          <Link to="/" style={{ display: "inline-block", background: "#059669", color: "#fff", padding: "10px 24px", borderRadius: 8, fontWeight: 600, fontSize: 13, textDecoration: "none" }}>
            Shop Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#f9fafb", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "24px 20px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: "#111827", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 26 }}>🛒</span>
              Your Cart
            </h1>
            <span style={{ background: "#f3f4f6", color: "#6b7280", fontSize: 12, fontWeight: 600, padding: "2px 10px", borderRadius: 20 }}>
              {cart.length} {cart.length === 1 ? "item" : "items"}
            </span>
          </div>
          
          <Link to="/" style={{ 
            fontSize: 13, 
            fontWeight: 500, 
            color: "#6b7280", 
            textDecoration: "none", 
            display: "inline-flex", 
            alignItems: "center", 
            gap: 5,
            transition: "color 0.2s"
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Continue Shopping
          </Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24, alignItems: "start" }}>

          {/* LEFT - Cart Items */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {cart.map((item) => {
              const stock = item.products?.stock || 0;
              const isOutOfStock = stock === 0;
              const isOverQty = item.quantity > stock;
              const isLowStock = stock > 0 && stock < 5;
              const prod = item.products || {};
              const hasDiscount = prod.discountFinalPrice != null && prod.discountFinalPrice !== 0;
              const displayPrice = hasDiscount ? prod.discountFinalPrice : prod.price;
              const strikePrice = hasDiscount ? prod.price : prod.originalPrice;
              const showStrike = strikePrice && strikePrice > displayPrice;
              const lineTotal = displayPrice * (item.quantity || 1);

              return (
                <div key={item.id} style={{
                  background: "#fff",
                  borderRadius: 12,
                  padding: "12px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  border: `1px solid ${isOutOfStock || isOverQty ? "#fee2e2" : "#f0f0f0"}`,
                  transition: "box-shadow 0.2s",
                }}>
                  {/* Image */}
                  <div style={{ width: 56, height: 56, borderRadius: 8, background: "#f9fafb", border: "1px solid #f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <img src={prod.imageURL || "/no-image.png"} alt={prod.title || "Product"} loading="lazy" style={{ width: 48, height: 48, objectFit: "contain" }} />
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: "#111827", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {prod.title}
                    </div>

                    {/* Price */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                      <span style={{ fontWeight: 700, fontSize: 13, color: "#059669" }}>₹{displayPrice}</span>
                      {showStrike && (
                        <span style={{ fontSize: 11, color: "#9ca3af", textDecoration: "line-through" }}>₹{strikePrice}</span>
                      )}
                      <span style={{ fontSize: 11, color: "#9ca3af" }}>× {item.quantity}</span>
                      {hasDiscount && (
                        <span style={{ fontSize: 9, fontWeight: 600, background: "#fef3c7", color: "#d97706", padding: "1px 6px", borderRadius: 12 }}>SALE</span>
                      )}
                    </div>

                    {/* Stock badges */}
                    {isOutOfStock && (
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 600, color: "#dc2626", background: "#fef2f2", padding: "2px 8px", borderRadius: 12, marginBottom: 6 }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                        Out of Stock
                      </div>
                    )}
                    {!isOutOfStock && isOverQty && (
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 600, color: "#dc2626", background: "#fef2f2", padding: "2px 8px", borderRadius: 12, marginBottom: 6 }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                        Only {stock} available
                      </div>
                    )}
                    {!isOutOfStock && !isOverQty && isLowStock && (
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 600, color: "#d97706", background: "#fffbeb", padding: "2px 8px", borderRadius: 12, marginBottom: 6 }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                        Only {stock} left
                      </div>
                    )}

                    {/* Qty controls */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                      <button className="qty-btn" onClick={() => updateQuantity(item, -1)} disabled={isOutOfStock}>−</button>
                      <span style={{ width: 20, textAlign: "center", fontWeight: 600, fontSize: 13 }}>{item.quantity}</span>
                      <button className="qty-btn" onClick={() => updateQuantity(item, 1)} disabled={isOutOfStock || item.quantity >= stock}>+</button>
                      <button onClick={() => removeItem(item.id)} className="remove-btn">Remove</button>
                    </div>
                  </div>

                  {/* Line total */}
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>₹{lineTotal.toFixed(2)}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* RIGHT COLUMN - Sticky Bill Section */}
          <div style={{ 
            position: "sticky", 
            top: 80, 
            alignSelf: "start",
            display: "flex", 
            flexDirection: "column", 
            gap: 12
          }}>

            {/* Recommendations */}
            {cartRecommended.length > 0 && (
              <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #f0f0f0", overflow: "hidden" }}>
                <div style={{ padding: "12px 14px 8px", borderBottom: "1px solid #f9fafb" }}>
                  <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.5px", color: "#9ca3af", textTransform: "uppercase" }}>Suggestions</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#111827", marginTop: 2 }}>🛍️ You might also like</div>
                </div>

                <div style={{ padding: "10px 12px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {visibleRecommended.map(p => {
                      const rHasD = p.discountFinalPrice != null && p.discountFinalPrice !== 0;
                      const rPrice = rHasD ? p.discountFinalPrice : p.price;
                      return (
                        <div
                          key={p.id}
                          onClick={() => navigate(`/products/${p.id}`)}
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            background: "#f9fafb",
                            border: "1px solid #f0f0f0",
                            borderRadius: 10,
                            padding: "10px 8px",
                            cursor: "pointer",
                            transition: "all 0.2s",
                          }}
                          className="rec-card-hover"
                        >
                          <div style={{ width: "100%", height: 70, background: "#fff", borderRadius: 6, border: "1px solid #f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 6 }}>
                            <img src={p.imageURL || "/no-image.png"} alt={p.title} loading="lazy" style={{ height: 56, width: 56, objectFit: "contain" }} />
                          </div>
                          <p style={{ fontSize: 11, fontWeight: 500, color: "#374151", textAlign: "center", margin: "0 0 4px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: 1.3 }}>{p.title}</p>
                          <p style={{ fontSize: 12, fontWeight: 700, color: "#059669", margin: "0 0 6px" }}>₹{rPrice}</p>
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              try {
                                await api.post(`/add-to-cart/${user.id}`, [{ products: { id: p.id }, quantity: 1, prices: rPrice, user: { id: user.id, email: user.email } }]);
                                toast.success(`${p.title} added!`);
                                loadCart();
                              } catch { toast.error("Failed to add item"); }
                            }}
                            style={{
                              width: "100%", fontSize: 11, fontWeight: 600,
                              background: "#fff", color: "#059669",
                              border: "1px solid #d1fae5", borderRadius: 6, padding: "4px",
                              cursor: "pointer", transition: "all 0.2s",
                            }}
                            className="rec-add-btn-hover"
                          >+ Add</button>
                        </div>
                      );
                    })}
                    {visibleRecommended.length === 1 && (
                      <div style={{ background: "#f9fafb", border: "1px dashed #e5e7eb", borderRadius: 10, minHeight: 160, display: "flex", alignItems: "center", justifyContent: "center", color: "#d1d5db", fontSize: 20 }}>✦</div>
                    )}
                  </div>
                </div>

                {totalSlides > 1 && (
                  <div style={{ padding: "8px 12px", borderTop: "1px solid #f9fafb", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <button onClick={() => slideTo("prev")} disabled={sliderIndex === 0} className="slide-btn" style={{ opacity: sliderIndex === 0 ? 0.3 : 1 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
                    </button>
                    <div style={{ display: "flex", gap: 5 }}>
                      {Array.from({ length: totalSlides }).map((_, i) => (
                        <button key={i} onClick={() => { if (!isSliding) { setIsSliding(true); setSliderIndex(i); setTimeout(() => setIsSliding(false), 350); } }}
                          style={{ borderRadius: 999, border: "none", cursor: "pointer", transition: "all 0.3s", width: i === sliderIndex ? 16 : 6, height: 6, background: i === sliderIndex ? "#059669" : "#e5e7eb", padding: 0 }}
                        />
                      ))}
                    </div>
                    <button onClick={() => slideTo("next")} disabled={sliderIndex >= totalSlides - 1} className="slide-btn" style={{ opacity: sliderIndex >= totalSlides - 1 ? 0.3 : 1 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Special Offer Banner */}
            {offerAmount > 0 && (
              <div style={{ borderRadius: 12, border: `1px solid ${offerApplied ? "#86efac" : "#fde68a"}`, background: offerApplied ? "#f0fdf4" : "#fffbeb", padding: "12px 14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 20 }}>🎉</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "#111827" }}>
                      {offerApplied ? "Offer Applied!" : "Special Offer Available!"}
                    </p>
                    <p style={{ margin: "2px 0 0", fontSize: 10, color: "#6b7280" }}>
                      {offerApplied ? `Saved ₹${offerAmount}` : `Eligible for ₹${offerAmount} off`}
                    </p>
                  </div>
                  <button
                    onClick={() => setOfferApplied(p => !p)}
                    style={{ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 6, border: "none", cursor: "pointer", background: offerApplied ? "#fee2e2" : "#059669", color: offerApplied ? "#dc2626" : "#fff" }}
                  >
                    {offerApplied ? "Remove" : "Apply"}
                  </button>
                </div>
              </div>
            )}

            {/* Order Summary */}
            <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #f0f0f0", padding: "16px" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#111827", marginBottom: 12 }}>Order Summary</div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#6b7280" }}>
                  <span>Subtotal ({cart.length} items)</span>
                  <span style={{ fontWeight: 500, color: "#374151" }}>₹{rawTotal.toFixed(2)}</span>
                </div>

                {offerApplied && offerAmount > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#059669", fontWeight: 500 }}>
                    <span>Special Offer</span>
                    <span>− ₹{offerAmount.toFixed(2)}</span>
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#6b7280" }}>
                  <span>Delivery</span>
                  <span style={{ fontWeight: 600, color: "#059669" }}>Free</span>
                </div>
              </div>

              <div style={{ height: 1, background: "#f3f4f6", margin: "12px 0" }} />

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 700, color: "#111827" }}>
                <span>Total</span>
                <span style={{ color: "#059669" }}>₹{finalTotal.toFixed(2)}</span>
              </div>

              {offerApplied && offerAmount > 0 && (
                <div style={{ marginTop: 8, fontSize: 10, color: "#059669", fontWeight: 500, textAlign: "center" }}>
                  🎉 Saving ₹{offerAmount} on this order!
                </div>
              )}

              {validateCart().length > 0 && (
                <div style={{ marginTop: 10, padding: "8px 10px", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 8, fontSize: 11, color: "#dc2626", fontWeight: 500 }}>
                  ⚠️ Fix stock issues before checkout
                </div>
              )}

              <button
                onClick={checkout}
                disabled={validateCart().length > 0}
                style={{
                  marginTop: 12, width: "100%", padding: "10px", borderRadius: 8,
                  fontWeight: 600, fontSize: 12, border: "none",
                  cursor: validateCart().length > 0 ? "not-allowed" : "pointer",
                  background: validateCart().length > 0 ? "#e5e7eb" : "#059669",
                  color: validateCart().length > 0 ? "#9ca3af" : "#fff",
                }}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 0.8s linear infinite;
        }
        
        .qty-btn {
          width: 24px; height: 24px;
          display: flex; align-items: center; justify-content: center;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          background: #fff;
          font-size: 14px; font-weight: 600; color: #374151;
          cursor: pointer;
          transition: all 0.15s;
        }
        .qty-btn:hover:not(:disabled) { background: #f0fdf4; border-color: #059669; color: #059669; }
        .qty-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        
        .remove-btn {
          font-size: 11px; font-weight: 500;
          color: #ef4444; background: none; border: none; cursor: pointer;
          padding: 4px 8px; border-radius: 4px;
          transition: all 0.15s;
        }
        .remove-btn:hover { background: #fef2f2; color: #dc2626; }
        
        .rec-card-hover:hover { background: #f0fdf4; border-color: #d1fae5; transform: translateY(-1px); }
        .rec-add-btn-hover:hover { background: #059669; color: #fff; border-color: #059669; }
        
        .slide-btn {
          width: 24px; height: 24px;
          border: 1px solid #e5e7eb; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          background: #fff; cursor: pointer; color: #6b7280;
          transition: all 0.15s;
        }
        .slide-btn:hover:not(:disabled) { background: #f0fdf4; border-color: #059669; color: #059669; }
      `}</style>
    </div>
  );
}