import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useParams, useNavigate } from 'react-router-dom';
import './StudentEditPage.css'; // Add a CSS file to style the page

const StudentEditPage = () => {
  const { studentId } = useParams(); // Get student ID from URL
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [formData, setFormData] = useState({
    active: 1,
    address: '',
    amount: 0,
    drop_reason: '',
    dues: 0,
    fathers_name: '',
    final_amount: 0,
    joining_date: '',
    last_active_toggle: '',
    name: '',
    payment: 1,
    phone: '',
    receipt_number: '',
    seat_number: '',
    shift_count: 1,
    shift_end: '',
    shift_name: '',
    shift_start: '',
    valid_upto: '',
    verified: 0,
  });

  // Fetch student data for the provided student ID
  useEffect(() => {
    const fetchStudentData = async () => {
      const docRef = doc(db, 'students', studentId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const studentData = docSnap.data();
        setStudent(studentData);
        setFormData({ ...studentData });
      } else {
        console.log('No such document!');
      }
    };

    fetchStudentData();
  }, [studentId]);

  // Handle form field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Convert Date to dd/mm/yyyy format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Handle form submission to update student data in Firestore
  const handleUpdate = async () => {
    const studentRef = doc(db, 'students', studentId);

    // Convert date fields to dd/mm/yyyy format
    const formattedJoiningDate = formatDate(formData.joining_date);
    const formattedValidUpto = formatDate(formData.valid_upto);

    try {
      await updateDoc(studentRef, {
        ...formData,
        joining_date: formattedJoiningDate, // Use the formatted date
        valid_upto: formattedValidUpto,     // Use the formatted date
      });
      alert('Student data updated successfully!');
      navigate('/students'); // Navigate back to the students page
    } catch (error) {
      console.error('Error updating document: ', error);
    }
  };

  // Handle cancel (go back to students page)
  const handleCancel = () => {
    navigate('/students');
  };

  return (
    <div className="edit-container">
      <h1>Edit Student</h1>

      {/* Show form to edit student details */}
      {student && (
        <form className="student-edit-form">
          <div className="form-group">
            <label>Active</label>
            <input
              type="number"
              name="active"
              value={formData.active}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>Amount</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>Drop Reason</label>
            <input
              type="text"
              name="drop_reason"
              value={formData.drop_reason}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>Final Amount</label>
            <input
              type="number"
              name="final_amount"
              value={formData.final_amount}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>Shift Name</label>
            <input
              type="text"
              name="shift_name"
              value={formData.shift_name}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>Valid Upto</label>
            <input
              type="date"
              name="valid_upto"
              value={formData.valid_upto}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>Joining Date</label>
            <input
              type="date"
              name="joining_date"
              value={formData.joining_date}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <button type="button" onClick={handleUpdate}>Update</button>
            <button type="button" onClick={handleCancel}>Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
};

export default StudentEditPage;
