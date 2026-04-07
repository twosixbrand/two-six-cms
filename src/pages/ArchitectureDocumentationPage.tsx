import React from 'react';
import { FaServer, FaCodeBranch, FaCloud, FaExchangeAlt, FaShieldAlt, FaChartLine, FaMoneyCheckAlt, FaDatabase } from 'react-icons/fa';
import MermaidChart from '../components/common/MermaidChart';

const ArchitectureDocumentationPage = () => {

    const devopsSchema = `
graph TD
    subgraph "Desarrollador (Local)"
        DEV[Local Workspace] -->|git push| GH
        ENV1[.env.local] -.-> DEV
    end

    subgraph "Repositorios (GitHub)"
        GH(GitHub)
        GH --> REPO1[two-six-backend]
        GH --> REPO2[two-six-web Dockerized]
        GH --> REPO3[two-six-cms]
    end

    subgraph "CI / CD (DigitalOcean App Platform)"
        REPO1 -->|Push to main| DO_BUILD1{DO Build}
        REPO2 -->|Push to main| DO_BUILD2{Docker Build}
        REPO3 -->|Push to main| DO_BUILD3{DO Build}
        
        DO_BUILD1 -->|Despliega| API[API Backend]
        DO_BUILD2 -->|Despliega Imagen| WEB[Web Frontend Contenedor Docker]
        DO_BUILD3 -->|Despliega| CMS[Admin CMS]
    end
    
    style GH fill:#24292e,stroke:#fff,stroke-width:2px,color:#fff
    style DEV fill:#1a1a24,stroke:#4a5568,color:#fff
    style DO_BUILD1 fill:#0069ff,stroke:#fff,color:#fff
    style DO_BUILD2 fill:#0db7ed,stroke:#fff,color:#fff
    style DO_BUILD3 fill:#0069ff,stroke:#fff,color:#fff
`;

    const cloudSchema = `
graph LR
    subgraph "Domain & DNS"
        GD((GoDaddy<br/>twosixbrand.com)) -->|Nameservers| DNS_DO[DigitalOcean DNS]
    end

    subgraph "Infraestructura DigitalOcean (ATL1)"
        DNS_DO -->|Route| WEB(Web App - Contenedor Docker)
        DNS_DO -->|Route| CMS(CMS Admin App)
        DNS_DO -->|Route| API(NestJS API)
        
        API <-->|Prisma ORM<br/>SSL Port 25060| DB[(PostgreSQL 15<br/>Managed DB)]
        
        API -->|Upload| S3[(DO Spaces S3<br/>Storage)]
        WEB -->|CDN Edge Download| S3
        CMS -->|CDN Edge Download| S3
    end

    style GD fill:#1bce61,stroke:#000,color:#fff
    style DNS_DO fill:#0069ff,stroke:#fff,color:#fff
    style WEB fill:#0db7ed,stroke:#fff,color:#fff
    style DB fill:#336791,stroke:#fff,color:#fff
    style S3 fill:#1db746,stroke:#fff,color:#fff
`;

    const integrationSchema = `
graph TD
    subgraph "Ecosistema Two Six"
        CORE((API Central<br/>NestJS))
    end
    
    subgraph "Pasarelas de Pago"
        CORE <-->|Tokens / Webhooks| WOMPI[Wompi Colombia]
        WOMPI -.->|Notifica Cambio de Estado| CORE
    end

    subgraph "Entidades Gubernamentales"
        CORE -->|XML UBL 2.1| UBL{Builder}
        UBL -->|Firma XAdES| GSE[Certificado GSE.p12]
        GSE <-->|SOAP Wcf WS| DIAN[DIAN API Facturación]
        DIAN -.->|Validación CUFE Async| CORE
    end

    subgraph "Comunicaciones y Notificaciones"
        CORE -->|SMTP| GMAIL[Gmail SMTP<br/>twosixfacturaelectronica@gmail.com]
        GMAIL -->|Entrega Factura Legal| CUST((Cliente))
        CORE -->|Notificación Logística| GMAIL2[Gmail Comercial<br/>twosixmarca@]
        GMAIL2 -->|Guías y Rastreo| CUST
    end

    style CORE fill:#1a1a24,stroke:#4a5568,stroke-width:2px,color:#fff
    style WOMPI fill:#0f172a,stroke:#3b82f6,color:#fff
    style DIAN fill:#047857,stroke:#fff,color:#fff
    style GSE fill:#f59e0b,stroke:#fff,color:#fff
    style GMAIL fill:#dc2626,stroke:#fff,color:#fff
    style GMAIL2 fill:#dc2626,stroke:#fff,color:#fff
`;

    return (
        <div className="card" style={{ maxWidth: '1200px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
            <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-[#1a1a24] border border-[#2a2a35] text-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                    <FaCloud size={24} />
                </div>
                <div>
                    <h1 className="pe-title" style={{ fontSize: '28px', margin: 0, color: '#f1f1f3', fontWeight: 'bold' }}>Arquitectura Viva del Ecosistema</h1>
                    <p className="pe-desc" style={{ marginTop: '4px', color: '#a0a0b0', fontSize: '14px' }}>
                        Documentación técnica holística: Cloud, DevSecOps, Integraciones Externas y Proyecciones de Recursos de The Two Six Brand.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8 mb-8 mt-8">
                {/* Modulo 1: DevOps & Code */}
                <section className="bg-[#1a1a24] p-6 rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.3)] border border-[#2a2a35]">
                    <h2 className="text-xl font-bold flex items-center text-[#f1f1f3] mb-4"><FaCodeBranch className="mr-2 text-blue-500" /> 1. Orquestación, Repositorios y CI/CD</h2>
                    <p className="text-[#a0a0b0] mb-4 text-sm max-w-4xl">El Sistema de despliegue continuo asegura que cualquier línea de código aprobada llegue a los clientes sin interrupciones. Los ambientes Locales/DLLO están completamente aislados del entorno PROD garantizando un espacio seguro para el I+D, manipulados por un archivo \`.env\` inyectable.</p>
                    <div className="bg-[#13131a] border border-[#2a2a35] rounded-xl p-4 overflow-hidden">
                        <MermaidChart chart={devopsSchema} id="devops" />
                    </div>
                </section>

                {/* Modulo 2: Nube e Infra */}
                <section className="bg-[#1a1a24] p-6 rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.3)] border border-[#2a2a35]">
                    <h2 className="text-xl font-bold flex items-center text-[#f1f1f3] mb-4"><FaServer className="mr-2 text-indigo-500" /> 2. Infraestructura Backend en la Nube (Cloud)</h2>
                    <p className="text-[#a0a0b0] mb-4 text-sm max-w-4xl">Toda la base operativa recae en una flota geográficamente balanceada en DigitalOcean (Datacenter Atlanta 1). GoDaddy es el punto de origen de marca, cediendo su delegación de DNS a la Nube. La BD está en una capa aislada y el almacenamiento (Imágenes S3) utiliza Edge Caching para despliegues instantáneos.</p>
                    <div className="bg-[#13131a] border border-[#2a2a35] rounded-xl p-4 overflow-hidden">
                        <MermaidChart chart={cloudSchema} id="cloud" />
                    </div>
                </section>

                {/* Modulo 3: Ecosistema Externo */}
                <section className="bg-[#1a1a24] p-6 rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.3)] border border-[#2a2a35]">
                    <h2 className="text-xl font-bold flex items-center text-[#f1f1f3] mb-4"><FaExchangeAlt className="mr-2 text-green-500" /> 3. Ecosistema de Servicios y Comunicaciones</h2>
                    <p className="text-[#a0a0b0] mb-4 text-sm max-w-4xl">Las fronteras de la aplicación. El backend de NestJS funciona centralizadamente para administrar a (1) La red DIAN Gubernamental, (2) Emisores de tarjeta / Wompi vía Webhooks PUSH en vivo, y (3) Demonios asíncronos para disparo de Correos a los clientes (SMTP con autenticación SSL TLS OAUTH2).</p>
                    <div className="bg-[#13131a] border border-[#2a2a35] rounded-xl p-4 overflow-hidden">
                        <MermaidChart chart={integrationSchema} id="integrations" />
                    </div>
                </section>

                {/* Modulo 4: Panel Financiero e Infraestructura IT */}
                <section className="bg-[#1a1a24] p-6 rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.3)] border border-[#2a2a35] mt-4">
                    <h2 className="text-xl font-bold flex items-center text-[#f1f1f3] mb-6"><FaMoneyCheckAlt className="mr-2 text-yellow-500" /> 4. Presupuesto, Consumo de Recursos y Proyecciones</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Costos Recurrentes Base */}
                        <div className="bg-[#13131a] border border-[#2a2a35] rounded-xl p-5">
                            <h3 className="text-md font-semibold text-white mb-3 flex items-center"><FaChartLine className="mr-2 text-green-400"/> Presupuesto Mensual Base (Cloud & IT)</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm border-b border-[#2a2a35] pb-2">
                                    <span className="text-[#a0a0b0]">DigitalOcean App Platform (3 Contenedores)</span>
                                    <span className="font-mono text-[#f1f1f3]">~$15.00 - $30.00 USD</span>
                                </div>
                                <div className="flex justify-between items-center text-sm border-b border-[#2a2a35] pb-2">
                                    <span className="text-[#a0a0b0]">DigitalOcean Managed PostgreSQL (15GB)</span>
                                    <span className="font-mono text-[#f1f1f3]">~$15.00 USD</span>
                                </div>
                                <div className="flex justify-between items-center text-sm border-b border-[#2a2a35] pb-2">
                                    <span className="text-[#a0a0b0]">DigitalOcean Spaces (S3 + CDN) (250GB Base)</span>
                                    <span className="font-mono text-[#f1f1f3]">~$5.00 USD</span>
                                </div>
                                <div className="flex justify-between items-center text-sm border-b border-[#2a2a35] pb-2">
                                    <span className="text-[#a0a0b0]">GoDaddy Dominio (Anualizado) / GSE Cert.</span>
                                    <span className="font-mono text-[#f1f1f3]">~$2.00 USD/mes</span>
                                </div>
                                <div className="flex justify-between items-center text-sm font-bold text-accent pt-2">
                                    <span>Total Estimado Conservador En Nube:</span>
                                    <span className="font-mono">~$37.00 - $52.00 USD</span>
                                </div>
                            </div>
                        </div>

                        {/* Proyecciones de Crecimiento */}
                        <div className="bg-[#13131a] border border-[#2a2a35] rounded-xl p-5">
                            <h3 className="text-md font-semibold text-white mb-3 flex items-center"><FaDatabase className="mr-2 text-blue-400"/> Proyección de Almacenamiento Acumulativo</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm border-b border-[#2a2a35] pb-2">
                                    <span className="text-[#a0a0b0]">Documentos Anexos Zip DIAN (Por Factura)</span>
                                    <span className="font-mono text-[#f1f1f3]">~100 KB</span>
                                </div>
                                <div className="flex justify-between items-center text-sm border-b border-[#2a2a35] pb-2">
                                    <span className="text-[#a0a0b0]">Peso Base de Datos BD SQL (+10,000 Transacc)</span>
                                    <span className="font-mono text-[#f1f1f3]">+ 2.5 MB / año</span>
                                </div>
                                <div className="flex justify-between items-center text-sm border-b border-[#2a2a35] pb-2">
                                    <span className="text-[#a0a0b0]">Catalog Storage S3 (10 Nuevas Colecciones)</span>
                                    <span className="font-mono text-[#f1f1f3]">+ 3 GB / año</span>
                                </div>
                                <div className="text-xs text-[#a0a0b0] mt-4 p-3 bg-[#1a1a24] rounded-lg border border-[#2a2a35]">
                                    <FaShieldAlt className="inline mr-1 text-yellow-500"/>
                                    El consumo de datos no escalará de forma paralizante. El límite de DO es 15GB SQL (Años de ventas). En S3, $5.00 otorga 250GB, por tanto <b>costos marginales de escalar el inventario X 100 veces son prácticamente nulos.</b>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Modulo 5: Analitica, SEO y Monitoreo */}
                <section className="bg-[#1a1a24] p-6 rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.3)] border border-[#2a2a35] mt-4">
                    <h2 className="text-xl font-bold flex items-center text-[#f1f1f3] mb-4"><FaChartLine className="mr-2 text-purple-400" /> 5. Telemetría, SEO y Monitoreo de Errores</h2>
                    <p className="text-[#a0a0b0] mb-4 text-sm max-w-4xl">La trazabilidad publicitaria y salud técnica. El Frontend web de Next.js envía mapas de sitio y metaetiquetas (SEO) al motor de indexación de Google Search Console. Mientras tanto, librerías incrustadas de Sentry monitorean las caídas silenciosas de React/NextJS y alertan a los desarrolladores de bugs en tiempo real.</p>
                    <div className="bg-[#13131a] border border-[#2a2a35] rounded-xl p-4 overflow-hidden">
                        <MermaidChart chart={`
graph TD
    subgraph "Two Six Web (Next.js)"
        WEB((Frontend<br/>SSR / SSG))
    end
    
    subgraph "Marketing & SEO (Motores de Búsqueda)"
        WEB -->|sitemap.xml / robots.txt<br/>Metatags OpenGraph| GSC[Google Search Console]
        GSC -.->|Indexación Orgánica| GOOGLE((Buscador Google))
    end

    subgraph "Telemetría y Estabilidad Técnica"
        WEB -->|Error boundaries<br/>Captura de Excepciones| SENTRY[Sentry.io]
        SENTRY -.->|Alertas de Caídas JS| DEV((Equipo de Desarrollo))
    end

    style WEB fill:#1a1a24,stroke:#4a5568,stroke-width:2px,color:#fff
    style GSC fill:#4285f4,stroke:#fff,color:#fff
    style GOOGLE fill:#34a853,stroke:#fff,color:#fff
    style SENTRY fill:#362d59,stroke:#e06a4b,stroke-width:2px,color:#fff
                        `} id="analytics" />
                    </div>
                </section>
                {/* Modulo 6: Seguridad y Autenticacion */}
                <section className="bg-[#1a1a24] p-6 rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.3)] border border-[#2a2a35] mt-4">
                    <h2 className="text-xl font-bold flex items-center text-[#f1f1f3] mb-4"><FaShieldAlt className="mr-2 text-red-400" /> 6. Seguridad, Autenticación y Autorización (RBAC)</h2>
                    <p className="text-[#a0a0b0] mb-4 text-sm max-w-4xl">Las fronteras de identidad. La plataforma maneja una separación estricta entre los compradores (Web) y el personal (CMS). Toda interacción privada se firma criptográficamente con tokens JWT, y el backend valida bloque por bloque usando Guardias de NestJS y agrupaciones por Roles (RBAC).</p>
                    <div className="bg-[#13131a] border border-[#2a2a35] rounded-xl p-4 overflow-hidden">
                        <MermaidChart chart={`
sequenceDiagram
    participant U as Usuario Web
    participant A as Admin CMS
    participant N as NestJS Backend
    participant DB as PostgreSQL

    U->>N: Login con Documento / Email
    N->>DB: Verifica Hash Bcrypt
    DB-->>N: Usuario Válido
    N-->>U: Retorna Auth Token JWT + Refresh

    A->>N: Login con Email y Contraseña
    N->>DB: Valida + Obtiene Grupo de Roles
    DB-->>N: Roles = [sales.orders.view, admin.users]
    N-->>A: Retorna Admin Token JWT

    Note over A,N: Operación Protegida
    A->>N: GET /api/admin/users (Envía JWT)
    N->>N: JWT AuthGuard (Verifica Firma)
    N->>N: RBAC RoleGuard (Requiere 'admin.users')
    N-->>A: JSON Data Exitoso
                        `} id="security" />
                    </div>
                </section>

                {/* Modulo 7: Trabajos de Fondo */}
                <section className="bg-[#1a1a24] p-6 rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.3)] border border-[#2a2a35] mt-4">
                    <h2 className="text-xl font-bold flex items-center text-[#f1f1f3] mb-4"><FaDatabase className="mr-2 text-gray-400" /> 7. Procesos Asíncronos y Tareas Programadas (Cron Jobs)</h2>
                    <p className="text-[#a0a0b0] mb-4 text-sm max-w-4xl">El servidor operativo no solo reacciona, también toma la iniciativa. Se emplean directivas de tipo Cron (@Cron) para barrer automáticamente la base de datos durante la madrugada y realizar operaciones de mantenimiento sin impacto comercial.</p>
                    <div className="bg-[#13131a] border border-[#2a2a35] rounded-xl p-4 overflow-hidden">
                        <MermaidChart chart={`
graph TD
    subgraph "NestJS Schedule Engine"
        CRON((Cron Daemon))
    end
    
    subgraph "Demonios (Background Jobs)"
        CRON -->|Diario 2:00 AM| CART[Vaciado de Carritos Abandonados > 48hr]
        CRON -->|Mensual Fin de Mes| ACC[Generador de Cierres Contables]
        CRON -->|Cada Hora| DIAN_RETRY[Re-transmisor de Facturas DIAN Fallidas]
    end

    subgraph "Base de Datos de Mantenimiento"
        CART -->|DELETE CASCADE| DB[(PostgreSQL)]
        ACC -->|Calculo de Ledger| DB
        DIAN_RETRY -->|Select con error| DB
    end

    style CRON fill:#1a1a24,stroke:#eab308,stroke-width:2px,color:#fff
    style CART fill:#475569,stroke:#fff,color:#fff
    style ACC fill:#475569,stroke:#fff,color:#fff
    style DIAN_RETRY fill:#475569,stroke:#fff,color:#fff
                        `} id="cron-jobs" />
                    </div>
                </section>

                {/* Modulo 8: Manejo del Estado */}
                <section className="bg-[#1a1a24] p-6 rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.3)] border border-[#2a2a35] mt-4">
                    <h2 className="text-xl font-bold flex items-center text-[#f1f1f3] mb-4"><FaCodeBranch className="mr-2 text-teal-400" /> 8. Ciclo de Vida del Estado del Cliente (State Management)</h2>
                    <p className="text-[#a0a0b0] mb-4 text-sm max-w-4xl">La retención de compra. La experiencia de React (Next.js) utiliza una mezcla de Contextos Globales efímeros y preservación criptográfica en LocalStorage para garantizar que el progreso de compra y las preferencias de sesión nunca se pierdan si se refresca la página o se cierra el navegador.</p>
                    <div className="bg-[#13131a] border border-[#2a2a35] rounded-xl p-4 overflow-hidden">
                        <MermaidChart chart={`
graph LR
    subgraph "Navegador Web (Cliente)"
        BROWSER((Browser))
        
        subgraph "Memoria Volátil"
            REACT[React Context API<br/>CartContext / AuthContext]
        end
        
        subgraph "Memoria Persistente"
            LOCAL[Navegador LocalStorage<br/>'cart-storage' / 'jwt-token']
        end
        
        BROWSER -->|Agrega Prenda| REACT
        REACT -->|Actualiza Re-renderiza| BROWSER
        REACT <-->|Sincroniza Persistencia| LOCAL
    end
    
    subgraph "Sincronía Nube"
        LOCAL <-->|Sync Session al Iniciar| API[Backend RestAPI]
        API -->|Registra Pedido Oficial| DB[(PostgreSQL)]
    end

    style BROWSER fill:#1a1a24,stroke:#14b8a6,stroke-width:2px,color:#fff
    style REACT fill:#61dafb,stroke:#000,color:#000
    style LOCAL fill:#f59e0b,stroke:#000,color:#000
                        `} id="state-management" />
                    </div>
                </section>
            </div>
        </div>
    );
};

export default ArchitectureDocumentationPage;
