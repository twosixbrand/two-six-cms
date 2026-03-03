import React, { useState, useEffect, useMemo } from "react";
import { FiAperture, FiSearch } from "react-icons/fi";
import PageHeader from '../components/common/PageHeader';
import ColorList from '../components/color/ColorList';
import ColorForm from '../components/color/ColorForm';
import { logError } from "../services/errorApi";
import * as colorApi from '../services/colorApi';

const ColorPage = () => {
  const [colors, setColors] = useState([]);
  const [currentItem, setCurrentItem] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchColors = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await colorApi.getColors();
      setColors(data);
    } catch (error) {
      setError("Error al cargar los colores.");
      logError(error, '/color');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColors();
  }, []);

  const filteredColors = useMemo(() => {
    if (!searchTerm) return colors;
    const lowerTerm = searchTerm.toLowerCase();
    return colors.filter(color =>
      color.name?.toLowerCase().includes(lowerTerm) ||
      color.hex?.toLowerCase().includes(lowerTerm)
    );
  }, [colors, searchTerm]);

  const handleSave = async (itemData) => {
    try {
      setError('');
      if (currentItem) {
        await colorApi.updateColor(currentItem.id, itemData);
      } else {
        await colorApi.createColor(itemData);
      }
      fetchColors();
      setCurrentItem(null);
    } catch (error) {
      const action = currentItem ? 'actualizar' : 'crear';
      setError(`Error al ${action} el color.`);
      logError(error, `/color-${action}`);
    }
  };

  const handleEdit = (color) => {
    setCurrentItem(color);
  };

  const handleCancel = () => {
    setCurrentItem(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this color?")) {
      try {
        setError('');
        await colorApi.deleteColor(id);
        fetchColors();
      } catch (error) {
        setError("Error al eliminar el color: " + error.message);
        logError(error, '/color-delete');
      }
    }
  };

  return (
    <div className="page-container">
      <PageHeader title="Administrar Colores" icon={<FiAperture />}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
          <FiSearch style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontSize: '1.2rem', zIndex: 2 }} />
          <input
            type="text"
            placeholder="Search by name or hex..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.8rem 1rem 0.8rem 3.2rem',
              borderRadius: '50px',
              background: 'var(--surface-color)',
              backdropFilter: 'blur(10px)',
              border: '1px solid var(--border-color)',
              boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
              color: 'var(--text-primary)',
              transition: 'all 0.3s ease',
              fontSize: '0.95rem'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--primary-color)';
              e.target.style.boxShadow = '0 4px 20px rgba(212,175,55,0.15)';
              e.target.style.outline = 'none';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--border-color)';
              e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.02)';
            }}
          />
        </div>
      </PageHeader>
      {error && <p className="error-message">{error}</p>}
      <div className="grid-container">
        <div className="form-card">
          <ColorForm onSave={handleSave} currentItem={currentItem} onCancel={handleCancel} />
        </div>
        <div className="list-card">
          {loading ? <p>Cargando...</p> : <ColorList colors={filteredColors} onEdit={handleEdit} onDelete={handleDelete} />}
        </div>
      </div>
    </div>
  );
};

export default ColorPage;