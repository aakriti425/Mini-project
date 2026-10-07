import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { getAttendance, saveRemark as saveRemarkApi, latestDate } from './data.js'
import { Header } from './components.jsx'
import { Login, MentorDashboard, AdminDashboard, MentorDetails, SuperAdminDashboard } from './pages.jsx'

export default function App() {
  const navigate = useNavigate()
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'))
  const [rows, setRows] = useState([])
  const [demo, setDemo] = useState(false)
  const [loading, setLoading] = useState(false)

  // Fetch the latest sheet data whenever someone logs in (or the page is refreshed while logged in)
  useEffect(() => {
    if (!user) return
    setLoading(true)
    getAttendance().then(({ rows, demo }) => { setRows(rows); setDemo(demo); setLoading(false) })
  }, [user])

  const login = (u) => { localStorage.setItem('user', JSON.stringify(u)); setUser(u); navigate('/') }
  const logout = () => { localStorage.removeItem('user'); setUser(null); setRows([]); navigate('/login') }

  async function saveRemark(student, remark) {
    if (!demo) await saveRemarkApi(student.roll, student.date, remark)
    setRows((all) => all.map((r) => (r.roll === student.roll && r.date === student.date ? { ...r, remark } : r)))
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login onLogin={login} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  // Only show the most recent date in the sheet (normally today)
  const date = latestDate(rows)
  const todayRows = rows.filter((r) => r.date === date)

  return (
    <>
      <Header user={user} onLogout={logout} />
      {demo && (
        <div className="bg-amber-100 text-amber-800 text-sm text-center py-1.5">
          Backend not connected. Showing demo data.
        </div>
      )}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {loading ? <p className="text-slate-500">Loading…</p> : (
          <Routes>
            <Route path="/" element={
              user.role === 'superadmin' ? <SuperAdminDashboard rows={todayRows} date={date} />
              : user.role === 'admin' ? <AdminDashboard user={user} rows={todayRows} date={date} />
              : <MentorDashboard user={user} rows={todayRows} date={date} saveRemark={saveRemark} />} />
            <Route path="/mentor/:name" element={<MentorDetails user={user} rows={todayRows} saveRemark={saveRemark} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}
      </main>
    </>
  )
}
