import { useState } from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import { Users, UserCheck, UserX, MessageSquareText, ChevronRight, ArrowLeft, GraduationCap, Search, ShieldCheck } from 'lucide-react'
import { getAllUsers, addSignup, stats } from './data.js'
import { StatCard, StudentTable, RemarkModal } from './components.jsx'

export function Login({ onLogin }) {
  const [role, setRole] = useState(null) // null = choose role first
  const [mode, setMode] = useState('login')
  const [f, setF] = useState({ name: '', phone: '', username: '', password: '', confirm: '', code: '' })
  const [error, setError] = useState('')
  const set = (k) => (e) => { setF({ ...f, [k]: e.target.value }); setError('') }
  const roleLabel = role === 'superadmin' ? 'Super Admin' : 'Mentor'
  const card = 'bg-white w-full max-w-sm rounded-lg border border-slate-200 p-6 shadow-sm'

  function submit(e) {
    e.preventDefault()
    if (mode === 'login') {
      const u = getAllUsers().find((x) => x.username === f.username.trim().toLowerCase() && x.password === f.password)
      if (!u) return setError('Wrong username or password.')
      if (u.role !== role) return setError(`This is not a ${roleLabel} account. Go back and choose the right role.`)
      return onLogin(u)
    }
    if (!f.name.trim() || !f.username.trim() || !f.password) return setError('Please fill every field.')
    if (role === 'mentor' && !f.phone.trim()) return setError('Please enter your phone number.')
    if (f.password.length < 6) return setError('Password must be at least 6 characters.')
    if (f.password !== f.confirm) return setError('Passwords do not match.')
    try { onLogin(addSignup({ ...f, role })) } catch (err) { setError(err.message) }
  }

  const input = 'mt-1 w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400'
  const field = (label, key, type = 'text') => (
    <label className="block mt-3 text-sm font-medium">{label}
      <input type={type} value={f[key]} onChange={set(key)} className={input} />
    </label>
  )

  // Screen 1: choose who you are
  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className={card}>
          <div className="flex items-center gap-3 mb-3">
  <img 
    src="/gl-bajaj-logo.png" 
    alt="GL Bajaj Logo" 
    className="h-12 w-auto object-contain" 
  />
  <div>
    <h1 className="font-bold text-slate-800 text-sm leading-snug">
      GL Bajaj Institute of Technology and Management
    </h1>
    <p className="text-xs text-indigo-600 font-semibold">
      Attendance & Mentor Monitor
    </p>
  </div>
</div>
          <p className="text-sm text-slate-500 mt-1">Continue as</p>
          {[['mentor', 'Mentor', 'See and follow up your students', GraduationCap],
            ['superadmin', 'Super Admin', 'See every mentor and student', ShieldCheck]].map(([k, title, text, Icon]) => (
            <button key={k} onClick={() => setRole(k)}
              className="mt-3 w-full flex items-center gap-3 text-left border border-slate-300 rounded-lg p-4 hover:border-indigo-500 hover:bg-indigo-50">
              <Icon size={26} className="text-indigo-600" />
              <span><span className="block font-medium">{title}</span><span className="block text-sm text-slate-500">{text}</span></span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Screen 2: login or sign up for the chosen role
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={submit} className={card}>
        <button type="button" onClick={() => { setRole(null); setError('') }} className="flex items-center gap-1 text-sm text-indigo-600">
          <ArrowLeft size={16} /> Change role
        </button>
        <h1 className="mt-3 text-lg font-semibold text-indigo-700">{roleLabel}</h1>
        <div className="grid grid-cols-2 mt-3 border border-slate-300 rounded-md overflow-hidden text-sm">
          {[['login', 'Login'], ['signup', 'Sign up']].map(([k, label]) => (
            <button type="button" key={k} onClick={() => { setMode(k); setError('') }}
              className={`py-2 ${mode === k ? 'bg-indigo-600 text-white' : 'bg-white hover:bg-slate-50'}`}>{label}</button>
          ))}
        </div>
        {mode === 'signup' && field(role === 'mentor' ? 'Full name (same as in the Google Sheet)' : 'Full name', 'name')}
        {mode === 'signup' && role === 'mentor' && field('Phone number', 'phone')}
        {field('Username', 'username')}
        {field('Password', 'password', 'password')}
        {mode === 'signup' && field('Confirm password', 'confirm', 'password')}
        {mode === 'signup' && role === 'superadmin' && field('Super Admin access code', 'code', 'password')}
        {error && <p className="text-sm text-rose-600 mt-3">{error}</p>}
        <button className="mt-5 w-full py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700">
          {mode === 'login' ? `Login as ${roleLabel}` : `Create ${roleLabel} account`}
        </button>
      </form>
    </div>
  )
}

function StatGrid({ s }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatCard label="Total Students" value={s.total} icon={Users} />
      <StatCard label="Present" value={s.present} icon={UserCheck} tone="green" />
      <StatCard label="Absent" value={s.absent} icon={UserX} tone="red" />
      <StatCard label="Remarks Added" value={s.remarks} icon={MessageSquareText} tone="blue" />
    </div>
  )
}

// Table + modal, shared by mentor dashboard and mentor details page
function StudentSection({ rows, saveRemark, showMentor }) {
  const [editing, setEditing] = useState(null)
  const [filter, setFilter] = useState('all')
  const shown = filter === 'absent' ? rows.filter((r) => r.attendance === 'Absent') : rows
  return (
    <>
      <div className="flex items-center justify-between mt-6 mb-2">
        <h2 className="font-semibold">Students</h2>
        <div className="flex text-sm border border-slate-300 rounded-md overflow-hidden">
          {[['all', 'All'], ['absent', 'Absent only']].map(([k, label]) => (
            <button key={k} onClick={() => setFilter(k)} className={`px-3 py-1.5 ${filter === k ? 'bg-indigo-600 text-white' : 'bg-white'}`}>{label}</button>
          ))}
        </div>
      </div>
      <StudentTable rows={shown} onAddRemark={setEditing} showMentor={showMentor} />
      {editing && <RemarkModal student={editing} onClose={() => setEditing(null)} onSave={saveRemark} />}
    </>
  )
}

export function MentorDashboard({ user, rows, date, saveRemark }) {
  // A mentor only ever gets rows where mentor === their own name
  const mine = rows.filter((r) => r.mentor === user.name)
  return (
    <>
      <h1 className="text-xl font-semibold">Welcome, {user.name}</h1>
      <p className="text-sm text-slate-500 mb-4">Attendance for {date}</p>
      <StatGrid s={stats(mine)} />
      <StudentSection rows={mine} saveRemark={saveRemark} />
    </>
  )
}

export function AdminDashboard({ user, rows, date }) {
  const mentors = [...new Set(rows.map((r) => r.mentor))].sort()
  return (
    <>
      <h1 className="text-xl font-semibold">Admin Dashboard</h1>
      <p className="text-sm text-slate-500 mb-4">All mentors · {date}</p>
      <StatGrid s={stats(rows)} />
      <h2 className="font-semibold mt-6 mb-2">Mentor summary</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {mentors.map((name) => {
          const s = stats(rows.filter((r) => r.mentor === name))
          return (
            <Link key={name} to={`/mentor/${encodeURIComponent(name)}`} className="bg-white rounded-lg border border-slate-200 p-4 hover:border-indigo-400">
              <div className="flex items-center justify-between font-medium">{name} <ChevronRight size={18} className="text-slate-400" /></div>
              <div className="grid grid-cols-4 gap-2 mt-3 text-center text-xs text-slate-500">
                <div><div className="text-lg font-semibold text-slate-800">{s.total}</div>Total</div>
                <div><div className="text-lg font-semibold text-emerald-600">{s.present}</div>Present</div>
                <div><div className="text-lg font-semibold text-rose-600">{s.absent}</div>Absent</div>
                <div><div className="text-lg font-semibold text-indigo-600">{s.remarks}</div>Remarks</div>
              </div>
            </Link>
          )
        })}
      </div>
    </>
  )
}

export function MentorDetails({ user, rows, saveRemark }) {
  const { name } = useParams()
  if (user.role === 'mentor') return <Navigate to="/" replace />
  const list = rows.filter((r) => r.mentor === name)
  const phone = list[0]?.mentorPhone
  return (
    <>
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-indigo-600 mb-3"><ArrowLeft size={16} /> Back to dashboard</Link>
      <h1 className="text-xl font-semibold">{name}</h1>
      {phone && <p className="text-sm text-slate-500 mb-4">Mentor phone: {phone}</p>}
      <StatGrid s={stats(list)} />
      <StudentSection rows={list} saveRemark={saveRemark} />
    </>
  )
}

// ---------------- Super Admin ----------------
export function SuperAdminDashboard({ rows, date }) {
  const [tab, setTab] = useState('students')
  const [q, setQ] = useState('')
  const [mentorFilter, setMentorFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const mentors = [...new Set(rows.map((r) => r.mentor))].sort()
  const accounts = getAllUsers()

  const term = q.trim().toLowerCase()
  const students = rows.filter(
    (r) =>
      (!mentorFilter || r.mentor === mentorFilter) &&
      (!statusFilter || r.attendance === statusFilter) &&
      (!term || `${r.name} ${r.roll} ${r.phone} ${r.fatherName} ${r.fatherPhone} ${r.address} ${r.mentor}`.toLowerCase().includes(term))
  )
  const box = 'border border-slate-300 rounded-md px-3 py-2 text-sm bg-white'
  return (
    <>
      <h1 className="text-xl font-semibold">Super Admin Panel</h1>
      <p className="text-sm text-slate-500 mb-4">Everything in one place · {date}</p>
      <StatGrid s={stats(rows)} />
      <div className="grid grid-cols-2 gap-3 mt-3">
        <StatCard label="Mentors" value={mentors.length} icon={GraduationCap} tone="blue" />
        <StatCard label="Accounts" value={accounts.length} icon={Users} />
      </div>

      <div className="flex gap-2 mt-6 border-b border-slate-200">
        {[['students', 'All students'], ['mentors', 'All mentors'], ['accounts', 'Accounts']].map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`px-4 py-2 text-sm -mb-px border-b-2 ${tab === k ? 'border-indigo-600 text-indigo-700 font-medium' : 'border-transparent text-slate-500'}`}>{label}</button>
        ))}
      </div>

      <div className="mt-4">
        {tab === 'students' && <>
          <div className="flex flex-wrap gap-2 mb-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, roll, phone or mentor"
                className={`${box} w-full pl-9`} />
            </div>
            <select value={mentorFilter} onChange={(e) => setMentorFilter(e.target.value)} className={box}>
              <option value="">All mentors</option>{mentors.map((m) => <option key={m}>{m}</option>)}
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={box}>
              <option value="">Present + Absent</option><option>Present</option><option>Absent</option>
            </select>
          </div>
          <StudentTable rows={students} showMentor />
        </>}

        {tab === 'mentors' && (
          <div className="overflow-x-auto bg-white rounded-lg border border-slate-200">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-100 text-slate-600"><tr>
                {['Mentor', 'Phone', 'Students', 'Present', 'Absent', 'Remarks', 'Pending calls', ''].map((h) => <th key={h} className="px-4 py-3 font-medium whitespace-nowrap">{h}</th>)}
              </tr></thead>
              <tbody className="divide-y divide-slate-100">
                {mentors.map((m) => {
                  const list = rows.filter((r) => r.mentor === m), s = stats(list)
                  return (
                    <tr key={m} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium">{m}</td>
                      <td className="px-4 py-3">{list[0]?.mentorPhone}</td>
                      <td className="px-4 py-3">{s.total}</td>
                      <td className="px-4 py-3 text-emerald-600">{s.present}</td>
                      <td className="px-4 py-3 text-rose-600">{s.absent}</td>
                      <td className="px-4 py-3 text-indigo-600">{s.remarks}</td>
                      <td className="px-4 py-3">{s.pending}</td>
                      <td className="px-4 py-3"><Link to={`/mentor/${encodeURIComponent(m)}`} className="text-indigo-600 hover:underline whitespace-nowrap">View students</Link></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'accounts' && (
          <div className="overflow-x-auto bg-white rounded-lg border border-slate-200">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-100 text-slate-600"><tr>
                {['Name', 'Username', 'Role', 'Phone', 'Created'].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}
              </tr></thead>
              <tbody className="divide-y divide-slate-100">
                {accounts.map((a) => (
                  <tr key={a.username}>
                    <td className="px-4 py-3 font-medium">{a.name}</td>
                    <td className="px-4 py-3">{a.username}</td>
                    <td className="px-4 py-3 capitalize">{a.role}</td>
                    <td className="px-4 py-3">{a.phone || '—'}</td>
                    <td className="px-4 py-3">{a.createdAt || 'Built-in'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
