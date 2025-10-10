import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from "firebase/firestore";
import PieChart from './PieChart';

import {
  BarChart as RBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const Home = () => {
  const [activeStudentsCount, setActiveStudentsCount] = useState(0);
  const [totalAmountThisMonth, setTotalAmountThisMonth] = useState(0);
  const [totalCashThisMonth, setTotalCashThisMonth] = useState(0);
  const [students, setStudents] = useState([]);
  const [totalTransferredAmount, setTotalTransferredAmount] = useState(0);
  const [expiredStudentsCount, setExpiredStudentsCount] = useState(0);
  const [fullShiftExpiredCount, setFullShiftExpiredCount] = useState(0);
  const [monthlyVerifiedData, setMonthlyVerifiedData] = useState([]);
  const [repaymentAmount, setRepaymentAmount] = useState(0);
  const [newAdmissionAmount, setNewAdmissionAmount] = useState(0);
  const [pendingBookingsThisMonth, setPendingBookingsThisMonth] = useState(0);
  const [pendingExpensesThisMonth, setPendingExpensesThisMonth] = useState(0);
  const [pendingBookingsToday, setPendingBookingsToday] = useState(0);
  const [pendingExpensesToday, setPendingExpensesToday] = useState(0);
  const [monthlyTotalAmountData, setMonthlyTotalAmountData] = useState([]);
  const [totalExpenseThisMonth, setTotalExpenseThisMonth] = useState(0); // ✅ new state
  const [monthlyExpenses, setMonthlyExpenses] = useState([]); // ✅ store expenses list
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ---- helpers ----
  const toDate = (value) => {
    if (!value) return null;
    if (value instanceof Date) return isNaN(value) ? null : value;
    if (typeof value === 'object' && typeof value.toDate === 'function') {
      try { return value.toDate(); } catch { return null; }
    }
    if (typeof value === 'object' && value.seconds) {
      try { return new Date(value.seconds * 1000); } catch { return null; }
    }
    if (typeof value === 'string') {
      if (value.includes('/')) {
        const parts = value.split('/');
        if (parts.length === 3) {
          const [dd, mm, yyyy] = parts;
          const iso = `${yyyy}-${String(mm).padStart(2,'0')}-${String(dd).padStart(2,'0')}`;
          const d = new Date(iso);
          return isNaN(d) ? null : d;
        }
      }
      const d = new Date(value);
      return isNaN(d) ? null : d;
    }
    return null;
  };

  const lastNMonthKeys = (n = 12) => {
    const now = new Date();
    const keys = [];
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      keys.push({ key, label: d.toLocaleString('en-US', { month: 'short' }) + ' ' + String(d.getFullYear()).slice(-2) });
    }
    return keys;
  };

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch student data
      const studentSnapshot = await getDocs(collection(db, 'students'));
      const studentData = studentSnapshot.docs.map(doc => doc.data());

      // Fetch booking data
      const bookingSnapshot = await getDocs(collection(db, 'bookings'));
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      let totalAmount = 0;
      let totalCash = 0;
      let repaymentAmount = 0;
      let newAdmissionAmount = 0;

      const months = lastNMonthKeys(12);
      const monthMap = new Map(months.map(m => [m.key, { label: m.label, total: 0, newAdmissions: 0 }]));
      const monthlyTotalMap = new Map(months.map(m => [m.key, { label: m.label, total: 0, newAdmissions: 0, repayments: 0 }]));

      let pendingBookingsThisMonth = 0;
      let pendingExpensesThisMonth = 0;
      let pendingBookingsToday = 0;
      let pendingExpensesToday = 0;

      const today = new Date().setHours(0, 0, 0, 0);

      bookingSnapshot.docs.forEach(docSnap => {
        const data = docSnap.data();
        const bdForThisMonth = toDate(data.booking_date);
        const bdForToday = toDate(data.booking_date)?.setHours(0, 0, 0, 0);

        if (bdForThisMonth && bdForThisMonth.getMonth() === currentMonth && bdForThisMonth.getFullYear() === currentYear) {
          totalAmount += Number(data.amount || 0);
          totalCash += Number(data.cash || 0);

          if (Number(data.booking_type) === 0) newAdmissionAmount += Number(data.amount || 0);
          else repaymentAmount += Number(data.amount || 0);

          if (data.verified === 0) {
            pendingBookingsThisMonth += 1;
            if (bdForToday === today) pendingBookingsToday += 1;
          }
        }

        if (data.verified === 1) {
          const d = toDate(data.booking_date);
          if (!d) return;
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          if (monthMap.has(key)) {
            const row = monthMap.get(key);
            row.total += 1;
            if (Number(data.booking_type) === 0) row.newAdmissions += 1;
            monthMap.set(key, row);
          }
        }

        if (bdForThisMonth) {
          const key = `${bdForThisMonth.getFullYear()}-${String(bdForThisMonth.getMonth() + 1).padStart(2, '0')}`;
          if (monthlyTotalMap.has(key)) {
            const row = monthlyTotalMap.get(key);
            const amount = Number(data.amount || 0);
            if (Number(data.booking_type) === 0) row.newAdmissions += amount;
            else if (Number(data.booking_type) === 1) row.repayments += amount;
            row.total += amount;
            monthlyTotalMap.set(key, row);
          }
        }
      });

      // ✅ Fetch masterExpense data (instead of expenses)
      const expenseSnapshot = await getDocs(collection(db, 'masterExpense'));
      let totalExpenseThisMonth = 0;
      const monthlyExpenseList = [];

      expenseSnapshot.docs.forEach(docSnap => {
        const data = docSnap.data();
        const expenseDate = toDate(data.expense_date);
        const expenseDateToday = expenseDate?.setHours(0, 0, 0, 0);
        const isSameMonth = expenseDate && expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;

        if (isSameMonth && data.verified === 1) {
          totalExpenseThisMonth += Number(data.amount || 0);
          monthlyExpenseList.push({
            ...data,
            expense_date: expenseDate.toLocaleDateString('en-GB'),
          });
        }

        if (isSameMonth && data.verified === 0) {
          pendingExpensesThisMonth += 1;
          if (expenseDateToday === today) pendingExpensesToday += 1;
        }
      });

      const currentDate = new Date();
      const expiredStudents = studentData.filter(student => {
        const validDate = toDate(student.valid_upto);
        return validDate && validDate < currentDate && student.active;
      });
      const fullShiftExpired = studentData.filter(student => {
        const validDate = toDate(student.valid_upto);
        return validDate && validDate < currentDate && student.shift_name === "Full Shift" && student.active === 1;
      });

      const chartData = months.map(({ key, label }) => {
        const row = monthMap.get(key) || { total: 0, newAdmissions: 0 };
        const others = Math.max(0, row.total - row.newAdmissions);
        return { month: label, total: row.total, newAdmissions: row.newAdmissions, others };
      });

      const totalAmountData = months.map(({ key, label }) => {
        const row = monthlyTotalMap.get(key) || { total: 0, newAdmissions: 0, repayments: 0 };
        return { month: label, total: row.total, newAdmissions: row.newAdmissions, repayments: row.repayments };
      });

      setMonthlyVerifiedData(chartData);
      setMonthlyTotalAmountData(totalAmountData);
      setActiveStudentsCount(studentData.filter(student => student.active === 1).length);
      setTotalAmountThisMonth(totalAmount);
      setTotalCashThisMonth(totalCash);
      setStudents(studentData);
      setTotalTransferredAmount(0);
      setExpiredStudentsCount(expiredStudents.length);
      setFullShiftExpiredCount(fullShiftExpired.length);
      setRepaymentAmount(repaymentAmount);
      setNewAdmissionAmount(newAdmissionAmount);
      setPendingBookingsThisMonth(pendingBookingsThisMonth);
      setPendingExpensesThisMonth(pendingExpensesThisMonth);
      setPendingBookingsToday(pendingBookingsToday);
      setPendingExpensesToday(pendingExpensesToday);
      setTotalExpenseThisMonth(totalExpenseThisMonth); // ✅ set total monthly expense
      setMonthlyExpenses(monthlyExpenseList); // ✅ store list of expenses
    } catch (err) {
      setError('Failed to fetch data. Please try again later.');
      console.error("Error fetching data: ", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error)   return <div>{error}</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Top Row: Stats + ToDo + Pie */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: '20px' }}>
        <div style={{ flex: 1, maxWidth: '600px' }}>
          <h1>General Statistics</h1>

          {/* ✅ Updated General Stats Table */}
          <table style={{ width: '100%', margin: 'auto', textAlign: 'left', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
            <thead>
              <tr>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>General Statistics</th>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Value</th>
              </tr>
            </thead>
            <tbody>
              <tr><td style={{ padding: '10px', border: '1px solid #ddd' }}>Total Active Students</td><td style={{ padding: '10px', border: '1px solid #ddd' }}>{activeStudentsCount}</td></tr>
              <tr>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>Total Amount Collected This Month</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                  {totalAmountThisMonth}
                  <br />(Repayment: {repaymentAmount}, New Admissions: {newAdmissionAmount})
                </td>
              </tr>
              <tr><td style={{ padding: '10px', border: '1px solid #ddd' }}>Total Cash Collected This Month</td><td style={{ padding: '10px', border: '1px solid #ddd' }}>{totalCashThisMonth}</td></tr>
              <tr><td style={{ padding: '10px', border: '1px solid #ddd' }}>Total Expenses This Month</td><td style={{ padding: '10px', border: '1px solid #ddd' }}>{totalExpenseThisMonth}</td></tr> {/* ✅ new row */}
              <tr><td style={{ padding: '10px', border: '1px solid #ddd' }}>Total Students Expired</td><td style={{ padding: '10px', border: '1px solid #ddd' }}>{expiredStudentsCount}</td></tr>
              <tr><td style={{ padding: '10px', border: '1px solid #ddd' }}>Full Shift Expired</td><td style={{ padding: '10px', border: '1px solid #ddd' }}>{fullShiftExpiredCount}</td></tr>
            </tbody>
          </table>

          {/* Charts */}
          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ width: '48%' }}>
              <h2>Total Bookings by Month (last 12 months)</h2>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <RBarChart data={monthlyVerifiedData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="newAdmissions" stackId="a" name="New Admissions" fill="#2CF28F" />
                    <Bar dataKey="others" stackId="a" name="Repayment" fill="#4CAF50" />
                  </RBarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div style={{ width: '48%' }}>
              <h2>Total Amount by Month (last 12 months)</h2>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <RBarChart data={monthlyTotalAmountData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="newAdmissions" stackId="a" name="New Admissions" fill="#2CF28F" />
                    <Bar dataKey="repayments" stackId="a" name="Repayment" fill="#4CAF50" />
                  </RBarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* To Do */}
        <div style={{ flex: 1, maxWidth: '350px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
          <h2>To Do List</h2>
          <div style={{ marginBottom: '15px' }}>
            <h3>Bookings Pending Verification</h3>
            <p><strong>This Month:</strong> {pendingBookingsThisMonth}</p>
            <p><strong>Today:</strong> {pendingBookingsToday}</p>
          </div>
          <div>
            <h3>Expenses Pending Verification</h3>
            <p><strong>This Month:</strong> {pendingExpensesThisMonth}</p>
            <p><strong>Today:</strong> {pendingExpensesToday}</p>
          </div>
        </div>

        {/* Pie Chart */}
        <div style={{ flex: 1 }}>
          <div className="pie-chart-container">
            <PieChart students={students.filter(student => student.active === 1)} />
          </div>
        </div>
      </div>

      {/* ✅ New Monthly Expense Table */}
      <div style={{ marginTop: '30px' }}>
        <h2>Monthly Expenses (This Month)</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
          <thead>
            <tr>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Date</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Category</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Investment Type</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Description</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Amount</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Owner</th>
            </tr>
          </thead>
          <tbody>
            {monthlyExpenses.length > 0 ? (
              monthlyExpenses.map((exp, idx) => (
                <tr key={idx}>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{exp.expense_date}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{exp.category}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{exp.investment_type}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{exp.description}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{exp.amount}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{exp.owner}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '10px' }}>No expenses found for this month</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Home;
