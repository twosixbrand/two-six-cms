import React, { useState, useEffect } from 'react';
import { FiUsers, FiCalendar, FiFileText, FiPlus, FiEdit2, FiPlay, FiCheckCircle, FiRefreshCcw, FiDownload } from 'react-icons/fi';
import PageHeader from '../../components/common/PageHeader';
import { DataTable, Button, StatusBadge, LoadingSpinner, Modal, ConfirmDialog } from '../../components/ui';
import * as accountingApi from '../../services/accountingApi';
import { logError } from '../../services/errorApi';

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
        border: '1px solid #ddd',
        borderRadius: '6px',
        fontSize: '14px',
    };

    return (
        <Modal
            isOpen={show}
            onClose={onClose}
            title={initial ? 'Editar Empleado' : 'Nuevo Empleado'}
            size="lg"
            footer={
                <>
                    <Button variant="ghost" onClick={onClose}>Cancelar</Button>
                    <Button variant="primary" onClick={handleSubmit}>{initial ? 'Actualizar' : 'Crear'}</Button>
                </>
            }
        >
            <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#555' }}>Documento *</label>
                        <input style={inputStyle} required value={form.document_number}
                            onChange={(e) => setForm({ ...form, document_number: e.target.value })} />
                    </div>
                    <div>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#555' }}>Tipo Doc</label>
                        <select style={inputStyle} value={form.id_identification_type}
                            onChange={(e) => setForm({ ...form, id_identification_type: Number(e.target.value) })}>
                            <option value={1}>CC</option>
                            <option value={2}>CE</option>
                            <option value={3}>NIT</option>
                            <option value={4}>Pasaporte</option>
                        </select>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#555' }}>Nombre Completo *</label>
                        <input style={inputStyle} required value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })} />
                    </div>
                    <div>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#555' }}>Cargo *</label>
                        <input style={inputStyle} required value={form.position}
                            onChange={(e) => setForm({ ...form, position: e.target.value })} />
                    </div>
                    <div>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#555' }}>Departamento</label>
                        <input style={inputStyle} value={form.department}
                            onChange={(e) => setForm({ ...form, department: e.target.value })} />
                    </div>
                    <div>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#555' }}>Fecha Ingreso *</label>
                        <input style={inputStyle} type="date" required value={form.hire_date}
                            onChange={(e) => setForm({ ...form, hire_date: e.target.value })} />
                    </div>
                    <div>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#555' }}>Salario Base *</label>
                        <input style={inputStyle} type="number" required value={form.base_salary}
                            onChange={(e) => setForm({ ...form, base_salary: Number(e.target.value) })} />
                    </div>
                    <div>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#555' }}>Auxilio Transporte</label>
                        <input style={inputStyle} type="number" value={form.transport_allowance}
                            onChange={(e) => setForm({ ...form, transport_allowance: Number(e.target.value) })} />
                    </div>
                    <div>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#555' }}>Nivel ARL (1-5)</label>
                        <select style={inputStyle} value={form.arl_risk_level}
                            onChange={(e) => setForm({ ...form, arl_risk_level: Number(e.target.value) })}>
                            {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>Nivel {n}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#555' }}>EPS</label>
                        <input style={inputStyle} value={form.eps_entity}
                            onChange={(e) => setForm({ ...form, eps_entity: e.target.value })} />
                    </div>
                    <div>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#555' }}>Fondo Pensiones</label>
                        <input style={inputStyle} value={form.pension_fund}
                            onChange={(e) => setForm({ ...form, pension_fund: e.target.value })} />
                    </div>
                    <div>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#555' }}>Banco</label>
                        <input style={inputStyle} value={form.bank_name}
                            onChange={(e) => setForm({ ...form, bank_name: e.target.value })} />
                    </div>
                    <div>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#555' }}>Cuenta Bancaria</label>
                        <input style={inputStyle} value={form.bank_account}
                            onChange={(e) => setForm({ ...form, bank_account: e.target.value })} />
                    </div>
                    {initial && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input type="checkbox" checked={form.is_active}
                                onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
                            <label style={{ fontSize: '12px', fontWeight: 600, color: '#555' }}>Activo</label>
                        </div>
                    )}
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
        border: '1px solid #ddd',
        borderRadius: '6px',
        fontSize: '14px',
    };

    return (
        <Modal
            isOpen={show}
            onClose={onClose}
            title="Nuevo Periodo de Nomina"
            size="sm"
            footer={
                <>
                    <Button variant="ghost" onClick={onClose}>Cancelar</Button>
                    <Button variant="primary" onClick={handleSubmit}>Crear Periodo</Button>
                </>
            }
        >
            <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#555' }}>Anio</label>
                        <input style={inputStyle} type="number" value={form.year}
                            onChange={(e) => setForm({ ...form, year: Number(e.target.value) })} />
                    </div>
                    <div>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#555' }}>Mes</label>
                        <input style={inputStyle} type="number" min={1} max={12} value={form.month}
                            onChange={(e) => setForm({ ...form, month: Number(e.target.value) })} />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#555' }}>Tipo de Periodo</label>
                        <select style={inputStyle} value={form.period_type}
                            onChange={(e) => setForm({ ...form, period_type: e.target.value })}>
                            <option value="MENSUAL">Mensual</option>
                            <option value="QUINCENAL_1">Quincenal 1ra</option>
                            <option value="QUINCENAL_2">Quincenal 2da</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#555' }}>Fecha Inicio</label>
                        <input style={inputStyle} type="date" value={form.start_date}
                            onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
                    </div>
                    <div>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#555' }}>Fecha Fin</label>
                        <input style={inputStyle} type="date" value={form.end_date}
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

    // Confirm dialogs
    const [confirmCalc, setConfirmCalc] = useState<number | null>(null);
    const [confirmApprove, setConfirmApprove] = useState<number | null>(null);

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
                setSuccess('Empleado actualizado exitosamente.');
            } else {
                await accountingApi.createEmployee(data);
                setSuccess('Empleado creado exitosamente.');
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
            setSuccess('Periodo creado exitosamente.');
            setShowPeriodModal(false);
            fetchPeriods();
        } catch (err: any) {
            setError(err.message || 'Error al crear periodo.');
        }
    };

    const handleCalculate = async () => {
        if (!confirmCalc) return;
        try {
            setLoading(true);
            setError('');
            const result = await accountingApi.calculatePayroll(confirmCalc);
            setSuccess(`Nomina calculada: ${result.employee_count} empleados procesados.`);
            fetchPeriods();
        } catch (err: any) {
            setError(err.message || 'Error al calcular nomina.');
        } finally {
            setLoading(false);
            setConfirmCalc(null);
        }
    };

    const handleApprove = async () => {
        if (!confirmApprove) return;
        try {
            setLoading(true);
            setError('');
            await accountingApi.approvePayroll(confirmApprove);
            setSuccess('Nomina aprobada y asientos contables generados.');
            fetchPeriods();
        } catch (err: any) {
            setError(err.message || 'Error al aprobar nomina.');
        } finally {
            setLoading(false);
            setConfirmApprove(null);
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
        padding: '10px 20px',
        border: 'none',
        borderBottom: active ? '3px solid #1a73e8' : '3px solid transparent',
        background: 'transparent',
        color: active ? '#1a73e8' : '#666',
        fontWeight: active ? 600 : 400,
        fontSize: '14px',
        cursor: 'pointer',
    });

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'APPROVED':
            case 'PAID': return 'success';
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
        { key: 'department', header: 'Departamento', render: (val: any) => val || '-' },
        { key: 'base_salary', header: 'Salario Base', render: (val: any) => formatCurrency(val) },
        { key: 'transport_allowance', header: 'Aux. Transporte', render: (val: any) => formatCurrency(val) },
        { key: 'arl_risk_level', header: 'ARL', render: (val: any) => `Nivel ${val}` },
        {
            key: 'is_active',
            header: 'Estado',
            render: (val: any) => (
                <StatusBadge
                    status={val ? 'Activo' : 'Inactivo'}
                    variant={val ? 'success' : 'error'}
                    size="sm"
                />
            ),
        },
    ];

    // Period columns
    const periodColumns = [
        { key: 'id', header: 'ID' },
        { key: 'year', header: 'Anio' },
        { key: 'month', header: 'Mes' },
        { key: 'period_type', header: 'Tipo', render: (val: any) => periodTypeLabels[val] || val },
        { key: 'start_date', header: 'Inicio', render: (val: any) => new Date(val).toLocaleDateString('es-CO') },
        { key: 'end_date', header: 'Fin', render: (val: any) => new Date(val).toLocaleDateString('es-CO') },
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
        { key: 'base_salary', header: 'Salario Base', render: (val: any) => formatCurrency(val) },
        { key: 'transport_allowance', header: 'Aux. Trans.', render: (val: any) => formatCurrency(val) },
        { key: 'gross_salary', header: 'Bruto', render: (val: any) => <strong>{formatCurrency(val)}</strong> },
        { key: 'health_employee', header: 'EPS (4%)', render: (val: any) => <span style={{ color: '#d32f2f' }}>-{formatCurrency(val)}</span> },
        { key: 'pension_employee', header: 'Pension (4%)', render: (val: any) => <span style={{ color: '#d32f2f' }}>-{formatCurrency(val)}</span> },
        { key: 'net_salary', header: 'Neto', render: (val: any) => <strong style={{ color: '#2e7d32' }}>{formatCurrency(val)}</strong> },
        { key: 'health_employer', header: 'EPS Empl.', render: (val: any) => formatCurrency(val) },
        { key: 'pension_employer', header: 'Pension Empl.', render: (val: any) => formatCurrency(val) },
        { key: 'arl_employer', header: 'ARL', render: (val: any) => formatCurrency(val) },
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
        { key: 'total_employer_cost', header: 'Costo Total', render: (val: any) => <strong style={{ color: '#d32f2f' }}>{formatCurrency(val)}</strong> },
    ];

    // Summary totals for detail view
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
        <div>
            <PageHeader title="Nomina Colombiana" icon={<FiUsers />} />

            {error && (
                <div style={{ background: '#fdecea', color: '#d32f2f', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
                    {error}
                    <button onClick={() => setError('')} style={{ float: 'right', border: 'none', background: 'none', color: '#d32f2f', cursor: 'pointer', fontWeight: 700 }}>X</button>
                </div>
            )}
            {success && (
                <div style={{ background: '#e8f5e9', color: '#2e7d32', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
                    {success}
                </div>
            )}

            {/* Tabs */}
            <div style={{ borderBottom: '1px solid #e0e0e0', marginBottom: '20px', display: 'flex', gap: '4px' }}>
                <button style={tabStyle(activeTab === 'employees')} onClick={() => setActiveTab('employees')}>
                    <FiUsers style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Empleados
                </button>
                <button style={tabStyle(activeTab === 'periods')} onClick={() => setActiveTab('periods')}>
                    <FiCalendar style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Periodos
                </button>
                <button style={tabStyle(activeTab === 'detail')} onClick={() => setActiveTab('detail')}>
                    <FiFileText style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Detalle Periodo
                </button>
            </div>

            {/* TAB: Employees */}
            {activeTab === 'employees' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ margin: 0, fontSize: '16px', color: '#333' }}>Empleados ({employees.length})</h3>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <Button variant="ghost" size="sm" icon={<FiRefreshCcw />} onClick={fetchEmployees}>
                                Refrescar
                            </Button>
                            <Button variant="primary" size="sm" icon={<FiPlus />} onClick={() => { setEditingEmployee(null); setShowEmployeeModal(true); }}>
                                Nuevo Empleado
                            </Button>
                        </div>
                    </div>

                    <DataTable
                        columns={employeeColumns}
                        data={employees}
                        loading={loading && !employees.length}
                        emptyMessage="No hay empleados registrados"
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ margin: 0, fontSize: '16px', color: '#333' }}>Periodos de Nomina ({periods.length})</h3>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <Button variant="ghost" size="sm" icon={<FiRefreshCcw />} onClick={fetchPeriods}>
                                Refrescar
                            </Button>
                            <Button variant="primary" size="sm" icon={<FiPlus />} onClick={() => setShowPeriodModal(true)}>
                                Nuevo Periodo
                            </Button>
                        </div>
                    </div>

                    <DataTable
                        columns={periodColumns}
                        data={periods}
                        loading={loading && !periods.length}
                        emptyMessage="No hay periodos creados"
                        actions={(p: any) => (
                            <div style={{ display: 'flex', gap: '4px' }}>
                                <Button variant="ghost" size="sm" icon={<FiFileText />} onClick={() => handleViewDetail(p.id)}>
                                    {''}
                                </Button>
                                {(p.status === 'DRAFT' || p.status === 'CALCULATED') && (
                                    <Button variant="ghost" size="sm" icon={<FiPlay />} onClick={() => setConfirmCalc(p.id)} disabled={loading}>
                                        Calcular
                                    </Button>
                                )}
                                {p.status === 'CALCULATED' && (
                                    <Button variant="primary" size="sm" icon={<FiCheckCircle />} onClick={() => setConfirmApprove(p.id)} disabled={loading}>
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
                        <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>
                            <FiFileText size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
                            <p>Selecciona un periodo en la pestania "Periodos" para ver el detalle.</p>
                        </div>
                    ) : (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                                <h3 style={{ margin: 0, fontSize: '16px', color: '#333' }}>
                                    Detalle: {selectedPeriod.year}-{String(selectedPeriod.month).padStart(2, '0')} ({periodTypeLabels[selectedPeriod.period_type] || selectedPeriod.period_type})
                                    <span style={{ marginLeft: '12px' }}>
                                        <StatusBadge status={selectedPeriod.status} variant={getStatusVariant(selectedPeriod.status)} size="sm" />
                                    </span>
                                </h3>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <Button variant="ghost" size="sm" icon={<FiRefreshCcw />} onClick={() => handleViewDetail(selectedPeriod.id)}>
                                        Refrescar
                                    </Button>
                                    <Button variant="primary" size="sm" icon={<FiDownload />} onClick={() => accountingApi.exportToExcel('payroll', { periodId: String(selectedPeriod.id) })}>
                                        Exportar Excel
                                    </Button>
                                </div>
                            </div>

                            {/* Summary Cards */}
                            {selectedPeriod.entries?.length > 0 && (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                                    {[
                                        { label: 'Salario Bruto Total', value: detailTotals.gross_salary, color: '#1a73e8' },
                                        { label: 'Salario Neto Total', value: detailTotals.net_salary, color: '#2e7d32' },
                                        { label: 'Costo Empleador Total', value: detailTotals.total_employer_cost, color: '#d32f2f' },
                                        { label: 'Seguridad Social (Empleador)', value: detailTotals.health_employer + detailTotals.pension_employer + detailTotals.arl_employer, color: '#ff9800' },
                                        { label: 'Parafiscales', value: detailTotals.sena_employer + detailTotals.icbf_employer + detailTotals.caja_employer, color: '#7b1fa2' },
                                        { label: 'Provisiones', value: detailTotals.prima_provision + detailTotals.cesantias_provision + detailTotals.int_cesantias_provision + detailTotals.vacaciones_provision, color: '#00838f' },
                                    ].map((card, i) => (
                                        <div key={i} style={{
                                            background: '#fff', borderRadius: '10px', padding: '16px',
                                            boxShadow: '0 1px 4px rgba(0,0,0,0.08)', borderLeft: `4px solid ${card.color}`,
                                        }}>
                                            <div style={{ fontSize: '11px', color: '#888', fontWeight: 600, marginBottom: '4px' }}>{card.label}</div>
                                            <div style={{ fontSize: '18px', fontWeight: 700, color: card.color }}>{formatCurrency(card.value)}</div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Entries Table */}
                            <DataTable
                                columns={detailColumns}
                                data={selectedPeriod.entries || []}
                                emptyMessage="No hay entradas calculadas"
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

            {/* Confirm Dialogs */}
            <ConfirmDialog
                isOpen={confirmCalc !== null}
                onConfirm={handleCalculate}
                onCancel={() => setConfirmCalc(null)}
                title="Calcular Nomina"
                message="Se calculara la nomina para todos los empleados activos. Continuar?"
                confirmText="Calcular"
                cancelText="Cancelar"
                variant="warning"
            />
            <ConfirmDialog
                isOpen={confirmApprove !== null}
                onConfirm={handleApprove}
                onCancel={() => setConfirmApprove(null)}
                title="Aprobar Nomina"
                message="Aprobar la nomina generara asientos contables automaticos. Continuar?"
                confirmText="Aprobar"
                cancelText="Cancelar"
                variant="warning"
            />
        </div>
    );
};

export default PayrollPage;
