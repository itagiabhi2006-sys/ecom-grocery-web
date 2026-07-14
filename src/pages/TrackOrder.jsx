import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../Api'; // Placeholder for backend API calls

export default function TrackOrder() {
  const { orderId } = useParams(); // Order ID passed from checkout
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch order details from backend
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    const fetchOrder = async () => {
      setLoading(true);
      try {
        // Replace with your backend API
        const res = await api.get(`/orders/${orderId}`);
        setOrder(res.data);
      } catch (err) {
        toast.error('Failed to fetch order details');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <span className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12"></span>
    </div>
  );

  if (!order) return <div className="min-h-screen flex items-center justify-center">Order not found</div>;

  const stages = [
    { id: 1, label: 'Order Placed' },
    { id: 2, label: 'Processing' },
    { id: 3, label: 'Shipped' },
    { id: 4, label: 'Out for Delivery' },
    { id: 5, label: 'Delivered' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Track Your Order</h2>
        <p className="text-gray-600 mb-6">Order ID: <span className="font-mono">{orderId}</span></p>

        {/* Order Items */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Order Items</h3>
          <div className="space-y-2">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center bg-gray-100 px-4 py-2 rounded">
                <div>{item.title} x {item.qty}</div>
                <div>₹{item.price * item.qty}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Status Tracker */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Order Status</h3>
          <div className="flex justify-between items-center w-full relative">
            {stages.map((stage, idx) => {
              const completed = stage.id <= order.status; // status from backend
              return (
                <div key={idx} className="flex-1 flex flex-col items-center relative">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${completed ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
                    {completed ? <i className="fas fa-check"></i> : stage.id}
                  </div>
                  <span className={`text-xs text-center ${completed ? 'text-green-600 font-semibold' : 'text-gray-500'}`}>{stage.label}</span>
                  {idx < stages.length - 1 && (
                    <div className={`absolute top-3.5 left-1/2 w-full h-1 -z-10 ${completed && stages[idx+1].id <= order.status ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Back Button */}
        <div className="flex justify-center mt-6">
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
