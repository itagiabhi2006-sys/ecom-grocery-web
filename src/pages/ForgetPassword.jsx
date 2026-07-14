import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import api from '../Api';

function ForgetPassword() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [redirect, setRedirect] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (redirect) {
      const timer = setTimeout(() => {
        sessionStorage.setItem("canAccessReset", "true");
        sessionStorage.setItem("resetEmail", email);
        navigate("/reset-password");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [redirect, navigate, email]);

  const resetPasswordHandler = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors("");
    setSuccessMessage("");
    try {
      const res = await api.post("/forget-password", { email });
      setSuccessMessage(res.data || "OTP sent successfully!");
      setRedirect(true);
    } catch (error) {
      setErrors(error.response?.data?.message || "Internal server error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Blur backdrop */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 999,
        backdropFilter: 'blur(18px) brightness(0.7)',
        WebkitBackdropFilter: 'blur(18px) brightness(0.7)',
        background: 'rgba(15, 23, 42, 0.35)',
      }} />

      {/* Back button */}
      <button
        onClick={() => navigate("/login")}
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
        <ArrowLeft size={15} /> Back to Login
      </button>

      {/* Card — perfectly centered */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
      }}>
        <div style={{
          width: '100%', maxWidth: 440,
          background: '#fff', borderRadius: 28,
          border: '1px solid #f1f5f9',
          boxShadow: '0 24px 80px rgba(0,0,0,0.2)',
          padding: '44px 40px',
          animation: 'popIn 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        }}>

          {/* Icon */}
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
            border: '1px solid #bfdbfe',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, margin: '0 auto 24px',
          }}>
            🔑
          </div>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <h2 style={{
              fontSize: 26, fontWeight: 900, color: '#0f172a',
              fontFamily: "'Playfair Display', Georgia, serif",
              margin: '0 0 8px',
            }}>
              Forgot Password?
            </h2>
            <p style={{ fontSize: 14, color: '#94a3b8', fontWeight: 500, lineHeight: 1.6, margin: 0 }}>
              Enter your email and we'll send you an OTP to reset your password.
            </p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div style={{
              background: '#eff6ff', color: '#1e3a8a', border: '1px solid #bfdbfe',
              borderRadius: 12, padding: '12px 16px', marginBottom: 20,
              fontSize: 13, fontWeight: 700, textAlign: 'center',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              ✓ {successMessage}
            </div>
          )}

          {/* Error Message */}
          {errors && (
            <div style={{
              background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca',
              borderRadius: 12, padding: '12px 16px', marginBottom: 20,
              fontSize: 13, fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              ⚠ {errors}
            </div>
          )}

          {/* Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{
                display: 'block', fontSize: 12, fontWeight: 800, color: '#475569',
                letterSpacing: 0.5, marginBottom: 8, textTransform: 'uppercase',
              }}>
                Email Address
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%', padding: '13px 16px', boxSizing: 'border-box',
                  border: '1.5px solid #e2e8f0', borderRadius: 14,
                  fontSize: 14, fontWeight: 500, color: '#0f172a',
                  background: '#f8fafc', outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
                onFocus={e => { e.target.style.borderColor = '#1e3a8a'; e.target.style.boxShadow = '0 0 0 3px rgba(30,58,138,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            <button
              onClick={resetPasswordHandler}
              disabled={isLoading}
              style={{
                width: '100%', padding: '14px',
                background: isLoading ? '#bfdbfe' : '#1e3a8a',
                color: '#fff', border: 'none', borderRadius: 14,
                fontSize: 15, fontWeight: 800, cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                boxShadow: '0 6px 20px rgba(30,58,138,0.3)',
                transition: 'background 0.2s',
              }}
              onMouseOver={e => { if (!isLoading) e.currentTarget.style.background = '#1e40af'; }}
              onMouseOut={e => { if (!isLoading) e.currentTarget.style.background = '#1e3a8a'; }}
            >
              {isLoading ? (
                <>
                  <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                  Sending OTP...
                </>
              ) : 'Send OTP'}
            </button>
          </div>

          {/* Footer */}
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 500 }}>
              Remember your password?{' '}
              <span
                onClick={() => navigate("/login")}
                style={{ color: '#1e3a8a', fontWeight: 700, cursor: 'pointer' }}
                onMouseOver={e => e.currentTarget.style.textDecoration = 'underline'}
                onMouseOut={e => e.currentTarget.style.textDecoration = 'none'}
              >
                Sign in here
              </span>
            </span>
          </div>

          {/* Trust badges */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 28 }}>
            {[
              { icon: '🛡️', text: 'Secure' },
              { icon: '⚡', text: 'Fast' },
              { icon: '📧', text: 'Email Based' },
            ].map((b, i) => (
              <div key={i} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                background: '#f8fafc', borderRadius: 12, padding: '12px 8px',
                border: '1px solid #f1f5f9', fontSize: 11, fontWeight: 700, color: '#475569',
              }}>
                <span style={{ fontSize: 20 }}>{b.icon}</span>
                {b.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.92) translateY(16px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&display=swap');
      `}</style>
    </>
  );
}

export default ForgetPassword;