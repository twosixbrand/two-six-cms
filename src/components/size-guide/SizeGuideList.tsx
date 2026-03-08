import React from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';

const SizeGuideList = ({ items, onEdit, onDelete }) => {
    return (
        <div className="table-responsive">
            <table className="table table-striped table-hover mt-3">
                <thead className="table-dark">
                    <tr>
                        <th>ID</th>
                        <th>Talla</th>
                        <th>Ancho de Pecho (cm)</th>
                        <th>Largo Total (cm)</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item) => (
                        <tr key={item.id}>
                            <td>{item.id}</td>
                            <td>{item.size}</td>
                            <td>{item.width} cm</td>
                            <td>{item.length} cm</td>
                            <td>
                                <button
                                    className="btn btn-warning btn-sm me-2"
                                    onClick={() => onEdit(item)}
                                    title="Editar"
                                    style={{
                                        backgroundColor: 'var(--accent-color)',
                                        color: '#fff',
                                        border: 'none',
                                    }}
                                >
                                    <FaEdit />
                                </button>
                                <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() => onDelete(item.id)}
                                    title="Eliminar"
                                >
                                    <FaTrash />
                                </button>
                            </td>
                        </tr>
                    ))}
                    {items.length === 0 && (
                        <tr>
                            <td colSpan="5" className="text-center">
                                No hay medidas registradas.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default SizeGuideList;
