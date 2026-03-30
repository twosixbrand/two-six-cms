import React, { ReactNode } from 'react';

interface PageHeaderProps {
    title: string;
    icon: ReactNode;
    children?: ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, icon, children }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                        background: 'rgba(240, 180, 41, 0.1)',
                        color: '#f0b429',
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.25rem',
                        boxShadow: '0 0 12px rgba(240, 180, 41, 0.08)',
                    }}>
                        {icon}
                    </div>
                    <h1 style={{ margin: 0, border: 'none', padding: 0, fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.3px', color: '#f1f1f3' }}>
                        {title}
                    </h1>
                </div>

                {children && (
                    <div style={{ width: '100%', maxWidth: '360px' }}>
                        {children}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PageHeader;
