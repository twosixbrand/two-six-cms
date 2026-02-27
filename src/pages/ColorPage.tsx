import React, { useState, useEffect } from "react";
import ColorList from '../components/color/ColorList';
import ColorForm from '../components/color/ColorForm';
import { logError } from "../services/errorApi";
import * as colorApi from '../services/colorApi';

const ColorPage = () => {
  const [colors, setColors] = useState([]);
  const [currentItem, setCurrentItem] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      <h1>Administrar Colores</h1>
      {error && <p className="error-message">{error}</p>}
      <div className="grid-container">
        <div className="form-card">
          <ColorForm onSave={handleSave} currentItem={currentItem} onCancel={handleCancel} />
        </div>
        <div className="list-card">
          <h2>Colores Existentes</h2>
          {loading ? <p>Cargando...</p> : <ColorList colors={colors} onEdit={handleEdit} onDelete={handleDelete} />}
        </div>
      </div>
    </div>
  );
};

export default ColorPage;