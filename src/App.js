// src/App.js

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import './App.css';
import Sidebar from './components/Sidebar'; // Import the Sidebar component
import BookingTable from './components/BookingTable';
import StudentsPage from './components/StudentsPage';
import Home from './components/Home'; // Create the Home component separately
import Login from './components/Login'; // Import the Login page
import { auth } from './firebase'; // Firebase authentication import
import { onAuthStateChanged } from 'firebase/auth';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user); // Set user on authentication state change
    });

    return () => unsubscribe(); // Cleanup listener
  }, []);

  return (
    <Router>
      <div className="App">
        {/* Sidebar */}
        {user && <Sidebar />} {/* Only show sidebar if user is logged in */}
        
        <div className="main-content">
          <Routes>
            {/* Only show Home if user is authenticated */}
            <Route path="/" element={user ? <Home /> : <Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/bookings" element={user ? <BookingTable /> : <Login />} />
            <Route path="/students" element={user ? <StudentsPage /> : <Login />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}


export default App;
