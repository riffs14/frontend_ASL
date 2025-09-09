import React, { useEffect, useState } from 'react';
import { db } from '../firebase'; // Import db from the updated firebase.js
import { collection, getDocs } from "firebase/firestore";
import { Link } from 'react-router-dom';

const StudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);

  // Helper function to convert "DD/MM/YYYY" to Date
  const parseDate = (dateString) => {
    if (!dateString) return null;
    const [day, month, year] = dateString.split('/');
    return new Date(year, month - 1, day); // Month is zero-indexed
  };

  // Function to determine student status color (Active = green, Inactive = red)
  const getStatusColor = (active) => {
    return active === 1 ? 'green' : 'red';
  };

  // Function to format timestamp as a readable date
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate(); // Convert Firestore timestamp to Date
    return date.toLocaleDateString(); // Convert to a human-readable date
  };

  // Helper function to check if the date is in the current month
  const isThisMonth = (dateString) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const dateObj = parseDate(dateString);
    if (!dateObj) return false; // If dateObj is null (invalid date), return false
    return dateObj.getMonth() === currentMonth && dateObj.getFullYear() === currentYear;
  };

  // Helper function to check if the last toggle date is in the current month
  const isLastToggleThisMonth = (timestamp) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    if (timestamp) {
      const toggleDate = timestamp.toDate(); // Convert Firestore Timestamp to Date
      return toggleDate.getMonth() === currentMonth && toggleDate.getFullYear() === currentYear;
    }

    return false;
  };

  // Fetch student data from Firestore
  useEffect(() => {
    const fetchData = async () => {
      const studentSnapshot = await getDocs(collection(db, 'students'));
      let studentData = studentSnapshot.docs.map(doc => ({
        id: doc.id, // Add the document ID
        ...doc.data(), // Include all other student data
      }));

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

  // Handle filter change
  const handleFilterChange = (filterType) => {
    if (filterType === 'registeredThisMonth') {
      setFilteredStudents(students.filter(student => isThisMonth(student.joining_date)));
    } else if (filterType === 'droppedThisMonth') {
      setFilteredStudents(
        students.filter(student => student.active === 0 && isLastToggleThisMonth(student.last_active_toggle))
      );
    } else if (filterType === 'allDropped') {
      setFilteredStudents(
        students.filter(student => student.active === 0) // Show all inactive students
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
        <button onClick={() => handleFilterChange('allDropped')}>All Dropped Students</button>
        <button onClick={() => handleFilterChange('all')}>Show All Students</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Serial No.</th>
            <th>Student ID</th>
            <th>Receipt No.</th>
            <th>Name</th>
            <th>Phone</th>
            <th>Address</th>
            <th>Shift</th>
            <th>Valid Upto</th>
            <th>Amount</th>
            <th>Drop Reason</th>
            <th>Last Toggle Date</th>
            <th>Action</th> {/* Modify column */}
          </tr>
        </thead>
        <tbody>
          {filteredStudents.map((student, index) => (
            <tr key={student.id} style={{ backgroundColor: getStatusColor(student.active) }}>
              
              <td>{index + 1}</td> {/* Serial number starts from 1 */}
              <td>{student.id}</td> {/* Display the Firestore document ID */}
              <td>{student.receipt_number || 'N/A'}</td> {/* Display Receipt Number, or N/A if not present */}
              <td>{student.name}</td>
              <td>{student.phone}</td>
              <td>{student.address}</td>
              <td>{student.shift_name}</td>
              <td>{student.valid_upto}</td>
              <td>{student.final_amount}</td>
              <td>{student.drop_reason || 'N/A'}</td>
              <td>{formatTimestamp(student.last_active_toggle)}</td> {/* Format and display last toggle date */}
              <td>
                <button>
                  <Link to={`/edit-student/${student.id}`} style={{ textDecoration: 'none', color: 'white' }}>Modify</Link>
                </button> {/* Modify button */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentsPage;
