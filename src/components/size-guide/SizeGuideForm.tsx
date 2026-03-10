import React, { useState, useEffect } from 'react';

const SizeGuideForm = ({ onSave, currentItem, onCancel }) => {
    const getInitialState = () => ({ size: '', width: '', length: '' });
    const [formData, setFormData] = useState(getInitialState());

    useEffect(() => {
        if (currentItem) {
            setFormData({
                size: currentItem.size || '',
                width: currentItem.width || '',
                length: currentItem.length || '',
            });
        } else {
            setFormData(getInitialState());
        }
    }, [currentItem]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem' }}>
                {currentItem ? 'Editar Medida de Talla' : 'Nueva Medida de Talla'}
            </h3>

            {currentItem && (
                <div className="form-group">
                    <label>ID</label>
                    <input name="id" type="text" value={currentItem.id} readOnly disabled />
                </div>
            )}

            <div className="form-group">
                <label htmlFor="size">Talla (Letra o Nombre)</label>
                <input
                    id="size"
                    name="size"
                    type="text"
                    value={formData.size}
                    onChange={handleChange}
                    placeholder="Ej: M, XL, U (Única)"
                    required
                />
            </div>

            <div className="form-group">
                <label htmlFor="width">Ancho de Pecho (cm)</label>
                <input
                    id="width"
                    name="width"
                    type="text"
                    value={formData.width}
                    onChange={handleChange}
                    placeholder="Ej: 53"
                    required
                />
            </div>

            <div className="form-group">
                <label htmlFor="length">Largo Total (cm)</label>
                <input
                    id="length"
                    name="length"
                    type="text"
                    value={formData.length}
                    onChange={handleChange}
                    placeholder="Ej: 72"
                    required
                />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                    {currentItem ? 'Actualizar' : 'Crear'}
                </button>
                {currentItem && (
                    <button type="button" className="btn-secondary" onClick={onCancel} style={{ flex: 1 }}>
                        Cancelar
                    </button>
                )}
            </div>
        </form>
    );
};

export default SizeGuideForm;
