import React, { useEffect, useState } from 'react';
import { db } from '../firebase'; // Import db from the updated firebase.js
import { collection, getDocs } from "firebase/firestore";
import { Link } from 'react-router-dom';

const StudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [filter, setFilter] = useState('all'); // Track the active filter type

  // Helper function to convert "DD/MM/YYYY" to Date
  const parseDate = (dateString) => {
    if (!dateString) return null; // Ensure the date string is not undefined or null
    const [day, month, year] = dateString.split('/');
    return new Date(year, month - 1, day); // Month is zero-indexed
  };

  // Helper function to check if the date is in the current month
  const isThisMonth = (dateString) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const dateObj = parseDate(dateString);
    if (!dateObj) return false; // If dateObj is null (invalid date), return false
    return dateObj.getMonth() === currentMonth && dateObj.getFullYear() === currentYear;
  };

  // Fetch student data from Firestore
  useEffect(() => {
    const fetchData = async () => {
      const studentSnapshot = await getDocs(collection(db, 'students'));
      let studentData = studentSnapshot.docs.map(doc => doc.data());

      // Sort the students based on 'receipt_number' in descending order
      studentData.sort((a, b) => {
        const receiptA = a.receipt_number || 0; // Default to 0 if receipt_number is missing
        const receiptB = b.receipt_number || 0; // Default to 0 if receipt_number is missing
        return receiptB - receiptA; // Sorting in descending order
      });

      setStudents(studentData);
      setFilteredStudents(studentData); // Initially show all students
    };

    fetchData();
  }, []);

  // Function to determine student status color
  const getStatusColor = (active) => {
    return active === 1 ? 'green' : 'red';
  };

  // Handle filter change
  const handleFilterChange = (filterType) => {
    setFilter(filterType);

    if (filterType === 'registeredThisMonth') {
      setFilteredStudents(students.filter(student => isThisMonth(student.joining_date)));
    } else if (filterType === 'droppedThisMonth') {
      setFilteredStudents(
        students.filter(student => isThisMonth(student.toggle_date) && student.active === 0)
      );
    } else {
      setFilteredStudents(students); // Show all students
    }
  };

  return (
    <div>
      <h1>Students List</h1>

      {/* Filter Buttons */}
      <div>
        <button onClick={() => handleFilterChange('registeredThisMonth')}>Students Registered This Month</button>
        <button onClick={() => handleFilterChange('droppedThisMonth')}>Students Dropped This Month</button>
        <button onClick={() => handleFilterChange('all')}>Show All Students</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Serial No.</th>
            <th>Receipt No.</th> {/* Added Receipt Number column */}
            <th>Name</th>
            <th>Phone</th>
            <th>Address</th>
            <th>Shift</th>
            <th>Shift Start</th>
            <th>Shift End</th>
            <th>Valid Upto</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredStudents.map((student, index) => (
            <tr key={index} style={{ backgroundColor: getStatusColor(student.active) }}>
              <td>{index + 1}</td> {/* Serial number starts from 1 */}
              <td>{student.receipt_number || 'N/A'}</td> {/* Display Receipt Number, or N/A if not present */}
              <td>{student.name}</td>
              <td>{student.phone}</td>
              <td>{student.address}</td>
              <td>{student.shift_name}</td> {/* Display shift name */}
              <td>{student.shift_start}</td> {/* Display shift start */}
              <td>{student.shift_end}</td> {/* Display shift end */}
              <td>{student.valid_upto}</td> {/* Display valid upto */}
              <td>{student.active === 1 ? 'Active' : 'Inactive'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <br />
      <button>
        <Link to="/">Back to Home</Link>
      </button>
    </div>
  );
};

export default StudentsPage;
