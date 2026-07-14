import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import api from "../Api";
import { useAuth } from "../contexts/AuthContext";
import {
  Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, Shield, Store,
  AlertCircle, CheckCircle,
} from "lucide-react";
import kiranaLogo from "../assets/logos.png";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [passwords, setPasswords] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const navigate = useNavigate();
  const { login } = useAuth();

  if (localStorage.getItem("adminLoggedIn") === "true") {
    return <Navigate to="/admin" replace />;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const res = await api.post("/admin/login", { email, passwords });
      login(res.data);
      localStorage.setItem("adminLoggedIn", "true");
      setToastMessage(res.data.message || "Admin login successful");
      setTimeout(() => { setToastMessage(""); navigate("/HomeAdmin"); }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid admin credentials");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Blur backdrop */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 999,
        backdropFilter: 'blur(20px) brightness(0.65)',
        WebkitBackdropFilter: 'blur(20px) brightness(0.65)',
        background: 'rgba(15,23,42,0.4)',
      }} />

      {/* Toast */}
      {toastMessage && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 1100,
          background: '#dc2626', color: '#fff',
          padding: '10px 18px', borderRadius: 12,
          display: 'flex', alignItems: 'center', gap: 8,
          fontSize: 13, fontWeight: 700,
          boxShadow: '0 4px 20px rgba(220,38,38,0.4)',
          animation: 'popIn 0.3s ease',
        }}>
          <CheckCircle size={16} /> {toastMessage}
        </div>
      )}

      {/* Back button */}
      <button
        onClick={() => navigate("/")}
        style={{
          position: 'fixed', top: 20, left: 20, zIndex: 1100,
          display: 'flex', alignItems: 'center', gap: 7,
          background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.25)',
          borderRadius: 100, padding: '8px 16px 8px 12px',
          fontSize: 13, fontWeight: 700, color: '#fff',
          cursor: 'pointer', transition: 'all 0.2s',
        }}
        onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.22)'; e.currentTarget.style.transform = 'translateX(-2px)'; }}
        onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.transform = 'translateX(0)'; }}
      >
        <ArrowLeft size={15} /> Back to Home
      </button>

      {/* Centered wrapper */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}>
        {/* Card */}
        <div style={{
          width: '100%', maxWidth: 820,
          background: '#fff', borderRadius: 24,
          border: '1px solid #f1f5f9',
          boxShadow: '0 24px 80px rgba(0,0,0,0.18)',
          overflow: 'hidden',
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          animation: 'popIn 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        }}>

          {/* LEFT — Brand panel */}
          <div style={{
            background: 'linear-gradient(145deg, #dc2626, #b91c1c, #9f1239)',
            padding: '36px 32px',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            color: '#fff',
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <Store size={22} />
                <h2 style={{ fontSize: 22, fontWeight: 900, margin: 0, fontFamily: "'Playfair Display', Georgia, serif" }}>Smart Kirana</h2>
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.65, color: 'rgba(255,255,255,0.85)', margin: 0 }}>
                Admin control panel for managing products, orders and users.
              </p>
            </div>

            <div style={{
              background: 'rgba(255,255,255,0.15)', borderRadius: 16,
              padding: '24px 16px', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', margin: '24px 0',
              backdropFilter: 'blur(8px)',
            }}>
              <img
                src={kiranaLogo}
                alt="Kirana Store Logo"
                style={{ width: '100%', maxWidth: 220, maxHeight: 200, objectFit: 'contain', filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.2))' }}
              />
              <p style={{ fontSize: 12, marginTop: 12, fontWeight: 700, color: 'rgba(255,255,255,0.9)', margin: '12px 0 0' }}>
                Admin Control Panel
              </p>
            </div>

            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', margin: 0 }}>Secure access for administrators 🔐</p>
          </div>

          {/* RIGHT — Form */}
          <div style={{ padding: '36px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: '#fef2f2', border: '1.5px solid #fecaca',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 12px', color: '#dc2626',
              }}>
                <Shield size={18} />
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', fontFamily: "'Playfair Display', Georgia, serif", margin: '0 0 4px' }}>
                Admin Login
              </h2>
              <p style={{ fontSize: 12.5, color: '#94a3b8', fontWeight: 500, margin: 0 }}>Authorized personnel only</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* Email */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#64748b', letterSpacing: 0.8, marginBottom: 6, textTransform: 'uppercase' }}>Admin Email</label>
                <AdminInputField
                  icon={<Mail size={14} />}
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#64748b', letterSpacing: 0.8, marginBottom: 6, textTransform: 'uppercase' }}>Password</label>
                <div
                  style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #e2e8f0', borderRadius: 12, background: '#f8fafc', transition: 'all 0.2s' }}
                  onFocusCapture={e => e.currentTarget.style.borderColor = '#dc2626'}
                  onBlurCapture={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                >
                  <span style={{ paddingLeft: 12, color: '#94a3b8', display: 'flex' }}><Lock size={14} /></span>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={passwords}
                    onChange={e => setPasswords(e.target.value)}
                    required
                    style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: 13.5, fontWeight: 500, color: '#0f172a', padding: '11px 10px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', paddingRight: 12, color: '#94a3b8', display: 'flex' }}
                    onMouseOver={e => e.currentTarget.style.color = '#dc2626'}
                    onMouseOut={e => e.currentTarget.style.color = '#94a3b8'}
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', fontSize: 12.5, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AlertCircle size={14} /> {error}
                </div>
              )}

              {/* Submit */}
              <button
                onClick={handleLogin}
                disabled={isLoading}
                style={{
                  width: '100%', padding: '12px',
                  background: isLoading ? '#fca5a5' : '#dc2626',
                  color: '#fff', border: 'none', borderRadius: 12,
                  fontSize: 14, fontWeight: 800, cursor: isLoading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: '0 4px 16px rgba(220,38,38,0.3)',
                  transition: 'background 0.2s',
                  marginTop: 4,
                }}
                onMouseOver={e => { if (!isLoading) e.currentTarget.style.background = '#b91c1c'; }}
                onMouseOut={e => { if (!isLoading) e.currentTarget.style.background = '#dc2626'; }}
              >
                {isLoading ? (
                  <><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} /> Signing in...</>
                ) : (
                  <><Shield size={15} /> Login as Admin <ArrowRight size={14} /></>
                )}
              </button>

            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.94) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&display=swap');
      `}</style>
    </>
  );
}

function AdminInputField({ icon, type, placeholder, value, onChange, required }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      border: `1.5px solid ${focused ? '#dc2626' : '#e2e8f0'}`,
      borderRadius: 12, background: '#f8fafc',
      boxShadow: focused ? '0 0 0 3px rgba(220,38,38,0.08)' : 'none',
      transition: 'all 0.2s',
    }}>
      <span style={{ paddingLeft: 12, color: '#94a3b8', display: 'flex' }}>{icon}</span>
      <input
        type={type} placeholder={placeholder} value={value} onChange={onChange} required={required}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: 13.5, fontWeight: 500, color: '#0f172a', padding: '11px 10px' }}
      />
    </div>
  );
}