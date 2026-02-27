import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import locationApi from '../services/locationApi';
import './LocationPage.css'; // Reuse CSS

const LocationDetailPage = () => {
    const { id } = useParams();
    const [cities, setCities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [departmentName, setDepartmentName] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editValue, setEditValue] = useState('');

    useEffect(() => {
        fetchCities();
        fetchDepartmentName();
    }, [id]);

    const fetchDepartmentName = async () => {
        // Ideally we should have an endpoint for single department or pass it via state
        // For now, let's fetch all and find (optimization for later)
        try {
            const depts = await locationApi.getDepartments();
            const dept = depts.find(d => d.id === Number(id));
            if (dept) setDepartmentName(dept.name);
        } catch (e) { console.error(e); }
    };

    const fetchCities = async () => {
        try {
            const data = await locationApi.getCities(id); // Fetch all (active and inactive)
            setCities(data);
        } catch (error) {
            console.error('Error fetching cities:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleActive = async (city) => {
        const newState = !city.active;
        try {
            // Optimistic update
            setCities(cities.map(c => c.id === city.id ? { ...c, active: newState } : c));

            await locationApi.updateCity(city.id, { active: newState });
        } catch (error) {
            console.error('Error updating city status:', error);
            // Revert on error
            setCities(cities.map(c => c.id === city.id ? { ...c, active: !newState } : c));
            alert('Error al actualizar el estado del municipio');
        }
    };

    const handleEditClick = (city) => {
        setEditingId(city.id);
        setEditValue(city.shipping_cost);
    };

    const handleSaveClick = async (cityId) => {
        try {
            await locationApi.updateCity(cityId, { shipping_cost: Number(editValue) });
            setCities(cities.map(c =>
                c.id === cityId ? { ...c, shipping_cost: Number(editValue) } : c
            ));
            setEditingId(null);
        } catch (error) {
            console.error('Error updating shipping cost:', error);
            alert('Error al actualizar el costo de envío');
        }
    };

    const handleCancelClick = () => {
        setEditingId(null);
    };

    if (loading) return <div>Cargando...</div>;

    return (
        <div className="location-page">
            <div className="location-header">
                <h1>Municipios de {departmentName}</h1>
                <Link to="/locations" className="btn-edit" style={{ textDecoration: 'none' }}>Volver</Link>
            </div>

            <table className="location-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Costo de Envío</th>
                        <th>Estado (Habilitado)</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {cities.map((city) => (
                        <tr key={city.id}>
                            <td>{city.id}</td>
                            <td>{city.name}</td>
                            <td>
                                {editingId === city.id ? (
                                    <input
                                        type="number"
                                        className="shipping-input"
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                    />
                                ) : (
                                    `$${(city.shipping_cost || 0).toLocaleString()}`
                                )}
                            </td>
                            <td>
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={city.active}
                                        onChange={() => handleToggleActive(city)}
                                    />
                                    <span className="slider"></span>
                                </label>
                            </td>
                            <td>
                                {editingId === city.id ? (
                                    <>
                                        <button className="btn-view" onClick={() => handleSaveClick(city.id)}>Guardar</button>
                                        <button className="btn-edit" style={{ backgroundColor: '#ef4444' }} onClick={handleCancelClick}>Cancelar</button>
                                    </>
                                ) : (
                                    <button className="btn-edit" onClick={() => handleEditClick(city)}>Editar Costo</button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default LocationDetailPage;
