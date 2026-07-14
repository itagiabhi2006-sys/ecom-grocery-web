import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Grid, X, Check } from 'lucide-react';
import api from '../Api';

const inp = {
  width: '100%', padding: '9px 13px', borderRadius: 8,
  border: '1.5px solid #e2e8f0', fontSize: 13, outline: 'none',
  background: '#fff', boxSizing: 'border-box', color: '#1e293b',
};

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [showAdd,  setShowAdd]  = useState(false);
  const [form,     setForm]     = useState({ name: '', imageURL: '' });
  const [loading,  setLoading]  = useState(false);

  const fetchCategories = useCallback(async () => {
    setPageLoading(true);
    try {
      const { data } = await api.get('/admin/get-categories');
      setCategories(data);
    } catch {
      // handle silently or show a toast
    } finally {
      setPageLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const handleAdd = async () => {
    if (!form.name.trim()) { alert('Category name required'); return; }
    setLoading(true);
    try {
      await api.post('/admin/add-cate', form);
      setShowAdd(false);
      setForm({ name: '', imageURL: '' });
      await fetchCategories();
    } catch {
      alert('Failed to add category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '32px 36px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 26, fontWeight: 700, color: '#0f1f5c', margin: 0 }}>Categories</h1>
          <p style={{ color: '#64748b', fontSize: 13, marginTop: 3 }}>{categories.length} categories</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#166534,#16a34a)', color: '#fff', fontWeight: 600, fontSize: 13, boxShadow: '0 4px 14px rgba(22,163,74,0.3)' }}>
          <Plus size={15} /> Add Category
        </button>
      </div>

      {/* Add modal */}
      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,31,92,0.35)', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#fff', borderRadius: 20, boxShadow: '0 20px 60px rgba(0,0,0,0.15)', width: '100%', maxWidth: 420, margin: '0 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ fontWeight: 700, fontSize: 17, color: '#0f1f5c' }}>New Category</span>
              <button onClick={() => setShowAdd(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={18} /></button>
            </div>
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, color: '#64748b', fontWeight: 600, display: 'block', marginBottom: 5 }}>Category Name *</label>
                <input style={inp} placeholder="e.g. Electronics" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#64748b', fontWeight: 600, display: 'block', marginBottom: 5 }}>Image URL</label>
                <input style={inp} placeholder="https://..." value={form.imageURL} onChange={e => setForm(f => ({ ...f, imageURL: e.target.value }))} />
              </div>
              {form.imageURL && (
                <img src={form.imageURL} alt="preview"
                  style={{ width: '100%', height: 130, objectFit: 'cover', borderRadius: 10, border: '1.5px solid #e2e8f0' }}
                  onError={e => e.target.style.display = 'none'} />
              )}
            </div>
            <div style={{ display: 'flex', gap: 10, padding: '0 24px 24px' }}>
              <button onClick={handleAdd} disabled={loading}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 20px', borderRadius: 10, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', background: 'linear-gradient(135deg,#166534,#16a34a)', color: '#fff', fontWeight: 600, fontSize: 13, opacity: loading ? 0.6 : 1 }}>
                <Check size={14} />{loading ? 'Adding…' : 'Add Category'}
              </button>
              <button onClick={() => setShowAdd(false)} style={{ padding: '9px 20px', borderRadius: 10, border: 'none', cursor: 'pointer', background: '#f1f5f9', color: '#475569', fontSize: 13 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {pageLoading ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8', fontSize: 14 }}>Loading categories…</div>
      ) : categories.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', color: '#94a3b8' }}>
          <Grid size={48} style={{ marginBottom: 12, opacity: 0.3 }} />
          <p style={{ fontSize: 15 }}>No categories yet.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(170px,1fr))', gap: 16 }}>
          {categories.map(cat => (
            <div key={cat.id}
              style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 12px rgba(15,31,92,0.08)', border: '1.5px solid #e8edf8', transition: 'transform 0.18s,box-shadow 0.18s', cursor: 'default' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(15,31,92,0.14)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 1px 12px rgba(15,31,92,0.08)'; }}>
              <div style={{ height: 110, background: '#f0f4ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={cat.imageURL || '/assets/default-category.svg'} alt={cat.name}
                  style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 12 }}
                  onError={e => { e.target.style.display = 'none'; }} />
              </div>
              <div style={{ padding: '10px 12px 14px', textAlign: 'center' }}>
                <div style={{ fontWeight: 600, color: '#1e293b', fontSize: 13 }}>{cat.name}</div>
                <div style={{ color: '#94a3b8', fontSize: 11, marginTop: 2 }}>ID: {cat.id}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}