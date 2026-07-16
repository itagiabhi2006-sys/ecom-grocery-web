import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../Api";
import { useAuth } from "../contexts/AuthContext";
import { optimizeImage } from '../utils/imageOptimizer';
import {
  MapPin, Trash2, Check, Package,
  Plus, ArrowRight, Edit2,
} from "lucide-react";

function resolvePrice(product) {
  const hasDiscount = product?.discountFinalPrice != null && product?.discountFinalPrice !== 0;
  return hasDiscount ? product.discountFinalPrice : (product?.price || 0);
}

export default function Checkout2() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const { product, quantity = 1 } = location.state || {};

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showManualForm, setShowManualForm] = useState(false);
  const [form, setForm] = useState({
    name: "", phone: "", address: "", city: "", pincode: "",
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (!user) {
      toast.error("Please login before checkout");
      navigate("/login");
      return;
    }
    if (!product) {
      toast.error("No product selected for Buy Now");
      navigate("/");
      return;
    }
    loadSavedAddresses();
  }, [user]);

  const loadSavedAddresses = async () => {
    try {
      const res = await api.get(`/user-address-details/${user.id}`);
      setAddresses(res.data || []);
      if (res.data && res.data.length === 0) setShowManualForm(true);
    } catch {
      toast.error("Failed to load saved addresses");
    }
  };

  const handleSelectAddress = (addr) => {
    setSelectedAddress(addr);
    setShowManualForm(false);
    setForm({
      name: addr.fullName, phone: addr.phone,
      address: addr.address, city: addr.city, pincode: addr.pincode,
    });
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm("Delete this address?")) return;
    try {
      await api.delete(`/user-address-delete/${id}`);
      toast.success("Address deleted");
      if (selectedAddress?.id === id) {
        setSelectedAddress(null);
        setForm({ name: "", phone: "", address: "", city: "", pincode: "" });
      }
      loadSavedAddresses();
    } catch {
      toast.error("Failed to delete address");
    }
  };

  const handleUpdateAddress = async (id) => {
    try {
      await api.post(`/user-address-update/${id}`, {
        fullName: form.name, phone: form.phone,
        address: form.address, city: form.city, pincode: form.pincode,
      });
      toast.success("Address updated");
      loadSavedAddresses();
    } catch {
      toast.error("Failed to update address");
    }
  };

  const handleSaveNewAddress = async () => {
    if (!form.name || !form.phone || !form.address || !form.city || !form.pincode) {
      toast.error("Please fill all required fields");
      return;
    }
    try {
      const res = await api.post("/add-address", {
        fullName: form.name, userId: Number(user.id),
        phone: form.phone, address: form.address,
        city: form.city, pincode: form.pincode,
      });
      toast.success("Address saved successfully");
      setShowManualForm(false);
      setSelectedAddress(res.data);
      loadSavedAddresses();
    } catch {
      toast.error("Failed to save new address");
    }
  };

  const handleAddNewAddress = () => {
    setSelectedAddress(null);
    setShowManualForm(true);
    setForm({ name: "", phone: "", address: "", city: "", pincode: "" });
  };

  const proceedToPayment = () => {
    if (!selectedAddress) {
      toast.error("Please select or save an address first");
      return;
    }

    navigate("/payment", {
      state: {
        addressId: selectedAddress.id,
        buyNowItems: [{ productId: product.id, quantity: quantity }],
        displayItems: [{
          id: product.id,
          title: product.title,
          imageURL: product.imageURL,
          price: resolvePrice(product),
          qty: quantity,
        }],
      },
    });
  };

  const unitPrice = resolvePrice(product || {});
  const hasDiscount = product?.discountFinalPrice != null && product?.discountFinalPrice !== 0;
  const itemTotal = unitPrice * quantity;

  if (!product) {
    return (
      <div style={{ background: "#f9fafb", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #f0f0f0", padding: "48px 32px", textAlign: "center" }}>
          <Package size={48} color="#9ca3af" style={{ margin: "0 auto 16px" }} />
          <p style={{ color: "#6b7280", fontSize: 13 }}>Loading product details...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#f9fafb", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 24px" }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "#111827", margin: 0 }}>Buy Now</h1>
          <p style={{ color: "#6b7280", fontSize: 13, margin: "6px 0 0" }}>Confirm your order and delivery address</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 28, alignItems: "start" }}>

          {/* LEFT - Address Section */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Saved Addresses */}
            {addresses.length > 0 && (
              <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #f0f0f0", padding: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: "#111827", margin: 0 }}>Saved Addresses</h3>
                  <button
                    onClick={handleAddNewAddress}
                    style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", background: "#1e3a8a", color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: "pointer" }}
                    onMouseOver={(e) => e.currentTarget.style.background = "#1e40af"}
                    onMouseOut={(e) => e.currentTarget.style.background = "#1e3a8a"}
                  >
                    <Plus size={14} /> Add New
                  </button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      onClick={() => handleSelectAddress(addr)}
                      style={{
                        padding: "12px 14px",
                        border: `2px solid ${selectedAddress?.id === addr.id ? "#1e3a8a" : "#f0f0f0"}`,
                        borderRadius: 10,
                        background: selectedAddress?.id === addr.id ? "#eff6ff" : "#fff",
                        cursor: "pointer",
                        position: "relative",
                      }}
                    >
                      {selectedAddress?.id === addr.id && (
                        <div style={{ position: "absolute", top: 10, right: 10, width: 20, height: 20, background: "#1e3a8a", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Check size={12} color="#fff" />
                        </div>
                      )}
                      <div style={{ fontWeight: 600, fontSize: 13, color: "#111827", marginBottom: 3 }}>{addr.fullName}</div>
                      <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 3 }}>{addr.phone}</div>
                      <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>{addr.address}, {addr.city} - {addr.pincode}</div>
                      <div style={{ display: "flex", gap: 12 }}>
                        <button onClick={(e) => { e.stopPropagation(); handleSelectAddress(addr); }} style={{ fontSize: 11, color: "#1e3a8a", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}>Use this address</button>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteAddress(addr.id); }} style={{ fontSize: 11, color: "#ef4444", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 3 }}>
                          <Trash2 size={11} /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Address Form */}
            {(selectedAddress || showManualForm) && (
              <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #f0f0f0", padding: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <MapPin size={18} color="#1e3a8a" />
                  <h2 style={{ fontSize: 15, fontWeight: 700, color: "#111827", margin: 0 }}>
                    {selectedAddress ? "Edit Address" : "Add New Address"}
                  </h2>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full Name" style={inputStyle} />
                    <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone Number" style={inputStyle} />
                  </div>
                  <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Street Address" style={inputStyle} />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="City" style={inputStyle} />
                    <input value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} placeholder="Pincode" style={inputStyle} />
                  </div>

                  <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                    {selectedAddress && (
                      <button onClick={() => handleUpdateAddress(selectedAddress.id)} style={{ ...buttonStyle, background: "#1e3a8a" }}>
                        <Edit2 size={14} /> Update Address
                      </button>
                    )}
                    {showManualForm && !selectedAddress && (
                      <button onClick={handleSaveNewAddress} style={{ ...buttonStyle, background: "#1e3a8a" }}>
                        <Plus size={14} /> Save Address
                      </button>
                    )}
                    {selectedAddress && (
                      <button onClick={proceedToPayment} style={{ ...buttonStyle, flex: 1, background: "#059669" }}>
                        Proceed to Payment <ArrowRight size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* No Address Selected State */}
            {!selectedAddress && !showManualForm && addresses.length > 0 && (
              <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #f0f0f0", padding: "32px", textAlign: "center" }}>
                <MapPin size={36} color="#1e3a8a" style={{ margin: "0 auto 12px" }} />
                <h3 style={{ fontSize: 14, fontWeight: 600, color: "#111827", marginBottom: 6 }}>Select a delivery address</h3>
                <p style={{ fontSize: 12, color: "#6b7280" }}>Choose from saved addresses or add a new one</p>
              </div>
            )}
          </div>

          {/* RIGHT - Order Summary */}
          <div style={{ position: "sticky", top: 24 }}>
            <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #f0f0f0", padding: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <Package size={18} color="#1e3a8a" />
                <h2 style={{ fontSize: 14, fontWeight: 700, color: "#111827", margin: 0 }}>Order Summary</h2>
              </div>

              {/* Product Image & Info */}
              <div style={{ display: "flex", gap: 12, marginBottom: 16, padding: "12px", background: "#f9fafb", borderRadius: 10 }}>
                <img
                  src={optimizeImage(product.imageURL, 100) || "/no-image.png"}
                  alt={product.title}
                  loading="lazy"
                  width={64}
                  height={64}
                  style={{ width: 64, height: 64, objectFit: "contain", borderRadius: 8, background: "#fff", border: "1px solid #f0f0f0" }}
                />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#111827", margin: "0 0 4px", lineHeight: 1.3 }}>
                    {product.title.length > 35 ? product.title.substring(0, 32) + "..." : product.title}
                  </p>
                  <p style={{ fontSize: 11, color: "#6b7280", margin: 0 }}>
                    Qty: {quantity} × ₹{unitPrice.toFixed(0)}
                    {hasDiscount && (
                      <span style={{ marginLeft: 6, textDecoration: "line-through", color: "#9ca3af" }}>₹{product.price?.toFixed(0)}</span>
                    )}
                  </p>
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#1e3a8a" }}>₹{itemTotal.toFixed(0)}</span>
              </div>

              {/* Price Breakdown */}
              <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 8 }}>
                  <span style={{ color: "#6b7280" }}>Subtotal</span>
                  <span style={{ fontWeight: 500 }}>₹{itemTotal.toFixed(2)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 10 }}>
                  <span style={{ color: "#6b7280" }}>Delivery Charges</span>
                  <span style={{ color: "#059669", fontWeight: 600 }}>FREE</span>
                </div>
                <div style={{ borderTop: "1px solid #e5e7eb", marginTop: 8, paddingTop: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 700 }}>
                    <span style={{ color: "#111827" }}>Total</span>
                    <span style={{ color: "#1e3a8a" }}>₹{itemTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Proceed Button */}
              <button
                onClick={proceedToPayment}
                disabled={!selectedAddress}
                style={{
                  width: "100%",
                  marginTop: 16,
                  padding: "12px",
                  borderRadius: 10,
                  background: selectedAddress ? "#059669" : "#e5e7eb",
                  color: selectedAddress ? "#fff" : "#9ca3af",
                  border: "none",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: selectedAddress ? "pointer" : "not-allowed",
                  transition: "background 0.2s",
                }}
                onMouseOver={(e) => { if (selectedAddress) e.currentTarget.style.background = "#047857"; }}
                onMouseOut={(e) => { if (selectedAddress) e.currentTarget.style.background = "#059669"; }}
              >
                <ArrowRight size={14} style={{ display: "inline-block", marginRight: 6 }} />
                Proceed to Payment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  padding: "10px 12px",
  border: "1px solid #e5e7eb",
  borderRadius: 8,
  fontSize: 12,
  outline: "none",
  background: "#fff",
  width: "100%",
  boxSizing: "border-box",
  transition: "border-color 0.2s",
};

const buttonStyle = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: "10px 18px",
  borderRadius: 8,
  fontSize: 12,
  fontWeight: 500,
  color: "#fff",
  border: "none",
  cursor: "pointer",
  transition: "background 0.2s",
};