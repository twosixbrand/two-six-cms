import React from 'react';
import { FaDatabase, FaBoxOpen, FaShoppingCart, FaFileInvoiceDollar, FaCalculator, FaUsers } from 'react-icons/fa';
import MermaidChart from '../components/common/MermaidChart';

const DatabaseDocumentationPage = () => {
    
    // Sintaxis de Mermaid para Core/Catálogo
    const catalogSchema = `
erDiagram
    CLOTHING ||--o{ CLOTHING_COLOR : "has"
    CLOTHING {
        int id PK
        string name
        int category_id FK
        int gender_id FK
    }
    
    CLOTHING_COLOR ||--o{ CLOTHING_SIZE : "has"
    CLOTHING_COLOR {
        int id PK
        int clothing_id FK
        int color_id FK
        int design_id FK
        string sku
        string image_url
    }

    CLOTHING_SIZE ||--|{ ORDER_ITEM : "used_in"
    CLOTHING_SIZE {
        int id PK
        int clothing_color_id FK
        int size_id FK
        int stock
        float price
    }

    PRODUCT {
        int id PK
        int clothing_size_id FK
        string dynamic_sku
        boolean active
    }

    PRODUCT |o--o| CLOTHING_SIZE : "maps_to"
    
    CATEGORY ||--o{ CLOTHING : "classifies"
    GENDER ||--o{ CLOTHING : "classifies"
    COLOR ||--o{ CLOTHING_COLOR : "details"
    SIZE ||--o{ CLOTHING_SIZE : "details"
    DESIGN ||--o{ CLOTHING_COLOR : "decorates"
`;

    // Sintaxis Mermaid para Ventas y Pedidos
    const salesSchema = `
erDiagram
    ORDER ||--|{ ORDER_ITEM : "contains"
    ORDER {
        int id PK
        string order_reference
        int customer_id FK
        float total_payment
        string status
        boolean is_paid
        string payment_method
    }
    
    ORDER_ITEM {
        int id PK
        int order_id FK
        int clothing_size_id FK
        int quantity
        float unit_price
    }

    CUSTOMER ||--o{ ORDER : "places"
    CUSTOMER {
        int id PK
        string document_number UK
        string email UK
        string name
    }

    ORDER ||--o{ PAYMENTS : "receives"
    PAYMENTS {
        int id PK
        int order_id FK
        string transaction_id
        string status
        string gateway
    }

    ORDER ||--o| SHIPMENT : "dispatches"
    SHIPMENT {
        int id PK
        int order_id FK
        string tracking_number
        int company_id FK
        string status
    }
`;

    // Sintaxis Mermaid para DIAN
    const dianSchema = `
erDiagram
    DIAN_E_INVOICING ||--o| ORDER : "bills"
    DIAN_E_INVOICING {
        int id PK
        string order_reference FK
        string status
        string cufe
        string invoice_number
        string pdf_url
        string xml_url
        datetime authorized_at
    }

    DIAN_RESOLUTION ||--o{ DIAN_E_INVOICING : "governs"
    DIAN_RESOLUTION {
        int id PK
        string resolutionNumber
        string prefix
        int startNumber
        int endNumber
        boolean active
    }

    DIAN_NOTE }o--|{ DIAN_E_INVOICING : "credits_debits"
    DIAN_NOTE {
        int id PK
        int dian_e_invoicing_id FK
        string description
        string note_type "CR o DB"
        string cufe_reference
    }

    CUSTOMER ||--o{ DIAN_E_INVOICING : "issued_to"
`;

    // Sintaxis Mermaid para Contabilidad
    const accountingSchema = `
erDiagram
    PUC_ACCOUNT ||--o{ JOURNAL_ENTRY_LINE : "credits/debits"
    PUC_ACCOUNT {
        int id PK
        string code UK
        string name
        string type "ACTIVO, PASIVO, PATRIMONIO..."
        boolean requires_third_party
    }

    JOURNAL_ENTRY ||--|{ JOURNAL_ENTRY_LINE : "comprises"
    JOURNAL_ENTRY {
        int id PK
        string number UK
        date date
        string concept
        string status "DRAFT, POSTED"
    }

    JOURNAL_ENTRY_LINE {
        int id PK
        int journal_entry_id FK
        int account_id FK
        float debit
        float credit
        string third_party_doc
    }

    EXPENSE ||--o{ JOURNAL_ENTRY : "generates"
    EXPENSE {
        int id PK
        string invoice_number
        int category_id FK
        float total_amount
    }

    ACCOUNTING_CLOSING ||--|{ JOURNAL_ENTRY : "locks"
`;

    return (
        <div className="card" style={{ maxWidth: '1200px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
            <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-[#1a1a24] border border-[#2a2a35] text-primary rounded-xl flex items-center justify-center shadow-lg">
                    <FaDatabase size={24} />
                </div>
                <div>
                    <h1 className="pe-title" style={{ fontSize: '28px', margin: 0, color: '#f1f1f3', fontWeight: 'bold' }}>Documentación Técnica de la Base de Datos</h1>
                    <p className="pe-desc" style={{ marginTop: '4px', color: '#a0a0b0', fontSize: '14px' }}>
                        Modelos de Entidad-Relación (ER) generados en tiempo real describiendo la arquitectura central del sistema.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8 mb-8 mt-8">
                {/* 1. Módulo Core / Catálogo */}
                <section className="bg-[#1a1a24] p-6 rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.3)] border border-[#2a2a35]">
                    <h2 className="text-xl font-bold flex items-center text-[#f1f1f3] mb-4"><FaBoxOpen className="mr-2 text-indigo-500" /> 1. Arquitectura Base (Core & Catálogo)</h2>
                    <p className="text-[#a0a0b0] mb-4 text-sm max-w-4xl">Este es el corazón del comercio. La tabla <code>CLOTHING</code> representa el modelo conceptual de una prenda, que luego materializa sus variaciones mediante <code>CLOTHING_COLOR</code> (Diseños y colores) y finalmente crea el control de stock tangible en <code>CLOTHING_SIZE</code>. <code>PRODUCT</code> funciona como un código único virtual.</p>
                    <div className="bg-[#13131a] border border-[#2a2a35] rounded-xl p-4 overflow-hidden">
                        <MermaidChart chart={catalogSchema} id="catalog" />
                    </div>
                </section>

                {/* 2. Módulo de Ventas */}
                <section className="bg-[#1a1a24] p-6 rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.3)] border border-[#2a2a35]">
                    <h2 className="text-xl font-bold flex items-center text-[#f1f1f3] mb-4"><FaShoppingCart className="mr-2 text-green-500" /> 2. Ecosistema de Ventas y Pedidos</h2>
                    <p className="text-[#a0a0b0] mb-4 text-sm max-w-4xl">El ciclo de vida del comprador. Contiene la cabecera <code>ORDER</code> enganchada con su cliente. A través de <code>ORDER_ITEM</code> captura el precio histórico comprado de una talla en específico (<code>clothing_size_id</code>), abstrayéndolo de las variaciones de precio futuro. Todo se soporta por sus pagos y guías de envío.</p>
                    <div className="bg-[#13131a] border border-[#2a2a35] rounded-xl p-4 overflow-hidden">
                        <MermaidChart chart={salesSchema} id="sales" />
                    </div>
                </section>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* 3. DIAN */}
                    <section className="bg-[#1a1a24] p-6 rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.3)] border border-[#2a2a35] flex flex-col">
                        <h2 className="text-xl font-bold flex items-center text-[#f1f1f3] mb-4"><FaFileInvoiceDollar className="mr-2 text-yellow-500" /> 3. Motor DIAN E-Invoicing</h2>
                        <p className="text-[#a0a0b0] mb-4 text-sm">Entidades requeridas legalmente para la emisión fiscal. Administran las vigencias de las resoluciones, almacenan los Hash (CUFE) generados con la firma digital y llevan la trazabilidad de Notas Crédito y Débito atadas a su orden madre.</p>
                        <div className="bg-[#13131a] border border-[#2a2a35] rounded-xl p-2 flex-grow flex items-center overflow-hidden">
                            <MermaidChart chart={dianSchema} id="dian" />
                        </div>
                    </section>
                    
                    {/* 4. Contabilidad */}
                    <section className="bg-[#1a1a24] p-6 rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.3)] border border-[#2a2a35] flex flex-col">
                        <h2 className="text-xl font-bold flex items-center text-[#f1f1f3] mb-4"><FaCalculator className="mr-2 text-rose-500" /> 4. Contabilidad General & Libros</h2>
                        <p className="text-[#a0a0b0] mb-4 text-sm">Módulo financiero basado en el Plan Único de Cuentas (PUC). Garantiza asientos de Partida Doble en <code>JOURNAL_ENTRY_LINE</code> obligando que los saldos Debit/Credit sumen cero antes del cierre (<code>ACCOUNTING_CLOSING</code>).</p>
                        <div className="bg-[#13131a] border border-[#2a2a35] rounded-xl p-2 flex-grow flex items-center overflow-hidden">
                            <MermaidChart chart={accountingSchema} id="accounting" />
                        </div>
                    </section>
                </div>

                {/* 5. Otros (Usuarios / CRM) */}
                <section className="bg-[#1a1a24] p-6 rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.3)] border border-[#2a2a35]">
                    <h2 className="text-xl font-bold flex items-center text-[#f1f1f3] mb-4"><FaUsers className="mr-2 text-cyan-500" /> 5. Estructura de Usuarios / Seguridad (RBAC)</h2>
                    <ul className="list-disc pl-5 text-[#a0a0b0] text-sm space-y-2 mt-4 columns-1 md:columns-2">
                        <li><code>UserApp</code>: Representa la identidad física en plataforma (CMS o WMS).</li>
                        <li><code>Role</code>: Grupos lógicos de control (ej. Cajero, Administrador).</li>
                        <li><code>Permission</code>: Atomicidad de permisos (ej. "Ver_Contabilidad").</li>
                        <li><code>RolePermission</code> / <code>UserRole</code>: Tablas pivote N:M permitiendo Roles Híbridos dinámicos asignados por token JWT.</li>
                        <li><code>Subscriber</code> / <code>PQR</code>: Módulo de contacto y boletines publicitarios aislados del núcleo comercial transaccional.</li>
                    </ul>
                </section>
            </div>
        </div>
    );
};

export default DatabaseDocumentationPage;
