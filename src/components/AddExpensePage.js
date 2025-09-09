// src/components/AddExpensePage.js

import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './AddExpensePage.css';

const AddExpensePage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    amount: '',
    category: 'Expense',
    description: '',
    expense_date: '',
    owner: '',
    investment_type: '', // ✅ New field
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await addDoc(collection(db, 'masterExpense'), {
        ...formData,
        amount: Number(formData.amount),
        expense_date: formatDate(formData.expense_date),
        verified: 1, // ✅ Automatically set
      });

      alert('Expense added to masterExpense successfully!');
      navigate('/expenses');
    } catch (err) {
      console.error('Error adding expense:', err);
      alert('Failed to add expense.');
    }
  };

  const handleCancel = () => {
    navigate('/expenses');
  };

  return (
    <div className="add-expense-container">
      <h1>Add New Expense</h1>
      <form onSubmit={handleSubmit} className="add-expense-form">
        <div className="form-group">
          <label>Amount</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Category</label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Expense Date</label>
          <input
            type="date"
            name="expense_date"
            value={formData.expense_date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Owner</label>
          <select
            name="owner"
            value={formData.owner}
            onChange={handleChange}
            required
          >
            <option value="">-- Select Owner --</option>
            <option value="staff">Staff</option>
            <option value="Rahul">Rahul</option>
            <option value="Vidya">Vidya</option>
          </select>
        </div>

        <div className="form-group">
          <label>Investment Type</label>
          <select
            name="investment_type"
            value={formData.investment_type}
            onChange={handleChange}
            required
          >
            <option value="">-- Select Investment Type --</option>
            <option value="Electricity">Electricity</option>
            <option value="Rent">Rent</option>
            <option value="Capital">Capital</option>
            <option value="Variable">Variable</option>
            <option value="Salary">Salary</option>
            <option value="Sweeper">Sweeper</option>
          </select>
        </div>

        <div className="form-buttons">
          <button type="submit">Add Expense</button>
          <button type="button" onClick={handleCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddExpensePage;
