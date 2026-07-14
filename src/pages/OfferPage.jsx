import React, { useState, useEffect } from 'react'
import { Tag, Flame, Gift, Percent } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import api from '../Api'

const FILTER_TABS = [
  { key: 'all', label: 'All Offers', icon: Tag },
  { key: 'normal', label: 'Flash Deals', icon: Flame },
  { key: 'festival', label: 'Festival Offers', icon: Gift },
  { key: 'deal', label: 'Deal of the Week', icon: Percent },
]

export default function OffersPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')


  

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    const fetchOffers = async () => {
      setLoading(true)
      try {
        const { data } = await api.get('/all-offers')
        setProducts(data)
      } catch (error) {
        console.error('Failed to fetch offers:', error)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }
    fetchOffers()
  }, [])

  const filtered = products.filter(p => {
    if (activeTab === 'normal') return p.normalOffer
    if (activeTab === 'festival') return p.festivalOffer
    if (activeTab === 'deal') return p.dealOfWeek
    return true
  })

  const counts = {
    all: products.length,
    normal: products.filter(p => p.normalOffer).length,
    festival: products.filter(p => p.festivalOffer).length,
    deal: products.filter(p => p.dealOfWeek).length,
  }

  return (
    <div style={{ background: '#f9fafb', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px' }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#111827', margin: 0 }}>
            Offers & Deals
          </h1>
          <p style={{ color: '#6b7280', fontSize: 13, margin: '6px 0 0' }}>
            {products.length} products on sale
          </p>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 32, flexWrap: 'wrap' }}>
          {FILTER_TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 20px',
                borderRadius: 30,
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 13,
                background: activeTab === key ? '#1e3a8a' : '#fff',
                color: activeTab === key ? '#fff' : '#6b7280',
                border: activeTab === key ? 'none' : '1px solid #e5e7eb',
                transition: 'all 0.2s',
                boxShadow: activeTab === key ? '0 2px 8px rgba(30,58,138,0.2)' : 'none',
              }}
            >
              <Icon size={14} />
              {label}
              <span style={{
                background: activeTab === key ? 'rgba(255,255,255,0.25)' : '#f3f4f6',
                color: activeTab === key ? '#fff' : '#6b7280',
                borderRadius: 20,
                padding: '2px 8px',
                fontSize: 11,
                fontWeight: 600,
                marginLeft: 4,
              }}>
                {counts[key] || 0}
              </span>
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
            {[...Array(8)].map((_, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 12, height: 300, border: '1px solid #f0f0f0' }}>
                <div style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, #f3f4f6 25%, #e9ecef 50%, #f3f4f6 75%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.4s infinite',
                }} />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: '#fff', borderRadius: 12, border: '1px solid #f0f0f0' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🏷️</div>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: '#111827', marginBottom: 8 }}>No offers found</h3>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>Try switching to a different category</p>
            <button
              onClick={() => setActiveTab('all')}
              style={{
                padding: '8px 24px',
                background: '#1e3a8a',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#1e40af'}
              onMouseOut={(e) => e.currentTarget.style.background = '#1e3a8a'}
            >
              Show all offers
            </button>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(4, 1fr)', 
            gap: '40px 40px',
          }}>
            {filtered.map(p => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  )
}