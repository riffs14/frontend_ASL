import React from 'react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom'; // Use HashRouter
import './App.css';
import Sidebar from './components/Sidebar';
import BookingTable from './components/BookingTable';
import StudentsPage from './components/StudentsPage';
import Home from './components/Home'; 

function App() {
  return (
    <Router>  {/* Use HashRouter */}
      <div className="App">
        {/* Sidebar */}
        <Sidebar />
        
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/bookings" element={<BookingTable />} />
            <Route path="/students" element={<StudentsPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
