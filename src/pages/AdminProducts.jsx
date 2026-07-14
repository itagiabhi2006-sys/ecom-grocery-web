import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Search, X, Check, Tag, Percent } from 'lucide-react';
import api from '../Api';

const inp = {
  width: '100%', padding: '9px 13px', borderRadius: 8,
  border: '1.5px solid #e2e8f0', fontSize: 13, outline: 'none',
  background: '#fff', boxSizing: 'border-box', color: '#1e293b',
};
const emptyForm = { title: '', description: '', price: '', imageURL: '', catId: '', stock: '', margin: '' };

/* ───────────── Add / Edit Modal ───────────── */
function Modal({ title, onClose, onSubmit, form, setForm, categories, loading, isEdit }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,31,92,0.38)', backdropFilter: 'blur(4px)' }}>
      <div style={{ background: '#fff', borderRadius: 20, boxShadow: '0 20px 60px rgba(0,0,0,0.15)', width: '100%', maxWidth: 480, margin: '0 16px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid #f1f5f9' }}>
          <span style={{ fontWeight: 700, fontSize: 16, color: '#0f1f5c' }}>{title}</span>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={18} /></button>
        </div>
        <div style={{ padding: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div style={{ gridColumn: '1/-1' }}>
            <label style={{ fontSize: 12, color: '#64748b', fontWeight: 600, display: 'block', marginBottom: 5 }}>Product Title *</label>
            <input style={inp} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Wireless Headphones" />
          </div>
          <div>
            <label style={{ fontSize: 12, color: '#64748b', fontWeight: 600, display: 'block', marginBottom: 5 }}>Price (₹) *</label>
            <input style={inp} type="number" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="0.00" />
          </div>
          <div>
            <label style={{ fontSize: 12, color: '#64748b', fontWeight: 600, display: 'block', marginBottom: 5 }}>Stock</label>
            <input style={inp} type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} placeholder="0" />
          </div>
          <div>
            <label style={{ fontSize: 12, color: '#64748b', fontWeight: 600, display: 'block', marginBottom: 5 }}>Margin (%)</label>
            <input style={inp} type="number" min="0" max="100" value={form.margin} onChange={e => setForm(f => ({ ...f, margin: e.target.value }))} placeholder="0" />
          </div>
          {!isEdit && (
            <div>
              <label style={{ fontSize: 12, color: '#64748b', fontWeight: 600, display: 'block', marginBottom: 5 }}>Category *</label>
              <select style={inp} value={form.catId} onChange={e => setForm(f => ({ ...f, catId: e.target.value }))}>
                <option value="">Select category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          )}
          <div style={{ gridColumn: isEdit ? '1/-1' : 'auto' }}>
            <label style={{ fontSize: 12, color: '#64748b', fontWeight: 600, display: 'block', marginBottom: 5 }}>Image URL</label>
            <input style={inp} value={form.imageURL} onChange={e => setForm(f => ({ ...f, imageURL: e.target.value }))} placeholder="https://..." />
          </div>
          <div style={{ gridColumn: '1/-1' }}>
            <label style={{ fontSize: 12, color: '#64748b', fontWeight: 600, display: 'block', marginBottom: 5 }}>Description</label>
            <textarea style={{ ...inp, resize: 'vertical' }} rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, padding: '0 24px 24px' }}>
          <button onClick={onSubmit} disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 20px', borderRadius: 10, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', background: isEdit ? 'linear-gradient(135deg,#d97706,#f59e0b)' : 'linear-gradient(135deg,#1a3a8f,#1d4ed8)', color: '#fff', fontWeight: 600, fontSize: 13, opacity: loading ? 0.6 : 1 }}>
            <Check size={14} />{loading ? 'Saving...' : isEdit ? 'Update Product' : 'Add Product'}
          </button>
          <button onClick={onClose} style={{ padding: '9px 20px', borderRadius: 10, border: 'none', cursor: 'pointer', background: '#f1f5f9', color: '#475569', fontSize: 13 }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

/* ───────────── Discount Modal ───────────── */
function DiscountModal({ product, onClose, onApply, loading }) {
  const [disPer, setDisPer] = useState('');
  const discountedPrice = product && disPer
    ? (product.price * (1 - parseFloat(disPer) / 100)).toFixed(2)
    : null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 60,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(15,31,92,0.45)', backdropFilter: 'blur(6px)',
    }}>
      <div style={{
        background: '#fff', borderRadius: 22,
        boxShadow: '0 24px 70px rgba(0,0,0,0.18)',
        width: '100%', maxWidth: 400, margin: '0 16px',
        overflow: 'hidden',
      }}>
        {/* Colourful top banner */}
        <div style={{
          background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
          padding: '20px 24px 18px',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 8, padding: '5px 7px', display: 'flex' }}>
                <Tag size={15} color="#fff" />
              </div>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>Apply Discount</span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, margin: 0, maxWidth: 280 }}>
              Set a discount percentage for <strong style={{ color: '#fff' }}>{product?.title}</strong>
            </p>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'rgba(255,255,255,0.15)', cursor: 'pointer', borderRadius: 8, padding: '5px 7px', display: 'flex', color: '#fff' }}>
            <X size={16} />
          </button>
        </div>

        {/* Product preview row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 24px', borderBottom: '1px solid #f1f5f9' }}>
          <img
            src={product?.imageURL || '/assets/default-product.svg'}
            alt={product?.title}
            style={{ width: 52, height: 52, objectFit: 'cover', borderRadius: 12, border: '1.5px solid #e2e8f0' }}
          />
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#1e293b' }}>{product?.title}</div>
            <div style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>
              Current price: <strong style={{ color: '#0f1f5c' }}>₹{product?.price}</strong>
            </div>
          </div>
        </div>

        {/* Discount input */}
        <div style={{ padding: '20px 24px' }}>
          <label style={{ fontSize: 12, color: '#64748b', fontWeight: 600, display: 'block', marginBottom: 8 }}>
            Discount Percentage *
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={disPer}
              onChange={e => setDisPer(e.target.value)}
              placeholder="e.g. 15"
              style={{
                ...inp,
                paddingRight: 40,
                fontSize: 24,
                fontWeight: 700,
                color: '#4f46e5',
                border: '2px solid #e2e8f0',
                borderRadius: 12,
                transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = '#4f46e5'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
            <Percent size={18} color="#94a3b8" style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)' }} />
          </div>

          {/* Live preview */}
          {discountedPrice && parseFloat(disPer) > 0 && parseFloat(disPer) <= 100 && (
            <div style={{
              marginTop: 14, padding: '12px 16px', borderRadius: 12,
              background: 'linear-gradient(135deg,#f5f3ff,#ede9fe)',
              border: '1px solid #ddd6fe',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span style={{ fontSize: 12, color: '#6d28d9', fontWeight: 600 }}>Price after discount</span>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: '#4f46e5' }}>₹{discountedPrice}</span>
                <span style={{ fontSize: 11, color: '#7c3aed', marginLeft: 8, background: '#ede9fe', padding: '2px 8px', borderRadius: 20 }}>
                  -{disPer}%
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, padding: '0 24px 24px' }}>
          <button
            onClick={() => onApply(parseFloat(disPer))}
            disabled={loading || !disPer || parseFloat(disPer) <= 0 || parseFloat(disPer) > 100}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              padding: '10px 20px', borderRadius: 11, border: 'none',
              cursor: (loading || !disPer || parseFloat(disPer) <= 0 || parseFloat(disPer) > 100) ? 'not-allowed' : 'pointer',
              background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
              color: '#fff', fontWeight: 700, fontSize: 13,
              opacity: (loading || !disPer || parseFloat(disPer) <= 0 || parseFloat(disPer) > 100) ? 0.5 : 1,
              boxShadow: '0 4px 14px rgba(79,70,229,0.35)',
              transition: 'opacity 0.2s',
            }}>
            <Check size={14} />{loading ? 'Applying...' : 'Apply Discount'}
          </button>
          <button onClick={onClose} style={{ padding: '10px 18px', borderRadius: 11, border: 'none', cursor: 'pointer', background: '#f1f5f9', color: '#475569', fontSize: 13, fontWeight: 600 }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

/* ───────────── Main Page ───────────── */
export default function AdminProducts() {
  const [products,        setProducts]        = useState([]);
  const [categories,      setCategories]      = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [form,            setForm]            = useState(emptyForm);
  const [editId,          setEditId]          = useState(null);
  const [showAdd,         setShowAdd]         = useState(false);
  const [showEdit,        setShowEdit]        = useState(false);
  const [saving,          setSaving]          = useState(false);
  const [search,          setSearch]          = useState('');
  const [discountProduct, setDiscountProduct] = useState(null); // product being discounted
  const [discounting,     setDiscounting]     = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [p, c] = await Promise.all([
        api.get('/admin/get-products'),
        api.get('/admin/get-categories'),
      ]);
      setProducts(p.data);
      setCategories(c.data);
    } catch {}
    finally { setLoading(false); }
  }, []);

  const refreshProducts = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/get-products');
      setProducts(data);
    } catch {}
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleAdd = async () => {
    if (!form.title || !form.price || !form.catId) { alert('Fill required fields'); return; }
    setSaving(true);
    try {
      await api.post('/admin/add-product', {
        ...form,
        price:  parseFloat(form.price),
        catId:  parseInt(form.catId),
        stock:  parseInt(form.stock  || 0),
        margin: parseInt(form.margin || 0),
      });
      setShowAdd(false);
      setForm(emptyForm);
      await refreshProducts();
    } catch { alert('Failed to add'); }
    finally { setSaving(false); }
  };

  const handleUpdate = async () => {
    if (!form.title || !form.price) { alert('Fill required fields'); return; }
    setSaving(true);
    try {
      await api.post(`/update-prod-update/${editId}`, {
        title:       form.title,
        description: form.description,
        price:       parseFloat(form.price),
        stock:       parseInt(form.stock  || 0),
        margin:      parseInt(form.margin || 0),
        imageURL:    form.imageURL,
      });
      setShowEdit(false);
      setEditId(null);
      setForm(emptyForm);
      await refreshProducts();
    } catch { alert('Failed to update'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await api.delete(`/admin/delete-product/${id}`);
      await refreshProducts();
    } catch { alert('Delete failed'); }
  };

  /* ── NEW: apply discount ── */
  const handleApplyDiscount = async (disPer) => {
    if (!discountProduct) return;
    setDiscounting(true);
    try {
      await api.post(`/add-normal-offer/${discountProduct.id}/${disPer}`);
      setDiscountProduct(null);
      await refreshProducts();
    } catch { alert('Failed to apply discount'); }
    finally { setDiscounting(false); }
  };

  const filtered = products.filter(p =>
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '32px 36px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 26, fontWeight: 700, color: '#0f1f5c', margin: 0 }}>Products</h1>
          <p style={{ color: '#64748b', fontSize: 13, marginTop: 3 }}>{products.length} products total</p>
        </div>
        <button
          onClick={() => { setShowAdd(true); setShowEdit(false); setForm(emptyForm); }}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#1a3a8f,#1d4ed8)', color: '#fff', fontWeight: 600, fontSize: 13, boxShadow: '0 4px 14px rgba(29,78,216,0.3)' }}>
          <Plus size={15} /> Add Product
        </button>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', maxWidth: 320, marginBottom: 20 }}>
        <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)' }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search products..."
          style={{ width: '100%', padding: '8px 12px 8px 33px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 13, outline: 'none', background: '#fff', boxSizing: 'border-box' }}
        />
      </div>

      {/* Hint */}
      <p style={{ color: '#94a3b8', fontSize: 12, marginBottom: 12, marginTop: -8 }}>
        💡 Click on a product row to set a discount offer.
      </p>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 1px 16px rgba(15,31,92,0.07)', border: '1px solid rgba(15,31,92,0.05)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#94a3b8', fontSize: 14 }}>Loading products...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  {['', 'Product', 'Category', 'Price', 'Stock', 'Margin', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '10px 18px', textAlign: 'left', color: '#64748b', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr
                    key={p.id}
                    style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer', transition: 'background 0.15s' }}
                    onClick={() => setDiscountProduct(p)}
                    onMouseEnter={e => e.currentTarget.style.background = '#faf7ff'}
                    onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                  >
                    <td style={{ padding: '10px 18px' }}>
                      <img src={p.imageURL || '/assets/default-product.svg'} alt={p.title}
                        style={{ width: 46, height: 46, objectFit: 'cover', borderRadius: 10, border: '1.5px solid #e2e8f0' }} />
                    </td>
                    <td style={{ padding: '10px 18px' }}>
                      <div style={{ fontWeight: 600, color: '#1e293b', fontSize: 13 }}>{p.title}</div>
                      {p.description && (
                        <div style={{ color: '#94a3b8', fontSize: 11, marginTop: 2 }}>
                          {p.description.slice(0, 50)}{p.description.length > 50 ? '...' : ''}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '10px 18px' }}>
                      <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{p.category}</span>
                    </td>
                    <td style={{ padding: '10px 18px', fontWeight: 600, color: '#1e293b', fontSize: 14 }}>&#8377;{p.price}</td>
                    <td style={{ padding: '10px 18px', fontWeight: 600, color: p.stock > 0 ? '#15803d' : '#dc2626', fontSize: 13 }}>{p.stock}</td>
                    <td style={{ padding: '10px 18px' }}>
                      {p.margin > 0
                        ? <span style={{ background: '#f0fdf4', color: '#15803d', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{p.margin}.0</span>
                        : <span style={{ color: '#94a3b8', fontSize: 12 }}>&#8212;</span>
                      }
                    </td>
                    <td style={{ padding: '10px 18px' }}>
                      <div style={{ display: 'flex', gap: 8 }} onClick={e => e.stopPropagation()}>
                        {/* Discount button */}
                        <button
                          onClick={(e) => { e.stopPropagation(); setDiscountProduct(p); }}
                          title="Set discount"
                          style={{ background: '#f5f3ff', border: 'none', cursor: 'pointer', borderRadius: 8, padding: '6px 10px', color: '#7c3aed' }}>
                          <Tag size={14} />
                        </button>
                        <button
                          onClick={() => {
                            setEditId(p.id);
                            setForm({
                              title:       p.title,
                              description: p.description || '',
                              price:       p.price,
                              imageURL:    p.imageURL || '',
                              stock:       p.stock  ?? '',
                              margin:      p.margin ?? '',
                              catId:       '',
                            });
                            setShowEdit(true);
                            setShowAdd(false);
                          }}
                          style={{ background: '#fef9c3', border: 'none', cursor: 'pointer', borderRadius: 8, padding: '6px 10px', color: '#92400e' }}>
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => handleDelete(p.id, p.title)}
                          style={{ background: '#fee2e2', border: 'none', cursor: 'pointer', borderRadius: 8, padding: '6px 10px', color: '#b91c1c' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: '48px 0', color: '#94a3b8', fontSize: 14 }}>No products found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAdd && (
        <Modal title="Add New Product" onClose={() => setShowAdd(false)} onSubmit={handleAdd}
          form={form} setForm={setForm} categories={categories} loading={saving} isEdit={false} />
      )}
      {showEdit && (
        <Modal title="Edit Product" onClose={() => { setShowEdit(false); setEditId(null); }} onSubmit={handleUpdate}
          form={form} setForm={setForm} categories={categories} loading={saving} isEdit={true} />
      )}

      {/* Discount Modal */}
      {discountProduct && (
        <DiscountModal
          product={discountProduct}
          onClose={() => setDiscountProduct(null)}
          onApply={handleApplyDiscount}
          loading={discounting}
        />
      )}
    </div>
  );
}