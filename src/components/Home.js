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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate(); // Initialize useNavigate hook for programmatic navigation

  // Fetch Active Students Count and Booking Data
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

      setActiveStudentsCount(studentData.filter(student => student.active === 1).length);
      setTotalAmountThisMonth(totalAmount);
      setTotalCashThisMonth(totalCash);
      setStudents(studentData); // Set the students data for the pie chart
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
