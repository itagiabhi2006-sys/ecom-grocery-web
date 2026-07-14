import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../Api";
import { useAuth } from "../contexts/AuthContext";

export default function OrdersList() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  // Return request modal
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [returnDesc, setReturnDesc] = useState("");
  const [returnLoading, setReturnLoading] = useState(false);

  // COD bank details modal
  const [showBankDetailsModal, setShowBankDetailsModal] = useState(false);
  const [bankDetailsOrderId, setBankDetailsOrderId] = useState(null);
  const [bankForm, setBankForm] = useState({
    method: "UPI",
    upi: "",
    accountNumber: "",
    ifsc: "",
  });
  const [bankLoading, setBankLoading] = useState(false);

  const fetchOrders = () => {
    return api
      .get(`/order-details/${user.id}`)
      .then((res) => {
        const sorted = res.data.sort(
          (a, b) => new Date(b.timeOfOrder) - new Date(a.timeOfOrder)
        );
        setOrders(sorted);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (!user?.id) return;
    fetchOrders().finally(() => setLoading(false));
  }, [user]);

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      await api.get(`/cancel-order/${id}`);
      setOrders((prev) =>
        prev.map((o) => (o.orderId === id ? { ...o, status: "Canceled" } : o))
      );
    } catch (err) {
      alert("Failed to cancel order");
    }
  };

  const handleReturnRequest = (orderId) => {
    setSelectedOrderId(orderId);
    setShowReturnModal(true);
  };

  const submitReturn = async () => {
    if (!returnDesc.trim()) {
      alert("Please provide a reason for return");
      return;
    }
    setReturnLoading(true);
    try {
      await api.get(
        `/update-track-record/${selectedOrderId}/${encodeURIComponent(returnDesc)}`
      );
      setOrders((prev) =>
        prev.map((o) =>
          o.orderId === selectedOrderId
            ? { ...o, status: "RETURN REQUESTED" }
            : o
        )
      );
      alert("Return request submitted successfully");
      setShowReturnModal(false);
      setReturnDesc("");
      setSelectedOrderId(null);
    } catch (err) {
      alert("Failed to submit return request. Please try again.");
    } finally {
      setReturnLoading(false);
    }
  };

  const openBankDetailsModal = (orderId) => {
    setBankDetailsOrderId(orderId);
    setBankForm({ method: "UPI", upi: "", accountNumber: "", ifsc: "" });
    setShowBankDetailsModal(true);
  };

  const submitBankDetails = async () => {
    if (bankForm.method === "UPI" && !bankForm.upi.trim()) {
      alert("Please enter your UPI ID");
      return;
    }
    if (
      bankForm.method === "BANK" &&
      (!bankForm.accountNumber.trim() || !bankForm.ifsc.trim())
    ) {
      alert("Please enter both account number and IFSC");
      return;
    }
    setBankLoading(true);
    try {
      await api.post(`/order/cod-refund-details/${bankDetailsOrderId}`, {
        method: bankForm.method,
        upi: bankForm.upi || null,
        accountNumber: bankForm.accountNumber || null,
        ifsc: bankForm.ifsc || null,
      });
      alert("Refund details submitted! The admin will process your refund shortly.");
      setShowBankDetailsModal(false);
      setBankDetailsOrderId(null);
      setOrders((prev) =>
        prev.map((o) =>
          o.orderId === bankDetailsOrderId
            ? {
                ...o,
                refundStatus: "PENDING",
                refundMethod: bankForm.method,
                refundUpi: bankForm.upi || null,
                bankAccountNumber: bankForm.accountNumber || null,
              }
            : o
        )
      );
      await fetchOrders();
    } catch (err) {
      alert("Failed to submit refund details. Please try again.");
    } finally {
      setBankLoading(false);
    }
  };

  const isReturnAvailable = (order) => {
    const status = order.status?.toUpperCase?.() || "";
    if (status !== "DELIVERED") return false;
    const deliveryTime = order.deliveryDate
      ? new Date(order.deliveryDate)
      : new Date(order.timeOfOrder);
    const timeDiff = new Date() - deliveryTime;
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    return timeDiff <= sevenDays;
  };

  const isCOD = (order) => !order.paymentMode || order.paymentMode === "COD";
  const isOnline = (order) => order.paymentMode && order.paymentMode !== "COD";

  const needsBankDetails = (order) => {
    const status = order.status?.toUpperCase?.() || "";
    if (order.refundStatus && order.refundStatus !== "NOT_REQUESTED") return false;
    if (order.refundUpi || order.bankAccountNumber) return false;
    return (
      isCOD(order) &&
      (status === "RETURNED" || status === "RETURN")
    );
  };

  const showCodRefundPending = (order) => {
    const status = order.status?.toUpperCase?.() || "";
    return (
      isCOD(order) &&
      (status === "RETURNED" || status === "RETURN") &&
      order.refundStatus &&
      order.refundStatus !== "NOT_REQUESTED"
    );
  };

  const showOnlineRefundInfo = (order) => {
    const status = order.status?.toUpperCase?.() || "";
    return isOnline(order) && (status === "CANCELED" || status === "RETURNED");
  };

  const filteredOrders = orders.filter((o) => {
    const status = o.status?.toUpperCase?.() || "";

    if (filter === "all") return true;
    if (filter === "active")
      return ["ORDERED", "PROCESSING", "SHIPPED", "OUT FOR DELIVERY"].includes(status);
    if (filter === "delivered") return status === "DELIVERED";
    if (filter === "cancelled")
      return status === "CANCELED" || (status === "REFUND COMPLETED" && isOnline(o));
    if (filter === "returned")
      return (
        status === "RETURNED" ||
        status === "RETURN" ||
        status === "RETURN REQUESTED" ||
        status === "RETURN APPROVED" ||
        status === "RETURN PICKED UP" ||
        status === "REFUND COMPLETED"
      );
    return true;
  });

  const statusColor = (status) => {
    const s = status?.toUpperCase?.() || "";
    if (s === "CANCELED") return "#dc2626";
    if (s === "DELIVERED") return "#059669";
    if (s === "SHIPPED") return "#3b82f6";
    if (s === "PENDING") return "#d97706";
    if (s.includes("RETURN")) return "#ea580c";
    return "#6b7280";
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "48px 24px", textAlign: "center", minHeight: "100vh", background: "#f9fafb" }}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
          <svg style={{ width: 24, height: 24, animation: "spin 0.8s linear infinite" }} viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.25" />
            <path d="M4 12a8 8 0 018-8v8H4z" fill="currentColor" stroke="none" />
          </svg>
          <span style={{ color: "#6b7280", fontSize: 13 }}>Loading your orders...</span>
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
              <span style={{ fontSize: 26 }}>📦</span>
              My Orders
            </h1>
            <span style={{ background: "#f3f4f6", color: "#6b7280", fontSize: 12, fontWeight: 600, padding: "2px 10px", borderRadius: 20 }}>
              {orders.length} {orders.length === 1 ? "order" : "orders"}
            </span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
          {[
            { key: "all", label: "All" },
            { key: "active", label: "Active" },
            { key: "delivered", label: "Delivered" },
            { key: "cancelled", label: "Cancelled" },
            { key: "returned", label: "Returned" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{
                padding: "6px 16px",
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 600,
                border: `1px solid ${filter === f.key ? "#059669" : "#e5e7eb"}`,
                background: filter === f.key ? "#059669" : "#fff",
                color: filter === f.key ? "#fff" : "#6b7280",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px", background: "#fff", borderRadius: 12, border: "1px solid #f0f0f0" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
            <p style={{ color: "#9ca3af", fontSize: 13, margin: 0 }}>No orders found</p>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filteredOrders.map((order) => {
            const status = order.status?.toUpperCase?.() || "UNKNOWN";
            const isCancelled = status === "CANCELED";
            const isDelivered = status === "DELIVERED";
            const isReturnRequested = status.includes("RETURN");
            const isReturned = status === "RETURNED";
            const canReturn = isReturnAvailable(order);

            return (
              <div key={order.orderId}>
                <div
                  onClick={() => navigate(`/orders/${order.orderId}`, { state: order })}
                  style={{
                    background: "#fff",
                    borderRadius: 12,
                    padding: "14px 16px",
                    border: "1px solid #f0f0f0",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  className="order-card"
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ display: "flex", gap: 12, flex: 1, minWidth: 0 }}>
                      {/* Product image */}
                      <div style={{ width: 56, height: 56, borderRadius: 8, background: "#f9fafb", border: "1px solid #f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <img
                          src={order.productList[0]?.productImage || "/placeholder.png"}
                          alt={order.productList[0]?.productName}
                          style={{ width: 48, height: 48, objectFit: "contain" }}
                        />
                        {order.productList.length > 1 && (
                          <div style={{
                            position: "absolute",
                            marginTop: -16,
                            marginLeft: 32,
                            background: "#374151",
                            color: "#fff",
                            fontSize: 9,
                            fontWeight: 600,
                            padding: "1px 5px",
                            borderRadius: 10,
                          }}>
                            +{order.productList.length - 1}
                          </div>
                        )}
                      </div>

                      {/* Order info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: "#111827", marginBottom: 4 }}>
                          Order #{order.orderId}
                        </div>
                        <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 4 }}>
                          {new Date(order.timeOfOrder).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </div>
                        <div style={{ fontWeight: 600, fontSize: 13, color: "#059669", marginBottom: 4 }}>
                          ₹{order.totalPrice.toFixed(2)}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: statusColor(order.status) }}>
                            {status.charAt(0) + status.slice(1).toLowerCase().replace(/_/g, " ")}
                          </span>
                          <span style={{
                            fontSize: 9,
                            fontWeight: 600,
                            padding: "2px 8px",
                            borderRadius: 12,
                            background: isCOD(order) ? "#fef3c7" : "#dbeafe",
                            color: isCOD(order) ? "#d97706" : "#3b82f6",
                          }}>
                            {order.paymentMode || "COD"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: "flex", gap: 8, flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                      {!isCancelled && !isDelivered && !isReturnRequested && !isReturned &&
                        status !== "REFUND COMPLETED" &&
                        ["ORDERED", "PROCESSING", "SHIPPED", "OUT FOR DELIVERY"].includes(status) && (
                          <button
                            onClick={() => handleCancel(order.orderId)}
                            style={{
                              padding: "4px 12px",
                              borderRadius: 6,
                              fontSize: 11,
                              fontWeight: 500,
                              border: "none",
                              background: "#fee2e2",
                              color: "#dc2626",
                              cursor: "pointer",
                              transition: "all 0.2s",
                            }}
                          >
                            Cancel
                          </button>
                        )}

                      {isDelivered && canReturn && (
                        <button
                          onClick={() => handleReturnRequest(order.orderId)}
                          style={{
                            padding: "4px 12px",
                            borderRadius: 6,
                            fontSize: 11,
                            fontWeight: 500,
                            border: "none",
                            background: "#fff3e3",
                            color: "#ea580c",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="1 4 1 10 7 10" />
                            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                          </svg>
                          Return
                        </button>
                      )}

                      {isDelivered && !canReturn && (
                        <span style={{ fontSize: 10, color: "#9ca3af", fontStyle: "italic", padding: "4px 8px" }}>
                          Return period expired
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* COD Refund Bank Details Block */}
                {needsBankDetails(order) && (
                  <div style={{
                    marginTop: 8,
                    marginLeft: 20,
                    marginRight: 20,
                    padding: "10px 14px",
                    background: "#fefce8",
                    border: "1px solid #fde68a",
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    flexWrap: "wrap",
                  }}>
                    <div>
                      <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: "#854d0e" }}>💰 Refund Details Required</p>
                      <p style={{ margin: "2px 0 0", fontSize: 10, color: "#a16207" }}>Please submit your bank/UPI details for refund</p>
                    </div>
                    <button
                      onClick={() => openBankDetailsModal(order.orderId)}
                      style={{
                        padding: "4px 12px",
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 500,
                        background: "#d97706",
                        color: "#fff",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      Add Details
                    </button>
                  </div>
                )}

                {/* COD Refund Status Block */}
                {showCodRefundPending(order) && (
                  <div style={{
                    marginTop: 8,
                    marginLeft: 20,
                    marginRight: 20,
                    padding: "10px 14px",
                    background: order.refundStatus === "COMPLETED" ? "#f0fdf4" : "#f9fafb",
                    border: `1px solid ${order.refundStatus === "COMPLETED" ? "#86efac" : "#e5e7eb"}`,
                    borderRadius: 10,
                  }}>
                    <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: order.refundStatus === "COMPLETED" ? "#166534" : "#374151" }}>
                      {order.refundStatus === "COMPLETED"
                        ? "✅ Refund Completed"
                        : order.refundStatus === "APPROVED"
                        ? "✓ Refund Approved"
                        : "⏳ Refund Pending"}
                    </p>
                    <p style={{ margin: "2px 0 0", fontSize: 10, color: "#6b7280" }}>
                      Method: {order.refundMethod}
                      {order.refundUpi && ` · ${order.refundUpi}`}
                    </p>
                  </div>
                )}

                {/* Online Refund Info Block */}
                {showOnlineRefundInfo(order) && (
                  <div style={{
                    marginTop: 8,
                    marginLeft: 20,
                    marginRight: 20,
                    padding: "10px 14px",
                    background: "#eff6ff",
                    border: "1px solid #bfdbfe",
                    borderRadius: 10,
                  }}>
                    <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: "#1e40af" }}>
                      {status === "CANCELED" ? "↩ Refund in Progress" : "↩ Return & Refund in Progress"}
                    </p>
                    <p style={{ margin: "2px 0 0", fontSize: 10, color: "#3b82f6" }}>
                      Refund will be initiated to your original payment method (5-7 business days)
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Return Reason Modal */}
      {showReturnModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "16px" }}>
          <div style={{ background: "#fff", borderRadius: 12, maxWidth: 400, width: "100%", padding: "20px" }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 8px", color: "#111827" }}>Request Return</h2>
            <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 16 }}>Order #{selectedOrderId} — Please tell us why you're returning this item.</p>
            <textarea
              value={returnDesc}
              onChange={(e) => setReturnDesc(e.target.value)}
              placeholder="e.g. Defective product, Wrong item received, Not satisfied with quality..."
              rows={4}
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                fontSize: 12,
                marginBottom: 16,
                fontFamily: "inherit",
              }}
            />
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button
                onClick={() => { setShowReturnModal(false); setReturnDesc(""); setSelectedOrderId(null); }}
                style={{ padding: "6px 16px", borderRadius: 6, fontSize: 12, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                onClick={submitReturn}
                disabled={returnLoading}
                style={{
                  padding: "6px 16px",
                  borderRadius: 6,
                  fontSize: 12,
                  border: "none",
                  background: "#ea580c",
                  color: "#fff",
                  cursor: returnLoading ? "not-allowed" : "pointer",
                  opacity: returnLoading ? 0.6 : 1,
                }}
              >
                {returnLoading ? "Submitting..." : "Submit Return"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COD Bank/UPI Details Modal */}
      {showBankDetailsModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "16px" }}>
          <div style={{ background: "#fff", borderRadius: 12, maxWidth: 400, width: "100%", padding: "20px" }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 8px", color: "#111827" }}>Refund Details</h2>
            <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 16 }}>Order #{bankDetailsOrderId} — Please provide your refund account details.</p>

            {/* Method toggle */}
            <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
              {["UPI", "BANK"].map((m) => (
                <button
                  key={m}
                  onClick={() => setBankForm({ method: m, upi: "", accountNumber: "", ifsc: "" })}
                  style={{
                    flex: 1,
                    padding: "6px",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 500,
                    border: `1px solid ${bankForm.method === m ? "#059669" : "#e5e7eb"}`,
                    background: bankForm.method === m ? "#f0fdf4" : "#fff",
                    color: bankForm.method === m ? "#059669" : "#6b7280",
                    cursor: "pointer",
                  }}
                >
                  {m === "UPI" ? "📱 UPI" : "🏦 Bank Transfer"}
                </button>
              ))}
            </div>

            {bankForm.method === "UPI" ? (
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 500, color: "#374151", marginBottom: 4, display: "block" }}>UPI ID *</label>
                <input
                  type="text"
                  placeholder="yourname@upi"
                  value={bankForm.upi}
                  onChange={(e) => setBankForm({ ...bankForm, upi: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 12 }}
                />
              </div>
            ) : (
              <div style={{ marginBottom: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 500, color: "#374151", marginBottom: 4, display: "block" }}>Account Number *</label>
                  <input
                    type="text"
                    placeholder="Enter account number"
                    value={bankForm.accountNumber}
                    onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 12 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 500, color: "#374151", marginBottom: 4, display: "block" }}>IFSC Code *</label>
                  <input
                    type="text"
                    placeholder="e.g. SBIN0001234"
                    value={bankForm.ifsc}
                    onChange={(e) => setBankForm({ ...bankForm, ifsc: e.target.value.toUpperCase() })}
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 12 }}
                  />
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button
                onClick={() => { setShowBankDetailsModal(false); setBankDetailsOrderId(null); }}
                style={{ padding: "6px 16px", borderRadius: 6, fontSize: 12, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                onClick={submitBankDetails}
                disabled={bankLoading}
                style={{
                  padding: "6px 16px",
                  borderRadius: 6,
                  fontSize: 12,
                  border: "none",
                  background: "#059669",
                  color: "#fff",
                  cursor: bankLoading ? "not-allowed" : "pointer",
                  opacity: bankLoading ? 0.6 : 1,
                }}
              >
                {bankLoading ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .order-card:hover {
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          border-color: #e5e7eb;
        }
      `}</style>
    </div>
  );
}