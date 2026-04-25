import React, { useState, useEffect } from 'react';
import { FiUsers, FiCalendar, FiFileText, FiPlus, FiEdit2, FiPlay, FiCheckCircle, FiRefreshCcw, FiDownload, FiBriefcase, FiShield, FiInfo } from 'react-icons/fi';
import Swal from 'sweetalert2';
import PageHeader from '../../components/common/PageHeader';
import { DataTable, Button, StatusBadge, LoadingSpinner, Modal } from '../../components/ui';
import * as accountingApi from '../../services/accountingApi';
import { logError } from '../../services/errorApi';
import { formatDate } from '../../utils/dateFormat';


const periodTypeLabels: Record<string, string> = {
    QUINCENAL_1: 'Quincenal 1ra',
    QUINCENAL_2: 'Quincenal 2da',
    MENSUAL: 'Mensual',
};

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);

// ── Employee Form Modal ─────────────────────────────────────

const EmployeeFormModal = ({
    show,
    onClose,
    onSave,
    initial,
}: {
    show: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
    initial?: any;
}) => {
    const [form, setForm] = useState({
        document_number: '',
        id_identification_type: 1,
        name: '',
        position: '',
        department: '',
        hire_date: '',
        base_salary: 0,
        transport_allowance: 0,
        eps_entity: '',
        pension_fund: '',
        arl_risk_level: 1,
        is_exonerated: true,
        contract_type: 'INDEFINIDO',
        bank_name: '',
        bank_account: '',
        is_active: true,
    });

    useEffect(() => {
        if (initial) {
            setForm({
                document_number: initial.document_number || '',
                id_identification_type: initial.id_identification_type || 1,
                name: initial.name || '',
                position: initial.position || '',
                department: initial.department || '',
                hire_date: initial.hire_date ? initial.hire_date.substring(0, 10) : '',
                base_salary: initial.base_salary || 0,
                transport_allowance: initial.transport_allowance || 0,
                eps_entity: initial.eps_entity || '',
                pension_fund: initial.pension_fund || '',
                arl_risk_level: initial.arl_risk_level || 1,
                is_exonerated: initial.is_exonerated ?? true,
                contract_type: initial.contract_type || 'INDEFINIDO',
                bank_name: initial.bank_name || '',
                bank_account: initial.bank_account || '',
                is_active: initial.is_active !== undefined ? initial.is_active : true,
            });
        } else {
            setForm({
                document_number: '',
                id_identification_type: 1,
                name: '',
                position: '',
                department: '',
                hire_date: '',
                base_salary: 0,
                transport_allowance: 0,
                eps_entity: '',
                pension_fund: '',
                arl_risk_level: 1,
                is_exonerated: true,
                contract_type: 'INDEFINIDO',
                bank_name: '',
                bank_account: '',
                is_active: true,
            });
        }
    }, [initial, show]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...form,
            base_salary: Number(form.base_salary),
            transport_allowance: Number(form.transport_allowance),
            id_identification_type: Number(form.id_identification_type),
            arl_risk_level: Number(form.arl_risk_level),
        });
    };

    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '8px 12px',
        border: '1px solid #2a2a35',
        borderRadius: '6px',
        fontSize: '14px',
        background: '#1a1a24',
        color: '#f1f1f3'
    };

    return (
        <Modal
            isOpen={show}
            onClose={onClose}
            title={initial ? 'Ficha del Empleado' : 'Contratar Nuevo Empleado'}
            size="lg"
            footer={
                <>
                    <Button variant="ghost" onClick={onClose}>Cancelar</Button>
                    <Button variant="primary" onClick={handleSubmit}>{initial ? 'Actualizar Ficha' : 'Registrar Contratación'}</Button>
                </>
            }
        >
            <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    
                    <div style={{ gridColumn: '1 / -1', padding: '10px', background: 'rgba(56, 189, 248, 0.05)', borderRadius: '8px', borderLeft: '4px solid #38bdf8', marginBottom: '8px' }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#38bdf8', marginBottom: '2px' }}>
                            <FiInfo style={{ verticalAlign: 'middle', marginRight: '6px' }} /> Información Básica
                        </div>
                    </div>

                    <div>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#a0a0b0' }}>Número de Documento *</label>
                        <input style={inputStyle} required value={form.document_number}
                            onChange={(e) => setForm({ ...form, document_number: e.target.value })} />
                    </div>
                    <div>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#a0a0b0' }}>Tipo de Identificación</label>
                        <select style={inputStyle} value={form.id_identification_type}
                            onChange={(e) => setForm({ ...form, id_identification_type: Number(e.target.value) })}>
                            <option value={1}>Cédula de Ciudadanía</option>
                            <option value={2}>Cédula de Extranjería</option>
                            <option value={3}>NIT (Para independientes)</option>
                            <option value={4}>Pasaporte</option>
                        </select>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#a0a0b0' }}>Nombre Completo del Trabajador *</label>
                        <input style={inputStyle} required value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })} />
                    </div>

                    <div style={{ gridColumn: '1 / -1', padding: '10px', background: 'rgba(56, 189, 248, 0.05)', borderRadius: '8px', borderLeft: '4px solid #38bdf8', marginTop: '8px', marginBottom: '8px' }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#38bdf8', marginBottom: '2px' }}>
                            <FiBriefcase style={{ verticalAlign: 'middle', marginRight: '6px' }} /> Condiciones Laborales
                        </div>
                    </div>

                    <div>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#a0a0b0' }}>Cargo / Función *</label>
                        <input style={inputStyle} required value={form.position}
                            onChange={(e) => setForm({ ...form, position: e.target.value })} />
                    </div>
                    <div>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#a0a0b0' }}>Tipo de Contrato</label>
                        <select style={inputStyle} value={form.contract_type}
                            onChange={(e) => setForm({ ...form, contract_type: e.target.value })}>
                            <option value="INDEFINIDO">Término Indefinido</option>
                            <option value="FIJO">Término Fijo</option>
                            <option value="OBRA_LABOR">Obra o Labor</option>
                            <option value="APRENDIZAJE">Aprendizaje</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#a0a0b0' }}>Fecha de Ingreso *</label>
                        <input style={inputStyle} type="text" required value={form.hire_date} placeholder="YYYY-MM-DD" maxLength={10}
                            onChange={(e) => setForm({ ...form, hire_date: e.target.value })} />
                    </div>
                    <div>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#a0a0b0' }}>Salario Base Mensual *</label>
                        <input style={inputStyle} type="number" required value={form.base_salary}
                            onChange={(e) => setForm({ ...form, base_salary: Number(e.target.value) })} />
                    </div>
                    <div>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#a0a0b0' }}>Auxilio de Transporte (Si aplica)</label>
                        <input style={inputStyle} type="number" value={form.transport_allowance}
                            onChange={(e) => setForm({ ...form, transport_allowance: Number(e.target.value) })} />
                    </div>
                    <div>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#a0a0b0' }}>Nivel de Riesgo ARL</label>
                        <select style={inputStyle} value={form.arl_risk_level}
                            onChange={(e) => setForm({ ...form, arl_risk_level: Number(e.target.value) })}>
                            <option value={1}>Clase I (Oficina) - 0.522%</option>
                            <option value={2}>Clase II (Ventas) - 1.044%</option>
                            <option value={3}>Clase III (Producción) - 2.436%</option>
                            <option value={4}>Clase IV (Transporte) - 4.350%</option>
                            <option value={5}>Clase V (Alto Riesgo) - 6.960%</option>
                        </select>
                    </div>

                    <div style={{ gridColumn: '1 / -1', padding: '10px', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '8px', borderLeft: '4px solid #10b981', marginTop: '8px', marginBottom: '8px' }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#10b981', marginBottom: '2px' }}>
                            <FiShield style={{ verticalAlign: 'middle', marginRight: '6px' }} /> Seguridad Social y Parafiscales
                        </div>
                    </div>

                    <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', padding: '8px', background: '#13131a', borderRadius: '6px' }}>
                        <input type="checkbox" checked={form.is_exonerated}
                            onChange={(e) => setForm({ ...form, is_exonerated: e.target.checked })} />
                        <div>
                            <label style={{ fontSize: '13px', fontWeight: 600, color: '#f1f1f3', display: 'block' }}>Exonerado de Aportes (Ley 1607)</label>
                            <small style={{ color: '#6b6b7b' }}>Si se marca, la empresa no paga Salud (8.5%), SENA (2%) e ICBF (3%) para este empleado.</small>
                        </div>
                    </div>

                    <div>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#a0a0b0' }}>Entidad EPS</label>
                        <input style={inputStyle} placeholder="Sura, Sanitas, etc." value={form.eps_entity}
                            onChange={(e) => setForm({ ...form, eps_entity: e.target.value })} />
                    </div>
                    <div>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#a0a0b0' }}>Fondo de Pensiones</label>
                        <input style={inputStyle} placeholder="Protección, Porvenir, etc." value={form.pension_fund}
                            onChange={(e) => setForm({ ...form, pension_fund: e.target.value })} />
                    </div>
                    <div>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#a0a0b0' }}>Banco para Pago</label>
                        <input style={inputStyle} value={form.bank_name}
                            onChange={(e) => setForm({ ...form, bank_name: e.target.value })} />
                    </div>
                    <div>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#a0a0b0' }}>Número de Cuenta</label>
                        <input style={inputStyle} value={form.bank_account}
                            onChange={(e) => setForm({ ...form, bank_account: e.target.value })} />
                    </div>
                </div>
            </form>
        </Modal>
    );
};

// ── Period Form Modal ───────────────────────────────────────

const PeriodFormModal = ({
    show,
    onClose,
    onSave,
}: {
    show: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
}) => {
    const now = new Date();
    const [form, setForm] = useState({
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        period_type: 'MENSUAL',
        start_date: '',
        end_date: '',
    });

    useEffect(() => {
        if (show) {
            const y = now.getFullYear();
            const m = now.getMonth() + 1;
            const lastDay = new Date(y, m, 0).getDate();
            setForm({
                year: y,
                month: m,
                period_type: 'MENSUAL',
                start_date: `${y}-${String(m).padStart(2, '0')}-01`,
                end_date: `${y}-${String(m).padStart(2, '0')}-${lastDay}`,
            });
        }
    }, [show]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...form,
            year: Number(form.year),
            month: Number(form.month),
        });
    };

    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '8px 12px',
        border: '1px solid #2a2a35',
        borderRadius: '6px',
        fontSize: '14px',
        background: '#1a1a24',
        color: '#f1f1f3'
    };

    return (
        <Modal
            isOpen={show}
            onClose={onClose}
            title="Nuevo Periodo de Nómina"
            size="sm"
            footer={
                <>
                    <Button variant="ghost" onClick={onClose}>Cancelar</Button>
                    <Button variant="primary" onClick={handleSubmit}>Abrir Período</Button>
                </>
            }
        >
            <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#a0a0b0' }}>Año</label>
                        <input style={inputStyle} type="number" value={form.year}
                            onChange={(e) => setForm({ ...form, year: Number(e.target.value) })} />
                    </div>
                    <div>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#a0a0b0' }}>Mes</label>
                        <input style={inputStyle} type="number" min={1} max={12} value={form.month}
                            onChange={(e) => setForm({ ...form, month: Number(e.target.value) })} />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#a0a0b0' }}>Tipo de Liquidación</label>
                        <select style={inputStyle} value={form.period_type}
                            onChange={(e) => setForm({ ...form, period_type: e.target.value })}>
                            <option value="MENSUAL">Mensual (30 días)</option>
                            <option value="QUINCENAL_1">Quincenal 1ra (1-15)</option>
                            <option value="QUINCENAL_2">Quincenal 2da (16-30)</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#a0a0b0' }}>Fecha Inicio</label>
                        <input style={inputStyle} type="text" value={form.start_date} placeholder="YYYY-MM-DD" maxLength={10}
                            onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
                    </div>
                    <div>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#a0a0b0' }}>Fecha Fin</label>
                        <input style={inputStyle} type="text" value={form.end_date} placeholder="YYYY-MM-DD" maxLength={10}
                            onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
                    </div>
                </div>
            </form>
        </Modal>
    );
};

// ── Main PayrollPage ────────────────────────────────────────

const PayrollPage = () => {
    const [activeTab, setActiveTab] = useState<'employees' | 'periods' | 'detail'>('employees');
    const [employees, setEmployees] = useState<any[]>([]);
    const [periods, setPeriods] = useState<any[]>([]);
    const [selectedPeriod, setSelectedPeriod] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [showEmployeeModal, setShowEmployeeModal] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<any>(null);
    const [showPeriodModal, setShowPeriodModal] = useState(false);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const data = await accountingApi.getEmployees();
            setEmployees(Array.isArray(data) ? data : []);
        } catch (err) {
            logError(err, '/accounting/payroll');
            setError('Error al cargar empleados.');
        } finally {
            setLoading(false);
        }
    };

    const fetchPeriods = async () => {
        try {
            setLoading(true);
            const data = await accountingApi.getPayrollPeriods();
            setPeriods(Array.isArray(data) ? data : []);
        } catch (err) {
            logError(err, '/accounting/payroll');
            setError('Error al cargar periodos.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
        fetchPeriods();
    }, []);

    useEffect(() => {
        if (success) {
            const t = setTimeout(() => setSuccess(''), 4000);
            return () => clearTimeout(t);
        }
    }, [success]);

    const handleSaveEmployee = async (data: any) => {
        try {
            if (editingEmployee) {
                await accountingApi.updateEmployee(editingEmployee.id, data);
                setSuccess('Ficha del empleado actualizada exitosamente.');
            } else {
                await accountingApi.createEmployee(data);
                setSuccess('Empleado registrado exitosamente.');
            }
            setShowEmployeeModal(false);
            setEditingEmployee(null);
            fetchEmployees();
        } catch (err: any) {
            setError(err.message || 'Error al guardar empleado.');
        }
    };

    const handleSavePeriod = async (data: any) => {
        try {
            await accountingApi.createPayrollPeriod(data);
            setSuccess('Período de nómina abierto correctamente.');
            setShowPeriodModal(false);
            fetchPeriods();
        } catch (err: any) {
            setError(err.message || 'Error al crear periodo.');
        }
    };

    const handleCalculate = async (periodId: number) => {
        const swalResult = await Swal.fire({
            title: '¿Calcular Nómina?',
            text: 'El sistema liquidará automáticamente salud, pensión, provisiones y aportes de ley para todos los empleados activos.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#38bdf8',
            cancelButtonColor: '#2a2a35',
            confirmButtonText: 'Sí, liquidar ahora',
            cancelButtonText: 'Cancelar',
        });
        if (!swalResult.isConfirmed) return;
        try {
            setLoading(true);
            setError('');
            const result = await accountingApi.calculatePayroll(periodId);
            setSuccess(`Nómina liquidada exitosamente.`);
            fetchPeriods();
        } catch (err: any) {
            setError(err.message || 'Error al calcular nómina.');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (periodId: number) => {
        const swalResult = await Swal.fire({
            title: '¿Aprobar y Contabilizar?',
            text: 'Esta acción generará automáticamente los asientos contables de gasto y provisiones en el Libro Diario. No se podrá editar después.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#2a2a35',
            confirmButtonText: 'Sí, aprobar y contabilizar',
            cancelButtonText: 'Cancelar',
        });
        if (!swalResult.isConfirmed) return;
        try {
            setLoading(true);
            setError('');
            await accountingApi.approvePayroll(periodId);
            setSuccess('Nómina aprobada y asientos contables generados.');
            fetchPeriods();
        } catch (err: any) {
            setError(err.message || 'Error al aprobar nómina.');
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetail = async (periodId: number) => {
        try {
            setLoading(true);
            const data = await accountingApi.getPayrollDetail(periodId);
            setSelectedPeriod(data);
            setActiveTab('detail');
        } catch (err: any) {
            setError(err.message || 'Error al cargar detalle.');
        } finally {
            setLoading(false);
        }
    };

    const tabStyle = (active: boolean): React.CSSProperties => ({
        padding: '12px 24px',
        border: 'none',
        borderBottom: active ? '3px solid #38bdf8' : '3px solid transparent',
        background: 'transparent',
        color: active ? '#38bdf8' : '#6b6b7b',
        fontWeight: active ? 600 : 400,
        fontSize: '14px',
        cursor: 'pointer',
    });

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'APPROVED': return 'success';
            case 'CALCULATED': return 'info';
            case 'DRAFT': return 'warning';
            default: return 'neutral';
        }
    };

    // Employee columns
    const employeeColumns = [
        { key: 'document_number', header: 'Documento' },
        { key: 'name', header: 'Nombre', render: (val: any) => <strong>{val}</strong> },
        { key: 'position', header: 'Cargo' },
        { key: 'contract_type', header: 'Contrato', render: (val: any) => <span style={{ fontSize: '11px' }}>{val}</span> },
        { key: 'base_salary', header: 'Salario Base', render: (val: any) => formatCurrency(val) },
        { 
            key: 'is_exonerated', 
            header: 'Ley 1607', 
            render: (val: any) => val ? <StatusBadge status="Exonerado" variant="success" size="sm" /> : <StatusBadge status="No Exonerado" variant="warning" size="sm" /> 
        },
        {
            key: 'is_active',
            header: 'Estado',
            render: (val: any) => (
                <StatusBadge
                    status={val ? 'Activo' : 'Retirado'}
                    variant={val ? 'success' : 'error'}
                    size="sm"
                />
            ),
        },
    ];

    // Period columns
    const periodColumns = [
        { key: 'id', header: 'ID' },
        { key: 'year', header: 'Año' },
        { key: 'month', header: 'Mes' },
        { key: 'period_type', header: 'Tipo', render: (val: any) => periodTypeLabels[val] || val },
        { key: 'start_date', header: 'Inicio', render: (val: any) => formatDate(val) },
        { key: 'end_date', header: 'Fin', render: (val: any) => formatDate(val) },
        { key: '_count', header: 'Empleados', render: (_val: any, row: any) => row._count?.entries || 0 },
        {
            key: 'status',
            header: 'Estado',
            render: (val: any) => <StatusBadge status={val} variant={getStatusVariant(val)} size="sm" />,
        },
    ];

    // Detail columns
    const detailColumns = [
        { key: 'employee', header: 'Empleado', render: (_val: any, row: any) => <strong>{row.employee?.name || `Emp #${row.id_employee}`}</strong> },
        { key: 'base_salary', header: 'Sueldo', render: (val: any) => formatCurrency(val) },
        { key: 'transport_allowance', header: 'Aux. Trans.', render: (val: any) => formatCurrency(val) },
        { key: 'gross_salary', header: 'Devengado', render: (val: any) => <strong>{formatCurrency(val)}</strong> },
        { key: 'health_employee', header: 'Salud (4%)', render: (val: any) => <span style={{ color: '#f87171' }}>-{formatCurrency(val)}</span> },
        { key: 'pension_employee', header: 'Pensión (4%)', render: (val: any) => <span style={{ color: '#f87171' }}>-{formatCurrency(val)}</span> },
        { key: 'net_salary', header: 'Neto a Pagar', render: (val: any) => <strong style={{ color: '#10b981' }}>{formatCurrency(val)}</strong> },
        {
            key: 'health_employer',
            header: 'Seg. Social Emp.',
            render: (_val: any, row: any) => formatCurrency(row.health_employer + row.pension_employer + row.arl_employer),
        },
        {
            key: 'sena_employer',
            header: 'Parafiscales',
            render: (_val: any, row: any) => formatCurrency(row.sena_employer + row.icbf_employer + row.caja_employer),
        },
        {
            key: 'prima_provision',
            header: 'Provisiones',
            render: (_val: any, row: any) => formatCurrency(row.prima_provision + row.cesantias_provision + row.int_cesantias_provision + row.vacaciones_provision),
        },
        { key: 'total_employer_cost', header: 'Costo Empresa', render: (val: any) => <strong style={{ color: '#f87171' }}>{formatCurrency(val)}</strong> },
    ];

    // Summary totals...
    const detailTotals = selectedPeriod?.entries?.reduce(
        (acc: any, e: any) => {
            acc.gross_salary += e.gross_salary;
            acc.health_employee += e.health_employee;
            acc.pension_employee += e.pension_employee;
            acc.health_employer += e.health_employer;
            acc.pension_employer += e.pension_employer;
            acc.arl_employer += e.arl_employer;
            acc.sena_employer += e.sena_employer;
            acc.icbf_employer += e.icbf_employer;
            acc.caja_employer += e.caja_employer;
            acc.prima_provision += e.prima_provision;
            acc.cesantias_provision += e.cesantias_provision;
            acc.int_cesantias_provision += e.int_cesantias_provision;
            acc.vacaciones_provision += e.vacaciones_provision;
            acc.net_salary += e.net_salary;
            acc.total_employer_cost += e.total_employer_cost;
            return acc;
        },
        {
            gross_salary: 0, health_employee: 0, pension_employee: 0,
            health_employer: 0, pension_employer: 0, arl_employer: 0,
            sena_employer: 0, icbf_employer: 0, caja_employer: 0,
            prima_provision: 0, cesantias_provision: 0, int_cesantias_provision: 0,
            vacaciones_provision: 0, net_salary: 0, total_employer_cost: 0,
        },
    ) || {};

    return (
        <div className="page-container">
            <PageHeader title="Gestión de Nómina Colombiana" icon={<FiBriefcase />} />

            {error && (
                <div style={{ background: 'rgba(248, 113, 113, 0.1)', color: '#f87171', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', border: '1px solid rgba(248, 113, 113, 0.2)' }}>
                    {error}
                    <button onClick={() => setError('')} style={{ float: 'right', border: 'none', background: 'none', color: '#f87171', cursor: 'pointer', fontWeight: 700 }}>X</button>
                </div>
            )}
            {success && (
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    {success}
                </div>
            )}

            {/* Tabs */}
            <div style={{ borderBottom: '1px solid #2a2a35', marginBottom: '24px', display: 'flex', gap: '4px' }}>
                <button style={tabStyle(activeTab === 'employees')} onClick={() => setActiveTab('employees')}>
                    <FiUsers style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Trabajadores
                </button>
                <button style={tabStyle(activeTab === 'periods')} onClick={() => setActiveTab('periods')}>
                    <FiCalendar style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Liquidaciones
                </button>
                <button style={tabStyle(activeTab === 'detail')} onClick={() => setActiveTab('detail')}>
                    <FiFileText style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Resumen Detallado
                </button>
            </div>

            {/* TAB: Employees */}
            {activeTab === 'employees' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#f1f1f3' }}>Maestro de Trabajadores</h3>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <Button variant="ghost" size="sm" icon={<FiRefreshCcw />} onClick={fetchEmployees}>
                                Actualizar
                            </Button>
                            <Button variant="primary" icon={<FiPlus />} onClick={() => { setEditingEmployee(null); setShowEmployeeModal(true); }}>
                                Registrar Trabajador
                            </Button>
                        </div>
                    </div>

                    <DataTable
                        columns={employeeColumns}
                        data={employees}
                        loading={loading && !employees.length}
                        emptyMessage="No hay trabajadores registrados en la base de datos."
                        actions={(emp: any) => (
                            <Button
                                variant="ghost"
                                size="sm"
                                icon={<FiEdit2 />}
                                onClick={() => { setEditingEmployee(emp); setShowEmployeeModal(true); }}
                            >
                                {''}
                            </Button>
                        )}
                    />
                </div>
            )}

            {/* TAB: Periods */}
            {activeTab === 'periods' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#f1f1f3' }}>Historial de Períodos</h3>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <Button variant="ghost" size="sm" icon={<FiRefreshCcw />} onClick={fetchPeriods}>
                                Actualizar
                            </Button>
                            <Button variant="primary" icon={<FiPlus />} onClick={() => setShowPeriodModal(true)}>
                                Abrir Nuevo Período
                            </Button>
                        </div>
                    </div>

                    <DataTable
                        columns={periodColumns}
                        data={periods}
                        loading={loading && !periods.length}
                        emptyMessage="No se han abierto períodos de nómina."
                        actions={(p: any) => (
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <Button variant="ghost" size="sm" icon={<FiFileText />} onClick={() => handleViewDetail(p.id)}>
                                    Ver Detalle
                                </Button>
                                {(p.status === 'DRAFT' || p.status === 'CALCULATED') && (
                                    <Button variant="primary" size="sm" icon={<FiPlay />} onClick={() => handleCalculate(p.id)} disabled={loading}>
                                        Liquidar
                                    </Button>
                                )}
                                {p.status === 'CALCULATED' && (
                                    <Button variant="success" size="sm" icon={<FiCheckCircle />} onClick={() => handleApprove(p.id)} disabled={loading}>
                                        Aprobar
                                    </Button>
                                )}
                            </div>
                        )}
                    />
                </div>
            )}

            {/* TAB: Period Detail */}
            {activeTab === 'detail' && (
                <div>
                    {!selectedPeriod ? (
                        <div style={{ textAlign: 'center', padding: '80px', color: '#6b6b7b', background: '#13131a', borderRadius: '12px', border: '1px dashed #2a2a35' }}>
                            <FiFileText size={48} style={{ marginBottom: '16px', opacity: 0.2 }} />
                            <p>Seleccione una liquidación en la pestaña "Liquidaciones" para visualizar el resumen contable.</p>
                        </div>
                    ) : (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#f1f1f3' }}>
                                        Liquidación: {selectedPeriod.year}-{String(selectedPeriod.month).padStart(2, '0')} ({periodTypeLabels[selectedPeriod.period_type] || selectedPeriod.period_type})
                                    </h3>
                                    <div style={{ marginTop: '4px' }}>
                                        <StatusBadge status={selectedPeriod.status} variant={getStatusVariant(selectedPeriod.status)} size="sm" />
                                        <span style={{ marginLeft: '10px', fontSize: '12px', color: '#6b6b7b' }}>{selectedPeriod.entries?.length || 0} trabajadores procesados</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <Button variant="ghost" size="sm" icon={<FiRefreshCcw />} onClick={() => handleViewDetail(selectedPeriod.id)}>
                                        Recargar
                                    </Button>
                                    <Button variant="primary" icon={<FiDownload />} onClick={() => accountingApi.exportToExcel('payroll', { periodId: String(selectedPeriod.id) })}>
                                        Descargar Soporte Excel
                                    </Button>
                                </div>
                            </div>

                            {/* Summary Cards */}
                            {selectedPeriod.entries?.length > 0 && (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                                    {[
                                        { label: 'Total Devengado', value: detailTotals.gross_salary, color: '#38bdf8' },
                                        { label: 'Total Neto a Pagar', value: detailTotals.net_salary, color: '#10b981' },
                                        { label: 'Carga Prestacional (Provisiones)', value: detailTotals.prima_provision + detailTotals.cesantias_provision + detailTotals.int_cesantias_provision + detailTotals.vacaciones_provision, color: '#fb923c' },
                                        { label: 'Costo Total Empresa', value: detailTotals.total_employer_cost, color: '#f87171' },
                                    ].map((card, i) => (
                                        <div key={i} style={{
                                            background: '#1f1f2a', borderRadius: '12px', padding: '20px',
                                            border: '1px solid #2a2a35', borderTop: `4px solid ${card.color}`,
                                        }}>
                                            <div style={{ fontSize: '11px', color: '#a0a0b0', fontWeight: 700, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{card.label}</div>
                                            <div style={{ fontSize: '20px', fontWeight: 800, color: '#f1f1f3' }}>{formatCurrency(card.value)}</div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Entries Table */}
                            <DataTable
                                columns={detailColumns}
                                data={selectedPeriod.entries || []}
                                emptyMessage="No se han encontrado cálculos para este período."
                            />
                        </>
                    )}
                </div>
            )}

            {/* Modals */}
            <EmployeeFormModal
                show={showEmployeeModal}
                onClose={() => { setShowEmployeeModal(false); setEditingEmployee(null); }}
                onSave={handleSaveEmployee}
                initial={editingEmployee}
            />
            <PeriodFormModal
                show={showPeriodModal}
                onClose={() => setShowPeriodModal(false)}
                onSave={handleSavePeriod}
            />
        </div>
    );
};

export default PayrollPage;
