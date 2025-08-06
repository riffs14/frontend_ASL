import React, { useEffect, useState } from 'react';
import { db } from '../firebase'; // Import db from the updated firebase.js
import { collection, getDocs } from "firebase/firestore";
import PieChart from './PieChart'; // Import the PieChart component
import { Link } from 'react-router-dom';

const Home = () => {
  const [activeStudentsCount, setActiveStudentsCount] = useState(0);
  const [totalAmountThisMonth, setTotalAmountThisMonth] = useState(0);
  const [totalCashThisMonth, setTotalCashThisMonth] = useState(0);
  const [students, setStudents] = useState([]);

  // Fetch Active Students Count and Booking Data
  useEffect(() => {
    const fetchData = async () => {
      const studentSnapshot = await getDocs(collection(db, 'students'));
      const studentData = studentSnapshot.docs.map(doc => doc.data());
      
      // Fetch Booking Data for statistics
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

      setActiveStudentsCount(studentData.filter(student => student.active === 1).length);
      setTotalAmountThisMonth(totalAmount);
      setTotalCashThisMonth(totalCash);
      setStudents(studentData); // Set the students data for the pie chart
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1>General Statistics</h1>
      <div className="statistics">
        <p><strong>Active Students:</strong> {activeStudentsCount}</p>
        <p><strong>Total Amount Collected This Month:</strong> {totalAmountThisMonth}</p>
        <p><strong>Total Cash Collected This Month:</strong> {totalCashThisMonth}</p>
      </div>

      {/* Pie Chart for Student Distribution by Shift */}
      <div className="pie-chart-container">
        <PieChart students={students} />
      </div>

      <br />
      <button>
        <Link to="/bookings">Go to Bookings</Link>
      </button>
      <button>
        <Link to="/students">Go to Students</Link>
      </button>
    </div>
  );
};

export default Home;
