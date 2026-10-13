import { useState, useMemo, useCallback } from 'react'

export function useSearch(items, options = {}) {
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState({})
  const [sortBy, setSortBy] = useState(options.defaultSort || 'relevance')

  const filteredItems = useMemo(() => {
    let result = [...items]

    if (query.trim()) {
      const q = query.toLowerCase()
      const fields = options.searchFields || ['name']
      result = result.filter((item) =>
        fields.some((field) => String(item[field] || '').toLowerCase().includes(q))
      )
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all' && value !== '') {
        result = result.filter((item) => item[key] === value)
      }
    })

    switch (sortBy) {
      case 'rating': result.sort((a, b) => b.rating - a.rating); break
      case 'name': result.sort((a, b) => a.name.localeCompare(b.name)); break
      case 'price-asc': result.sort((a, b) => a.price - b.price); break
      case 'price-desc': result.sort((a, b) => b.price - a.price); break
      default: break
    }

    return result
  }, [items, query, filters, sortBy, options.searchFields])

  const setFilter = useCallback((key, value) => setFilters((prev) => ({ ...prev, [key]: value })), [])
  const clearFilters = useCallback(() => { setFilters({}); setQuery(''); setSortBy('relevance') }, [])

  return { query, setQuery, filters, setFilter, sortBy, setSortBy, clearFilters, filteredItems, totalResults: filteredItems.length }
}