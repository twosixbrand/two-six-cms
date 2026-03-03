import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FiBox, FiSearch } from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import StockList from '../components/stock/StockList';
import StockForm from '../components/stock/StockForm';
import * as clothingSizeApi from '../services/clothingSizeApi';
import { logError } from '../services/errorApi';

const StockPage = () => {
    // We are now managing clothingSizes directly as "Inventory"
    const [inventoryItems, setInventoryItems] = useState([]);
    const [currentItem, setCurrentItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const data = await clothingSizeApi.getClothingSizes();
            setInventoryItems(data);
        } catch (err) {
            logError(err, '/stock');
            setError('Failed to fetch inventory. ' + err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const filteredInventory = useMemo(() => {
        if (!searchTerm) {
            return inventoryItems;
        }
        return inventoryItems
            .filter(item => {
                const searchTermLower = searchTerm.toLowerCase();
                const fieldsToSearch = [
                    item.clothingColor?.design?.reference,
                    item.clothingColor?.design?.clothing?.name,
                    item.clothingColor?.color?.name,
                    item.size?.name,
                    item.id.toString()
                ];
                return fieldsToSearch.some(field =>
                    field?.toLowerCase().includes(searchTermLower)
                );
            })
            .sort((a, b) => {
                const refA = a.clothingColor?.design?.reference || '';
                const refB = b.clothingColor?.design?.reference || '';
                return refA.localeCompare(refB, undefined, { numeric: true, sensitivity: 'base' });
            });
    }, [inventoryItems, searchTerm]);

    const handleSave = async (itemData) => {
        try {
            setError('');
            // We only "Update" sizes here. Creation happens in ClothingColor contextual flow.
            if (currentItem) {
                await clothingSizeApi.updateClothingSize(currentItem.id, itemData);
            }
            fetchData();
            setCurrentItem(null);
        } catch (err) {
            logError(err, '/stock-save');
            setError('Failed to update inventory. ' + err.message);
        }
    };

    const handleEdit = (item) => {
        setCurrentItem(item);
    };

    const handleCancel = () => {
        setCurrentItem(null);
    };

    return (
        <div className="page-container">
            <PageHeader title="Inventory Management" icon={<FiBox />}>
                <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
                    <FiSearch style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontSize: '1.2rem', zIndex: 2 }} />
                    <input
                        type="text"
                        placeholder="Search by ref, color, size..."
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
                    <StockForm
                        onSave={handleSave}
                        currentItem={currentItem}
                        onCancel={handleCancel}
                    // We no longer pass explicit lists of "available" sizes because we just list/edit existing ones
                    />
                </div>

                <div className="list-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h2>Inventory List</h2>
                    </div>
                    {loading ? (
                        <p>Loading...</p>
                    ) : (
                        <StockList
                            items={filteredInventory}
                            onEdit={handleEdit}
                            onDelete={() => { }}
                        // Delete removed because deleting the 'Size' deletes the product link. 
                        // User should delete from ClothingColor page if they want to remove the variant entirely.
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default StockPage;
