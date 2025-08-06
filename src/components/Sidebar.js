import React from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css'; // We'll add the styling in a separate file

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h2>Navigation</h2>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/bookings">Bookings</Link></li>
        <li><Link to="/students">Students</Link></li>
      </ul>
    </div>
  );
};

export default Sidebar;
