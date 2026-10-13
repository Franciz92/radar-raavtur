import { useState, useEffect } from 'react'
import { Search, MapPin, Hotel, Utensils, Compass } from 'lucide-react'
import { supabase } from '../../services/supabase'
import { useNavigate } from 'react-router-dom'

export default function AutocompleteSearch() {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([])
      return
    }

    const timer = setTimeout(async () => {
      try {
        const [destRes, hotelRes, restRes] = await Promise.all([
          supabase.from('destinations').select('id, name, province').ilike('name', `%${query}%`).limit(3),
          supabase.from('hotels').select('id, name, province').ilike('name', `%${query}%`).limit(3),
          supabase.from('restaurants').select('id, name, province').ilike('name', `%${query}%`).limit(3),
        ])

        const all = [
          ...(destRes.data || []).map(d => ({ ...d, type: 'destino', icon: Compass, path: `/destinos/${d.id}` })),
          ...(hotelRes.data || []).map(h => ({ ...h, type: 'hotel', icon: Hotel, path: `/hoteis/${h.id}` })),
          ...(restRes.data || []).map(r => ({ ...r, type: 'restaurante', icon: Utensils, path: `/restaurantes/${r.id}` })),
        ]
        setSuggestions(all)
      } catch (err) {
        console.error('Erro autocomplete:', err)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  const handleSelect = (item) => {
    setQuery('')
    setSuggestions([])
    setShowSuggestions(false)
    navigate(item.path)
  }

  return (
    <div style={{ position: 'relative', maxWidth: '500px', margin: '0 auto' }}>
      <div style={{ position: 'relative' }}>
        <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#b0a590' }} />
        <input
          className="input-field"
          placeholder="Buscar destinos, hotéis, restaurantes..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true) }}
          onFocus={() => setShowSuggestions(true)}
          style={{ paddingLeft: '44px', paddingRight: '16px' }}
        />
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
          background: 'white', borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
          zIndex: 100, overflow: 'hidden',
        }}>
          {suggestions.map((item, i) => (
            <button key={i} onClick={() => handleSelect(item)}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                width: '100%', padding: '14px 18px',
                border: 'none', background: 'transparent',
                cursor: 'pointer', textAlign: 'left',
                borderBottom: '1px solid #f5f0eb',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => e.target.style.background = '#fdfaf4'}
              onMouseLeave={(e) => e.target.style.background = 'transparent'}>
              <item.icon size={18} style={{ color: '#7A1830' }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, margin: 0, fontSize: '14px' }}>{item.name}</p>
                <p style={{ fontSize: '12px', color: '#999', margin: 0 }}>{item.province} • {item.type}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}