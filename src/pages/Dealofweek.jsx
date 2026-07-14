import React, { useState, useEffect, useCallback } from 'react';
import { Tag, Percent, Trash2, CheckCircle, AlertCircle, Search, TrendingDown } from 'lucide-react';
import api from '../Api';

// ── helper: actual selling price (discount-aware) ─────────────────────────────
function resolvePrice(p) {
  const hasDiscount = p?.discountFinalPrice != null && p?.discountFinalPrice !== 0;
  return hasDiscount ? p.discountFinalPrice : (p?.price ?? 0);
}

export default function DealOfWeek() {
  const [products,    setProducts]    = useState([]);
  const [dealProducts, setDealProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [discount,    setDiscount]    = useState(10);
  const [loading,     setLoading]     = useState(false);
  const [removingId,  setRemovingId]  = useState(null);
  const [toast,       setToast]       = useState(null);
  const [search,      setSearch]      = useState('');

  const fetchProducts = useCallback(async () => {
    try {
      const res = await api.get('/admin/get-products');
      setProducts(res.data);
    } catch {
      setProducts([]);
    }
  }, []);

  const fetchDeals = useCallback(async () => {
    try {
      const res = await api.get('deals');
      setDealProducts(res.data);
    } catch {
      setDealProducts([]);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchDeals();
  }, [fetchProducts, fetchDeals]);

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const selectedProduct  = products.find(p => String(p.id) === String(selectedProductId));
  const basePrice        = selectedProduct ? resolvePrice(selectedProduct) : null;
  const discountedPrice  = basePrice != null ? +(basePrice * (1 - discount / 100)).toFixed(2) : null;
  const savings          = basePrice != null ? +(basePrice - discountedPrice).toFixed(2) : null;

  const nonDealProducts = products.filter(p => !p.dealOfWeek);
  const filteredNonDeal = nonDealProducts.filter(p =>
    (p.title ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const applyDeal = async () => {
    if (!selectedProduct || selectedProduct.dealOfWeek) return;
    setLoading(true);
    try {
      await api.post(`/admin/set-deal/${selectedProduct.id}/${discount}`);
      showToast(`Deal applied to "${selectedProduct.title}"!`);
      await fetchProducts();
      await fetchDeals();
      setSelectedProductId('');
      setDiscount(10);
    } catch {
      showToast('Failed to apply deal. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const removeDeal = async (product) => {
    setRemovingId(product.id);
    try {
      await api.post(`/admin/remove-deal/${product.id}`);
      showToast(`Deal removed from "${product.title}"`);
      await fetchProducts();
      await fetchDeals();
    } catch {
      showToast('Failed to remove deal.', 'error');
    } finally {
      setRemovingId(null);
    }
  };

  const styles = {
    page:         { padding: '2rem', fontFamily: "'DM Sans', 'Segoe UI', sans-serif", minHeight: '100vh', background: '#f0f4ff' },
    header:       { marginBottom: '1.75rem' },
    headerTitle:  { fontSize: '1.375rem', fontWeight: 700, color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' },
    headerSub:    { fontSize: '0.8125rem', color: '#64748b' },
    grid:         { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' },
    card:         { background: '#fff', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 1px 4px rgba(30,58,138,0.07)', border: '1px solid #e2e8f0' },
    cardTitle:    { fontSize: '0.875rem', fontWeight: 600, color: '#1e3a8a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' },
    label:        { fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.35rem' },
    select:       { width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.625rem', border: '1.5px solid #cbd5e1', fontSize: '0.875rem', color: '#1e293b', background: '#f8fafc', outline: 'none', cursor: 'pointer', marginBottom: '1rem' },
    sliderWrap:   { marginBottom: '1rem' },
    sliderRow:    { display: 'flex', alignItems: 'center', gap: '0.75rem' },
    slider:       { flex: 1, accentColor: '#1d4ed8' },
    sliderVal:    { fontSize: '1.125rem', fontWeight: 700, color: '#1d4ed8', minWidth: '3rem', textAlign: 'right' },
    previewBox:   { background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', border: '1px solid #bfdbfe', borderRadius: '0.75rem', padding: '0.875rem 1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    previewLabel: { fontSize: '0.75rem', color: '#3b82f6', fontWeight: 600, marginBottom: '0.25rem' },
    previewOrig:  { fontSize: '0.875rem', color: '#94a3b8', textDecoration: 'line-through' },
    previewNew:   { fontSize: '1.25rem', fontWeight: 700, color: '#1d4ed8' },
    saveBadge:    { background: '#dcfce7', color: '#15803d', fontSize: '0.75rem', fontWeight: 600, padding: '0.25rem 0.625rem', borderRadius: '99px', border: '1px solid #bbf7d0' },
    applyBtn:     { width: '100%', padding: '0.65rem', background: loading ? '#93c5fd' : '#1d4ed8', color: '#fff', border: 'none', borderRadius: '0.625rem', fontSize: '0.875rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', transition: 'background 0.2s' },
    statsRow:     { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' },
    statCard:     { background: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.875rem', padding: '1rem 1.25rem', boxShadow: '0 1px 3px rgba(30,58,138,0.06)' },
    statLabel:    { fontSize: '0.75rem', color: '#64748b', fontWeight: 500, marginBottom: '0.25rem' },
    statValue:    { fontSize: '1.5rem', fontWeight: 700, color: '#1e3a8a' },
    fullCard:     { background: '#fff', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 1px 4px rgba(30,58,138,0.07)', border: '1px solid #e2e8f0', marginBottom: '1.25rem' },
    searchWrap:   { position: 'relative', marginBottom: '1rem' },
    searchIcon:   { position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', width: 15, height: 15, pointerEvents: 'none' },
    searchInput:  { width: '100%', padding: '0.5rem 0.75rem 0.5rem 2.25rem', borderRadius: '0.625rem', border: '1.5px solid #cbd5e1', fontSize: '0.875rem', color: '#1e293b', background: '#f8fafc', outline: 'none' },
    tableWrap:    { overflowX: 'auto' },
    table:        { width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' },
    th:           { textAlign: 'left', padding: '0.5rem 0.75rem', fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1.5px solid #e2e8f0' },
    td:           { padding: '0.75rem', borderBottom: '1px solid #f1f5f9', color: '#1e293b', verticalAlign: 'middle' },
    dealBadge:    { background: '#fef9c3', color: '#854d0e', fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '99px', border: '1px solid #fde047', whiteSpace: 'nowrap' },
    removeBtn:    { display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.35rem 0.75rem', background: '#fff0f0', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', transition: 'background 0.15s' },
    emptyState:   { textAlign: 'center', padding: '2.5rem 1rem', color: '#94a3b8', fontSize: '0.875rem' },
    toastWrap:    { position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '0.5rem', pointerEvents: 'none' },
    toastBox: (type) => ({ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.125rem', borderRadius: '0.75rem', fontSize: '0.875rem', fontWeight: 500, background: type === 'error' ? '#fef2f2' : '#f0fdf4', color: type === 'error' ? '#dc2626' : '#15803d', border: `1px solid ${type === 'error' ? '#fecaca' : '#bbf7d0'}`, boxShadow: '0 4px 16px rgba(0,0,0,0.1)', animation: 'slideUp 0.25s ease', pointerEvents: 'auto' }),
  };

  const isApplyDisabled = !selectedProduct || selectedProduct.dealOfWeek || loading;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.headerTitle}><Tag size={20} />Deal of the Week</h1>
        <p style={styles.headerSub}>Set discounts on featured products and manage active deals</p>
      </div>

      {/* Stats */}
      <div style={styles.statsRow}>
        <div style={styles.statCard}><p style={styles.statLabel}>Active Deals</p><p style={styles.statValue}>{dealProducts.length}</p></div>
        <div style={styles.statCard}><p style={styles.statLabel}>Total Products</p><p style={styles.statValue}>{products.length}</p></div>
      </div>

      <div style={styles.grid}>
        {/* left — set deal form */}
        <div style={styles.card}>
          <p style={styles.cardTitle}><Percent size={15} />Set New Deal</p>
          <p style={styles.label}>Product</p>
          <select style={styles.select} value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)}>
            <option value="">— select a product —</option>
            {nonDealProducts.map(p => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
          <div style={styles.sliderWrap}>
            <p style={styles.label}>Discount</p>
            <div style={styles.sliderRow}>
              <input type="range" min={1} max={80} step={1} value={discount} style={styles.slider} onChange={e => setDiscount(Number(e.target.value))} />
              <span style={styles.sliderVal}>{discount}%</span>
            </div>
          </div>
          {selectedProduct && (
            <div style={styles.previewBox}>
              <div>
                <p style={styles.previewLabel}>Price Preview</p>
                <p style={styles.previewOrig}>₹{basePrice.toFixed(2)}</p>
                <p style={styles.previewNew}>₹{discountedPrice}</p>
              </div>
              <span style={styles.saveBadge}>Save ₹{savings}</span>
            </div>
          )}
          <button style={styles.applyBtn} onClick={applyDeal} disabled={isApplyDisabled}>
            {loading ? 'Applying…' : <><CheckCircle size={15} /> Apply Deal</>}
          </button>
          {selectedProduct?.dealOfWeek && (
            <p style={{ fontSize: '0.75rem', color: '#f59e0b', marginTop: '0.5rem', textAlign: 'center' }}>
              This product already has an active deal.
            </p>
          )}
        </div>

        {/* right — active deals list */}
        <div style={styles.card}>
          <p style={styles.cardTitle}><TrendingDown size={15} />Active Deals ({dealProducts.length})</p>
          {dealProducts.length === 0 ? (
            <div style={styles.emptyState}>
              <Tag size={28} style={{ margin: '0 auto 0.5rem', display: 'block', color: '#cbd5e1' }} />
              No active deals right now.<br />Set one using the form.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {dealProducts.map(p => {
                const dealPrice = resolvePrice(p);
                const origPrice = p.price ?? 0;
                return (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: '#f8fafc', borderRadius: '0.625rem', border: '1px solid #e2e8f0' }}>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1e293b', marginBottom: '0.2rem' }}>{p.title ?? '—'}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', textDecoration: 'line-through' }}>₹{origPrice.toFixed(2)}</span>
                        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1d4ed8' }}>₹{dealPrice.toFixed(2)}</span>
                        <span style={styles.dealBadge}>{p.discountPercent}% off</span>
                      </div>
                    </div>
                    <button style={styles.removeBtn} onClick={() => removeDeal(p)} disabled={removingId === p.id}>
                      <Trash2 size={13} />
                      {removingId === p.id ? '…' : 'Remove'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* all products table */}
      <div style={styles.fullCard}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <p style={styles.cardTitle}>All Products</p>
          <div style={{ ...styles.searchWrap, marginBottom: 0, width: '220px' }}>
            <Search style={styles.searchIcon} />
            <input type="text" placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)} style={styles.searchInput} />
          </div>
        </div>
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                {['Product', 'ID', 'Price', 'Deal', 'Discount', 'Action'].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* deal products first */}
              {dealProducts.map(p => {
                const dealPrice = resolvePrice(p);
                const origPrice = p.price ?? 0;
                return (
                  <tr key={p.id} style={{ background: '#fffbeb' }}>
                    <td style={styles.td}><strong>{p.title ?? '—'}</strong></td>
                    <td style={{ ...styles.td, color: '#94a3b8' }}>#{p.id}</td>
                    <td style={styles.td}>
                      <span style={{ textDecoration: 'line-through', color: '#94a3b8', marginRight: '0.4rem' }}>₹{origPrice.toFixed(2)}</span>
                      <span style={{ fontWeight: 700, color: '#1d4ed8' }}>₹{dealPrice.toFixed(2)}</span>
                    </td>
                    <td style={styles.td}><span style={styles.dealBadge}>Active</span></td>
                    <td style={styles.td}><span style={{ fontWeight: 600, color: '#854d0e' }}>{p.discountPercent}%</span></td>
                    <td style={styles.td}>
                      <button style={styles.removeBtn} onClick={() => removeDeal(p)} disabled={removingId === p.id}>
                        <Trash2 size={12} />
                        {removingId === p.id ? 'Removing…' : 'Remove'}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {/* non-deal products */}
              {filteredNonDeal.map(p => {
                const displayPrice = resolvePrice(p);
                const origPrice    = p.price ?? 0;
                const hasDiscount  = p.discountFinalPrice != null && p.discountFinalPrice !== 0;
                return (
                  <tr key={p.id}>
                    <td style={styles.td}>{p.title}</td>
                    <td style={{ ...styles.td, color: '#94a3b8' }}>#{p.id}</td>
                    <td style={{ ...styles.td, fontWeight: 600 }}>
                      {hasDiscount ? (
                        <>
                          <span style={{ textDecoration: 'line-through', color: '#94a3b8', marginRight: '0.4rem' }}>₹{origPrice.toFixed(2)}</span>
                          <span style={{ color: '#1d4ed8' }}>₹{displayPrice.toFixed(2)}</span>
                        </>
                      ) : (
                        <>₹{displayPrice.toFixed(2)}</>
                      )}
                    </td>
                    <td style={styles.td}><span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>—</span></td>
                    <td style={styles.td}><span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>—</span></td>
                    <td style={styles.td}>
                      <button
                        style={{ padding: '0.35rem 0.75rem', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                        onClick={() => { setSelectedProductId(String(p.id)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      >
                        + Set Deal
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredNonDeal.length === 0 && dealProducts.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ ...styles.td, textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>No products found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {toast && (
        <div style={styles.toastWrap}>
          <div style={styles.toastBox(toast.type)}>
            {toast.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
            {toast.msg}
          </div>
        </div>
      )}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}