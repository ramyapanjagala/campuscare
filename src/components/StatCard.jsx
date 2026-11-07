// Reusable stat card used on Home and Dashboard pages.
// Adds a small colored icon tile above the number for a polished look.
const ICONS = {
  total: '📋',
  pending: '⏳',
  inprogress: '🔧',
  resolved: '✅',
}

function StatCard({ label, value, type }) {
  // type can be: 'total', 'pending', 'inprogress', 'resolved'
  return (
    <div className={`stat-card ${type || ''}`}>
      <div className="stat-icon">{ICONS[type] || '📋'}</div>
      <div className="stat-number">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  )
}

export default StatCard
