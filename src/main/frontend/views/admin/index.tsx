export default function AdminDashboard() {
  return (
    <div>
      <h1 style={{ margin: '0 0 8px', fontSize: 22 }}>Dashboard Admin</h1>
      <p style={{ color: '#6b7280', marginBottom: 24 }}>Kelola approval, operasional booking, pembayaran, dan laporan.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
        {[
          { label: 'Total Booking', value: '0', desc: 'Seluruh booking di sistem' },
          { label: 'Booking Pending', value: '0', desc: 'Menunggu respon barber' },
          { label: 'Pendaftaran Review', value: '0', desc: 'Mitra menunggu approval' },
          { label: 'Total Transaksi', value: 'Rp0', desc: 'Pembayaran terverifikasi' },
        ].map((m) => (
          <div key={m.label} style={{ background: '#fff', borderRadius: 8, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
            <p style={{ margin: '0 0 6px', fontSize: 13, color: '#6b7280' }}>{m.label}</p>
            <p style={{ margin: '0 0 4px', fontSize: 28, fontWeight: 700 }}>{m.value}</p>
            <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>{m.desc}</p>
          </div>
        ))}
      </div>
      <div style={{ background: '#fff', borderRadius: 8, padding: 20, marginTop: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
        <h3 style={{ margin: '0 0 8px' }}>Aktivitas Terbaru</h3>
        <p style={{ color: '#9ca3af', fontSize: 14 }}>Pendaftaran, booking, dan pembayaran terbaru akan muncul di sini.</p>
      </div>
    </div>
  );
}
