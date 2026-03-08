import React from 'react';
import '../styles/PlanEstrategicoPage.css';
import {
  FaStar, FaShieldAlt, FaLightbulb, FaHeart, FaHandshake, FaBullseye,
  FaChartLine, FaUsers, FaCogs, FaMoneyBillWave, FaLaptopCode,
  FaCheckCircle, FaExclamationCircle, FaArrowUp, FaArrowDown
} from 'react-icons/fa';

const PlanEstrategico = () => {
  return (
    <div className="pe-container">
      {/* 1. Plan Estratégico de Crecimiento (Título principal) */}
      <div className="pe-header">
        <h1 className="pe-title">Plan Estratégico de Crecimiento</h1>
        <p className="pe-subtitle">
          Transformando la moda urbana colombiana a través de una experiencia digital excepcional y diseños únicos que conectan con el estilo de vida actual.
        </p>
      </div>

      {/* 2. Nuestra Identidad Estratégica */}
      <section className="pe-section">
        <h2 className="pe-section-title"><FaBullseye /> Nuestra Identidad Estratégica</h2>
        <div className="pe-grid-2">
          {/* Misión */}
          <div className="pe-card">
            <h3 className="pe-card-title">Misión</h3>
            <p className="pe-card-text">
              Ofrecer ropa urbana y casual de alta calidad, con diseños versátiles y accesibles, que brinden comodidad y estilo a personas entre 15 y 45 años en todo Colombia. Creamos una experiencia de compra 100% digital, confiable y cercana que se adapta al ritmo de vida moderno de nuestros clientes, facilitando el acceso a moda de calidad desde cualquier lugar del país.
            </p>
          </div>
          {/* Visión 2030 */}
          <div className="pe-card">
            <h3 className="pe-card-title">Visión 2030</h3>
            <p className="pe-card-text">
              Ser la marca digital líder en moda urbana en Colombia, reconocida por nuestra calidad excepcional, diseño exclusivo e innovación constante. Construiremos una comunidad de clientes fieles que encuentran en nuestra marca una expresión auténtica de su estilo personal, estableciendo nuevos estándares en el comercio digital de moda en el país.
            </p>
          </div>
        </div>

        {/* Valores */}
        <h3 className="pe-card-title" style={{ marginTop: '2rem' }}>Valores</h3>
        <div className="pe-cards-container">
          <div className="pe-card">
            <div className="pe-card-icon"><FaLightbulb /></div>
            <h4 className="pe-card-title">Creatividad</h4>
            <p className="pe-card-text">Diseñamos prendas con estilo propio, frescas y modernas que reflejan las tendencias urbanas actuales.</p>
          </div>
          <div className="pe-card">
            <div className="pe-card-icon"><FaStar /></div>
            <h4 className="pe-card-title">Calidad</h4>
            <p className="pe-card-text">Garantizamos productos duraderos, cómodos y bien elaborados que superan las expectativas de nuestros clientes.</p>
          </div>
          <div className="pe-card">
            <div className="pe-card-icon"><FaHandshake /></div>
            <h4 className="pe-card-title">Accesibilidad</h4>
            <p className="pe-card-text">Mantenemos precios competitivos sin sacrificar calidad, democratizando el acceso a moda de diseño.</p>
          </div>
          <div className="pe-card">
            <div className="pe-card-icon"><FaHeart /></div>
            <h4 className="pe-card-title">Cercanía</h4>
            <p className="pe-card-text">Valoramos cada interacción, brindando atención humana, personalizada y rápida en cada punto de contacto.</p>
          </div>
          <div className="pe-card">
            <div className="pe-card-icon"><FaShieldAlt /></div>
            <h4 className="pe-card-title">Confianza</h4>
            <p className="pe-card-text">Actuamos con transparencia total en precios, entregas y servicio, construyendo relaciones duraderas.</p>
          </div>
          <div className="pe-card">
            <div className="pe-card-icon"><FaLaptopCode /></div>
            <h4 className="pe-card-title">Innovación</h4>
            <p className="pe-card-text">Evolucionamos constantemente en diseño, tecnología y experiencia digital para sorprender a nuestros clientes.</p>
          </div>
        </div>
      </section>

      {/* 3. Análisis Interno y Externo (DOFA) */}
      <section className="pe-section">
        <h2 className="pe-section-title"><FaChartLine /> Análisis Estratégico (Matriz DOFA)</h2>
        <div className="pe-grid-2">
          {/* Fortalezas (Interno) */}
          <div className="pe-card" style={{ borderLeft: '4px solid #4CAF50' }}>
            <h3 className="pe-card-title flex items-center gap-2"><FaArrowUp style={{ color: '#4CAF50' }} /> Fortalezas</h3>
            <ul className="pe-card-list">
              <li>Diseño único y calidad superior</li>
              <li>Variedad de prendas urbanas</li>
              <li>Experiencia digital completa</li>
              <li>Compromiso familiar</li>
            </ul>
          </div>
          {/* Debilidades (Interno) */}
          <div className="pe-card" style={{ borderLeft: '4px solid #F44336' }}>
            <h3 className="pe-card-title flex items-center gap-2"><FaArrowDown style={{ color: '#F44336' }} /> Debilidades</h3>
            <ul className="pe-card-list">
              <li>Falta de estrategia posventa</li>
              <li>Rentabilidad no definida</li>
              <li>Proceso productivo no estructurado</li>
              <li>Alianzas logísticas no consolidadas</li>
            </ul>
          </div>
          {/* Oportunidades (Externo) */}
          <div className="pe-card" style={{ borderLeft: '4px solid #2196F3' }}>
            <h3 className="pe-card-title flex items-center gap-2"><FaCheckCircle style={{ color: '#2196F3' }} /> Oportunidades</h3>
            <ul className="pe-card-list">
              <li>Mercado digital en crecimiento</li>
              <li>Consumidores buscan comodidad</li>
              <li>Nuevos modelos de venta</li>
              <li>Amplitud del segmento</li>
            </ul>
          </div>
          {/* Amenazas (Externo) */}
          <div className="pe-card" style={{ borderLeft: '4px solid #FF9800' }}>
            <h3 className="pe-card-title flex items-center gap-2"><FaExclamationCircle style={{ color: '#FF9800' }} /> Amenazas</h3>
            <ul className="pe-card-list">
              <li>Competencia creciente</li>
              <li>Incremento en costos logísticos</li>
              <li>Saturación publicitaria</li>
              <li>Baja fidelidad de clientes online</li>
            </ul>
          </div>
        </div>

        {/* Implicaciones Estratégicas */}
        <h3 className="pe-card-title" style={{ marginTop: '2rem' }}>Implicaciones Estratégicas</h3>
        <div className="pe-cards-container">
          <div className="pe-card">
            <h4 className="pe-card-title" style={{ color: '#d4af37' }}>Potenciar</h4>
            <p className="pe-card-text">Aprovechar nuestros diseños únicos y calidad superior para capturar el crecimiento del mercado digital y diferenciarnos en un entorno competitivo.</p>
          </div>
          <div className="pe-card">
            <h4 className="pe-card-title" style={{ color: '#d4af37' }}>Defender</h4>
            <p className="pe-card-text">Fortalecer procesos internos y alianzas estratégicas para protegernos de la volatilidad logística y mantener competitividad en precios.</p>
          </div>
          <div className="pe-card">
            <h4 className="pe-card-title" style={{ color: '#d4af37' }}>Construir</h4>
            <p className="pe-card-text">Desarrollar sistemas de fidelización y posventa robustos que conviertan nuestra cercanía familiar en ventaja competitiva sostenible.</p>
          </div>
        </div>
      </section>

      {/* 4. Objetivos Estratégicos 2025-2026 */}
      <section className="pe-section">
        <h2 className="pe-section-title"><FaBullseye /> Objetivos Estratégicos 2025-2026</h2>
        <p className="pe-section-desc">
          Establecemos cinco objetivos fundamentales que guiarán nuestras acciones durante los próximos 12 a 24 meses, enfocados en consolidar la marca, optimizar operaciones y crear experiencias excepcionales que generen lealtad y crecimiento sostenible.
        </p>
        <div className="pe-cards-container">
          <div className="pe-card">
            <div className="pe-card-icon"><FaStar /></div>
            <h3 className="pe-card-title">Consolidar Marca</h3>
            <p className="pe-card-text">Lanzar nuestra primera colección oficial con identidad visual coherente, y narrativa de marca auténtica. Incrementar comunidad activa en redes sociales.</p>
          </div>
          <div className="pe-card">
            <div className="pe-card-icon"><FaUsers /></div>
            <h3 className="pe-card-title">Experiencia del Cliente</h3>
            <p className="pe-card-text">Implementar plan integral de posventa con mensajes automáticos personalizados y crear programa de fidelización robusto.</p>
          </div>
          <div className="pe-card">
            <div className="pe-card-icon"><FaCogs /></div>
            <h3 className="pe-card-title">Optimizar Producción</h3>
            <p className="pe-card-text">Definir modelo de inventario óptimo, seleccionar proveedores confiables y elegir transportadora principal con tarifas preferenciales.</p>
          </div>
          <div className="pe-card">
            <div className="pe-card-icon"><FaMoneyBillWave /></div>
            <h3 className="pe-card-title">Rentabilidad Financiera</h3>
            <p className="pe-card-text">Identificar prendas de mayor margen, construir estructura de costos transparente y crear combos que maximicen valor de pedido.</p>
          </div>
          <div className="pe-card">
            <div className="pe-card-icon"><FaLaptopCode /></div>
            <h3 className="pe-card-title">Plataforma Digital</h3>
            <p className="pe-card-text">Optimizar experiencia de usuario en página web y conectar con CRM básico para gestión de clientes.</p>
          </div>
        </div>
      </section>

      {/* 5. Indicadores Clave de Desempeño (KPIs) */}
      <section className="pe-section">
        <h2 className="pe-section-title"><FaChartLine /> Indicadores y Plan de Acción</h2>
        <p className="pe-section-desc">
          Establecemos KPIs claros para medir nuestro progreso y un plan concreto de 90 días para iniciar la transformación de la marca corporativa.
        </p>

        <h3 className="pe-card-title" style={{ marginBottom: '1.5rem' }}>Indicadores Clave de Desempeño (KPIs)</h3>
        <div className="pe-kpi-container">
          <div className="pe-kpi-box">
            <div className="pe-kpi-value">+30%</div>
            <div className="pe-kpi-label">Alcance Mensual</div>
            <div className="pe-kpi-desc">Crecimiento en redes</div>
          </div>
          <div className="pe-kpi-box">
            <div className="pe-kpi-value">+20%</div>
            <div className="pe-kpi-label">Pedidos Trimestrales</div>
            <div className="pe-kpi-desc">Incremento en transacciones</div>
          </div>
          <div className="pe-kpi-box">
            <div className="pe-kpi-value">25%</div>
            <div className="pe-kpi-label">Tasa de Recompra</div>
            <div className="pe-kpi-desc">Segunda compra en 6 meses</div>
          </div>
          <div className="pe-kpi-box">
            <div className="pe-kpi-value">48-72h</div>
            <div className="pe-kpi-label">Tiempo de Entrega</div>
            <div className="pe-kpi-desc">Confirmación a entrega</div>
          </div>
          <div className="pe-kpi-box">
            <div className="pe-kpi-value">&lt;3%</div>
            <div className="pe-kpi-label">Devoluciones</div>
            <div className="pe-kpi-desc">Calidad o talla</div>
          </div>
          <div className="pe-kpi-box">
            <div className="pe-kpi-value">≥30%</div>
            <div className="pe-kpi-label">Margen por Prenda</div>
            <div className="pe-kpi-desc">Después de costos directos</div>
          </div>
        </div>
      </section>

      {/* 6. Plan de Acción: Primeros 90 Días */}
      <section className="pe-section">
        <h3 className="pe-card-title" style={{ marginBottom: '1.5rem' }}>Plan de Acción: Primeros 90 Días</h3>
        <div className="pe-cards-container">
          <div className="pe-card">
            <h4 className="pe-card-title" style={{ color: 'var(--primary-color)' }}>01. Proveedores</h4>
            <p className="pe-card-text">Seleccionar proveedores confiables con términos que garanticen abastecimiento estable.</p>
          </div>
          <div className="pe-card">
            <h4 className="pe-card-title" style={{ color: 'var(--primary-color)' }}>02. Transportadora</h4>
            <p className="pe-card-text">Negociar tarifas preferenciales para cobertura nacional, y servicio rápido.</p>
          </div>
          <div className="pe-card">
            <h4 className="pe-card-title" style={{ color: 'var(--primary-color)' }}>03. Colección Base</h4>
            <p className="pe-card-text">Diseñar y producir colección inicial de 6-10 referencias que representen la marca.</p>
          </div>
          <div className="pe-card">
            <h4 className="pe-card-title" style={{ color: 'var(--primary-color)' }}>04. Web Óptima</h4>
            <p className="pe-card-text">Mejorar velocidad, navegación y checkout con experiencia mobile impecable.</p>
          </div>
          <div className="pe-card">
            <h4 className="pe-card-title" style={{ color: 'var(--primary-color)' }}>05. Contenido</h4>
            <p className="pe-card-text">Planificar contenido mensual con mix de lifestyle y producto de valor agregado.</p>
          </div>
          <div className="pe-card">
            <h4 className="pe-card-title" style={{ color: 'var(--primary-color)' }}>06. Post-Ventas</h4>
            <p className="pe-card-text">Secuencia automatizada: confirmación, rastreo, entrega y fidelización.</p>
          </div>
          <div className="pe-card">
            <h4 className="pe-card-title" style={{ color: 'var(--primary-color)' }}>07. Empaques</h4>
            <p className="pe-card-text">Unboxing memorable con packaging propio que refuerce el prestigio de la orden.</p>
          </div>
          <div className="pe-card">
            <h4 className="pe-card-title" style={{ color: 'var(--primary-color)' }}>08. Estructura</h4>
            <p className="pe-card-text">Costes unificados (producción, envío, ads) garantizando margen operativo.</p>
          </div>
        </div>
      </section>

      {/* 7. Estrategias Clave de Ejecución */}
      <section className="pe-section">
        <h2 className="pe-section-title"><FaCogs /> Estrategias Clave de Ejecución</h2>
        <p className="pe-section-desc">
          Definimos cuatro pilares estratégicos con tácticas específicas para alcanzar nuestros objetivos sostenibles.
        </p>
        <div className="pe-grid-2">
          <div className="pe-card">
            <div className="pe-card-icon"><FaBullseye /></div>
            <h3 className="pe-card-title">Marketing & Ventas</h3>
            <ul className="pe-card-list">
              <li>Campañas con videos orgánicos (Tiktok).</li>
              <li>Microinfluencers para el nicho urbano.</li>
              <li>Shootings de alto impacto.</li>
            </ul>
          </div>
          <div className="pe-card">
            <div className="pe-card-icon"><FaHeart /></div>
            <h3 className="pe-card-title">Fidelización</h3>
            <ul className="pe-card-list">
              <li>Encuestas de satisfacción recurrentes.</li>
              <li>Club VIP de descuentos estacionales.</li>
              <li>Bonos personalizados por re-compras.</li>
            </ul>
          </div>
          <div className="pe-card">
            <div className="pe-card-icon"><FaHandshake /></div>
            <h3 className="pe-card-title">Operaciones</h3>
            <ul className="pe-card-list">
              <li>Contratar servicio fotográfico ágil.</li>
              <li>Protocolo de Calidad previo a despachos.</li>
              <li>Red de embajadores distribuidores localizados.</li>
            </ul>
          </div>
          <div className="pe-card">
            <div className="pe-card-icon"><FaMoneyBillWave /></div>
            <h3 className="pe-card-title">Finanzas</h3>
            <ul className="pe-card-list">
              <li>Revisar y optimizar gastos digitales.</li>
              <li>Seguimiento de meta de ventas en tiempo real.</li>
              <li>Proyecciones financieras trimestrajes (Low, Base, High).</li>
            </ul>
          </div>
        </div>
      </section>

      <div className="pe-footer-quote">
        <p className="pe-quote-text">
          "El éxito no es el resultado de acciones esporádicas, sino de la ejecución disciplinada y consistente de un plan estratégico bien pensado. Estos primeros 90 días marcan el inicio de la transformación hacia un ecosistema digital consolidado y superior."
        </p>
      </div>
    </div>
  );
};

export default PlanEstrategico;