// import React, { useEffect, useState } from 'react';
// import { db } from '../firebase'; // Import db from the updated firebase.js
// import { collection, getDocs } from "firebase/firestore";
// import PieChart from './PieChart'; // Import the PieChart component
// import { Link, useNavigate } from 'react-router-dom'; // Use useNavigate from React Router v6
// import { auth } from '../firebase'; // Firebase authentication import

// const Home = () => {
//   const [activeStudentsCount, setActiveStudentsCount] = useState(0);
//   const [totalAmountThisMonth, setTotalAmountThisMonth] = useState(0);
//   const [totalCashThisMonth, setTotalCashThisMonth] = useState(0);
//   const [students, setStudents] = useState([]);
//   const [totalTransferredAmount, setTotalTransferredAmount] = useState(0); // New state for transferred amount
//   const [expiredStudentsCount, setExpiredStudentsCount] = useState(0); // New state for expired students count
//   const [fullShiftExpiredCount, setFullShiftExpiredCount] = useState(0); // New state for full shift expired students count
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const navigate = useNavigate(); // Initialize useNavigate hook for programmatic navigation

//   // Fetch Active Students Count, Booking Data, and Expenses Data
//   useEffect(() => {
//     const unsubscribe = auth.onAuthStateChanged((user) => {
//       if (!user) {
//         // Redirect to login if user is not logged in
//         navigate('/login');
//       } else {
//         // Proceed to fetch data if the user is logged in
//         fetchData();
//       }
//     });

//     return () => unsubscribe(); // Cleanup the subscription when the component unmounts
//   }, [navigate]);

//   const fetchData = async () => {
//     setLoading(true);
//     setError(null);

//     try {
//       // Fetch student data
//       const studentSnapshot = await getDocs(collection(db, 'students'));
//       const studentData = studentSnapshot.docs.map(doc => doc.data());
      
//       // Fetch booking data
//       const bookingSnapshot = await getDocs(collection(db, 'bookings'));
//       const currentMonth = new Date().getMonth();
//       const currentYear = new Date().getFullYear();

//       let totalAmount = 0;
//       let totalCash = 0;

//       bookingSnapshot.docs.forEach(doc => {
//         const data = doc.data();
//         const bookingDate = new Date(data.booking_date.split('/').reverse().join('-')); // Convert "DD/MM/YYYY" to Date
//         const isSameMonth = bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;

//         if (isSameMonth) {
//           totalAmount += data.amount;
//           totalCash += data.cash;
//         }
//       });

//       // Fetch expenses data (only verified and this month's expenses)
//       const expenseSnapshot = await getDocs(collection(db, 'expenses'));
//       let totalVerifiedAmount = 0;

//       expenseSnapshot.docs.forEach(doc => {
//         const data = doc.data();
//         const expenseDate = new Date(data.expense_date.split('/').reverse().join('-')); // Convert "DD/MM/YYYY" to Date
//         const isSameMonth = expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;

//         if (isSameMonth && data.verified === 1) {
//           totalVerifiedAmount += data.amount; // Add the verified amount to the total
//         }
//       });

//       // Additional Stats:
//       const currentDate = new Date();

//       const expiredStudents = studentData.filter(student => {
//         const validDate = new Date(student.valid_upto.split('/').reverse().join('-'));
//         return validDate < currentDate;
//       });

//       const fullShiftExpired = studentData.filter(student => {
//         const validDate = new Date(student.valid_upto.split('/').reverse().join('-'));
//         return validDate < currentDate && student.shift_name === "Full Shift" && student.active === 1;
//       });

//       setActiveStudentsCount(studentData.filter(student => student.active === 1).length);
//       setTotalAmountThisMonth(totalAmount);
//       setTotalCashThisMonth(totalCash);
//       setStudents(studentData); // Set the students data for the pie chart
//       setTotalTransferredAmount(totalVerifiedAmount); // Set the total transferred amount
//       setExpiredStudentsCount(expiredStudents.length); // Set expired students count
//       setFullShiftExpiredCount(fullShiftExpired.length); // Set full shift expired students count
//     } catch (err) {
//       setError('Failed to fetch data. Please try again later.');
//       console.error("Error fetching data: ", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return <div>Loading...</div>; // Loading message
//   }

//   if (error) {
//     return <div>{error}</div>; // Error message
//   }

//   return (
//     <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: '20px' }}>
//       <div style={{ flex: 1, maxWidth: '600px' }}>
//         <h1>General Statistics</h1>

//         {/* Statistics Table */}
//         <table style={{ width: '100%', margin: 'auto', textAlign: 'left', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
//           <thead>
//             <tr>
//               <th style={{ padding: '10px', border: '1px solid #ddd' }}>General Statistics</th>
//               <th style={{ padding: '10px', border: '1px solid #ddd' }}>Value</th>
//             </tr>
//           </thead>
//           <tbody>
//             <tr>
//               <td style={{ padding: '10px', border: '1px solid #ddd' }}>Total Active Students</td>
//               <td style={{ padding: '10px', border: '1px solid #ddd' }}>{activeStudentsCount}</td>
//             </tr>
//             <tr>
//               <td style={{ padding: '10px', border: '1px solid #ddd' }}>Total Amount Collected This Month</td>
//               <td style={{ padding: '10px', border: '1px solid #ddd' }}>{totalAmountThisMonth}</td>
//             </tr>
//             <tr>
//               <td style={{ padding: '10px', border: '1px solid #ddd' }}>Total Cash Collected This Month</td>
//               <td style={{ padding: '10px', border: '1px solid #ddd' }}>{totalCashThisMonth}</td>
//             </tr>
//             <tr>
//               <td style={{ padding: '10px', border: '1px solid #ddd' }}>Total Transferred Amount This Month</td>
//               <td style={{ padding: '10px', border: '1px solid #ddd' }}>{totalTransferredAmount}</td>
//             </tr>
//             <tr>
//               <td style={{ padding: '10px', border: '1px solid #ddd' }}>Cash Amount Due</td>
//               <td style={{ padding: '10px', border: '1px solid #ddd' }}>{totalCashThisMonth - totalTransferredAmount}</td>
//             </tr>
//             <tr>
//               <td style={{ padding: '10px', border: '1px solid #ddd' }}>Total Students Expired</td>
//               <td style={{ padding: '10px', border: '1px solid #ddd' }}>{expiredStudentsCount}</td>
//             </tr>
//             <tr>
//               <td style={{ padding: '10px', border: '1px solid #ddd' }}>Full Shift Expired</td>
//               <td style={{ padding: '10px', border: '1px solid #ddd' }}>{fullShiftExpiredCount}</td>
//             </tr>
//           </tbody>
//         </table>
//       </div>

//       {/* Pie Chart for Student Distribution by Shift */}
//       <div style={{ flex: 1 }}>
//         <div className="pie-chart-container">
//           <PieChart students={students} />
//         </div>
//       </div>

//       <br />
    
//     </div>
//   );
// };

// export default Home;

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
  const [monthlyVerifiedData, setMonthlyVerifiedData] = useState([]); // <-- chart data
  const [repaymentAmount, setRepaymentAmount] = useState(0);  // New state for repayment amount
  const [newAdmissionAmount, setNewAdmissionAmount] = useState(0);  // New state for new admission amount
  const [pendingBookingsThisMonth, setPendingBookingsThisMonth] = useState(0);
  const [pendingExpensesThisMonth, setPendingExpensesThisMonth] = useState(0);
  const [pendingBookingsToday, setPendingBookingsToday] = useState(0);
  const [pendingExpensesToday, setPendingExpensesToday] = useState(0);
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
      // expect DD/MM/YYYY
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
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM
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

      // Prep monthly buckets for last 12 months
      const months = lastNMonthKeys(12);
      const monthMap = new Map(months.map(m => [m.key, { label: m.label, total: 0, newAdmissions: 0 }]));

      let pendingBookingsThisMonth = 0;
      let pendingExpensesThisMonth = 0;
      let pendingBookingsToday = 0;
      let pendingExpensesToday = 0;

      const today = new Date().setHours(0, 0, 0, 0); // Today's date without time

      bookingSnapshot.docs.forEach(docSnap => {
        const data = docSnap.data();

        // ----- sums for "this month" (existing stats) -----
        const bdForThisMonth = toDate(data.booking_date);
        const bdForToday = toDate(data.booking_date)?.setHours(0, 0, 0, 0);

        if (bdForThisMonth && bdForThisMonth.getMonth() === currentMonth && bdForThisMonth.getFullYear() === currentYear) {
          totalAmount += Number(data.amount || 0);
          totalCash += Number(data.cash || 0);

          // Track repayment vs new admission amounts
          if (Number(data.booking_type) === 0) {
            newAdmissionAmount += Number(data.amount || 0);  // New admission
          } else {
            repaymentAmount += Number(data.amount || 0);    // Repayment
          }

          // Pending bookings this month
          if (data.verified === 0) {
            pendingBookingsThisMonth += 1;
            if (bdForToday === today) {
              pendingBookingsToday += 1;
            }
          }
        }

        // ----- monthly verified aggregation (last 12 months) -----
        if (data.verified === 1) {
          const d = toDate(data.booking_date);
          if (!d) return; // skip bad dates
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          if (monthMap.has(key)) {
            const row = monthMap.get(key);
            row.total += 1;
            if (Number(data.booking_type) === 0) {
              row.newAdmissions += 1;
            }
            monthMap.set(key, row);
          }
        }
      });

      // Fetch expenses data (only verified and this month's expenses)
      const expenseSnapshot = await getDocs(collection(db, 'expenses'));
      let totalVerifiedAmount = 0;

      expenseSnapshot.docs.forEach(docSnap => {
        const data = docSnap.data();
        const expenseDate = toDate(data.expense_date);
        const expenseDateToday = expenseDate?.setHours(0, 0, 0, 0);

        const isSameMonth = expenseDate &&
          expenseDate.getMonth() === currentMonth &&
          expenseDate.getFullYear() === currentYear;

        if (isSameMonth && data.verified === 1) {
          totalVerifiedAmount += Number(data.amount || 0);
        }

        // Pending expenses this month
        if (isSameMonth && data.verified === 0) {
          pendingExpensesThisMonth += 1;
          if (expenseDateToday === today) {
            pendingExpensesToday += 1;
          }
        }
      });

      // Additional Stats:
      const currentDate = new Date();

      const expiredStudents = studentData.filter(student => {
        const validDate = toDate(student.valid_upto);

        return validDate && validDate < currentDate && student.active;
      });

      const fullShiftExpired = studentData.filter(student => {
        const validDate = toDate(student.valid_upto);
        return validDate && validDate < currentDate && student.shift_name === "Full Shift" && student.active === 1;
      });

      // Build chart data array
      const chartData = months.map(({ key, label }) => {
        const row = monthMap.get(key) || { total: 0, newAdmissions: 0 };
        const others = Math.max(0, row.total - row.newAdmissions);
        return { month: label, total: row.total, newAdmissions: row.newAdmissions, others };
      });

      setMonthlyVerifiedData(chartData);
      setActiveStudentsCount(studentData.filter(student => student.active === 1).length);
      setTotalAmountThisMonth(totalAmount);
      setTotalCashThisMonth(totalCash);
      setStudents(studentData);
      setTotalTransferredAmount(totalVerifiedAmount);
      setExpiredStudentsCount(expiredStudents.length);
      setFullShiftExpiredCount(fullShiftExpired.length);
      setRepaymentAmount(repaymentAmount);        // Set Repayment Amount
      setNewAdmissionAmount(newAdmissionAmount);  // Set New Admission Amount
      setPendingBookingsThisMonth(pendingBookingsThisMonth);
      setPendingExpensesThisMonth(pendingExpensesThisMonth);
      setPendingBookingsToday(pendingBookingsToday);
      setPendingExpensesToday(pendingExpensesToday);
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
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: '20px' }}>
      <div style={{ flex: 1, maxWidth: '600px' }}>
        <h1>General Statistics</h1>

        {/* Statistics Table */}
        <table style={{ width: '100%', margin: 'auto', textAlign: 'left', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
          <thead>
            <tr>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>General Statistics</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>Total Active Students</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{activeStudentsCount}</td>
            </tr>
            <tr>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>Total Amount Collected This Month</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                {totalAmountThisMonth} 
                <br />
                (Repayment: {repaymentAmount}, New Admissions: {newAdmissionAmount})
              </td>
            </tr>
            <tr>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>Total Cash Collected This Month</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{totalCashThisMonth}</td>
            </tr>
            <tr>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>Total Transferred Amount This Month</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{totalTransferredAmount}</td>
            </tr>
            <tr>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>Cash Amount Due</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{totalCashThisMonth - totalTransferredAmount}</td>
            </tr>
            <tr>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>Total Students Expired</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{expiredStudentsCount}</td>
            </tr>
            <tr>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>Full Shift Expired</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{fullShiftExpiredCount}</td>
            </tr>
          </tbody>
        </table>

        {/* Verified bookings by month (stacked) */}
        <div style={{ marginTop: 24 }}>
          <h2>Total Bookings by Month (last 12 months)</h2>
          
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <RBarChart data={monthlyVerifiedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                {/* Yellow portion: new admissions */}
                <Bar dataKey="newAdmissions" stackId="a" name="New Admissions" fill="#2CF28F" />
                {/* Green portion: remaining verified bookings */}
                <Bar dataKey="others" stackId="a" name="Repayment" fill="#4CAF50" />
              </RBarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* To Do List */}
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

      {/* Pie Chart for Active Student Distribution by Shift */}
      <div style={{ flex: 1 }}>
        <div className="pie-chart-container">
          <PieChart students={students.filter(student => student.active === 1)} />
        </div>
      </div>
    </div>
  );
};

export default Home;
