import React, { useState, useEffect } from 'react';
import { FiSettings, FiSave } from 'react-icons/fi';
import Swal from 'sweetalert2';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import * as accountingApi from '../../services/accountingApi';
import { logError } from '../../services/errorApi';

interface Setting {
  id: number;
  key: string;
  value: string;
  description?: string | null;
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px',
  borderRadius: '6px',
  border: '1px solid #2a2a35',
  fontSize: '14px',
  backgroundColor: '#1a1a24',
  color: '#f1f1f3',
  outline: 'none',
};

const AccountingSettingsPage = () => {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetch = async () => {
    try {
      setLoading(true);
      const data = await accountingApi.getAccountingSettings();
      setSettings(data);
      const map: Record<string, string> = {};
      for (const s of data) map[s.key] = s.value;
      setValues(map);
    } catch (err: any) {
      logError(err, '/accounting/settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      const updates = Object.entries(values).map(([key, value]) => ({ key, value }));
      await accountingApi.bulkUpdateAccountingSettings(updates);
      await Swal.fire({
        title: 'Guardado',
        text: 'Configuración contable actualizada correctamente.',
        icon: 'success',
        confirmButtonColor: '#f0b429',
      });
      fetch();
    } catch (err: any) {
      await Swal.fire({
        title: 'Error',
        text: err.message || 'No se pudo guardar',
        icon: 'error',
        confirmButtonColor: '#f0b429',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner text="Cargando configuración..." />;

  const renderField = (key: string, label: string, options?: { type?: string; choices?: string[]; help?: string }) => {
    const value = values[key] ?? '';
    return (
      <div style={{ marginBottom: '1.25rem' }}>
        <label style={{ display: 'block', fontSize: '0.85rem', color: '#f0b429', fontWeight: 600, marginBottom: '0.35rem' }}>
          {label}
        </label>
        {options?.choices ? (
          <select
            value={value}
            onChange={(e) => setValues({ ...values, [key]: e.target.value })}
            style={inputStyle}
          >
            {options.choices.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={options?.type || 'text'}
            value={value}
            onChange={(e) => setValues({ ...values, [key]: e.target.value })}
            style={inputStyle}
          />
        )}
        {options?.help && (
          <p style={{ fontSize: '0.75rem', color: '#a0a0b0', marginTop: '0.35rem' }}>{options.help}</p>
        )}
      </div>
    );
  };

  return (
    <div className="page-container">
      <PageHeader title="Configuración Contable" icon={<FiSettings />} />
      <p style={{ marginTop: '-0.75rem', marginBottom: '1.5rem', color: '#a0aec0', fontSize: '0.9rem' }}>
        Parámetros globales que afectan el cálculo de impuestos, cierre contable y generación de reportes
      </p>

      <div
        style={{
          padding: '1.5rem',
          background: '#1a1a24',
          border: '1px solid #2a2a35',
          borderRadius: '8px',
          maxWidth: '600px',
        }}
      >
        {renderField('TAX_REGIME', 'Régimen Tributario', {
          choices: ['COMUN', 'SIMPLE'],
          help: 'COMUN aplica IVA 19% y retenciones. SIMPLE sustituye por declaración unificada bimestral (Ley 2010/2019).',
        })}
        {renderField('IVA_RATE', 'Tasa de IVA (decimal)', {
          type: 'number',
          help: 'Ejemplo: 0.19 para 19%. Solo aplica en régimen común.',
        })}
        {renderField('COMPANY_NIT', 'NIT del empleador', {
          help: 'Usado para generar archivo PILA y facturas DIAN.',
        })}
        {renderField('COMPANY_NAME', 'Razón social', {
          help: 'Aparece en el encabezado del archivo PILA y reportes.',
        })}
        {renderField('ACCOUNTING_AUTOCRON_ENABLED', 'Autocron contable', {
          choices: ['true', 'false'],
          help: 'Habilita los schedulers automáticos de depreciación (día 1) y cierre de período (día 5).',
        })}

        <div style={{ marginTop: '1.5rem' }}>
          <Button variant="primary" icon={<FiSave />} onClick={handleSave} loading={saving}>
            Guardar configuración
          </Button>
        </div>
      </div>

      {/* Tabla completa con todas las claves */}
      <div style={{ marginTop: '2rem', padding: '1rem', background: '#1a1a24', border: '1px solid #2a2a35', borderRadius: '8px' }}>
        <h3 style={{ marginTop: 0, color: '#f0b429' }}>Todas las claves</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #2a2a35' }}>
              <th style={{ padding: '0.5rem', textAlign: 'left', color: '#a0a0b0' }}>Clave</th>
              <th style={{ padding: '0.5rem', textAlign: 'left', color: '#a0a0b0' }}>Valor</th>
              <th style={{ padding: '0.5rem', textAlign: 'left', color: '#a0a0b0' }}>Descripción</th>
            </tr>
          </thead>
          <tbody>
            {settings.map((s) => (
              <tr key={s.id} style={{ borderBottom: '1px solid #2a2a35' }}>
                <td style={{ padding: '0.5rem', color: '#f1f1f3', fontFamily: 'monospace' }}>{s.key}</td>
                <td style={{ padding: '0.5rem', color: '#f1f1f3' }}>{s.value}</td>
                <td style={{ padding: '0.5rem', color: '#a0a0b0' }}>{s.description || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AccountingSettingsPage;
