export const USERS = [
  { username: 'superadmin', password: 'super123', role: 'superadmin', name: 'Super Admin' },
  { username: 'admin', password: 'admin123', role: 'admin', name: 'Administrator' },
  { username: 'ravi', password: 'ravi123', role: 'mentor', name: 'Ravi Kumar' },
  { username: 'sneha', password: 'sneha123', role: 'mentor', name: 'Sneha Gupta' },
  { username: 'amit', password: 'amit123', role: 'mentor', name: 'Amit Verma' },
]

export const QUICK_REMARKS = [
  'Phone switched off',
  'Medical Leave',
  'Family Emergency',
  'Will attend tomorrow',
  'Parent informed',
  'No response',
]

const today = new Date().toISOString().slice(0, 10)

const R = { mentor: 'Ravi Kumar', mentorPhone: '9810000001' }
const S = { mentor: 'Sneha Gupta', mentorPhone: '9810000002' }
const A = { mentor: 'Amit Verma', mentorPhone: '9810000003' }

const INITIAL_DEMO = [
  ['101', 'Aarav Sharma', '9000000001', 'Rajesh Sharma', '9811100001', 'Greater Noida, UP', R, 'Present'],
  ['102', 'Diya Singh', '9000000002', 'Sanjay Singh', '9811100002', 'Noida, Sector 62, UP', R, 'Absent'],
  ['103', 'Kabir Rao', '9000000003', 'Anand Rao', '9811100003', 'Delhi, Pitampura', R, 'Absent'],
  ['104', 'Meera Nair', '9000000004', 'Ramesh Nair', '9811100004', 'Ghaziabad, UP', R, 'Present'],
  ['201', 'Rohan Das', '9000000005', 'Bikash Das', '9811100005', 'Faridabad, HR', S, 'Present'],
  ['202', 'Isha Patel', '9000000006', 'Ketan Patel', '9811100006', 'Gurugram, HR', S, 'Absent'],
  ['203', 'Vivaan Joshi', '9000000007', 'Harish Joshi', '9811100007', 'Greater Noida, UP', S, 'Present'],
  ['301', 'Anaya Mehta', '9000000008', 'Sunil Mehta', '9811100008', 'Delhi, Rohini', A, 'Absent'],
  ['302', 'Arjun Reddy', '9000000009', 'Pratap Reddy', '9811100009', 'Noida, Sector 18, UP', A, 'Present'],
  ['303', 'Tara Iyer', '9000000010', 'Venkatesh Iyer', '9811100010', 'Delhi, Dwarka', A, 'Present'],
].map(([roll, name, phone, fatherName, fatherPhone, address, mm, attendance]) => ({
  roll,
  name,
  phone,
  fatherName,
  fatherPhone,
  address,
  ...mm,
  attendance,
  date: today,
  remark: '',
}))

export async function getAttendance() {
  const localData = localStorage.getItem('attendance_records')
  if (!localData) {
    localStorage.setItem('attendance_records', JSON.stringify(INITIAL_DEMO))
    return { rows: INITIAL_DEMO, demo: false }
  }
  return { rows: JSON.parse(localData), demo: false }
}

export async function saveRemark(roll, date, remark) {
  const records = JSON.parse(localStorage.getItem('attendance_records') || '[]')
  const updated = records.map((r) =>
    r.roll === roll && r.date === date ? { ...r, remark } : r
  )
  localStorage.setItem('attendance_records', JSON.stringify(updated))
}

export async function toggleAttendanceStatus(roll, date) {
  const records = JSON.parse(localStorage.getItem('attendance_records') || '[]')
  const updated = records.map((r) => {
    if (r.roll === roll && r.date === date) {
      const nextStatus = r.attendance === 'Present' ? 'Absent' : 'Present'
      return { ...r, attendance: nextStatus, remark: nextStatus === 'Present' ? '' : r.remark }
    }
    return r
  })
  localStorage.setItem('attendance_records', JSON.stringify(updated))
  return updated
}

export async function addStudentRecord(student) {
  const records = JSON.parse(localStorage.getItem('attendance_records') || '[]')
  if (records.some((r) => r.roll === student.roll && r.date === student.date)) {
    throw new Error('A student with this Roll Number already exists for this date.')
  }
  const updated = [...records, student]
  localStorage.setItem('attendance_records', JSON.stringify(updated))
  return updated
}

export async function deleteStudentRecord(roll, date) {
  const records = JSON.parse(localStorage.getItem('attendance_records') || '[]')
  const updated = records.filter((r) => !(r.roll === roll && r.date === date))
  localStorage.setItem('attendance_records', JSON.stringify(updated))
  return updated
}

export function getAllDates(rows) {
  const dates = [...new Set(rows.map((r) => r.date))].sort().reverse()
  return dates.length > 0 ? dates : [today]
}

export function latestDate(rows) {
  return rows.reduce((d, r) => (r.date > d ? r.date : d), today)
}

export function stats(list) {
  const absent = list.filter((r) => r.attendance === 'Absent')
  return {
    total: list.length,
    present: list.length - absent.length,
    absent: absent.length,
    remarks: list.filter((r) => r.remark).length,
    pending: absent.filter((r) => !r.remark).length,
  }
}

export function getAllUsers() {
  const signups = JSON.parse(localStorage.getItem('signups') || '[]')
  return [...USERS, ...signups]
}

export const SUPERADMIN_CODE = 'SUPER2026'

export function addSignup({ name, phone, username, password, role, code }) {
  if (role === 'superadmin' && code !== SUPERADMIN_CODE) {
    throw new Error('Wrong Super Admin access code.')
  }
  const clean = username.trim().toLowerCase()
  if (getAllUsers().some((u) => u.username === clean)) {
    throw new Error('This username is already taken.')
  }
  const signups = JSON.parse(localStorage.getItem('signups') || '[]')
  const user = {
    username: clean,
    password,
    role,
    name: name.trim(),
    phone: (phone || '').trim(),
    createdAt: new Date().toISOString().slice(0, 10),
  }
  localStorage.setItem('signups', JSON.stringify([...signups, user]))
  return user
}

export function exportToCSV(rows, filename = 'gl_bajaj_attendance_report.csv') {
  if (!rows || !rows.length) return
  const headers = [
    'Roll Number',
    'Student Name',
    'Mobile No',
    'Father Name',
    'Father Mobile No',
    'Address',
    'Mentor',
    'Mentor Phone',
    'Attendance',
    'Date',
    'Remark',
  ]
  const csvContent = [
    headers.join(','),
    ...rows.map((r) =>
      [
        `"${r.roll}"`,
        `"${r.name}"`,
        `"${r.phone}"`,
        `"${r.fatherName || ''}"`,
        `"${r.fatherPhone || ''}"`,
        `"${(r.address || '').replace(/"/g, '""')}"`,
        `"${r.mentor}"`,
        `"${r.mentorPhone}"`,
        `"${r.attendance}"`,
        `"${r.date}"`,
        `"${(r.remark || '').replace(/"/g, '""')}"`,
      ].join(',')
    ),
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}