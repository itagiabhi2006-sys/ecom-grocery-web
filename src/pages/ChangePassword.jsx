import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../Api';

function ChangePassword() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const changePsd = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsLoading(true);

    try {
      const res = await api.post("/change-password", { oldPassword, newPassword });
      setSuccessMessage(res.data);
      setTimeout(() => navigate("/profile-view"), 2000);
    } catch (err) {
      let cleanMessage = "Internal Server Error";
      if (err.response?.data?.message) {
        cleanMessage = err.response.data.message;
      }
      setError(cleanMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div style={{ 
      background: "#f9fafb", 
      minHeight: "100vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      padding: "24px",
      margin: 0,
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    }}>
      <div style={{ maxWidth: 440, width: "100%" }}>
        
        {/* Main Card */}
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f0f0f0", overflow: "hidden" }}>
          <div style={{ padding: "32px" }}>

            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{
                width: 56,
                height: 56,
                borderRadius: 56,
                background: "#f5f3ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 12px",
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="1.5">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111827", margin: "0 0 4px" }}>
                Change Password
              </h1>
              <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>
                Secure your account with a strong password
              </p>
            </div>

            {/* Success Message */}
            {successMessage && (
              <div style={{
                background: "#f5f3ff",
                border: "1px solid #e9d5ff",
                borderRadius: 10,
                padding: "12px 14px",
                marginBottom: 20,
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span style={{ fontSize: 12, color: "#7C3AED" }}>{successMessage}</span>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div style={{
                background: "#fef2f2",
                border: "1px solid #fee2e2",
                borderRadius: 10,
                padding: "12px 14px",
                marginBottom: 20,
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span style={{ fontSize: 12, color: "#dc2626" }}>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={changePsd}>
              {/* Current Password */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6, display: "block" }}>
                  Current Password
                </label>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  border: "1px solid #e5e7eb",
                  borderRadius: 10,
                  overflow: "hidden",
                  transition: "border-color 0.2s",
                }}>
                  <div style={{
                    background: "#f9fafb",
                    padding: "10px 12px",
                    display: "flex",
                    alignItems: "center",
                    borderRight: "1px solid #e5e7eb",
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </div>
                  <input
                    type="password"
                    value={oldPassword}
                    placeholder="Enter current password"
                    onChange={(e) => setOldPassword(e.target.value)}
                    disabled={isLoading}
                    style={{
                      flex: 1,
                      padding: "10px 12px",
                      border: "none",
                      fontSize: 13,
                      outline: "none",
                      background: "#fff",
                    }}
                    onFocus={(e) => e.target.parentElement.style.borderColor = "#7C3AED"}
                    onBlur={(e) => e.target.parentElement.style.borderColor = "#e5e7eb"}
                  />
                </div>
              </div>

              {/* New Password */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6, display: "block" }}>
                  New Password
                </label>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  border: "1px solid #e5e7eb",
                  borderRadius: 10,
                  overflow: "hidden",
                  transition: "border-color 0.2s",
                }}>
                  <div style={{
                    background: "#f9fafb",
                    padding: "10px 12px",
                    display: "flex",
                    alignItems: "center",
                    borderRight: "1px solid #e5e7eb",
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                    </svg>
                  </div>
                  <input
                    type="password"
                    value={newPassword}
                    placeholder="Enter new password"
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={isLoading}
                    style={{
                      flex: 1,
                      padding: "10px 12px",
                      border: "none",
                      fontSize: 13,
                      outline: "none",
                      background: "#fff",
                    }}
                    onFocus={(e) => e.target.parentElement.style.borderColor = "#7C3AED"}
                    onBlur={(e) => e.target.parentElement.style.borderColor = "#e5e7eb"}
                  />
                </div>
                <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 6 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <span style={{ fontSize: 10, color: "#9ca3af" }}>Use 8+ characters with letters & numbers</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: 10,
                  border: "none",
                  background: "#7C3AED",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: isLoading ? "not-allowed" : "pointer",
                  opacity: isLoading ? 0.6 : 1,
                  transition: "background 0.2s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
                onMouseOver={(e) => { if (!isLoading) e.currentTarget.style.background = "#6D28D9"; }}
                onMouseOut={(e) => { if (!isLoading) e.currentTarget.style.background = "#7C3AED"; }}
              >
                {isLoading ? (
                  <>
                    <svg style={{ width: 16, height: 16, animation: "spin 0.8s linear infinite" }} viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="#fff" strokeWidth="4" strokeOpacity="0.25" />
                      <path d="M4 12a8 8 0 018-8v8H4z" fill="#fff" stroke="none" />
                    </svg>
                    Updating...
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    Update Password
                  </>
                )}
              </button>
            </form>

            {/* Back Button */}
            <div style={{ marginTop: 20, textAlign: "center" }}>
              <button
                onClick={() => navigate("/profile")}
                disabled={isLoading}
                style={{
                  padding: "6px 14px",
                  borderRadius: 8,
                  border: "1px solid #e5e7eb",
                  background: "#fff",
                  color: "#6b7280",
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: isLoading ? "not-allowed" : "pointer",
                  opacity: isLoading ? 0.6 : 1,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  transition: "all 0.2s",
                }}
                onMouseOver={(e) => { if (!isLoading) { e.currentTarget.style.background = "#f9fafb"; e.currentTarget.style.borderColor = "#d1d5db"; } }}
                onMouseOut={(e) => { if (!isLoading) { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = "#e5e7eb"; } }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
                Back to Profile
              </button>
            </div>

            {/* Security Tips */}
            <div style={{
              marginTop: 24,
              paddingTop: 20,
              borderTop: "1px solid #f0f0f0",
              display: "flex",
              justifyContent: "center",
              gap: 20,
            }}>
              {[
                { icon: "🔒", label: "Secure" },
                { icon: "🛡️", label: "Encrypted" },
                { icon: "✓", label: "Verified" }
              ].map((item) => (
                <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 12 }}>{item.icon}</span>
                  <span style={{ fontSize: 10, color: "#9ca3af", fontWeight: 500 }}>{item.label}</span>
                </div>
              ))}
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

export default ChangePassword;