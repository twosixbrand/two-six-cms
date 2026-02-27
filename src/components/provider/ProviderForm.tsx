import React, { useState, useEffect } from 'react';

const ProviderForm = ({ onSave, currentItem, onCancel }) => {
  const [item, setItem] = useState({
    id: '',
    company_name: '',
    email: '',
    phone: '',
    account_number: '',
    account_type: '',
    bank_name: '',
  });

  useEffect(() => {
    if (currentItem) {
      setItem(currentItem);
    } else {
      setItem({
        id: '',
        company_name: '',
        email: '',
        phone: '',
        account_number: '',
        account_type: '',
        bank_name: '',
      });
    }
  }, [currentItem]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setItem({ ...item, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(item);
    setItem({ id: '', company_name: '', email: '', phone: '', account_number: '', account_type: '', bank_name: '' });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>{currentItem ? 'Edit Provider' : 'Add Provider'}</h3>
      <input
        name="id"
        type="text"
        placeholder="NIT"
        value={item.id}
        onChange={handleChange}
        required
        disabled={!!currentItem}
      />
      <input
        name="company_name"
        type="text"
        placeholder="Company Name"
        value={item.company_name}
        onChange={handleChange}
        required
      />
      <input
        name="email"
        type="email"
        placeholder="Email"
        value={item.email}
        onChange={handleChange}
        required
      />
      <input name="phone" type="text" placeholder="Phone" value={item.phone} onChange={handleChange} required />
      <input
        name="account_number"
        type="text"
        placeholder="Account Number"
        value={item.account_number}
        onChange={handleChange}
        required
      />
      <input name="account_type" type="text" placeholder="Account Type" value={item.account_type} onChange={handleChange} required />
      <input name="bank_name" type="text" placeholder="Bank Name" value={item.bank_name} onChange={handleChange} required />

      <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
        <button type="submit">{currentItem ? 'Update' : 'Create'}</button>
        {currentItem && <button type="button" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
};

export default ProviderForm;