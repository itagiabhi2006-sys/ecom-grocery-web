import React, { useEffect, useState } from "react";
import api from "../Api";
import { useNavigate } from "react-router-dom";

function Profile() {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [editMode, setEditMode] = useState({
    name: false,
    dob: false,
    gender: false,
  });
  const [editValues, setEditValues] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    gender: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  const navigate = useNavigate();

  const LoadData = async () => {
    try {
      const res = await api.get("/me");
      setUserData(res.data);
      setEditValues({
        firstName: res.data.firstName || "",
        lastName: res.data.lastName || "",
        dob: res.data.dob || "",
        gender: res.data.gender || "",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching user data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    LoadData();
  }, []);

  const saveProfile = async (field) => {
    try {
      setIsSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        firstName: editValues.firstName,
        lastName: editValues.lastName,
        dob: editValues.dob,
        gender: editValues.gender,
      };

      await api.post("/update-profile", payload);

      setUserData((prev) => ({
        ...prev,
        ...payload,
      }));

      setEditMode({ ...editMode, [field]: false });
      setSuccess("Profile updated successfully!");

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f9fafb" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <svg style={{ width: 32, height: 32, animation: "spin 0.8s linear infinite" }} viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#7C3AED" strokeWidth="4" strokeOpacity="0.25" />
            <path d="M4 12a8 8 0 018-8v8H4z" fill="#7C3AED" stroke="none" />
          </svg>
          <p style={{ color: "#6b7280", fontSize: 13 }}>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#f9fafb", minHeight: "100vh" }}>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "32px 20px" }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#111827", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 26 }}>👤</span>
            My Profile
          </h1>
        </div>

        {/* Success Message */}
        {success && (
          <div style={{
            background: "#f5f3ff",
            border: "1px solid #e9d5ff",
            borderRadius: 10,
            padding: "12px 16px",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
            <span style={{ fontSize: 13, color: "#7C3AED" }}>{success}</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div style={{
            background: "#fef2f2",
            border: "1px solid #fee2e2",
            borderRadius: 10,
            padding: "12px 16px",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span style={{ fontSize: 13, color: "#dc2626" }}>{error}</span>
          </div>
        )}

        {/* Profile Card */}
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f0f0f0", overflow: "hidden" }}>
          
          {/* Cover Image */}
          <div style={{ height: 80, background: "linear-gradient(135deg, #7C3AED 0%, #8B5CF6 50%, #A78BFA 100%)" }}></div>

          {/* Avatar Section */}
          <div style={{ padding: "0 24px", marginTop: -40, display: "flex", alignItems: "flex-end", gap: 20, flexWrap: "wrap" }}>
            <div style={{
              width: 80,
              height: 80,
              borderRadius: 80,
              background: "#f3f4f6",
              border: "4px solid #fff",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}>
              {userData.imageURL ? (
                <img src={userData.imageURL} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span style={{ fontSize: 32, color: "#9ca3af" }}>👤</span>
              )}
            </div>
            <div style={{ marginBottom: 16 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111827", margin: 0 }}>
                {userData.firstName} {userData.lastName}
              </h2>
              <p style={{ fontSize: 12, color: "#6b7280", margin: "4px 0 0" }}>{userData.email}</p>
            </div>
          </div>

          {/* Profile Details */}
          <div style={{ padding: "24px", borderTop: "1px solid #f0f0f0", marginTop: 16 }}>
            
            {/* Full Name */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6, display: "block" }}>
                Full Name
              </label>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                {!editMode.name ? (
                  <>
                    <div style={{
                      flex: 1,
                      background: "#f9fafb",
                      padding: "10px 14px",
                      borderRadius: 10,
                      fontSize: 13,
                      color: "#111827",
                      border: "1px solid #f0f0f0",
                    }}>
                      {userData.firstName} {userData.lastName}
                    </div>
                    <button
                      onClick={() => setEditMode({ ...editMode, name: true })}
                      style={{
                        padding: "8px 12px",
                        borderRadius: 8,
                        border: "1px solid #e5e7eb",
                        background: "#fff",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: 12,
                        color: "#7C3AED",
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3l4 4-7 7H10v-4l7-7z"/><path d="M3 21h18"/></svg>
                      Edit
                    </button>
                  </>
                ) : (
                  <>
                    <div style={{ flex: 1, display: "flex", gap: 10 }}>
                      <input
                        type="text"
                        placeholder="First name"
                        value={editValues.firstName}
                        onChange={(e) => setEditValues({ ...editValues, firstName: e.target.value })}
                        style={{
                          flex: 1,
                          padding: "10px 12px",
                          border: "1px solid #e5e7eb",
                          borderRadius: 10,
                          fontSize: 13,
                          outline: "none",
                          transition: "border-color 0.2s",
                        }}
                        onFocus={(e) => e.target.style.borderColor = "#7C3AED"}
                        onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                      />
                      <input
                        type="text"
                        placeholder="Last name"
                        value={editValues.lastName}
                        onChange={(e) => setEditValues({ ...editValues, lastName: e.target.value })}
                        style={{
                          flex: 1,
                          padding: "10px 12px",
                          border: "1px solid #e5e7eb",
                          borderRadius: 10,
                          fontSize: 13,
                          outline: "none",
                          transition: "border-color 0.2s",
                        }}
                        onFocus={(e) => e.target.style.borderColor = "#7C3AED"}
                        onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                      />
                    </div>
                    <button
                      onClick={() => saveProfile("name")}
                      disabled={isSaving}
                      style={{
                        padding: "8px 14px",
                        borderRadius: 8,
                        border: "none",
                        background: "#7C3AED",
                        color: "#fff",
                        cursor: isSaving ? "not-allowed" : "pointer",
                        fontSize: 12,
                        fontWeight: 500,
                        opacity: isSaving ? 0.6 : 1,
                        transition: "background 0.2s",
                      }}
                      onMouseOver={(e) => { if (!isSaving) e.currentTarget.style.background = "#6D28D9"; }}
                      onMouseOut={(e) => { if (!isSaving) e.currentTarget.style.background = "#7C3AED"; }}
                    >
                      Save
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Date of Birth */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6, display: "block" }}>
                Date of Birth
              </label>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                {!editMode.dob ? (
                  <>
                    <div style={{
                      flex: 1,
                      background: "#f9fafb",
                      padding: "10px 14px",
                      borderRadius: 10,
                      fontSize: 13,
                      color: "#111827",
                      border: "1px solid #f0f0f0",
                    }}>
                      {userData.dob || "Not set"}
                    </div>
                    <button
                      onClick={() => setEditMode({ ...editMode, dob: true })}
                      style={{
                        padding: "8px 12px",
                        borderRadius: 8,
                        border: "1px solid #e5e7eb",
                        background: "#fff",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: 12,
                        color: "#7C3AED",
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3l4 4-7 7H10v-4l7-7z"/><path d="M3 21h18"/></svg>
                      Edit
                    </button>
                  </>
                ) : (
                  <>
                    <input
                      type="date"
                      value={editValues.dob}
                      onChange={(e) => setEditValues({ ...editValues, dob: e.target.value })}
                      style={{
                        flex: 1,
                        padding: "10px 12px",
                        border: "1px solid #e5e7eb",
                        borderRadius: 10,
                        fontSize: 13,
                        outline: "none",
                        transition: "border-color 0.2s",
                      }}
                      onFocus={(e) => e.target.style.borderColor = "#7C3AED"}
                      onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                    />
                    <button
                      onClick={() => saveProfile("dob")}
                      disabled={isSaving}
                      style={{
                        padding: "8px 14px",
                        borderRadius: 8,
                        border: "none",
                        background: "#7C3AED",
                        color: "#fff",
                        cursor: isSaving ? "not-allowed" : "pointer",
                        fontSize: 12,
                        fontWeight: 500,
                        opacity: isSaving ? 0.6 : 1,
                        transition: "background 0.2s",
                      }}
                      onMouseOver={(e) => { if (!isSaving) e.currentTarget.style.background = "#6D28D9"; }}
                      onMouseOut={(e) => { if (!isSaving) e.currentTarget.style.background = "#7C3AED"; }}
                    >
                      Save
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Gender */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6, display: "block" }}>
                Gender
              </label>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                {!editMode.gender ? (
                  <>
                    <div style={{
                      flex: 1,
                      background: "#f9fafb",
                      padding: "10px 14px",
                      borderRadius: 10,
                      fontSize: 13,
                      color: "#111827",
                      border: "1px solid #f0f0f0",
                    }}>
                      {userData.gender || "Not set"}
                    </div>
                    <button
                      onClick={() => setEditMode({ ...editMode, gender: true })}
                      style={{
                        padding: "8px 12px",
                        borderRadius: 8,
                        border: "1px solid #e5e7eb",
                        background: "#fff",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: 12,
                        color: "#7C3AED",
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3l4 4-7 7H10v-4l7-7z"/><path d="M3 21h18"/></svg>
                      Edit
                    </button>
                  </>
                ) : (
                  <>
                    <select
                      value={editValues.gender}
                      onChange={(e) => setEditValues({ ...editValues, gender: e.target.value })}
                      style={{
                        flex: 1,
                        padding: "10px 12px",
                        border: "1px solid #e5e7eb",
                        borderRadius: 10,
                        fontSize: 13,
                        outline: "none",
                        background: "#fff",
                        transition: "border-color 0.2s",
                      }}
                      onFocus={(e) => e.target.style.borderColor = "#7C3AED"}
                      onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                    >
                      <option value="">Select gender</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                    <button
                      onClick={() => saveProfile("gender")}
                      disabled={isSaving}
                      style={{
                        padding: "8px 14px",
                        borderRadius: 8,
                        border: "none",
                        background: "#7C3AED",
                        color: "#fff",
                        cursor: isSaving ? "not-allowed" : "pointer",
                        fontSize: 12,
                        fontWeight: 500,
                        opacity: isSaving ? 0.6 : 1,
                        transition: "background 0.2s",
                      }}
                      onMouseOver={(e) => { if (!isSaving) e.currentTarget.style.background = "#6D28D9"; }}
                      onMouseOut={(e) => { if (!isSaving) e.currentTarget.style.background = "#7C3AED"; }}
                    >
                      Save
                    </button>
                  </>
                )}
              </div>
            </div>

          </div>

          {/* Footer Actions */}
          <div style={{ padding: "16px 24px", borderTop: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <button
              onClick={() => navigate("/change-password")}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                background: "#fff",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 500,
                color: "#7C3AED",
                display: "flex",
                alignItems: "center",
                gap: 6,
                transition: "all 0.2s",
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = "#f5f3ff"; e.currentTarget.style.borderColor = "#c4b5fd"; }}
              onMouseOut={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = "#e5e7eb"; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              Change Password
            </button>
            <button
              onClick={() => window.history.back()}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                background: "#fff",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 500,
                color: "#6b7280",
                display: "flex",
                alignItems: "center",
                gap: 6,
                transition: "all 0.2s",
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = "#f9fafb"; }}
              onMouseOut={(e) => { e.currentTarget.style.background = "#fff"; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
              Back
            </button>
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

export default Profile;