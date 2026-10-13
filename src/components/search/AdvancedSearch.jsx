import { useState, useEffect } from 'react'
import { Search, MapPin, Filter, X, SlidersHorizontal } from 'lucide-react'
import { supabase } from '../../services/supabase'
import toast from 'react-hot-toast'

export default function AdvancedSearch() {
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('')
  const [category, setCategory] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [minRating, setMinRating] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [provinces, setProvinces] = useState([])

  useEffect(() => {
    const loadProvinces = async () => {
      const { data } = await supabase.from('destinations').select('province')
      const uniqueProvinces = [...new Set(data?.map(d => d.province) || [])]
      setProvinces(uniqueProvinces)
    }
    loadProvinces()
  }, [])

  const handleSearch = async () => {
    setLoading(true)
    try {
      let destinationsQuery = supabase.from('destinations').select('*')
      let hotelsQuery = supabase.from('hotels').select('*')
      let restaurantsQuery = supabase.from('restaurants').select('*')

      // Aplicar filtros de texto
      if (query) {
        destinationsQuery = destinationsQuery.ilike('name', `%${query}%`)
        hotelsQuery = hotelsQuery.ilike('name', `%${query}%`)
        restaurantsQuery = restaurantsQuery.ilike('name', `%${query}%`)
      }

      // Filtrar por localização
      if (location) {
        destinationsQuery = destinationsQuery.eq('province', location)
        hotelsQuery = hotelsQuery.eq('province', location)
        restaurantsQuery = restaurantsQuery.eq('province', location)
      }

      // Filtrar por preço
      if (minPrice) {
        hotelsQuery = hotelsQuery.gte('price', Number(minPrice))
      }
      if (maxPrice) {
        hotelsQuery = hotelsQuery.lte('price', Number(maxPrice))
      }

      // Filtrar por avaliação
      if (minRating) {
        destinationsQuery = destinationsQuery.gte('rating', Number(minRating))
        hotelsQuery = hotelsQuery.gte('rating', Number(minRating))
        restaurantsQuery = restaurantsQuery.gte('rating', Number(minRating))
      }

      const [destRes, hotelRes, restRes] = await Promise.all([
        destinationsQuery.limit(5),
        hotelsQuery.limit(5),
        restaurantsQuery.limit(5),
      ])

      const allResults = [
        ...(destRes.data || []).map(d => ({ ...d, type: 'destino' })),
        ...(hotelRes.data || []).map(h => ({ ...h, type: 'hotel' })),
        ...(restRes.data || []).map(r => ({ ...r, type: 'restaurante' })),
      ]

      setResults(allResults)
    } catch (err) {
      console.error('Erro na busca:', err)
      toast.error('Erro ao pesquisar')
    } finally {
      setLoading(false)
    }
  }

  const clearFilters = () => {
    setQuery('')
    setLocation('')
    setCategory('')
    setMinPrice('')
    setMaxPrice('')
    setMinRating('')
    setResults([])
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Barra de busca */}
      <div style={{
        display: 'flex', gap: '10px', flexWrap: 'wrap',
        background: 'white', borderRadius: '16px', padding: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
      }}>
        <div style={{ flex: 2, minWidth: '200px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#b0a590' }} />
          <input
            className="input-field"
            placeholder="O que procura? (hotel, restaurante, destino...)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ paddingLeft: '42px' }}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>

        <div style={{ flex: 1, minWidth: '150px', position: 'relative' }}>
          <MapPin size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#b0a590', zIndex: 1 }} />
          <select className="input-field" value={location} onChange={(e) => setLocation(e.target.value)} style={{ paddingLeft: '42px' }}>
            <option value="">Todas as províncias</option>
            {provinces.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        <button onClick={handleSearch} className="btn-primary" disabled={loading}
          style={{ padding: '12px 28px', fontWeight: 700 }}>
          {loading ? 'Buscando...' : 'Pesquisar'}
        </button>

        <button onClick={() => setShowFilters(!showFilters)}
          style={{
            padding: '12px', borderRadius: '12px',
            border: '1.5px solid #e0d8cc', background: 'white',
            cursor: 'pointer', color: '#555',
            display: 'flex', alignItems: 'center', gap: '6px',
          }}>
          <SlidersHorizontal size={16} /> Filtros
        </button>
      </div>

      {/* Painel de filtros */}
      {showFilters && (
        <div style={{
          background: 'white', borderRadius: '16px', padding: '20px',
          marginTop: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '12px',
        }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#555', display: 'block', marginBottom: '4px' }}>Preço mínimo (Kz)</label>
            <input type="number" className="input-field" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="0" />
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#555', display: 'block', marginBottom: '4px' }}>Preço máximo (Kz)</label>
            <input type="number" className="input-field" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="100000" />
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#555', display: 'block', marginBottom: '4px' }}>Avaliação mínima</label>
            <select className="input-field" value={minRating} onChange={(e) => setMinRating(e.target.value)}>
              <option value="">Qualquer</option>
              <option value="4.5">4.5+</option>
              <option value="4">4+</option>
              <option value="3.5">3.5+</option>
              <option value="3">3+</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button onClick={clearFilters} style={{
              width: '100%', padding: '10px', borderRadius: '10px',
              border: 'none', background: 'rgba(220,38,38,0.06)',
              color: '#dc2626', fontWeight: 600, cursor: 'pointer',
            }}>
              Limpar filtros
            </button>
          </div>
        </div>
      )}

      {/* Resultados */}
      {results.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <p style={{ fontSize: '14px', color: '#777', marginBottom: '12px' }}>
            {results.length} resultados encontrados
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {results.map((result, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '16px',
                background: 'white', borderRadius: '14px', padding: '16px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
              }}>
                <img src={result.image} alt={result.name}
                  style={{ width: '60px', height: '60px', borderRadius: '10px', objectFit: 'cover' }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, margin: 0 }}>{result.name}</p>
                  <p style={{ fontSize: '13px', color: '#777', margin: 0 }}>
                    {result.province} • {result.type}
                  </p>
                </div>
                {result.rating && (
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#f59e0b' }}>
                    ★ {result.rating}
                  </span>
                )}
                {result.price && (
                  <span style={{ fontWeight: 700, color: '#7A1830' }}>
                    {result.price.toLocaleString()} Kz
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}