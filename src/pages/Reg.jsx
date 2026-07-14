import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../Api";
import { User, Mail, Lock, Calendar, Store, Eye, EyeOff, ArrowLeft, UserPlus } from "lucide-react";
import kiranaLogo from "../assets/logos.png";

function Reg() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [email, setEmail] = useState("");
  const [passwords, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleOnSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    const newErrors = {};
    if (!firstName) newErrors.firstName = "Required";
    if (!lastName) newErrors.lastName = "Required";
    if (!dob) newErrors.dob = "Required";
    if (!email) newErrors.email = "Required";
    if (!passwords) newErrors.passwords = "Required";
    if (passwords !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      await api.post("/reg", { firstName, lastName, dob, email, passwords });
      setSuccessMessage("Registered successfully! Redirecting...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setErrors({ general: err.response?.data?.message || "Registration failed" });
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
              <p style={{ fontSize: 12, margin: '12px 0 0', fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>Your Digital Kirana Store</p>
            </div>

            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', margin: 0 }}>Trusted by local shop owners ❤️</p>
          </div>

          {/* RIGHT — Form */}
          <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'center', overflowY: 'auto' }}>

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: '#eff6ff', border: '1.5px solid #bfdbfe',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 12px', color: '#1e3a8a',
              }}>
                <UserPlus size={18} />
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', fontFamily: "'Playfair Display', Georgia, serif", margin: '0 0 4px' }}>
                Create Account
              </h2>
              <p style={{ fontSize: 12.5, color: '#94a3b8', fontWeight: 500, margin: 0 }}>Register to continue</p>
            </div>

            {/* Success */}
            {successMessage && (
              <div style={{ background: '#eff6ff', color: '#1e3a8a', border: '1px solid #bfdbfe', borderRadius: 10, padding: '10px 14px', marginBottom: 14, fontSize: 12.5, fontWeight: 700, textAlign: 'center' }}>
                ✓ {successMessage}
              </div>
            )}

            {/* General error */}
            {errors.general && (
              <div style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', marginBottom: 14, fontSize: 12.5, fontWeight: 700 }}>
                ⚠ {errors.general}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

              {/* Name row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <Field label="First Name" error={errors.firstName}>
                  <FieldInput icon={<User size={13} />} value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First" hasError={!!errors.firstName} />
                </Field>
                <Field label="Last Name" error={errors.lastName}>
                  <FieldInput icon={<User size={13} />} value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last" hasError={!!errors.lastName} />
                </Field>
              </div>

              {/* DOB + Email row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <Field label="Date of Birth" error={errors.dob}>
                  <FieldInput icon={<Calendar size={13} />} type="date" value={dob} onChange={e => setDob(e.target.value)} hasError={!!errors.dob} />
                </Field>
                <Field label="Email" error={errors.email}>
                  <FieldInput icon={<Mail size={13} />} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" hasError={!!errors.email} />
                </Field>
              </div>

              {/* Password */}
              <Field label="Password" error={errors.passwords}>
                <PasswordInput value={passwords} onChange={e => setPassword(e.target.value)} show={showPassword} onToggle={() => setShowPassword(s => !s)} placeholder="Enter password" hasError={!!errors.passwords} />
              </Field>

              {/* Confirm Password */}
              <Field label="Confirm Password" error={errors.confirmPassword}>
                <PasswordInput value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} show={showConfirm} onToggle={() => setShowConfirm(s => !s)} placeholder="Confirm password" hasError={!!errors.confirmPassword} />
              </Field>

              {/* Match indicator */}
              {confirmPassword.length > 0 && (
                <div style={{ fontSize: 11, fontWeight: 700, color: confirmPassword === passwords ? '#1e3a8a' : '#ef4444', marginTop: -4, display: 'flex', alignItems: 'center', gap: 5 }}>
                  {confirmPassword === passwords ? '✓ Passwords match' : '✗ Passwords do not match'}
                </div>
              )}

              {/* Submit */}
              <button
                onClick={handleOnSubmit}
                disabled={isLoading}
                style={{
                  width: '100%', padding: '12px',
                  background: isLoading ? '#bfdbfe' : '#1e3a8a',
                  color: '#fff', border: 'none', borderRadius: 12,
                  fontSize: 14, fontWeight: 800, cursor: isLoading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: '0 4px 16px rgba(30,58,138,0.3)',
                  transition: 'background 0.2s', marginTop: 2,
                }}
                onMouseOver={e => { if (!isLoading) e.currentTarget.style.background = '#1e40af'; }}
                onMouseOut={e => { if (!isLoading) e.currentTarget.style.background = '#1e3a8a'; }}
              >
                {isLoading ? (
                  <><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} /> Creating...</>
                ) : (
                  <><UserPlus size={15} /> Create Account</>
                )}
              </button>

              {/* Footer */}
              <div style={{ textAlign: 'center', borderTop: '1px solid #f1f5f9', paddingTop: 12 }}>
                <span style={{ fontSize: 12.5, color: '#64748b', fontWeight: 500 }}>
                  Already have an account?{' '}
                  <span onClick={() => navigate("/login")} style={{ color: '#1e3a8a', fontWeight: 800, cursor: 'pointer' }}
                    onMouseOver={e => e.currentTarget.style.textDecoration = 'underline'}
                    onMouseOut={e => e.currentTarget.style.textDecoration = 'none'}
                  >
                    Sign In
                  </span>
                </span>
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

function Field({ label, error, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#64748b', letterSpacing: 0.8, marginBottom: 5, textTransform: 'uppercase' }}>
        {label}
      </label>
      {children}
      {error && <p style={{ fontSize: 10.5, color: '#ef4444', fontWeight: 700, marginTop: 4 }}>{error}</p>}
    </div>
  );
}

function FieldInput({ icon, type = 'text', value, onChange, placeholder, hasError }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      border: `1.5px solid ${hasError ? '#fecaca' : focused ? '#1e3a8a' : '#e2e8f0'}`,
      borderRadius: 10, background: hasError ? '#fef2f2' : '#f8fafc',
      boxShadow: focused ? '0 0 0 3px rgba(30,58,138,0.08)' : 'none',
      transition: 'all 0.2s',
    }}>
      <span style={{ paddingLeft: 10, color: '#94a3b8', display: 'flex', flexShrink: 0 }}>{icon}</span>
      <input
        type={type} value={value} onChange={onChange} placeholder={placeholder}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: 13, fontWeight: 500, color: '#0f172a', padding: '9px 10px' }}
      />
    </div>
  );
}

function PasswordInput({ value, onChange, show, onToggle, placeholder, hasError }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      border: `1.5px solid ${hasError ? '#fecaca' : focused ? '#1e3a8a' : '#e2e8f0'}`,
      borderRadius: 10, background: hasError ? '#fef2f2' : '#f8fafc',
      boxShadow: focused ? '0 0 0 3px rgba(30,58,138,0.08)' : 'none',
      transition: 'all 0.2s',
    }}>
      <span style={{ paddingLeft: 10, color: '#94a3b8', display: 'flex', flexShrink: 0 }}><Lock size={13} /></span>
      <input
        type={show ? 'text' : 'password'} value={value} onChange={onChange} placeholder={placeholder}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: 13, fontWeight: 500, color: '#0f172a', padding: '9px 10px' }}
      />
      <button type="button" onClick={onToggle} style={{ background: 'none', border: 'none', cursor: 'pointer', paddingRight: 10, color: '#94a3b8', display: 'flex', transition: 'color 0.2s' }}
        onMouseOver={e => e.currentTarget.style.color = '#1e3a8a'}
        onMouseOut={e => e.currentTarget.style.color = '#94a3b8'}
      >
        {show ? <EyeOff size={13} /> : <Eye size={13} />}
      </button>
    </div>
  );
}

export default Reg;