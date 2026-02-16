import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as clothingColorApi from '../services/clothingColorApi';
import * as imageClothingApi from '../services/imageClothingApi';
import { logError } from '../services/errorApi';

const ImageClothingPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [clothingColor, setClothingColor] = useState(null);
    const [clothingColors, setClothingColors] = useState([]);
    const [images, setImages] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const fetchDetails = useCallback(async () => {
        try {
            const data = await clothingColorApi.getClothingColor(id);
            setClothingColor(data);
        } catch (err) {
            logError(err, 'image-clothing-fetch-details');
            setError('Could not load clothing color details.');
        }
    }, [id]);

    const fetchList = useCallback(async () => {
        try {
            const data = await clothingColorApi.getClothingColors();
            console.log("Fetched list data:", data);
            const list = Array.isArray(data) ? data : [];
            list.sort((a, b) => {
                const refA = a.design?.reference || '';
                const refB = b.design?.reference || '';
                return refA.localeCompare(refB, undefined, { numeric: true, sensitivity: 'base' });
            });
            setClothingColors(list);
        } catch (err) {
            console.error(err);
            logError(err, 'image-clothing-fetch-list');
            setError('Failed to load list.');
        }
    }, []);

    const fetchImages = useCallback(async () => {
        try {
            const imgs = await imageClothingApi.getImages(id);
            setImages(imgs);
        } catch (err) {
            // If endpoint returns 404 for empty list or something, handle gracefully
            console.warn("Could not fetch images or empty", err);
            setImages([]);
        }
    }, [id]);

    useEffect(() => {
        if (id) {
            fetchDetails();
            fetchImages();
        } else {
            fetchList();
        }
    }, [id, fetchDetails, fetchImages, fetchList]);

    const handleUpload = async (e) => {
        e.preventDefault();
        const files = e.target.files.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append('files', files[i]);
        }

        try {
            await imageClothingApi.uploadImages(id, formData);
            e.target.reset(); // clear input
            fetchImages(); // refresh list
        } catch (err) {
            logError(err, 'image-upload');
            alert('Upload failed: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (imageId) => {
        if (!window.confirm("Delete image?")) return;
        try {
            await imageClothingApi.deleteImage(imageId);
            fetchImages();
        } catch (err) {
            alert("Failed to delete image");
        }
    }

    const handleDragStart = (e, index) => {
        e.dataTransfer.setData('text/plain', index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = async (e, dropIndex) => {
        e.preventDefault();
        const dragIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
        if (dragIndex === dropIndex) return;

        const newImages = [...images];
        const [movedItem] = newImages.splice(dragIndex, 1);
        newImages.splice(dropIndex, 0, movedItem);

        // Update local positions effectively
        const updatedImages = newImages.map((img, index) => ({
            ...img,
            position: index + 1
        }));

        setImages(updatedImages);

        try {
            const imageIds = updatedImages.map(img => img.id_image_clothing);
            await imageClothingApi.reorderImages(id, imageIds);
        } catch (err) {
            console.error("Failed to save order", err);
            fetchImages();
        }
    };

    if (!id) {
        // ... (existing code)
        return (
            <div className="page-container">
                <h1>Select Clothing Color to Manage Images</h1>
                {error && <p className="error-message">{error}</p>}
                <div style={{ display: 'grid', gap: '10px' }}>
                    {Array.isArray(clothingColors) && clothingColors.map(item => (
                        <div key={item.id} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white' }}>
                            <div>
                                <strong>{item.design?.reference}</strong> - {item.color?.name} ({item.design?.clothing?.name}) - {item.design?.collection?.name}
                            </div>
                            <button onClick={() => navigate(`/image-clothing/${item.id}`)}>Manage Images</button>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    if (error) return <div className="page-container"><p className="error-message">{error}</p></div>;
    if (!clothingColor) return <div>Loading details...</div>;

    return (
        <div className="page-container">
            <button onClick={() => navigate('/clothing-color')} style={{ marginBottom: '1rem' }}>&larr; Back to List</button>

            <h1>Manage Images</h1>
            <div style={{ background: '#f9f9f9', padding: '1rem', marginBottom: '2rem', borderRadius: '8px' }}>
                <h3>{clothingColor.design?.reference} - {clothingColor.color?.name}</h3>
                <p><strong>Design:</strong> {clothingColor.design?.clothing?.name}</p>
                <p><strong>Gender:</strong> {clothingColor.design?.clothing?.gender?.name || 'Unisex/All'}</p>
            </div>

            <div style={{ marginBottom: '2rem' }}>
                <h4>Upload New Images</h4>
                <form onSubmit={handleUpload} style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <input type="file" name="files" multiple accept="image/*" required />
                    <button type="submit" disabled={uploading}>{uploading ? 'Uploading...' : 'Upload'}</button>
                </form>
            </div>

            <div className="images-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
                {images.map((img, index) => (
                    <div
                        key={img.id_image_clothing}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, index)}
                        style={{ border: '1px solid #ccc', padding: '5px', borderRadius: '4px', position: 'relative', cursor: 'grab' }}
                    >
                        <img src={img.image_url} alt="Variant" style={{ width: '100%', height: '150px', objectFit: 'cover', pointerEvents: 'none' }} />
                        <div style={{ marginTop: '5px', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                            <span>Pos: {img.position}</span>
                            <button onClick={() => handleDelete(img.id_image_clothing)} style={{ background: 'red', color: 'white', border: 'none', cursor: 'pointer', padding: '2px 5px' }}>X</button>
                        </div>
                    </div>
                ))}
            </div>
            {images.length === 0 && <p>No images uploaded yet.</p>}
        </div>
    );
};

export default ImageClothingPage;
