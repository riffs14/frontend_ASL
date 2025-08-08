import React, { useEffect, useState } from 'react';
import { db } from '../firebase'; // Import db from the updated firebase.js
import { collection, getDocs, updateDoc, doc } from "firebase/firestore"; // Firestore methods
import { Link } from 'react-router-dom'; // Link for routing
import { auth } from '../firebase'; // Firebase authentication import

const ExpensesTable = () => {
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [filter, setFilter] = useState('all'); // Track the active filter
  const [showDialog, setShowDialog] = useState(false); // For displaying the modal
  const [selectedExpense, setSelectedExpense] = useState(null); // For storing selected expense
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch expenses data from Firestore
  useEffect(() => {
    if (!auth.currentUser) return; // If no user is logged in, return
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const expenseSnapshot = await getDocs(collection(db, 'expenses'));
        const expenseData = expenseSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        setExpenses(expenseData);
        setFilteredExpenses(expenseData); // Initially show all expenses
      } catch (err) {
        setError('Error fetching data.');
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Update verified status of an expense
  const handleVerify = async (expenseId) => {
    setSelectedExpense(expenses.find(exp => exp.id === expenseId)); // Find and store the selected expense
    setShowDialog(true); // Show the dialog
  };

  const handleConfirmVerification = async () => {
    if (selectedExpense) {
      const expenseRef = doc(db, 'expenses', selectedExpense.id);
      await updateDoc(expenseRef, { verified: 1 }); // Update the verified field to 1

      // Update the local state to reflect the verification change
      setExpenses((prevExpenses) => 
        prevExpenses.map((expense) =>
          expense.id === selectedExpense.id ? { ...expense, verified: 1 } : expense
        )
      );
      setFilteredExpenses((prevExpenses) => 
        prevExpenses.map((expense) =>
          expense.id === selectedExpense.id ? { ...expense, verified: 1 } : expense
        )
      );
    }
    setShowDialog(false); // Close the dialog after verification
  };

  // Filter expenses based on the selected filter
  const handleFilterChange = (filterType) => {
    setFilter(filterType);

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    if (filterType === 'expensesThisMonth') {
      setFilteredExpenses(
        expenses.filter(expense => {
          const expenseDate = new Date(expense.expense_date.split('/').reverse().join('-'));
          return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
        })
      );
    } else if (filterType === 'unverifiedThisMonth') {
      setFilteredExpenses(
        expenses.filter(expense => {
          const expenseDate = new Date(expense.expense_date.split('/').reverse().join('-'));
          return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear && expense.verified === 0;
        })
      );
    } else {
      setFilteredExpenses(expenses); // Show all expenses
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h1>Expenses Details</h1>
      
      {/* Filter Buttons */}
      <div>
        <button onClick={() => handleFilterChange('expensesThisMonth')}>Expenses This Month</button>
        <button onClick={() => handleFilterChange('unverifiedThisMonth')}>Unverified Expenses This Month</button>
        <button onClick={() => handleFilterChange('all')}>Show All Expenses</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Serial No.</th>
            <th>Amount</th>
            <th>Category</th>
            <th>Description</th>
            <th>Expense Date</th>
            <th>Verified</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredExpenses.map((expense, index) => (
            <tr key={expense.id}>
              <td>{index + 1}</td>
              <td>{expense.amount}</td>
              <td>{expense.category}</td>
              <td>{expense.description}</td>
              <td>{expense.expense_date}</td>
              <td>{expense.verified === 0 ? 'Unverified' : 'Verified'}</td>
              <td>
                {expense.verified === 0 && (
                  <button onClick={() => handleVerify(expense.id)}>Verify</button>
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
            <p><strong>Expense Date:</strong> {selectedExpense.expense_date}</p>
            <p><strong>Amount:</strong> {selectedExpense.amount}</p>
            <p><strong>Category:</strong> {selectedExpense.category}</p>
            <p><strong>Description:</strong> {selectedExpense.description}</p>
            <p><strong>Verified:</strong> {selectedExpense.verified === 1 ? 'Verified' : 'Unverified'}</p>
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

export default ExpensesTable;
