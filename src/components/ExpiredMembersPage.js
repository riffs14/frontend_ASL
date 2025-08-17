// src/components/ExpiredMembersPage.js

import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore'; // ⬅️ add query, where
import { Link } from 'react-router-dom';

const ExpiredMembersPage = () => {
  const [students, setStudents] = useState([]);
  const [expiredStudents, setExpiredStudents] = useState([]);

  const parseDate = (dateString) => {
    if (!dateString) return null;
    const [day, month, year] = dateString.split('/');
    const d = new Date(year, month - 1, day);
    if (isNaN(d)) return null;
    // Optional: make it valid through end-of-day
    d.setHours(23, 59, 59, 999);
    return d;
  };

  const isExpired = (validUpto) => {
    const validUntilDate = parseDate(validUpto);
    return validUntilDate && validUntilDate < new Date();
  };

  useEffect(() => {
    const fetchData = async () => {
      // Only fetch ACTIVE students (active == 1)
      const q = query(collection(db, 'students'), where('active', '==', 1));
      const snap = await getDocs(q);

      const studentData = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      // From active students, show only expired
      const expiredData = studentData.filter((s) => isExpired(s.valid_upto));

      setStudents(studentData);
      setExpiredStudents(expiredData);
    };

    fetchData();
  }, []);

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
              <tr key={student.id || index}>
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
