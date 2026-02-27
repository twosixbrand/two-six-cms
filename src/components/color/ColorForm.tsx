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
      <h3>{currentItem ? 'Editar Color' : 'Agregar Color'}</h3>

      <div className="form-group">
        <label htmlFor="hex-picker">Seleccionar Color</label>
        <input
          type="color"
          id="hex-picker"
          value={hex}
          onChange={(e) => setHex(e.target.value)}
          style={{ width: '100%', height: '40px', padding: '0.25rem', border: 'none', cursor: 'pointer' }}
        />
      </div>

      <div className="form-group">
        <label htmlFor="hex-code">Código Hex</label>
        <input type="text" id="hex-code" value={hex} onChange={(e) => setHex(e.target.value)} required />
      </div>

      <div className="form-group">
        <label htmlFor="name">Nombre del Color (sugerido)</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
        <button type="submit">{currentItem ? 'Actualizar' : 'Guardar'}</button>
        {currentItem && <button type="button" onClick={onCancel}>Cancelar</button>}
      </div>
    </form>
  );
};

export default ColorForm;