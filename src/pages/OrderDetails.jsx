import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../Api";

// ── Known predefined stages ────────────────────────────────────────────────
const KNOWN_STAGES = new Set([
  "Ordered", "Processing", "Packed", "Shipped", "Out For Delivery", "Delivered",
  "Canceled", "CANCELED", "Return Requested", "Return Approved",
  "Return Picked Up", "Returned", "Refund Completed", "Return Cancelled",
]);
const isCustom = (stage) => !KNOWN_STAGES.has(stage);

const getDotColor = (stage) => {
  if (stage === "CANCELED" || stage === "Return Cancelled") return "#dc2626";
  if (["Return Requested", "Return Approved", "Return Picked Up", "Returned"].includes(stage)) return "#f97316";
  if (isCustom(stage)) return "#8b5cf6";
  return "#059669";
};

const getLineColor = (stage) => {
  if (stage === "CANCELED" || stage === "Return Cancelled") return "#dc2626";
  if (["Return Requested", "Return Approved", "Return Picked Up", "Returned"].includes(stage)) return "#f97316";
  if (isCustom(stage)) return "#8b5cf6";
  return "#059669";
};

const getStageTextColor = (stage) => {
  if (stage === "CANCELED" || stage === "Return Cancelled") return "#dc2626";
  if (["Return Requested", "Return Approved", "Return Picked Up", "Returned"].includes(stage)) return "#ea580c";
  if (isCustom(stage)) return "#7c3aed";
  return "#111827";
};

const getDescriptionTextColor = (stage) => {
  if (stage === "CANCELED" || stage === "Return Cancelled") return "#dc2626";
  if (["Return Requested", "Return Approved", "Return Picked Up", "Returned"].includes(stage)) return "#ea580c";
  if (stage === "Delivered" || stage === "Refund Completed") return "#059669";
  if (isCustom(stage)) return "#8b5cf6";
  return "#6b7280";
};

export default function OrderDetails() {
  const { state: order } = useLocation();
  const navigate = useNavigate();
  const [tracking, setTracking] = useState([]);
  const [userAddressDetails, setUserAddressDetails] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);

  // Waterfall animation
  const [visibleCount, setVisibleCount] = useState(0);
  const [lineHeights, setLineHeights] = useState({});

  useEffect(() => {
    if (tracking.length === 0) return;
    setVisibleCount(0);
    setLineHeights({});
    tracking.forEach((_, idx) => {
      setTimeout(() => {
        setVisibleCount((prev) => Math.max(prev, idx + 1));
        if (idx < tracking.length - 1) {
          const DURATION = 400;
          const TICK = 16;
          let elapsed = 0;
          const iv = setInterval(() => {
            elapsed += TICK;
            const pct = Math.min(100, Math.round((elapsed / DURATION) * 100));
            setLineHeights((prev) => ({ ...prev, [idx]: pct }));
            if (pct >= 100) clearInterval(iv);
          }, TICK);
        }
      }, idx * 500);
    });
  }, [tracking]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (!order) return;
    api.get(`/get-order-status/${order.orderId}`)
      .then((res) => {
        let data = res.data.map((step) => ({
          stage: step.stage,
          time: step.updatedDate,
          description: step.description,
        }));
      
        const isCancelled = order.status?.toUpperCase() === "CANCELED";
        if (isCancelled && !data.some((s) => s.stage === "CANCELED")) {
          data.push({ stage: "Canceled", time: new Date().toISOString(), description: "Order has been cancelled." });
        }
        if (
          order.refundStatus?.toUpperCase() === "COMPLETED" &&
          !data.some((s) => s.stage === "Refund Completed")
        ) {
          data.push({
            stage: "Refund Completed",
            time: order.refundDate || new Date().toISOString(),
            description: "",
          });
        }
        setTracking(data);
      })
      .catch((err) => console.error(err));
    api.get(`/ordered-user-details/${order.orderId}`)
      .then((res) => setUserAddressDetails(res.data))
      .catch((err) => console.error(err));
  }, [order]);

  if (!order) {
    return (
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "48px 24px", textAlign: "center", minHeight: "100vh", background: "#f9fafb" }}>
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #f0f0f0", padding: "48px 32px" }}>
          <p style={{ color: "#6b7280", marginBottom: 20 }}>No order selected.</p>
          <button
            onClick={() => navigate("/my-order")}
            style={{ padding: "8px 20px", background: "#059669", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer" }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const offerAmount = order.discountAmount || 0;
  const hasOffer = offerAmount > 0;
  const subtotal = order.totalPrice + offerAmount;
  const isCanceled = tracking.some((t) => t.stage === "CANCELED");
  const lastStage = tracking[tracking.length - 1]?.stage;

  const getDisplayDescription = (stage, description) => {
    switch (stage) {
      case "Ordered": return "Your order has been placed successfully! 🎉";
      case "Processing": return description ? ` ${description}` : `${description}`;
      case "Packed": return description ? `Order packed and ready for dispatch. Expected delivery by: ${description}` : "Order packed and ready for dispatch.";
      case "Shipped": return description ? `Your order has been shipped! Expected delivery by ${description}` : "Your order has been shipped!";
      case "Out For Delivery": return "Your order is out for delivery today! 🚚";
      case "Delivered": return description ? `Order delivered successfully on ${description}. Thank you!` : "Order delivered successfully. Thank you! ✅";
      case "Canceled": return "Order has been cancelled.";
      case "Return Requested": return "Return request submitted";
      case "Return Approved": return description ? `Your return has been approved! Pickup will be Expected on ${description}` : "Your return has been approved! Pickup will be scheduled soon.";
      case "Return Picked Up": return description ? `Item picked up successfully. Refund will be processed by ${description}` : "Item picked up successfully. Refund will be processed shortly.";
      case "Returned": return description ? `Item returned successfully on ${description}.` : "Item has been returned successfully.";
      case "Refund Completed": return "Refund has been processed successfully. Amount will reflect in 3-5 business days. ✅";
      default: return description || "";
    }
  };

  // Invoice View
  if (showInvoice) {
    return (
      <div style={{ background: "#f9fafb", minHeight: "100vh", padding: "24px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20, gap: 12, flexWrap: "wrap" }}>
            <button
              onClick={() => setShowInvoice(false)}
              style={{ padding: "6px 14px", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
              Back
            </button>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => window.print()}
                style={{ padding: "6px 14px", background: "#059669", color: "#fff", border: "none", borderRadius: 8, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 18"/><path d="M6 14L18 14"/><path d="M6 10L18 10"/><path d="M6 6L18 6"/></svg>
                Print
              </button>
            </div>
          </div>

          <div id="invoice-content" style={{ background: "#fff", borderRadius: 12, border: "1px solid #f0f0f0", padding: "32px" }}>
            {/* Header */}
            <div style={{ borderBottom: "2px solid #059669", paddingBottom: 20, marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
              <div>
                <div style={{ color: "#059669", fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Kirani Store</div>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: "#111827", margin: 0 }}>TAX INVOICE</h1>
              </div>
              <div style={{ textAlign: "right", fontSize: 11, color: "#6b7280" }}>
                <p style={{ fontWeight: 600, color: "#111827", margin: 0 }}>Kirani Store Private Limited</p>
                <p style={{ margin: "2px 0" }}>123 Market Street, Mangaluru</p>
                <p style={{ margin: 0 }}>GSTIN: 29XXXXX1234X1ZX</p>
              </div>
            </div>

            {/* Customer Info */}
            {userAddressDetails && (
              <div style={{ background: "#f0fdf4", border: "1px solid #d1fae5", borderRadius: 10, padding: 16, marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#059669", marginBottom: 12, textTransform: "uppercase" }}>📋 Customer Details</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10, fontSize: 12 }}>
                  <div><span style={{ fontWeight: 600 }}>Name:</span> {userAddressDetails.fullName || "N/A"}</div>
                  <div><span style={{ fontWeight: 600 }}>Phone:</span> {userAddressDetails.phone || "N/A"}</div>
                  <div><span style={{ fontWeight: 600 }}>Address:</span> {userAddressDetails.address || "N/A"}</div>
                  <div><span style={{ fontWeight: 600 }}>City:</span> {userAddressDetails.city || "N/A"} - {userAddressDetails.pincode || "N/A"}</div>
                </div>
              </div>
            )}

            {/* Invoice Info */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", marginBottom: 8 }}>Invoice Details</h3>
                <p style={{ fontSize: 12, margin: "4px 0" }}><strong>Order ID:</strong> #{order.orderId}</p>
                <p style={{ fontSize: 12, margin: "4px 0" }}><strong>Date:</strong> {new Date(order.timeOfOrder).toLocaleDateString()}</p>
              </div>
              <div>
                <h3 style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", marginBottom: 8 }}>Payment Info</h3>
                <p style={{ fontSize: 12, margin: "4px 0" }}><strong>Method:</strong> {order.paymentMethod || "COD"}</p>
                <p style={{ fontSize: 12, margin: "4px 0" }}><strong>Status:</strong> {order.status}</p>
              </div>
            </div>

            {/* Products Table */}
            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 20, fontSize: 12 }}>
              <thead>
                <tr style={{ background: "#f9fafb", borderBottom: "2px solid #e5e7eb" }}>
                  <th style={{ padding: "10px", textAlign: "left" }}>#</th>
                  <th style={{ padding: "10px", textAlign: "left" }}>Product</th>
                  <th style={{ padding: "10px", textAlign: "center" }}>Qty</th>
                  <th style={{ padding: "10px", textAlign: "right" }}>Price</th>
                  <th style={{ padding: "10px", textAlign: "right" }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {order.productList?.map((p, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid #f0f0f0" }}>
                    <td style={{ padding: "8px" }}>{idx + 1}</td>
                    <td style={{ padding: "8px", fontWeight: 500 }}>{p.productName}</td>
                    <td style={{ padding: "8px", textAlign: "center" }}>{p.quantity}</td>
                    <td style={{ padding: "8px", textAlign: "right" }}>₹{(p.price / p.quantity).toFixed(2)}</td>
                    <td style={{ padding: "8px", textAlign: "right", fontWeight: 500 }}>₹{p.price.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <div style={{ width: 280 }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 12 }}>
                  <span>Subtotal:</span><span>₹{subtotal.toFixed(2)}</span>
                </div>
                {hasOffer && (
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 12, color: "#059669" }}>
                    <span>🎉 Special Offer:</span><span>− ₹{offerAmount.toFixed(2)}</span>
                  </div>
                )}
                <div style={{ borderTop: "1px solid #e5e7eb", marginTop: 8, paddingTop: 8, display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 700 }}>
                  <span>Total:</span><span>₹{order.totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ textAlign: "center", marginTop: 24, paddingTop: 16, borderTop: "1px solid #f0f0f0", fontSize: 10, color: "#9ca3af" }}>
              Thank you for shopping with Kirani Store! · support@kiranistore.com
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Order Details View
  return (
    <div style={{ background: "#f9fafb", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "24px 20px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => navigate("/my-order")}
              style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: "6px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
              Back
            </button>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111827", margin: 0 }}>Order #{order.orderId}</h1>
          </div>
          <button
            onClick={() => setShowInvoice(true)}
            style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: "6px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            View Invoice
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24, alignItems: "start" }}>

          {/* LEFT - Order Details */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* User Info Card */}
            {userAddressDetails && (
              <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #f0f0f0", padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 40, background: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 600, color: "#d97706" }}>
                  {userAddressDetails.fullName?.charAt(0).toUpperCase() || "U"}
                </div>
                <div>
                  <p style={{ fontSize: 10, color: "#d97706", fontWeight: 600, margin: 0 }}>ORDER PLACED BY</p>
                  <p style={{ fontWeight: 600, fontSize: 13, margin: "2px 0 0", color: "#111827" }}>{userAddressDetails.fullName || "N/A"}</p>
                  <p style={{ fontSize: 11, color: "#6b7280", margin: "2px 0 0" }}>{userAddressDetails.phone || "N/A"} • {userAddressDetails.city || "N/A"}</p>
                </div>
              </div>
            )}

            {/* Products Card */}
            <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #f0f0f0", padding: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div>
                  <p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>Placed on</p>
                  <p style={{ fontSize: 12, color: "#111827", margin: "2px 0 0" }}>{new Date(order.timeOfOrder).toLocaleString()}</p>
                </div>
                <span style={{
                  padding: "2px 10px",
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 600,
                  background: isCanceled ? "#fef2f2" : "#f0fdf4",
                  color: isCanceled ? "#dc2626" : "#059669",
                }}>
                  {order.status}
                </span>
              </div>

              {order.productList?.map((p, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < order.productList.length - 1 ? "1px solid #f0f0f0" : "none" }}>
                  <img src={p.productImage || "/placeholder.png"} alt={p.productName} style={{ width: 48, height: 48, borderRadius: 8, objectFit: "cover", background: "#f9fafb" }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 500, fontSize: 13, margin: 0 }}>{p.productName}</p>
                    <p style={{ fontSize: 11, color: "#9ca3af", margin: "2px 0 0" }}>Qty: {p.quantity} × ₹{(p.price / p.quantity).toFixed(2)}</p>
                  </div>
                  <p style={{ fontWeight: 600, fontSize: 13, margin: 0 }}>₹{p.price.toFixed(2)}</p>
                </div>
              ))}

              {/* Totals */}
              <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid #f0f0f0" }}>
                {hasOffer && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                    <span style={{ color: "#6b7280" }}>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                )}
                {hasOffer && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6, color: "#059669" }}>
                    <span>🎉 Special Offer</span>
                    <span>− ₹{offerAmount.toFixed(2)}</span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 700, marginTop: 8 }}>
                  <span>Total</span>
                  <span style={{ color: "#059669" }}>₹{order.totalPrice.toFixed(2)}</span>
                </div>
                {hasOffer && (
                  <div style={{ marginTop: 8, textAlign: "right" }}>
                    <span style={{ fontSize: 10, background: "#f0fdf4", color: "#059669", padding: "2px 8px", borderRadius: 12 }}>Saved ₹{offerAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Delivery Address Card */}
            {userAddressDetails && (
              <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #f0f0f0", padding: "16px" }}>
                <h3 style={{ fontSize: 13, fontWeight: 600, margin: "0 0 12px", display: "flex", alignItems: "center", gap: 6 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 6v12h22V6H1z"/><path d="M1 6l11 7 11-7"/></svg>
                  Delivery Address
                </h3>
                <p style={{ fontWeight: 600, fontSize: 13, margin: 0 }}>{userAddressDetails.fullName}</p>
                <p style={{ fontSize: 12, color: "#6b7280", margin: "4px 0" }}>{userAddressDetails.address}</p>
                <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>{userAddressDetails.city} - {userAddressDetails.pincode}</p>
                <p style={{ fontSize: 12, color: "#6b7280", margin: "4px 0 0" }}>📱 {userAddressDetails.phone}</p>
              </div>
            )}
          </div>

          {/* RIGHT - Tracking Timeline */}
          <div style={{ position: "sticky", top: 80 }}>
            <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #f0f0f0", padding: "16px" }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 16px", display: "flex", alignItems: "center", gap: 6 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                Tracking Timeline
              </h3>

              {tracking.length === 0 ? (
                <p style={{ color: "#9ca3af", fontSize: 12, textAlign: "center", padding: "20px" }}>Loading tracking info...</p>
              ) : (
                <div>
                  {tracking.map((step, idx) => {
                    const isVisible = idx < visibleCount;
                    const isLast = idx === tracking.length - 1;
                    const lineH = lineHeights[idx] ?? 0;
                    const dotColor = getDotColor(step.stage);
                    const lineColor = getLineColor(step.stage);

                    const d = new Date(step.time);
                    const dateStr = d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
                    const timeStr = d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
                    const displayDesc = getDisplayDescription(step.stage, step.description);

                    return (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          gap: 12,
                          opacity: isVisible ? 1 : 0,
                          transform: isVisible ? "translateY(0)" : "translateY(8px)",
                          transition: "opacity 0.35s ease, transform 0.35s ease",
                        }}
                      >
                        {/* Dot + Line Column */}
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 20, flexShrink: 0 }}>
                          <div
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: 8,
                              background: dotColor,
                              marginTop: 4,
                              transform: isVisible ? "scale(1)" : "scale(0)",
                              transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1)",
                            }}
                          />
                          {!isLast && (
                            <div
                              style={{
                                width: 2,
                                flex: 1,
                                minHeight: 40,
                                background: `linear-gradient(to bottom, ${lineColor} ${lineH}%, #e5e7eb ${lineH}%)`,
                                transition: "background 0.016s linear",
                              }}
                            />
                          )}
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1, paddingBottom: 16 }}>
                          <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                            <p style={{ fontWeight: 600, fontSize: 12, color: getStageTextColor(step.stage), margin: 0 }}>
                              {step.stage}
                            </p>
                            <p style={{ fontSize: 10, color: "#9ca3af", margin: 0 }}>{dateStr} • {timeStr}</p>
                          </div>
                          {displayDesc && (
                            <p style={{ fontSize: 11, color: getDescriptionTextColor(step.stage), margin: 0, lineHeight: 1.4 }}>
                              {displayDesc}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Current Status Badge */}
              {tracking.length > 0 && visibleCount >= tracking.length && (
                <div style={{
                  marginTop: 16,
                  padding: "12px",
                  borderRadius: 10,
                  background: isCanceled ? "#fef2f2" : lastStage?.includes("Return") ? "#fff7ed" : isCustom(lastStage || "") ? "#f5f3ff" : "#f0fdf4",
                  border: `1px solid ${isCanceled ? "#fee2e2" : lastStage?.includes("Return") ? "#fed7aa" : isCustom(lastStage || "") ? "#e9d5ff" : "#d1fae5"}`,
                }}>
                  <p style={{ fontSize: 10, color: "#6b7280", margin: "0 0 4px" }}>Current Status</p>
                  <p style={{ fontSize: 13, fontWeight: 600, margin: 0, color: getStageTextColor(lastStage || "") }}>{lastStage}</p>
                </div>
              )}
            </div>
          </div>
        </div>
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