// import React, { useEffect, useState } from 'react';
// import ProductCard from '../components/ProductCard';
// import api from '../Api';
// import { useAuth } from "../contexts/AuthContext";
// import { useNavigate } from 'react-router-dom';
// import {
//   ChevronLeft, ChevronRight, ChevronDown, Flame, Star,
//   RotateCcw, TrendingUp, ArrowRight, Tag,
//   ShoppingCart, Apple,
// } from 'lucide-react';
// import FestivalOfferSection from './Festivaloffersection';
// import RecommendedSection from './Recommendedsection';
// import FrequentlyViewedSection from './Frequentlyviewedsection';

// /* ── Shared helpers ────────────────────────────────────────────────────── */

// function resolvePrice(p) {
//   return p.discountFinalPrice ?? p.price ?? 0;
// }

// function SectionHeader({ icon, label, title, subtitle }) {
//   return (
//     <div style={{ marginBottom: 24 }}>
//       <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
//         {icon}
//         <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#9ca3af' }}>
//           {label}
//         </span>
//       </div>
//       <h2 style={{ fontSize: 26, fontWeight: 900, color: '#111827', margin: 0 }}>{title}</h2>
//       {subtitle && <p style={{ fontSize: 13, color: '#9ca3af', fontWeight: 500, marginTop: 5 }}>{subtitle}</p>}
//     </div>
//   );
// }

// function ProductSection({ icon, label, title, products, subtitle }) {
//   return (
//     <section style={{ padding: '0 0 52px' }}>
//       <SectionHeader icon={icon} label={label} title={title} subtitle={subtitle} />
//       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 18 }}>
//         {products.map(p => <ProductCard key={p.id} p={p} />)}
//       </div>
//     </section>
//   );
// }

// /* ── Deal Card ─────────────────────────────────────────────────────────── */
// function DealCard({ p }) {
//   const navigate  = useNavigate();
//   const discount  = p.discountPercent || 0;
//   const origPrice = p.price;
//   const finalPrice = resolvePrice(p);

//   return (
//     <div
//       onClick={() => navigate(`/product/${p.id}`)}
//       style={{
//         background: '#fff', borderRadius: 16, overflow: 'hidden',
//         border: '1px solid #f3f4f6',
//         boxShadow: '0 1px 6px rgba(0,0,0,0.07)',
//         cursor: 'pointer', transition: 'all 0.22s', position: 'relative',
//       }}
//       onMouseOver={e => {
//         e.currentTarget.style.transform = 'translateY(-4px)';
//         e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.12)';
//         e.currentTarget.style.borderColor = 'rgba(79,70,229,0.20)';
//       }}
//       onMouseOut={e => {
//         e.currentTarget.style.transform = 'translateY(0)';
//         e.currentTarget.style.boxShadow = '0 1px 6px rgba(0,0,0,0.07)';
//         e.currentTarget.style.borderColor = '#f3f4f6';
//       }}
//     >
//       {discount > 0 && (
//         <div style={{
//           position: 'absolute', top: 10, left: 10, zIndex: 10,
//           background: '#ef4444', color: '#fff',
//           fontWeight: 800, fontSize: 10, borderRadius: 7, padding: '3px 8px',
//         }}>
//           -{discount}%
//         </div>
//       )}
//       <div style={{ height: 155, background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 14 }}>
//         <img src={p.imageURL || p.image} alt={p.name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
//       </div>
//       <div style={{ padding: '12px 14px 15px' }}>
//         <div style={{ fontWeight: 700, fontSize: 13, color: '#111827', marginBottom: 4, lineHeight: 1.3 }}>{p.name}</div>
//         {p.weight && <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500, marginBottom: 8 }}>{p.weight}</div>}
//         <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
//           <span style={{ fontSize: 17, fontWeight: 900, color: '#16a34a' }}>₹{finalPrice}</span>
//           {discount > 0 && <span style={{ fontSize: 12, color: '#9ca3af', textDecoration: 'line-through' }}>₹{origPrice}</span>}
//           {discount > 0 && (
//             <span style={{ fontSize: 10, fontWeight: 700, color: '#16a34a', background: '#dcfce7', borderRadius: 5, padding: '2px 7px' }}>
//               Save ₹{(origPrice - finalPrice).toFixed(0)}
//             </span>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// /* ── Deal of the Week ──────────────────────────────────────────────────── */
// function DealOfWeekSection({ deals }) {
//   if (!deals.length) return null;

//   const getSecondsLeft = () => {
//     const now = new Date(), next = new Date(now);
//     next.setDate(now.getDate() + (7 - now.getDay()));
//     next.setHours(0, 0, 0, 0);
//     return Math.floor((next - now) / 1000);
//   };
//   const [seconds, setSeconds] = useState(getSecondsLeft);
//   useEffect(() => {
//     const t = setInterval(() => setSeconds(s => (s > 0 ? s - 1 : getSecondsLeft())), 1000);
//     return () => clearInterval(t);
//   }, []);

//   const d = String(Math.floor(seconds / 86400)).padStart(2, '0');
//   const h = String(Math.floor((seconds % 86400) / 3600)).padStart(2, '0');
//   const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
//   const s = String(seconds % 60).padStart(2, '0');

//   return (
//     <section style={{
//       padding: '36px 36px 44px',
//       background: 'linear-gradient(135deg,#1a1a6e 0%,#2d2d8e 60%,#1a1a6e 100%)',
//       borderRadius: 22, marginBottom: 52,
//       boxShadow: '0 4px 32px rgba(26,26,110,0.18)',
//     }}>
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 14 }}>
//         <div>
//           <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
//             <Tag size={15} color="#fbbf24" />
//             <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#a5b4fc' }}>LIMITED TIME</span>
//           </div>
//           <h2 style={{ fontSize: 24, fontWeight: 900, color: '#fff', margin: 0 }}>🏷️ Deal of the Week</h2>
//           <p style={{ fontSize: 12, color: '#a5b4fc', marginTop: 5 }}>Exclusive discounts — refreshed every week</p>
//         </div>
//         <div style={{ display: 'flex', gap: 8 }}>
//           {[['Days', d], ['Hrs', h], ['Min', m], ['Sec', s]].map(([label, val]) => (
//             <div key={label} style={{
//               background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.16)',
//               borderRadius: 11, padding: '8px 14px', textAlign: 'center', minWidth: 52,
//             }}>
//               <div style={{ fontSize: 20, fontWeight: 900, color: '#fbbf24', lineHeight: 1 }}>{val}</div>
//               <div style={{ fontSize: 9, color: '#a5b4fc', fontWeight: 600, marginTop: 3 }}>{label}</div>
//             </div>
//           ))}
//         </div>
//       </div>
//       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(175px,1fr))', gap: 15 }}>
//         {deals.map(p => <DealCard key={p.id} p={p} />)}
//       </div>
//     </section>
//   );
// }

// /* ── Category Card for featured row ───────────────────────────────────── */
// function FeaturedCategoryCard({ cat, navigate }) {
//   return (
//     <div
//       onClick={() => navigate(`/category/${cat.id}`)}
//       style={{
//         display: 'flex', flexDirection: 'column', alignItems: 'center',
//         background: '#fff', borderRadius: 14, padding: '14px 10px',
//         border: '1px solid #f3f4f6', cursor: 'pointer',
//         transition: 'all 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
//       }}
//       onMouseOver={e => {
//         e.currentTarget.style.transform = 'translateY(-4px)';
//         e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.10)';
//         e.currentTarget.style.borderColor = '#c7d2fe';
//       }}
//       onMouseOut={e => {
//         e.currentTarget.style.transform = 'translateY(0)';
//         e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)';
//         e.currentTarget.style.borderColor = '#f3f4f6';
//       }}
//     >
//       <div style={{ width: 60, height: 60, background: '#f5f3ff', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 9 }}>
//         <img src={cat.imageURL} alt={cat.name} style={{ width: 44, height: 44, objectFit: 'contain' }} />
//       </div>
//       <div style={{ fontWeight: 700, fontSize: 12, color: '#111827', textAlign: 'center' }}>{cat.name}</div>
//       <div style={{ fontSize: 10.5, color: '#9ca3af', fontWeight: 500, marginTop: 2 }}>
//         {cat.productCount ?? cat.products?.length ?? 0} Products
//       </div>
//     </div>
//   );
// }

// /* ── Main Home ─────────────────────────────────────────────────────────── */
// export default function Home() {
//   const [categories,         setCategories]         = useState([]);
//   const [trendingProducts,   setTrendingProducts]   = useState([]);
//   const [mostBought,         setMostBought]         = useState([]);
//   const [buyAgain,           setBuyAgain]           = useState([]);
//   const [trendingCategories, setTrendingCategories] = useState([]);
//   const [deals,              setDeals]              = useState([]);
//   const [heroSlide,          setHeroSlide]          = useState(0);
//   const { user } = useAuth();
//   const navigate = useNavigate();

//   /* Hero slides — navy accent matching navbar */
//   const HERO_SLIDES = [
//     {
//       heading: 'Daily Grocery Order and\nGet Express Delivery',
//       sub: 'Limited-Time Offers on Quick and Easy Meals - Ends Soon!',
//       btn: 'Explore Shop',
//       accent: '#1a1a6e',
//       bg: 'linear-gradient(135deg, #d4edda 0%, #c8e6c9 40%, #dcedc8 100%)',
//     },
//     {
//       heading: 'Fresh Vegetables &\nFarm Produce Daily',
//       sub: 'Direct from farms to your doorstep — zero middlemen',
//       btn: 'Shop Fresh',
//       accent: '#1a1a6e',
//       bg: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 40%, #dcedc8 100%)',
//     },
//     {
//       heading: 'Rice, Dal & Grains\nat Kirana Prices',
//       sub: 'Your neighbourhood store, now delivered to your home',
//       btn: 'Order Now',
//       accent: '#1a1a6e',
//       bg: 'linear-gradient(135deg, #f1f8e9 0%, #dcedc8 40%, #c8e6c9 100%)',
//     },
//   ];

//   const H = HERO_SLIDES[heroSlide];

//   /* Auto-slide hero */
//   useEffect(() => {
//     const t = setInterval(() => setHeroSlide(s => (s + 1) % HERO_SLIDES.length), 5500);
//     return () => clearInterval(t);
//   }, []);

//   /* Data fetching */
//   useEffect(() => {
//     (async () => {
//       try { const r = await api.get('/categories');                             setCategories(r.data); }         catch(e) {}
//       try { const r = await api.get('/analytics/trending-products?limit=5');   setTrendingProducts(r.data); }   catch(e) {}
//       try { const r = await api.get('/analytics/most-bought?limit=5');         setMostBought(r.data); }         catch(e) {}
//       try { const r = await api.get('/analytics/trending-categories?limit=5'); setTrendingCategories(r.data); } catch(e) {}
//       try { const r = await api.get('/deals');                                  setDeals(r.data); }              catch(e) {}
//     })();
//   }, []);

//   useEffect(() => {
//     if (!user) return;
//     api.get(`/analytics/buy-again/${user.id}?limit=5`).then(r => setBuyAgain(r.data)).catch(() => {});
//   }, [user]);

//   return (
//     <div style={{ background: '#f9fafb', minHeight: '100vh' }}>
//       <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px 0' }}>

//         {/* ══ HERO ══════════════════════════════════════════════════════════ */}
// <section style={{ marginBottom: 10, position: 'relative' }}>
//   {/* Hero card — arrows are INSIDE, positioned absolutely within */}
//   <div style={{
//     background: H.bg,
//     borderRadius: 32,
//     padding: '52px 72px',
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     gap: 32,
//     position: 'relative',
//     overflow: 'hidden',
//     minHeight: 280,
//     transition: 'background 0.8s ease',
//   }}>
//     {/* Decorative pattern dots */}
//     <div style={{
//       position: 'absolute', inset: 0, opacity: 0.06,
//       backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23166534' fill-opacity='1'%3E%3Ccircle cx='8' cy='8' r='3'/%3E%3Ccircle cx='28' cy='8' r='3'/%3E%3Ccircle cx='8' cy='28' r='3'/%3E%3Ccircle cx='28' cy='28' r='3'/%3E%3C/g%3E%3C/svg%3E")`,
//       pointerEvents: 'none',
//     }} />

//     {/* ── Left: Text content ── */}
//     <div style={{ flex: '0 0 50%', zIndex: 2 }}>
//       <h1 style={{
//         fontSize: 36,
//         fontWeight: 900,
//         lineHeight: 1.15,
//         color: '#1a1a6e',
//         margin: '0 0 14px 0',
//         whiteSpace: 'pre-line',
//         letterSpacing: '-0.5px',
//       }}>
//         {H.heading}
//       </h1>
//       <p style={{
//         fontSize: 14,
//         color: '#4a5568',
//         fontWeight: 500,
//         margin: '0 0 28px 0',
//         maxWidth: 380,
//         lineHeight: 1.65,
//       }}>
//         {H.sub}
//       </p>
//       <button
//         onClick={() => navigate('/products')}
//         style={{
//           display: 'inline-flex', alignItems: 'center', gap: 9,
//           background: '#1a1a6e',
//           color: '#fff',
//           border: 'none',
//           padding: '13px 28px',
//           borderRadius: 50,
//           fontSize: 14,
//           fontWeight: 700,
//           cursor: 'pointer',
//           boxShadow: '0 6px 20px rgba(26,26,110,0.35)',
//           transition: 'transform 0.2s, box-shadow 0.2s, background 0.2s',
//         }}
//         onMouseOver={e => {
//           e.currentTarget.style.transform = 'translateY(-2px)';
//           e.currentTarget.style.boxShadow = '0 10px 28px rgba(26,26,110,0.45)';
//           e.currentTarget.style.background = '#2d2d8e';
//         }}
//         onMouseOut={e => {
//           e.currentTarget.style.transform = 'translateY(0)';
//           e.currentTarget.style.boxShadow = '0 6px 20px rgba(26,26,110,0.35)';
//           e.currentTarget.style.background = '#1a1a6e';
//         }}
//       >
//         {H.btn}
//         <ShoppingCart size={16} />
//       </button>
//     </div>

//     {/* ── Right: Store image ── */}
//     <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', zIndex: 2 }}>
//       <img
//         src="/Kirana-store2.png"
//         alt="Fresh Groceries"
//         style={{
//           width: '100%',
//           maxWidth: 420,
//           height: 'auto',
//           maxHeight: 240,
//           objectFit: 'contain',
//           filter: 'drop-shadow(0 12px 28px rgba(0,0,0,0.18))',
//           animation: 'heroFloat 4s ease-in-out infinite',
//         }}
//         onError={e => {
//           e.currentTarget.style.display = 'none';
//           e.currentTarget.nextSibling.style.display = 'flex';
//         }}
//       />
//       <div style={{
//         display: 'none', fontSize: 100, textAlign: 'center',
//         filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.15))',
//         animation: 'heroFloat 4s ease-in-out infinite',
//       }}>
//         🍊🍌🍇🥦
//       </div>
//     </div>

//     {/* ── Prev arrow — INSIDE banner ── */}
//     <button
//       onClick={() => setHeroSlide(s => (s - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
//       style={{
//         position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
//         background: 'rgba(255,255,255,0.88)',
//         border: '1.5px solid rgba(255,255,255,0.7)',
//         borderRadius: '50%', width: 40, height: 40,
//         display: 'flex', alignItems: 'center', justifyContent: 'center',
//         cursor: 'pointer', zIndex: 10,
//         boxShadow: '0 3px 12px rgba(0,0,0,0.14)',
//         transition: 'all 0.2s',
//       }}
//       onMouseOver={e => {
//         e.currentTarget.style.background = '#1a1a6e';
//         e.currentTarget.style.borderColor = '#1a1a6e';
//         e.currentTarget.querySelector('svg').style.color = '#fff';
//       }}
//       onMouseOut={e => {
//         e.currentTarget.style.background = 'rgba(255,255,255,0.88)';
//         e.currentTarget.style.borderColor = 'rgba(255,255,255,0.7)';
//         e.currentTarget.querySelector('svg').style.color = '#374151';
//       }}
//     >
//       <ChevronLeft size={18} color="#374151" />
//     </button>

//     {/* ── Next arrow — INSIDE banner ── */}
//     <button
//       onClick={() => setHeroSlide(s => (s + 1) % HERO_SLIDES.length)}
//       style={{
//         position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
//         background: 'rgba(255,255,255,0.88)',
//         border: '1.5px solid rgba(255,255,255,0.7)',
//         borderRadius: '50%', width: 40, height: 40,
//         display: 'flex', alignItems: 'center', justifyContent: 'center',
//         cursor: 'pointer', zIndex: 10,
//         boxShadow: '0 3px 12px rgba(0,0,0,0.14)',
//         transition: 'all 0.2s',
//       }}
//       onMouseOver={e => {
//         e.currentTarget.style.background = '#1a1a6e';
//         e.currentTarget.style.borderColor = '#1a1a6e';
//         e.currentTarget.querySelector('svg').style.color = '#fafafa';
//       }}
//       onMouseOut={e => {
//         e.currentTarget.style.background = 'rgba(255,255,255,0.88)';
//         e.currentTarget.style.borderColor = 'rgba(255,255,255,0.7)';
//         e.currentTarget.querySelector('svg').style.color = '#374151';
//       }}
//     >
//       <ChevronRight size={18} color="#374151" />
//     </button>
//   </div>

//   {/* ── Bottom Arrow with Curved Background ── */}
//   <div style={{
//     display: 'flex',
//     justifyContent: 'center',
//     position: 'relative',
//     zIndex: 5,
//     marginTop: -24,
//   }}>
//     {/* Curved background container for the arrow */}
//     <div style={{
//       position: 'relative',
//       display: 'inline-flex',
//       flexDirection: 'column',
//       alignItems: 'center',
//     }}>
//       {/* Curved/semi-rounded background */}
//       <div style={{
//         position: 'absolute',
//         bottom: -8,
//         left: '50%',
//         transform: 'translateX(-50%)',
//         width: 80,
//         height: 35,
//         background: H.bg,
//         borderRadius: '0 0 40px 40px',
//         zIndex: 1,
//         transition: 'background 0.8s ease',
//         boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
//       }} />
      
//       {/* Arrow button */}
//       <div
//         onClick={() => window.scrollBy({ top: 400, behavior: 'smooth' })}
//         style={{
//           width: 48,
//           height: 48,
//           borderRadius: '50%',
//           background: '#1a1a6e',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//           boxShadow: '0 6px 20px rgba(26,26,110,0.4)',
//           cursor: 'pointer',
//           transition: 'all 0.3s ease',
//           border: '3px solid white',
//           animation: 'scrollBounce 2s ease-in-out infinite',
//           position: 'relative',
//           zIndex: 2,
//         }}
//         onMouseOver={e => {
//           e.currentTarget.style.transform = 'scale(1.1)';
//           e.currentTarget.style.background = '#2d2d8e';
//           e.currentTarget.style.boxShadow = '0 8px 25px rgba(26,26,110,0.5)';
//         }}
//         onMouseOut={e => {
//           e.currentTarget.style.transform = 'scale(1)';
//           e.currentTarget.style.background = '#1a1a6e';
//           e.currentTarget.style.boxShadow = '0 6px 20px rgba(26,26,110,0.4)';
//         }}
//       >
//         <ChevronDown size={24} color="#fff" strokeWidth={2.5} />
//       </div>
//     </div>
//   </div>

//   {/* Slide dots */}
//   <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 20 }}>
//     {HERO_SLIDES.map((_, i) => (
//       <button 
//         key={i} 
//         onClick={() => setHeroSlide(i)} 
//         style={{
//           width: i === heroSlide ? 28 : 8, 
//           height: 8,
//           borderRadius: 8,
//           background: i === heroSlide ? '#1a1a6e' : '#d1d5db',
//           border: 'none', 
//           cursor: 'pointer', 
//           transition: 'all 0.3s ease', 
//           padding: 0,
//         }} 
//       />
//     ))}
//   </div>
// </section>

//         {/* ══ FEATURED CATEGORIES ROW ═══════════════════════════════════════ */}
//         {categories.length > 0 && (
//           <section style={{ padding: '0 0 40px' }}>
//             <div style={{
//               display: 'grid',
//               gridTemplateColumns: `repeat(${Math.min(categories.length, 6)}, 1fr)`,
//               gap: 14,
//             }}>
//               {categories.slice(0, 6).map(cat => (
//                 <FeaturedCategoryCard key={cat.id} cat={cat} navigate={navigate} />
//               ))}
//             </div>
//           </section>
//         )}

//         {/* ══ PROMOTIONAL BANNERS ══════════════════════════════════════════ */}
//         <section style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 18, marginBottom: 40 }}>
//           {/* Main promo */}
//           <div
//             onClick={() => navigate('/offers')}
//             style={{
//               background: 'linear-gradient(135deg, #1a1a6e 0%, #2d2d8e 50%, #4338ca 100%)',
//               borderRadius: 18, padding: '32px 36px',
//               display: 'flex', alignItems: 'center', justifyContent: 'space-between',
//               cursor: 'pointer', position: 'relative', overflow: 'hidden',
//               transition: 'transform 0.2s',
//             }}
//             onMouseOver={e => e.currentTarget.style.transform = 'scale(1.01)'}
//             onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
//           >
//             <div style={{ position: 'absolute', right: -40, top: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
//             <div>
//               <div style={{ fontSize: 30, fontWeight: 900, color: '#fbbf24', lineHeight: 1 }}>Price Drop</div>
//               <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginTop: 4 }}>Discount on the products! Check it out!</div>
//               <button style={{
//                 marginTop: 18, background: '#fff', color: '#1a1a6e',
//                 border: 'none', padding: '10px 22px', borderRadius: 50,
//                 fontSize: 13, fontWeight: 800, cursor: 'pointer',
//               }}>Shop Now →</button>
//             </div>
//             <div style={{ fontSize: 70, opacity: 0.7 }}>🛒</div>
//           </div>

//           {/* Side promo */}
//           <div
//             onClick={() => navigate('/products')}
//             style={{
//               background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
//               borderRadius: 18, padding: '24px 22px',
//               display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
//               cursor: 'pointer', border: '1px solid #fcd34d',
//               transition: 'transform 0.2s',
//             }}
//             onMouseOver={e => e.currentTarget.style.transform = 'scale(1.01)'}
//             onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
//           >
//             <div>
//               <div style={{ fontSize: 11, fontWeight: 700, color: '#92400e', letterSpacing: 1.5, textTransform: 'uppercase' }}>All Fixed Stars</div>
//               <div style={{ fontSize: 16, fontWeight: 800, color: '#78350f', marginTop: 5, lineHeight: 1.3 }}>Dark Wash Face Wash<br />& Daily Essentials</div>
//             </div>
//             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//               <div style={{
//                 background: '#ef4444', color: '#fff',
//                 width: 52, height: 52, borderRadius: '50%',
//                 display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
//               }}>
//                 <div style={{ fontSize: 16, fontWeight: 900, lineHeight: 1 }}>10%</div>
//                 <div style={{ fontSize: 9, fontWeight: 700 }}>Off</div>
//               </div>
//               <span style={{ fontSize: 13, fontWeight: 700, color: '#92400e' }}>Shop Now →</span>
//             </div>
//           </div>
//         </section>

//         {/* ══ TRUST BAR ════════════════════════════════════════════════════ */}
//         <section style={{
//           display: 'grid', gridTemplateColumns: 'repeat(4,1fr)',
//           background: '#fff', borderRadius: 16, marginBottom: 40,
//           border: '1px solid #f3f4f6',
//           boxShadow: '0 2px 16px rgba(0,0,0,0.05)', overflow: 'hidden',
//         }}>
//           {[
//             { emoji: '⚡', title: '30-Min Delivery', sub: 'Express to your doorstep' },
//             { emoji: '💰', title: 'Best Prices',     sub: 'No middlemen, no markup' },
//             { emoji: '📦', title: 'Freshly Packed',  sub: 'Quality checked always' },
//             { emoji: '↩️', title: 'Easy Returns',    sub: 'Hassle-free 7-day returns' },
//           ].map((item, i) => (
//             <div key={i} style={{ padding: '18px 14px', textAlign: 'center', borderRight: i < 3 ? '1px solid #f3f4f6' : 'none' }}>
//               <div style={{ fontSize: 26, marginBottom: 7 }}>{item.emoji}</div>
//               <div style={{ fontWeight: 800, fontSize: 13, color: '#111827', marginBottom: 3 }}>{item.title}</div>
//               <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>{item.sub}</div>
//             </div>
//           ))}
//         </section>

//         {/* ══ FULL CATEGORY GRID ════════════════════════════════════════════ */}
//         {categories.length > 0 && (
//           <section style={{ padding: '0 0 44px' }}>
//             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
//               <div>
//                 <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#9ca3af', margin: '0 0 3px 0' }}>BROWSE</p>
//                 <h2 style={{ fontSize: 24, fontWeight: 900, color: '#111827', margin: 0 }}>Shop by Category</h2>
//               </div>
//               <button onClick={() => navigate('/categories')}
//                 style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'transparent', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '8px 14px', fontWeight: 700, fontSize: 12, color: '#374151', cursor: 'pointer', transition: 'all 0.2s' }}
//                 onMouseOver={e => { e.currentTarget.style.background = '#1a1a6e'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#1a1a6e'; }}
//                 onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#374151'; e.currentTarget.style.borderColor = '#e5e7eb'; }}>
//                 View All <ArrowRight size={13} />
//               </button>
//             </div>

//             <div style={{ position: 'relative' }}>
//               <div id="cat-scroll" style={{ display: 'flex', gap: 22, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 6, scrollBehavior: 'smooth' }}>
//                 {categories.map(cat => (
//                   <div key={cat.id} onClick={() => navigate(`/category/${cat.id}`)}
//                     style={{ flexShrink: 0, width: 145, background: '#fff', borderRadius: 16, overflow: 'hidden', cursor: 'pointer', border: '1px solid #f3f4f6', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', transition: 'all 0.22s' }}
//                     onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 24px rgba(0,0,0,0.10)'; e.currentTarget.style.borderColor = '#c7d2fe'; }}
//                     onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)'; e.currentTarget.style.borderColor = '#f3f4f6'; }}
//                   >
//                     <div style={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb', padding: 12 }}>
//                       <img src={cat.imageURL} alt={cat.name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
//                     </div>
//                     <div style={{ padding: '9px 11px 12px' }}>
//                       <div style={{ fontWeight: 700, fontSize: 12.5, color: '#111827' }}>{cat.name}</div>
//                       <div style={{ fontSize: 10.5, color: '#9ca3af', fontWeight: 600, marginTop: 2 }}>{cat.productCount ?? 0} items</div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//               {[{ dir: -1, side: { left: -16 } }, { dir: 1, side: { right: -16 } }].map(({ dir, side }) => (
//                 <button key={dir}
//                   onClick={() => document.getElementById('cat-scroll').scrollBy({ left: dir * 500, behavior: 'smooth' })}
//                   style={{ position: 'absolute', top: '45%', transform: 'translateY(-50%)', ...side, background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.10)', zIndex: 10, color: '#6b7280', transition: 'all 0.2s' }}
//                   onMouseOver={e => { e.currentTarget.style.background = '#1a1a6e'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#1a1a6e'; }}
//                   onMouseOut={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.borderColor = '#e5e7eb'; }}
//                 >
//                   {dir === -1 ? <ChevronLeft size={15} /> : <ChevronRight size={15} />}
//                 </button>
//               ))}
//             </div>
//           </section>
//         )}

//         {/* ══ DEAL OF THE WEEK ══════════════════════════════════════════════ */}
//         <DealOfWeekSection deals={deals} />

//         {/* ══ FESTIVAL + ML ═════════════════════════════════════════════════ */}
//         <FestivalOfferSection />
//         {user && <RecommendedSection />}
//         {user && <FrequentlyViewedSection />}

//         {/* ══ PRODUCT SECTIONS ══════════════════════════════════════════════ */}
//         {trendingProducts.length > 0 && (
//           <ProductSection icon={<Flame size={18} color="#ef4444" />} label="TRENDING NOW" title="🔥 Hot This Week" products={trendingProducts} />
//         )}
//         {mostBought.length > 0 && (
//           <ProductSection icon={<Star size={18} color="#f59e0b" fill="#f59e0b" />} label="BESTSELLERS" title="🏆 Most Bought" products={mostBought} />
//         )}
//         {user && buyAgain.length > 0 && (
//           <ProductSection icon={<RotateCcw size={18} color="#8b5cf6" />} label="REORDER" title="🔁 Buy Again" products={buyAgain} subtitle="Based on your previous purchases" />
//         )}

//         {trendingCategories.length > 0 && (
//           <section style={{ padding: '0 0 56px' }}>
//             <SectionHeader icon={<TrendingUp size={18} color="#4f46e5" />} label="POPULAR" title="📈 Trending Categories" />
//             <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(trendingCategories.length, 6)}, 1fr)`, gap: 14, marginTop: 20 }}>
//               {trendingCategories.map(cat => (
//                 <div key={cat.id} onClick={() => navigate(`/category/${cat.id}`)}
//                   style={{ background: '#fff', borderRadius: 16, padding: 16, cursor: 'pointer', textAlign: 'center', border: '1px solid #f3f4f6', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', transition: 'all 0.22s' }}
//                   onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 24px rgba(0,0,0,0.10)'; e.currentTarget.style.borderColor = '#c7d2fe'; }}
//                   onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)'; e.currentTarget.style.borderColor = '#f3f4f6'; }}
//                 >
//                   <img src={cat.imageURL} alt={cat.name} style={{ height: 56, width: 56, objectFit: 'contain', margin: '0 auto 8px' }} />
//                   <div style={{ fontWeight: 700, fontSize: 12.5, color: '#111827' }}>{cat.name}</div>
//                   <div style={{ fontSize: 10.5, color: '#9ca3af', fontWeight: 600, marginTop: 3 }}>{cat.totalOrders} orders</div>
//                 </div>
//               ))}
//             </div>
//           </section>
//         )}

//       </div>{/* end content wrapper */}

      

    

         
//       <style>{`
//         ::-webkit-scrollbar { display: none; }
//         @keyframes heroFloat { 0%,100%{ transform:translateY(0); } 50%{ transform:translateY(-12px); } }
//         @keyframes scrollBounce { 0%,100%{ transform:translateY(0); } 50%{ transform:translateY(6px); } }
//       `}</style>
//     </div>
//   );
// }

import React, { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';
import api from '../Api';
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, ChevronDown, Flame, Star,
  RotateCcw, TrendingUp, ArrowRight, Tag,
  ShoppingCart, Apple, Sparkles, Zap, Shield, RotateCw,
} from 'lucide-react';
import FestivalOfferSection from './Festivaloffersection';
import RecommendedSection from './Recommendedsection';
import FrequentlyViewedSection from './Frequentlyviewedsection';

/* ── Shared helpers ────────────────────────────────────────────────────── */

function resolvePrice(p) {
  return p.discountFinalPrice ?? p.price ?? 0;
}

function SectionHeader({ icon, label, title, subtitle, accent = '#1a1a6e' }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <div style={{
          width: 3, height: 18, borderRadius: 2,
          background: `linear-gradient(180deg, ${accent}, #4f46e5)`,
        }} />
        {icon}
        <span style={{
          fontSize: 10, fontWeight: 800, letterSpacing: 2.5,
          textTransform: 'uppercase', color: '#9ca3af',
        }}>{label}</span>
      </div>
      <h2 style={{
        fontSize: 26, fontWeight: 900, color: '#111827', margin: 0,
        letterSpacing: '-0.4px',
      }}>{title}</h2>
      {subtitle && (
        <p style={{ fontSize: 13, color: '#9ca3af', fontWeight: 500, marginTop: 6 }}>{subtitle}</p>
      )}
    </div>
  );
}

function ProductSection({ icon, label, title, products, subtitle }) {
  return (
    <section style={{ padding: '0 0 56px' }}>
      <SectionHeader icon={icon} label={label} title={title} subtitle={subtitle} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 18 }}>
        {products.map(p => <ProductCard key={p.id} p={p} />)}
      </div>
    </section>
  );
}

/* ── Deal Card ─────────────────────────────────────────────────────────── */
function DealCard({ p }) {
  const navigate   = useNavigate();
  const discount   = p.discountPercent || 0;
  const origPrice  = p.price;
  const finalPrice = resolvePrice(p);

  return (
    <div
      onClick={() => navigate(`/product/${p.id}`)}
      style={{
        background: '#fff', borderRadius: 16, overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.8)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        cursor: 'pointer', transition: 'all 0.25s', position: 'relative',
      }}
      onMouseOver={e => {
        e.currentTarget.style.transform = 'translateY(-5px)';
        e.currentTarget.style.boxShadow = '0 16px 36px rgba(0,0,0,0.14)';
        e.currentTarget.style.borderColor = 'rgba(79,70,229,0.3)';
      }}
      onMouseOut={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)';
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.8)';
      }}
    >
      {discount > 0 && (
        <div style={{
          position: 'absolute', top: 10, left: 10, zIndex: 10,
          background: 'linear-gradient(135deg,#ef4444,#dc2626)',
          color: '#fff', fontWeight: 800, fontSize: 10,
          borderRadius: 8, padding: '3px 9px',
          boxShadow: '0 2px 8px rgba(239,68,68,0.4)',
        }}>
          -{discount}%
        </div>
      )}
      <div style={{
        height: 155, background: 'linear-gradient(135deg,#f8fafc,#f1f5f9)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 14,
      }}>
        <img
          src={p.imageURL || p.image} alt={p.name}
          style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', transition: 'transform 0.3s' }}
        />
      </div>
      <div style={{ padding: '12px 14px 15px' }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: '#111827', marginBottom: 4, lineHeight: 1.35 }}>{p.name}</div>
        {p.weight && <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500, marginBottom: 8 }}>{p.weight}</div>}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 17, fontWeight: 900, color: '#16a34a' }}>₹{finalPrice}</span>
          {discount > 0 && <span style={{ fontSize: 12, color: '#9ca3af', textDecoration: 'line-through' }}>₹{origPrice}</span>}
          {discount > 0 && (
            <span style={{
              fontSize: 10, fontWeight: 700, color: '#16a34a',
              background: '#dcfce7', borderRadius: 6, padding: '2px 7px',
            }}>
              Save ₹{(origPrice - finalPrice).toFixed(0)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Countdown Block ───────────────────────────────────────────────────── */
function CountdownBlock({ value, label }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.12)',
      border: '1px solid rgba(255,255,255,0.2)',
      borderRadius: 12, padding: '10px 16px',
      textAlign: 'center', minWidth: 58,
      backdropFilter: 'blur(8px)',
    }}>
      <div style={{ fontSize: 22, fontWeight: 900, color: '#fbbf24', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
      <div style={{ fontSize: 9, color: '#c7d2fe', fontWeight: 700, marginTop: 4, letterSpacing: 1 }}>{label}</div>
    </div>
  );
}

/* ── Deal of the Week ──────────────────────────────────────────────────── */
function DealOfWeekSection({ deals }) {
  if (!deals.length) return null;

  const getSecondsLeft = () => {
    const now = new Date(), next = new Date(now);
    next.setDate(now.getDate() + (7 - now.getDay()));
    next.setHours(0, 0, 0, 0);
    return Math.floor((next - now) / 1000);
  };
  const [seconds, setSeconds] = useState(getSecondsLeft);
  useEffect(() => {
    const t = setInterval(() => setSeconds(s => (s > 0 ? s - 1 : getSecondsLeft())), 1000);
    return () => clearInterval(t);
  }, []);

  const d = String(Math.floor(seconds / 86400)).padStart(2, '0');
  const h = String(Math.floor((seconds % 86400) / 3600)).padStart(2, '0');
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');

  return (
    <section style={{
      padding: '38px 38px 46px',
      background: 'linear-gradient(135deg,#0f0f4e 0%,#1a1a6e 40%,#2d2d8e 75%,#1e1e70 100%)',
      borderRadius: 24, marginBottom: 56,
      boxShadow: '0 8px 40px rgba(26,26,110,0.28), inset 0 1px 0 rgba(255,255,255,0.08)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Background accent orbs */}
      <div style={{ position: 'absolute', top: -60, right: -60, width: 240, height: 240, borderRadius: '50%', background: 'rgba(79,70,229,0.15)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -40, left: '30%', width: 180, height: 180, borderRadius: '50%', background: 'rgba(251,191,36,0.06)', pointerEvents: 'none' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16, position: 'relative', zIndex: 1 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(251,191,36,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Tag size={13} color="#fbbf24" />
            </div>
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2.5, textTransform: 'uppercase', color: '#a5b4fc' }}>LIMITED TIME</span>
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.3px' }}>🏷️ Deal of the Week</h2>
          <p style={{ fontSize: 13, color: '#a5b4fc', marginTop: 6, fontWeight: 500 }}>Exclusive discounts — refreshed every week</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <CountdownBlock value={d} label="DAYS" />
          <span style={{ color: '#fbbf24', fontWeight: 900, fontSize: 20 }}>:</span>
          <CountdownBlock value={h} label="HRS" />
          <span style={{ color: '#fbbf24', fontWeight: 900, fontSize: 20 }}>:</span>
          <CountdownBlock value={m} label="MIN" />
          <span style={{ color: '#fbbf24', fontWeight: 900, fontSize: 20 }}>:</span>
          <CountdownBlock value={s} label="SEC" />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(175px,1fr))', gap: 15, position: 'relative', zIndex: 1 }}>
        {deals.map(p => <DealCard key={p.id} p={p} />)}
      </div>
    </section>
  );
}

/* ── Featured Category Card ────────────────────────────────────────────── */
function FeaturedCategoryCard({ cat, navigate }) {
  return (
    <div
      onClick={() => navigate(`/category/${cat.id}`)}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        background: '#fff', borderRadius: 16, padding: '16px 10px',
        border: '1px solid #f1f5f9', cursor: 'pointer',
        transition: 'all 0.22s',
        boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
      }}
      onMouseOver={e => {
        e.currentTarget.style.transform = 'translateY(-5px)';
        e.currentTarget.style.boxShadow = '0 12px 28px rgba(79,70,229,0.12)';
        e.currentTarget.style.borderColor = '#c7d2fe';
      }}
      onMouseOut={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 1px 6px rgba(0,0,0,0.05)';
        e.currentTarget.style.borderColor = '#f1f5f9';
      }}
    >
      <div style={{
        width: 64, height: 64,
        background: 'linear-gradient(135deg,#f5f3ff,#ede9fe)',
        borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10,
      }}>
        <img src={cat.imageURL} alt={cat.name} style={{ width: 46, height: 46, objectFit: 'contain' }} />
      </div>
      <div style={{ fontWeight: 700, fontSize: 12, color: '#111827', textAlign: 'center', lineHeight: 1.3 }}>{cat.name}</div>
      <div style={{ fontSize: 10.5, color: '#9ca3af', fontWeight: 600, marginTop: 3 }}>
        {cat.productCount ?? cat.products?.length ?? 0} Products
      </div>
    </div>
  );
}

/* ── Trust Bar Item ────────────────────────────────────────────────────── */
function TrustItem({ icon, title, sub, isLast }) {
  return (
    <div style={{
      padding: '20px 16px', textAlign: 'center',
      borderRight: isLast ? 'none' : '1px solid #f1f5f9',
      transition: 'background 0.2s',
    }}
      onMouseOver={e => e.currentTarget.style.background = '#fafbff'}
      onMouseOut={e => e.currentTarget.style.background = 'transparent'}
    >
      <div style={{
        width: 44, height: 44,
        background: 'linear-gradient(135deg,#f0f4ff,#e8ecff)',
        borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 10px',
      }}>
        {icon}
      </div>
      <div style={{ fontWeight: 800, fontSize: 13, color: '#111827', marginBottom: 3 }}>{title}</div>
      <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>{sub}</div>
    </div>
  );
}

/* ── Main Home ─────────────────────────────────────────────────────────── */
export default function Home() {
  const [categories,         setCategories]         = useState([]);
  const [trendingProducts,   setTrendingProducts]   = useState([]);
  const [mostBought,         setMostBought]         = useState([]);
  const [buyAgain,           setBuyAgain]           = useState([]);
  const [trendingCategories, setTrendingCategories] = useState([]);
  const [deals,              setDeals]              = useState([]);
  const [heroSlide,          setHeroSlide]          = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();

  const HERO_SLIDES = [
    {
      heading: 'Daily Grocery Order and\nGet Express Delivery',
      sub: 'Limited-Time Offers on Quick and Easy Meals — Ends Soon!',
      btn: 'Explore Shop',
      bg: 'linear-gradient(135deg, #d4edda 0%, #c8e6c9 40%, #dcedc8 100%)',
    },
    {
      heading: 'Fresh Vegetables &\nFarm Produce Daily',
      sub: 'Direct from farms to your doorstep — zero middlemen',
      btn: 'Shop Fresh',
      bg: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 40%, #dcedc8 100%)',
    },
    {
      heading: 'Rice, Dal & Grains\nat Kirana Prices',
      sub: 'Your neighbourhood store, now delivered to your home',
      btn: 'Order Now',
      bg: 'linear-gradient(135deg, #f1f8e9 0%, #dcedc8 40%, #c8e6c9 100%)',
    },
  ];

  const H = HERO_SLIDES[heroSlide];

  useEffect(() => {
    const t = setInterval(() => setHeroSlide(s => (s + 1) % HERO_SLIDES.length), 5500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    (async () => {
      try { const r = await api.get('/categories');                             setCategories(r.data); }         catch(e) {}
      try { const r = await api.get('/analytics/trending-products?limit=5');   setTrendingProducts(r.data); }   catch(e) {}
      try { const r = await api.get('/analytics/most-bought?limit=5');         setMostBought(r.data); }         catch(e) {}
      try { const r = await api.get('/analytics/trending-categories?limit=5'); setTrendingCategories(r.data); } catch(e) {}
      try { const r = await api.get('/deals');                                  setDeals(r.data); }              catch(e) {}
    })();
  }, []);

  useEffect(() => {
    if (!user) return;
    api.get(`/analytics/buy-again/${user.id}?limit=5`).then(r => setBuyAgain(r.data)).catch(() => {});
  }, [user]);

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px 0' }}>

        {/* ══ HERO ══════════════════════════════════════════════════════════ */}
        <section style={{ marginBottom: 10, position: 'relative' }}>
          <div style={{
            background: H.bg,
            borderRadius: 28,
            padding: '52px 72px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: 32, position: 'relative', overflow: 'hidden',
            minHeight: 280,
            transition: 'background 0.8s ease',
            boxShadow: '0 4px 32px rgba(22,163,74,0.10)',
            border: '1px solid rgba(255,255,255,0.7)',
          }}>
            {/* Dot pattern */}
            <div style={{
              position: 'absolute', inset: 0, opacity: 0.05,
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23166534'%3E%3Ccircle cx='8' cy='8' r='3'/%3E%3Ccircle cx='28' cy='8' r='3'/%3E%3Ccircle cx='8' cy='28' r='3'/%3E%3Ccircle cx='28' cy='28' r='3'/%3E%3C/g%3E%3C/svg%3E")`,
              pointerEvents: 'none',
            }} />

            {/* Fresh badge */}
            <div style={{
              position: 'absolute', top: 20, right: 20,
              background: '#1a1a6e', color: '#fff',
              fontSize: 10, fontWeight: 800, padding: '5px 12px',
              borderRadius: 20, letterSpacing: 1.5, textTransform: 'uppercase',
              boxShadow: '0 2px 10px rgba(26,26,110,0.3)',
            }}>⚡ Express Delivery</div>

            {/* Left text */}
            <div style={{ flex: '0 0 50%', zIndex: 2 }}>
              {/* Small label */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
                <div style={{ width: 28, height: 2, background: '#1a1a6e', borderRadius: 1 }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#1a1a6e', letterSpacing: 2, textTransform: 'uppercase' }}>KiranaKart</span>
              </div>
              <h1 style={{
                fontSize: 36, fontWeight: 900, lineHeight: 1.15,
                color: '#1a1a6e', margin: '0 0 14px 0',
                whiteSpace: 'pre-line', letterSpacing: '-0.5px',
              }}>
                {H.heading}
              </h1>
              <p style={{ fontSize: 14, color: '#4a5568', fontWeight: 500, margin: '0 0 28px 0', maxWidth: 380, lineHeight: 1.65 }}>
                {H.sub}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button
                  onClick={() => navigate('/products')}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 9,
                    background: '#1a1a6e', color: '#fff', border: 'none',
                    padding: '13px 28px', borderRadius: 50,
                    fontSize: 14, fontWeight: 700, cursor: 'pointer',
                    boxShadow: '0 6px 20px rgba(26,26,110,0.35)',
                    transition: 'transform 0.2s, box-shadow 0.2s, background 0.2s',
                  }}
                  onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(26,26,110,0.45)'; e.currentTarget.style.background = '#2d2d8e'; }}
                  onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(26,26,110,0.35)'; e.currentTarget.style.background = '#1a1a6e'; }}
                >
                  {H.btn}
                  <ShoppingCart size={16} />
                </button>
                <button
                  onClick={() => navigate('/offers')}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 7,
                    background: 'rgba(255,255,255,0.8)', color: '#1a1a6e',
                    border: '1.5px solid rgba(26,26,110,0.2)', padding: '12px 20px',
                    borderRadius: 50, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseOver={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#1a1a6e'; }}
                  onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.8)'; e.currentTarget.style.borderColor = 'rgba(26,26,110,0.2)'; }}
                >
                  View Deals →
                </button>
              </div>
            </div>

            {/* Right image */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', zIndex: 2 }}>
              <img
                src="/Kirana-store2.png" alt="Fresh Groceries"
                style={{ width: '100%', maxWidth: 420, height: 'auto', maxHeight: 240, objectFit: 'contain', filter: 'drop-shadow(0 12px 28px rgba(0,0,0,0.15))', animation: 'heroFloat 4s ease-in-out infinite' }}
                onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }}
              />
              <div style={{ display: 'none', fontSize: 100, textAlign: 'center', filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.15))', animation: 'heroFloat 4s ease-in-out infinite' }}>
                🍊🍌🍇🥦
              </div>
            </div>

            {/* Prev / Next arrows inside banner */}
            {[
              { dir: -1, side: { left: 16 }, label: 'prev' },
              { dir: 1,  side: { right: 16 }, label: 'next' },
            ].map(({ dir, side, label }) => (
              <button
                key={label}
                onClick={() => setHeroSlide(s => (s + dir + HERO_SLIDES.length) % HERO_SLIDES.length)}
                style={{
                  position: 'absolute', top: '50%', transform: 'translateY(-50%)', ...side,
                  background: 'rgba(255,255,255,0.9)',
                  border: '1.5px solid rgba(255,255,255,0.7)',
                  borderRadius: '50%', width: 40, height: 40,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', zIndex: 10,
                  boxShadow: '0 3px 12px rgba(0,0,0,0.12)',
                  transition: 'all 0.2s',
                }}
                onMouseOver={e => { e.currentTarget.style.background = '#1a1a6e'; e.currentTarget.style.borderColor = '#1a1a6e'; e.currentTarget.querySelector('svg').setAttribute('color', '#fff'); }}
                onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.9)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.7)'; e.currentTarget.querySelector('svg').setAttribute('color', '#374151'); }}
              >
                {dir === -1 ? <ChevronLeft size={18} color="#374151" /> : <ChevronRight size={18} color="#374151" />}
              </button>
            ))}
          </div>

          {/* Scroll arrow */}
          <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', zIndex: 5, marginTop: -24 }}>
            <div style={{ position: 'relative', display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                position: 'absolute', bottom: -8, left: '50%', transform: 'translateX(-50%)',
                width: 80, height: 35, background: H.bg, borderRadius: '0 0 40px 40px',
                zIndex: 1, transition: 'background 0.8s ease',
              }} />
              <div
                onClick={() => window.scrollBy({ top: 400, behavior: 'smooth' })}
                style={{
                  width: 48, height: 48, borderRadius: '50%', background: '#1a1a6e',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 6px 20px rgba(26,26,110,0.4)', cursor: 'pointer',
                  border: '3px solid white', animation: 'scrollBounce 2s ease-in-out infinite',
                  position: 'relative', zIndex: 2, transition: 'all 0.3s',
                }}
                onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.background = '#2d2d8e'; }}
                onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = '#1a1a6e'; }}
              >
                <ChevronDown size={24} color="#fff" strokeWidth={2.5} />
              </div>
            </div>
          </div>

          {/* Slide dots */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 20 }}>
            {HERO_SLIDES.map((_, i) => (
              <button key={i} onClick={() => setHeroSlide(i)} style={{
                width: i === heroSlide ? 28 : 8, height: 8, borderRadius: 8,
                background: i === heroSlide ? '#1a1a6e' : '#d1d5db',
                border: 'none', cursor: 'pointer', transition: 'all 0.3s', padding: 0,
              }} />
            ))}
          </div>
        </section>

        {/* ══ FEATURED CATEGORIES ROW ═══════════════════════════════════════ */}
        {categories.length > 0 && (
          <section style={{ padding: '0 0 40px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(categories.length, 6)}, 1fr)`, gap: 14 }}>
              {categories.slice(0, 6).map(cat => (
                <FeaturedCategoryCard key={cat.id} cat={cat} navigate={navigate} />
              ))}
            </div>
          </section>
        )}

        {/* ══ PROMOTIONAL BANNERS ══════════════════════════════════════════ */}
        <section style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 18, marginBottom: 44 }}>
          {/* Main promo */}
          <div
            onClick={() => navigate('/offers')}
            style={{
              background: 'linear-gradient(135deg, #1a1a6e 0%, #2d2d8e 50%, #4338ca 100%)',
              borderRadius: 20, padding: '32px 36px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              cursor: 'pointer', position: 'relative', overflow: 'hidden',
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: '0 4px 24px rgba(26,26,110,0.25)',
            }}
            onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.015)'; e.currentTarget.style.boxShadow = '0 10px 36px rgba(26,26,110,0.35)'; }}
            onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(26,26,110,0.25)'; }}
          >
            <div style={{ position: 'absolute', right: -50, top: -50, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
            <div style={{ position: 'absolute', left: '40%', bottom: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#a5b4fc', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>🔥 Hot Deals</div>
              <div style={{ fontSize: 30, fontWeight: 900, color: '#fbbf24', lineHeight: 1 }}>Price Drop</div>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#fff', marginTop: 6, maxWidth: 300 }}>Discount on the products! Check it out!</div>
              <button style={{
                marginTop: 20, background: '#fff', color: '#1a1a6e',
                border: 'none', padding: '10px 22px', borderRadius: 50,
                fontSize: 13, fontWeight: 800, cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}>Shop Now →</button>
            </div>
            <div style={{ fontSize: 68, opacity: 0.7, position: 'relative', zIndex: 1 }}>🛒</div>
          </div>

          {/* Side promo */}
          <div
            onClick={() => navigate('/products')}
            style={{
              background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
              borderRadius: 20, padding: '24px 22px',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              cursor: 'pointer', border: '1px solid #fcd34d',
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: '0 2px 12px rgba(234,179,8,0.15)',
            }}
            onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.015)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(234,179,8,0.25)'; }}
            onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(234,179,8,0.15)'; }}
          >
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, color: '#92400e', letterSpacing: 1.8, textTransform: 'uppercase' }}>All Fixed Stars</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#78350f', marginTop: 6, lineHeight: 1.35 }}>Dark Wash Face Wash<br />& Daily Essentials</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{
                background: 'linear-gradient(135deg,#ef4444,#dc2626)',
                color: '#fff', width: 52, height: 52, borderRadius: '50%',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(239,68,68,0.35)',
              }}>
                <div style={{ fontSize: 16, fontWeight: 900, lineHeight: 1 }}>10%</div>
                <div style={{ fontSize: 9, fontWeight: 700 }}>Off</div>
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#92400e' }}>Shop Now →</span>
            </div>
          </div>
        </section>

        {/* ══ TRUST BAR ════════════════════════════════════════════════════ */}
        <section style={{
          display: 'grid', gridTemplateColumns: 'repeat(4,1fr)',
          background: '#fff', borderRadius: 18, marginBottom: 44,
          border: '1px solid #f1f5f9',
          boxShadow: '0 2px 16px rgba(0,0,0,0.04)', overflow: 'hidden',
        }}>
          <TrustItem icon={<Zap size={20} color="#4f46e5" />}     title="30-Min Delivery" sub="Express to your doorstep" />
          <TrustItem icon={<Tag size={20} color="#16a34a" />}      title="Best Prices"     sub="No middlemen, no markup" />
          <TrustItem icon={<Shield size={20} color="#f59e0b" />}   title="Freshly Packed"  sub="Quality checked always" />
          <TrustItem icon={<RotateCw size={20} color="#ec4899" />} title="Easy Returns"    sub="Hassle-free 7-day returns" isLast />
        </section>

        {/* ══ FULL CATEGORY GRID ════════════════════════════════════════════ */}
        {categories.length > 0 && (
          <section style={{ padding: '0 0 48px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                  <div style={{ width: 3, height: 16, borderRadius: 2, background: 'linear-gradient(180deg,#1a1a6e,#4f46e5)' }} />
                  <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2.5, textTransform: 'uppercase', color: '#9ca3af', margin: 0 }}>BROWSE</p>
                </div>
                <h2 style={{ fontSize: 24, fontWeight: 900, color: '#111827', margin: 0, letterSpacing: '-0.3px' }}>Shop by Category</h2>
              </div>
              <button
                onClick={() => navigate('/categories')}
                style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'transparent', border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '8px 16px', fontWeight: 700, fontSize: 12, color: '#374151', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseOver={e => { e.currentTarget.style.background = '#1a1a6e'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#1a1a6e'; }}
                onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#374151'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
              >
                View All <ArrowRight size={13} />
              </button>
            </div>

            <div style={{ position: 'relative' }}>
              <div id="cat-scroll" style={{ display: 'flex', gap: 22, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 6, scrollBehavior: 'smooth' }}>
                {categories.map(cat => (
                  <div key={cat.id} onClick={() => navigate(`/category/${cat.id}`)}
                    style={{ flexShrink: 0, width: 145, background: '#fff', borderRadius: 16, overflow: 'hidden', cursor: 'pointer', border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', transition: 'all 0.22s' }}
                    onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 12px 28px rgba(79,70,229,0.12)'; e.currentTarget.style.borderColor = '#c7d2fe'; }}
                    onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)'; e.currentTarget.style.borderColor = '#f1f5f9'; }}
                  >
                    <div style={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#f8fafc,#f1f5f9)', padding: 12 }}>
                      <img src={cat.imageURL} alt={cat.name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                    </div>
                    <div style={{ padding: '9px 11px 12px' }}>
                      <div style={{ fontWeight: 700, fontSize: 12.5, color: '#111827' }}>{cat.name}</div>
                      <div style={{ fontSize: 10.5, color: '#9ca3af', fontWeight: 600, marginTop: 2 }}>{cat.productCount ?? 0} items</div>
                    </div>
                  </div>
                ))}
              </div>
              {[{ dir: -1, side: { left: -16 } }, { dir: 1, side: { right: -16 } }].map(({ dir, side }) => (
                <button key={dir}
                  onClick={() => document.getElementById('cat-scroll').scrollBy({ left: dir * 500, behavior: 'smooth' })}
                  style={{ position: 'absolute', top: '45%', transform: 'translateY(-50%)', ...side, background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,0.10)', zIndex: 10, color: '#6b7280', transition: 'all 0.2s' }}
                  onMouseOver={e => { e.currentTarget.style.background = '#1a1a6e'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#1a1a6e'; }}
                  onMouseOut={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                >
                  {dir === -1 ? <ChevronLeft size={15} /> : <ChevronRight size={15} />}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ══ DEAL OF THE WEEK ══════════════════════════════════════════════ */}
        <DealOfWeekSection deals={deals} />

        {/* ══ FESTIVAL + ML ═════════════════════════════════════════════════ */}
        <FestivalOfferSection />
        {user && <RecommendedSection />}
        {user && <FrequentlyViewedSection />}

        {/* ══ PRODUCT SECTIONS ══════════════════════════════════════════════ */}
        {trendingProducts.length > 0 && (
          <ProductSection
            icon={<Flame size={18} color="#ef4444" />}
            label="TRENDING NOW" title="🔥 Hot This Week"
            products={trendingProducts}
          />
        )}
        {mostBought.length > 0 && (
          <ProductSection
            icon={<Star size={18} color="#f59e0b" fill="#f59e0b" />}
            label="BESTSELLERS" title="🏆 Most Bought"
            products={mostBought}
          />
        )}
        {user && buyAgain.length > 0 && (
          <ProductSection
            icon={<RotateCcw size={18} color="#8b5cf6" />}
            label="REORDER" title="🔁 Buy Again"
            products={buyAgain} subtitle="Based on your previous purchases"
          />
        )}

        {trendingCategories.length > 0 && (
          <section style={{ padding: '0 0 60px' }}>
            <SectionHeader icon={<TrendingUp size={18} color="#4f46e5" />} label="POPULAR" title="📈 Trending Categories" />
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(trendingCategories.length, 6)}, 1fr)`, gap: 14, marginTop: 20 }}>
              {trendingCategories.map(cat => (
                <div key={cat.id} onClick={() => navigate(`/category/${cat.id}`)}
                  style={{ background: '#fff', borderRadius: 16, padding: 16, cursor: 'pointer', textAlign: 'center', border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', transition: 'all 0.22s' }}
                  onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 12px 28px rgba(79,70,229,0.12)'; e.currentTarget.style.borderColor = '#c7d2fe'; }}
                  onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)'; e.currentTarget.style.borderColor = '#f1f5f9'; }}
                >
                  <img src={cat.imageURL} alt={cat.name} style={{ height: 56, width: 56, objectFit: 'contain', margin: '0 auto 8px' }} />
                  <div style={{ fontWeight: 700, fontSize: 12.5, color: '#111827' }}>{cat.name}</div>
                  <div style={{ fontSize: 10.5, color: '#9ca3af', fontWeight: 600, marginTop: 3 }}>{cat.totalOrders} orders</div>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>

      <style>{`
        ::-webkit-scrollbar { display: none; }
        @keyframes heroFloat { 0%,100%{ transform:translateY(0); } 50%{ transform:translateY(-12px); } }
        @keyframes scrollBounce { 0%,100%{ transform:translateY(0); } 50%{ transform:translateY(6px); } }
      `}</style>
    </div>
  );
}