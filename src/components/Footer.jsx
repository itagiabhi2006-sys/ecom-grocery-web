// ================== Footer.jsx ==================
// Simple, compact, light theme — matches #1a1a6e navbar

import React from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, Mail, Phone, MapPin } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer style={{
      background: '#f8fafc',
      borderTop: '1px solid #e5e7eb',
      marginTop: 48,
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '36px 32px 0' }}>

        {/* ── Main Grid ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.8fr 1fr 1fr 1fr',
          gap: 36,
          paddingBottom: 32,
        }}>

          {/* ── Brand ── */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'linear-gradient(135deg, #1a1a6e, #4f46e5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <ShoppingBag size={15} color="#fff" strokeWidth={2.2} />
              </div>
              <span style={{ fontSize: 16, fontWeight: 800, color: '#1a1a6e', letterSpacing: '-0.4px' }}>
                Grocery's
              </span>
            </div>

            <p style={{ fontSize: 12.5, color: '#6b7280', lineHeight: 1.7, maxWidth: 240, marginBottom: 16 }}>
              By Abhishek Itagi. Your neighbourhood kirana store, now online. Fresh products delivered fast.
            </p>

            {/* Contact */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {[
                { Icon: Mail,   text: 'support@kirani.in' },
                { Icon: Phone,  text: '+91 99028 05132' },
                { Icon: MapPin, text: 'Kittur Karnataka 591115' },
              ].map(({ Icon, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <Icon size={12} color="#4f46e5" />
                  <span style={{ fontSize: 12, color: '#6b7280' }}>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Quick Links ── */}
          <div>
            <h4 style={colHeading}>Quick Links</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                { label: 'Home',       to: '/' },
                { label: 'Products',   to: '/products' },
                { label: 'Categories', to: '/categories' },
                { label: 'Deals',      to: '/offers' },
                { label: 'About Us',   to: '/about' },
              ].map(({ label, to }) => (
                <li key={to} style={{ marginBottom: 8 }}>
                  <Link to={to} style={linkStyle}
                    onMouseOver={e => e.currentTarget.style.color = '#1a1a6e'}
                    onMouseOut={e => e.currentTarget.style.color = '#6b7280'}
                  >{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Support ── */}
          <div>
            <h4 style={colHeading}>Support</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                { label: 'Help Center',   to: '/help' },
                { label: 'Contact Us',    to: '/contact' },
                { label: 'Shipping Info', to: '/shipping' },
                { label: 'Returns',       to: '/returns' },
                { label: 'Track Order',   to: '/my-order' },
              ].map(({ label, to }) => (
                <li key={to} style={{ marginBottom: 8 }}>
                  <Link to={to} style={linkStyle}
                    onMouseOver={e => e.currentTarget.style.color = '#1a1a6e'}
                    onMouseOut={e => e.currentTarget.style.color = '#6b7280'}
                  >{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Legal ── */}
          <div>
            <h4 style={colHeading}>Legal</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                { label: 'Privacy Policy',   to: '/privacy' },
                { label: 'Terms of Service', to: '/terms' },
                { label: 'Cookie Policy',    to: '/cookies' },
                { label: 'Seller Policy',    to: '/seller' },
              ].map(({ label, to }) => (
                <li key={to} style={{ marginBottom: 8 }}>
                  <Link to={to} style={linkStyle}
                    onMouseOver={e => e.currentTarget.style.color = '#1a1a6e'}
                    onMouseOut={e => e.currentTarget.style.color = '#6b7280'}
                  >{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Bottom Bar ── */}
        <div style={{
          borderTop: '1px solid #e5e7eb',
          padding: '14px 0 18px',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', flexWrap: 'wrap', gap: 10,
        }}>
          {/* Copyright */}
          <div style={{ fontSize: 12, color: '#9ca3af' }}>
            © {currentYear} Grocery's. All rights reserved.{' '}
            Made with <span style={{ color: '#4f46e5' }}>♥</span> in Mangaluru
          </div>

          {/* Payment badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 11, color: '#9ca3af', marginRight: 2 }}>We accept:</span>
            {['UPI', 'Razorpay', 'COD', 'Cards'].map(method => (
              <span key={method} style={{
                background: '#fff',
                border: '1px solid #e5e7eb',
                color: '#6b7280',
                fontSize: 10, fontWeight: 700,
                borderRadius: 5, padding: '2px 8px',
              }}>
                {method}
              </span>
            ))}
          </div>

          {/* Social icons */}
          <div style={{ display: 'flex', gap: 7 }}>
            {[
              { label: 'Facebook',  path: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
              { label: 'Twitter',   path: 'M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.213c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z' },
              { label: 'Instagram', path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' },
            ].map(({ label, path }) => (
              <a key={label} href="#" title={label} style={{
                width: 28, height: 28, borderRadius: 7,
                background: '#fff', border: '1px solid #e5e7eb',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#9ca3af', textDecoration: 'none', transition: 'all 0.18s',
              }}
                onMouseOver={e => {
                  e.currentTarget.style.background = '#ede9fe'
                  e.currentTarget.style.borderColor = '#c7d2fe'
                  e.currentTarget.style.color = '#4f46e5'
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = '#fff'
                  e.currentTarget.style.borderColor = '#e5e7eb'
                  e.currentTarget.style.color = '#9ca3af'
                }}
              >
                <svg width="13" height="13" fill="currentColor" viewBox="0 0 24 24">
                  <path d={path} />
                </svg>
              </a>
            ))}
          </div>
        </div>

      </div>
    </footer>
  )
}

const colHeading = {
  fontSize: 11,
  fontWeight: 800,
  color: '#111827',
  marginBottom: 13,
  letterSpacing: '0.8px',
  textTransform: 'uppercase',
}

const linkStyle = {
  fontSize: 12.5,
  color: '#6b7280',
  textDecoration: 'none',
  fontWeight: 500,
  transition: 'color 0.15s',
  display: 'inline-block',
}