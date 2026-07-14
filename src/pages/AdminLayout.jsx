import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
   Package, Grid, Users,
  ShoppingCart, Tag, Sparkles, ChevronRight
} from 'lucide-react';

const navItems = [
  { to: '/admin/products',   icon: Package,         label: 'Products'             },
  { to: '/admin/categories', icon: Grid,            label: 'Categories'           },
  { to: '/admin/users',      icon: Users,           label: 'Users'                },
  { to: '/admin/orders',     icon: ShoppingCart,    label: 'Orders'               },
  { to: '/admin/deals',      icon: Tag,             label: 'Deals'                },
  { to: '/admin/festivals',  icon: Sparkles,        label: 'Festivals'            },
];

export default function AdminLayout() {
  const navigate = useNavigate();

  return (
    <div
      className="flex min-h-screen"
      style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", background: '#f0f4ff' }}
    >
      {/* ── Sidebar ── */}
      <aside
        className="w-64 flex-shrink-0 flex flex-col sticky top-0 h-screen overflow-hidden"
        style={{
          background: 'linear-gradient(175deg, #1e3a8a 0%, #1d4ed8 45%, #2563eb 100%)',
          boxShadow: '4px 0 24px rgba(30,58,138,0.25)',
        }}
      >
        {/* Logo */}
        <div className="px-6 py-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}
            >
              <span className="text-white font-black text-lg">A</span>
            </div>
            <div>
              <p className="text-white font-bold text-base leading-tight">Admin Panel</p>
              <p className="text-blue-200 text-xs">Store Management</p>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                  isActive ? 'bg-white/20 backdrop-blur-sm shadow-sm' : 'hover:bg-white/10'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                      isActive ? 'bg-white/25' : 'bg-white/10 group-hover:bg-white/15'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <p className={`flex-1 text-sm font-semibold ${isActive ? 'text-white' : 'text-blue-100'}`}>
                    {label}
                  </p>
                  {isActive && <ChevronRight className="w-4 h-4 text-white/60 flex-shrink-0" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

      </aside>

      {/* ── Page content ── */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}