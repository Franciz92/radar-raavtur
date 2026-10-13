import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, ArrowRight, Search, Newspaper } from 'lucide-react'
import { getBlogPosts } from '../../services/blogService'

export default function BlogPage() {
  const [posts, setPosts] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const { data } = await getBlogPosts()
        setPosts(data || [])
        console.log('Posts carregados:', data?.length)
      } catch (err) {
        console.error('Erro:', err)
      } finally {
        setLoading(false)
      }
    }
    loadPosts()
  }, [])

  const filtered = posts.filter(p => {
    const q = search.toLowerCase()
    return (p.title?.toLowerCase().includes(q) || p.excerpt?.toLowerCase().includes(q))
  })

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recente'
    try {
      return new Date(dateStr).toLocaleDateString('pt-AO', { day: '2-digit', month: 'long', year: 'numeric' })
    } catch {
      return 'Recente'
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fdfaf4', padding: '50px 0' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* Cabeçalho */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span style={{
            display: 'inline-block', padding: '8px 20px', borderRadius: '100px',
            background: 'rgba(122,24,48,0.06)', color: '#7A1830',
            fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px',
            marginBottom: '16px',
          }}>
            Blog RAVTUR
          </span>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 38px)', fontWeight: 800, color: '#111315', marginBottom: '8px', fontFamily: "'DM Sans', sans-serif" }}>
            Notícias e Artigos de Turismo
          </h1>
          <p style={{ color: '#777', fontSize: '16px' }}>
            Descubra os melhores destinos e dicas de viagem
          </p>
        </div>

        {/* Pesquisa */}
        <div style={{ maxWidth: '400px', margin: '0 auto 32px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#b0a590' }} />
          <input
            className="input-field"
            placeholder="Pesquisar artigos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '42px' }}
          />
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <p style={{ color: '#999' }}>Carregando artigos...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <Newspaper size={60} style={{ color: '#d0c8b8', marginBottom: '16px' }} />
            <p style={{ color: '#999' }}>Nenhum artigo encontrado</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
          }}>
            {filtered.map((post) => (
              <Link key={post.id} to={`/blog/${post.id}`} style={{ textDecoration: 'none' }}>
                <article style={{
                  background: 'white', borderRadius: '16px', overflow: 'hidden',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                  transition: 'all 0.3s', height: '100%',
                }}
                onMouseEnter={(e) => { e.target.style.transform = 'translateY(-4px)'; e.target.style.boxShadow = '0 12px 40px rgba(0,0,0,0.08)' }}
                onMouseLeave={(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)' }}>
                  
                  <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
                    <img 
                      src={post.image || 'https://images.unsplash.com/photo-1577372844247-c5cf10a9f048?w=800&q=80'} 
                      alt={post.title} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                    <span style={{
                      position: 'absolute', top: '12px', left: '12px',
                      padding: '5px 12px', borderRadius: '100px',
                      background: 'rgba(122,24,48,0.9)', color: '#D4A72C',
                      fontSize: '11px', fontWeight: 700,
                    }}>
                      {post.category || 'Turismo'}
                    </span>
                  </div>

                  <div style={{ padding: '20px' }}>
                    <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#111315', marginBottom: '8px', lineHeight: 1.4 }}>
                      {post.title}
                    </h2>
                    <p style={{ fontSize: '14px', color: '#777', lineHeight: 1.6, marginBottom: '16px' }}>
                      {post.excerpt?.substring(0, 100) || 'Leia mais sobre este artigo...'}...
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#999' }}>
                        <Calendar size={13} /> {formatDate(post.created_at)}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 600, color: '#7A1830' }}>
                        Ler mais <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}