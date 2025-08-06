import React, { useEffect, useState } from 'react';
import { db } from '../firebase'; // Import db from the updated firebase.js
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";

const BookingTable = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showDialog, setShowDialog] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Helper function to filter bookings for the current month
  const isBookingThisMonth = (bookingDate) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const bookingDateObj = new Date(bookingDate.split('/').reverse().join('-'));
    return bookingDateObj.getMonth() === currentMonth && bookingDateObj.getFullYear() === currentYear;
  };

  // Fetch the data from Firestore
  useEffect(() => {
    const fetchData = async () => {
      const bookingSnapshot = await getDocs(collection(db, 'bookings'));
      const studentSnapshot = await getDocs(collection(db, 'students'));

      const studentData = studentSnapshot.docs.reduce((acc, doc) => {
        acc[doc.id] = doc.data(); // Store student data with student_id as the key
        return acc;
      }, {});

      const bookingData = bookingSnapshot.docs.map(doc => {
        const data = doc.data();
        const student = studentData[data.student_id];
        return {
          id: doc.id, // Add booking ID
          booking_date: data.booking_date,
          amount: data.amount,
          cash: data.cash,
          online: data.online,
          verified: data.verified, // Assuming the "verified" field is part of the booking data
          student_name: student ? student.name : 'N/A',
          valid_upto: student ? student.valid_upto : 'N/A',
          shift_name: student ? student.shift_name : 'N/A',
          student_account_name: data.student_account_name || '', // Directly reference the student_account_name from the bookings collection
        };
      });

      setBookings(bookingData);
      setFilteredBookings(bookingData); // Initially show all bookings
    };

    fetchData();
  }, []);

  // Handle button click to apply filters
  const handleFilterChange = (filterType) => {
    setFilter(filterType);

    if (filterType === 'thisMonth') {
      setFilteredBookings(bookings.filter(booking => isBookingThisMonth(booking.booking_date)));
    } else if (filterType === 'unverifiedThisMonth') {
      setFilteredBookings(bookings.filter(booking => isBookingThisMonth(booking.booking_date) && booking.verified === 0));
    } else {
      setFilteredBookings(bookings); // Show all bookings
    }
  };

  // Open the dialog with booking details
  const handleVerifyClick = (booking) => {
    setSelectedBooking(booking);
    setShowDialog(true);  // Show the dialog
  };

  // Confirm verification and update the verified field
  const handleConfirmVerification = async () => {
    if (selectedBooking) {
      const bookingRef = doc(db, 'bookings', selectedBooking.id);
      await updateDoc(bookingRef, { verified: 1 });

      // Update the local state to reflect the verification change
      setBookings(prevBookings =>
        prevBookings.map(booking =>
          booking.id === selectedBooking.id ? { ...booking, verified: 1 } : booking
        )
      );
      setFilteredBookings(prevBookings =>
        prevBookings.map(booking =>
          booking.id === selectedBooking.id ? { ...booking, verified: 1 } : booking
        )
      );
    }
    setShowDialog(false); // Close the dialog after verification
  };

  return (
    <div>
      <h1>Booking Details</h1>

      {/* Filter Buttons */}
      <div>
        <button onClick={() => handleFilterChange('thisMonth')}>Bookings this month</button>
        <button onClick={() => handleFilterChange('unverifiedThisMonth')}>Unverified this month</button>
        <button onClick={() => handleFilterChange('all')}>Show all bookings</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Serial No.</th>
            <th>Date</th>
            <th>Amount</th>
            <th>Cash</th>
            <th>Online</th>
            <th>Student Name</th>
            <th>Valid Upto</th>
            <th>Shift</th>
            <th>Verified</th>
            <th>Student Account Name</th> {/* Added this column */}
            <th>Action</th> {/* Added Verify button column */}
          </tr>
        </thead>
        <tbody>
          {filteredBookings.map((booking, index) => (
            <tr key={booking.id}>
              <td>{index + 1}</td> {/* Serial number starts from 1 */}
              <td>{booking.booking_date}</td>
              <td>{booking.amount}</td>
              <td>{booking.cash}</td>
              <td>{booking.online}</td>
              <td>{booking.student_name}</td>
              <td>{booking.valid_upto}</td>
              <td>{booking.shift_name}</td>
              <td>{booking.verified === 0 ? 'Unverified' : 'Verified'}</td>
              <td>{booking.student_account_name || ''}</td> {/* Show student_account_name or empty string */}
              <td>
                {booking.verified === 0 && (
                  <button onClick={() => handleVerifyClick(booking)}>Verify</button> 
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Confirmation Dialog */}
      {showDialog && (
        <div className="modal">
          <div className="modal-content">
            <h2>Confirm Verification</h2>
            <p><strong>Booking Date:</strong> {selectedBooking.booking_date}</p>
            <p><strong>Amount:</strong> {selectedBooking.amount}</p>
            <p><strong>Cash:</strong> {selectedBooking.cash}</p>
            <p><strong>Online:</strong> {selectedBooking.online}</p>
            <p><strong>Student Name:</strong> {selectedBooking.student_name}</p>
            <p><strong>Valid Upto:</strong> {selectedBooking.valid_upto}</p>
            <p><strong>Shift:</strong> {selectedBooking.shift_name}</p>
            <p><strong>Student Account Name:</strong> {selectedBooking.student_account_name || 'N/A'}</p>
            <div>
              <button onClick={handleConfirmVerification}>Confirm</button>
              <button onClick={() => setShowDialog(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingTable;
