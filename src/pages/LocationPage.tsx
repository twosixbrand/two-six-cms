import React, { useState, useEffect, useMemo } from 'react';
import { FiMap, FiChevronDown, FiChevronRight, FiCheck, FiX, FiEdit2, FiDollarSign } from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import { LoadingSpinner, SearchInput, Button } from '../components/ui';
import locationApi from '../services/locationApi';
import './LocationPage.css';

const LocationPage = () => {
    const [departments, setDepartments] = useState([]);
    const [citiesMap, setCitiesMap] = useState({});
    const [expandedDept, setExpandedDept] = useState(null);
    const [loadingCities, setLoadingCities] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Inline editing state
    const [editingCityId, setEditingCityId] = useState(null);
    const [editCostValue, setEditCostValue] = useState('');

    // Bulk editing state
    const [bulkEditDeptId, setBulkEditDeptId] = useState(null);
    const [bulkCostValue, setBulkCostValue] = useState('');

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

    const handleToggleDept = async (deptId) => {
        if (expandedDept === deptId) {
            setExpandedDept(null);
            return;
        }
        setExpandedDept(deptId);

        if (!citiesMap[deptId]) {
            setLoadingCities(deptId);
            try {
                const cities = await locationApi.getCities(deptId);
                setCitiesMap(prev => ({ ...prev, [deptId]: cities }));
            } catch (error) {
                console.error('Error fetching cities:', error);
            } finally {
                setLoadingCities(null);
            }
        }
    };

    const handleToggleActive = async (city) => {
        const newState = !city.active;
        setCitiesMap(prev => ({
            ...prev,
            [city.id_department]: prev[city.id_department].map(c =>
                c.id === city.id ? { ...c, active: newState } : c
            ),
        }));
        try {
            await locationApi.updateCity(city.id, { active: newState });
        } catch (error) {
            console.error('Error updating city status:', error);
            setCitiesMap(prev => ({
                ...prev,
                [city.id_department]: prev[city.id_department].map(c =>
                    c.id === city.id ? { ...c, active: !newState } : c
                ),
            }));
        }
    };

    const handleEditCost = (city) => {
        setEditingCityId(city.id);
        setEditCostValue(String(city.shipping_cost || 0));
    };

    const handleSaveCost = async (city) => {
        const newCost = Number(editCostValue);
        try {
            await locationApi.updateCity(city.id, { shipping_cost: newCost });
            setCitiesMap(prev => ({
                ...prev,
                [city.id_department]: prev[city.id_department].map(c =>
                    c.id === city.id ? { ...c, shipping_cost: newCost } : c
                ),
            }));
            setEditingCityId(null);
        } catch (error) {
            console.error('Error updating shipping cost:', error);
        }
    };

    const handleCancelEdit = () => {
        setEditingCityId(null);
    };

    const handleBulkEditClick = (e, deptId) => {
        e.stopPropagation();
        setBulkEditDeptId(deptId);
        setBulkCostValue('');
    };

    const handleBulkSave = async (deptId) => {
        const newCost = Number(bulkCostValue);
        if (isNaN(newCost) || newCost < 0) return;
        try {
            await locationApi.bulkUpdateCitiesCost(deptId, newCost);
            if (citiesMap[deptId]) {
                setCitiesMap(prev => ({
                    ...prev,
                    [deptId]: prev[deptId].map(c => ({ ...c, shipping_cost: newCost })),
                }));
            }
            setBulkEditDeptId(null);
        } catch (error) {
            console.error('Error bulk updating shipping cost:', error);
        }
    };

    const handleBulkCancel = (e) => {
        e.stopPropagation();
        setBulkEditDeptId(null);
    };

    const filteredDepartments = useMemo(() => {
        if (!searchTerm.trim()) return departments;
        const term = searchTerm.toLowerCase();
        return departments.filter(dept => {
            if (dept.name.toLowerCase().includes(term)) return true;
            const cities = citiesMap[dept.id];
            if (cities) {
                return cities.some(c => c.name.toLowerCase().includes(term));
            }
            return false;
        });
    }, [departments, searchTerm, citiesMap]);

    const getFilteredCities = (deptId) => {
        const cities = citiesMap[deptId] || [];
        if (!searchTerm.trim()) return cities;
        const term = searchTerm.toLowerCase();
        const dept = departments.find(d => d.id === deptId);
        if (dept && dept.name.toLowerCase().includes(term)) return cities;
        return cities.filter(c => c.name.toLowerCase().includes(term));
    };

    const getActiveCityCount = (deptId) => {
        const cities = citiesMap[deptId];
        if (!cities) return null;
        return cities.filter(c => c.active).length;
    };

    if (loading) {
        return (
            <div className="page-container">
                <PageHeader title="Departamentos y Ciudades" icon={<FiMap />} />
                <LoadingSpinner text="Cargando departamentos..." />
            </div>
        );
    }

    return (
        <div className="page-container">
            <PageHeader title="Departamentos y Ciudades" icon={<FiMap />} />

            {/* Search bar */}
            <div style={{ maxWidth: '500px', marginBottom: '1rem' }}>
                <SearchInput
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder="Buscar departamento o ciudad..."
                />
            </div>

            {/* Summary */}
            <div className="loc-summary">
                <span className="loc-summary-item">{departments.length} departamentos</span>
            </div>

            {/* Accordion */}
            <div className="loc-accordion">
                {filteredDepartments.map((dept) => {
                    const isExpanded = expandedDept === dept.id;
                    const isLoadingThis = loadingCities === dept.id;
                    const activeCities = getActiveCityCount(dept.id);
                    const cities = getFilteredCities(dept.id);

                    return (
                        <div key={dept.id} className={`loc-dept-card ${isExpanded ? 'expanded' : ''}`}>
                            {/* Department header */}
                            <div className="loc-dept-header" onClick={() => handleToggleDept(dept.id)}>
                                <div className="loc-dept-left">
                                    <span className="loc-dept-chevron">
                                        {isExpanded ? <FiChevronDown /> : <FiChevronRight />}
                                    </span>
                                    <span className="loc-dept-name">{dept.name}</span>
                                </div>
                                <div className="loc-dept-right">
                                    {bulkEditDeptId === dept.id ? (
                                        <div className="loc-bulk-edit" onClick={(e) => e.stopPropagation()}>
                                            <span className="loc-currency">$</span>
                                            <input
                                                type="number"
                                                placeholder="Costo para todas"
                                                value={bulkCostValue}
                                                onChange={(e) => setBulkCostValue(e.target.value)}
                                                className="loc-bulk-input"
                                                autoFocus
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleBulkSave(dept.id);
                                                    if (e.key === 'Escape') handleBulkCancel(e);
                                                }}
                                            />
                                            <button className="loc-save-btn" onClick={() => handleBulkSave(dept.id)} title="Aplicar a todas">
                                                <FiCheck size={13} />
                                            </button>
                                            <button className="loc-cancel-btn" onClick={handleBulkCancel} title="Cancelar">
                                                <FiX size={13} />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <button
                                                className="loc-bulk-btn"
                                                onClick={(e) => handleBulkEditClick(e, dept.id)}
                                                title="Editar costo de envío para todas las ciudades"
                                            >
                                                <FiDollarSign size={14} />
                                            </button>
                                            {activeCities !== null && (
                                                <span className="loc-dept-badge">
                                                    {activeCities} activas
                                                </span>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Expanded cities */}
                            {isExpanded && (
                                <div className="loc-cities-panel">
                                    {isLoadingThis ? (
                                        <LoadingSpinner size="sm" text="Cargando ciudades..." />
                                    ) : cities.length === 0 ? (
                                        <div className="loc-cities-empty">No se encontraron ciudades.</div>
                                    ) : (
                                        <table className="loc-cities-table">
                                            <thead>
                                                <tr>
                                                    <th>Ciudad</th>
                                                    <th>Costo Envío</th>
                                                    <th>Estado</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {cities.map((city) => (
                                                    <tr key={city.id} className={!city.active ? 'inactive-row' : ''}>
                                                        <td className="loc-city-name">{city.name}</td>
                                                        <td className="loc-city-cost">
                                                            {editingCityId === city.id ? (
                                                                <div className="loc-inline-edit">
                                                                    <span className="loc-currency">$</span>
                                                                    <input
                                                                        type="number"
                                                                        value={editCostValue}
                                                                        onChange={(e) => setEditCostValue(e.target.value)}
                                                                        className="loc-cost-input"
                                                                        autoFocus
                                                                        onKeyDown={(e) => {
                                                                            if (e.key === 'Enter') handleSaveCost(city);
                                                                            if (e.key === 'Escape') handleCancelEdit();
                                                                        }}
                                                                    />
                                                                    <button className="loc-save-btn" onClick={() => handleSaveCost(city)} title="Guardar">
                                                                        <FiCheck size={13} />
                                                                    </button>
                                                                    <button className="loc-cancel-btn" onClick={handleCancelEdit} title="Cancelar">
                                                                        <FiX size={13} />
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <div className="loc-cost-display" onClick={() => handleEditCost(city)}>
                                                                    <span>${(city.shipping_cost || 0).toLocaleString()}</span>
                                                                    <FiEdit2 size={12} className="loc-edit-icon" />
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td>
                                                            <label className="loc-toggle">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={city.active}
                                                                    onChange={() => handleToggleActive(city)}
                                                                />
                                                                <span className="loc-toggle-slider"></span>
                                                                <span className="loc-toggle-label">
                                                                    {city.active ? 'Activo' : 'Inactivo'}
                                                                </span>
                                                            </label>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default LocationPage;
