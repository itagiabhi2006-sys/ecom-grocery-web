// // Navbar.js - Complete updated version with proper API refresh
// import React, { useState, useRef, useEffect } from "react";
// import { Link, useNavigate, useLocation } from "react-router-dom";
// import { useAuth } from "../contexts/AuthContext";
// import {
//   User, ChevronDown, Search, ShoppingCart, Heart,
//   Package, LogOut, LayoutGrid, ShoppingBag, Phone, Tag,
// } from "lucide-react";
// import api from "../Api";

// export default function Navbar() {
//   const { user: ctxUser } = useAuth();
//   const navigate = useNavigate();
//   const location = useLocation();

//   const [effectiveUser, setEffectiveUser] = useState(() => {
//     try { return JSON.parse(localStorage.getItem("user")) || ctxUser || null; }
//     catch { return ctxUser || null; }
//   });

//   const [categories, setCategories]               = useState([]);
//   const [categoriesLoading, setCategoriesLoading] = useState(true);
//   const [categoryOpen, setCategoryOpen]           = useState(false);
//   const [menuOpen, setMenuOpen]                   = useState(false);
//   const [searchTerm, setSearchTerm]               = useState("");
//   const [searchResults, setSearchResults]         = useState([]);
//   const [loading, setLoading]                     = useState(false);
//   const [searchActive, setSearchActive]           = useState(false);
//   const [selectedIndex, setSelectedIndex]         = useState(-1);
//   const [cartCount, setCartCount]                 = useState(0);
//   const [wishCount, setWishCount]                 = useState(0);

//   const categoryRef   = useRef(null);
//   const userMenuRef   = useRef(null);
//   const searchRef     = useRef(null);
//   const searchTimeout = useRef(null);

//   /* ── fetch categories ── */
//   useEffect(() => {
//     api.get("/categories")
//       .then(r => setCategories(r.data || []))
//       .catch(() => setCategories([]))
//       .finally(() => setCategoriesLoading(false));
//   }, []);

//   /* ── fetch cart & wishlist counts with user ID ── */
//   const fetchCounts = async () => {
//     const userId = effectiveUser?.id || effectiveUser?.userId;
    
//     if (!userId) {
//       setCartCount(0);
//       setWishCount(0);
//       return;
//     }

//     try {
      
//       const [cartRes, wishRes] = await Promise.all([
//         api.get(`/total-cart-item/${userId}`),
//         api.get(`/total-wishlist-item/${userId}`)
//       ]);
//       setCartCount(cartRes.data || 0);
//       setWishCount(wishRes.data || 0);
      
//     } catch (error) {
//       console.error("Error fetching counts:", error);
//       setCartCount(0);
//       setWishCount(0);
//     }
//   };

//   // Fetch counts when effective user changes
//   useEffect(() => {
//     if (effectiveUser) {
//       fetchCounts();
//     }
//   }, [effectiveUser]);

//   // Set up real-time updates via event listeners and custom events
//   useEffect(() => {
//     // Function to handle cart updates from any component
//     const handleCartUpdate = (event) => {
    
//       if (event.detail?.count !== undefined) {
//         setCartCount(event.detail.count);
//       } else {
//         fetchCounts(); // Fallback to refetch
//       }
//     };

//     // Function to handle wishlist updates from any component
//     const handleWishlistUpdate = (event) => {
    
//       if (event.detail?.count !== undefined) {
//         setWishCount(event.detail.count);
//       } else {
//         fetchCounts(); // Fallback to refetch
//       }
//     };

//     // Listen for storage events (for cross-tab updates)
//     const handleStorageChange = (e) => {
//       if (e.key === "cartUpdate" || e.key === "wishlistUpdate") {
       
//         fetchCounts();
//       }
//     };

//     // Add event listeners
//     window.addEventListener('cart-updated', handleCartUpdate);
//     window.addEventListener('wishlist-updated', handleWishlistUpdate);
//     window.addEventListener('storage', handleStorageChange);

//     // Also listen for custom events from the cart and wishlist components
//     window.addEventListener('cartCountChanged', handleCartUpdate);
//     window.addEventListener('wishlistCountChanged', handleWishlistUpdate);

//     return () => {
//       window.removeEventListener('cart-updated', handleCartUpdate);
//       window.removeEventListener('wishlist-updated', handleWishlistUpdate);
//       window.removeEventListener('storage', handleStorageChange);
//       window.removeEventListener('cartCountChanged', handleCartUpdate);
//       window.removeEventListener('wishlistCountChanged', handleWishlistUpdate);
//     };
//   }, [effectiveUser]);

//   // Expose refresh function to window for manual triggers
//   useEffect(() => {
//     window.refreshNavbarCounts = fetchCounts;
//     return () => {
//       delete window.refreshNavbarCounts;
//     };
//   }, [effectiveUser]);

//   // Periodically check for updates (every 5 seconds) - optional
//   useEffect(() => {
//     if (!effectiveUser) return;
    
//     const interval = setInterval(() => {
//       fetchCounts();
//     }, 5000); // Check every 5 seconds
    
//     return () => clearInterval(interval);
//   }, [effectiveUser]);

//   /* ── sync user from context ── */
//   useEffect(() => {
//     if (ctxUser) setEffectiveUser(ctxUser);
//     else {
//       try { setEffectiveUser(JSON.parse(localStorage.getItem("user")) || null); }
//       catch { setEffectiveUser(null); }
//     }
//   }, [ctxUser]);

//   /* ── sync user from storage events (other tabs) ── */
//   useEffect(() => {
//     const onStorage = e => {
//       if (e.key === "user") {
//         try { setEffectiveUser(JSON.parse(e.newValue) || null); }
//         catch { setEffectiveUser(null); }
//       }
//     };
//     window.addEventListener("storage", onStorage);
//     return () => window.removeEventListener("storage", onStorage);
//   }, []);

//   /* ── close dropdowns on outside click ── */
//   useEffect(() => {
//     const handler = e => {
//       if (categoryRef.current && !categoryRef.current.contains(e.target)) setCategoryOpen(false);
//       if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setMenuOpen(false);
//       if (searchRef.current && !searchRef.current.contains(e.target))
//         setTimeout(() => { setSearchActive(false); setSelectedIndex(-1); }, 150);
//     };
//     document.addEventListener("mousedown", handler);
//     return () => document.removeEventListener("mousedown", handler);
//   }, []);

//   /* ── live search ── */
//   useEffect(() => {
//     if (!searchTerm.trim()) { setSearchResults([]); setSearchActive(false); setSelectedIndex(-1); return; }
//     clearTimeout(searchTimeout.current);
//     searchTimeout.current = setTimeout(async () => {
//       try {
//         setLoading(true);
//         const res = await api.get(`/products/search?q=${encodeURIComponent(searchTerm)}`);
//         setSearchResults(res.data || []);
//         setSearchActive(true);
//         setSelectedIndex(-1);
//       } catch { } finally { setLoading(false); }
//     }, 400);
//     return () => clearTimeout(searchTimeout.current);
//   }, [searchTerm]);

//   /* ── keyboard nav in search ── */
//   useEffect(() => {
//     const handleKeyDown = e => {
//       if (!searchActive || !searchResults.length) return;
//       if (e.key === "ArrowDown")  { e.preventDefault(); setSelectedIndex(p => Math.min(p + 1, searchResults.length - 1)); }
//       else if (e.key === "ArrowUp")   { e.preventDefault(); setSelectedIndex(p => Math.max(p - 1, -1)); }
//       else if (e.key === "Enter")     { e.preventDefault(); selectedIndex >= 0 ? handleProductClick(searchResults[selectedIndex]) : handleSearch(e); }
//       else if (e.key === "Escape")    { setSearchActive(false); setSelectedIndex(-1); }
//     };
//     if (searchActive) {
//       document.addEventListener("keydown", handleKeyDown);
//       return () => document.removeEventListener("keydown", handleKeyDown);
//     }
//   }, [searchActive, searchResults, selectedIndex]);

//   const handleSearch = e => {
//     e.preventDefault();
//     if (!searchTerm.trim()) return;
//     navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
//     setSearchTerm(""); setSearchResults([]); setSearchActive(false); setSelectedIndex(-1);
//   };

//   const handleProductClick = product => {
//     navigate(`/product/${product.id}`);
//     setSearchTerm(""); setSearchResults([]); setSearchActive(false); setSelectedIndex(-1);
//   };

//   const getDisplayName = u => {
//     if (!u) return "";
//     return u.name || u.firstName || `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.email || "User";
//   };

//   const isAdminUser  = effectiveUser?.roles === "ADMIN";
//   const isAdminRoute = location.pathname.startsWith("/auth/admin") || location.pathname.startsWith("/admin");
//   const isAdmin      = isAdminUser || isAdminRoute;

//   // Check if current route is home page
//   const isHomePage = location.pathname === "/";

//   /* ════════════════════════════════════════
//      ADMIN NAVBAR
//   ════════════════════════════════════════ */
//   if (isAdmin) {
//     return (
//       <nav style={{
//         background: '#1a1a6e',
//         borderBottom: '1px solid rgba(255,255,255,0.10)',
//         position: 'sticky', top: 0, zIndex: 50,
//       }}>
//         <div style={{
//           maxWidth: 1400, margin: '0 auto', padding: '0 32px',
//           display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 58,
//         }}>
//           <AdminLogo />
//           {effectiveUser ? (
//             <div style={{ position: 'relative' }} ref={categoryRef}>
//               <button
//                 onClick={() => setCategoryOpen(s => !s)}
//                 style={{
//                   display: 'flex', alignItems: 'center', gap: 8,
//                   background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.20)',
//                   borderRadius: 10, padding: '7px 15px',
//                   color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600,
//                 }}>
//                 <User size={15} color="#a5b4fc" />
//                 {getDisplayName(effectiveUser)}
//                 <ChevronDown size={13} color="rgba(255,255,255,0.5)" />
//               </button>
//               {categoryOpen && (
//                 <div style={{
//                   position: 'absolute', right: 0, top: '110%',
//                   background: '#1a1a6e', border: '1px solid rgba(255,255,255,0.15)',
//                   borderRadius: 12, minWidth: 175, overflow: 'hidden',
//                   zIndex: 99, boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
//                 }}>
//                   <button
//                     onClick={() => { setCategoryOpen(false); navigate("/profile-view"); }}
//                     style={adminDropItem}
//                     onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.10)'}
//                     onMouseOut={e => e.currentTarget.style.background = 'transparent'}
//                   >View Profile</button>
//                   <div style={{ height: 1, background: 'rgba(255,255,255,0.08)' }} />
//                   <button
//                     onClick={() => { setCategoryOpen(false); navigate("/logout"); }}
//                     style={{ ...adminDropItem, color: '#fca5a5' }}
//                     onMouseOver={e => e.currentTarget.style.background = 'rgba(239,68,68,0.12)'}
//                     onMouseOut={e => e.currentTarget.style.background = 'transparent'}
//                   >Logout</button>
//                 </div>
//               )}
//             </div>
//           ) : (
//             <Link to="/auth/admin" style={{
//               background: '#4f46e5', color: '#fff',
//               padding: '8px 18px', borderRadius: 10,
//               fontWeight: 700, fontSize: 13, textDecoration: 'none',
//             }}>Admin Login</Link>
//           )}
//         </div>
//       </nav>
//     );
//   }

//   /* ════════════════════════════════════════
//      USER NAVBAR
//   ════════════════════════════════════════ */
//   return (
//     <>
//       {/* ── Top announcement bar (only on home page) ── */}
//       {isHomePage && (
//         <div style={{
//           background: 'linear-gradient(90deg, #1a1a6e 0%, #2d2d8e 50%, #1a1a6e 100%)',
//           color: '#fff',
//           textAlign: 'center',
//           fontSize: 12,
//           fontWeight: 600,
//           padding: '7px 16px',
//           letterSpacing: 0.3,
//         }}>
//           🚚 Free Delivery & 40% Discount For Next 3 Orders! Place Your 1st Order Now
//         </div>
//       )}

//       {/* ── Main Navbar (always visible) ── */}
//       <nav style={{
//         background: '#fff',
//         borderBottom: '1px solid #e5e7eb',
//         position: 'sticky',
//         top: 0,
//         zIndex: 50,
//         boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
//       }}>
//         <div style={{
//           maxWidth: 1280, margin: '0 auto', padding: '0 24px',
//           display: 'flex', alignItems: 'center', gap: 16, height: 64,
//         }}>

//           {/* ── Minimalist Modern Logo ── */}
// <Link 
//   to="/" 
//   className="flex items-center gap-3 no-underline flex-shrink-0 group"
// >
//   {/* Simple but Elegant Icon */}
//   <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-md group-hover:shadow-xl transition-all duration-300">
//     <ShoppingBag size={18} color="#fff" strokeWidth={2} />
//   </div>
  
//   {/* Bold Modern Text */}
//   <div className="flex items-baseline gap-0.5">
//     <span className="text-xl font-black text-slate-800 group-hover:text-indigo-600 transition-colors duration-300">
//       Kirana
//     </span>
//     <span className="text-xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
//       Kart
//     </span>
//   </div>
// </Link>

//           {/* ── Category Dropdown ── */}
//           <div style={{ position: 'relative', flexShrink: 0 }} ref={categoryRef}>
//             <button
//               onClick={() => setCategoryOpen(s => !s)}
//               style={{
//                 display: 'flex', alignItems: 'center', gap: 6,
//                 background: categoryOpen ? '#1a1a6e' : '#f3f4f6',
//                 border: `1.5px solid ${categoryOpen ? '#1a1a6e' : '#e5e7eb'}`,
//                 borderRadius: 8, padding: '8px 14px', cursor: 'pointer',
//                 fontSize: 13, fontWeight: 600,
//                 color: categoryOpen ? '#fff' : '#374151',
//                 transition: 'all 0.2s', whiteSpace: 'nowrap',
//               }}
//               onMouseOver={e => {
//                 if (!categoryOpen) {
//                   e.currentTarget.style.background = '#ede9fe';
//                   e.currentTarget.style.borderColor = '#4f46e5';
//                   e.currentTarget.style.color = '#4f46e5';
//                 }
//               }}
//               onMouseOut={e => {
//                 if (!categoryOpen) {
//                   e.currentTarget.style.background = '#f3f4f6';
//                   e.currentTarget.style.borderColor = '#e5e7eb';
//                   e.currentTarget.style.color = '#374151';
//                 }
//               }}
//             >
//               <LayoutGrid size={14} color={categoryOpen ? '#fff' : '#6b7280'} />
//               All Categories
//               <ChevronDown
//                 size={12} color={categoryOpen ? '#fff' : '#9ca3af'}
//                 style={{ transition: 'transform 0.2s', transform: categoryOpen ? 'rotate(180deg)' : 'none' }}
//               />
//             </button>

//             {categoryOpen && (
//               <div style={{
//                 position: 'absolute', top: 'calc(100% + 6px)', left: 0,
//                 background: '#fff', border: '1px solid #e5e7eb',
//                 borderRadius: 14, boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
//                 zIndex: 99, width: 260, maxHeight: 360, overflowY: 'auto', padding: '6px 0',
//               }}>
//                 {categoriesLoading
//                   ? <div style={{ padding: 18, textAlign: 'center' }}><Spinner /></div>
//                   : categories.map(cat => (
//                     <button
//                       key={cat.id}
//                       onClick={() => { setCategoryOpen(false); navigate(`/category/${cat.id}`); }}
//                       style={{
//                         display: 'flex', alignItems: 'center', gap: 11,
//                         width: '100%', padding: '9px 14px',
//                         background: 'transparent', border: 'none',
//                         cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s',
//                       }}
//                       onMouseOver={e => e.currentTarget.style.background = '#f5f3ff'}
//                       onMouseOut={e => e.currentTarget.style.background = 'transparent'}
//                     >
//                       <img
//                         src={cat.imageURL} alt={cat.name}
//                         style={{ width: 32, height: 32, objectFit: 'contain', borderRadius: 7, background: '#f9fafb' }}
//                       />
//                       <div>
//                         <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{cat.name}</div>
//                         <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>
//                           {cat.productCount ?? cat.products?.length ?? 0} products
//                         </div>
//                       </div>
//                     </button>
//                   ))
//                 }
//               </div>
//             )}
//           </div>

//           {/* ── Search Bar ── */}
//           <div style={{ flex: 1, position: 'relative', minWidth: 0 }} ref={searchRef}>
//             <form
//               onSubmit={handleSearch}
//               style={{
//                 display: 'flex', alignItems: 'center',
//                 border: '1.5px solid #e5e7eb',
//                 borderRadius: 10, overflow: 'hidden',
//                 transition: 'border-color 0.2s, box-shadow 0.2s',
//                 background: '#f9fafb',
//               }}
//               onFocus={e => {
//                 e.currentTarget.style.borderColor = '#4f46e5';
//                 e.currentTarget.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.10)';
//                 e.currentTarget.style.background = '#fff';
//               }}
//               onBlur={e => {
//                 e.currentTarget.style.borderColor = '#e5e7eb';
//                 e.currentTarget.style.boxShadow = 'none';
//                 e.currentTarget.style.background = '#f9fafb';
//               }}
//             >
//               <Search size={15} color="#9ca3af" style={{ marginLeft: 13, flexShrink: 0 }} />
//               <input
//                 type="text"
//                 placeholder="Type Your Products..."
//                 value={searchTerm}
//                 onChange={e => setSearchTerm(e.target.value)}
//                 onFocus={() => { if (searchTerm.trim() && searchResults.length) setSearchActive(true); }}
//                 style={{
//                   flex: 1, border: 'none', outline: 'none',
//                   padding: '10px 10px', fontSize: 13,
//                   background: 'transparent', color: '#111827', fontWeight: 500,
//                 }}
//               />
//               <button
//                 type="submit"
//                 style={{
//                   background: '#1a1a6e', color: '#fff', border: 'none',
//                   padding: '10px 22px', fontWeight: 700, fontSize: 13, cursor: 'pointer',
//                   transition: 'background 0.2s', whiteSpace: 'nowrap', height: '100%',
//                 }}
//                 onMouseOver={e => e.currentTarget.style.background = '#2d2d8e'}
//                 onMouseOut={e => e.currentTarget.style.background = '#1a1a6e'}
//               >
//                 <Search size={15} />
//               </button>
//             </form>

//             {/* Search Dropdown */}
//             {searchActive && searchTerm.trim() && (
//               <div
//                 onMouseDown={e => e.stopPropagation()}
//                 style={{
//                   position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
//                   background: '#fff', border: '1px solid #e5e7eb',
//                   borderRadius: 12, boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
//                   zIndex: 99, overflow: 'hidden',
//                 }}>
//                 <div style={{ padding: '8px 14px', borderBottom: '1px solid #f3f4f6', background: '#f9fafb' }}>
//                   <span style={{ fontSize: 11, fontWeight: 700, color: '#4f46e5' }}>
//                     Results for "{searchTerm}"
//                   </span>
//                 </div>
//                 {loading
//                   ? <div style={{ padding: 18, textAlign: 'center' }}><Spinner /></div>
//                   : searchResults.length > 0
//                     ? searchResults.slice(0, 7).map((item, idx) => (
//                       <div
//                         key={item.id}
//                         onMouseDown={e => { e.preventDefault(); handleProductClick(item); }}
//                         onMouseEnter={() => setSelectedIndex(idx)}
//                         style={{
//                           display: 'flex', alignItems: 'center', gap: 11,
//                           padding: '10px 14px', cursor: 'pointer',
//                           background: selectedIndex === idx ? '#f5f3ff' : 'transparent',
//                           borderBottom: '1px solid #f9fafb',
//                           transition: 'background 0.15s',
//                         }}>
//                         <div style={{
//                           width: 34, height: 34, background: '#f3f4f6', borderRadius: 8,
//                           display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
//                         }}>
//                           <Search size={13} color="#9ca3af" />
//                         </div>
//                         <div style={{ flex: 1, minWidth: 0 }}>
//                           <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</div>
//                           <div style={{ fontSize: 11, color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.description}</div>
//                         </div>
//                         <span style={{ fontSize: 13, fontWeight: 800, color: '#16a34a', flexShrink: 0 }}>₹{item.price}</span>
//                       </div>
//                     ))
//                     : <div style={{ padding: '18px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>No products found</div>
//                 }
//               </div>
//             )}
//           </div>

//           {/* ── Right Side Icons ── */}
//           <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>

//             {/* Weekly Discount Badge */}
//             <Link to="/offers" style={{
//               display: 'flex', alignItems: 'center', gap: 6,
//               background: '#fef3c7', border: '1px solid #fcd34d',
//               borderRadius: 8, padding: '6px 12px', textDecoration: 'none',
//               fontSize: 12, fontWeight: 700, color: '#92400e',
//               whiteSpace: 'nowrap', flexShrink: 0,
//             }}>
//               <Tag size={13} color="#f59e0b" />
//               Weekly Discount!
//             </Link>

//             {/* Phone */}
//             <a href="tel:+9988256688" style={{
//               display: 'flex', alignItems: 'center', gap: 7,
//               background: '#1a1a6e', color: '#fff',
//               borderRadius: 8, padding: '6px 13px', textDecoration: 'none',
//               fontSize: 12, fontWeight: 700, flexShrink: 0,
//             }}>
//               <Phone size={13} />
//               +9988-256-688
//             </a>

//             {/* Wishlist */}
//             <Link to="/wishlist" style={iconBtn}
//               onMouseOver={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.borderColor = '#fca5a5'; }}
//               onMouseOut={e => { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.borderColor = '#e5e7eb'; }}>
//               <Heart size={17} color="#6b7280" strokeWidth={1.8} />
//               {wishCount > 0 && <NavBadge count={wishCount} color="#ef4444" />}
//             </Link>

//             {/* Cart */}
//             <Link to="/cart" style={iconBtn}
//               onMouseOver={e => { e.currentTarget.style.background = '#ede9fe'; e.currentTarget.style.borderColor = '#a5b4fc'; }}
//               onMouseOut={e => { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.borderColor = '#e5e7eb'; }}>
//               <ShoppingCart size={17} color="#6b7280" strokeWidth={1.8} />
//               {cartCount > 0 && <NavBadge count={cartCount} color="#4f46e5" />}
//             </Link>

//             {/* User menu */}
//             {effectiveUser ? (
//               <div style={{ position: 'relative' }} ref={userMenuRef}>
//                 <button
//                   onClick={() => setMenuOpen(s => !s)}
//                   style={{
//                     display: 'flex', alignItems: 'center', gap: 7,
//                     background: menuOpen ? '#1a1a6e' : '#f9fafb',
//                     border: `1.5px solid ${menuOpen ? '#1a1a6e' : '#e5e7eb'}`,
//                     borderRadius: 10, padding: '6px 12px', cursor: 'pointer',
//                     fontSize: 13, fontWeight: 600, color: menuOpen ? '#fff' : '#374151',
//                     transition: 'all 0.2s',
//                   }}
//                   onMouseOver={e => {
//                     if (!menuOpen) {
//                       e.currentTarget.style.background = '#ede9fe';
//                       e.currentTarget.style.borderColor = '#4f46e5';
//                       e.currentTarget.style.color = '#4f46e5';
//                     }
//                   }}
//                   onMouseOut={e => {
//                     if (!menuOpen) {
//                       e.currentTarget.style.background = '#f9fafb';
//                       e.currentTarget.style.borderColor = '#e5e7eb';
//                       e.currentTarget.style.color = '#374151';
//                     }
//                   }}
//                 >
//                   <div style={{
//                     width: 24, height: 24, borderRadius: '50%',
//                     background: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
//                     display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
//                   }}>
//                     <User size={12} color="#fff" strokeWidth={2.5} />
//                   </div>
//                   <span style={{ maxWidth: 70, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
//                     {getDisplayName(effectiveUser).split(' ')[0]}
//                   </span>
//                   <ChevronDown size={12} color={menuOpen ? '#fff' : '#9ca3af'}
//                     style={{ transition: 'transform 0.2s', transform: menuOpen ? 'rotate(180deg)' : 'none' }} />
//                 </button>

//                 {menuOpen && (
//                   <div style={{
//                     position: 'absolute', right: 0, top: 'calc(100% + 8px)',
//                     background: '#fff', border: '1px solid #e5e7eb',
//                     borderRadius: 14, boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
//                     zIndex: 99, minWidth: 210, overflow: 'hidden',
//                   }}>
//                     {/* User header */}
//                     <div style={{ padding: '13px 15px', background: '#f5f3ff', borderBottom: '1px solid #ede9fe' }}>
//                       <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
//                         <div style={{
//                           width: 36, height: 36, borderRadius: '50%',
//                           background: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
//                           display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
//                         }}>
//                           <User size={16} color="#fff" />
//                         </div>
//                         <div>
//                           <div style={{ fontWeight: 800, fontSize: 13, color: '#111827' }}>{getDisplayName(effectiveUser)}</div>
//                           <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>{effectiveUser.email}</div>
//                         </div>
//                       </div>
//                     </div>

//                     {[
//                       { icon: <User size={13} />,    label: 'View Profile', path: '/profile-view' },
//                       { icon: <Package size={13} />, label: 'My Orders',    path: '/my-order' },
//                       { icon: <Heart size={13} />,   label: 'Wishlist',     path: '/wishlist' },
//                     ].map((item, i) => (
//                       <button key={i}
//                         onClick={() => { setMenuOpen(false); navigate(item.path); }}
//                         style={{
//                           display: 'flex', alignItems: 'center', gap: 10,
//                           width: '100%', padding: '10px 15px',
//                           background: 'transparent', border: 'none',
//                           cursor: 'pointer', fontSize: 13, fontWeight: 600,
//                           color: '#374151', textAlign: 'left', transition: 'background 0.15s',
//                         }}
//                         onMouseOver={e => e.currentTarget.style.background = '#f5f3ff'}
//                         onMouseOut={e => e.currentTarget.style.background = 'transparent'}
//                       >
//                         <span style={{ color: '#4f46e5' }}>{item.icon}</span>
//                         {item.label}
//                       </button>
//                     ))}

//                     <div style={{ height: 1, background: '#f3f4f6' }} />
//                     <button
//                       onClick={() => { setMenuOpen(false); navigate('/logout'); }}
//                       style={{
//                         display: 'flex', alignItems: 'center', gap: 10,
//                         width: '100%', padding: '10px 15px',
//                         background: 'transparent', border: 'none',
//                         cursor: 'pointer', fontSize: 13, fontWeight: 600,
//                         color: '#ef4444', textAlign: 'left', transition: 'background 0.15s',
//                       }}
//                       onMouseOver={e => e.currentTarget.style.background = '#fef2f2'}
//                       onMouseOut={e => e.currentTarget.style.background = 'transparent'}
//                     >
//                       <LogOut size={13} /> Logout
//                     </button>
//                   </div>
//                 )}
//               </div>
//             ) : (
//               <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
//                 <Link to="/login" style={{
//                   fontSize: 13, fontWeight: 600, color: '#374151',
//                   textDecoration: 'none', padding: '7px 14px', borderRadius: 9,
//                   border: '1.5px solid #e5e7eb', background: '#f9fafb',
//                   transition: 'all 0.2s',
//                 }}
//                   onMouseOver={e => { e.currentTarget.style.borderColor = '#4f46e5'; e.currentTarget.style.color = '#4f46e5'; }}
//                   onMouseOut={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#374151'; }}>
//                   Login
//                 </Link>
//                 <Link to="/register" style={{
//                   fontSize: 13, fontWeight: 700, color: '#fff',
//                   textDecoration: 'none', padding: '7px 16px', borderRadius: 9,
//                   background: '#1a1a6e', transition: 'background 0.2s',
//                 }}
//                   onMouseOver={e => e.currentTarget.style.background = '#2d2d8e'}
//                   onMouseOut={e => e.currentTarget.style.background = '#1a1a6e'}>
//                   Sign Up
//                 </Link>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* ── Sub Navigation (only on home page) ── */}
//         {isHomePage && (
//           <div style={{ borderTop: '1px solid #f3f4f6', background: '#fff' }}>
//             <div style={{
//               maxWidth: 1280, margin: '0 auto', padding: '0 24px',
//               display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 42,
//             }}>
//               <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
//                 {[
//                   { label: 'Home',    path: '/' },
//                   { label: 'Shop',    path: '/products' },
//                   { label: 'Deals',   path: '/offers' },
//                   { label: 'Recommendation',    path: '/recommended' },
//                   { label: 'Contact', path: '/contact' },
//                 ].map((item, i) => {
//                   const active = location.pathname === item.path;
//                   return (
//                     <Link key={i} to={item.path} style={{
//                       fontSize: 13, fontWeight: active ? 700 : 600,
//                       color: active ? '#1a1a6e' : '#6b7280',
//                       textDecoration: 'none', padding: '8px 14px', borderRadius: 8,
//                       borderBottom: active ? '2px solid #1a1a6e' : '2px solid transparent',
//                       transition: 'all 0.2s',
//                     }}
//                       onMouseOver={e => { if (!active) { e.currentTarget.style.color = '#1a1a6e'; e.currentTarget.style.background = '#f5f3ff'; } }}
//                       onMouseOut={e => { if (!active) { e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.background = 'transparent'; } }}
//                     >{item.label}</Link>
//                   );
//                 })}
//               </div>
//             </div>
//           </div>
//         )}
//       </nav>

//       <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
//     </>
//   );
// }

// /* ════════════════════════════════════════
//    SUB-COMPONENTS
// ════════════════════════════════════════ */

// function AdminLogo() {
//   return (
//     <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//       <div style={{
//         width: 32, height: 32, borderRadius: 8,
//         background: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
//         display: 'flex', alignItems: 'center', justifyContent: 'center',
//       }}>
//         <ShoppingBag size={16} color="#fff" />
//       </div>
//       <div style={{ lineHeight: 1.15 }}>
//         <div style={{ fontSize: 14, fontWeight: 900, color: '#fff' }}>Grocery's</div>
//         <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase' }}>
//           Admin Panel
//         </div>
//       </div>
//     </div>
//   );
// }

// function NavBadge({ count, color = '#ef4444' }) {
//   if (!count) return null;
//   return (
//     <span style={{
//       position: 'absolute', top: -5, right: -5,
//       background: color, color: '#fff',
//       fontSize: 9, fontWeight: 800, borderRadius: '50%',
//       width: 16, height: 16,
//       display: 'flex', alignItems: 'center', justifyContent: 'center',
//       border: '2px solid #fff',
//     }}>
//       {count > 99 ? '99+' : count}
//     </span>
//   );
// }

// function Spinner() {
//   return (
//     <div style={{
//       width: 18, height: 18,
//       border: '2px solid #e5e7eb',
//       borderTopColor: '#4f46e5',
//       borderRadius: '50%', margin: '0 auto',
//       animation: 'spin 0.8s linear infinite',
//     }} />
//   );
// }

// const iconBtn = {
//   position: 'relative',
//   display: 'flex', alignItems: 'center', justifyContent: 'center',
//   width: 38, height: 38, borderRadius: 10,
//   background: '#f9fafb', border: '1.5px solid #e5e7eb',
//   color: '#6b7280', textDecoration: 'none',
//   transition: 'all 0.2s', flexShrink: 0,
// };

// const adminDropItem = {
//   display: 'block', width: '100%', padding: '10px 16px',
//   background: 'transparent', border: 'none', cursor: 'pointer',
//   fontSize: 13, fontWeight: 600, color: '#fff', textAlign: 'left',
//   transition: 'background 0.15s',
// };

import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  User, ChevronDown, Search, ShoppingCart, Heart,
  Package, LogOut, LayoutGrid, ShoppingBag, Phone, Tag,
} from "lucide-react";
import api from "../Api";
import { useQuery } from "@tanstack/react-query";

export default function Navbar() {
  const { user: ctxUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [effectiveUser, setEffectiveUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user")) || ctxUser || null; }
    catch { return ctxUser || null; }
  });

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then(res => res.data)
  });

  const [categoryOpen, setCategoryOpen]           = useState(false);
  const [menuOpen, setMenuOpen]                   = useState(false);
  const [searchTerm, setSearchTerm]               = useState("");
  const [searchResults, setSearchResults]         = useState([]);
  const [loading, setLoading]                     = useState(false);
  const [searchActive, setSearchActive]           = useState(false);
  const [selectedIndex, setSelectedIndex]         = useState(-1);
  const [cartCount, setCartCount]                 = useState(0);
  const [wishCount, setWishCount]                 = useState(0);

  const categoryRef   = useRef(null);
  const userMenuRef   = useRef(null);
  const searchRef     = useRef(null);
  const searchTimeout = useRef(null);

  /* ── fetch cart & wishlist counts ── */
  const fetchCounts = async () => {
    const userId = effectiveUser?.id || effectiveUser?.userId;
    if (!userId) { setCartCount(0); setWishCount(0); return; }
    try {
      const [cartRes, wishRes] = await Promise.all([
        api.get(`/total-cart-item/${userId}`),
        api.get(`/total-wishlist-item/${userId}`)
      ]);
      setCartCount(Number(cartRes.data) || 0);
      setWishCount(Number(wishRes.data) || 0);
    } catch {
      setCartCount(0);
      setWishCount(0);
    }
  };

  useEffect(() => { if (effectiveUser) fetchCounts(); }, [effectiveUser]);

  /* ── real-time count updates via custom events ── */
  useEffect(() => {
    const handleCart     = e => e.detail?.count !== undefined ? setCartCount(e.detail.count) : fetchCounts();
    const handleWishlist = e => e.detail?.count !== undefined ? setWishCount(e.detail.count) : fetchCounts();
    const handleStorage  = e => { if (e.key === "cartUpdate" || e.key === "wishlistUpdate") fetchCounts(); };

    window.addEventListener("cart-updated", handleCart);
    window.addEventListener("wishlist-updated", handleWishlist);
    window.addEventListener("cartCountChanged", handleCart);
    window.addEventListener("wishlistCountChanged", handleWishlist);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("cart-updated", handleCart);
      window.removeEventListener("wishlist-updated", handleWishlist);
      window.removeEventListener("cartCountChanged", handleCart);
      window.removeEventListener("wishlistCountChanged", handleWishlist);
      window.removeEventListener("storage", handleStorage);
    };
  }, [effectiveUser]);

  /* ── expose manual refresh to window ── */
  useEffect(() => {
    window.refreshNavbarCounts = fetchCounts;
    return () => { delete window.refreshNavbarCounts; };
  }, [effectiveUser]);

  /* ── periodic refresh removed to reduce API calls ── */

  /* ── sync user from context ── */
  useEffect(() => {
    if (ctxUser) setEffectiveUser(ctxUser);
    else {
      try { setEffectiveUser(JSON.parse(localStorage.getItem("user")) || null); }
      catch { setEffectiveUser(null); }
    }
  }, [ctxUser]);

  /* ── sync user from other tabs ── */
  useEffect(() => {
    const onStorage = e => {
      if (e.key === "user") {
        try { setEffectiveUser(JSON.parse(e.newValue) || null); }
        catch { setEffectiveUser(null); }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  /* ── close dropdowns on outside click ── */
  useEffect(() => {
    const handler = e => {
      if (categoryRef.current && !categoryRef.current.contains(e.target)) setCategoryOpen(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setMenuOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target))
        setTimeout(() => { setSearchActive(false); setSelectedIndex(-1); }, 150);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ── live search with debounce ── */
  useEffect(() => {
    if (!searchTerm.trim()) { setSearchResults([]); setSearchActive(false); setSelectedIndex(-1); return; }
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await api.get(`/products/search?q=${encodeURIComponent(searchTerm)}`);
        setSearchResults(res.data || []);
        setSearchActive(true);
        setSelectedIndex(-1);
      } catch { } finally { setLoading(false); }
    }, 400);
    return () => clearTimeout(searchTimeout.current);
  }, [searchTerm]);

  /* ── keyboard nav in search ── */
  useEffect(() => {
    const handleKeyDown = e => {
      if (!searchActive || !searchResults.length) return;
      if (e.key === "ArrowDown")  { e.preventDefault(); setSelectedIndex(p => Math.min(p + 1, searchResults.length - 1)); }
      else if (e.key === "ArrowUp")  { e.preventDefault(); setSelectedIndex(p => Math.max(p - 1, -1)); }
      else if (e.key === "Enter")    { e.preventDefault(); selectedIndex >= 0 ? handleProductClick(searchResults[selectedIndex]) : handleSearch(e); }
      else if (e.key === "Escape")   { setSearchActive(false); setSelectedIndex(-1); }
    };
    if (searchActive) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [searchActive, searchResults, selectedIndex]);

  const handleSearch = e => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
    setSearchTerm(""); setSearchResults([]); setSearchActive(false); setSelectedIndex(-1);
  };

  const handleProductClick = product => {
    navigate(`/product/${product.id}`);
    setSearchTerm(""); setSearchResults([]); setSearchActive(false); setSelectedIndex(-1);
  };

  const getDisplayName = u => {
    if (!u) return "";
    return u.name || u.firstName || `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.email || "User";
  };

  const isAdminUser  = effectiveUser?.roles === "ADMIN";
  const isAdminRoute = location.pathname.startsWith("/auth/admin") || location.pathname.startsWith("/admin");
  const isAdmin      = isAdminUser || isAdminRoute;
  const isHomePage   = location.pathname === "/";

  /* ════════════════════════════════════════
     ADMIN NAVBAR
  ════════════════════════════════════════ */
  if (isAdmin) {
    return (
      <nav style={{ background: "#1a1a6e", borderBottom: "1px solid rgba(255,255,255,0.1)", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 58 }}>
          <AdminLogo />
          {effectiveUser ? (
            <div style={{ position: "relative" }} ref={categoryRef}>
              <button
                onClick={() => setCategoryOpen(s => !s)}
                style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 8, padding: "7px 14px", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600 }}
              >
                <User size={14} color="#a5b4fc" />
                {getDisplayName(effectiveUser)}
                <ChevronDown size={12} color="rgba(255,255,255,0.5)" />
              </button>
              {categoryOpen && (
                <div style={{ position: "absolute", right: 0, top: "110%", background: "#1e1e7a", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, minWidth: 170, overflow: "hidden", zIndex: 99, boxShadow: "0 8px 24px rgba(0,0,0,0.3)" }}>
                  <button onClick={() => { setCategoryOpen(false); navigate("/profile-view"); }} style={adminDropItem} onMouseOver={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"} onMouseOut={e => e.currentTarget.style.background = "transparent"}>View Profile</button>
                  <div style={{ height: 1, background: "rgba(255,255,255,0.08)" }} />
                  <button onClick={() => { setCategoryOpen(false); navigate("/logout"); }} style={{ ...adminDropItem, color: "#fca5a5" }} onMouseOver={e => e.currentTarget.style.background = "rgba(239,68,68,0.1)"} onMouseOut={e => e.currentTarget.style.background = "transparent"}>Logout</button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/auth/admin" style={{ background: "#4f46e5", color: "#fff", padding: "7px 16px", borderRadius: 8, fontWeight: 700, fontSize: 13, textDecoration: "none" }}>Admin Login</Link>
          )}
        </div>
      </nav>
    );
  }

  /* ════════════════════════════════════════
     USER NAVBAR
  ════════════════════════════════════════ */
  return (
    <>
      {/* ── Announcement bar (home only) ── */}
      {isHomePage && (
        <div style={{ background: "#1a1a6e", color: "#fff", textAlign: "center", fontSize: 12, fontWeight: 600, padding: "6px 16px", letterSpacing: 0.2 }}>
          🚚 Free Delivery &amp; 40% Discount For Next 3 Orders! Place Your 1st Order Now
        </div>
      )}

      {/* ── Main Navbar ── */}
      <nav style={{ background: "#1a1a6e", borderBottom: "1px solid rgba(255,255,255,0.08)", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", gap: 12, height: 60 }}>

          {/* Logo */}
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", flexShrink: 0 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: "#4f46e5", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ShoppingBag size={17} color="#fff" strokeWidth={2} />
            </div>
            <span style={{ fontSize: 16, fontWeight: 800, color: "#fff", letterSpacing: "-0.2px" }}>
              Kirana<span style={{ color: "#a5b4fc" }}>Kart</span>
            </span>
          </Link>

          {/* Category Dropdown */}
          <div style={{ position: "relative", flexShrink: 0 }} ref={categoryRef}>
            <button
              onClick={() => setCategoryOpen(s => !s)}
              style={{ display: "flex", alignItems: "center", gap: 6, background: categoryOpen ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "8px 12px", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#fff", whiteSpace: "nowrap" }}
              onMouseOver={e => { if (!categoryOpen) e.currentTarget.style.background = "rgba(255,255,255,0.14)"; }}
              onMouseOut={e => { if (!categoryOpen) e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
            >
              <LayoutGrid size={14} color="rgba(255,255,255,0.7)" />
              All Categories
              <ChevronDown size={12} color="rgba(255,255,255,0.5)" style={{ transition: "transform 0.2s", transform: categoryOpen ? "rotate(180deg)" : "none" }} />
            </button>

            {categoryOpen && (
              <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 99, width: 250, maxHeight: 360, overflowY: "auto", padding: "4px 0" }}>
                {categoriesLoading
                  ? <div style={{ padding: 16, textAlign: "center" }}><Spinner /></div>
                  : categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => { setCategoryOpen(false); navigate(`/category/${cat.id}`); }}
                      style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "8px 12px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}
                      onMouseOver={e => e.currentTarget.style.background = "#f5f3ff"}
                      onMouseOut={e => e.currentTarget.style.background = "transparent"}
                    >
                      <img src={cat.imageURL} alt={cat.name} style={{ width: 30, height: 30, objectFit: "contain", borderRadius: 6, background: "#f9fafb" }} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{cat.name}</div>
                        <div style={{ fontSize: 11, color: "#9ca3af" }}>{cat.productCount ?? cat.products?.length ?? 0} products</div>
                      </div>
                    </button>
                  ))
                }
              </div>
            )}
          </div>

          {/* Search Bar */}
          <div style={{ flex: 1, position: "relative", minWidth: 0 }} ref={searchRef}>
            <form
              onSubmit={handleSearch}
              style={{ display: "flex", alignItems: "center", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, overflow: "hidden", background: "rgba(255,255,255,0.08)" }}
              onFocus={e => { e.currentTarget.style.borderColor = "rgba(165,180,252,0.6)"; e.currentTarget.style.background = "rgba(255,255,255,0.13)"; }}
              onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
            >
              <Search size={14} color="rgba(255,255,255,0.4)" style={{ marginLeft: 12, flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Search vegetables, fruits, dairy..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onFocus={() => { if (searchTerm.trim() && searchResults.length) setSearchActive(true); }}
                style={{ flex: 1, border: "none", outline: "none", padding: "9px 10px", fontSize: 13, background: "transparent", color: "#fff", fontWeight: 400 }}
              />
              <button
                type="submit"
                style={{ background: "#4f46e5", color: "#fff", border: "none", padding: "9px 18px", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap" }}
                onMouseOver={e => e.currentTarget.style.background = "#4338ca"}
                onMouseOut={e => e.currentTarget.style.background = "#4f46e5"}
              >
                <Search size={13} />
                Search
              </button>
            </form>

            {/* Search Dropdown */}
            {searchActive && searchTerm.trim() && (
              <div
                onMouseDown={e => e.stopPropagation()}
                style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 99, overflow: "hidden" }}
              >
                <div style={{ padding: "7px 12px", borderBottom: "1px solid #f3f4f6", background: "#f9fafb" }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#4f46e5" }}>Results for "{searchTerm}"</span>
                </div>
                {loading
                  ? <div style={{ padding: 16, textAlign: "center" }}><Spinner /></div>
                  : searchResults.length > 0
                    ? searchResults.slice(0, 7).map((item, idx) => (
                      <div
                        key={item.id}
                        onMouseDown={e => { e.preventDefault(); handleProductClick(item); }}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", cursor: "pointer", background: selectedIndex === idx ? "#f5f3ff" : "transparent", borderBottom: "1px solid #f9fafb" }}
                      >
                        <div style={{ width: 32, height: 32, background: "#f3f4f6", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Search size={12} color="#9ca3af" />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.title}</div>
                          <div style={{ fontSize: 11, color: "#9ca3af", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.description}</div>
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#16a34a", flexShrink: 0 }}>₹{item.price}</span>
                      </div>
                    ))
                    : <div style={{ padding: 16, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>No products found</div>
                }
              </div>
            )}
          </div>

          {/* Right side */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>

            {/* Offers */}
            <Link to="/offers" style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(234,179,8,0.15)", border: "1px solid rgba(234,179,8,0.3)", borderRadius: 8, padding: "6px 11px", textDecoration: "none", fontSize: 12, fontWeight: 600, color: "#fcd34d", whiteSpace: "nowrap" }}>
              <Tag size={13} color="#fcd34d" />
              Weekly Discount!
            </Link>

            {/* Phone */}
            <a href="tel:+9988256688" style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", borderRadius: 8, padding: "6px 11px", textDecoration: "none", fontSize: 12, fontWeight: 600, flexShrink: 0 }}>
              <Phone size={13} />
              +9988-256-688
            </a>

            {/* Wishlist */}
            <Link to="/wishlist" style={iconBtn}
              onMouseOver={e => { e.currentTarget.style.background = "rgba(255,255,255,0.16)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"; }}
              onMouseOut={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}>
              <Heart size={16} color="rgba(255,255,255,0.8)" strokeWidth={1.8} />
              {wishCount > 0 && <NavBadge count={wishCount} />}
            </Link>

            {/* Cart */}
            <Link to="/cart" style={iconBtn}
              onMouseOver={e => { e.currentTarget.style.background = "rgba(255,255,255,0.16)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"; }}
              onMouseOut={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}>
              <ShoppingCart size={16} color="rgba(255,255,255,0.8)" strokeWidth={1.8} />
              {cartCount > 0 && <NavBadge count={cartCount} />}
            </Link>

            {/* User menu */}
            {effectiveUser ? (
              <div style={{ position: "relative" }} ref={userMenuRef}>
                <button
                  onClick={() => setMenuOpen(s => !s)}
                  style={{ display: "flex", alignItems: "center", gap: 7, background: menuOpen ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "6px 11px", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#fff" }}
                  onMouseOver={e => { if (!menuOpen) e.currentTarget.style.background = "rgba(255,255,255,0.14)"; }}
                  onMouseOut={e => { if (!menuOpen) e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
                >
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#4f46e5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <User size={11} color="#fff" strokeWidth={2.5} />
                  </div>
                  <span style={{ maxWidth: 72, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {getDisplayName(effectiveUser).split(" ")[0]}
                  </span>
                  <ChevronDown size={12} color="rgba(255,255,255,0.5)" style={{ transition: "transform 0.2s", transform: menuOpen ? "rotate(180deg)" : "none" }} />
                </button>

                {menuOpen && (
                  <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 99, minWidth: 200, overflow: "hidden" }}>
                    {/* User header */}
                    <div style={{ padding: "12px 14px", background: "#f5f3ff", borderBottom: "1px solid #ede9fe" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                        <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#4f46e5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <User size={15} color="#fff" />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13, color: "#111827" }}>{getDisplayName(effectiveUser)}</div>
                          <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>{effectiveUser.email}</div>
                        </div>
                      </div>
                    </div>

                    {[
                      { icon: <User size={13} />,    label: "View Profile", path: "/profile-view" },
                      { icon: <Package size={13} />, label: "My Orders",    path: "/my-order" },
                      { icon: <Heart size={13} />,   label: "Wishlist",     path: "/wishlist" },
                    ].map((item, i) => (
                      <button key={i}
                        onClick={() => { setMenuOpen(false); navigate(item.path); }}
                        style={{ display: "flex", alignItems: "center", gap: 9, width: "100%", padding: "9px 14px", background: "transparent", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#374151", textAlign: "left" }}
                        onMouseOver={e => e.currentTarget.style.background = "#f5f3ff"}
                        onMouseOut={e => e.currentTarget.style.background = "transparent"}
                      >
                        <span style={{ color: "#4f46e5" }}>{item.icon}</span>
                        {item.label}
                      </button>
                    ))}

                    <div style={{ height: 1, background: "#f3f4f6" }} />
                    <button
                      onClick={() => { setMenuOpen(false); navigate("/logout"); }}
                      style={{ display: "flex", alignItems: "center", gap: 9, width: "100%", padding: "9px 14px", background: "transparent", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#ef4444", textAlign: "left" }}
                      onMouseOver={e => e.currentTarget.style.background = "#fef2f2"}
                      onMouseOut={e => e.currentTarget.style.background = "transparent"}
                    >
                      <LogOut size={13} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Link to="/login" style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.85)", textDecoration: "none", padding: "7px 13px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.08)" }}
                  onMouseOver={e => { e.currentTarget.style.background = "rgba(255,255,255,0.14)"; }}
                  onMouseOut={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}>
                  Login
                </Link>
                <Link to="/register" style={{ fontSize: 13, fontWeight: 700, color: "#fff", textDecoration: "none", padding: "7px 15px", borderRadius: 8, background: "#4f46e5" }}
                  onMouseOver={e => e.currentTarget.style.background = "#4338ca"}
                  onMouseOut={e => e.currentTarget.style.background = "#4f46e5"}>
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ── Sub Navigation (home only) ── */}
        {isHomePage && (
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", background: "#fff" }}>
            <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", height: 38 }}>
              {[
                { label: "Home",           path: "/" },
                { label: "Shop",           path: "/products" },
                { label: "Deals",          path: "/offers" },
                { label: "Recommendation", path: "/recommended" },
                { label: "Contact",        path: "/contact" },
              ].map((item, i) => {
                const active = location.pathname === item.path;
                return (
                  <Link key={i} to={item.path} style={{ fontSize: 13, fontWeight: active ? 700 : 500, color: active ? "#1a1a6e" : "#6b7280", textDecoration: "none", padding: "7px 13px", borderRadius: active ? 0 : 6, borderBottom: active ? "2px solid #1a1a6e" : "2px solid transparent" }}
                    onMouseOver={e => { if (!active) { e.currentTarget.style.color = "#1a1a6e"; e.currentTarget.style.background = "#f5f3ff"; } }}
                    onMouseOut={e => { if (!active) { e.currentTarget.style.color = "#6b7280"; e.currentTarget.style.background = "transparent"; } }}
                  >{item.label}</Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}

/* ════════════════════════════════════════
   SUB-COMPONENTS
════════════════════════════════════════ */

function AdminLogo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: "#4f46e5", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <ShoppingBag size={15} color="#fff" />
      </div>
      <div style={{ lineHeight: 1.2 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>KiranaKart</div>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", fontWeight: 600, letterSpacing: "0.8px", textTransform: "uppercase" }}>Admin Panel</div>
      </div>
    </div>
  );
}

function NavBadge({ count }) {
  if (!count) return null;
  return (
    <span style={{ position: "absolute", top: -4, right: -4, background: "#ef4444", color: "#fff", fontSize: 9, fontWeight: 800, borderRadius: "50%", width: 15, height: 15, display: "flex", alignItems: "center", justifyContent: "center", border: "1.5px solid #1a1a6e" }}>
      {count > 99 ? "99+" : count}
    </span>
  );
}

function Spinner() {
  return (
    <div style={{ width: 16, height: 16, border: "2px solid #e5e7eb", borderTopColor: "#4f46e5", borderRadius: "50%", margin: "0 auto", animation: "spin 0.8s linear infinite" }} />
  );
}

const iconBtn = {
  position: "relative",
  display: "flex", alignItems: "center", justifyContent: "center",
  width: 36, height: 36, borderRadius: 8,
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.12)",
  textDecoration: "none",
  transition: "all 0.15s", flexShrink: 0,
};

const adminDropItem = {
  display: "block", width: "100%", padding: "9px 14px",
  background: "transparent", border: "none", cursor: "pointer",
  fontSize: 13, fontWeight: 600, color: "#fff", textAlign: "left",
  transition: "background 0.12s",
};