import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Phone, MessageSquarePlus, Pencil, LogOut, X, Trash2, RefreshCw, UserCheck, MapPin } from 'lucide-react'
import { QUICK_REMARKS } from './data.js'

export function Header({ user, onLogout }) {
  return (
    <header className="bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img 
            src="/gl-bajaj-logo.png" 
            alt="GL Bajaj Logo" 
            className="h-11 w-auto object-contain"
          />
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-slate-800 text-sm sm:text-base tracking-tight">
              GL Bajaj Institute of Technology and Management
            </span>
            <span className="text-xs text-indigo-600 font-semibold">
              Attendance & Mentor Monitoring System
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3 text-sm">
          <span className="text-slate-600 font-medium hidden sm:inline">
            {user.name} <span className="text-slate-400 font-normal">({user.role})</span>
          </span>
          <button
            onClick={onLogout}
            className="flex items-center gap-1 px-3 py-1.5 rounded-md border border-slate-300 hover:bg-slate-100 text-xs font-medium transition"
          >
            <LogOut size={15} /> Logout
          </button>
        </div>
      </div>
    </header>
  )
}

const TONES = {
  slate: 'bg-white text-slate-800',
  green: 'bg-emerald-50 text-emerald-800',
  red: 'bg-rose-50 text-rose-800',
  blue: 'bg-indigo-50 text-indigo-800',
}

export function StatCard({ label, value, icon: Icon, tone = 'slate' }) {
  return (
    <div className={`rounded-lg border border-slate-200 p-4 ${TONES[tone]}`}>
      <div className="flex items-center justify-between text-sm opacity-80">
        {label} <Icon size={18} />
      </div>
      <div className="mt-2 text-3xl font-semibold">{value}</div>
    </div>
  )
}

export function Badge({ status, onClick, canToggle = false }) {
  const present = status === 'Present'
  return (
    <button
      type="button"
      disabled={!canToggle}
      onClick={onClick}
      className={`px-2.5 py-0.5 rounded-full text-xs font-medium inline-flex items-center gap-1 ${
        present ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
      } ${canToggle ? 'cursor-pointer' : 'cursor-default'}`}
    >
      {status}
      {canToggle && <RefreshCw size={10} className="opacity-60" />}
    </button>
  )
}

export function StudentTable({ rows, onAddRemark, onToggleAttendance, onDeleteStudent, showMentor = false, isEditable = false }) {
  if (!rows.length) {
    return (
      <p className="p-6 text-center text-slate-500 bg-white rounded-lg border border-slate-200">
        No student records found.
      </p>
    )
  }

  const heads = [
    'Roll',
    'Student Name',
    'Mobile No',
    'Father Name',
    'Father Mobile',
    'Address',
    ...(showMentor ? ['Mentor', 'Mentor Phone'] : []),
    'Attendance',
    'Remark',
    ...(onAddRemark || isEditable ? ['Actions'] : []),
  ]

  return (
    <div className="overflow-x-auto bg-white rounded-lg border border-slate-200 shadow-sm">
      <table className="w-full text-xs text-left">
        <thead className="bg-slate-100 text-slate-600">
          <tr>
            {heads.map((h) => (
              <th key={h} className="px-3 py-3 font-medium whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((r) => (
            <tr key={`${r.roll}-${r.date}`} className="hover:bg-slate-50">
              <td className="px-3 py-2.5 font-mono font-medium">{r.roll}</td>
              <td className="px-3 py-2.5 font-semibold text-slate-800">{r.name}</td>
              <td className="px-3 py-2.5 whitespace-nowrap">
                <a
                  href={`tel:${r.phone}`}
                  className="inline-flex items-center gap-1 text-indigo-600 hover:underline"
                >
                  <Phone size={12} /> {r.phone}
                </a>
              </td>
              <td className="px-3 py-2.5">{r.fatherName || '—'}</td>
              <td className="px-3 py-2.5 whitespace-nowrap">
                {r.fatherPhone ? (
                  <a
                    href={`tel:${r.fatherPhone}`}
                    className="inline-flex items-center gap-1 text-slate-600 hover:underline"
                  >
                    <Phone size={12} /> {r.fatherPhone}
                  </a>
                ) : (
                  '—'
                )}
              </td>
              <td className="px-3 py-2.5 text-slate-600 max-w-[150px] truncate" title={r.address}>
                {r.address ? (
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={11} className="text-slate-400 flex-shrink-0" /> {r.address}
                  </span>
                ) : (
                  '—'
                )}
              </td>
              {showMentor && <td className="px-3 py-2.5">{r.mentor}</td>}
              {showMentor && <td className="px-3 py-2.5">{r.mentorPhone}</td>}
              <td className="px-3 py-2.5">
                <Badge
                  status={r.attendance}
                  canToggle={isEditable}
                  onClick={() => onToggleAttendance && onToggleAttendance(r.roll, r.date)}
                />
              </td>
              <td className="px-3 py-2.5 text-slate-600">
                {r.remark || <span className="text-slate-400">—</span>}
              </td>
              {(onAddRemark || isEditable) && (
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {r.attendance === 'Absent' && onAddRemark && (
                      <button
                        onClick={() => onAddRemark(r)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700 text-[11px] font-medium"
                      >
                        {r.remark ? <Pencil size={11} /> : <MessageSquarePlus size={11} />}
                        {r.remark ? 'Edit' : 'Remark'}
                      </button>
                    )}
                    {isEditable && onDeleteStudent && (
                      <button
                        onClick={() => onDeleteStudent(r.roll, r.date)}
                        className="p-1 rounded text-rose-600 hover:bg-rose-50"
                        title="Delete Student Record"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function RemarkModal({ student, onClose, onSave }) {
  const [text, setText] = useState(student.remark || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function submit() {
    if (!text.trim()) return setError('Please write or select a remark.')
    setSaving(true)
    try {
      await onSave(student, text.trim())
      onClose()
    } catch (e) {
      setError(e.message)
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md p-5 shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Remark for {student.name}</h2>
            <p className="text-xs text-slate-500">
              Roll: {student.roll} · Student: {student.phone} · Father: {student.fatherPhone || 'N/A'}
            </p>
          </div>
          <button onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          {QUICK_REMARKS.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => setText(q)}
              className={`px-2.5 py-1 rounded-full text-xs border ${
                text === q
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'border-slate-300 hover:bg-slate-100'
              }`}
            >
              {q}
            </button>
          ))}
        </div>
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            setError('')
          }}
          rows={3}
          placeholder="Type a custom remark or select one above"
          className="mt-3 w-full border border-slate-300 rounded-md p-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        {error && <p className="text-xs text-rose-600 mt-1">{error}</p>}
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-4 py-1.5 text-xs rounded-md border border-slate-300 hover:bg-slate-50">
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={saving}
            className="px-4 py-1.5 text-xs rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save remark'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function AddStudentModal({ onClose, onAdd, date }) {
  const [f, setF] = useState({
    roll: '',
    name: '',
    phone: '',
    fatherName: '',
    fatherPhone: '',
    address: '',
    mentor: 'Ravi Kumar',
    mentorPhone: '9810000001',
    attendance: 'Absent',
    remark: '',
  })
  const [error, setError] = useState('')

  const mentors = [
    { name: 'Ravi Kumar', phone: '9810000001' },
    { name: 'Sneha Gupta', phone: '9810000002' },
    { name: 'Amit Verma', phone: '9810000003' },
  ]

  function handleMentorChange(mentorName) {
    const found = mentors.find((m) => m.name === mentorName)
    setF({
      ...f,
      mentor: mentorName,
      mentorPhone: found ? found.phone : '',
    })
  }

  function submit(e) {
    e.preventDefault()
    if (!f.roll.trim() || !f.name.trim() || !f.phone.trim()) {
      return setError('Please fill Roll Number, Student Name, and Mobile Number.')
    }
    try {
      onAdd({
        ...f,
        roll: f.roll.trim(),
        name: f.name.trim(),
        phone: f.phone.trim(),
        fatherName: f.fatherName.trim(),
        fatherPhone: f.fatherPhone.trim(),
        address: f.address.trim(),
        date: date || new Date().toISOString().slice(0, 10),
      })
      onClose()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-lg p-5 shadow-lg">
        <div className="flex items-start justify-between">
          <h2 className="text-base font-semibold text-slate-800">Add New Student (GL Bajaj)</h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={submit} className="mt-3 space-y-2.5">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-slate-700">Roll Number *</label>
              <input
                type="text"
                value={f.roll}
                onChange={(e) => setF({ ...f, roll: e.target.value })}
                className="mt-1 w-full border border-slate-300 rounded-md px-2.5 py-1 text-xs"
                placeholder="e.g. 105"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700">Student Name *</label>
              <input
                type="text"
                value={f.name}
                onChange={(e) => setF({ ...f, name: e.target.value })}
                className="mt-1 w-full border border-slate-300 rounded-md px-2.5 py-1 text-xs"
                placeholder="e.g. Rahul Sharma"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-slate-700">Student Mobile No *</label>
              <input
                type="text"
                value={f.phone}
                onChange={(e) => setF({ ...f, phone: e.target.value })}
                className="mt-1 w-full border border-slate-300 rounded-md px-2.5 py-1 text-xs"
                placeholder="e.g. 9876543210"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700">Father Name</label>
              <input
                type="text"
                value={f.fatherName}
                onChange={(e) => setF({ ...f, fatherName: e.target.value })}
                className="mt-1 w-full border border-slate-300 rounded-md px-2.5 py-1 text-xs"
                placeholder="e.g. Rajesh Sharma"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-slate-700">Father Mobile No</label>
              <input
                type="text"
                value={f.fatherPhone}
                onChange={(e) => setF({ ...f, fatherPhone: e.target.value })}
                className="mt-1 w-full border border-slate-300 rounded-md px-2.5 py-1 text-xs"
                placeholder="e.g. 9811100099"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700">Assigned Mentor</label>
              <select
                value={f.mentor}
                onChange={(e) => handleMentorChange(e.target.value)}
                className="mt-1 w-full border border-slate-300 rounded-md px-2 py-1 text-xs bg-white"
              >
                {mentors.map((m) => (
                  <option key={m.name} value={m.name}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700">Address</label>
            <input
              type="text"
              value={f.address}
              onChange={(e) => setF({ ...f, address: e.target.value })}
              className="mt-1 w-full border border-slate-300 rounded-md px-2.5 py-1 text-xs"
              placeholder="e.g. Greater Noida, UP"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700">Initial Attendance</label>
            <select
              value={f.attendance}
              onChange={(e) => setF({ ...f, attendance: e.target.value })}
              className="mt-1 w-full border border-slate-300 rounded-md px-2 py-1 text-xs bg-white"
            >
              <option value="Absent">Absent</option>
              <option value="Present">Present</option>
            </select>
          </div>

          {error && <p className="text-xs text-rose-600 mt-1">{error}</p>}
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={onClose} className="px-3 py-1 text-xs border border-slate-300 rounded-md">
              Cancel
            </button>
            <button type="submit" className="px-4 py-1 text-xs bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium">
              Save Student
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}