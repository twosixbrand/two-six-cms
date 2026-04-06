import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

interface MermaidChartProps {
    chart: string;
    id: string; // Unique ID required for rendering
}

const MermaidChart: React.FC<MermaidChartProps> = ({ chart, id }) => {
    const mermaidRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Inicializar la configuración de Mermaid
        mermaid.initialize({
            startOnLoad: false,
            theme: 'dark', // Native CMS dark theme aesthetic
            securityLevel: 'loose',
            fontFamily: 'Inter, sans-serif'
        });

        // Limpiar el contenido previo
        if (mermaidRef.current) {
            mermaidRef.current.innerHTML = '';
            
            // Función asíncrona interna para ejecutar el parseo
            const renderDiagram = async () => {
                try {
                    const { svg } = await mermaid.render(`mermaid-svg-${id}`, chart);
                    if (mermaidRef.current) {
                        mermaidRef.current.innerHTML = svg;
                    }
                } catch (error) {
                    console.error("Error renderizando Mermaid Chart", error);
                }
            };
            
            renderDiagram();
        }
    }, [chart, id]);

    return <div ref={mermaidRef} className="mermaid flex justify-center py-4 overflow-x-auto w-full custom-scrollbar" />;
};

export default MermaidChart;
