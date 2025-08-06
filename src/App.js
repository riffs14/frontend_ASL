import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Sidebar from './components/Sidebar'; // Import the Sidebar component
import BookingTable from './components/BookingTable';
import StudentsPage from './components/StudentsPage';
import Home from './components/Home'; // Create the Home component separately

function App() {
  return (
    <Router>
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
