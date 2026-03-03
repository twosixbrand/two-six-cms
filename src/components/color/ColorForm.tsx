import React, { useState, useEffect } from 'react';

const ColorForm = ({ onSave, currentItem, onCancel }) => {
  const [name, setName] = useState('');
  const [hex, setHex] = useState('#ffffff');

  // Diccionario para traducir los nombres de colores más comunes
  const colorNameTranslations = {
    'Black': 'Negro',
    'White': 'Blanco',
    'Red': 'Rojo',
    'Green': 'Verde',
    'Blue': 'Azul',
    'Yellow': 'Amarillo',
    'Purple': 'Morado',
    'Pink': 'Rosado',
    'Orange': 'Naranja',
    'Brown': 'Marrón',
    'Gray': 'Gris',
    'Grey': 'Gris', // Ambas ortografías
    'Silver': 'Plateado',
    'Gold': 'Dorado',
  };

  // Efecto para sugerir un nombre de color cuando cambia el valor hexadecimal
  useEffect(() => {
    const fetchColorName = async () => {
      // Evita llamar a la API con el valor inicial o si no es un hex válido
      if (hex && hex.length === 7) {
        try {
          // La API requiere el código hexadecimal sin el '#'
          const cleanHex = hex.substring(1);
          const response = await fetch(`https://www.thecolorapi.com/id?hex=${cleanHex}`);
          const data = await response.json();
          if (data.name && data.name.value) {
            const englishName = data.name.value;
            // Traduce el nombre si está en el diccionario, si no, usa el original
            setName(colorNameTranslations[englishName] || englishName);
          }
        } catch (error) {
          console.error("Error fetching color name:", error);
          // No bloquea al usuario, puede escribir el nombre manualmente
        }
      }
    };

    // Agrega un debounce para no llamar a la API en cada mínimo cambio
    const timeoutId = setTimeout(fetchColorName, 300);
    return () => clearTimeout(timeoutId);
  }, [hex]);

  useEffect(() => {
    if (currentItem) {
      setName(currentItem.name || '');
      setHex(currentItem.hex || '#ffffff');
    } else {
      setName('');
      setHex('#ffffff');
    }
  }, [currentItem]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ name, hex }); // Envía tanto el nombre como el código hexadecimal
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem' }}>
        {currentItem ? 'Editar Color' : 'Agregar Color'}
      </h3>

      <div className="form-group" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.4)', padding: '0.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
        <input
          type="color"
          id="hex-picker"
          value={hex}
          onChange={(e) => setHex(e.target.value)}
          style={{ width: '50px', height: '50px', padding: '0', border: 'none', borderRadius: '8px', cursor: 'pointer', background: 'transparent' }}
        />
        <div style={{ flex: 1 }}>
          <label htmlFor="hex-code" style={{ marginBottom: '0.2rem', fontSize: '0.8rem' }}>Código Hex</label>
          <input
            type="text"
            id="hex-code"
            value={hex}
            onChange={(e) => setHex(e.target.value)}
            required
            style={{ background: 'transparent', border: 'none', padding: '0', boxShadow: 'none', fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', width: '100%' }}
          />
        </div>
      </div>

      <div className="form-group" style={{ marginTop: '0.5rem' }}>
        <label htmlFor="name">Nombre del Color (sugerido)</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Rojo Oscuro"
          required
        />
      </div>

      <div style={{ display: 'flex', gap: '10px', marginTop: '1.5rem' }}>
        <button type="submit" className="btn-primary" style={{ flex: 1 }}>
          {currentItem ? 'Actualizar' : 'Guardar'}
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

export default ColorForm;