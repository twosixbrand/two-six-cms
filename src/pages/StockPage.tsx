import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
            <h1>Inventory Management</h1>
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
                        <input
                            type="text"
                            placeholder="Search by ref, color, size..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            style={{
                                padding: '8px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                width: '250px'
                            }}
                        />
                    </div>
                    {loading ? (
                        <p>Loading...</p>
                    ) : (
                        <StockList
                            items={filteredInventory}
                            onEdit={handleEdit}
                            onDelete={() => {}}
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
