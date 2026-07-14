import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Search, ShoppingCart, ChevronDown } from 'lucide-react';
import api from '../Api';

const SC = {
  Delivered:           { bg:'#dcfce7', color:'#15803d' },
  Processing:          { bg:'#dbeafe', color:'#1d4ed8' },
  Shipped:             { bg:'#ede9fe', color:'#7c3aed' },
  Canceled:            { bg:'#fee2e2', color:'#b91c1c' },
  Ordered:             { bg:'#fef9c3', color:'#92400e' },
  'Return Requested':  { bg:'#ffedd5', color:'#c2410c' },
  'Return Approved':   { bg:'#fef3c7', color:'#b45309' },
  'Return Picked Up':  { bg:'#d1fae5', color:'#065f46' },
  Returned:            { bg:'#f1f5f9', color:'#475569' },
  'Refund Completed':  { bg:'#dcfce7', color:'#15803d' },
  'Out for Delivery':  { bg:'#e0e7ff', color:'#3730a3' },
  'Return Cancelled':  { bg:'#fee2e2', color:'#b91c1c' },
};

const PAGE = 10;

export default function AdminOrders() {
  const navigate = useNavigate();
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [filter, setFilter]   = useState('All');
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    api.get('/admin/orders')
      .then(res => {
        const sorted = [...res.data].sort(
          (a, b) => new Date(b.orderedAt) - new Date(a.orderedAt)
        );
        setOrders(sorted);
      })
      .catch(err => console.error('Failed to fetch orders:', err))
      .finally(() => setLoading(false));
  }, []);

  const statuses = [
    'All','Ordered','Processing','Shipped','Out for Delivery',
    'Delivered','Canceled','Return Requested','Returned',
  ];

  const filtered = orders.filter(o => {
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      (o.fullName || '').toLowerCase().includes(q) ||
      String(o.orderId).includes(q) ||
      (o.email || '').toLowerCase().includes(q);
    const matchFilter = filter === 'All' || o.status === filter;
    return matchSearch && matchFilter;
  });

  const isFiltering = search || filter !== 'All';
  const visible     = isFiltering || showAll ? filtered : filtered.slice(0, PAGE);
  const hasMore     = !isFiltering && !showAll && filtered.length > PAGE;

  if (loading) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:300, color:'#94a3b8', fontFamily:"'Space Grotesk',sans-serif", fontSize:15 }}>
        Loading orders…
      </div>
    );
  }

  return (
    <div style={{ padding:'32px 36px' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
        <div>
          <h1 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:26, fontWeight:700, color:'#0f1f5c', margin:0 }}>
            Orders
          </h1>
          <p style={{ color:'#64748b', fontSize:13, marginTop:3 }}>
            {filtered.length} order{filtered.length !== 1 ? 's' : ''}
            {!isFiltering && filtered.length > PAGE ? ` — showing ${visible.length}` : ''}
          </p>
        </div>
      </div>

      {/* Search + Filter */}
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20, flexWrap:'wrap' }}>
        <div style={{ position:'relative', flex:'0 0 260px' }}>
          <Search size={14} color="#94a3b8" style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)' }} />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setShowAll(false); }}
            placeholder="Search order, customer, email…"
            style={{ width:'100%', padding:'8px 12px 8px 33px', borderRadius:8, border:'1.5px solid #e2e8f0', fontSize:13, outline:'none', background:'#fff', boxSizing:'border-box' }}
          />
        </div>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {statuses.map(s => (
            <button
              key={s}
              onClick={() => { setFilter(s); setShowAll(false); }}
              style={{ padding:'5px 12px', borderRadius:20, border:'1.5px solid', fontSize:11, fontWeight:500, cursor:'pointer', background:filter===s?'#1d4ed8':'#fff', color:filter===s?'#fff':'#64748b', borderColor:filter===s?'#1d4ed8':'#e2e8f0', transition:'all 0.15s' }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ background:'#fff', borderRadius:16, boxShadow:'0 1px 16px rgba(15,31,92,0.07)', border:'1px solid rgba(15,31,92,0.05)', overflow:'hidden' }}>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'#f8fafc', borderBottom:'1px solid #e2e8f0' }}>
                {['Order','Customer','Payment','Total','Date','Status',''].map(h => (
                  <th key={h} style={{ padding:'10px 18px', textAlign:'left', color:'#64748b', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', whiteSpace:'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map(o => {
                const isCOD = !o.paymentMode || o.paymentMode === 'COD';
                const s     = SC[o.status] || { bg:'#f1f5f9', color:'#475569' };

                return (
                  <tr
                    key={o.orderId}
                    style={{ borderBottom:'1px solid #f1f5f9', transition:'background 0.1s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fafbff'}
                    onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                  >
                    {/* Order ID */}
                    <td style={{ padding:'10px 18px', fontWeight:700, color:'#1d4ed8', fontSize:13 }}>
                      #{o.orderId}
                    </td>

                    {/* Customer — uses fullName & email directly from API */}
                    <td style={{ padding:'10px 18px' }}>
                      <div style={{ fontWeight:600, color:'#1e293b', fontSize:13 }}>{o.fullName}</div>
                      <div style={{ color:'#94a3b8', fontSize:11 }}>{o.email}</div>
                    </td>

                    {/* Payment mode */}
                    <td style={{ padding:'10px 18px' }}>
                      <span style={{ background:isCOD?'#fef9c3':'#dbeafe', color:isCOD?'#92400e':'#1d4ed8', padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:600 }}>
                        {o.paymentMode || 'COD'}
                      </span>
                    </td>

                    {/* Total */}
                    <td style={{ padding:'10px 18px', fontWeight:700, color:'#1e293b', fontSize:14 }}>
                      ₹{o.totalPrice?.toFixed(2)}
                    </td>

                    {/* Date — uses orderedAt */}
                    <td style={{ padding:'10px 18px', fontSize:12, color:'#64748b', whiteSpace:'nowrap' }}>
                      {new Date(o.orderedAt).toLocaleDateString()}
                      <br />
                      <span style={{ color:'#94a3b8' }}>
                        {new Date(o.orderedAt).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}
                      </span>
                    </td>

                    {/* Status badge */}
                    <td style={{ padding:'10px 18px' }}>
                      <span style={{ background:s.bg, color:s.color, padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:600 }}>
                        {o.status}
                      </span>
                    </td>

                    {/* View button — navigates using orderId */}
                    <td style={{ padding:'10px 18px' }}>
                      <button
                        onClick={() => navigate(`/admin/orders/${o.orderId}`)}
                        style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 12px', borderRadius:8, background:'linear-gradient(135deg,#1a3a8f,#1d4ed8)', color:'#fff', border:'none', cursor:'pointer', fontSize:12, fontWeight:600, boxShadow:'0 2px 8px rgba(29,78,216,0.25)' }}
                      >
                        <Eye size={12} /> View
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign:'center', padding:'48px 0', color:'#94a3b8' }}>
                    <ShoppingCart size={36} style={{ margin:'0 auto 8px', opacity:0.3, display:'block' }} />
                    No orders match.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Show more */}
        {hasMore && (
          <div style={{ borderTop:'1px solid #f1f5f9', padding:'14px 18px', textAlign:'center' }}>
            <button
              onClick={() => setShowAll(true)}
              style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'8px 22px', borderRadius:10, border:'1.5px solid #e2e8f0', background:'#fff', color:'#475569', fontSize:13, fontWeight:600, cursor:'pointer', transition:'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.background='#f8fafc'; e.currentTarget.style.borderColor='#cbd5e1'; }}
              onMouseLeave={e => { e.currentTarget.style.background='#fff'; e.currentTarget.style.borderColor='#e2e8f0'; }}
            >
              <ChevronDown size={15} />
              Show all {filtered.length} orders
            </button>
          </div>
        )}

        {/* Collapse */}
        {showAll && filtered.length > PAGE && !isFiltering && (
          <div style={{ borderTop:'1px solid #f1f5f9', padding:'14px 18px', textAlign:'center' }}>
            <button
              onClick={() => { setShowAll(false); window.scrollTo({ top:0, behavior:'smooth' }); }}
              style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'8px 22px', borderRadius:10, border:'1.5px solid #e2e8f0', background:'#fff', color:'#94a3b8', fontSize:13, fontWeight:600, cursor:'pointer' }}
            >
              Show less
            </button>
          </div>
        )}
      </div>
    </div>
  );
}