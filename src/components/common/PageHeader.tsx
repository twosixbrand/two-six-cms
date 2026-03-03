import React, { ReactNode } from 'react';

interface PageHeaderProps {
    title: string;
    icon: ReactNode;
    children?: ReactNode; // For optional search bars or other elements on the right
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, icon, children }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(212,175,55,0.2) 0%, rgba(212,175,55,0.05) 100%)',
                        border: '1px solid rgba(212,175,55,0.3)',
                        color: 'var(--primary-color)',
                        width: '48px',
                        height: '48px',
                        borderRadius: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                        boxShadow: '0 4px 15px rgba(212,175,55,0.1)'
                    }}>
                        {icon}
                    </div>
                    <h1 style={{ margin: 0, border: 'none', padding: 0, fontSize: '2rem', letterSpacing: '-0.5px' }}>
                        {title}
                    </h1>
                </div>

                {children && (
                    <div style={{ width: '100%', maxWidth: '400px', marginTop: '0.5rem' }}>
                        {children}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PageHeader;
