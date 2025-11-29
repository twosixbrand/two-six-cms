import React from 'react';

// --- Estilos de Apoyo (Adaptar según el diseño de tu CMS) ---
// En un proyecto real, se usarían clases CSS, pero para el ejemplo, usamos estilos inline.
const containerStyle = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '20px',
  fontFamily: 'serif', // Usando la fuente de las imágenes
  color: '#333',
  lineHeight: '1.6',
};

const sectionTitleStyle = {
  fontSize: '2.5em',
  fontWeight: 'bold',
  color: '#6e5d59', // Tono similar al de los títulos en las imágenes
  borderBottom: '2px solid #6e5d59',
  paddingBottom: '10px',
  marginBottom: '30px',
  marginTop: '40px',
};

const subTitleStyle = {
  fontSize: '1.8em',
  fontWeight: '600',
  color: '#6e5d59',
  marginBottom: '15px',
};

const cardContainerStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: '20px',
  marginBottom: '30px',
};

const cardStyle = {
  backgroundColor: '#4e4844', // Fondo oscuro de las tarjetas
  color: '#ffffff', // Texto blanco
  padding: '20px',
  borderRadius: '8px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
};

const textBlockStyle = {
  padding: '20px',
  backgroundColor: '#f5f5f5', // Fondo claro para bloques de texto
  borderRadius: '8px',
  marginBottom: '30px',
};

const grid2ColsStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '20px',
  marginBottom: '30px',
};

const metricBoxStyle = {
    backgroundColor: '#4e4844',
    color: '#ffffff',
    padding: '20px',
    borderRadius: '8px',
    textAlign: 'center',
};

const metricValueStyle = {
    fontSize: '2.5em',
    fontWeight: 'bold',
    color: '#e0c9b6', // Color de énfasis
    marginBottom: '5px',
};

const metricLabelStyle = {
    fontSize: '1.2em',
    fontWeight: '600',
    marginBottom: '5px',
};

const metricDescStyle = {
    fontSize: '0.9em',
    opacity: '0.8',
};

const SWOTStyle = {
    backgroundColor: '#4e4844',
    color: '#e0c9b6',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '10px',
};

// --- Componente Principal ---
const PlanEstrategico = () => {
  return (
    <div style={containerStyle}>
      {/* 1. Plan Estratégico de Crecimiento (Título principal) */}
      <h1 style={{...sectionTitleStyle, fontSize: '3.5em', borderBottom: 'none'}}>Plan Estratégico de Crecimiento</h1>
      <p style={{fontSize: '1.2em', textAlign: 'center', marginBottom: '40px'}}>
        Transformando la moda urbana colombiana a través de una experiencia digital excepcional y diseños únicos que conectan con el estilo de vida actual.
      </p>

      {/* 2. Nuestra Identidad Estratégica */}
      <section>
        <h2 style={sectionTitleStyle}>Nuestra Identidad Estratégica</h2>
        <div style={grid2ColsStyle}>
          {/* Misión */}
          <div>
            <h3 style={subTitleStyle}>Misión</h3>
            <p>
              Ofrecer ropa urbana y casual de alta calidad, con diseños versátiles y accesibles, que brinden comodidad y estilo a personas entre 15 y 45 años** en todo Colombia. Creamos una experiencia de compra 100% digital, confiable y cercana que se adapta al ritmo de vida moderno de nuestros clientes, facilitando el acceso a moda de calidad desde cualquier lugar del país.
            </p>
          </div>
          {/* Visión 2030 */}
          <div>
            <h3 style={subTitleStyle}>Visión 2030</h3>
            <p>
              Ser la marca digital líder en moda urbana en Colombia, reconocida por nuestra calidad excepcional, diseño exclusivo e innovación constante. Construiremos una comunidad de clientes fieles que encuentran en nuestra marca una expresión auténtica de su estilo personal, estableciendo nuevos estándares en el comercio digital de moda en el país.
            </p>
          </div>
        </div>

        {/* Valores */}
        <h3 style={subTitleStyle}>Valores</h3>
        <div style={cardContainerStyle}>
          {/* Creatividad */}
          <div style={cardStyle}>
            <h4 style={{...subTitleStyle, color: '#e0c9b6', fontSize: '1.4em'}}>Creatividad</h4>
            <p>Diseñamos prendas con estilo propio, frescas y modernas que reflejan las tendencias urbanas actuales.</p>
          </div>
          {/* Calidad */}
          <div style={cardStyle}>
            <h4 style={{...subTitleStyle, color: '#e0c9b6', fontSize: '1.4em'}}>Calidad</h4>
            <p>Garantizamos productos duraderos, cómodos y bien elaborados que superan las expectativas de nuestros clientes.</p>
          </div>
          {/* Accesibilidad */}
          <div style={cardStyle}>
            <h4 style={{...subTitleStyle, color: '#e0c9b6', fontSize: '1.4em'}}>Accesibilidad</h4>
            <p>Mantenemos precios competitivos sin sacrificar calidad, democratizando el acceso a moda de diseño.</p>
          </div>
          {/* Cercanía */}
          <div style={cardStyle}>
            <h4 style={{...subTitleStyle, color: '#e0c9b6', fontSize: '1.4em'}}>Cercanía</h4>
            <p>Valoramos cada interacción, brindando atención humana, personalizada y rápida en cada punto de contacto.</p>
          </div>
          {/* Confianza */}
          <div style={cardStyle}>
            <h4 style={{...subTitleStyle, color: '#e0c9b6', fontSize: '1.4em'}}>Confianza</h4>
            <p>Actuamos con transparencia total en precios, entregas y servicio, construyendo relaciones duraderas.</p>
          </div>
          {/* Innovación */}
          <div style={cardStyle}>
            <h4 style={{...subTitleStyle, color: '#e0c9b6', fontSize: '1.4em'}}>Innovación</h4>
            <p>Evolucionamos constantemente en diseño, tecnología y experiencia digital para sorprender a nuestros clientes.</p>
          </div>
        </div>
      </section>

      {/* 3. Análisis Interno y Externo (DOFA) */}
      <section>
        <h2 style={sectionTitleStyle}>Análisis Estratégico (Matriz DOFA)</h2>
        <div style={grid2ColsStyle}>
            {/* Fortalezas (Interno) */}
            <div>
                <h3 style={{...subTitleStyle, color: '#e0c9b6', backgroundColor: '#6e5d59', padding: '10px', borderRadius: '5px'}}>Fortalezas</h3>
                <ul style={{listStyleType: 'disc', paddingLeft: '20px'}}>
                    <li>Diseño único y calidad superior</li>
                    <li>Variedad de prendas urbanas</li>
                    <li>Experiencia digital completa</li>
                    <li>Compromiso familiar</li>
                </ul>
            </div>
            {/* Debilidades (Interno) */}
            <div>
                <h3 style={{...subTitleStyle, color: '#e0c9b6', backgroundColor: '#6e5d59', padding: '10px', borderRadius: '5px'}}>Debilidades</h3>
                <ul style={{listStyleType: 'disc', paddingLeft: '20px'}}>
                    <li>Falta de estrategia posventa</li>
                    <li>Rentabilidad no definida</li>
                    <li>Proceso productivo no estructurado</li>
                    <li>Alianzas logísticas no consolidadas</li>
                </ul>
            </div>
            {/* Oportunidades (Externo) */}
            <div>
                <h3 style={{...subTitleStyle, color: '#e0c9b6', backgroundColor: '#6e5d59', padding: '10px', borderRadius: '5px'}}>Oportunidades</h3>
                <ul style={{listStyleType: 'disc', paddingLeft: '20px'}}>
                    <li>Mercado digital en crecimiento</li>
                    <li>Consumidores buscan comodidad</li>
                    <li>Nuevos modelos de venta</li>
                    <li>Amplitud del segmento</li>
                </ul>
            </div>
            {/* Amenazas (Externo) */}
            <div>
                <h3 style={{...subTitleStyle, color: '#e0c9b6', backgroundColor: '#6e5d59', padding: '10px', borderRadius: '5px'}}>Amenazas</h3>
                <ul style={{listStyleType: 'disc', paddingLeft: '20px'}}>
                    <li>Competencia creciente</li>
                    <li>Incremento en costos logísticos</li>
                    <li>Saturación publicitaria</li>
                    <li>Baja fidelidad de clientes online</li>
                </ul>
            </div>
        </div>

        {/* Implicaciones Estratégicas */}
        <h3 style={subTitleStyle}>Implicaciones Estratégicas</h3>
        <div style={cardContainerStyle}>
            <div style={{...cardStyle, backgroundColor: '#e0c9b6', color: '#4e4844'}}>
                <h4 style={{...subTitleStyle, color: '#4e4844', fontSize: '1.4em'}}>Potenciar</h4>
                <p>Aprovechar nuestros diseños únicos y calidad superior para capturar el crecimiento del mercado digital y diferenciarnos en un entorno competitivo.</p>
            </div>
            <div style={{...cardStyle, backgroundColor: '#c5d5e5', color: '#4e4844'}}>
                <h4 style={{...subTitleStyle, color: '#4e4844', fontSize: '1.4em'}}>Defender</h4>
                <p>Fortalecer procesos internos y alianzas estratégicas para protegernos de la volatilidad logística y mantener competitividad en precios.</p>
            </div>
            <div style={{...cardStyle, backgroundColor: '#f0e6e4', color: '#4e4844'}}>
                <h4 style={{...subTitleStyle, color: '#4e4844', fontSize: '1.4em'}}>Construir</h4>
                <p>Desarrollar sistemas de fidelización y posventa robustos que conviertan nuestra cercanía familiar en ventaja competitiva sostenible.</p>
            </div>
        </div>
      </section>

      {/* 4. Objetivos Estratégicos 2025-2026 */}
      <section>
        <h2 style={sectionTitleStyle}>Objetivos Estratégicos 2025-2026</h2>
        <p style={{marginBottom: '20px'}}>
            Establecemos cinco objetivos fundamentales que guiarán nuestras acciones durante los próximos 12 a 24 meses, enfocados en consolidar la marca, optimizar operaciones y crear experiencias excepcionales que generen lealtad y crecimiento sostenible.
        </p>
        <div style={cardContainerStyle}>
            {/* Consolidar Presencia de Marca */}
            <div style={cardStyle}>
                <h3 style={{...subTitleStyle, color: '#e0c9b6', fontSize: '1.4em'}}>Consolidar Presencia de Marca</h3>
                <p>Lanzar nuestra primera colección oficial con identidad visual coherente, desarrollar línea gráfica distintiva y narrativa de marca auténtica. Incrementar comunidad activa en redes sociales con contenido de valor que genere engagement genuino y construcción de comunidad leal.</p>
            </div>
            {/* Fortalecer Experiencia del Cliente */}
            <div style={cardStyle}>
                <h3 style={{...subTitleStyle, color: '#e0c9b6', fontSize: '1.4em'}}>Fortalecer Experiencia del Cliente</h3>
                <p>Implementar plan integral de posventa con mensajes automáticos personalizados, encuestas de satisfacción y descuentos exclusivos. Crear programa de fidelización robusto con sistema de puntos, bonos especiales y beneficios de cumpleaños que premien la lealtad y generen recompra.</p>
            </div>
            {/* Optimizar Operación y Producción */}
            <div style={cardStyle}>
                <h3 style={{...subTitleStyle, color: '#e0c9b6', fontSize: '1.4em'}}>Optimizar Operación y Producción</h3>
                <p>Definir modelo de inventario óptimo entre stock fijo y fabricación bajo pedido según análisis de demanda. Seleccionar proveedores formales confiables con negociaciones estables. Elegir transportadora principal con tarifas preferenciales y servicio consistente que garantice experiencia de entrega excepcional.</p>
            </div>
            {/* Mejorar Rentabilidad Financiera */}
            <div style={cardStyle}>
                <h3 style={{...subTitleStyle, color: '#e0c9b6', fontSize: '1.4em'}}>Mejorar Rentabilidad Financiera</h3>
                <p>Identificar prendas de mayor margen mediante análisis detallado de costos y precios. Construir estructura de costos transparente por prenda incluyendo producción, logística y marketing. Crear combos estratégicos, promociones inteligentes y línea premium que maximicen valor promedio de pedido.</p>
            </div>
            {/* Profesionalizar Plataforma Digital */}
            <div style={cardStyle}>
                <h3 style={{...subTitleStyle, color: '#e0c9b6', fontSize: '1.4em'}}>Profesionalizar Plataforma Digital</h3>
                <p>Optimizar experiencia de usuario en página web con navegación intuitiva y proceso de compra simplificado. Integrar pasarela de pagos robusta con múltiples opciones. Conectar web con CRM básico para gestión inteligente de clientes, automatización y personalización de comunicaciones.</p>
            </div>
        </div>
      </section>

      {/* 5. Indicadores Clave de Desempeño (KPIs) */}
      <section>
        <h2 style={sectionTitleStyle}>Indicadores de Éxito y Plan de Acción</h2>
        <p style={{marginBottom: '30px'}}>
            Establecemos KPIs claros para medir nuestro progreso y un plan concreto de 90 días para iniciar la transformación de nuestra marca hacia un modelo de negocio más profesional, rentable y escalable.
        </p>

        <h3 style={subTitleStyle}>Indicadores Clave de Desempeño (KPIs)</h3>
        <div style={cardContainerStyle}>
            <div style={metricBoxStyle}>
                <div style={metricValueStyle}>+30%</div>
                <div style={metricLabelStyle}>Alcance Mensual</div>
                <div style={metricDescStyle}>Crecimiento en impresiones y alcance orgánico en redes sociales</div>
            </div>
            <div style={metricBoxStyle}>
                <div style={metricValueStyle}>+20%</div>
                <div style={metricLabelStyle}>Pedidos Trimestrales</div>
                <div style={metricDescStyle}>Incremento en número total de transacciones cada trimestre</div>
            </div>
            <div style={metricBoxStyle}>
                <div style={metricValueStyle}>25%</div>
                <div style={metricLabelStyle}>Tasa de Recompra</div>
                <div style={metricDescStyle}>Clientes que realizan segunda compra dentro de 6 meses</div>
            </div>
            <div style={metricBoxStyle}>
                <div style={metricValueStyle}>48-72h</div>
                <div style={metricLabelStyle}>Tiempo de Entrega</div>
                <div style={metricDescStyle}>Desde confirmación de pedido hasta entrega al cliente</div>
            </div>
            <div style={metricBoxStyle}>
                <div style={metricValueStyle}>&lt;3%</div>
                <div style={metricLabelStyle}>Devoluciones</div>
                <div style={metricDescStyle}>Porcentaje de pedidos devueltos por calidad o talla</div>
            </div>
            <div style={metricBoxStyle}>
                <div style={metricValueStyle}>≥30%</div>
                <div style={metricLabelStyle}>Margen por Prenda</div>
                <div style={metricDescStyle}>Margen de contribución después de costos directos</div>
            </div>
        </div>
      </section>

      {/* 6. Plan de Acción: Primeros 90 Días */}
      <section>
        <h3 style={subTitleStyle}>Plan de Acción: Primeros 90 Días</h3>
        <p style={{marginBottom: '20px'}}>
            La ejecución exitosa de este plan estratégico comienza con acciones concretas en el corto plazo. Estos ocho pasos críticos establecen las bases operativas y comerciales necesarias para el crecimiento sostenible:
        </p>
        <div style={cardContainerStyle}>
            <div style={cardStyle}>
                <h4 style={{...subTitleStyle, color: '#e0c9b6', fontSize: '1.4em'}}>01. Definir Proveedores Principales</h4>
                <p>Seleccionar 2-3 proveedores confiables con capacidad, calidad consistente y términos comerciales favorables que garanticen abastecimiento estable.</p>
            </div>
            <div style={cardStyle}>
                <h4 style={{...subTitleStyle, color: '#e0c9b6', fontSize: '1.4em'}}>02. Elegir Transportadora Oficial</h4>
                <p>Negociar tarifas preferenciales con transportadora que ofrezca cobertura nacional, tiempos competitivos y servicio al cliente confiable.</p>
            </div>
            <div style={cardStyle}>
                <h4 style={{...subTitleStyle, color: '#e0c9b6', fontSize: '1.4em'}}>03. Crear Primera Mini Colección</h4>
                <p>Diseñar y producir colección inicial de 6-10 referencias estratégicas que representen nuestra identidad y tengan potencial de rotación rápida.</p>
            </div>
            <div style={cardStyle}>
                <h4 style={{...subTitleStyle, color: '#e0c9b6', fontSize: '1.4em'}}>04. Optimizar Página Web</h4>
                <p>Mejorar velocidad, navegación y proceso de checkout. Integrar pasarela de pagos confiable y garantizar experiencia mobile impecable.</p>
            </div>
            <div style={cardStyle}>
                <h4 style={{...subTitleStyle, color: '#e0c9b6', fontSize: '1.4em'}}>05. Crear Calendario de Contenido</h4>
                <p>Planificar contenido mensual para redes sociales con mix de posts de producto, lifestyle, testimonios y contenido de valor para la audiencia.</p>
            </div>
            <div style={cardStyle}>
                <h4 style={{...subTitleStyle, color: '#e0c9b6', fontSize: '1.4em'}}>06. Implementar Mensajes Automáticos</h4>
                <p>Configurar secuencia de comunicación posventa: confirmación, envío, entrega, encuesta de satisfacción y seguimiento para recompra.</p>
            </div>
            <div style={cardStyle}>
                <h4 style={{...subTitleStyle, color: '#e0c9b6', fontSize: '1.4em'}}>07. Diseñar Empaques Distintivos</h4>
                <p>Crear experiencia de unboxing memorable con empaques branded, mensaje personalizado y detalles que refuercen identidad de marca.</p>
            </div>
            <div style={cardStyle}>
                <h4 style={{...subTitleStyle, color: '#e0c9b6', fontSize: '1.4em'}}>08. Calcular Estructura de Costos</h4>
                <p>Desglosar costos por prenda (materiales, producción, empaque, envío, marketing) y establecer margen objetivo mínimo del 30%.</p>
            </div>
        </div>
      </section>

      {/* 7. Estrategias Clave de Ejecución */}
      <section>
        <h2 style={sectionTitleStyle}>Estrategias Clave de Ejecución</h2>
        <p style={{marginBottom: '20px'}}>
            Definimos cuatro pilares estratégicos con tácticas específicas que nos permitirán alcanzar nuestros objetivos, abarcando marketing digital, fidelización de clientes, eficiencia operativa y sostenibilidad financiera para construir una marca sólida y rentable.
        </p>
        <div style={grid2ColsStyle}>
            {/* Marketing & Ventas */}
            <div style={cardStyle}>
                <h3 style={{...subTitleStyle, color: '#e0c9b6', fontSize: '1.4em'}}>Marketing & Ventas</h3>
                <ul style={{listStyleType: 'disc', paddingLeft: '20px', color: '#ffffff', opacity: '0.9'}}>
                    <li>Campañas en Instagram y TikTok con videos auténticos mostrando uso real de prendas</li>
                    <li>Programa de embajadores con microinfluencers (5K-50K seguidores) de nicho urbano</li>
                    <li>Sesiones fotográficas profesionales mensuales y reels diarios de alto impacto</li>
                    <li>Lanzamientos estratégicos por colecciones temáticas creando expectativa</li>
                </ul>
            </div>
            {/* Fidelización */}
            <div style={cardStyle}>
                <h3 style={{...subTitleStyle, color: '#e0c9b6', fontSize: '1.4em'}}>Fidelización</h3>
                <ul style={{listStyleType: 'disc', paddingLeft: '20px', color: '#ffffff', opacity: '0.9'}}>
                    <li>Seguimiento posventa automatizado: mensaje de agradecimiento + encuesta satisfacción</li>
                    <li>Tarjeta digital de puntos acumulables por compras y referencias</li>
                    <li>Club VIP con acceso anticipado, descuentos exclusivos y eventos especiales</li>
                    <li>Bonos personalizados de cumpleaños que fortalezcan conexión emocional</li>
                </ul>
            </div>
            {/* Operaciones */}
            <div style={cardStyle}>
                <h3 style={{...subTitleStyle, color: '#e0c9b6', fontSize: '1.4em'}}>Operaciones</h3>
                <ul style={{listStyleType: 'disc', paddingLeft: '20px', color: '#ffffff', opacity: '0.9'}}>
                    <li>Contratar servicio fotográfico profesional permanente o capacitar equipo interno</li>
                    <li>Crear manual detallado de empaques y envíos garantizando presentación consistente</li>
                    <li>Establecer alianzas estratégicas con 1-2 transportadoras con tarifas preferenciales</li>
                    <li>Implementar sistema de control de calidad previo al envío</li>
                </ul>
            </div>
            {/* Finanzas */}
            <div style={cardStyle}>
                <h3 style={{...subTitleStyle, color: '#e0c9b6', fontSize: '1.4em'}}>Finanzas</h3>
                <ul style={{listStyleType: 'disc', paddingLeft: '20px', color: '#ffffff', opacity: '0.9'}}>
                    <li>Calcular costo unitario exacto por prenda incluyendo todos los componentes</li>
                    <li>Revisar y optimizar gastos digitales: publicidad, web, herramientas y logística</li>
                    <li>Establecer metas mensuales de ventas realistas con seguimiento semanal</li>
                    <li>Crear proyecciones trimestrales con escenarios conservador, base y optimista</li>
                </ul>
            </div>
        </div>

        {/* Integración y Sinergia */}
        <h3 style={subTitleStyle}>Integración y Sinergia</h3>
        <p style={textBlockStyle}>
            Estas estrategias no funcionan de manera aislada. El éxito depende de la integración inteligente: las campañas de marketing alimentan el programa de fidelización, la eficiencia operativa permite márgenes saludables que financian mejor marketing, y la excelencia en cada punto de contacto convierte clientes en embajadores orgánicos de la marca. La clave está en la ejecución coordinada y el aprendizaje continuo basado en datos reales del negocio.
        </p>
      </section>

      <footer style={{textAlign: 'center', fontSize: '0.9em', color: '#6e5d59', marginTop: '50px'}}>
        <p>
            "El éxito no es el resultado de acciones esporádicas, sino de la ejecución disciplinada y consistente de un plan estratégico bien pensado. Estos primeros 90 días marcan el inicio de la transformación de nuestra marca hacia un modelo de negocio profesional, sostenible y escalable que honre la calidad de nuestros productos y la confianza de nuestros clientes."
        </p>
      </footer>
    </div>
  );
};

export default PlanEstrategico;