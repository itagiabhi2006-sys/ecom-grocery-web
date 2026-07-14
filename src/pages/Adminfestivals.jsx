import React, { useEffect, useState, useCallback } from 'react';
import { Sparkles, Plus, Package, Calendar, MapPin, Percent, CheckCircle, XCircle } from 'lucide-react';
import api from '../Api';

// ── Reusable field wrapper ───────────────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 700, color: '#64748b', letterSpacing: 0.8, textTransform: 'uppercase' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  border: '1.5px solid #e2e8f0',
  borderRadius: 10,
  padding: '10px 14px',
  fontSize: 14,
  fontWeight: 500,
  color: '#0f172a',
  outline: 'none',
  background: '#fff',
  width: '100%',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s',
};

// ── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{
      position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
      display: 'flex', alignItems: 'center', gap: 10,
      background: type === 'success' ? '#16a34a' : '#dc2626',
      color: '#fff', borderRadius: 14, padding: '12px 20px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.18)', fontWeight: 600, fontSize: 14,
      animation: 'slideUp 0.3s ease',
    }}>
      {type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
      {msg}
    </div>
  );
}

// ── Festival Card ─────────────────────────────────────────────────────────────
function FestivalCard({ fest, isSelected, onClick }) {
  const now      = new Date();
  const start    = new Date(fest.startDate);
  const end      = new Date(fest.endDate + 'T23:59:59');
  const isActive   = now >= start && now <= end;
  const isUpcoming = now < start;

  return (
    <div
      onClick={onClick}
      style={{
        background: isSelected ? '#eff6ff' : '#fff',
        border: isSelected ? '2px solid #2563eb' : '1.5px solid #e2e8f0',
        borderRadius: 14,
        padding: '14px 16px',
        cursor: 'pointer',
        transition: 'all 0.18s',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <p style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', margin: 0 }}>{fest.name}</p>
        <span style={{
          fontSize: 11, fontWeight: 700, borderRadius: 20, padding: '3px 10px',
          background: isActive ? '#dcfce7' : isUpcoming ? '#fef9c3' : '#f1f5f9',
          color:      isActive ? '#16a34a' : isUpcoming ? '#a16207' : '#64748b',
        }}>
          {isActive ? 'Active' : isUpcoming ? 'Upcoming' : 'Ended'}
        </span>
      </div>
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Calendar size={12} /> {fest.startDate} → {fest.endDate}
        </span>
        {fest.region && (
          <span style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
            <MapPin size={12} /> {fest.region}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function AdminFestivals() {
  const [products,      setProducts]      = useState([]);
  const [festivals,     setFestivals]     = useState([]);
  const [festsLoading,  setFestsLoading]  = useState(true);

  const [festForm,      setFestForm]      = useState({ name: '', startDate: '', endDate: '', region: '' });
  const [festLoading,   setFestLoading]   = useState(false);

  const [assignForm,    setAssignForm]    = useState({ festivalId: '', productId: '', baseDiscount: '' });
  const [assignLoading, setAssignLoading] = useState(false);

  const [toast, setToast] = useState(null);
  const showToast = (msg, type = 'success') => setToast({ msg, type });

  // Fetch products once on mount
  useEffect(() => {
    api.get('/admin/get-products')
      .then(r => setProducts(r.data))
      .catch(() => {});
  }, []);

  // Fetch festivals (called on mount + after adding a new one)
  const fetchFestivals = useCallback(() => {
    setFestsLoading(true);
    api.get('/get-all-festivals')
      .then(r => setFestivals(r.data))
      .catch(() => {})
      .finally(() => setFestsLoading(false));
  }, []);

  useEffect(() => { fetchFestivals(); }, [fetchFestivals]);

  // Submit: Add Festival
  const handleAddFestival = async (e) => {
    e.preventDefault();
    if (!festForm.name || !festForm.startDate || !festForm.endDate) {
      showToast('Name, Start Date and End Date are required.', 'error');
      return;
    }
    setFestLoading(true);
    try {
      await api.post('/add-festival', festForm);
      showToast(`Festival "${festForm.name}" created!`);
      setFestForm({ name: '', startDate: '', endDate: '', region: '' });
      fetchFestivals();
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to create festival.', 'error');
    } finally {
      setFestLoading(false);
    }
  };

  // Submit: Assign Product
  const handleAssignProduct = async (e) => {
    e.preventDefault();
    if (!assignForm.festivalId || !assignForm.productId || !assignForm.baseDiscount) {
      showToast('All fields are required.', 'error');
      return;
    }
    setAssignLoading(true);
    try {
      await api.post('/assign-product-festival', {
        festivalId:   Number(assignForm.festivalId),
        productId:    Number(assignForm.productId),
        baseDiscount: Number(assignForm.baseDiscount),
      });
      const festName = festivals.find(f => String(f.id) === String(assignForm.festivalId))?.name || '';
      const prodName = products.find(p => String(p.id) === String(assignForm.productId))?.title || '';
      showToast(`${prodName} assigned to ${festName}!`);
      setAssignForm({ festivalId: '', productId: '', baseDiscount: '' });
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to assign product.', 'error');
    } finally {
      setAssignLoading(false);
    }
  };

  const selectStyle = {
    ...inputStyle,
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'calc(100% - 14px) center',
    paddingRight: 38,
  };

  return (
    <div style={{ padding: 32, maxWidth: 1100, margin: '0 auto' }}>

      {/* ── Page Header ── */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #7c3aed, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={20} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', margin: 0, fontFamily: "'Playfair Display', Georgia, serif" }}>
              Festival Manager
            </h1>
            <p style={{ fontSize: 13, color: '#94a3b8', margin: 0, fontWeight: 500 }}>
              Create festivals and assign discounted products
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

        {/* ── Left Column ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Add Festival Card */}
          <div style={{ background: '#fff', borderRadius: 20, border: '1.5px solid #e2e8f0', padding: 28, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 22 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Plus size={16} color="#7c3aed" />
              </div>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>Add New Festival</h2>
            </div>
            <form onSubmit={handleAddFestival} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Field label="Festival Name">
                <input
                  style={inputStyle}
                  placeholder="e.g. Diwali Dhamaka 2025"
                  value={festForm.name}
                  onChange={e => setFestForm(f => ({ ...f, name: e.target.value }))}
                  onFocus={e => e.target.style.borderColor = '#7c3aed'}
                  onBlur={e  => e.target.style.borderColor = '#e2e8f0'}
                />
              </Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="Start Date">
                  <input
                    type="date"
                    style={inputStyle}
                    value={festForm.startDate}
                    onChange={e => setFestForm(f => ({ ...f, startDate: e.target.value }))}
                    onFocus={e => e.target.style.borderColor = '#7c3aed'}
                    onBlur={e  => e.target.style.borderColor = '#e2e8f0'}
                  />
                </Field>
                <Field label="End Date">
                  <input
                    type="date"
                    style={inputStyle}
                    value={festForm.endDate}
                    onChange={e => setFestForm(f => ({ ...f, endDate: e.target.value }))}
                    onFocus={e => e.target.style.borderColor = '#7c3aed'}
                    onBlur={e  => e.target.style.borderColor = '#e2e8f0'}
                  />
                </Field>
              </div>
              <Field label="Region (Optional)">
                <div style={{ position: 'relative' }}>
                  <MapPin size={15} color="#94a3b8" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  <input
                    style={{ ...inputStyle, paddingLeft: 34 }}
                    placeholder="e.g. Pan India, South India..."
                    value={festForm.region}
                    onChange={e => setFestForm(f => ({ ...f, region: e.target.value }))}
                    onFocus={e => e.target.style.borderColor = '#7c3aed'}
                    onBlur={e  => e.target.style.borderColor = '#e2e8f0'}
                  />
                </div>
              </Field>
              <button
                type="submit"
                disabled={festLoading}
                style={{
                  marginTop: 4,
                  background: festLoading ? '#c4b5fd' : 'linear-gradient(135deg, #7c3aed, #a855f7)',
                  color: '#fff', border: 'none', borderRadius: 12, padding: '12px 0',
                  fontWeight: 800, fontSize: 14, cursor: festLoading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'opacity 0.2s',
                }}
              >
                <Sparkles size={16} />
                {festLoading ? 'Creating...' : 'Create Festival'}
              </button>
            </form>
          </div>

          {/* Assign Product Card */}
          <div style={{ background: '#fff', borderRadius: 20, border: '1.5px solid #e2e8f0', padding: 28, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 22 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Package size={16} color="#16a34a" />
              </div>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>Assign Product to Festival</h2>
            </div>
            <form onSubmit={handleAssignProduct} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Field label="Select Festival">
                <select
                  style={selectStyle}
                  value={assignForm.festivalId}
                  onChange={e => setAssignForm(f => ({ ...f, festivalId: e.target.value }))}
                  onFocus={e => e.target.style.borderColor = '#16a34a'}
                  onBlur={e  => e.target.style.borderColor = '#e2e8f0'}
                >
                  <option value="">— Choose a festival —</option>
                  {festivals.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </Field>
              <Field label="Select Product">
                <select
                  style={selectStyle}
                  value={assignForm.productId}
                  onChange={e => setAssignForm(f => ({ ...f, productId: e.target.value }))}
                  onFocus={e => e.target.style.borderColor = '#16a34a'}
                  onBlur={e  => e.target.style.borderColor = '#e2e8f0'}
                >
                  <option value="">— Choose a product —</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </Field>
              <Field label="Base Discount (%)">
                <div style={{ position: 'relative' }}>
                  <Percent size={15} color="#94a3b8" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  <input
                    type="number"
                    min={1}
                    max={100}
                    style={{ ...inputStyle, paddingLeft: 34 }}
                    placeholder="e.g. 20"
                    value={assignForm.baseDiscount}
                    onChange={e => setAssignForm(f => ({ ...f, baseDiscount: e.target.value }))}
                    onFocus={e => e.target.style.borderColor = '#16a34a'}
                    onBlur={e  => e.target.style.borderColor = '#e2e8f0'}
                  />
                </div>
              </Field>
              <button
                type="submit"
                disabled={assignLoading}
                style={{
                  marginTop: 4,
                  background: assignLoading ? '#86efac' : 'linear-gradient(135deg, #16a34a, #22c55e)',
                  color: '#fff', border: 'none', borderRadius: 12, padding: '12px 0',
                  fontWeight: 800, fontSize: 14, cursor: assignLoading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'opacity 0.2s',
                }}
              >
                <Package size={16} />
                {assignLoading ? 'Assigning...' : 'Assign Product'}
              </button>
            </form>
          </div>
        </div>

        {/* ── Right Column: Festival List ── */}
        <div style={{ background: '#fff', borderRadius: 20, border: '1.5px solid #e2e8f0', padding: 28, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', alignSelf: 'start' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Calendar size={16} color="#ea580c" />
              </div>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>All Festivals</h2>
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, background: '#f1f5f9', color: '#64748b', borderRadius: 20, padding: '4px 12px' }}>
              {festivals.length} total
            </span>
          </div>
          {festsLoading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8', fontSize: 14 }}>
              Loading festivals...
            </div>
          ) : festivals.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <Sparkles size={36} color="#e2e8f0" style={{ margin: '0 auto 12px', display: 'block' }} />
              <p style={{ fontSize: 14, color: '#94a3b8', fontWeight: 600, margin: 0 }}>No festivals yet</p>
              <p style={{ fontSize: 12, color: '#cbd5e1', margin: '4px 0 0' }}>Create your first festival using the form.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {festivals.map(fest => (
                <FestivalCard
                  key={fest.id}
                  fest={fest}
                  isSelected={String(assignForm.festivalId) === String(fest.id)}
                  onClick={() => setAssignForm(f => ({ ...f, festivalId: String(fest.id) }))}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <style>{`@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
    </div>
  );
}