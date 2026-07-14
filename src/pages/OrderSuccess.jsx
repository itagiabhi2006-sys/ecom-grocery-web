import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Home, ShoppingBag } from "lucide-react";

export default function OrderSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    // Clear checkout data
    localStorage.removeItem("kirani_checkout_item");
    localStorage.removeItem("kirani_delivery_address");

    // Auto redirect to home in 5 seconds
    const timer = setTimeout(() => {
      navigate("/");
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-white to-emerald-50 flex items-center justify-center z-50 p-4">
      <div className="max-w-md w-full">
        {/* Main Success Card */}
        <div className="bg-white rounded-3xl shadow-2xl shadow-emerald-200/50 overflow-hidden border border-emerald-100">
          
          {/* Top Gradient Bar */}
          <div className="h-2 bg-gradient-to-r from-emerald-400 to-green-500" />
          
          <div className="p-8 md:p-10">
            {/* Animated Check Circle */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                {/* Outer Ring Pulse */}
                <div className="absolute inset-0 rounded-full bg-emerald-100 animate-ping" />
                
                {/* Main Circle */}
                <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-14 h-14 text-white" />
                </div>
              </div>
            </div>

            {/* Success Text */}
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                Order Confirmed!
              </h1>
              <p className="text-gray-600 text-lg mb-6">
                Thank you for your purchase. We've sent a confirmation email with your order details.
              </p>
              
              {/* Order Number */}
              <div className="inline-flex items-center gap-3 bg-emerald-50 rounded-full px-6 py-3 mb-8">
                <ShoppingBag className="w-5 h-5 text-emerald-600" />
                <span className="font-mono font-bold text-gray-800">
                  ORD-{Math.floor(100000 + Math.random() * 900000)}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-10">
              <div className="text-center mb-3">
                <span className="text-sm font-medium text-gray-500">
                  Redirecting to home in 5 seconds
                </span>
              </div>
              <div className="h-2 bg-emerald-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-green-500 animate-progress" />
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={() => navigate("/")}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-green-600 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg active:scale-95 flex items-center justify-center gap-3"
            >
              <Home className="w-5 h-5" />
              Return to Homepage
            </button>

            {/* Help Text */}
            <p className="text-center text-gray-500 text-sm mt-6">
              Need help?{" "}
              <button 
                onClick={() => alert("Customer support will contact you shortly")}
                className="text-emerald-600 font-medium hover:text-emerald-700"
              >
                Contact Support
              </button>
            </p>
          </div>

          {/* Bottom Decoration */}
          <div className="h-2 bg-gradient-to-r from-emerald-100 to-green-100" />
        </div>

        {/* Celebration Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-gradient-to-r from-emerald-400 to-green-400 animate-bounce"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>

      {/* Custom Animation */}
      <style>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
        .animate-progress {
          animation: progress 5s linear forwards;
        }
      `}</style>
    </div>
  );
}