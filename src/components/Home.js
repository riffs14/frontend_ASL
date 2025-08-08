import React, { useEffect, useState } from 'react';
import { db } from '../firebase'; // Import db from the updated firebase.js
import { collection, getDocs } from "firebase/firestore";
import PieChart from './PieChart'; // Import the PieChart component
import { Link, useNavigate } from 'react-router-dom'; // Use useNavigate from React Router v6
import { auth } from '../firebase'; // Firebase authentication import

const Home = () => {
  const [activeStudentsCount, setActiveStudentsCount] = useState(0);
  const [totalAmountThisMonth, setTotalAmountThisMonth] = useState(0);
  const [totalCashThisMonth, setTotalCashThisMonth] = useState(0);
  const [students, setStudents] = useState([]);
  const [totalTransferredAmount, setTotalTransferredAmount] = useState(0); // New state for transferred amount
  const [expiredStudentsCount, setExpiredStudentsCount] = useState(0); // New state for expired students count
  const [fullShiftExpiredCount, setFullShiftExpiredCount] = useState(0); // New state for full shift expired students count
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate(); // Initialize useNavigate hook for programmatic navigation

  // Fetch Active Students Count, Booking Data, and Expenses Data
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        // Redirect to login if user is not logged in
        navigate('/login');
      } else {
        // Proceed to fetch data if the user is logged in
        fetchData();
      }
    });

    return () => unsubscribe(); // Cleanup the subscription when the component unmounts
  }, [navigate]);

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

      bookingSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const bookingDate = new Date(data.booking_date.split('/').reverse().join('-')); // Convert "DD/MM/YYYY" to Date
        const isSameMonth = bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;

        if (isSameMonth) {
          totalAmount += data.amount;
          totalCash += data.cash;
        }
      });

      // Fetch expenses data (only verified and this month's expenses)
      const expenseSnapshot = await getDocs(collection(db, 'expenses'));
      let totalVerifiedAmount = 0;

      expenseSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const expenseDate = new Date(data.expense_date.split('/').reverse().join('-')); // Convert "DD/MM/YYYY" to Date
        const isSameMonth = expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;

        if (isSameMonth && data.verified === 1) {
          totalVerifiedAmount += data.amount; // Add the verified amount to the total
        }
      });

      // Additional Stats:
      const currentDate = new Date();

      const expiredStudents = studentData.filter(student => {
        const validDate = new Date(student.valid_upto.split('/').reverse().join('-'));
        return validDate < currentDate;
      });

      const fullShiftExpired = studentData.filter(student => {
        const validDate = new Date(student.valid_upto.split('/').reverse().join('-'));
        return validDate < currentDate && student.shift_name === "Full Shift" && student.active === 1;
      });

      setActiveStudentsCount(studentData.filter(student => student.active === 1).length);
      setTotalAmountThisMonth(totalAmount);
      setTotalCashThisMonth(totalCash);
      setStudents(studentData); // Set the students data for the pie chart
      setTotalTransferredAmount(totalVerifiedAmount); // Set the total transferred amount
      setExpiredStudentsCount(expiredStudents.length); // Set expired students count
      setFullShiftExpiredCount(fullShiftExpired.length); // Set full shift expired students count
    } catch (err) {
      setError('Failed to fetch data. Please try again later.');
      console.error("Error fetching data: ", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>; // Loading message
  }

  if (error) {
    return <div>{error}</div>; // Error message
  }

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
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{totalAmountThisMonth}</td>
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
      </div>

      {/* Pie Chart for Student Distribution by Shift */}
      <div style={{ flex: 1 }}>
        <div className="pie-chart-container">
          <PieChart students={students} />
        </div>
      </div>

      <br />
    
    </div>
  );
};

export default Home;
