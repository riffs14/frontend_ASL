import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Sidebar from './components/Sidebar';
import BookingTable from './components/BookingTable';
import StudentsPage from './components/StudentsPage';
import Home from './components/Home';
import ExpensesTable from './components/ExpensesTable'; // Import the ExpensesTable component

function App() {
  return (
    <Router>
      <div className="App">
        <Sidebar />
        
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/bookings" element={<BookingTable />} />
            <Route path="/students" element={<StudentsPage />} />
            <Route path="/expenses" element={<ExpensesTable />} /> {/* Add route for ExpensesTable */}
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
