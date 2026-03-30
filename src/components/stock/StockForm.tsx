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
            <div className="stock-form" style={{ textAlign: 'center', padding: '20px', color: '#a0a0b0' }}>
                <p>Please select an item from the list to edit its inventory.</p>
                <div style={{ fontSize: '0.9em', marginTop: '10px' }}>
                    To create new items, go to the <strong>Clothing Color</strong> page and add sizes there.
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="stock-form">
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem' }}>
                Editar Inventario
            </h3>

            <div className="form-info" style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <strong style={{ color: 'var(--primary-color)' }}>Variante: </strong>
                <span>{currentItem.clothingColor?.design?.reference} ({currentItem.clothingColor?.color?.name} - {currentItem.size?.name})</span>
            </div>

            <div className="form-group">
                <label htmlFor="quantity_produced">Producidos</label>
                <input
                    id="quantity_produced"
                    type="number"
                    name="quantity_produced"
                    value={formData.quantity_produced}
                    onChange={handleChange}
                    min="0"
                    required
                />
            </div>

            <div className="form-group">
                <label htmlFor="quantity_available">Disponibles</label>
                <input
                    id="quantity_available"
                    type="number"
                    name="quantity_available"
                    value={formData.quantity_available}
                    onChange={handleChange}
                    min="0"
                    required
                />
            </div>

            <div className="form-group">
                <label htmlFor="quantity_sold">Vendidos</label>
                <input
                    id="quantity_sold"
                    type="number"
                    name="quantity_sold"
                    value={formData.quantity_sold}
                    onChange={handleChange}
                    min="0"
                    required
                />
            </div>

            <div className="form-group">
                <label htmlFor="quantity_on_consignment">En Consignación</label>
                <input
                    id="quantity_on_consignment"
                    type="number"
                    name="quantity_on_consignment"
                    value={formData.quantity_on_consignment}
                    onChange={handleChange}
                    min="0"
                    required
                />
            </div>

            <div className="form-group">
                <label htmlFor="quantity_under_warranty">En Garantía</label>
                <input
                    id="quantity_under_warranty"
                    type="number"
                    name="quantity_under_warranty"
                    value={formData.quantity_under_warranty}
                    onChange={handleChange}
                    min="0"
                    required
                />
            </div>

            <div className="form-group" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginTop: '1rem' }}>
                <label htmlFor="quantity_minimum_alert" style={{ color: '#d9534f' }}>Alerta de Cantidad Mínima</label>
                <input
                    id="quantity_minimum_alert"
                    type="number"
                    name="quantity_minimum_alert"
                    value={formData.quantity_minimum_alert}
                    onChange={handleChange}
                    placeholder="Ej. 5"
                    min="0"
                />
                <small style={{ display: 'block', marginTop: '5px', color: 'var(--text-secondary)' }}>Alertar cuando la cantidad baje de este umbral.</small>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '1.5rem' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Actualizar Inventario</button>
                <button type="button" onClick={onCancel} className="btn-secondary" style={{ flex: 1 }}>Cancelar</button>
            </div>
        </form>
    );
};

export default StockForm;
