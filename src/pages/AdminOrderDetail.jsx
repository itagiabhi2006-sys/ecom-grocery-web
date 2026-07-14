import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, RotateCcw, Trash2, CreditCard,
  RefreshCw, Package, CheckCircle2,
} from 'lucide-react';
import api from '../Api';

// ─── Helpers ────────────────────────────────────────────────────────────────
const toTitle = (s = '') =>
  s.toLowerCase().replace(/(^|\s)\S/g, c => c.toUpperCase());

const STATUS_BADGE = {
  'Delivered':         'bg-green-100 text-green-700',
  'Processing':        'bg-blue-100 text-blue-700',
  'Shipped':           'bg-purple-100 text-purple-700',
  'Canceled':          'bg-red-100 text-red-700',
  'Ordered':           'bg-yellow-100 text-yellow-700',
  'Return Requested':  'bg-orange-100 text-orange-700',
  'Return Approved':   'bg-amber-100 text-amber-700',
  'Return Picked Up':  'bg-teal-100 text-teal-700',
  'Returned':          'bg-gray-100 text-gray-700',
  'Refund Completed':  'bg-green-100 text-green-700',
  'Out For Delivery':  'bg-indigo-100 text-indigo-700',
  'Return Cancelled':  'bg-red-100 text-red-700',
};
const badge = (status) =>
  STATUS_BADGE[toTitle(status)] || 'bg-orange-100 text-orange-700';

const isOnline = (order) => order?.paymentMode && order.paymentMode !== 'COD';
const isCOD    = (order) => !order?.paymentMode || order.paymentMode === 'COD';

const LOCKED_STATUSES = [
  'canceled', 'returned', 'delivered', 'refund completed', 'return cancelled',
];
const isTrackingLocked = (status = '') =>
  LOCKED_STATUSES.includes(status.toLowerCase());

const RETURN_STATUSES = [
  'return', 'return requested', 'return approved', 'return picked up',
];
const canProcessReturn = (status = '') =>
  RETURN_STATUSES.includes(status.toLowerCase());

const NORMAL_ORDER = ['Ordered', 'Processing', 'Shipped', 'Out For Delivery', 'Delivered'];
const getAvailableStatuses = (current = '') => {
  const idx    = NORMAL_ORDER.findIndex(s => s.toLowerCase() === current.toLowerCase());
  const future = NORMAL_ORDER.slice(idx + 1);
  if (!future.includes('Canceled')) future.push('Canceled');
  return future;
};

const RETURN_ORDER = [
  'Return Requested', 'Return Approved', 'Return Picked Up', 'Returned',
];
const getAvailableReturnStatuses = (current = '') => {
  const idx = RETURN_ORDER.findIndex(s => s.toLowerCase() === current.toLowerCase());
  return RETURN_ORDER.slice(idx + 1);
};

const getCodRefundAction = (order) => {
  const rs = order?.refundStatus;
  if (!rs || rs === 'NOT_REQUESTED') return null;
  if (rs === 'PENDING')  return 'approve';
  if (rs === 'APPROVED') return 'complete';
  return null;
};

const formatDate = (val) => {
  if (!val) return '';
  const d = new Date(val + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};
const todayISO = () => new Date().toISOString().slice(0, 10);

const inputCls =
  'w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm ' +
  'focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 ' +
  'focus:bg-white transition-all';

// ─── Component ───────────────────────────────────────────────────────────────
export default function AdminOrderDetail() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [order,          setOrder]          = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [showTrackForm,  setShowTrackForm]  = useState(false);
  const [trackStatus,    setTrackStatus]    = useState('');
  const [customStage,    setCustomStage]    = useState('');
  const [trackDesc,      setTrackDesc]      = useState('');
  const [trackDate,      setTrackDate]      = useState(todayISO());
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [returnStatus,   setReturnStatus]   = useState('');
  const [customReturnStage, setCustomReturnStage] = useState('');
  const [returnDesc,     setReturnDesc]     = useState('');
  const [returnDate,     setReturnDate]     = useState(todayISO());
  const [refundData,    setRefundData]    = useState(null);
  const [refundLoading, setRefundLoading] = useState(false);
  const [codLoading,    setCodLoading]    = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/orders/${id}`);
      setOrder(res.data);
    } catch (err) {
      console.error('Failed to load order', err);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, [id]);

  const buildDesc = (desc, dateISO) => {
    const formatted = formatDate(dateISO);
    const trimmed   = desc.trim();
    if (!formatted) return trimmed;
    return trimmed ? `${trimmed} — ${formatted}` : formatted;
  };

  const handleProcessOrder = async () => {
    if (!window.confirm('Move to Processing?')) return;
    await api.get(
      `/admin/update-track-record/${order.orderId}/Processing/${encodeURIComponent('Order confirmed and being processed')}`
    );
    refresh();
  };

  const handleUpdateTrack = async () => {
    // Custom stage takes priority; fall back to predefined select
    const finalStatus = customStage.trim() || trackStatus;
    const finalDesc   = buildDesc(trackDesc, trackDate);
    if (!finalDesc || !finalStatus) {
      alert('Select a predefined status OR enter a custom stage, and add a description');
      return;
    }
    await api.get(
      `/admin/update-track-record/${order.orderId}/${encodeURIComponent(finalStatus)}/${encodeURIComponent(finalDesc)}`
    );
    setTrackDesc(''); setTrackStatus(''); setCustomStage('');
    setTrackDate(todayISO()); setShowTrackForm(false);
    refresh();
  };

  const handleReturnUpdate = async () => {
    // Custom return stage takes priority; fall back to predefined select
    const finalStatus = customReturnStage.trim() || returnStatus;
    const finalDesc   = buildDesc(returnDesc, returnDate);
    if (!finalDesc || !finalStatus) {
      alert('Select a return status OR enter a custom stage, and add a description');
      return;
    }
    await api.get(
      `/admin/update-track-record/${order.orderId}/${encodeURIComponent(finalStatus)}/${encodeURIComponent(finalDesc)}`
    );
    setReturnDesc(''); setReturnStatus(''); setCustomReturnStage('');
    setReturnDate(todayISO()); setShowReturnForm(false);
    refresh();
  };

  const handleCancelReturn = async () => {
    if (!window.confirm('Cancel this return request?')) return;
    await api.get(
      `/admin/update-track-record/${order.orderId}/Return Cancelled/${encodeURIComponent('Return request cancelled.')}`
    );
    refresh();
  };

  const handleInitiateRefund = async () => {
    if (!window.confirm('Initiate online refund?')) return;
    setRefundLoading(true);
    try {
      await api.post(`/payment/admin/refund/${order.orderId}`);
      refresh();
    } catch { alert('Failed to initiate refund'); }
    finally { setRefundLoading(false); }
  };

  const handleCheckRefundStatus = async () => {
    if (!order.refundId) { alert('No refund ID found'); return; }
    setRefundLoading(true);
    try {
      const res    = await api.get(`/payment/admin/refund-status/${order.refundId}`);
      setRefundData(res.data);
      const status = res.data?.status || res.data;
      if (status === 'processed') {
        await api.get(
          `/admin/update-track-record/${order.orderId}/Refund Completed/${encodeURIComponent('Online refund successfully processed')}`
        );
        alert('Refund confirmed!');
        refresh();
      } else if (status === 'failed') {
        alert('Refund FAILED. Check Razorpay dashboard.');
      } else {
        alert(`Refund status: ${status}`);
      }
    } catch { alert('Failed to fetch refund status'); }
    finally { setRefundLoading(false); }
  };

  const handleCodRefundAction = async (action) => {
    if (!window.confirm(
      action === 'approve' ? 'Approve COD Refund?' : 'Mark COD Refund as Completed?'
    )) return;
    setCodLoading(true);
    try {
      if (action === 'approve')
        await api.post(`/payment/admin/approve-cod-refund/${order.orderId}`);
      else
        await api.post(`/payment/admin/cod-refund-complete/${order.orderId}`);
      refresh();
    } catch { alert('Failed'); }
    finally { setCodLoading(false); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#f0f4ff' }}>
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Loading order...</p>
      </div>
    </div>
  );

  if (!order) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#f0f4ff' }}>
      <div className="text-center">
        <p className="text-gray-500 mb-3">Order not found.</p>
        <button onClick={() => navigate('/admin/orders')} className="text-blue-600 underline text-sm">
          Back to orders
        </button>
      </div>
    </div>
  );

  const displayStatus  = toTitle(order.status);
  const locked         = isTrackingLocked(order.status);
  const returnable     = canProcessReturn(order.status);
  const discount       = order.discountAmount ?? 0;
  const hasDiscount    = discount > 0;
  const subtotal       = (order.products || []).reduce((sum, p) => sum + (p.price), 0);

  // Derived: what will actually be submitted (for live preview)
  const trackFinalStatus = customStage.trim() || trackStatus;
  const returnFinalStatus = customReturnStage.trim() || returnStatus;

  return (
    <div className="min-h-screen" style={{ background: '#f0f4ff' }}>

      {/* ── Top Bar ── */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4 flex-wrap">
          <button
            onClick={() => navigate('/admin/orders')}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-gray-600 hover:bg-gray-100 transition text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Orders
          </button>
          <div className="h-5 w-px bg-gray-200" />
          <h1 className="text-xl font-black text-gray-900" style={{ letterSpacing: '-0.02em' }}>
            Order #{order.orderId}
          </h1>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${isOnline(order) ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
            {order.paymentMode || 'COD'}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${badge(order.status)}`}>
            {displayStatus}
          </span>
          {hasDiscount && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
              &#8377;{discount.toFixed(2)} discount applied
            </span>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-5">

        {/* ── Overview Card ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <p className="text-xs text-gray-400 uppercase font-bold mb-1">Customer</p>
              <p className="font-bold text-gray-900">{order.address?.fullName}</p>
              <p className="text-sm text-gray-500">{order.user?.email}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase font-bold mb-1">Order Date</p>
              <p className="font-semibold text-gray-900">{new Date(order.orderedAt).toLocaleDateString()}</p>
              <p className="text-sm text-gray-500">{new Date(order.orderedAt).toLocaleTimeString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase font-bold mb-1">Total Amount</p>
              {hasDiscount && (
                <p className="text-sm text-gray-400 line-through">&#8377;{subtotal.toFixed(2)}</p>
              )}
              <p className="text-3xl font-black text-blue-600" style={{ letterSpacing: '-0.03em' }}>
                &#8377;{order.totalPrice?.toFixed(2)}
              </p>
              {hasDiscount && (
                <p className="text-xs font-semibold text-green-600 mt-1">
                  &#8377;{discount.toFixed(2)} off
                </p>
              )}
            </div>
          </div>

          {/* ── Status Controls ── */}
          <div className="border-t border-gray-100 pt-5">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
              <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-sm font-bold ${badge(order.status)}`}>
                {displayStatus}
              </span>
              <div className="flex gap-2 flex-wrap">
                {order.status.toUpperCase() === 'ORDERED' && (
                  <button
                    onClick={handleProcessOrder}
                    className="flex items-center gap-2 px-4 py-2 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition"
                    style={{ background: '#4f46e5' }}
                  >
                    <CheckCircle2 className="w-4 h-4" /> Process Order
                  </button>
                )}
                {!locked && order.status.toUpperCase() !== 'ORDERED' && !showTrackForm && !showReturnForm && !returnable && (
                  <button
                    onClick={() => setShowTrackForm(true)}
                    className="px-4 py-2 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition"
                    style={{ background: '#2563eb' }}
                  >
                    Update Status
                  </button>
                )}
                {returnable && !showTrackForm && !showReturnForm && (
                  <>
                    <button
                      onClick={() => setShowReturnForm(true)}
                      className="flex items-center gap-2 px-4 py-2 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition"
                      style={{ background: '#ea580c' }}
                    >
                      <RotateCcw className="w-4 h-4" /> Process Return
                    </button>
                    {order.status.toLowerCase() !== 'return picked up' && (
                      <button
                        onClick={handleCancelReturn}
                        className="flex items-center gap-2 px-4 py-2 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition"
                        style={{ background: '#dc2626' }}
                      >
                        <Trash2 className="w-4 h-4" /> Cancel Return
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* ── Track Update Form ── */}
            {showTrackForm && !locked && (
              <div className="p-4 rounded-xl border-2 space-y-4" style={{ background: '#eff6ff', borderColor: '#93c5fd' }}>
                <h4 className="font-bold text-gray-900 text-sm">Update Order Status</h4>

                {/* Predefined select */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Predefined Status
                  </label>
                  <select
                    value={trackStatus}
                    onChange={e => { setTrackStatus(e.target.value); setCustomStage(''); }}
                    className={inputCls}
                  >
                    <option value="">Select a predefined status…</option>
                    {getAvailableStatuses(displayStatus).map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-blue-200" />
                  <span className="text-xs font-bold text-blue-400 uppercase">or</span>
                  <div className="flex-1 h-px bg-blue-200" />
                </div>

                {/* Custom stage */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Custom Stage
                  </label>
                  <input
                    value={customStage}
                    onChange={e => { setCustomStage(e.target.value); setTrackStatus(''); }}
                    placeholder="e.g. Quality Check, Packed, At Warehouse…"
                    className={inputCls}
                    style={{ borderColor: customStage ? '#fb923c' : '' }}
                  />
                  {customStage && (
                    <p className="text-xs text-orange-500 mt-1 font-medium">
                      ⚠ This custom stage will be shown to the customer as-is.
                    </p>
                  )}
                </div>

                {/* Active status preview */}
                {trackFinalStatus && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-blue-200 text-sm">
                    <span className="text-gray-500">Will update to:</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${customStage ? 'bg-orange-100 text-orange-700' : badge(trackFinalStatus)}`}>
                      {trackFinalStatus}
                    </span>
                    {customStage && <span className="text-xs text-orange-400">(custom)</span>}
                  </div>
                )}

                {/* Date */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date</label>
                  <div className="flex items-center gap-3">
                    <input type="date" value={trackDate} onChange={e => setTrackDate(e.target.value)} className={inputCls} style={{ maxWidth: 180 }} />
                    {trackDate && (
                      <span className="text-sm font-semibold text-gray-700 bg-gray-100 px-3 py-1.5 rounded-lg">
                        {formatDate(trackDate)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                  <textarea
                    value={trackDesc}
                    onChange={e => setTrackDesc(e.target.value)}
                    placeholder="e.g. Shipment picked up by courier…"
                    className={`${inputCls} resize-none`}
                    rows={3}
                  />
                  {trackDesc && trackDate && (
                    <p className="text-xs text-gray-400 mt-1">
                      Will be saved as: <span className="font-semibold text-gray-600">"{trackDesc.trim()} — {formatDate(trackDate)}"</span>
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleUpdateTrack}
                    className="px-4 py-2 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition"
                    style={{ background: customStage ? '#ea580c' : '#2563eb' }}
                  >
                    Update
                  </button>
                  <button
                    onClick={() => {
                      setShowTrackForm(false); setTrackStatus('');
                      setTrackDesc(''); setCustomStage(''); setTrackDate(todayISO());
                    }}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* ── Return Update Form ── */}
            {showReturnForm && returnable && (
              <div className="p-4 rounded-xl border-2 border-orange-200 space-y-4" style={{ background: '#fff7ed' }}>
                <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-orange-600" /> Process Return
                </h4>

                {/* Predefined return select */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Predefined Return Status
                  </label>
                  <select
                    value={returnStatus}
                    onChange={e => { setReturnStatus(e.target.value); setCustomReturnStage(''); }}
                    className={inputCls}
                  >
                    <option value="">Select a return status…</option>
                    {getAvailableReturnStatuses(displayStatus).map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-orange-200" />
                  <span className="text-xs font-bold text-orange-400 uppercase">or</span>
                  <div className="flex-1 h-px bg-orange-200" />
                </div>

                {/* Custom return stage */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Custom Stage
                  </label>
                  <input
                    value={customReturnStage}
                    onChange={e => { setCustomReturnStage(e.target.value); setReturnStatus(''); }}
                    placeholder="e.g. Item Inspected, Awaiting QC…"
                    className={inputCls}
                    style={{ borderColor: customReturnStage ? '#fb923c' : '' }}
                  />
                  {customReturnStage && (
                    <p className="text-xs text-orange-500 mt-1 font-medium">
                      ⚠ This custom stage will be shown to the customer as-is.
                    </p>
                  )}
                </div>

                {/* Active status preview */}
                {returnFinalStatus && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-orange-200 text-sm">
                    <span className="text-gray-500">Will update to:</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${customReturnStage ? 'bg-orange-100 text-orange-700' : badge(returnFinalStatus)}`}>
                      {returnFinalStatus}
                    </span>
                    {customReturnStage && <span className="text-xs text-orange-400">(custom)</span>}
                  </div>
                )}

                {/* Date */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date</label>
                  <div className="flex items-center gap-3">
                    <input type="date" value={returnDate} onChange={e => setReturnDate(e.target.value)} className={inputCls} style={{ maxWidth: 180 }} />
                    {returnDate && (
                      <span className="text-sm font-semibold text-gray-700 bg-gray-100 px-3 py-1.5 rounded-lg">
                        {formatDate(returnDate)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                  <textarea
                    value={returnDesc}
                    onChange={e => setReturnDesc(e.target.value)}
                    placeholder="Return details…"
                    className={`${inputCls} resize-none`}
                    rows={3}
                  />
                  {returnDesc && returnDate && (
                    <p className="text-xs text-gray-400 mt-1">
                      Will be saved as: <span className="font-semibold text-gray-600">"{returnDesc.trim()} — {formatDate(returnDate)}"</span>
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleReturnUpdate}
                    className="px-4 py-2 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition"
                    style={{ background: '#ea580c' }}
                  >
                    Update Return
                  </button>
                  <button
                    onClick={() => {
                      setShowReturnForm(false); setReturnStatus('');
                      setCustomReturnStage(''); setReturnDesc(''); setReturnDate(todayISO());
                    }}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {locked && !returnable && (
              <p className="text-xs text-gray-400 italic">
                Status updates are locked for {displayStatus.toLowerCase()} orders.
              </p>
            )}
          </div>
        </div>

        {/* ── Return Reason ── */}
        {order.reasonForReturn && (
          <div className="mt-3 p-3 rounded-xl bg-orange-50 border border-orange-200">
            <p className="text-xs text-orange-500 font-bold uppercase mb-1">Return Reason</p>
            <p className="text-sm text-gray-800 font-medium">{order.reasonForReturn}</p>
          </div>
        )}

        {/* ── COD Refund Panel ── */}
        {isCOD(order) && order.status.toUpperCase() === 'RETURNED' && (
          <div className="bg-white rounded-2xl shadow-sm border-l-4 p-6" style={{ borderLeftColor: '#d97706' }}>
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-yellow-600" /> COD Refund Management
            </h3>
            {!order.refundStatus || order.refundStatus === 'NOT_REQUESTED' ? (
              <div className="p-4 rounded-xl border border-yellow-200" style={{ background: '#fefce8' }}>
                <p className="text-sm text-yellow-800 font-medium">Waiting for customer to submit bank / UPI details.</p>
                <p className="text-xs text-yellow-600 mt-1">Refund action buttons will appear once the customer submits their refund details.</p>
              </div>
            ) : order.refundStatus === 'COMPLETED' ? (
              <div className="p-4 rounded-xl border border-green-200" style={{ background: '#f0fdf4' }}>
                <p className="text-sm text-green-800 font-bold">COD Refund Completed</p>
                <p className="text-xs text-green-600 mt-1">Refund processed via {order.refundMethod}.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 text-sm space-y-1">
                  <p className="font-semibold text-gray-700">Customer Refund Details:</p>
                  <p>Method: <span className="font-bold">{order.refundMethod}</span></p>
                  {order.refundUpi         && <p>UPI ID: <span className="font-bold">{order.refundUpi}</span></p>}
                  {order.bankAccountNumber && <p>Account: <span className="font-bold">{order.bankAccountNumber}</span></p>}
                  {order.bankIfsc          && <p>IFSC: <span className="font-bold">{order.bankIfsc}</span></p>}
                  <p className="mt-2">
                    Status:{' '}
                    <span className={`font-bold px-2 py-0.5 rounded text-xs ${
                      order.refundStatus === 'PENDING'  ? 'bg-yellow-100 text-yellow-700' :
                      order.refundStatus === 'APPROVED' ? 'bg-blue-100 text-blue-700'    :
                      'bg-gray-100 text-gray-700'
                    }`}>{order.refundStatus}</span>
                  </p>
                </div>
                {getCodRefundAction(order) === 'approve' && (
                  <button onClick={() => handleCodRefundAction('approve')} disabled={codLoading}
                    className="w-full px-4 py-3 text-white rounded-xl font-semibold text-sm disabled:opacity-50 hover:opacity-90 transition"
                    style={{ background: '#2563eb' }}>
                    {codLoading ? 'Processing...' : 'Approve COD Refund'}
                  </button>
                )}
                {getCodRefundAction(order) === 'complete' && (
                  <button onClick={() => handleCodRefundAction('complete')} disabled={codLoading}
                    className="w-full px-4 py-3 text-white rounded-xl font-semibold text-sm disabled:opacity-50 hover:opacity-90 transition"
                    style={{ background: '#16a34a' }}>
                    {codLoading ? 'Processing...' : 'Mark Refund as Completed'}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Online Refund Panel ── */}
        {isOnline(order) &&
          (order.status.toUpperCase() === 'CANCELED' || order.status.toUpperCase() === 'RETURNED') && (
          <div className="bg-white rounded-2xl shadow-sm border-l-4 p-6" style={{ borderLeftColor: '#2563eb' }}>
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" /> Online Refund Management
            </h3>
            {!order.refundId ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Order paid online and <strong>{displayStatus.toLowerCase()}</strong>. Initiate refund to customer's original payment method.
                </p>
                <button onClick={handleInitiateRefund} disabled={refundLoading}
                  className="px-6 py-3 text-white rounded-xl font-semibold text-sm disabled:opacity-50 hover:opacity-90 transition"
                  style={{ background: '#2563eb' }}>
                  {refundLoading ? 'Initiating...' : 'Initiate Online Refund'}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3 rounded-xl border border-blue-200" style={{ background: '#eff6ff' }}>
                  <p className="text-sm font-semibold text-blue-800">
                    Refund ID: <span className="font-mono">{order.refundId}</span>
                  </p>
                </div>
                <button onClick={handleCheckRefundStatus} disabled={refundLoading}
                  className="flex items-center gap-2 px-4 py-2 text-white rounded-xl font-semibold text-sm disabled:opacity-50 hover:opacity-90 transition"
                  style={{ background: '#4f46e5' }}>
                  <RefreshCw className={`w-4 h-4 ${refundLoading ? 'animate-spin' : ''}`} />
                  {refundLoading ? 'Checking...' : 'Check Refund Status'}
                </button>
                {refundData && (
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-sm">
                    <p className="font-bold text-gray-700 mb-2">Refund Status:</p>
                    <pre className="text-xs text-gray-600 whitespace-pre-wrap break-all">
                      {typeof refundData === 'object' ? JSON.stringify(refundData, null, 2) : String(refundData)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Customer Info ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-900 mb-4">Customer Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 rounded-xl bg-gray-50">
              <p className="text-xs text-gray-400 uppercase font-bold mb-1">Name</p>
              <p className="font-medium text-gray-900 text-sm">{order.user?.firstName} {order.user?.lastName}</p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50">
              <p className="text-xs text-gray-400 uppercase font-bold mb-1">Email</p>
              <p className="font-medium text-gray-900 text-sm">{order.user?.email}</p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50">
              <p className="text-xs text-gray-400 uppercase font-bold mb-1">Phone</p>
              <p className="font-medium text-gray-900 text-sm">{order.address?.phone}</p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50">
              <p className="text-xs text-gray-400 uppercase font-bold mb-1">Pincode</p>
              <p className="font-medium text-gray-900 text-sm">{order.address?.pincode}</p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 md:col-span-2">
              <p className="text-xs text-gray-400 uppercase font-bold mb-1">Delivery Address</p>
              <p className="font-medium text-gray-900 text-sm">{order.address?.address}, {order.address?.city}</p>
            </div>
          </div>
        </div>

        {/* ── Order Items ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" /> Order Items
          </h3>
          <div className="space-y-3">
            {(order.products || []).map((product, i) => (
              <div key={product.productId ?? i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-4">
                  {product.productImage && (
                    <div className="w-14 h-14 rounded-xl overflow-hidden border border-gray-200 flex-shrink-0">
                      <img src={product.productImage} alt={product.productName} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{product.productName}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Qty: <span className="font-bold text-gray-700">{product.quantity}</span></p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">&#8377;{product.price / product.quantity} x {product.quantity}</p>
                  <p className="font-black text-blue-600 text-lg">&#8377;{product.price}</p>
                </div>
              </div>
            ))}
          </div>
          {hasDiscount && (
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 font-medium">Subtotal</span>
                <span className="font-semibold text-gray-700">&#8377;{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-green-700 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                  Discount Applied
                </span>
                <span className="font-bold text-green-700">&#8722; &#8377;{discount.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm pt-1 border-t border-dashed border-gray-200">
                <span className="font-bold text-gray-800">Total After Discount</span>
                <span className="font-black text-blue-600 text-base">&#8377;{order.totalPrice?.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>

        {/* ── Grand Total ── */}
        <div className="rounded-2xl p-6" style={{ background: 'linear-gradient(135deg, #1e3a8a, #2563eb)' }}>
          {hasDiscount ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-blue-200 text-sm font-medium">Subtotal</p>
                <p className="text-blue-200 text-sm font-semibold line-through">&#8377;{subtotal.toFixed(2)}</p>
              </div>
              <div className="flex items-center justify-between bg-white/10 rounded-xl px-4 py-2">
                <p className="text-green-300 text-sm font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
                  Discount
                </p>
                <p className="text-green-300 text-sm font-bold">&#8722; &#8377;{discount.toFixed(2)}</p>
              </div>
              <div className="border-t border-white/20" />
              <div className="flex items-center justify-between">
                <p className="text-white text-xl font-bold">Grand Total</p>
                <p className="text-white text-4xl font-black" style={{ letterSpacing: '-0.03em' }}>
                  &#8377;{order.totalPrice?.toFixed(2)}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-white text-xl font-bold">Grand Total</p>
              <p className="text-white text-4xl font-black" style={{ letterSpacing: '-0.03em' }}>
                &#8377;{order.totalPrice?.toFixed(2)}
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}