export default function ChatPage() {
  return (
    <main style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '1rem',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <h1 style={{ color: 'var(--accent-gold)' }}>Chat với Thông Phan</h1>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '600px' }}>
        Tính năng này đang được xây dựng — AI clone từ Brain2 vault.
      </p>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Quay lại sớm!</p>
      <a href="/blog" className="btn-primary" style={{ marginTop: '1rem' }}>
        Đọc Blog trong lúc chờ →
      </a>
    </main>
  )
}
