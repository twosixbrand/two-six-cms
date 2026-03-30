import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FiBox } from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import StockList from '../components/stock/StockList';
import StockForm from '../components/stock/StockForm';
import { SearchInput, LoadingSpinner } from '../components/ui';
import * as clothingSizeApi from '../services/clothingSizeApi';
import { logError } from '../services/errorApi';

const StockPage = () => {
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
                const refComp = refA.localeCompare(refB, undefined, { numeric: true, sensitivity: 'base' });
                if (refComp !== 0) return refComp;

                const sizeOrder = { 'XS': 1, 'S': 2, 'M': 3, 'L': 4, 'XL': 5, 'XXL': 6 };
                const sizeA = a.size?.name || '';
                const sizeB = b.size?.name || '';
                const orderA = sizeOrder[sizeA.toUpperCase()] || 99;
                const orderB = sizeOrder[sizeB.toUpperCase()] || 99;

                if (orderA !== orderB) return orderA - orderB;
                return sizeA.localeCompare(sizeB, undefined, { numeric: true, sensitivity: 'base' });
            });
    }, [inventoryItems, searchTerm]);

    const handleSave = async (itemData) => {
        try {
            setError('');
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
                <div style={{ width: '100%', maxWidth: '400px' }}>
                    <SearchInput
                        value={searchTerm}
                        onChange={setSearchTerm}
                        placeholder="Search by ref, color, size..."
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
                    />
                </div>

                <div className="list-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h2>Inventory List</h2>
                    </div>
                    {loading ? (
                        <LoadingSpinner text="Loading..." />
                    ) : (
                        <StockList
                            items={filteredInventory}
                            onEdit={handleEdit}
                            onDelete={() => { }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default StockPage;
