import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../Api";
import {
  Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, LogIn, UserPlus, Key,
  CheckCircle, AlertCircle, Store
} from "lucide-react";
import kiranaLogo from "../assets/logos.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const { login, currentUser } = useAuth();
  const navigate = useNavigate();

  if (currentUser || localStorage.getItem("loggedIn") === "true") {
    return <Navigate to="/" replace />;
  }

  const handleForget = () => navigate("/forget-password");
  const handleRegister = () => navigate("/register");
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8080/oauth2/authorization/google";
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const res = await api.post("/login", { email, passwords: password });
      login(res.data);
      setToastMessage(res.data.message || "Logged in successfully");
      localStorage.setItem("loggedIn", "true");
      setTimeout(() => { setToastMessage(""); navigate("/"); }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
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
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 1100, background: '#1e3a8a', color: '#fff', padding: '10px 18px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, boxShadow: '0 4px 20px rgba(30,58,138,0.4)', animation: 'popIn 0.3s ease' }}>
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
            background: 'linear-gradient(145deg, #1e3a8a, #1e40af, #2563eb)',
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
                Digital solution for your local kirana store. Manage products, customers and orders easily.
              </p>
            </div>

            <div style={{
              background: 'rgba(255,255,255,0.15)', borderRadius: 16,
              padding: '24px 16px', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', margin: '24px 0',
              backdropFilter: 'blur(8px)',
            }}>
              <img src={kiranaLogo} alt="Kirana Store" style={{ width: '100%', maxWidth: 220, maxHeight: 200, objectFit: 'contain', filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.2))' }} />
              <p style={{ fontSize: 12, marginTop: 12, fontWeight: 700, color: 'rgba(255,255,255,0.9)', margin: '12px 0 0' }}>Your Digital Kirana Store</p>
            </div>

            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', margin: 0 }}>Trusted by local shop owners ❤️</p>
          </div>

          {/* RIGHT — Form */}
          <div style={{ padding: '36px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: '#eff6ff', border: '1.5px solid #bfdbfe',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 12px', color: '#1e3a8a',
              }}>
                <Lock size={18} />
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', fontFamily: "'Playfair Display', Georgia, serif", margin: '0 0 4px' }}>
                Welcome Back
              </h2>
              <p style={{ fontSize: 12.5, color: '#94a3b8', fontWeight: 500, margin: 0 }}>Sign in to Kirana Store</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* Email */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#64748b', letterSpacing: 0.8, marginBottom: 6, textTransform: 'uppercase' }}>Email</label>
                <InputField icon={<Mail size={14} />} type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>

              {/* Password */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 800, color: '#64748b', letterSpacing: 0.8, textTransform: 'uppercase' }}>Password</label>
                  <button type="button" onClick={handleForget} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700, color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}>
                    <Key size={11} /> Forgot?
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #e2e8f0', borderRadius: 12, background: '#f8fafc', transition: 'all 0.2s' }}
                  onFocusCapture={e => e.currentTarget.style.borderColor = '#1e3a8a'}
                  onBlurCapture={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                >
                  <span style={{ paddingLeft: 12, color: '#94a3b8', display: 'flex' }}><Lock size={14} /></span>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: 13.5, fontWeight: 500, color: '#0f172a', padding: '11px 10px' }}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ background: 'none', border: 'none', cursor: 'pointer', paddingRight: 12, color: '#94a3b8', display: 'flex' }}
                    onMouseOver={e => e.currentTarget.style.color = '#1e3a8a'}
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
                  background: isLoading ? '#bfdbfe' : '#1e3a8a',
                  color: '#fff', border: 'none', borderRadius: 12,
                  fontSize: 14, fontWeight: 800, cursor: isLoading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: '0 4px 16px rgba(30,58,138,0.3)',
                  transition: 'background 0.2s',
                }}
                onMouseOver={e => { if (!isLoading) e.currentTarget.style.background = '#1e40af'; }}
                onMouseOut={e => { if (!isLoading) e.currentTarget.style.background = '#1e3a8a'; }}
              >
                {isLoading ? (
                  <><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} /> Signing in...</>
                ) : (
                  <><LogIn size={15} /> Sign In <ArrowRight size={14} /></>
                )}
              </button>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
                <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>OR</span>
                <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
              </div>

              {/* Google */}
              <button
                onClick={handleGoogleLogin}
                style={{
                  width: '100%', padding: '11px', background: '#fff',
                  border: '1.5px solid #e2e8f0', borderRadius: 12,
                  fontSize: 13, fontWeight: 700, color: '#374151', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'all 0.2s',
                }}
                onMouseOver={e => { e.currentTarget.style.borderColor = '#bfdbfe'; e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.color = '#1e3a8a'; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#374151'; }}
              >
                <svg width="15" height="15" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
                Continue with Google
              </button>

              {/* Register */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 14, textAlign: 'center' }}>
                <p style={{ fontSize: 12.5, color: '#64748b', margin: '0 0 10px', fontWeight: 500 }}>New to Kirana Store?</p>
                <button
                  onClick={handleRegister}
                  style={{
                    width: '100%', padding: '11px',
                    background: 'transparent', border: '1.5px solid #1e3a8a',
                    borderRadius: 12, fontSize: 13, fontWeight: 800,
                    color: '#1e3a8a', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    transition: 'all 0.2s',
                  }}
                  onMouseOver={e => { e.currentTarget.style.background = '#eff6ff'; }}
                  onMouseOut={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <UserPlus size={14} /> Create Account
                </button>
              </div>
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

function InputField({ icon, type, placeholder, value, onChange, required }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      border: `1.5px solid ${focused ? '#1e3a8a' : '#e2e8f0'}`,
      borderRadius: 12, background: '#f8fafc',
      boxShadow: focused ? '0 0 0 3px rgba(30,58,138,0.08)' : 'none',
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