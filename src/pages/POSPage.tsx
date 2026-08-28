import React, { useState, useEffect, useMemo } from 'react';
import Swal from 'sweetalert2';
import { FiSearch, FiTrash2, FiPlus, FiMinus, FiShoppingBag } from 'react-icons/fi';
import { getActiveProducts, savePosSale } from '../services/posApi';
import './POSPage.css';

interface Product {
  id_design: number;
  id: number;
  name: string;
  description: string;
  slug: string;
  price: number;
  image_url: string;
  reference: string;
  color_name: string;
  size_name: string;
  quantity_available: number;
}

interface CartItem extends Product {
  cart_quantity: number;
}

const POSPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Seleccion modal/inline
  const [selectedDesign, setSelectedDesign] = useState<string | null>(null);

  // Formulario
  const [customerMode, setCustomerMode] = useState<'GENERIC' | 'IDENTIFIED'>('GENERIC');
  const [formData, setFormData] = useState({
    docType: '13',
    docNumber: '',
    fullName: '',
    email: '',
    phone: ''
  });
  const [paymentMethod, setPaymentMethod] = useState<'10' | '48' | '49'>('10');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const data = await getActiveProducts();
      setProducts(data);
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'No se pudieron cargar los productos.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Agrupar por diseño/referencia para mostrar en la grilla y luego tallas
  const groupedProducts = useMemo(() => {
    const grouped = new Map<string, { base: Product; sizes: Product[] }>();
    products.forEach(p => {
      // Usar slug o reference + color como clave
      const key = `${p.reference}-${p.color_name}`;
      if (!grouped.has(key)) {
        grouped.set(key, { base: p, sizes: [] });
      }
      grouped.get(key)!.sizes.push(p);
    });
    
    let result = Array.from(grouped.values());
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(g => 
        g.base.name.toLowerCase().includes(q) || 
        g.base.reference?.toLowerCase().includes(q) ||
        g.base.color_name?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [products, searchQuery]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.cart_quantity >= product.quantity_available) {
          Swal.fire('Atención', 'No hay más stock disponible de esta talla', 'warning');
          return prev;
        }
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, cart_quantity: item.cart_quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, cart_quantity: 1 }];
    });
    setSelectedDesign(null); // Cerrar selector de tallas
  };

  const updateCartQuantity = (productId: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = item.cart_quantity + delta;
        if (newQty > 0 && newQty <= item.quantity_available) {
          return { ...item, cart_quantity: newQty };
        }
      }
      return item;
    }));
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const subtotalOriginal = cart.reduce((sum, item) => sum + (Number(item.price || 0) * item.cart_quantity), 0);
  const totalQuantity = cart.reduce((sum, item) => sum + item.cart_quantity, 0);

  // Lógica de Descuento por Feria
  let discountPerItem = 0;
  if (totalQuantity === 1) {
    discountPerItem = 10000; // 79900 -> 69900
  } else if (totalQuantity === 2) {
    discountPerItem = 14950; // 79900 -> 64950
  } else if (totalQuantity >= 3) {
    discountPerItem = 21900; // 79900 -> 58000
  }

  const totalDiscount = discountPerItem * totalQuantity;
  const subtotalWithDiscount = subtotalOriginal - totalDiscount;

  const subtotalNet = subtotalWithDiscount / 1.19;
  const taxTotal = subtotalWithDiscount - subtotalNet;
  const total = subtotalWithDiscount;

  const handleSaveSale = async () => {
    if (cart.length === 0) return;
    
    if (customerMode === 'IDENTIFIED') {
      if (!formData.docNumber || !formData.fullName) {
        Swal.fire('Atención', 'Debe ingresar al menos Documento y Nombre del cliente', 'warning');
        return;
      }
    }

    try {
      setIsSaving(true);
      
      const payload = {
        customerName: customerMode === 'GENERIC' ? 'Consumidor Final' : formData.fullName,
        customerDoc: customerMode === 'GENERIC' ? '222222222222' : formData.docNumber,
        customerDocType: customerMode === 'GENERIC' ? '13' : formData.docType,
        customerEmail: customerMode === 'IDENTIFIED' ? formData.email : null,
        customerPhone: customerMode === 'IDENTIFIED' ? formData.phone : null,
        paymentMethod: paymentMethod,
        subtotal: subtotalNet,
        taxTotal: taxTotal,
        total: total,
        lines: cart.map(item => ({
          description: `${item.name} - ${item.color_name} - Talla ${item.size_name}`,
          quantity: item.cart_quantity,
          unitPrice: (Number(item.price || 0) - discountPerItem) / 1.19,
          taxPercent: 19
        }))
      };

      await savePosSale(payload);
      
      Swal.fire({
        icon: 'success',
        title: '¡Venta Registrada!',
        text: 'La venta se ha guardado exitosamente. Podrá ser facturada en el panel administrativo.',
        timer: 2000,
        showConfirmButton: false
      });
      
      // Reiniciar
      setCart([]);
      setCustomerMode('GENERIC');
      setFormData({ docType: '13', docNumber: '', fullName: '', email: '', phone: '' });
      
    } catch (error: any) {
      console.error(error);
      Swal.fire('Error', error.message || 'No se pudo guardar la venta', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="pos-container">
      {/* Panel Izquierdo: Catálogo */}
      <div className="pos-catalog">
        <div className="pos-search">
          <input 
            type="text" 
            placeholder="🔍 Buscar producto por nombre, referencia o color..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="pos-grid">
          {isLoading && <p>Cargando catálogo...</p>}
          
          {groupedProducts.map((group) => {
            const isSelected = selectedDesign === `${group.base.reference}-${group.base.color_name}`;
            
            return (
              <div key={`${group.base.reference}-${group.base.color_name}`} className="pos-product-card">
                <img src={group.base.image_url} alt={group.base.name} className="pos-product-image" onClick={() => setSelectedDesign(isSelected ? null : `${group.base.reference}-${group.base.color_name}`)} />
                <div className="pos-product-info">
                  <h4 className="pos-product-name">{group.base.name}</h4>
                  <div className="pos-product-meta">Ref: {group.base.reference} | Color: {group.base.color_name}</div>
                  <div className="pos-product-price">
                    ${Number(group.base.price || 0)}
                  </div>
                  
                  <div className="pos-size-selector">
                    {isSelected ? (
                      group.sizes.map(size => (
                        <button 
                          key={size.id}
                          className="pos-size-chip"
                          onClick={(e) => { e.stopPropagation(); addToCart(size); }}
                        >
                          {size.size_name}
                        </button>
                      ))
                    ) : (
                      <button 
                        className="pos-size-chip" 
                        style={{ marginTop: 12, width: '100%', textAlign: 'center', background: 'var(--primary-color)', color: '#000', border: 'none' }}
                        onClick={(e) => { e.stopPropagation(); setSelectedDesign(`${group.base.reference}-${group.base.color_name}`); }}
                      >
                        Elegir Talla
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Panel Derecho: Carrito */}
      <div className="pos-cart-panel">
        <div className="pos-cart-header">
          <span>🛍️ Carrito</span>
          <span style={{color: 'var(--primary-color)'}}>{cart.length} ítems</span>
        </div>

        <div className="pos-cart-items">
          {cart.length === 0 ? (
            <div className="pos-empty-cart">
              <FiShoppingBag size={48} style={{opacity: 0.5, marginBottom: 16}}/>
              <p>El carrito está vacío</p>
              <p>Selecciona productos del catálogo</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="pos-cart-item">
                <div className="pos-cart-item-info">
                  <div className="pos-cart-item-title">{item.name}</div>
                  <div className="pos-cart-item-meta">Talla: {item.size_name} | Color: {item.color_name}</div>
                  <div style={{color: 'var(--primary-color)', fontWeight: 600}}>${Number(item.price || 0).toLocaleString('es-CO')}</div>
                </div>
                <div className="pos-cart-item-actions">
                  <button className="pos-qty-btn" onClick={() => updateCartQuantity(item.id, -1)}>
                    <span style={{fontSize: '18px', fontWeight: 'bold'}}>-</span>
                  </button>
                  <span style={{width: 24, textAlign: 'center'}}>{item.cart_quantity}</span>
                  <button className="pos-qty-btn" onClick={() => updateCartQuantity(item.id, 1)}>
                    <span style={{fontSize: '18px', fontWeight: 'bold'}}>+</span>
                  </button>
                  <button className="pos-qty-btn" style={{borderColor: 'var(--error-color)', color: 'var(--error-color)'}} onClick={() => removeFromCart(item.id)}>
                    <span style={{fontSize: '16px'}}>🗑️</span>
                  </button>
                </div>
              </div>
            ))
          )}

          <div className="pos-customer-toggle" style={{ marginTop: '24px' }}>
            <div 
              className={`pos-customer-tab ${customerMode === 'GENERIC' ? 'active' : ''}`}
              onClick={() => setCustomerMode('GENERIC')}
            >
              Consumidor Final
            </div>
            <div 
              className={`pos-customer-tab ${customerMode === 'IDENTIFIED' ? 'active' : ''}`}
              onClick={() => setCustomerMode('IDENTIFIED')}
            >
              Cliente Identificado
            </div>
          </div>

          {customerMode === 'IDENTIFIED' && (
            <div className="pos-customer-form">
              <div style={{display: 'flex', gap: 8}}>
                <div className="pos-input-group" style={{flex: 1}}>
                  <label>Tipo Doc.</label>
                  <select value={formData.docType} onChange={e => setFormData({...formData, docType: e.target.value})}>
                    <option value="13">Cédula</option>
                    <option value="31">NIT</option>
                    <option value="22">Cédula Ext.</option>
                    <option value="42">Pasaporte</option>
                  </select>
                </div>
                <div className="pos-input-group" style={{flex: 2}}>
                  <label>Número</label>
                  <input type="text" value={formData.docNumber} onChange={e => setFormData({...formData, docNumber: e.target.value})} placeholder="Ej: 10203040" />
                </div>
              </div>
              <div className="pos-input-group">
                <label>Nombre / Razón Social</label>
                <input type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
              </div>
              <div className="pos-input-group">
                <label>Email (Envío Factura DIAN)</label>
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
            </div>
          )}

          <div className="pos-payment-methods">
            <button className={`pos-payment-btn ${paymentMethod === '10' ? 'active' : ''}`} onClick={() => setPaymentMethod('10')}>
              <span style={{fontSize: 20}}>💵</span> Efectivo
            </button>
            <button className={`pos-payment-btn ${paymentMethod === '48' ? 'active' : ''}`} onClick={() => setPaymentMethod('48')}>
              <span style={{fontSize: 20}}>💳</span> Tarjeta
            </button>
            <button className={`pos-payment-btn ${paymentMethod === '49' ? 'active' : ''}`} onClick={() => setPaymentMethod('49')}>
              <span style={{fontSize: 20}}>📱</span> Transfer.
            </button>
          </div>
        </div>

        <div className="pos-cart-summary">
          <div className="summary-row">
            <span>Subtotal (Base)</span>
            <span>${subtotalOriginal.toLocaleString('es-CO')}</span>
          </div>
          {totalDiscount > 0 && (
            <div className="summary-row" style={{ color: 'var(--success-color, #4caf50)', fontWeight: 600 }}>
              <span>Descuento Feria</span>
              <span>-${totalDiscount.toLocaleString('es-CO')}</span>
            </div>
          )}
          <div className="summary-row">
            <span>IVA (19%)</span>
            <span>${taxTotal.toLocaleString('es-CO', {maximumFractionDigits: 0})}</span>
          </div>
          <div className="summary-row total">
            <span>TOTAL</span>
            <span>${total.toLocaleString('es-CO')}</span>
          </div>
        </div>

        <div className="pos-action-bar">
          <button 
            className="pos-btn-save" 
            onClick={handleSaveSale} 
            disabled={cart.length === 0 || isSaving}
          >
            {isSaving ? 'Guardando...' : 'GUARDAR VENTA'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default POSPage;
