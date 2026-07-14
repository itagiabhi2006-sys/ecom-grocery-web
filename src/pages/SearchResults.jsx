import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  SlidersHorizontal, X, ChevronDown, ChevronUp,
  Search, Sparkles, ArrowUpDown
} from "lucide-react";
import api from "../Api";
import ProductCard from "../components/ProductCard";

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ minPrice: "", maxPrice: "", sort: "" });
  const [open, setOpen] = useState({ price: true, sort: true });
  const toggle = (key) => setOpen(o => ({ ...o, [key]: !o[key] }));

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    fetchProducts(); }, [query, filters.minPrice, filters.maxPrice, filters.sort]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/products/search", {
        params: {
          q: query,
          minPrice: filters.minPrice || undefined,
          maxPrice: filters.maxPrice || undefined,
          sort: filters.sort || undefined,
        },
      });
      setProducts(res.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const clearFilters = () => setFilters({ minPrice: "", maxPrice: "", sort: "" });
  const hasActive = filters.minPrice || filters.maxPrice || filters.sort;

  const sortOptions = [
    { value: "", label: "Featured" },
    { value: "price_asc", label: "Price: Low to High" },
    { value: "price_desc", label: "Price: High to Low" },
    { value: "newest", label: "Newest First" },
  ];

  const priceRanges = [
    { min: "0", max: "50", label: "Under ₹50" },
    { min: "50", max: "100", label: "₹50 - ₹100" },
    { min: "100", max: "500", label: "₹100 - ₹500" },
    { min: "500", max: "", label: "Above ₹500" },
  ];

  return (
    <div style={{ background: "#f9fafb", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "24px 20px" }}>
        
        <div style={{ display: "flex", gap: 28, alignItems: "flex-start" }}>
          
          {/* Sidebar - Sticky */}
          <div style={{ 
            width: 280, 
            flexShrink: 0, 
            position: "sticky", 
            top: 80,
            alignSelf: "start"
          }}>
            <div style={{
              background: "#fff",
              borderRadius: 12,
              border: "1px solid #e5e7eb",
              overflow: "hidden",
            }}>
              
              {/* Header */}
              <div style={{
                padding: "14px 16px",
                borderBottom: "1px solid #f0f0f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}>
                <span style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: "#1e3a8a",
                }}>
                  <SlidersHorizontal size={12} /> Filters
                </span>
                {hasActive && (
                  <button
                    onClick={clearFilters}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      background: "#fef2f2",
                      border: "1px solid #fee2e2",
                      borderRadius: 16,
                      padding: "3px 10px",
                      fontSize: 10,
                      fontWeight: 600,
                      color: "#dc2626",
                      cursor: "pointer",
                    }}
                  >
                    <X size={8} /> Clear
                  </button>
                )}
              </div>

              {/* Price Section */}
              <div>
                <button
                  onClick={() => toggle('price')}
                  style={{
                    width: "100%",
                    padding: "10px 16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "none",
                    border: "none",
                    borderBottom: "1px solid #f0f0f0",
                    cursor: "pointer",
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    color: "#374151",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Sparkles size={10} /> Price Range
                  </span>
                  {open.price ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>
                {open.price && (
                  <div style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.minPrice}
                        onChange={e => setFilters(f => ({ ...f, minPrice: e.target.value }))}
                        style={{
                          width: "50%",
                          padding: "8px 10px",
                          border: "1px solid #e5e7eb",
                          borderRadius: 8,
                          fontSize: 12,
                          outline: "none",
                        }}
                        onFocus={(e) => e.target.style.borderColor = "#1e3a8a"}
                        onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.maxPrice}
                        onChange={e => setFilters(f => ({ ...f, maxPrice: e.target.value }))}
                        style={{
                          width: "50%",
                          padding: "8px 10px",
                          border: "1px solid #e5e7eb",
                          borderRadius: 8,
                          fontSize: 12,
                          outline: "none",
                        }}
                        onFocus={(e) => e.target.style.borderColor = "#1e3a8a"}
                        onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                      />
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {priceRanges.map(({ min, max, label }) => {
                        const isActive = filters.minPrice === min && filters.maxPrice === max;
                        return (
                          <button
                            key={label}
                            onClick={() => setFilters(f => ({
                              ...f,
                              minPrice: isActive ? "" : min,
                              maxPrice: isActive ? "" : max,
                            }))}
                            style={{
                              padding: "4px 10px",
                              borderRadius: 16,
                              fontSize: 10,
                              fontWeight: 600,
                              border: "1px solid",
                              cursor: "pointer",
                              background: isActive ? "#1e3a8a" : "transparent",
                              borderColor: isActive ? "#1e3a8a" : "#e5e7eb",
                              color: isActive ? "#fff" : "#6b7280",
                            }}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Sort Section */}
              <div>
                <button
                  onClick={() => toggle('sort')}
                  style={{
                    width: "100%",
                    padding: "10px 16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    color: "#374151",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <ArrowUpDown size={10} /> Sort By
                  </span>
                  {open.sort ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>
                {open.sort && (
                  <div style={{ padding: "8px 12px 12px" }}>
                    {sortOptions.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setFilters(f => ({ ...f, sort: opt.value }))}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          width: "100%",
                          padding: "8px 10px",
                          borderRadius: 8,
                          textAlign: "left",
                          fontSize: 12,
                          fontWeight: filters.sort === opt.value ? 600 : 500,
                          color: filters.sort === opt.value ? "#1e3a8a" : "#4b5563",
                          background: filters.sort === opt.value ? "#eff6ff" : "transparent",
                          border: "none",
                          cursor: "pointer",
                          marginBottom: 2,
                        }}
                      >
                        <span
                          style={{
                            width: 14,
                            height: 14,
                            borderRadius: "50%",
                            border: `2px solid ${filters.sort === opt.value ? "#1e3a8a" : "#d1d5db"}`,
                            background: filters.sort === opt.value ? "radial-gradient(circle at center, #1e3a8a 40%, transparent 40%)" : "transparent",
                          }}
                        />
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            
            {/* Result Count - Compact */}
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              marginBottom: 16,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 500 }}>
                  {loading ? "Searching..." : `${products.length} product${products.length !== 1 ? 's' : ''}`}
                </span>
                {query && !loading && products.length > 0 && (
                  <span style={{ fontSize: 11, color: "#9ca3af" }}>
                    for "<strong style={{ color: "#1e3a8a" }}>{query}</strong>"
                  </span>
                )}
              </div>
            </div>

            {/* Active Filters */}
            {hasActive && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
                {filters.minPrice && (
                  <span style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    background: "#eff6ff",
                    color: "#1e3a8a",
                    border: "1px solid #bfdbfe",
                    borderRadius: 20,
                    padding: "4px 10px 4px 12px",
                    fontSize: 11,
                    fontWeight: 600,
                  }}>
                    Min ₹{filters.minPrice}
                    <button onClick={() => setFilters(f => ({ ...f, minPrice: "" }))} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}>
                      <X size={10} color="#1e3a8a" />
                    </button>
                  </span>
                )}
                {filters.maxPrice && (
                  <span style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    background: "#eff6ff",
                    color: "#1e3a8a",
                    border: "1px solid #bfdbfe",
                    borderRadius: 20,
                    padding: "4px 10px 4px 12px",
                    fontSize: 11,
                    fontWeight: 600,
                  }}>
                    Max ₹{filters.maxPrice}
                    <button onClick={() => setFilters(f => ({ ...f, maxPrice: "" }))} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}>
                      <X size={10} color="#1e3a8a" />
                    </button>
                  </span>
                )}
                {filters.sort && (
                  <span style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    background: "#eff6ff",
                    color: "#1e3a8a",
                    border: "1px solid #bfdbfe",
                    borderRadius: 20,
                    padding: "4px 10px 4px 12px",
                    fontSize: 11,
                    fontWeight: 600,
                  }}>
                    {sortOptions.find(s => s.value === filters.sort)?.label}
                    <button onClick={() => setFilters(f => ({ ...f, sort: "" }))} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}>
                      <X size={10} color="#1e3a8a" />
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 20px" }}>
                <svg style={{ width: 32, height: 32, animation: "spin 0.8s linear infinite" }} viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="#1e3a8a" strokeWidth="4" strokeOpacity="0.25" />
                  <path d="M4 12a8 8 0 018-8v8H4z" fill="#1e3a8a" stroke="none" />
                </svg>
                <p style={{ color: "#6b7280", fontSize: 13, marginTop: 12 }}>Loading products...</p>
              </div>
            )}

            {/* Empty State */}
            {!loading && products.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px 20px", background: "#fff", borderRadius: 12, border: "1px solid #f0f0f0" }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <Search size={26} color="#1e3a8a" />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#111827", marginBottom: 8 }}>No products found</h3>
                <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 20 }}>Try different keywords or adjust your filters</p>
                {hasActive && (
                  <button
                    onClick={clearFilters}
                    style={{ background: "#1e3a8a", color: "#fff", border: "none", borderRadius: 8, padding: "8px 20px", fontWeight: 600, fontSize: 12, cursor: "pointer" }}
                    onMouseOver={(e) => e.currentTarget.style.background = "#1e40af"}
                    onMouseOut={(e) => e.currentTarget.style.background = "#1e3a8a"}
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}

            {/* Product Grid */}
            {!loading && products.length > 0 && (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: "32px 20px",
              }}>
                {products.map((product, i) => (
                  <div key={product.id} style={{ animation: "fadeUp 0.4s ease both", animationDelay: `${Math.min(i * 60, 400)}ms` }}>
                    <ProductCard p={product} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}