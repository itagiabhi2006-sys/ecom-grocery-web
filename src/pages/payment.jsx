import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../Api";
import { useAuth } from "../contexts/AuthContext";
import {
  CreditCard, Banknote, Shield, Package,
  MapPin, ArrowLeft, CheckCircle, Wallet,
  Truck, Sparkles, Lock
} from "lucide-react";

export default function Payment() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [orderItems, setOrderItems] = useState([]);
  const [address, setAddress] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState("online");
  const [isLoading, setIsLoading] = useState(false);

  const addressId    = location.state?.addressId;
  const buyNowItems  = location.state?.buyNowItems  || null;
  const displayItems = location.state?.displayItems || null;
  const isBuyNow     = !!buyNowItems;
  const offerApplied = location.state?.offerApplied || false;
  const offerAmount  = location.state?.offerAmount  || 0;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (!user) {
      toast.error("Please login to continue");
      navigate("/login");
      return;
    }
    if (!addressId) {
      toast.error("Please complete checkout details");
      navigate("/checkout");
      return;
    }
    loadOrderPreview();
  }, [user, addressId]);

  const loadOrderPreview = async () => {
    try {
      const addrRes = await api.get(`/user-address-details/${user.id}`);
      const found = (addrRes.data || []).find((a) => a.id === addressId);
      if (!found) {
        toast.error("Selected address not found");
        navigate("/checkout");
        return;
      }
      setAddress(found);

      if (isBuyNow) {
        setOrderItems(displayItems || []);
      } else {
        const cartRes = await api.get(`/get-cart-details/${user.id}`);
        const cartData = cartRes.data || [];
        setOrderItems(
          cartData.map((item) => {
            const prod = item.products || {};
            const hasDiscount = prod.discountFinalPrice != null && prod.discountFinalPrice !== 0;
            const price = hasDiscount ? prod.discountFinalPrice : prod.price || 0;
            return { id: prod.id, title: prod.title, imageURL: prod.imageURL, price, qty: item.quantity };
          })
        );
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load order details");
    }
  };

  const rawTotal   = orderItems.reduce((sum, i) => sum + i.price * i.qty, 0);
  const finalTotal = offerApplied && !isBuyNow ? rawTotal - offerAmount : rawTotal;

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handleOnlinePayment = async () => {
    setIsLoading(true);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error("Failed to load payment gateway");
        setIsLoading(false);
        return;
      }

      const amountInPaise = Math.round(finalTotal * 100);
      const orderResponse = await api.post("/payment/create-razorpay-order", {
        amount: amountInPaise,
        currency: "INR",
      });
      const { orderId, amount: orderAmount } = orderResponse.data;

      const options = {
        key: "rzp_test_RpWyeg33wKUMJY",
        amount: orderAmount,
        currency: "INR",
        name: "Kirani Store",
        description: orderItems.length === 1 ? orderItems[0].title : `${orderItems.length} items`,
        order_id: orderId,
        handler: async function (response) {
          await createOrder("ONLINE", response);
        },
        prefill: {
          name: address?.fullName,
          email: user.email || "",
          contact: address?.phone,
        },
        theme: { color: "#1e3a8a" },
        modal: {
          ondismiss: function () {
            setIsLoading(false);
            toast.error("Payment cancelled");
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      console.error(err);
      toast.error("Failed to initiate payment");
      setIsLoading(false);
    }
  };

  const handleCODPayment = async () => {
    setIsLoading(true);
    await createOrder("COD", null);
  };

  const createOrder = async (paymentMethod, razorpayResponse) => {
    const payload = {
      userId: user.id,
      addressId: addressId,
      paymentMethod: paymentMethod,
      paymentDetails: razorpayResponse
        ? {
            razorpay_payment_id: razorpayResponse.razorpay_payment_id,
            razorpay_order_id:   razorpayResponse.razorpay_order_id,
            razorpay_signature:  razorpayResponse.razorpay_signature,
          }
        : null,
      items: isBuyNow ? buyNowItems : null,
      applyOffer: !isBuyNow && offerApplied,
    };

    try {
      await api.post("/create-order", payload);
      navigate("/order-success");
    } catch (err) {
      console.error(err);
      toast.error("Failed to place order");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = () => {
    if (finalTotal < 100) {
      toast.error("Order amount must be at least ₹100");
      return;
    }
    if (selectedPayment === "online") handleOnlinePayment();
    else handleCODPayment();
  };

  if (!address || orderItems.length === 0) {
    return (
      <div style={{ background: "#f9fafb", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <svg style={{ width: 48, height: 48, animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#1e3a8a" strokeWidth="4" strokeOpacity="0.25" />
            <path d="M4 12a8 8 0 018-8v8H4z" fill="#1e3a8a" stroke="none" />
          </svg>
          <p style={{ color: "#6b7280" }}>Loading payment details...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#f9fafb", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 20px" }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              marginBottom: 16,
              background: "none",
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 500,
              color: "#6b7280",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "#f9fafb";
              e.currentTarget.style.borderColor = "#1e3a8a";
              e.currentTarget.style.color = "#1e3a8a";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "none";
              e.currentTarget.style.borderColor = "#e5e7eb";
              e.currentTarget.style.color = "#6b7280";
            }}
          >
            <ArrowLeft size={14} />
            Back to Checkout
          </button>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#111827", margin: 0 }}>
            Payment
          </h1>
          <p style={{ color: "#6b7280", fontSize: 13, margin: "6px 0 0" }}>
            Choose your preferred payment method
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 24, alignItems: "start" }}>

          {/* LEFT - Payment Methods */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Online Payment */}
            <div
              onClick={() => setSelectedPayment("online")}
              style={{
                background: "#fff",
                borderRadius: 12,
                border: `2px solid ${selectedPayment === "online" ? "#1e3a8a" : "#f0f0f0"}`,
                padding: "20px",
                cursor: "pointer",
                transition: "all 0.2s",
                boxShadow: selectedPayment === "online" ? "0 4px 12px rgba(30,58,138,0.1)" : "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  border: `2px solid ${selectedPayment === "online" ? "#1e3a8a" : "#d1d5db"}`,
                  background: selectedPayment === "online" ? "#1e3a8a" : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 2,
                  flexShrink: 0,
                }}>
                  {selectedPayment === "online" && (
                    <div style={{ width: 8, height: 8, background: "#fff", borderRadius: "50%" }} />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <CreditCard size={20} color="#1e3a8a" />
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: 0 }}>
                      Online Payment
                    </h3>
                    {selectedPayment === "online" && (
                      <span style={{
                        marginLeft: "auto",
                        fontSize: 10,
                        fontWeight: 600,
                        background: "#eff6ff",
                        color: "#1e3a8a",
                        padding: "2px 8px",
                        borderRadius: 12,
                      }}>
                        Selected
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 12 }}>
                    Pay securely using Credit Card, Debit Card, UPI, Net Banking, or Wallets
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {["💳 Cards", "📱 UPI", "👛 Wallets", "🏦 Net Banking"].map((item) => (
                      <span key={item} style={{
                        padding: "2px 10px",
                        background: "#f3f4f6",
                        color: "#6b7280",
                        fontSize: 10,
                        fontWeight: 600,
                        borderRadius: 12,
                      }}>
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Cash on Delivery */}
            <div
              onClick={() => setSelectedPayment("cod")}
              style={{
                background: "#fff",
                borderRadius: 12,
                border: `2px solid ${selectedPayment === "cod" ? "#1e3a8a" : "#f0f0f0"}`,
                padding: "20px",
                cursor: "pointer",
                transition: "all 0.2s",
                boxShadow: selectedPayment === "cod" ? "0 4px 12px rgba(30,58,138,0.1)" : "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  border: `2px solid ${selectedPayment === "cod" ? "#1e3a8a" : "#d1d5db"}`,
                  background: selectedPayment === "cod" ? "#1e3a8a" : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 2,
                  flexShrink: 0,
                }}>
                  {selectedPayment === "cod" && (
                    <div style={{ width: 8, height: 8, background: "#fff", borderRadius: "50%" }} />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <Banknote size={20} color="#1e3a8a" />
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: 0 }}>
                      Cash on Delivery
                    </h3>
                    {selectedPayment === "cod" && (
                      <span style={{
                        marginLeft: "auto",
                        fontSize: 10,
                        fontWeight: 600,
                        background: "#eff6ff",
                        color: "#1e3a8a",
                        padding: "2px 8px",
                        borderRadius: 12,
                      }}>
                        Selected
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 12 }}>
                    Pay with cash when your order is delivered to your doorstep
                  </p>
                  <div style={{
                    padding: "8px 12px",
                    background: "#fffbeb",
                    borderRadius: 8,
                    border: "1px solid #fde68a",
                  }}>
                    <span style={{ fontSize: 11, color: "#d97706" }}>💵 Keep exact change ready for a smooth delivery</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Badge */}
            <div style={{
              background: "#eff6ff",
              borderRadius: 12,
              padding: "16px",
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              border: "1px solid #bfdbfe",
            }}>
              <Lock size={18} color="#1e3a8a" />
              <div>
                <h4 style={{ fontSize: 12, fontWeight: 700, color: "#1e3a8a", margin: "0 0 4px" }}>
                  Secure Payment
                </h4>
                <p style={{ fontSize: 11, color: "#1e3a8a", margin: 0 }}>
                  Your payment information is encrypted and secure. We never store your card details.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT - Order Summary */}
          <div style={{ position: "sticky", top: 24 }}>
            <div style={{
              background: "#fff",
              borderRadius: 12,
              border: "1px solid #f0f0f0",
              padding: "20px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <Package size={18} color="#1e3a8a" />
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "#111827", margin: 0 }}>
                  Order Summary
                </h3>
              </div>

              {/* Order Items */}
              <div style={{ maxHeight: 280, overflowY: "auto", marginBottom: 16 }}>
                {orderItems.map((item, idx) => (
                  <div key={idx} style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 0",
                    borderBottom: idx < orderItems.length - 1 ? "1px solid #f0f0f0" : "none",
                  }}>
                    {item.imageURL && (
                      <img
                        src={item.imageURL}
                        alt={item.title}
                        style={{ width: 48, height: 48, objectFit: "contain", borderRadius: 8, background: "#f9fafb" }}
                      />
                    )}
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: "#111827", margin: 0 }}>
                        {item.title}
                      </p>
                      <p style={{ fontSize: 10, color: "#6b7280", margin: "2px 0 0" }}>
                        Qty: {item.qty} × ₹{item.price.toFixed(2)}
                      </p>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#1e3a8a" }}>
                      ₹{(item.qty * item.price).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Delivery Address */}
              <div style={{
                background: "#f9fafb",
                borderRadius: 10,
                padding: "12px",
                marginBottom: 16,
                border: "1px solid #f0f0f0",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <MapPin size={14} color="#1e3a8a" />
                  <h4 style={{ fontSize: 11, fontWeight: 700, color: "#111827", margin: 0 }}>
                    Delivery Address
                  </h4>
                </div>
                <p style={{ fontSize: 11, color: "#374151", margin: "0 0 2px", fontWeight: 500 }}>
                  {address.fullName}
                </p>
                <p style={{ fontSize: 10, color: "#6b7280", margin: "0 0 2px" }}>
                  {address.phone}
                </p>
                <p style={{ fontSize: 10, color: "#6b7280", margin: 0 }}>
                  {address.address}, {address.city} - {address.pincode}
                </p>
              </div>

              {/* Price Breakdown */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 8 }}>
                  <span style={{ color: "#6b7280" }}>Subtotal ({orderItems.length} items)</span>
                  <span style={{ color: "#111827" }}>₹{rawTotal.toFixed(2)}</span>
                </div>
                {offerApplied && !isBuyNow && offerAmount > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 8, color: "#059669" }}>
                    <span>🎉 Special Offer</span>
                    <span>− ₹{offerAmount.toFixed(2)}</span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 8 }}>
                  <span style={{ color: "#6b7280" }}>Delivery Charges</span>
                  <span style={{ color: "#059669", fontWeight: 600 }}>FREE</span>
                </div>
                <div style={{ borderTop: "1px solid #f0f0f0", marginTop: 8, paddingTop: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 700 }}>
                    <span style={{ color: "#111827" }}>Total Amount</span>
                    <span style={{ color: "#1e3a8a" }}>₹{finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                onClick={handlePayment}
                disabled={isLoading}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: 10,
                  background: "#1e3a8a",
                  color: "#fff",
                  border: "none",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: isLoading ? "not-allowed" : "pointer",
                  opacity: isLoading ? 0.6 : 1,
                  transition: "background 0.2s",
                }}
                onMouseOver={(e) => { if (!isLoading) e.currentTarget.style.background = "#1e40af"; }}
                onMouseOut={(e) => { if (!isLoading) e.currentTarget.style.background = "#1e3a8a"; }}
              >
                {isLoading ? (
                  <>
                    <svg style={{ width: 16, height: 16, animation: "spin 0.8s linear infinite", display: "inline-block", marginRight: 8 }} viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="#fff" strokeWidth="4" strokeOpacity="0.25" />
                      <path d="M4 12a8 8 0 018-8v8H4z" fill="#fff" stroke="none" />
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} style={{ display: "inline-block", marginRight: 8 }} />
                    {selectedPayment === "online" ? `Pay ₹${finalTotal.toFixed(2)}` : "Place Order (COD)"}
                  </>
                )}
              </button>

              {selectedPayment === "online" && (
                <p style={{ fontSize: 10, color: "#9ca3af", textAlign: "center", marginTop: 12 }}>
                  You will be redirected to Razorpay payment gateway
                </p>
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