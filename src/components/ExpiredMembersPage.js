// src/components/ExpiredMembersPage.js

import React, { useEffect, useState } from 'react';
import { db } from '../firebase'; // Import db from the updated firebase.js
import { collection, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';

const ExpiredMembersPage = () => {
  const [students, setStudents] = useState([]);
  const [expiredStudents, setExpiredStudents] = useState([]);

  // Helper function to convert "DD/MM/YYYY" to Date
  const parseDate = (dateString) => {
    if (!dateString) return null;
    const [day, month, year] = dateString.split('/');
    return new Date(year, month - 1, day); // Month is zero-indexed
  };

  // Helper function to check if the student's membership has expired
  const isExpired = (validUpto) => {
    const validUntilDate = parseDate(validUpto);
    return validUntilDate && validUntilDate < new Date(); // Check if expired
  };

  // Fetch student data from Firestore
  useEffect(() => {
    const fetchData = async () => {
      const studentSnapshot = await getDocs(collection(db, 'students'));
      const studentData = studentSnapshot.docs.map((doc) => doc.data());

      // Filter the expired students
      const expiredData = studentData.filter((student) => isExpired(student.valid_upto));
      
      setStudents(studentData);
      setExpiredStudents(expiredData); // Only show expired students
    };

    fetchData();
  }, []);

  // Function to send a WhatsApp message
  const sendWhatsAppMessage = (phone, name) => {
    const message = `Hello ${name},\n\nThank you for being a member! This is a gentle reminder to settle your fee dues. We would appreciate it if you could make the payment as soon as possible. Thank you!`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phone}?text=${encodedMessage}`, '_blank');
  };

  return (
    <div>
      <h1>Expired Members</h1>

      {expiredStudents.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Serial No.</th>
              <th>Receipt No.</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Valid Upto</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {expiredStudents.map((student, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{student.receipt_number || 'N/A'}</td>
                <td>{student.name}</td>
                <td>{student.phone}</td>
                <td>{student.valid_upto}</td>
                <td>
                  <button onClick={() => sendWhatsAppMessage(student.phone, student.name)}>
                    Send Reminder via WhatsApp
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No expired members found.</p>
      )}

      <br />
      <button>
        <Link to="/students">Back to Students</Link>
      </button>
    </div>
  );
};

export default ExpiredMembersPage;
