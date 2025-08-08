import React from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css'; // Assuming this file contains your styles

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h2>Navigation</h2>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/bookings">Bookings</Link></li>
        <li><Link to="/students">Students</Link></li>
        <li><Link to="/expenses">Expenses</Link></li> {/* Added link to Expenses */}
        <li><Link to="/expired-members">Expired Members</Link></li> {/* New link */}
      </ul>
    </div>
  );
};

export default Sidebar;
