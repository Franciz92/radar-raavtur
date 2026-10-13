export default function AboutPage() {
  return (
    <div className="container-custom" style={{ padding: '60px 0', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '36px', fontWeight: 'bold', textAlign: 'center', marginBottom: '40px' }}>Sobre o Radar RAVTUR</h1>
      <div style={{ display: 'grid', gap: '32px', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 600, marginBottom: '12px' }}>Missão</h2>
          <p style={{ lineHeight: 1.7, color: '#374151' }}>Centralizar, divulgar e conectar todos os serviços turísticos de Angola, promovendo o turismo interno e facilitando o acesso a experiências autênticas.</p>
        </div>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 600, marginBottom: '12px' }}>Visão</h2>
          <p style={{ lineHeight: 1.7, color: '#374151' }}>Ser a principal referência digital do turismo angolano, impulsionando o desenvolvimento sustentável do sector.</p>
        </div>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 600, marginBottom: '12px' }}>Porquê usar?</h2>
          <ul style={{ lineHeight: 1.7, color: '#374151', paddingLeft: '20px' }}>
            <li>Centralizado: todos os serviços num só lugar</li>
            <li>Confiável: avaliações reais de utilizadores</li>
            <li>Local: valorizamos a cultura angolana</li>
            <li>Inovador: tecnologia moderna e fluida</li>
          </ul>
        </div>
      </div>
    </div>
  )
}