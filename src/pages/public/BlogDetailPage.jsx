import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Calendar, User, Tag } from 'lucide-react'
import { getBlogPostById } from '../../services/blogService'

export default function BlogDetailPage() {
  const { id } = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPost = async () => {
      try {
        const { data } = await getBlogPostById(id)
        setPost(data)
        console.log('Post carregado:', data?.title)
      } catch (err) {
        console.error('Erro:', err)
      } finally {
        setLoading(false)
      }
    }
    loadPost()
  }, [id])

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recente'
    try {
      return new Date(dateStr).toLocaleDateString('pt-AO', { day: '2-digit', month: 'long', year: 'numeric' })
    } catch {
      return 'Recente'
    }
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '80px', background: '#fdfaf4', minHeight: '100vh' }}>Carregando...</div>
  }

  if (!post) {
    return (
      <div style={{ textAlign: 'center', padding: '80px', background: '#fdfaf4', minHeight: '100vh' }}>
        <h2>Artigo não encontrado</h2>
        <Link to="/blog" style={{ color: '#7A1830', fontWeight: 600 }}>Voltar ao blog</Link>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fdfaf4', padding: '50px 0' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px' }}>
        
        <Link to="/blog" style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          color: '#7A1830', textDecoration: 'none', marginBottom: '24px', fontWeight: 600,
        }}>
          <ArrowLeft size={16} /> Voltar ao blog
        </Link>

        <img 
          src={post.image || 'https://images.unsplash.com/photo-1577372844247-c5cf10a9f048?w=800&q=80'} 
          alt={post.title} 
          style={{
            width: '100%', height: '380px', objectFit: 'cover',
            borderRadius: '20px', marginBottom: '28px',
          }} 
        />

        <span style={{
          padding: '6px 16px', borderRadius: '100px',
          background: 'rgba(122,24,48,0.06)', color: '#7A1830',
          fontSize: '12px', fontWeight: 700,
        }}>
          {post.category || 'Turismo'}
        </span>

        <h1 style={{
          fontSize: 'clamp(24px, 3vw, 34px)', fontWeight: 800, color: '#111315',
          margin: '16px 0', lineHeight: 1.3, fontFamily: "'DM Sans', sans-serif",
        }}>
          {post.title}
        </h1>

        <div style={{ display: 'flex', gap: '20px', fontSize: '13px', color: '#999', marginBottom: '24px', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <User size={14} /> {post.author || 'Radar RAVTUR'}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={14} /> {formatDate(post.created_at)}
          </span>
        </div>

        <div style={{
          background: 'white', borderRadius: '20px', padding: '36px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
        }}>
          <div style={{ fontSize: '16px', lineHeight: 1.8, color: '#555', whiteSpace: 'pre-wrap' }}>
            {post.content || post.excerpt || 'Conteúdo em breve...'}
          </div>

          {post.tags && post.tags.length > 0 && (
            <div style={{ marginTop: '24px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {post.tags.map((tag, i) => (
                <span key={i} style={{
                  padding: '5px 14px', borderRadius: '100px',
                  background: 'rgba(122,24,48,0.05)', color: '#7A1830',
                  fontSize: '12px', fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: '4px',
                }}>
                  <Tag size={12} /> {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}