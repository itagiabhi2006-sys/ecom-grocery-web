import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, RefreshCw, ShieldCheck, Zap, Mail, ArrowLeft } from 'lucide-react';
import api from '../Api';

function getStrength(pwd) {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return score;
}

const strengthConfig = [
  { label: '',            color: '#e2e8f0', textColor: '#94a3b8' },
  { label: 'Weak',        color: '#ef4444', textColor: '#ef4444' },
  { label: 'Fair',        color: '#f97316', textColor: '#f97316' },
  { label: 'Good',        color: '#eab308', textColor: '#ca8a04' },
  { label: 'Strong',      color: '#22c55e', textColor: '#16a34a' },
  { label: 'Very Strong', color: '#16a34a', textColor: '#15803d' },
];

function PasswordField({ label, value, onChange, placeholder }) {
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#64748b', letterSpacing: 0.8, marginBottom: 6, textTransform: 'uppercase' }}>
        {label}
      </label>
      <div style={{
        display: 'flex', alignItems: 'center',
        border: `1.5px solid ${focused ? '#16a34a' : '#e2e8f0'}`,
        borderRadius: 12, background: '#f8fafc',
        boxShadow: focused ? '0 0 0 3px rgba(22,163,74,0.08)' : 'none',
        transition: 'all 0.2s',
      }}>
        <input
          type={show ? 'text' : 'password'}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          required
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            flex: 1, border: 'none', background: 'transparent',
            fontSize: 13.5, fontWeight: 500, color: '#0f172a',
            outline: 'none', padding: '11px 14px',
          }}
        />
        <button type="button" onClick={() => setShow(s => !s)} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          padding: '0 12px', color: '#94a3b8', display: 'flex', alignItems: 'center',
          transition: 'color 0.2s',
        }}
          onMouseOver={e => e.currentTarget.style.color = '#16a34a'}
          onMouseOut={e => e.currentTarget.style.color = '#94a3b8'}
        >
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </div>
  );
}

function ResetPassword() {
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [errors, setErrors] = useState("");
  const [success, setSuccess] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(120);
  const [canResend, setCanResend] = useState(false);
  const [email, setEmail] = useState("");

  const navigate = useNavigate();
  const otpRefs = useRef([]);

  const strength = getStrength(newPassword);
  const strengthInfo = newPassword.length === 0 ? strengthConfig[0] : strengthConfig[Math.min(strength, 5)];

  const checks = [
    { label: '8+ characters',    pass: newPassword.length >= 8 },
    { label: 'Uppercase',         pass: /[A-Z]/.test(newPassword) },
    { label: 'Number',            pass: /[0-9]/.test(newPassword) },
    { label: 'Special char',      pass: /[^A-Za-z0-9]/.test(newPassword) },
  ];

  useEffect(() => {
    const canAccess = sessionStorage.getItem("canAccessReset");
    const storedEmail = sessionStorage.getItem("resetEmail");
    if (!canAccess || !storedEmail) { navigate("/login"); return; }
    setEmail(storedEmail);
  }, [navigate]);

  useEffect(() => {
    if (timer > 0 && !canResend) {
      const interval = setInterval(() => {
        setTimer(prev => { if (prev <= 1) { setCanResend(true); return 0; } return prev - 1; });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer, canResend]);

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp]; newOtp[index] = value; setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus();
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const d = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    for (let i = 0; i < d.length; i++) newOtp[i] = d[i];
    setOtp(newOtp);
    otpRefs.current[Math.min(d.length, 5)]?.focus();
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrors(""); setSuccess("");
    const otpString = otp.join("");
    if (otpString.length !== 6) { setErrors("Please enter the complete 6-digit OTP"); return; }
    if (!checks.every(c => c.pass)) { setErrors("Password doesn't meet all requirements"); return; }
    if (newPassword !== confirmPassword) { setErrors("Passwords do not match"); return; }
    setIsLoading(true);
    try {
      const res = await api.post("/reset-password", { newPassword, confirmPassword, otp: otpString, email });
      setSuccess(res.data?.message || "Password reset successful!");
      sessionStorage.removeItem("canAccessReset");
      sessionStorage.removeItem("resetEmail");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setErrors(err.response?.data?.message || "Something went wrong");
    } finally { setIsLoading(false); }
  };

  const handleResendOtp = async () => {
    setErrors(""); setSuccess(""); setIsLoading(true);
    try {
      await api.post("/forget-password", { email });
      setSuccess("OTP resent!"); setTimer(120); setCanResend(false);
      setOtp(["", "", "", "", "", ""]); otpRefs.current[0]?.focus();
    } catch (err) {
      setErrors(err.response?.data?.message || "Failed to resend OTP");
    } finally { setIsLoading(false); }
  };

  const formatTimer = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

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
        onClick={() => navigate("/forget-password")}
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
        <ArrowLeft size={15} /> Back
      </button>

            {/* Centered container */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
      }}>
        <div style={{
          width: '100%', maxWidth: 440,
          background: '#fff', borderRadius: 24,
          border: '1px solid #f1f5f9',
          boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
          padding: '16px 24px 14px',
          animation: 'popIn 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              background: '#f0fdf4', border: '1.5px solid #bbf7d0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 10px', color: '#16a34a',
            }}>
              <ShieldCheck size={22} />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', fontFamily: "'Playfair Display', Georgia, serif", margin: '0 0 5px' }}>
              Reset Password
            </h2>
            <p style={{ fontSize: 12.5, color: '#94a3b8', fontWeight: 500, margin: 0, lineHeight: 1.5 }}>
              OTP sent to <span style={{ color: '#0f172a', fontWeight: 700 }}>{email}</span>
            </p>
          </div>

          {/* Alerts */}
          {success && (
            <div style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 12.5, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14 }}>✓</span> {success}
            </div>
          )}
          {errors && (
            <div style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 12.5, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14 }}>⚠</span> {errors}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

            {/* OTP Row */}
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#64748b', letterSpacing: 0.8, marginBottom: 8, textTransform: 'uppercase' }}>
                OTP Code
              </label>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 6 }}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={el => (otpRefs.current[index] = el)}
                    type="text"
                    value={digit}
                    onChange={e => handleOtpChange(index, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(index, e)}
                    onPaste={handleOtpPaste}
                    maxLength="1"
                    inputMode="numeric"
                    style={{
                      width: 42, height: 46, textAlign: 'center',
                      fontSize: 18, fontWeight: 800, color: '#0f172a',
                      border: `2px solid ${digit ? '#16a34a' : '#e2e8f0'}`,
                      borderRadius: 10, background: digit ? '#f0fdf4' : '#f8fafc',
                      outline: 'none', transition: 'all 0.18s',
                    }}
                    onFocus={e => { e.target.style.borderColor = '#16a34a'; e.target.style.boxShadow = '0 0 0 3px rgba(22,163,74,0.1)'; }}
                    onBlur={e => { if (!digit) { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; } }}
                  />
                ))}
              </div>
              <div style={{ textAlign: 'center', fontSize: 11.5, fontWeight: 600, color: '#94a3b8' }}>
                {canResend ? (
                  <span>
                    Didn't receive it?{' '}
                    <button type="button" onClick={handleResendOtp} disabled={isLoading} style={{ background: 'none', border: 'none', color: '#16a34a', fontWeight: 800, cursor: 'pointer', fontSize: 11.5, padding: 0, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <RefreshCw size={11} /> Resend OTP
                    </button>
                  </span>
                ) : (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: timer > 30 ? '#16a34a' : '#ef4444', display: 'inline-block', animation: 'pulse 1s infinite' }} />
                    Resend in <strong style={{ color: timer > 30 ? '#16a34a' : '#ef4444', fontFamily: 'monospace' }}>{formatTimer(timer)}</strong>
                  </span>
                )}
              </div>
            </div>

            {/* New Password */}
            <div>
              <PasswordField label="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Enter new password" />

              {newPassword.length > 0 && (
                <div style={{ display: 'flex', gap: 3, marginTop: 8 }}>
                  {[1,2,3,4,5].map(i => (
                    <div key={i} style={{ flex: 1, height: 3, borderRadius: 100, background: i <= strength ? strengthInfo.color : '#e2e8f0', transition: 'background 0.3s' }} />
                  ))}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <PasswordField label="Confirm Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm new password" />
              {confirmPassword.length > 0 && (
                <div style={{ marginTop: 6, fontSize: 11, fontWeight: 700, color: confirmPassword === newPassword ? '#16a34a' : '#ef4444', display: 'flex', alignItems: 'center', gap: 5 }}>
                  {confirmPassword === newPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              onClick={handleResetPassword}
              disabled={isLoading}
              style={{
                width: '100%', padding: '13px',
                background: isLoading ? '#86efac' : '#16a34a',
                color: '#fff', border: 'none', borderRadius: 12,
                fontSize: 14, fontWeight: 800, cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: '0 4px 16px rgba(22,163,74,0.3)',
                transition: 'background 0.2s', marginTop: 2,
              }}
              onMouseOver={e => { if (!isLoading) e.currentTarget.style.background = '#15803d'; }}
              onMouseOut={e => { if (!isLoading) e.currentTarget.style.background = '#16a34a'; }}
            >
              {isLoading ? (
                <><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} /> Processing...</>
              ) : (
                <><ShieldCheck size={15} /> Reset Password</>
              )}
            </button>
          </div>

          {/* Trust badges */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginTop: 12 }}>
            {[
              { icon: <ShieldCheck size={16} />, text: 'Secure' },
              { icon: <Zap size={16} />, text: 'Fast Reset' },
              { icon: <Mail size={16} />, text: 'Verified' },
            ].map((b, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: '#f8fafc', borderRadius: 10, padding: '10px 6px', border: '1px solid #f1f5f9', fontSize: 10.5, fontWeight: 700, color: '#64748b' }}>
                <span style={{ color: '#16a34a' }}>{b.icon}</span>
                {b.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.94) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&display=swap');
      `}</style>
    </>
  );
}

export default ResetPassword;