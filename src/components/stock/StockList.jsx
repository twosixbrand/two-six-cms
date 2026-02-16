import React from 'react';
import './StockList.css';

const StockList = ({ items, onEdit, onDelete }) => {
    return (
        <div className="stock-list-container">
            <table className="stock-table">
                <thead>
                    <tr>
                        <th>Ref</th>
                        <th>Product</th>
                        <th>Variant</th>
                        <th>Produced</th>
                        <th>Available</th>
                        <th>Sold</th>
                        <th>Alert</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, index) => {
                        const currentRef = item.clothingColor?.design?.reference;
                        const prevRef = items[index - 1]?.clothingColor?.design?.reference;
                        const showHeader = index === 0 || currentRef !== prevRef;

                        return (
                            <React.Fragment key={item.id}>
                                {showHeader && (
                                    <tr className="reference-header-row" style={{ backgroundColor: '#f0f0f0' }}>
                                        <td colSpan="8" style={{ fontWeight: 'bold', padding: '10px' }}>
                                            Reference: {currentRef}
                                        </td>
                                    </tr>
                                )}
                                <tr>
                                    <td>{/* Reference is now in header */}</td>
                                    <td className="design-cell">
                                        {item.clothingColor?.design?.clothing?.name && <div>{item.clothingColor.design.clothing.name}</div>}
                                    </td>
                                    <td>
                                        <span className="variant-badge">
                                            {item.clothingColor?.color?.name} / {item.size?.name}
                                        </span>
                                    </td>
                                    <td>{item.quantity_produced}</td>
                                    <td>
                                        <span style={{
                                            color: (item.quantity_minimum_alert !== null && item.quantity_available <= item.quantity_minimum_alert) ? 'red' : 'inherit',
                                            fontWeight: (item.quantity_minimum_alert !== null && item.quantity_available <= item.quantity_minimum_alert) ? 'bold' : 'normal'
                                        }}>
                                            {item.quantity_available}
                                        </span>
                                    </td>
                                    <td>{item.quantity_sold}</td>
                                    <td>{item.quantity_minimum_alert !== null ? item.quantity_minimum_alert : '-'}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button onClick={() => onEdit(item)} className="btn-edit">Edit</button>
                                        </div>
                                    </td>
                                </tr>
                            </React.Fragment>
                        );
                    })}
                    {items.length === 0 && (
                        <tr>
                            <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>
                                No stock records found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default StockList;
