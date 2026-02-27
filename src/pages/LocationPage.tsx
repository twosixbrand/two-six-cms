import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import locationApi from '../services/locationApi';
import './LocationPage.css';

const LocationPage = () => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editValue, setEditValue] = useState('');

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            const data = await locationApi.getDepartments();
            setDepartments(data);
        } catch (error) {
            console.error('Error fetching departments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (dept) => {
        setEditingId(dept.id);
        setEditValue(dept.shipping_cost);
    };

    const handleSaveClick = async (id) => {
        try {
            await locationApi.updateDepartment(id, { shipping_cost: Number(editValue) });
            setDepartments(departments.map(d =>
                d.id === id ? { ...d, shipping_cost: Number(editValue) } : d
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
                <h1>Gestión de Ubicaciones y Envíos</h1>
            </div>

            <table className="location-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Departamento</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {departments.map((dept) => (
                        <tr key={dept.id}>
                            <td>{dept.id}</td>
                            <td>{dept.name}</td>
                            <td>
                                <Link to={`/locations/${dept.id}`} className="btn-view" style={{ textDecoration: 'none', display: 'inline-block' }}>
                                    Ver Municipios
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default LocationPage;
