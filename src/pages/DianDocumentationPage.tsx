import React from 'react';
import { FaFileInvoice, FaFilePdf, FaProjectDiagram, FaShieldAlt, FaCheckCircle, FaGlobe, FaServer, FaCogs } from 'react-icons/fa';

const DianDocumentationPage = () => {
    return (
        <div className="card" style={{ maxWidth: '1200px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
            <h1 className="pe-title" style={{ fontSize: '28px', marginBottom: '8px', color: '#f1f1f3', fontWeight: 'bold' }}>Documentación Técnica: Facturación Electrónica DIAN</h1>
            <p className="pe-desc" style={{ marginBottom: '32px', color: '#a0a0b0', fontSize: '15px' }}>
                Vista general de la arquitectura, flujogramas y procesos implementados en el ecosistema <b>Two Six CMS</b> para la integración de la Facturación Electrónica DIAN.
            </p>

            <div className="grid grid-cols-1 gap-8 mb-8">
                {/* 1. Arquitectura General */}
                <section className="bg-[#1a1a24] p-6 rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.3)] border border-[#2a2a35]">
                    <h2 className="text-xl font-bold flex items-center text-[#f1f1f3] mb-4"><FaProjectDiagram className="mr-2 text-yellow-500" /> 1. Arquitectura del Flujo DIAN</h2>
                    <p className="text-[#a0a0b0] mb-6 text-sm">El proceso inicia cuando un pedido cambia a estado <b>PAGADO</b> o cuando el administrador presiona el botón "REINTENTAR DIAN". El Backend (NestJS) se encarga de todo el ciclo de vida.</p>
                    
                    {/* Diagrama Tailwind */}
                    <div className="flex flex-col md:flex-row items-center justify-between bg-[#13131a] p-4 rounded-lg">
                        <div className="flex flex-col items-center p-3 text-center w-full">
                            <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mb-2"><FaCogs size={20}/></div>
                            <span className="text-xs font-semibold">Two Six CMS</span>
                            <span className="text-xs text-[#a0a0b0]">(Dispara Evento)</span>
                        </div>
                        <div className="hidden md:block w-8 border-t border-dashed border-[#2a2a35]"></div>
                        <div className="flex flex-col items-center p-3 text-center w-full">
                            <div className="w-12 h-12 bg-[#1a1a24] border-2 border-[#2a2a35] text-[#f1f1f3] rounded-full flex items-center justify-center mb-2"><FaFileInvoice size={20}/></div>
                            <span className="text-xs font-semibold">Motor UBL 2.1</span>
                            <span className="text-xs text-[#a0a0b0]">(Arma XML)</span>
                        </div>
                        <div className="hidden md:block w-8 border-t border-dashed border-[#2a2a35]"></div>
                        <div className="flex flex-col items-center p-3 text-center w-full">
                            <div className="w-12 h-12 bg-yellow-500 text-[#f1f1f3] rounded-full flex items-center justify-center mb-2"><FaShieldAlt size={20}/></div>
                            <span className="text-xs font-semibold">XAdES-EPES</span>
                            <span className="text-xs text-[#a0a0b0]">(Firma Digital)</span>
                        </div>
                        <div className="hidden md:block w-8 border-t border-dashed border-[#2a2a35]"></div>
                        <div className="flex flex-col items-center p-3 text-center w-full">
                            <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mb-2"><FaGlobe size={20}/></div>
                            <span className="text-xs font-semibold">DIAN API</span>
                            <span className="text-xs text-[#a0a0b0]">(Wcf SOAP)</span>
                        </div>
                        <div className="hidden md:block w-8 border-t border-dashed border-[#2a2a35]"></div>
                        <div className="flex flex-col items-center p-3 text-center w-full">
                            <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center mb-2"><FaCheckCircle size={20}/></div>
                            <span className="text-xs font-semibold">Verificación</span>
                            <span className="text-xs text-[#a0a0b0]">(ZipKey Async)</span>
                        </div>
                    </div>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* 2. UBL */}
                    <section className="bg-[#1a1a24] p-6 rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.3)] border border-[#2a2a35]">
                        <h2 className="text-xl font-bold flex items-center text-[#f1f1f3] mb-4"><FaFileInvoice className="mr-2 text-blue-500" /> 2. Estándar UBL 2.1</h2>
                        <ul className="list-disc pl-5 text-[#a0a0b0] text-sm space-y-2">
                            <li>El backend usa la librería genérica de XML pero inyecta los namespaces explícitos (<b>cac, cbc, ext, sts</b>).</li>
                            <li>La resolución activa se consulta en DB (<code>dian_resolutions</code> con status activo).</li>
                            <li><b>Generación CUFE (SHA-384):</b> Se concatena: NumFactura + Fecha + Hora + Total + IVA + NIT Emisor + NIT Comprador + Clave Técnica.</li>
                            <li>Los impuestos (Ley FAS07/FAS01) se agrupan matemáticamente por porcentaje en la "Cabecera".</li>
                        </ul>
                    </section>

                    {/* 3. XAdES */}
                    <section className="bg-[#1a1a24] p-6 rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.3)] border border-[#2a2a35]">
                        <h2 className="text-xl font-bold flex items-center text-[#f1f1f3] mb-4"><FaShieldAlt className="mr-2 text-yellow-500" /> 3. Firma Digital XAdES</h2>
                        <ul className="list-disc pl-5 text-[#a0a0b0] text-sm space-y-2">
                            <li>Utiliza el certificado <b>GSE.p12</b> de representación legal.</li>
                            <li>A través de <b>xml-crypto</b>, el archivo inyecta <code>KeyInfo</code> (Certificado Base64 + RSA Modulus).</li>
                            <li>Inyecta <code>QualifyingProperties</code> obligatorias referenciando la Política de Firma v2.0 de la DIAN.</li>
                            <li><b>C14N (Canonicalización):</b> Protege la firma contra corrupciones de caracteres invisibles.</li>
                        </ul>
                    </section>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     {/* 4. SOAP & Notas */}
                     <section className="bg-[#1a1a24] p-6 rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.3)] border border-[#2a2a35]">
                        <h2 className="text-xl font-bold flex items-center text-[#f1f1f3] mb-4"><FaServer className="mr-2 text-purple-600" /> 4. SOAP y Notas (NC/ND)</h2>
                        <ul className="list-disc pl-5 text-[#a0a0b0] text-sm space-y-2">
                            <li>La comunicación va hacia <b>WcfDianCustomerServices.svc</b> mediante un WSS Security Token en texto claro expirado en 5 minutos.</li>
                            <li>La <b>Nota Crédito (91)</b> usa <code>CUDE-SHA384</code> y requiere referenciar el <code>UUID</code> explícito de la Factura Original tras ser validada al 100% por la DIAN (superando el sandbox lag).</li>
                            <li>La <b>Nota Débito (92)</b> se maneja con estructura idéntica a la Factura, remplazando prefijos a ND.</li>
                        </ul>
                    </section>

                    {/* 5. PDF y Gráficos */}
                    <section className="bg-[#1a1a24] p-6 rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.3)] border border-[#2a2a35]">
                        <h2 className="text-xl font-bold flex items-center text-[#f1f1f3] mb-4"><FaFilePdf className="mr-2 text-red-500" /> 5. Renderizado Premium PDF</h2>
                        <ul className="list-disc pl-5 text-[#a0a0b0] text-sm space-y-2">
                            <li>El backend compila en caliente una macro-plantilla Handlebars y la traduce a PDF con Chromium Headless.</li>
                            <li>El logotipo de The Two Six se inyecta en Base64 garantizando seguridad Offline.</li>
                            <li>El código QR contiene la sintaxis de búsqueda <code>catalogo-vpfe.dian.gov.co</code> y el scanner oficial se nutre en tiempo real.</li>
                            <li>El CMS administra colas de carga asíncrona mediante candados en React impidiendo re-ejecuciones múltiples de usuarios.</li>
                        </ul>
                    </section>
                </div>

                {/* 6. Automatización de Envío (Zero-Touch) */}
                <div className="grid grid-cols-1 gap-8 mt-8">
                    <section className="bg-[#1a1a24] p-6 rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.3)] border border-[#2a2a35]">
                        <h2 className="text-xl font-bold flex items-center text-[#f1f1f3] mb-4"><FaServer className="mr-2 text-green-500" /> 6. Motor Autónomo de Correos (Zero-Touch)</h2>
                        <ul className="list-disc pl-5 text-[#a0a0b0] text-sm space-y-2">
                            <li><b>Desacoplamiento:</b> Los correos comerciales de la tienda (<em>logística y rastreo</em>) viajan de manera inmediata tras el pago. Facturación electrónica se gestiona en un hilo de fondo.</li>
                            <li><b>Demonio (CronJob):</b> En Sandbox, debido al tiempo de procesamiento de la DIAN, un cron job nativo de NestJS audita cada 60 segundos las facturas en estado <code>SENT</code>, recaba el `ZipKey`, y al estar <code>AUTHORIZED</code>, despacha el correo transparente al usuario.</li>
                            <li><b>Compresión Legal .zip:</b> A través de un transporte de Nodemailer asignado exclusivamente a <code>twosixfacturaelectronica@gmail.com</code>, se ensambla un archivo <code>AttachedDocument.zip</code> (XML + Representación Gráfica PDF) siguiendo el Anexo 1.8.</li>
                            <li><b>Idempotencia:</b> Prisma registra <code>email_sent: true</code> al emitir el mensaje, protegiendo al ecosistema contra envíos masivos o interrupciones del servidor. En producción (modo síncrono), la factura sale en línea sin requerir el escaneo diferido.</li>
                        </ul>
                    </section>
                </div>

                {/* 7. Futura Integración: Nómina Electrónica */}
                <div className="grid grid-cols-1 gap-8 mt-8">
                    <section className="bg-[#1a1a24] p-6 rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.3)] border border-[#2a2a35]">
                        <h2 className="text-xl font-bold flex items-center text-[#f1f1f3] mb-4"><FaProjectDiagram className="mr-2 text-cyan-500" /> 7. Nómina Electrónica (Preparación Técnica)</h2>
                        <p className="text-[#a0a0b0] mb-4 text-sm">El ecosistema está habilitado para la liquidación de nómina profesional (Ley 1607, Provisiones y Aportes). La arquitectura está diseñada para la futura conexión con el sistema de transmisión XML hacia la DIAN.</p>
                        <ul className="list-disc pl-5 text-[#a0a0b0] text-sm space-y-2">
                            <li><b>Motor de Cálculo:</b> Implementado en NestJS bajo normatividad NIIF/Colombiana.</li>
                            <li><b>Transmisión XML:</b> Preparado para generar documentos soporte de pago de nómina electrónica bajo el estándar UBL de la DIAN.</li>
                            <li><b>Habilitación:</b> El proceso de habilitación ante la DIAN será el paso final al contratar el primer empleado, utilizando el mismo certificado digital <b>GSE.p12</b> ya configurado.</li>
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default DianDocumentationPage;
