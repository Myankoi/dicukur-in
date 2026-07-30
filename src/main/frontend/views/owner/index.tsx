export default function OwnerDashboard() {
  return (
    <div>
      <h1 style={{ margin: '0 0 8px', fontSize: 22 }}>Dashboard Owner</h1>
      <p style={{ color: '#6b7280', marginBottom: 24 }}>Kelola barbershop, karyawan, dan laporan bisnis Anda.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
        {[
          { label: 'Total Booking', value: '0', desc: 'Semua booking barbershop' },
          { label: 'Barber Aktif', value: '0', desc: 'Karyawan saat ini' },
          { label: 'Pendapatan Bulan Ini', value: 'Rp0', desc: 'Estimasi pendapatan' },
        ].map((m) => (
          <div key={m.label} style={{ background: '#fff', borderRadius: 8, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
            <p style={{ margin: '0 0 6px', fontSize: 13, color: '#6b7280' }}>{m.label}</p>
            <p style={{ margin: '0 0 4px', fontSize: 28, fontWeight: 700 }}>{m.value}</p>
            <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>{m.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
