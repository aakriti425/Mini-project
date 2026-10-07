# Attendance Frontend

1. Install Node.js (v18+) from https://nodejs.org
2. In this folder run:  npm install
3. Start:               npm run dev      -> open http://localhost:5173

Demo logins (edit in src/data.js):
  admin / admin123      ravi / ravi123      sneha / sneha123      amit / amit123

Without the backend it shows demo data (yellow banner).
Backend API it expects (Express, port 5000):
  GET  /api/attendance -> [{ roll, name, phone, mentor, mentorPhone, attendance, date, remark }]
  POST /api/remarks    -> body { roll, date, remark }
# Mini-project
