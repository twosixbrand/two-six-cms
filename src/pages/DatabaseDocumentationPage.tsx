import React from 'react';
import { FaDatabase, FaBoxOpen, FaShoppingCart, FaFileInvoiceDollar, FaCalculator, FaUsers, FaChartLine } from 'react-icons/fa';
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
    CLOTHING_SIZE ||--o{ INVENTORY_KARDEX : "tracks"
    CLOTHING_SIZE {
        int id PK
        int clothing_color_id FK
        int size_id FK
        int quantity_available
        int quantity_produced
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

    // Sintaxis Mermaid para Contabilidad e Impuestos
    const accountingSchema = `
erDiagram
    PUC_ACCOUNT ||--o{ JOURNAL_ENTRY_LINE : "credits/debits"
    PUC_ACCOUNT {
        int id PK
        string code UK
        string name
        string type
    }

    JOURNAL_ENTRY ||--|{ JOURNAL_ENTRY_LINE : "comprises"
    JOURNAL_ENTRY {
        int id PK
        string entry_number UK
        date entry_date
        string source_type "SALE, PAYROLL, COGS, INVENTORY_ADJUSTMENT"
    }

    TAX_CONFIGURATION ||--o| PUC_ACCOUNT : "references"
    TAX_CONFIGURATION {
        int id PK
        string name
        string type "ICA, AUTORETENCION"
        float rate
    }

    JOURNAL_ENTRY ||--o{ TAX_TRANSACTION : "records"
    TAX_TRANSACTION {
        int id PK
        int journal_entry_id FK
        float base_amount
        float tax_amount
    }
`;

    // Sintaxis Mermaid para Nómina e Inventario Avanzado
    const advancedModulesSchema = `
erDiagram
    EMPLOYEE ||--o{ PAYROLL_ENTRY : "receives"
    EMPLOYEE {
        int id PK
        string name
        float base_salary
        boolean is_exonerated "Ley 1607"
        string contract_type
    }

    PAYROLL_PERIOD ||--o{ PAYROLL_ENTRY : "contains"
    PAYROLL_PERIOD {
        int id PK
        int year
        int month
        string status "DRAFT, CALCULATED, APPROVED"
    }

    PAYROLL_ENTRY ||--o| JOURNAL_ENTRY : "generates"

    PROVIDER ||--o{ WITHHOLDING_CERTIFICATE : "receives"
    PROVIDER {
        string nit PK
        string company_name
    }

    WITHHOLDING_CERTIFICATE {
        int id PK
        string certificate_number UK
        string concept "RETEFUENTE, RETEICA, RETEIVA"
        float withheld_amount
    }

    INVENTORY_KARDEX {
        int id PK
        int id_clothing_size FK
        string type "IN/OUT"
        int quantity
        int balance_after
        float unit_cost
    }

    INVENTORY_ADJUSTMENT ||--|{ INVENTORY_ADJUSTMENT_ITEM : "contains"
    INVENTORY_ADJUSTMENT {
        int id PK
        string reason "MERMA, REGALO, ERROR"
        int id_journal_entry FK
    }

    INVENTORY_ADJUSTMENT_ITEM ||--o| CLOTHING_SIZE : "affects"
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
                        Modelos de Entidad-Relación (ER) actualizados describiendo la arquitectura extendida del sistema.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8 mb-8 mt-8">
                {/* 1. Módulo Core / Catálogo */}
                <section className="bg-[#1a1a24] p-6 rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.3)] border border-[#2a2a35]">
                    <h2 className="text-xl font-bold flex items-center text-[#f1f1f3] mb-4"><FaBoxOpen className="mr-2 text-indigo-500" /> 1. Arquitectura Base (Core & Catálogo)</h2>
                    <p className="text-[#a0a0b0] mb-4 text-sm max-w-4xl">Este es el corazón del comercio. Incluye ahora la relación con el <code>INVENTORY_KARDEX</code> para el seguimiento en tiempo real de cada movimiento físico de stock.</p>
                    <div className="bg-[#13131a] border border-[#2a2a35] rounded-xl p-4 overflow-hidden">
                        <MermaidChart chart={catalogSchema} id="catalog" />
                    </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* 3. DIAN */}
                    <section className="bg-[#1a1a24] p-6 rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.3)] border border-[#2a2a35] flex flex-col">
                        <h2 className="text-xl font-bold flex items-center text-[#f1f1f3] mb-4"><FaFileInvoiceDollar className="mr-2 text-yellow-500" /> 3. Motor DIAN E-Invoicing</h2>
                        <div className="bg-[#13131a] border border-[#2a2a35] rounded-xl p-2 flex-grow flex items-center overflow-hidden">
                            <MermaidChart chart={dianSchema} id="dian" />
                        </div>
                    </section>
                    
                    {/* 4. Contabilidad e Impuestos */}
                    <section className="bg-[#1a1a24] p-6 rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.3)] border border-[#2a2a35] flex flex-col">
                        <h2 className="text-xl font-bold flex items-center text-[#f1f1f3] mb-4"><FaCalculator className="mr-2 text-rose-500" /> 4. Contabilidad & Motor de Impuestos</h2>
                        <p className="text-[#a0a0b0] mb-4 text-sm">Extendido con <code>TAX_CONFIGURATION</code> y <code>TAX_TRANSACTION</code> para automatizar el cálculo de ICA y Autorretenciones directamente en el Libro Diario.</p>
                        <div className="bg-[#13131a] border border-[#2a2a35] rounded-xl p-2 flex-grow flex items-center overflow-hidden">
                            <MermaidChart chart={accountingSchema} id="accounting" />
                        </div>
                    </section>
                </div>

                {/* 5. Nómina e Inventario Avanzado */}
                <section className="bg-[#1a1a24] p-6 rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.3)] border border-[#2a2a35]">
                    <h2 className="text-xl font-bold flex items-center text-[#f1f1f3] mb-4"><FaChartLine className="mr-2 text-orange-500" /> 5. Nómina Profesional & Gestión de Ajustes</h2>
                    <p className="text-[#a0a0b0] mb-4 text-sm max-w-4xl">Implementación de trazabilidad profesional. El sistema de Nómina maneja exoneraciones de ley (Ley 1607) y provisiones, mientras que el módulo de Ajustes garantiza que cada merma o regalo tenga un soporte contable y un impacto en el costo.</p>
                    <div className="bg-[#13131a] border border-[#2a2a35] rounded-xl p-4 overflow-hidden">
                        <MermaidChart chart={advancedModulesSchema} id="advanced" />
                    </div>
                </section>

                {/* 6. Estructura de Seguridad */}
                <section className="bg-[#1a1a24] p-6 rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.3)] border border-[#2a2a35]">
                    <h2 className="text-xl font-bold flex items-center text-[#f1f1f3] mb-4"><FaUsers className="mr-2 text-cyan-500" /> 6. Estructura de Usuarios / Seguridad (RBAC)</h2>
                    <ul className="list-disc pl-5 text-[#a0a0b0] text-sm space-y-2 mt-4 columns-1 md:columns-2">
                        <li><code>UserApp</code>: Identidad física en plataforma.</li>
                        <li><code>Role</code> / <code>Permission</code>: Control de acceso granular.</li>
                        <li><code>Subscriber</code> / <code>PQR</code>: Módulos de CRM y soporte.</li>
                    </ul>
                </section>
            </div>
        </div>
    );
};

export default DatabaseDocumentationPage;
