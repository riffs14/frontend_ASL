import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { collection, getDocs, updateDoc, doc, addDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const ExpensesTable = () => {
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showDialog, setShowDialog] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper: parse dd/mm/yyyy or mm/dd/yyyy safely (your data shows dd/mm/yyyy)
  const parseExpenseDate = (str) => {
    if (!str || typeof str !== 'string') return null;
    const parts = str.split('/');
    if (parts.length !== 3) return new Date(str); // fallback
    const [dd, mm, yyyy] = parts.map(p => parseInt(p, 10));
    if (Number.isNaN(dd) || Number.isNaN(mm) || Number.isNaN(yyyy)) return new Date(str);
    return new Date(yyyy, mm - 1, dd);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setError(null);

      try {
        setLoading(true);
        const snapshot = await getDocs(collection(db, 'expenses'));
        const data = snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
        setExpenses(data);
        setFilteredExpenses(data); // default: all
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Error fetching data.');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleVerify = (expenseId) => {
    const item = expenses.find(exp => exp.id === expenseId) || null;
    setSelectedExpense(item);
    setShowDialog(true);
  };

  const handleConfirmVerification = async () => {
    if (selectedExpense) {
      try {
        const expenseRef = doc(db, 'expenses', selectedExpense.id);
        await updateDoc(expenseRef, { verified: 1 });

        // Add the expense to masterExpense table if the category is "Expense"
        if (selectedExpense.category === 'Expense') {
          const masterExpenseRef = collection(db, 'masterExpense');
          await addDoc(masterExpenseRef, {
            amount: selectedExpense.amount,
            category: selectedExpense.category,
            description: selectedExpense.description,
            expense_date: selectedExpense.expense_date,
            verified: 1, // Mark as verified
            owner:"staff"
          });
          console.log('Expense added to masterExpense table.');
        }

        const updater = (list) =>
          list.map(e => e.id === selectedExpense.id ? { ...e, verified: 1 } : e);

        setExpenses(updater);
        setFilteredExpenses(updater);
      } catch (err) {
        console.error('Error updating verification:', err);
        setError('Failed to verify expense. Try again.');
      }
    }
    setShowDialog(false);
  };

  const handleFilterChange = (filterType) => {
    setFilter(filterType);

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const inThisMonth = (expense) => {
      const dt = parseExpenseDate(expense.expense_date);
      if (!(dt instanceof Date) || isNaN(dt)) return false;
      return dt.getMonth() === currentMonth && dt.getFullYear() === currentYear;
    };

    if (filterType === 'expensesThisMonth') {
      setFilteredExpenses(expenses.filter(inThisMonth));
    } else if (filterType === 'unverifiedThisMonth') {
      setFilteredExpenses(expenses.filter(e => inThisMonth(e) && Number(e.verified) === 0));
    } else {
      setFilteredExpenses(expenses);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error)   return <div>{error}</div>;

  return (
    <div>
      <h1>Expenses Details</h1>

      {/* Filter Buttons */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button
          onClick={() => handleFilterChange('expensesThisMonth')}
          disabled={filter === 'expensesThisMonth'}
        >
          Expenses This Month
        </button>
        <button
          onClick={() => handleFilterChange('unverifiedThisMonth')}
          disabled={filter === 'unverifiedThisMonth'}
        >
          Unverified Expenses This Month
        </button>
        <button
          onClick={() => handleFilterChange('all')}
          disabled={filter === 'all'}
        >
          Show All Expenses
        </button>
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
              <td>{Number(expense.verified) === 0 ? 'Unverified' : 'Verified'}</td>
              <td>
                {Number(expense.verified) === 0 && (
                  <button onClick={() => handleVerify(expense.id)}>Verify</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Confirmation Dialog */}
      {showDialog && selectedExpense && (
        <div className="modal">
          <div className="modal-content">
            <h2>Confirm Verification</h2>
            <p><strong>Expense Date:</strong> {selectedExpense.expense_date}</p>
            <p><strong>Amount:</strong> {selectedExpense.amount}</p>
            <p><strong>Category:</strong> {selectedExpense.category}</p>
            <p><strong>Description:</strong> {selectedExpense.description}</p>
            <p>
              <strong>Verified:</strong>{' '}
              {Number(selectedExpense.verified) === 1 ? 'Verified' : 'Unverified'}
            </p>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
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
