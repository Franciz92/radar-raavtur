import { useState, useEffect } from 'react'
import { Percent, Save, Loader2 } from 'lucide-react'
import { supabase } from '../../services/supabase'
import toast from 'react-hot-toast'

export default function AdminCommissionSettings() {
  const [commissions, setCommissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadCommissions()
  }, [])

  const loadCommissions = async () => {
    try {
      const { data, error } = await supabase
        .from('commission_settings')
        .select('*')
        .order('category')
      if (error) throw error
      setCommissions(data || [])
    } catch (err) {
      toast.error('Erro ao carregar')
    } finally {
      setLoading(false)
    }
  }

  const updateCommission = (id, value) => {
    setCommissions(prev => prev.map(c => 
      c.id === id ? { ...c, commission_percent: value } : c
    ))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      for (const c of commissions) {
        await supabase
          .from('commission_settings')
          .update({ commission_percent: c.commission_percent })
          .eq('id', c.id)
      }
      toast.success('Comissões atualizadas!')
    } catch (err) {
      toast.error('Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ padding: '24px', background: '#f9fafb', minHeight: '100vh' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
          <Percent size={24} style={{ color: '#7A1830' }} />
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>Configuração de Comissões</h1>
            <p style={{ color: '#777', margin: 0 }}>Defina a percentagem por categoria</p>
          </div>
        </div>

        <div style={{
          background: 'white', borderRadius: '16px', padding: '24px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
        }}>
          {commissions.map((c) => (
            <div key={c.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 0', borderBottom: '1px solid #f0ebe3',
            }}>
              <span style={{ fontWeight: 600, fontSize: '14px' }}>{c.category}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="number"
                  className="input-field"
                  value={c.commission_percent}
                  onChange={(e) => updateCommission(c.id, e.target.value)}
                  style={{ width: '80px', padding: '8px 12px', textAlign: 'center' }}
                  min="0"
                  max="50"
                  step="0.5"
                />
                <span style={{ fontSize: '14px', color: '#777' }}>%</span>
              </div>
            </div>
          ))}

          <button onClick={handleSave} disabled={saving} className="btn-primary"
            style={{ marginTop: '20px', padding: '12px 28px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Salvar comissões
          </button>
        </div>
      </div>
    </div>
  )
}