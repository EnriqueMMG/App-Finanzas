import React, { useState, useEffect } from 'react';
import { X, CalendarClock, ShoppingBag, Repeat, Landmark, Trash2 } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { ScheduledExpense, ScheduledType, Currency } from '../../types';

interface ScheduledExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingScheduled?: ScheduledExpense | null;
}

export const ScheduledExpenseModal: React.FC<ScheduledExpenseModalProps> = ({
  isOpen,
  onClose,
  editingScheduled = null,
}) => {
  const {
    categories,
    creditCards,
    addScheduledExpense,
    updateScheduledExpense,
    deleteScheduledExpense,
    displayCurrency,
  } = useFinance();

  const [type, setType] = useState<ScheduledType>('TASA_CERO');
  const [title, setTitle] = useState<string>('');
  const [currency, setCurrency] = useState<Currency>(displayCurrency);
  const [monthlyAmount, setMonthlyAmount] = useState<string>('');
  const [totalAmount, setTotalAmount] = useState<string>('');
  const [totalInstallments, setTotalInstallments] = useState<string>('12');
  const [paidInstallments, setPaidInstallments] = useState<string>('0');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dueDay, setDueDay] = useState<number>(15);
  const [sourceAccountId, setSourceAccountId] = useState<string>('main');
  const [categoryId, setCategoryId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (editingScheduled) {
      setType(editingScheduled.type);
      setTitle(editingScheduled.title);
      setCurrency(editingScheduled.currency);
      setMonthlyAmount(editingScheduled.monthlyAmount.toString());
      setTotalAmount(editingScheduled.totalAmount ? editingScheduled.totalAmount.toString() : '');
      setTotalInstallments(
        editingScheduled.totalInstallments ? editingScheduled.totalInstallments.toString() : '12'
      );
      setPaidInstallments(
        editingScheduled.paidInstallments !== undefined ? editingScheduled.paidInstallments.toString() : '0'
      );
      setStartDate(editingScheduled.startDate);
      setDueDay(editingScheduled.dueDay);
      setSourceAccountId(editingScheduled.sourceAccountId);
      setCategoryId(editingScheduled.categoryId);
      setNotes(editingScheduled.notes || '');
    } else {
      setType('TASA_CERO');
      setTitle('');
      setCurrency(displayCurrency);
      setMonthlyAmount('');
      setTotalAmount('');
      setTotalInstallments('12');
      setPaidInstallments('0');
      setStartDate(new Date().toISOString().split('T')[0]);
      setDueDay(15);
      setSourceAccountId(creditCards.length > 0 ? creditCards[0].id : 'main');
      setCategoryId(categories.length > 0 ? categories[0].id : '');
      setNotes('');
    }
    setError('');
  }, [isOpen, editingScheduled, displayCurrency, categories, creditCards]);

  if (!isOpen) return null;

  // Auto calculate monthly amount if total amount and installments are provided
  const handleTotalAmountChange = (val: string) => {
    setTotalAmount(val);
    const tot = parseFloat(val);
    const inst = parseInt(totalInstallments);
    if (!isNaN(tot) && !isNaN(inst) && inst > 0) {
      setMonthlyAmount((Math.round((tot / inst) * 100) / 100).toString());
    }
  };

  const handleInstallmentsChange = (val: string) => {
    setTotalInstallments(val);
    const tot = parseFloat(totalAmount);
    const inst = parseInt(val);
    if (!isNaN(tot) && !isNaN(inst) && inst > 0) {
      setMonthlyAmount((Math.round((tot / inst) * 100) / 100).toString());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Por favor ingresa un título o concepto');
      return;
    }

    const monthAmt = parseFloat(monthlyAmount);
    if (isNaN(monthAmt) || monthAmt <= 0) {
      setError('Por favor ingresa el monto mensual o por cuota');
      return;
    }

    let totInst: number | undefined = undefined;
    let paidInst: number | undefined = undefined;
    let remInst: number | undefined = undefined;
    let totAmt: number | undefined = undefined;

    if (type === 'TASA_CERO' || type === 'LOAN') {
      totInst = parseInt(totalInstallments) || 12;
      paidInst = parseInt(paidInstallments) || 0;
      remInst = Math.max(0, totInst - paidInst);
      totAmt = parseFloat(totalAmount) || monthAmt * totInst;
    }

    const itemData = {
      title: title.trim(),
      type,
      currency,
      monthlyAmount: monthAmt,
      totalAmount: totAmt,
      totalInstallments: totInst,
      paidInstallments: paidInst,
      remainingInstallments: remInst,
      startDate,
      dueDay: Math.min(31, Math.max(1, dueDay)),
      sourceAccountId,
      categoryId: categoryId || (categories[0] ? categories[0].id : 'cat-other'),
      notes: notes.trim(),
      isActive: true,
    };

    if (editingScheduled) {
      updateScheduledExpense(editingScheduled.id, itemData);
    } else {
      addScheduledExpense(itemData);
    }

    onClose();
  };

  const handleDelete = () => {
    if (editingScheduled && confirm(`¿Eliminar ${editingScheduled.title}?`)) {
      deleteScheduledExpense(editingScheduled.id);
      onClose();
    }
  };

  return (
    <div id="modal-backdrop-scheduled" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        id="modal-scheduled"
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CalendarClock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {editingScheduled ? 'Editar Gasto Programado' : 'Nuevo Gasto Programado'}
              </h2>
              <p className="text-xs text-slate-500">Tasa Cero, cuotas, gastos fijos y préstamos</p>
            </div>
          </div>
          <button
            id="btn-close-sched-modal"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">
              {error}
            </div>
          )}

          {/* Type selector */}
          <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              id="sched-type-tasa-cero"
              onClick={() => {
                setType('TASA_CERO');
                if (creditCards.length > 0) setSourceAccountId(creditCards[0].id);
              }}
              className={`flex flex-col items-center justify-center p-2 text-center rounded-lg transition-all ${
                type === 'TASA_CERO'
                  ? 'bg-white text-emerald-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 font-medium'
              }`}
            >
              <ShoppingBag className="w-4 h-4 mb-1 text-emerald-600" />
              <span className="text-xs">Tasa Cero / Cuotas</span>
            </button>
            <button
              type="button"
              id="sched-type-fixed"
              onClick={() => setType('FIXED_MONTHLY')}
              className={`flex flex-col items-center justify-center p-2 text-center rounded-lg transition-all ${
                type === 'FIXED_MONTHLY'
                  ? 'bg-white text-indigo-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 font-medium'
              }`}
            >
              <Repeat className="w-4 h-4 mb-1 text-indigo-600" />
              <span className="text-xs">Gasto Fijo Mensual</span>
            </button>
            <button
              type="button"
              id="sched-type-loan"
              onClick={() => {
                setType('LOAN');
                setSourceAccountId('main');
              }}
              className={`flex flex-col items-center justify-center p-2 text-center rounded-lg transition-all ${
                type === 'LOAN'
                  ? 'bg-white text-amber-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 font-medium'
              }`}
            >
              <Landmark className="w-4 h-4 mb-1 text-amber-600" />
              <span className="text-xs">Préstamo</span>
            </button>
          </div>

          {/* Title */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Concepto / Nombre
            </label>
            <input
              type="text"
              id="input-sched-title"
              placeholder={
                type === 'TASA_CERO'
                  ? 'Ej. Tasa Cero BAC Refrigeradora (12 meses)'
                  : type === 'FIXED_MONTHLY'
                  ? 'Ej. Netflix 4K, Alquiler, Internet Kolbi'
                  : 'Ej. Préstamo Auto Banco Nacional'
              }
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:border-emerald-500 focus:bg-white outline-hidden"
            />
          </div>

          {/* Currency and Monthly Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Moneda
              </label>
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  id="btn-sched-crc"
                  onClick={() => setCurrency('CRC')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    currency === 'CRC' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  ₡ CRC
                </button>
                <button
                  type="button"
                  id="btn-sched-usd"
                  onClick={() => setCurrency('USD')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    currency === 'USD' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  $ USD
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Monto Mensual / Cuota
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                  {currency === 'CRC' ? '₡' : '$'}
                </span>
                <input
                  type="number"
                  step="any"
                  id="input-sched-month-amt"
                  placeholder="35000"
                  value={monthlyAmount}
                  onChange={(e) => setMonthlyAmount(e.target.value)}
                  required
                  className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:border-emerald-500 focus:bg-white outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Installment details if TASA_CERO or LOAN */}
          {(type === 'TASA_CERO' || type === 'LOAN') && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <p className="text-xs font-bold text-slate-700">Detalles de Cuotas</p>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold uppercase text-slate-500 mb-1">
                    Total Cuotas
                  </label>
                  <input
                    type="number"
                    min={1}
                    id="input-sched-total-inst"
                    value={totalInstallments}
                    onChange={(e) => handleInstallmentsChange(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase text-slate-500 mb-1">
                    Ya Pagadas
                  </label>
                  <input
                    type="number"
                    min={0}
                    id="input-sched-paid-inst"
                    value={paidInstallments}
                    onChange={(e) => setPaidInstallments(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase text-slate-500 mb-1">
                    Monto Total
                  </label>
                  <input
                    type="number"
                    id="input-sched-total-amt"
                    placeholder="Opcional"
                    value={totalAmount}
                    onChange={(e) => handleTotalAmountChange(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Source Account & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Cuenta / Tarjeta de Cobro
              </label>
              <select
                id="select-sched-source"
                value={sourceAccountId}
                onChange={(e) => setSourceAccountId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-hidden"
              >
                <option value="main">Cuenta Principal (SINPE/Bancaria)</option>
                {creditCards.map((card) => (
                  <option key={card.id} value={card.id}>
                    {card.bank} - {card.name} (•••• {card.cardLast4})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Categoría
              </label>
              <select
                id="select-sched-category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-hidden"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Due day of month & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Día de Cobro Mensual (1-31)
              </label>
              <input
                type="number"
                min={1}
                max={31}
                id="input-sched-due-day"
                value={dueDay}
                onChange={(e) => setDueDay(parseInt(e.target.value) || 1)}
                required
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-hidden"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Notas / Referencia
              </label>
              <input
                type="text"
                id="input-sched-notes"
                placeholder="Ej. Tienda Gollo a 12 meses"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-hidden"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-between border-t border-slate-100">
            {editingScheduled ? (
              <button
                type="button"
                id="btn-delete-sched"
                onClick={handleDelete}
                className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Eliminar
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                id="btn-cancel-sched"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                id="btn-save-sched"
                className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 active:scale-98 rounded-xl shadow-md transition-all"
              >
                {editingScheduled ? 'Guardar Cambios' : 'Crear Gasto Programado'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
