import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FiCheckCircle, FiFileText, FiPlus, FiSave, FiTrash2 } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import * as accountingApi from '../../services/accountingApi';
import * as customerApi from '../../services/customerApi';
import { logError } from '../../services/errorApi';

type ReceiptData = {
    consignment_date: string;
    bank_puc_code: string;
    advance_puc_code: string;
    amount: number;
    customer_nit: string;
    customer_name: string;
    reference: string;
    notes: string;
};

type ItemRow = {
    description: string;
    quantity: number;
    unit_price: number;
    iva_rate: number;
};

type InvoiceData = {
    revenue_puc_code: string;
    iva_puc_code: string;
    operation_date: string;
    doc_type: string;
    doc_number: string;
    customer_name: string;
    customer_email: string;
    items: ItemRow[];
    notes: string;
};

const formatCurrency = (val: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(val || 0);

const emptyItem = (): ItemRow => ({ description: '', quantity: 1, unit_price: 0, iva_rate: 19 });

const ManualSaleRegularizationPage: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [saving, setSaving] = useState(false);

    const [receipt, setReceipt] = useState<ReceiptData>({
        consignment_date: '',
        bank_puc_code: '112005',
        advance_puc_code: '280505',
        amount: 0,
        customer_nit: '',
        customer_name: '',
        reference: '',
        notes: '',
    });
    const [createdReceipt, setCreatedReceipt] = useState<any>(null);

    const [invoice, setInvoice] = useState<InvoiceData>({
        revenue_puc_code: '413524',
        iva_puc_code: '240801',
        operation_date: '',
        doc_type: '13',
        doc_number: '',
        customer_name: '',
        customer_email: '',
        items: [emptyItem()],
        notes: '',
    });
    const [ivaIncluded, setIvaIncluded] = useState(false);
    const [createdInvoice, setCreatedInvoice] = useState<any>(null);
    const [pendingReceipts, setPendingReceipts] = useState<any[]>([]);
    const [customerLookup, setCustomerLookup] = useState<{ status: 'idle' | 'loading' | 'found' | 'not_found' | 'error'; message?: string }>({ status: 'idle' });
    const submittingRef = useRef(false);
    const lastLookupRef = useRef<string>('');

    const emptyReceipt = (): ReceiptData => ({
        consignment_date: '',
        bank_puc_code: '112005',
        advance_puc_code: '280505',
        amount: 0,
        customer_nit: '',
        customer_name: '',
        reference: '',
        notes: '',
    });

    const loadPending = () => {
        accountingApi.listPendingCashReceipts(receipt.advance_puc_code)
            .then((data) => setPendingReceipts(Array.isArray(data) ? data : []))
            .catch((err) => logError(err, '/accounting/regularization/manual-sale/pending'));
    };

    useEffect(() => {
        loadPending();
    }, []);

    // Lookup cliente por NIT/CC con debounce al cambiar el campo en el paso 1.
    // Autocompleta nombre, email, tipo y documento para que fluyan al paso 2.
    useEffect(() => {
        const doc = receipt.customer_nit.trim();
        if (doc.length < 5) {
            setCustomerLookup({ status: 'idle' });
            return;
        }
        const handle = setTimeout(() => {
            if (lastLookupRef.current === doc) return;
            lastLookupRef.current = doc;
            setCustomerLookup({ status: 'loading' });
            customerApi.getCustomerByDocument(doc)
                .then((customer: any) => {
                    if (!customer) {
                        setCustomerLookup({ status: 'not_found', message: 'No existe en la base. Registra los datos manualmente.' });
                        return;
                    }
                    setCustomerLookup({ status: 'found', message: `Cliente encontrado: ${customer.name}` });
                    setReceipt((prev) => ({ ...prev, customer_name: customer.name || prev.customer_name }));
                    setInvoice((prev) => ({
                        ...prev,
                        doc_number: customer.document_number || doc,
                        doc_type: customer.identificationType?.code || prev.doc_type,
                        customer_name: customer.name || prev.customer_name,
                        customer_email: customer.email || prev.customer_email,
                    }));
                })
                .catch((err) => {
                    setCustomerLookup({ status: 'error', message: 'Error consultando cliente' });
                    logError(err, '/customer/by-document');
                });
        }, 500);
        return () => clearTimeout(handle);
    }, [receipt.customer_nit]);

    const clearForm = () => {
        setReceipt(emptyReceipt());
        setCreatedReceipt(null);
        setCreatedInvoice(null);
        setInvoice({
            revenue_puc_code: '413524',
            iva_puc_code: '240801',
            operation_date: '',
            doc_type: '13',
            doc_number: '',
            customer_name: '',
            customer_email: '',
            items: [emptyItem()],
            notes: '',
        });
        setStep(1);
    };

    const resumeReceipt = (pending: any) => {
        setCreatedReceipt({
            journal_entry_id: pending.journal_entry_id,
            entry_number: pending.entry_number,
            entry_date: pending.entry_date,
            total: pending.available_balance,
        });
        setReceipt((prev) => ({
            ...prev,
            consignment_date: typeof pending.entry_date === 'string'
                ? pending.entry_date.slice(0, 10)
                : new Date(pending.entry_date).toISOString().slice(0, 10),
            amount: pending.available_balance,
            reference: pending.entry_number,
        }));
        setInvoice((prev) => ({
            ...prev,
            operation_date: typeof pending.entry_date === 'string'
                ? pending.entry_date.slice(0, 10)
                : new Date(pending.entry_date).toISOString().slice(0, 10),
        }));
        setStep(2);
    };

    const subtotal = useMemo(() => {
        return invoice.items.reduce((s, it) => {
            const gross = (it.quantity || 0) * (it.unit_price || 0);
            const rate = (it.iva_rate || 0) / 100;
            const lineSubtotal = ivaIncluded ? gross / (1 + rate) : gross;
            return s + lineSubtotal;
        }, 0);
    }, [invoice.items, ivaIncluded]);

    const ivaTotal = useMemo(() => {
        return invoice.items.reduce((s, it) => {
            const gross = (it.quantity || 0) * (it.unit_price || 0);
            const rate = (it.iva_rate || 0) / 100;
            const lineSubtotal = ivaIncluded ? gross / (1 + rate) : gross;
            return s + lineSubtotal * rate;
        }, 0);
    }, [invoice.items, ivaIncluded]);

    const total = useMemo(() => subtotal + ivaTotal, [subtotal, ivaTotal]);

    const handleCreateReceipt = async () => {
        if (submittingRef.current || createdReceipt) return;
        if (!receipt.consignment_date || !receipt.amount || !receipt.reference) {
            await Swal.fire({ icon: 'warning', title: 'Faltan datos', text: 'Fecha, monto y referencia son obligatorios.' });
            return;
        }

        try {
            submittingRef.current = true;
            setSaving(true);
            const result = await accountingApi.createCashReceipt({
                consignment_date: receipt.consignment_date,
                bank_puc_code: receipt.bank_puc_code,
                advance_puc_code: receipt.advance_puc_code,
                amount: Number(receipt.amount),
                customer_nit: receipt.customer_nit || undefined,
                customer_name: receipt.customer_name || undefined,
                reference: receipt.reference,
                notes: receipt.notes || undefined,
            });
            setCreatedReceipt(result);
            setInvoice((prev) => ({
                ...prev,
                operation_date: receipt.consignment_date,
                customer_name: receipt.customer_name,
                doc_number: receipt.customer_nit || '',
            }));
            setStep(2);
        } catch (err: any) {
            await Swal.fire({ icon: 'error', title: 'Error creando recibo', text: err?.message || String(err) });
        } finally {
            setSaving(false);
            submittingRef.current = false;
        }
    };

    const handleCreateInvoice = async () => {
        if (submittingRef.current || createdInvoice) return;
        if (!createdReceipt) return;
        if (!invoice.operation_date || !invoice.doc_number || !invoice.customer_name || invoice.items.length === 0) {
            await Swal.fire({ icon: 'warning', title: 'Faltan datos', text: 'Completa cliente, fecha e ítems antes de emitir.' });
            return;
        }
        if (Math.abs(total - Number(receipt.amount)) > 0.5) {
            const confirm = await Swal.fire({
                icon: 'question',
                title: '¿Continuar?',
                text: `El total de la factura (${formatCurrency(total)}) no coincide con el anticipo (${formatCurrency(Number(receipt.amount))}). ¿Emitir de todas formas?`,
                showCancelButton: true,
                confirmButtonText: 'Sí, emitir',
                cancelButtonText: 'Revisar',
            });
            if (!confirm.isConfirmed) return;
        }

        try {
            submittingRef.current = true;
            setSaving(true);
            const result = await accountingApi.createManualDianInvoice({
                cash_receipt_journal_id: createdReceipt.journal_entry_id,
                advance_puc_code: receipt.advance_puc_code,
                revenue_puc_code: invoice.revenue_puc_code,
                iva_puc_code: invoice.iva_puc_code,
                operation_date: invoice.operation_date,
                customer: {
                    doc_type: invoice.doc_type,
                    doc_number: invoice.doc_number,
                    name: invoice.customer_name,
                    email: invoice.customer_email || undefined,
                },
                items: invoice.items.map((it) => {
                    const rate = Number(it.iva_rate) || 0;
                    const rawPrice = Number(it.unit_price);
                    const netPrice = ivaIncluded ? rawPrice / (1 + rate / 100) : rawPrice;
                    return {
                        description: it.description,
                        quantity: Number(it.quantity),
                        unit_price: Number(netPrice.toFixed(2)),
                        iva_rate: rate,
                    };
                }),
                notes: invoice.notes || undefined,
            });
            setCreatedInvoice(result);
            loadPending();
            setStep(3);
        } catch (err: any) {
            await Swal.fire({ icon: 'error', title: 'Error emitiendo factura', text: err?.message || String(err) });
        } finally {
            setSaving(false);
            submittingRef.current = false;
        }
    };

    const addItem = () => setInvoice({ ...invoice, items: [...invoice.items, emptyItem()] });
    const removeItem = (i: number) => {
        if (invoice.items.length <= 1) return;
        setInvoice({ ...invoice, items: invoice.items.filter((_, idx) => idx !== i) });
    };
    const updateItem = (i: number, field: keyof ItemRow, value: any) => {
        const items = [...invoice.items];
        items[i] = { ...items[i], [field]: value };
        setInvoice({ ...invoice, items });
    };

    return (
        <div className="page-container">
            <PageHeader
                title="Regularizar venta sin factura (cruce anticipo)"
                icon={<FiFileText />}
            />
            <p style={{ color: '#a0a0b0', fontSize: 13, margin: '0 0 16px' }}>
                Registra un recibo de caja por una consignación recibida y emite la factura DIAN cruzando el anticipo.
            </p>

            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                {[1, 2, 3].map((n) => (
                    <div
                        key={n}
                        style={{
                            flex: 1,
                            padding: '10px 14px',
                            borderRadius: 8,
                            background: step === n ? '#f0b429' : step > n ? '#1f4432' : '#1a1a24',
                            color: step === n ? '#000' : '#f1f1f3',
                            fontWeight: 600,
                            fontSize: 13,
                            textAlign: 'center',
                            border: '1px solid #2a2a35',
                        }}
                    >
                        {n}. {n === 1 ? 'Recibo de caja' : n === 2 ? 'Factura DIAN' : 'Confirmación'}
                    </div>
                ))}
            </div>

            {step === 1 && pendingReceipts.length > 0 && (
                <div style={{ background: '#1a1a24', border: '1px solid #f0b429', borderRadius: 12, padding: 20, marginBottom: 16 }}>
                    <h4 style={{ color: '#f0b429', marginTop: 0, marginBottom: 8 }}>
                        Recibos de caja con saldo pendiente de cruce ({pendingReceipts.length})
                    </h4>
                    <p style={{ color: '#a0a0b0', fontSize: 12, marginTop: 0 }}>
                        Si uno de estos corresponde a la consignación que estás legalizando, continúa desde ahí en vez de crear uno nuevo (evita duplicar el anticipo en la cuenta {receipt.advance_puc_code}).
                    </p>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8 }}>
                        <thead>
                            <tr>
                                <th style={{ textAlign: 'left', color: '#6b6b7b', fontSize: 11, padding: 6 }}># Asiento</th>
                                <th style={{ textAlign: 'left', color: '#6b6b7b', fontSize: 11, padding: 6 }}>Fecha</th>
                                <th style={{ textAlign: 'left', color: '#6b6b7b', fontSize: 11, padding: 6 }}>Descripción</th>
                                <th style={{ textAlign: 'right', color: '#6b6b7b', fontSize: 11, padding: 6 }}>Saldo</th>
                                <th style={{ width: 120 }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingReceipts.map((p) => (
                                <tr key={p.journal_entry_id} style={{ borderTop: '1px solid #2a2a35' }}>
                                    <td style={{ padding: 6, color: '#f1f1f3', fontSize: 13 }}>{p.entry_number}</td>
                                    <td style={{ padding: 6, color: '#a0a0b0', fontSize: 13 }}>
                                        {new Date(p.entry_date).toLocaleDateString('es-CO')}
                                    </td>
                                    <td style={{ padding: 6, color: '#a0a0b0', fontSize: 12 }}>{p.description}</td>
                                    <td style={{ padding: 6, color: '#34d399', fontSize: 13, textAlign: 'right', fontWeight: 600 }}>
                                        {formatCurrency(p.available_balance)}
                                    </td>
                                    <td style={{ padding: 6, textAlign: 'right' }}>
                                        <Button variant="secondary" onClick={() => resumeReceipt(p)}>Continuar aquí</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {step === 1 && (
                <div style={{ background: '#1a1a24', border: '1px solid #2a2a35', borderRadius: 12, padding: 20 }}>
                    <h3 style={{ color: '#f0b429', marginTop: 0 }}>Paso 1 — Recibo de caja por consignación</h3>
                    <p style={{ color: '#a0a0b0', fontSize: 13 }}>
                        Asiento generado: <strong>DB {receipt.bank_puc_code}</strong> / <strong>CR {receipt.advance_puc_code}</strong>
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <FormField label="Fecha consignación" name="consignment_date" type="date" value={receipt.consignment_date} onChange={(e) => setReceipt({ ...receipt, consignment_date: e.target.value })} required />
                        <FormField label="Monto (COP)" name="amount" type="number" value={receipt.amount || ''} onChange={(e) => setReceipt({ ...receipt, amount: Number(e.target.value) })} required />
                        <FormField label="Cuenta banco (PUC)" name="bank_puc_code" type="text" value={receipt.bank_puc_code} onChange={(e) => setReceipt({ ...receipt, bank_puc_code: e.target.value })} required />
                        <FormField label="Cuenta anticipo (PUC)" name="advance_puc_code" type="text" value={receipt.advance_puc_code} onChange={(e) => setReceipt({ ...receipt, advance_puc_code: e.target.value })} required />
                        <div>
                            <FormField label="NIT/CC cliente" name="customer_nit" type="text" value={receipt.customer_nit} onChange={(e) => setReceipt({ ...receipt, customer_nit: e.target.value })} />
                            {customerLookup.status !== 'idle' && (
                                <div style={{
                                    fontSize: 11,
                                    marginTop: 4,
                                    color: customerLookup.status === 'found' ? '#34d399'
                                        : customerLookup.status === 'not_found' ? '#f59e0b'
                                        : customerLookup.status === 'error' ? '#f87171'
                                        : '#a0a0b0',
                                }}>
                                    {customerLookup.status === 'loading' ? 'Buscando…' : customerLookup.message}
                                </div>
                            )}
                        </div>
                        <FormField label="Nombre cliente" name="customer_name" type="text" value={receipt.customer_name} onChange={(e) => setReceipt({ ...receipt, customer_name: e.target.value })} />
                        <FormField label="Referencia consignación" name="reference" type="text" value={receipt.reference} onChange={(e) => setReceipt({ ...receipt, reference: e.target.value })} required placeholder="# transferencia, banco, etc." />
                        <FormField label="Notas" name="notes" type="text" value={receipt.notes} onChange={(e) => setReceipt({ ...receipt, notes: e.target.value })} />
                    </div>
                    <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
                        <Button variant="primary" icon={<FiSave />} onClick={handleCreateReceipt} disabled={saving} loading={saving}>
                            Guardar recibo y continuar
                        </Button>
                        <Button variant="ghost" onClick={clearForm}>Limpiar</Button>
                    </div>
                </div>
            )}

            {step === 2 && createdReceipt && (
                <div style={{ background: '#1a1a24', border: '1px solid #2a2a35', borderRadius: 12, padding: 20 }}>
                    <div style={{ background: '#1f4432', padding: 12, borderRadius: 8, marginBottom: 16, color: '#d1fae5', fontSize: 13 }}>
                        ✔ Recibo <strong>{createdReceipt.entry_number}</strong> creado. Anticipo disponible: {formatCurrency(createdReceipt.total)}.
                    </div>
                    <h3 style={{ color: '#f0b429', marginTop: 0 }}>Paso 2 — Factura DIAN cruzando anticipo</h3>
                    <p style={{ color: '#a0a0b0', fontSize: 13 }}>
                        Asiento generado: <strong>DB {receipt.advance_puc_code}</strong> / <strong>CR {invoice.revenue_puc_code}</strong> / <strong>CR {invoice.iva_puc_code}</strong>
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <FormField label="Fecha operación (retroactiva)" name="operation_date" type="date" value={invoice.operation_date} onChange={(e) => setInvoice({ ...invoice, operation_date: e.target.value })} required />
                        <FormField label="Tipo doc. (DIAN)" name="doc_type" type="text" value={invoice.doc_type} onChange={(e) => setInvoice({ ...invoice, doc_type: e.target.value })} required placeholder="13=CC, 31=NIT" />
                        <FormField label="NIT/CC cliente" name="doc_number" type="text" value={invoice.doc_number} onChange={(e) => setInvoice({ ...invoice, doc_number: e.target.value })} required />
                        <FormField label="Nombre cliente" name="customer_name" type="text" value={invoice.customer_name} onChange={(e) => setInvoice({ ...invoice, customer_name: e.target.value })} required />
                        <FormField label="Email cliente" name="customer_email" type="email" value={invoice.customer_email} onChange={(e) => setInvoice({ ...invoice, customer_email: e.target.value })} />
                        <FormField label="Cuenta ingresos (PUC)" name="revenue_puc_code" type="text" value={invoice.revenue_puc_code} onChange={(e) => setInvoice({ ...invoice, revenue_puc_code: e.target.value })} required />
                        <FormField label="Cuenta IVA (PUC)" name="iva_puc_code" type="text" value={invoice.iva_puc_code} onChange={(e) => setInvoice({ ...invoice, iva_puc_code: e.target.value })} required />
                    </div>

                    <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <h4 style={{ color: '#f1f1f3', margin: 0 }}>Ítems</h4>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#a0a0b0', fontSize: 13, cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={ivaIncluded}
                                onChange={(e) => setIvaIncluded(e.target.checked)}
                                style={{ cursor: 'pointer' }}
                            />
                            Precio unit. incluye IVA (calcular al revés)
                        </label>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={{ textAlign: 'left', color: '#6b6b7b', fontSize: 12, padding: 6 }}>Descripción</th>
                                <th style={{ textAlign: 'right', color: '#6b6b7b', fontSize: 12, padding: 6, width: 90 }}>Cant.</th>
                                <th style={{ textAlign: 'right', color: '#6b6b7b', fontSize: 12, padding: 6, width: 140 }}>Precio unit.</th>
                                <th style={{ textAlign: 'right', color: '#6b6b7b', fontSize: 12, padding: 6, width: 90 }}>IVA %</th>
                                <th style={{ width: 40 }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoice.items.map((it, i) => (
                                <tr key={i}>
                                    <td style={{ padding: 4 }}>
                                        <input type="text" value={it.description} onChange={(e) => updateItem(i, 'description', e.target.value)} style={{ width: '100%', padding: 6, background: '#1f1f2a', border: '1px solid #2a2a35', borderRadius: 6, color: '#f1f1f3' }} placeholder="Camiseta Two Six..." />
                                    </td>
                                    <td style={{ padding: 4 }}>
                                        <input type="number" value={it.quantity || ''} onChange={(e) => updateItem(i, 'quantity', Number(e.target.value))} style={{ width: '100%', padding: 6, background: '#1f1f2a', border: '1px solid #2a2a35', borderRadius: 6, color: '#f1f1f3', textAlign: 'right' }} />
                                    </td>
                                    <td style={{ padding: 4 }}>
                                        <input type="number" value={it.unit_price || ''} onChange={(e) => updateItem(i, 'unit_price', Number(e.target.value))} style={{ width: '100%', padding: 6, background: '#1f1f2a', border: '1px solid #2a2a35', borderRadius: 6, color: '#f1f1f3', textAlign: 'right' }} />
                                    </td>
                                    <td style={{ padding: 4 }}>
                                        <input type="number" value={it.iva_rate} onChange={(e) => updateItem(i, 'iva_rate', Number(e.target.value))} style={{ width: '100%', padding: 6, background: '#1f1f2a', border: '1px solid #2a2a35', borderRadius: 6, color: '#f1f1f3', textAlign: 'right' }} />
                                    </td>
                                    <td style={{ padding: 4, textAlign: 'center' }}>
                                        <button onClick={() => removeItem(i)} disabled={invoice.items.length <= 1} style={{ background: 'none', border: 'none', color: invoice.items.length <= 1 ? '#3a3a48' : '#f87171', cursor: 'pointer' }}><FiTrash2 /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div style={{ marginTop: 8 }}>
                        <Button variant="secondary" icon={<FiPlus />} onClick={addItem}>Agregar ítem</Button>
                    </div>

                    <div style={{ marginTop: 20, padding: 12, background: '#1f1f2a', borderRadius: 8, fontSize: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a0a0b0' }}><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a0a0b0' }}><span>IVA</span><span>{formatCurrency(ivaTotal)}</span></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f0b429', fontWeight: 700, marginTop: 6, fontSize: 16 }}><span>Total</span><span>{formatCurrency(total)}</span></div>
                        <div style={{ marginTop: 6, color: Math.abs(total - Number(receipt.amount)) > 0.5 ? '#f87171' : '#34d399', fontSize: 12 }}>
                            Anticipo disponible: {formatCurrency(Number(receipt.amount))} ({Math.abs(total - Number(receipt.amount)) > 0.5 ? 'no coincide' : 'coincide'})
                        </div>
                    </div>

                    <FormField label="Notas" name="inv_notes" type="text" value={invoice.notes} onChange={(e) => setInvoice({ ...invoice, notes: e.target.value })} />

                    <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
                        <Button variant="primary" icon={<FiSave />} onClick={handleCreateInvoice} disabled={saving} loading={saving}>
                            Emitir factura DIAN
                        </Button>
                        <Button variant="ghost" onClick={() => setStep(1)}>Volver</Button>
                    </div>
                </div>
            )}

            {step === 3 && createdInvoice && (
                <div style={{ background: '#1a1a24', border: '1px solid #2a2a35', borderRadius: 12, padding: 20 }}>
                    <div style={{ textAlign: 'center', padding: 20 }}>
                        <FiCheckCircle size={56} color="#34d399" />
                        <h2 style={{ color: '#34d399' }}>¡Legalización completada!</h2>
                    </div>
                    <div style={{ background: '#1f1f2a', borderRadius: 8, padding: 16, fontSize: 14, color: '#f1f1f3' }}>
                        <div><strong>Factura:</strong> {createdInvoice.invoice_number}</div>
                        <div><strong>CUFE:</strong> <code style={{ fontSize: 11 }}>{createdInvoice.cufe}</code></div>
                        <div><strong>Total facturado:</strong> {formatCurrency(createdInvoice.total)}</div>
                        <div><strong>Asiento contable:</strong> #{createdInvoice.journal_entry_id}</div>
                        <div><strong>Recibo de caja:</strong> {createdReceipt?.entry_number}</div>
                    </div>
                    <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
                        <Button variant="primary" onClick={() => navigate(`/accounting/journal`)}>Ver asientos</Button>
                        <Button variant="secondary" onClick={() => { clearForm(); loadPending(); }}>Nueva regularización</Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManualSaleRegularizationPage;
