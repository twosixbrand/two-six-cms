import React, { useState, useEffect, useMemo } from 'react';
import { FiRss, FiExternalLink, FiRefreshCcw, FiAlertCircle, FiCheckCircle, FiImage, FiCopy, FiSearch } from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import { DataTable, LoadingSpinner, StatusBadge, SearchInput } from '../components/ui';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
// The production feed URL that Google will read (always shown as reference)
const GOOGLE_FEED_PRODUCTION_URL = 'https://twosixweb.com/api/catalog/google-feed';
// The API endpoint this CMS uses to fetch data (adapts to environment)
const FEED_API_ENDPOINT = `${API_BASE_URL}/products/feed`;

/** Google Product Category ID → Readable name */
const GOOGLE_CATEGORY_NAMES: Record<string, string> = {
  '212': 'Shirts & Tops',
  '5388': 'Sweaters / Hoodies',
  '3066': 'Coats & Jackets',
  '204': 'Pants',
  '207': 'Shorts',
  '187': 'Shoes',
  '173': 'Hats',
  '2271': 'Dresses',
  '1604': 'Clothing (Generic)',
};

/** typeClothing → Google Category ID (mirrors the Next.js route) */
const TYPE_TO_CATEGORY: Record<string, string> = {
  'camiseta': '212',
  'polo': '212',
  'camisa': '212',
  'buso': '5388',
  'chaqueta': '3066',
  'pantalon largo': '204',
  'jean': '204',
  'pantalon corto': '207',
  'calzado': '187',
  'gorra': '173',
  'vestido': '2271',
};

function mapGender(genderName: string): string {
  const normalized = genderName?.toLowerCase().trim() || '';
  if (normalized === 'masculino') return 'male';
  if (normalized === 'femenino') return 'female';
  return 'unisex';
}

interface FeedProduct {
  id: number;
  sku: string;
  price: number;
  discount_price: number | null;
  discount_percentage: number | null;
  active: boolean;
  quantity_available: number;
  slug: string | null;
  color_name: string | null;
  size_name: string | null;
  design_reference: string | null;
  design_description: string | null;
  clothing_name: string;
  gender_name: string;
  type_clothing_name: string | null;
  category_name: string | null;
  image_url: string | null;
  additional_images: string[];
}

/** Validation result for a single product */
interface ValidationIssue {
  field: string;
  severity: 'error' | 'warning';
  message: string;
}

function validateProduct(p: FeedProduct): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!p.sku) issues.push({ field: 'id/sku', severity: 'error', message: 'Sin SKU (g:id)' });
  if (!p.clothing_name) issues.push({ field: 'title', severity: 'error', message: 'Sin nombre de prenda (g:title)' });
  if (!p.image_url) issues.push({ field: 'image_link', severity: 'error', message: 'Sin imagen principal (g:image_link)' });
  if (!p.slug) issues.push({ field: 'link', severity: 'warning', message: 'Sin slug — usará fallback a ID' });
  if (!p.design_description) issues.push({ field: 'description', severity: 'warning', message: 'Sin descripción del diseño — usará texto genérico' });
  if (!p.color_name) issues.push({ field: 'color', severity: 'warning', message: 'Sin color asignado' });
  if (!p.size_name) issues.push({ field: 'size', severity: 'warning', message: 'Sin talla asignada' });
  if (!p.design_reference) issues.push({ field: 'item_group_id', severity: 'warning', message: 'Sin referencia de diseño para agrupar variantes' });
  if (p.price <= 0) issues.push({ field: 'price', severity: 'error', message: 'Precio inválido (debe ser > 0)' });
  if (p.quantity_available < 0) issues.push({ field: 'availability', severity: 'error', message: 'Stock negativo' });

  const typeKey = (p.type_clothing_name || '').toLowerCase().trim();
  if (!TYPE_TO_CATEGORY[typeKey]) {
    issues.push({ field: 'google_product_category', severity: 'warning', message: `Tipo "${p.type_clothing_name}" no mapeado — usará categoría genérica (1604)` });
  }

  return issues;
}

const GoogleMerchantFeedPage: React.FC = () => {
  const [products, setProducts] = useState<FeedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<FeedProduct | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const fetchFeedData = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`${API_BASE_URL}/products/feed`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setProducts(data);
    } catch (err: any) {
      setError(`Error al cargar datos del feed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedData();
  }, []);

  // Compute stats
  const stats = useMemo(() => {
    const total = products.length;
    const inStock = products.filter(p => p.quantity_available > 0).length;
    const outOfStock = products.filter(p => p.quantity_available <= 0).length;
    const withImages = products.filter(p => p.image_url).length;
    const withoutImages = total - withImages;
    const withSlug = products.filter(p => p.slug).length;
    const withDescription = products.filter(p => p.design_description).length;

    let totalIssues = 0;
    let errors = 0;
    let warnings = 0;
    products.forEach(p => {
      const issues = validateProduct(p);
      totalIssues += issues.length;
      errors += issues.filter(i => i.severity === 'error').length;
      warnings += issues.filter(i => i.severity === 'warning').length;
    });

    const readyForGoogle = products.filter(p => {
      const issues = validateProduct(p);
      return issues.filter(i => i.severity === 'error').length === 0;
    }).length;

    return { total, inStock, outOfStock, withImages, withoutImages, withSlug, withDescription, totalIssues, errors, warnings, readyForGoogle };
  }, [products]);

  // Filter
  const filteredProducts = useMemo(() => {
    if (!search) return products;
    const term = search.toLowerCase();
    return products.filter(p =>
      p.clothing_name?.toLowerCase().includes(term) ||
      p.sku?.toLowerCase().includes(term) ||
      p.color_name?.toLowerCase().includes(term) ||
      p.design_reference?.toLowerCase().includes(term) ||
      p.slug?.toLowerCase().includes(term)
    );
  }, [products, search]);

  const handleCopyFeedUrl = () => {
    navigator.clipboard.writeText(GOOGLE_FEED_PRODUCTION_URL);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // Table columns
  const columns = [
    {
      key: 'image_url',
      header: 'Img',
      width: '50px',
      render: (value: any) =>
        value ? (
          <img
            src={value}
            alt=""
            style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover', border: '1px solid #2a2a35' }}
          />
        ) : (
          <div style={{ width: 36, height: 36, borderRadius: 6, backgroundColor: '#2a2a35', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FiImage size={14} color="#6b6b7b" />
          </div>
        ),
    },
    {
      key: 'sku',
      header: 'SKU (g:id)',
      width: '130px',
      render: (value: any) => (
        <span style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: '#f0b429' }}>{value || '—'}</span>
      ),
    },
    {
      key: 'clothing_name',
      header: 'Título',
      render: (_: any, row: FeedProduct) => {
        const parts = [row.clothing_name];
        if (row.color_name) parts.push(row.color_name);
        if (row.size_name) parts.push(row.size_name);
        return <span style={{ fontSize: '0.8rem' }}>{parts.join(' - ')}</span>;
      },
    },
    {
      key: 'price',
      header: 'Precio',
      width: '100px',
      render: (value: any, row: FeedProduct) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.8rem' }}>
            ${value?.toLocaleString('es-CO')}
          </div>
          {row.discount_price && (
            <div style={{ fontSize: '0.68rem', color: '#34d399' }}>
              Oferta: ${row.discount_price.toLocaleString('es-CO')}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'quantity_available',
      header: 'Stock',
      width: '70px',
      align: 'center' as const,
      render: (value: any) => (
        <StatusBadge
          status={value > 0 ? `${value}` : '0'}
          variant={value > 0 ? 'success' : 'error'}
          size="sm"
        />
      ),
    },
    {
      key: 'gender_name',
      header: 'Género',
      width: '80px',
      render: (value: any) => (
        <span style={{ fontSize: '0.72rem', color: '#a0a0b0' }}>{mapGender(value)}</span>
      ),
    },
    {
      key: 'type_clothing_name',
      header: 'Categoría Google',
      width: '140px',
      render: (value: any) => {
        const key = (value || '').toLowerCase().trim();
        const categoryId = TYPE_TO_CATEGORY[key] || '1604';
        const categoryName = GOOGLE_CATEGORY_NAMES[categoryId] || 'Generic';
        const isMapped = TYPE_TO_CATEGORY[key] !== undefined;
        return (
          <span style={{ fontSize: '0.72rem', color: isMapped ? '#60a5fa' : '#fbbf24' }}>
            {categoryName}
          </span>
        );
      },
    },
    {
      key: '_validation',
      header: 'Estado',
      width: '90px',
      align: 'center' as const,
      render: (_: any, row: FeedProduct) => {
        const issues = validateProduct(row);
        const hasErrors = issues.some(i => i.severity === 'error');
        const hasWarnings = issues.some(i => i.severity === 'warning');
        if (hasErrors) return <StatusBadge status="Errores" variant="error" size="sm" />;
        if (hasWarnings) return <StatusBadge status="Advertencias" variant="warning" size="sm" />;
        return <StatusBadge status="Ok" variant="success" size="sm" />;
      },
    },
  ];

  // Card style
  const cardStyle: React.CSSProperties = {
    backgroundColor: '#1a1a24',
    border: '1px solid #2a2a35',
    borderRadius: 12,
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  };

  const statValueStyle: React.CSSProperties = {
    fontSize: '1.75rem',
    fontWeight: 700,
    fontFamily: 'Inter, sans-serif',
    lineHeight: 1.2,
  };

  const statLabelStyle: React.CSSProperties = {
    fontSize: '0.72rem',
    color: '#6b6b7b',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  };

  return (
    <div className="page-container">
      <PageHeader title="Google Merchant Center Feed" icon={<FiRss />}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={fetchFeedData}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.45rem 0.85rem', borderRadius: 8,
              border: '1px solid #2a2a35', backgroundColor: '#1f1f2a',
              color: '#a0a0b0', fontSize: '0.78rem', cursor: 'pointer',
              fontFamily: 'Inter, sans-serif', transition: 'all 0.15s',
            }}
          >
            <FiRefreshCcw size={13} /> Refrescar
          </button>
          <a
            href={FEED_API_ENDPOINT}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.45rem 0.85rem', borderRadius: 8,
              border: '1px solid rgba(240, 180, 41, 0.3)', backgroundColor: 'rgba(240, 180, 41, 0.08)',
              color: '#f0b429', fontSize: '0.78rem', cursor: 'pointer',
              fontFamily: 'Inter, sans-serif', textDecoration: 'none', transition: 'all 0.15s',
            }}
          >
            <FiExternalLink size={13} /> Ver XML
          </a>
        </div>
      </PageHeader>

      {error && <p className="error-message">{error}</p>}

      {/* Feed URL Banner */}
      <div
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          backgroundColor: '#1a1a24', border: '1px solid #2a2a35', borderRadius: 10,
          padding: '0.75rem 1rem', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0, flex: 1 }}>
          <FiRss size={16} color="#f0b429" />
          <span style={{ fontSize: '0.78rem', color: '#6b6b7b', flexShrink: 0 }}>Feed URL:</span>
          <code
            style={{
              fontSize: '0.76rem', color: '#60a5fa', fontFamily: 'monospace',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}
          >
            {GOOGLE_FEED_PRODUCTION_URL}
          </code>
        </div>
        <button
          onClick={handleCopyFeedUrl}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.35rem',
            padding: '0.35rem 0.65rem', borderRadius: 6,
            border: '1px solid #2a2a35', backgroundColor: '#1f1f2a',
            color: copySuccess ? '#34d399' : '#a0a0b0',
            fontSize: '0.72rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
            transition: 'all 0.2s',
          }}
        >
          <FiCopy size={12} />
          {copySuccess ? 'Copiado!' : 'Copiar'}
        </button>
      </div>
      {/* Data Source indicator */}
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: '0.6rem',
          backgroundColor: '#1a1a24', border: '1px solid #2a2a35', borderRadius: 10,
          padding: '0.6rem 1rem', marginBottom: '1.25rem',
        }}
      >
        <span style={{ fontSize: '0.72rem', color: '#6b6b7b' }}>Fuente de datos:</span>
        <code style={{ fontSize: '0.72rem', color: '#34d399', fontFamily: 'monospace' }}>
          {FEED_API_ENDPOINT}
        </code>
        <StatusBadge
          status={API_BASE_URL?.includes('localhost') ? 'LOCAL' : 'PRODUCCIÓN'}
          variant={API_BASE_URL?.includes('localhost') ? 'warning' : 'success'}
          size="sm"
        />
      </div>
      {loading ? (
        <LoadingSpinner text="Cargando productos del feed..." />
      ) : (
        <>
          {/* Stats Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '0.75rem',
              marginBottom: '1.5rem',
            }}
          >
            <div style={cardStyle}>
              <span style={{ ...statValueStyle, color: '#f1f1f3' }}>{stats.total}</span>
              <span style={statLabelStyle}>Total Productos</span>
            </div>
            <div style={cardStyle}>
              <span style={{ ...statValueStyle, color: '#34d399' }}>{stats.readyForGoogle}</span>
              <span style={statLabelStyle}>Listos para Google</span>
            </div>
            <div style={cardStyle}>
              <span style={{ ...statValueStyle, color: '#34d399' }}>{stats.inStock}</span>
              <span style={statLabelStyle}>En Stock</span>
            </div>
            <div style={cardStyle}>
              <span style={{ ...statValueStyle, color: '#f87171' }}>{stats.outOfStock}</span>
              <span style={statLabelStyle}>Sin Stock</span>
            </div>
            <div style={cardStyle}>
              <span style={{ ...statValueStyle, color: stats.withoutImages > 0 ? '#fbbf24' : '#34d399' }}>{stats.withImages}</span>
              <span style={statLabelStyle}>Con Imagen</span>
            </div>
            <div style={cardStyle}>
              <span style={{ ...statValueStyle, color: stats.errors > 0 ? '#f87171' : '#34d399' }}>{stats.errors}</span>
              <span style={statLabelStyle}>Errores</span>
            </div>
          </div>

          {/* Validation Summary (if issues exist) */}
          {(stats.errors > 0 || stats.warnings > 0) && (
            <div
              style={{
                backgroundColor: stats.errors > 0 ? 'rgba(248, 113, 113, 0.06)' : 'rgba(251, 191, 36, 0.06)',
                border: `1px solid ${stats.errors > 0 ? 'rgba(248, 113, 113, 0.2)' : 'rgba(251, 191, 36, 0.2)'}`,
                borderRadius: 10,
                padding: '0.85rem 1rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
              }}
            >
              <FiAlertCircle size={18} color={stats.errors > 0 ? '#f87171' : '#fbbf24'} />
              <div style={{ fontSize: '0.82rem', color: '#f1f1f3' }}>
                {stats.errors > 0 && (
                  <span><strong style={{ color: '#f87171' }}>{stats.errors} errores</strong> impiden que ciertos productos aparezcan en Google. </span>
                )}
                {stats.warnings > 0 && (
                  <span><strong style={{ color: '#fbbf24' }}>{stats.warnings} advertencias</strong> pueden afectar la calidad del listado. </span>
                )}
                <span style={{ color: '#6b6b7b' }}>Haz clic en un producto para ver los detalles.</span>
              </div>
            </div>
          )}

          {stats.errors === 0 && stats.warnings === 0 && stats.total > 0 && (
            <div
              style={{
                backgroundColor: 'rgba(52, 211, 153, 0.06)',
                border: '1px solid rgba(52, 211, 153, 0.2)',
                borderRadius: 10,
                padding: '0.85rem 1rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
              }}
            >
              <FiCheckCircle size={18} color="#34d399" />
              <span style={{ fontSize: '0.82rem', color: '#34d399', fontWeight: 500 }}>
                ¡Todos los productos están listos para Google Merchant Center!
              </span>
            </div>
          )}

          {/* Search */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <SearchInput value={search} onChange={setSearch} placeholder="Buscar por nombre, SKU, color, referencia..." />
            <span style={{ fontSize: '0.75rem', color: '#6b6b7b' }}>
              {filteredProducts.length} de {products.length} productos
            </span>
          </div>

          {/* Products Table */}
          <DataTable
            columns={columns}
            data={filteredProducts}
            emptyMessage="No hay productos en el feed"
            onRowClick={(row) => setSelectedProduct(row)}
            pageSize={20}
          />

          {/* Product Detail Panel */}
          {selectedProduct && (
            <div
              style={{
                position: 'fixed', top: 0, right: 0, bottom: 0,
                width: '440px', maxWidth: '90vw',
                backgroundColor: '#15151e',
                borderLeft: '1px solid #2a2a35',
                zIndex: 1000,
                overflowY: 'auto',
                boxShadow: '-4px 0 24px rgba(0,0,0,0.5)',
                padding: '1.5rem',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ margin: 0, color: '#f1f1f3', fontSize: '1.1rem', fontWeight: 600 }}>
                  Detalle del Producto
                </h3>
                <button
                  onClick={() => setSelectedProduct(null)}
                  style={{
                    background: '#1f1f2a', border: '1px solid #2a2a35', borderRadius: 6,
                    color: '#a0a0b0', cursor: 'pointer', padding: '0.3rem 0.6rem', fontSize: '0.8rem',
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Image */}
              {selectedProduct.image_url && (
                <img
                  src={selectedProduct.image_url}
                  alt={selectedProduct.clothing_name}
                  style={{
                    width: '100%', borderRadius: 10, marginBottom: '1rem',
                    border: '1px solid #2a2a35', maxHeight: 240, objectFit: 'cover',
                  }}
                />
              )}

              {/* Feed values preview */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {[
                  { label: 'g:id', value: selectedProduct.sku },
                  { label: 'g:title', value: [selectedProduct.clothing_name, selectedProduct.color_name, selectedProduct.size_name].filter(Boolean).join(' - ') },
                  { label: 'g:description', value: selectedProduct.design_description || `${selectedProduct.clothing_name} de Two Six. Ropa colombiana con estilo y confort.` },
                  { label: 'g:link', value: selectedProduct.slug ? `https://twosixweb.com/product/${selectedProduct.slug}` : `https://twosixweb.com/product/${selectedProduct.id}` },
                  { label: 'g:price', value: `${selectedProduct.price?.toFixed(2)} COP` },
                  ...(selectedProduct.discount_price ? [{ label: 'g:sale_price', value: `${selectedProduct.discount_price.toFixed(2)} COP` }] : []),
                  { label: 'g:availability', value: selectedProduct.quantity_available > 0 ? 'in_stock' : 'out_of_stock' },
                  { label: 'g:brand', value: 'Two Six' },
                  { label: 'g:condition', value: 'new' },
                  { label: 'g:item_group_id', value: selectedProduct.design_reference || String(selectedProduct.id) },
                  { label: 'g:color', value: selectedProduct.color_name || '—' },
                  { label: 'g:size', value: selectedProduct.size_name || '—' },
                  { label: 'g:gender', value: mapGender(selectedProduct.gender_name) },
                  { label: 'g:age_group', value: 'adult' },
                  { label: 'g:google_product_category', value: (() => {
                    const key = (selectedProduct.type_clothing_name || '').toLowerCase().trim();
                    const catId = TYPE_TO_CATEGORY[key] || '1604';
                    return `${catId} (${GOOGLE_CATEGORY_NAMES[catId] || 'Generic'})`;
                  })() },
                  { label: 'g:identifier_exists', value: 'false' },
                  { label: 'g:shipping', value: 'CO — 8,000.00 COP' },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #1f1f2a', paddingBottom: '0.5rem' }}>
                    <span style={{ color: '#f0b429', fontSize: '0.7rem', fontFamily: 'monospace', minWidth: 150, flexShrink: 0 }}>
                      {label}
                    </span>
                    <span style={{ color: '#f1f1f3', fontSize: '0.78rem', wordBreak: 'break-word' }}>
                      {value || '—'}
                    </span>
                  </div>
                ))}
              </div>

              {/* Additional images */}
              {selectedProduct.additional_images.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <span style={{ fontSize: '0.7rem', color: '#f0b429', fontFamily: 'monospace' }}>g:additional_image_link</span>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                    {selectedProduct.additional_images.map((url, i) => (
                      <img key={i} src={url} alt="" style={{ width: 52, height: 52, borderRadius: 6, objectFit: 'cover', border: '1px solid #2a2a35' }} />
                    ))}
                  </div>
                </div>
              )}

              {/* Validation issues */}
              {(() => {
                const issues = validateProduct(selectedProduct);
                if (issues.length === 0) return (
                  <div style={{ marginTop: '1.25rem', padding: '0.75rem', backgroundColor: 'rgba(52,211,153,0.08)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FiCheckCircle size={14} color="#34d399" />
                    <span style={{ fontSize: '0.78rem', color: '#34d399' }}>Producto válido para Google Merchant Center</span>
                  </div>
                );
                return (
                  <div style={{ marginTop: '1.25rem' }}>
                    <h4 style={{ color: '#f87171', fontSize: '0.82rem', margin: '0 0 0.5rem 0', fontWeight: 600 }}>
                      Problemas detectados ({issues.length})
                    </h4>
                    {issues.map((issue, i) => (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
                        padding: '0.5rem 0.65rem', marginBottom: '0.35rem',
                        backgroundColor: issue.severity === 'error' ? 'rgba(248,113,113,0.08)' : 'rgba(251,191,36,0.08)',
                        borderRadius: 6, border: `1px solid ${issue.severity === 'error' ? 'rgba(248,113,113,0.15)' : 'rgba(251,191,36,0.15)'}`,
                      }}>
                        <FiAlertCircle size={13} color={issue.severity === 'error' ? '#f87171' : '#fbbf24'} style={{ marginTop: 2, flexShrink: 0 }} />
                        <div>
                          <span style={{ fontFamily: 'monospace', fontSize: '0.68rem', color: '#a0a0b0' }}>{issue.field}:</span>
                          <span style={{ fontSize: '0.76rem', color: '#f1f1f3', marginLeft: '0.35rem' }}>{issue.message}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}

          {/* Backdrop for detail panel */}
          {selectedProduct && (
            <div
              onClick={() => setSelectedProduct(null)}
              style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.4)',
                zIndex: 999,
              }}
            />
          )}
        </>
      )}
    </div>
  );
};

export default GoogleMerchantFeedPage;
