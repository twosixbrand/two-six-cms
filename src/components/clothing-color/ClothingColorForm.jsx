import React, { useState, useEffect } from 'react';

const ClothingColorForm = ({ onSave, currentItem, onCancel, designs, colors, sizes, genders }) => {
  const getInitialEditState = () => ({
    id_design: '',
    id_color: '',
    id_size: '',
    quantity_produced: 0,
    quantity_available: 0,
    quantity_sold: 0,
    quantity_on_consignment: 0,
    quantity_under_warranty: 0,
  });

  const [id_design, setIdDesign] = useState('');
  const [id_color, setIdColor] = useState('');
  const [editFormData, setEditFormData] = useState(getInitialEditState());

  const [filteredGenders, setFilteredGenders] = useState([]);

  // Filter Genders based on selected Design
  useEffect(() => {
    if (id_design) {
      const selectedDesign = designs.find(d => d.id === parseInt(id_design));
      if (selectedDesign && selectedDesign.clothing && selectedDesign.clothing.genderClothing) {
        const allowedGenderIds = selectedDesign.clothing.genderClothing.map(gc => gc.id_gender);
        const filtered = genders.filter(g => allowedGenderIds.includes(g.id));
        setFilteredGenders(filtered);
      } else {
        setFilteredGenders(genders); // Fallback to all if no relation found
      }
    } else {
      setFilteredGenders([]);
    }
  }, [id_design, designs, genders]);

  // State for new flow: map sizeId -> { selected: boolean, quantity: number }
  const [sizeSelections, setSizeSelections] = useState({});

  useEffect(() => {
    if (currentItem) {
      setEditFormData({
        id_design: currentItem.id_design || '',
        id_color: currentItem.id_color || '',
        id_size: currentItem.id_size || '',
        quantity_produced: currentItem.quantity_produced || 0,
        quantity_available: currentItem.quantity_available || 0,
        quantity_sold: currentItem.quantity_sold || 0,
        quantity_on_consignment: currentItem.quantity_on_consignment || 0,
        quantity_under_warranty: currentItem.quantity_under_warranty || 0,
      });
      setIdDesign('');
      setIdColor('');
      setSizeSelections({});
    } else {
      setEditFormData(getInitialEditState());
    }
  }, [currentItem]);

  // Handle Size Checkbox
  const handleSizeToggle = (sizeId) => {
    setSizeSelections(prev => {
      const current = prev[sizeId] || { selected: false, quantity: 0 };
      return {
        ...prev,
        [sizeId]: { ...current, selected: !current.selected }
      };
    });
  };

  // Handle Quantity Change for a size
  const handleSizeQuantityChange = (sizeId, qty) => {
    setSizeSelections(prev => ({
      ...prev,
      [sizeId]: { ...prev[sizeId], quantity: parseInt(qty, 10) || 0 }
    }));
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (currentItem) {
      // Edit Mode
      const dataToSave = {
        ...editFormData,
        id_color: parseInt(editFormData.id_color, 10),
        id_size: parseInt(editFormData.id_size, 10),
        quantity_produced: parseInt(editFormData.quantity_produced, 10),
        quantity_available: parseInt(editFormData.quantity_available, 10),
        quantity_sold: parseInt(editFormData.quantity_sold, 10),
        quantity_on_consignment: parseInt(editFormData.quantity_on_consignment, 10),
        quantity_under_warranty: parseInt(editFormData.quantity_under_warranty, 10),
      };
      delete dataToSave.id_design;
      // Note: id_gender usually not editable here or needs Logic.
      onSave(dataToSave);
    } else {
      // New "Contextual" Creation Mode
      const sizesData = [];
      Object.keys(sizeSelections).forEach(sizeId => {
        if (sizeSelections[sizeId].selected) {
          sizesData.push({
            id_size: parseInt(sizeId, 10),
            quantity_produced: sizeSelections[sizeId].quantity,
            quantity_available: sizeSelections[sizeId].quantity
          });
        }
      });

      if (sizesData.length === 0) {
        alert("Please select at least one size.");
        return;
      }

      const payload = {
        id_design,
        id_color,
        sizes: JSON.stringify(sizesData)
      };

      onSave(payload);

      // Reset
      setIdDesign('');
      setIdColor('');
      setSizeSelections({});
    }
  };

  if (currentItem) {
    // Edit Form (unchanged structure mostly)
    return (
      <form onSubmit={handleSubmit}>
        <h3>Edit Clothing Color</h3>
        <div className="form-group">
          <label>Design</label>
          <select name="id_design" value={editFormData.id_design} onChange={handleEditFormChange} required disabled>
            <option value="">Select Design</option>
            {designs.map(d => <option key={d.id} value={d.id}>{d.reference} - {d.clothing?.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Color</label>
          <select name="id_color" value={editFormData.id_color} onChange={handleEditFormChange} required>
            <option value="">Select Color</option>
            {colors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        {/* Gender usually comes from design->clothing->gender, but if customizable on this level: */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}><button type="submit">Update</button><button type="button" onClick={onCancel}>Cancel</button></div>
      </form>
    );
  }

  // New "Contextual" Creation Form
  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <h3>Create Contextual Clothing Color</h3>

      <div className="main-fields-section">
        <div className="form-group">
          <label>Design (Product Parent)</label>
          <select name="id_design" value={id_design} onChange={(e) => setIdDesign(e.target.value)} required>
            <option value="">Select Design Model</option>
            {designs.map(d => <option key={d.id} value={d.id}>{d.reference} - {d.clothing?.name} ({d.collection?.name})</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Color</label>
          <select name="id_color" value={id_color} onChange={(e) => setIdColor(e.target.value)} required>
            <option value="">Select Color</option>
            {colors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      <div className="sizes-section">
        <h4>Select Sizes</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px' }}>
          {sizes.map(size => {
            const isSelected = sizeSelections[size.id]?.selected || false;
            return (
              <div key={size.id} className="size-card" style={{ border: isSelected ? '2px solid #007bff' : '1px solid #ddd', padding: '10px', borderRadius: '5px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', width: '100%' }}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSizeToggle(size.id)}
                      style={{ marginRight: '8px' }}
                    />
                    {size.name}
                  </label>
                </div>
                {isSelected && (
                  <div style={{ marginTop: '10px' }}>
                    <label style={{ fontSize: '0.8rem' }}>Qty:</label>
                    <input
                      type="number"
                      value={sizeSelections[size.id]?.quantity || 0}
                      onChange={(e) => handleSizeQuantityChange(size.id, e.target.value)}
                      style={{ width: '100%', padding: '4px' }}
                      min="0"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" disabled={!id_design || !id_color}>Create Versions</button>
      </div>
    </form>
  );
};

export default ClothingColorForm;