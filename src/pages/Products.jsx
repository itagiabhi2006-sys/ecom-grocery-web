import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, ChevronDown } from 'lucide-react';
import api from '../Api';
import { useAuth } from '../contexts/AuthContext';
import ProductCard from '../components/ProductCard';

export default function ProductsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('default');
  const [sortOpen, setSortOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    fetchProducts();
  }, []);

  useEffect(() => {
    const handler = (e) => { if (!e.target.closest('#sort-dropdown')) setSortOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/products');
      const data = res.data;
      setProducts(data);
      const cats = ['All', ...new Set(data.map(p => p.category?.name || p.category || p.categoryName).filter(Boolean))];
      setCategories(cats);
    } catch {
      setError('Could not load products. Make sure the backend API is running.');
    } finally {
      setLoading(false);
    }
  };

  const filtered = products
    .filter(p => selectedCategory === 'All' || p.category?.name === selectedCategory || p.category === selectedCategory || p.categoryName === selectedCategory)
    .sort((a, b) => {
      if (sortBy === 'price-asc') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'price-desc') return (b.price || 0) - (a.price || 0);
      if (sortBy === 'name-asc') return a.title?.localeCompare(b.title);
      if (sortBy === 'name-desc') return b.title?.localeCompare(a.title);
      return 0;
    });

  const sortOptions = [
    { value: 'default',    label: 'Featured' },
    { value: 'price-asc',  label: 'Price ↑' },
    { value: 'price-desc', label: 'Price ↓' },
    { value: 'name-asc',   label: 'A → Z' },
    { value: 'name-desc',  label: 'Z → A' },
  ];

  const handleProductClick = async (p) => {
    try {
      if (user?.id) {
        await api.post("track/click", null, {
          params: { userId: user.id, productId: p.id }
        });
      }
    } catch (err) {
      console.error("Click tracking failed", err);
    }
    navigate(`/product/${p.id}`);
  };

  if (loading) return (
    <div style={{ background: "#f9fafb", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <svg style={{ width: 32, height: 32, animation: "spin 0.8s linear infinite" }} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="#1e3a8a" strokeWidth="4" strokeOpacity="0.25" />
          <path d="M4 12a8 8 0 018-8v8H4z" fill="#1e3a8a" stroke="none" />
        </svg>
        <p style={{ color: "#6b7280", fontSize: 13 }}>Loading products...</p>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ background: "#f9fafb", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #f0f0f0", padding: "48px 32px", textAlign: "center", maxWidth: 500 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔌</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111827", marginBottom: 8 }}>API Unreachable</h2>
        <p style={{ color: "#6b7280", fontSize: 13, marginBottom: 24 }}>{error}</p>
        <button 
          onClick={fetchProducts} 
          style={{ background: "#1e3a8a", color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", fontWeight: 600, cursor: "pointer", fontSize: 13 }}
          onMouseOver={(e) => e.currentTarget.style.background = "#1e40af"}
          onMouseOut={(e) => e.currentTarget.style.background = "#1e3a8a"}
        >
          Retry
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ background: "#f9fafb", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 20px" }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Leaf size={14} style={{ color: "#1e3a8a" }} />
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "#6b7280" }}>
              Fresh Every Day
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: "#111827", margin: 0 }}>
              Our Products
            </h1>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 20, padding: "4px 14px" }}>
              {filtered.length} {filtered.length === 1 ? "item" : "items"}
            </span>
          </div>
        </div>

        {/* Filter Bar */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 32,
          padding: "12px 16px",
          background: "#fff",
          borderRadius: 12,
          border: "1px solid #f0f0f0",
        }}>
          {/* Category chips */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", flex: 1 }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: "5px 14px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  border: "none",
                  transition: "all 0.2s",
                  background: selectedCategory === cat ? "#1e3a8a" : "#f3f4f6",
                  color: selectedCategory === cat ? "#fff" : "#6b7280",
                }}
                onMouseOver={(e) => {
                  if (selectedCategory !== cat) {
                    e.currentTarget.style.background = "#e5e7eb";
                  }
                }}
                onMouseOut={(e) => {
                  if (selectedCategory !== cat) {
                    e.currentTarget.style.background = "#f3f4f6";
                  }
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort dropdown */}
          <div id="sort-dropdown" style={{ position: "relative", flexShrink: 0 }}>
            <button
              onClick={() => setSortOpen(o => !o)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "5px 14px",
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 600,
                background: sortBy !== "default" ? "#eff6ff" : "#f3f4f6",
                color: sortBy !== "default" ? "#1e3a8a" : "#6b7280",
                border: sortBy !== "default" ? "1px solid #bfdbfe" : "1px solid transparent",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {sortOptions.find(s => s.value === sortBy)?.label}
              <ChevronDown size={12} style={{ transition: "transform 0.2s", transform: sortOpen ? "rotate(180deg)" : "none" }} />
            </button>
            {sortOpen && (
              <div style={{
                position: "absolute",
                top: "calc(100% + 6px)",
                right: 0,
                zIndex: 50,
                background: "#fff",
                border: "1px solid #f0f0f0",
                borderRadius: 10,
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                overflow: "hidden",
                minWidth: 140,
              }}>
                {sortOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => { setSortBy(opt.value); setSortOpen(false); }}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "8px 14px",
                      textAlign: "left",
                      fontSize: 12,
                      fontWeight: sortBy === opt.value ? 700 : 500,
                      color: sortBy === opt.value ? "#1e3a8a" : "#374151",
                      background: sortBy === opt.value ? "#eff6ff" : "transparent",
                      border: "none",
                      cursor: "pointer",
                      transition: "background 0.15s",
                    }}
                    onMouseOver={e => { if (sortBy !== opt.value) e.currentTarget.style.background = "#f9fafb"; }}
                    onMouseOut={e => { if (sortBy !== opt.value) e.currentTarget.style.background = "transparent"; }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Grid - Increased row gap */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", background: "#fff", borderRadius: 12, border: "1px solid #f0f0f0" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🌿</div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 8 }}>No products found</h3>
            <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 20 }}>Try changing the category or clear the filter</p>
            <button
              onClick={() => setSelectedCategory("All")}
              style={{ background: "#1e3a8a", color: "#fff", border: "none", borderRadius: 8, padding: "8px 20px", fontWeight: 600, cursor: "pointer", fontSize: 12 }}
              onMouseOver={(e) => e.currentTarget.style.background = "#1e40af"}
              onMouseOut={(e) => e.currentTarget.style.background = "#1e3a8a"}
            >
              Clear Filter
            </button>
          </div>
        ) : (
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", 
            gap: "80px 24px",  // row gap 32px, column gap 24px
          }}>
            {filtered.map((p) => (
              <div key={p.id} onClick={() => handleProductClick(p)} style={{ cursor: "pointer" }}>
                <ProductCard p={p} />
              </div>
            ))}
          </div>
        )}
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