import React, { useState, useEffect } from 'react';
import './StockForm.css';

const StockForm = ({ onSave, currentItem, onCancel }) => {
    const [formData, setFormData] = useState({
        quantity_produced: 0,
        quantity_available: 0,
        quantity_sold: 0,
        quantity_on_consignment: 0,
        quantity_under_warranty: 0,
        quantity_minimum_alert: 0,
        id_size: '', // Metadata for save
        id_clothing_color: '', // Metadata for save
    });

    useEffect(() => {
        if (currentItem) {
            setFormData({
                // Preserve IDs for the API call
                id_size: currentItem.id_size,
                id_clothing_color: currentItem.id_clothing_color,

                quantity_produced: currentItem.quantity_produced || 0,
                quantity_available: currentItem.quantity_available || 0,
                quantity_sold: currentItem.quantity_sold || 0,
                quantity_on_consignment: currentItem.quantity_on_consignment || 0,
                quantity_under_warranty: currentItem.quantity_under_warranty || 0,
                quantity_minimum_alert: currentItem.quantity_minimum_alert || 0,
            });
        }
    }, [currentItem]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    if (!currentItem) {
        return (
            <div className="stock-form" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                <p>Please select an item from the list to edit its inventory.</p>
                <div style={{ fontSize: '0.9em', marginTop: '10px' }}>
                    To create new items, go to the <strong>Clothing Color</strong> page and add sizes there.
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="stock-form">
            <h3>Edit Inventory</h3>

            <div className="form-info">
                <label>Variant:</label>
                <span>{currentItem.clothingColor?.design?.reference} ({currentItem.clothingColor?.color?.name} - {currentItem.size?.name})</span>
            </div>

            <div className="form-group">
                <label>Produced</label>
                <input
                    type="number"
                    name="quantity_produced"
                    value={formData.quantity_produced}
                    onChange={handleChange}
                    min="0"
                    required
                />
            </div>

            <div className="form-group">
                <label>Available</label>
                <input
                    type="number"
                    name="quantity_available"
                    value={formData.quantity_available}
                    onChange={handleChange}
                    min="0"
                    required
                />
            </div>

            <div className="form-group">
                <label>Sold</label>
                <input
                    type="number"
                    name="quantity_sold"
                    value={formData.quantity_sold}
                    onChange={handleChange}
                    min="0"
                    required
                />
            </div>

            <div className="form-group">
                <label>Consignment</label>
                <input
                    type="number"
                    name="quantity_on_consignment"
                    value={formData.quantity_on_consignment}
                    onChange={handleChange}
                    min="0"
                    required
                />
            </div>

            <div className="form-group">
                <label>Warranty</label>
                <input
                    type="number"
                    name="quantity_under_warranty"
                    value={formData.quantity_under_warranty}
                    onChange={handleChange}
                    min="0"
                    required
                />
            </div>

            <div className="form-group" style={{ borderTop: '1px solid #eee', paddingTop: '10px' }}>
                <label style={{ color: '#d9534f' }}>Minimum Quantity Alert</label>
                <input
                    type="number"
                    name="quantity_minimum_alert"
                    value={formData.quantity_minimum_alert}
                    onChange={handleChange}
                    placeholder="e.g. 5"
                    min="0"
                />
                <small style={{ display: 'block', marginTop: '5px', color: '#888' }}>Alert when available quantity falls below this.</small>
            </div>

            <div className="form-actions">
                <button type="submit" className="btn-primary">Update Inventory</button>
                <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
            </div>
        </form>
    );
};

export default StockForm;
