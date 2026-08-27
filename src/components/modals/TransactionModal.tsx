import React, { useState, useEffect } from 'react';
import { X, ArrowDownRight, ArrowUpRight, CreditCard as CardIcon, Plus, Check } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Currency, TransactionType, PaymentMethodType, Transaction } from '../../types';
import { CategoryIcon } from '../CategoryIcon';
import { formatCurrency } from '../../utils/currency';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: TransactionType;
  editingTransaction?: Transaction | null;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  initialType = 'EXPENSE',
  editingTransaction = null,
}) => {
  const {
    categories,
    creditCards,
    mainAccount,
    addTransaction,
    editTransaction,
    displayCurrency,
    exchangeRate,
  } = useFinance();

  const [type, setType] = useState<TransactionType>(initialType);
  const [amount, setAmount] = useState<string>('');
  const [currency, setCurrency] = useState<Currency>(displayCurrency);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [categoryId, setCategoryId] = useState<string>('');
  const [sourceType, setSourceType] = useState<PaymentMethodType>('MAIN_ACCOUNT');
  const [sourceId, setSourceId] = useState<string>('main');
  const [targetCardId, setTargetCardId] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmount(editingTransaction.amount.toString());
      setCurrency(editingTransaction.currency);
      setDate(editingTransaction.date);
      setCategoryId(editingTransaction.categoryId || '');
      setSourceType(editingTransaction.sourceType);
      setSourceId(editingTransaction.sourceId);
      setTargetCardId(editingTransaction.targetCardId || '');
      setDescription(editingTransaction.description || '');
    } else {
      setType(initialType);
      setAmount('');
      setCurrency(displayCurrency);
      setDate(new Date().toISOString().split('T')[0]);
      setCategoryId(categories.length > 0 ? categories[0].id : '');
      setSourceType(initialType === 'CARD_PAYMENT' ? 'MAIN_ACCOUNT' : 'MAIN_ACCOUNT');
      setSourceId('main');
      setTargetCardId(creditCards.length > 0 ? creditCards[0].id : '');
      setDescription('');
    }
    setError('');
  }, [isOpen, editingTransaction, initialType, displayCurrency, categories, creditCards]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Por favor ingresa un monto válido mayor a 0');
      return;
    }

    if (type === 'EXPENSE' && !categoryId) {
      setError('Por favor selecciona una categoría');
      return;
    }

    if (type === 'CARD_PAYMENT' && !targetCardId) {
      setError('Por favor selecciona la tarjeta que estás pagando');
      return;
    }

    const txData = {
      type,
      amount: numAmount,
      currency,
      date,
      categoryId: type === 'EXPENSE' ? categoryId : undefined,
      sourceType: type === 'CARD_PAYMENT' ? 'MAIN_ACCOUNT' as PaymentMethodType : sourceType,
      sourceId: sourceType === 'MAIN_ACCOUNT' ? 'main' : sourceId,
      targetCardId: type === 'CARD_PAYMENT' ? targetCardId : undefined,
      description: description.trim() || (type === 'INCOME' ? 'Ingreso registrado' : type === 'CARD_PAYMENT' ? 'Pago de Tarjeta' : 'Gasto registrado'),
    };

    if (editingTransaction) {
      editTransaction(editingTransaction.id, txData);
    } else {
      addTransaction(txData);
    }

    onClose();
  };

  return (
    <div id="modal-backdrop-tx" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        id="modal-card-tx"
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {editingTransaction ? 'Editar Movimiento' : 'Registrar Movimiento'}
            </h2>
            <p className="text-xs text-slate-500">
              Controla tus entradas, salidas y pagos de tarjetas
            </p>
          </div>
          <button
            id="btn-close-tx-modal"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          {error && (
            <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">
              {error}
            </div>
          )}

          {/* Type Selector (Ingreso / Gasto / Pago Tarjeta) */}
          <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              id="tab-type-expense"
              onClick={() => setType('EXPENSE')}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
                type === 'EXPENSE'
                  ? 'bg-white text-rose-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowDownRight className="w-3.5 h-3.5" />
              Gasto
            </button>
            <button
              type="button"
              id="tab-type-income"
              onClick={() => {
                setType('INCOME');
                setSourceType('MAIN_ACCOUNT');
              }}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
                type === 'INCOME'
                  ? 'bg-white text-emerald-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              Ingreso
            </button>
            <button
              type="button"
              id="tab-type-payment"
              onClick={() => {
                setType('CARD_PAYMENT');
                setSourceType('MAIN_ACCOUNT');
              }}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
                type === 'CARD_PAYMENT'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CardIcon className="w-3.5 h-3.5" />
              Pagar Tarjeta
            </button>
          </div>

          {/* Amount & Currency */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Monto y Moneda
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                  {currency === 'CRC' ? '₡' : '$'}
                </span>
                <input
                  type="number"
                  step="any"
                  id="input-tx-amount"
                  placeholder={currency === 'CRC' ? '50000' : '100.00'}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  autoFocus
                  required
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 rounded-xl text-base font-semibold text-slate-900 outline-hidden transition-all"
                />
              </div>

              {/* Currency Selector */}
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  id="btn-currency-crc"
                  onClick={() => setCurrency('CRC')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    currency === 'CRC'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ₡ CRC
                </button>
                <button
                  type="button"
                  id="btn-currency-usd"
                  onClick={() => setCurrency('USD')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    currency === 'USD'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  $ USD
                </button>
              </div>
            </div>
          </div>

          {/* Source Account / Card */}
          {type === 'EXPENSE' && (
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                ¿De dónde salió el dinero?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Main Account / SINPE */}
                <button
                  type="button"
                  id="btn-source-main"
                  onClick={() => {
                    setSourceType('MAIN_ACCOUNT');
                    setSourceId('main');
                  }}
                  className={`p-3 text-left rounded-xl border transition-all flex items-center gap-3 ${
                    sourceType === 'MAIN_ACCOUNT'
                      ? 'border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500/30'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Check className={`w-4 h-4 ${sourceType === 'MAIN_ACCOUNT' ? 'opacity-100' : 'opacity-0'}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">Cuenta Principal</p>
                    <p className="text-[11px] text-slate-500">Efectivo / SINPE Móvil</p>
                  </div>
                </button>

                {/* Credit Cards list */}
                {creditCards.map((card) => {
                  const isSelected = sourceType === 'CREDIT_CARD' && sourceId === card.id;
                  return (
                    <button
                      key={card.id}
                      type="button"
                      id={`btn-source-card-${card.id}`}
                      onClick={() => {
                        setSourceType('CREDIT_CARD');
                        setSourceId(card.id);
                      }}
                      className={`p-3 text-left rounded-xl border transition-all flex items-center gap-3 ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50/50 ring-1 ring-indigo-500/30'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                        <CardIcon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{card.name}</p>
                        <p className="text-[11px] text-slate-500">
                          {card.bank} ({card.currency})
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* If Card Payment: Target Card Selector */}
          {type === 'CARD_PAYMENT' && (
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Tarjeta a pagar (desde Cuenta Principal)
              </label>
              <select
                id="select-target-card"
                value={targetCardId}
                onChange={(e) => setTargetCardId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-hidden focus:border-indigo-500 focus:bg-white transition-all"
              >
                {creditCards.map((card) => (
                  <option key={card.id} value={card.id}>
                    {card.bank} - {card.name} (Saldo usado: {formatCurrency(card.currentBalanceUsed, card.currency)})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500">
                El monto se descontará de la cuenta principal y restará automáticamente la deuda usada de la tarjeta.
              </p>
            </div>
          )}

          {/* Category Selector (For EXPENSE) */}
          {type === 'EXPENSE' && (
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Categoría
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-44 overflow-y-auto p-1 bg-slate-50 border border-slate-200 rounded-xl">
                {categories.map((cat) => {
                  const isSelected = categoryId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      id={`btn-cat-${cat.id}`}
                      onClick={() => setCategoryId(cat.id)}
                      className={`flex items-center gap-2 p-2 rounded-lg text-left transition-all text-xs ${
                        isSelected
                          ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                          : 'text-slate-700 hover:bg-slate-200/70 bg-white border border-slate-100'
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-emerald-700 text-white' : 'text-slate-700'
                        }`}
                        style={!isSelected ? { backgroundColor: `${cat.color}20`, color: cat.color } : {}}
                      >
                        <CategoryIcon name={cat.icon} className="w-3.5 h-3.5" />
                      </span>
                      <span className="truncate">{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Income Source (For INCOME) */}
          {type === 'INCOME' && (
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Fuente o Tipo de Ingreso
              </label>
              <div className="flex flex-wrap gap-1.5">
                {['Salario Quincenal', 'Salario Mensual', 'Freelance / Servicios', 'Ventas', 'Alquiler Recibido', 'Regalo', 'Reembolso'].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setDescription(item)}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                      description === item
                        ? 'bg-emerald-100 border-emerald-300 text-emerald-800 font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Date & Description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Fecha
              </label>
              <input
                type="date"
                id="input-tx-date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:border-emerald-500 focus:bg-white outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Descripción / Detalle
              </label>
              <input
                type="text"
                id="input-tx-desc"
                placeholder={type === 'EXPENSE' ? 'Ej. Automercado, Gasolina' : 'Ej. Salario quincena'}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:border-emerald-500 focus:bg-white outline-hidden"
              />
            </div>
          </div>

          {/* Footer actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              id="btn-cancel-tx"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              id="btn-submit-tx"
              className="px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 active:scale-98 rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              {editingTransaction ? 'Guardar Cambios' : 'Registrar Movimiento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
