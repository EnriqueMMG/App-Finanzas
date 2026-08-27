import React, { useState, useEffect } from 'react';
import { X, CreditCard as CardIcon, Trash2 } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { CreditCard, Currency } from '../../types';

interface CardModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingCard?: CreditCard | null;
}

const CARD_THEMES = [
  { label: 'Rojo BAC', value: 'from-red-600 to-rose-800' },
  { label: 'Negro Black/Infinite', value: 'from-slate-800 to-zinc-950' },
  { label: 'Verde BN / BCR', value: 'from-emerald-700 to-teal-900' },
  { label: 'Azul Scotiabank', value: 'from-blue-700 to-indigo-900' },
  { label: 'Dorado / Gold', value: 'from-amber-600 to-yellow-800' },
  { label: 'Púrpura / Neo', value: 'from-purple-700 to-violet-900' },
];

export const CardModal: React.FC<CardModalProps> = ({ isOpen, onClose, editingCard = null }) => {
  const { addCreditCard, updateCreditCard, deleteCreditCard } = useFinance();

  const [name, setName] = useState<string>('');
  const [bank, setBank] = useState<string>('');
  const [cardLast4, setCardLast4] = useState<string>('');
  const [currency, setCurrency] = useState<Currency>('CRC');
  const [creditLimit, setCreditLimit] = useState<string>('');
  const [cutoffDay, setCutoffDay] = useState<number>(15);
  const [paymentDueDay, setPaymentDueDay] = useState<number>(5);
  const [currentBalanceUsed, setCurrentBalanceUsed] = useState<string>('0');
  const [colorTheme, setColorTheme] = useState<string>('from-red-600 to-rose-800');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (editingCard) {
      setName(editingCard.name);
      setBank(editingCard.bank);
      setCardLast4(editingCard.cardLast4);
      setCurrency(editingCard.currency);
      setCreditLimit(editingCard.creditLimit.toString());
      setCutoffDay(editingCard.cutoffDay);
      setPaymentDueDay(editingCard.paymentDueDay);
      setCurrentBalanceUsed(editingCard.currentBalanceUsed.toString());
      setColorTheme(editingCard.colorTheme || 'from-red-600 to-rose-800');
    } else {
      setName('');
      setBank('BAC Credomatic');
      setCardLast4('');
      setCurrency('CRC');
      setCreditLimit('1000000');
      setCutoffDay(16);
      setPaymentDueDay(6);
      setCurrentBalanceUsed('0');
      setColorTheme('from-red-600 to-rose-800');
    }
    setError('');
  }, [isOpen, editingCard]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !bank.trim()) {
      setError('Por favor ingresa el nombre de la tarjeta y el banco');
      return;
    }

    const limitNum = parseFloat(creditLimit);
    const balanceNum = parseFloat(currentBalanceUsed) || 0;

    if (isNaN(limitNum) || limitNum <= 0) {
      setError('Por favor ingresa un límite de crédito válido');
      return;
    }

    const cardData = {
      name: name.trim(),
      bank: bank.trim(),
      cardLast4: (cardLast4.trim().replace(/\D/g, '').slice(-4)) || '0000',
      currency,
      creditLimit: limitNum,
      cutoffDay: Math.min(31, Math.max(1, cutoffDay)),
      paymentDueDay: Math.min(31, Math.max(1, paymentDueDay)),
      currentBalanceUsed: balanceNum,
      colorTheme,
    };

    if (editingCard) {
      updateCreditCard(editingCard.id, cardData);
    } else {
      addCreditCard(cardData);
    }

    onClose();
  };

  const handleDelete = () => {
    if (editingCard && confirm(`¿Deseas eliminar la tarjeta ${editingCard.name}?`)) {
      deleteCreditCard(editingCard.id);
      onClose();
    }
  };

  return (
    <div id="modal-backdrop-card" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        id="modal-card"
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
              <CardIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {editingCard ? 'Editar Tarjeta de Crédito' : 'Nueva Tarjeta de Crédito'}
              </h2>
              <p className="text-xs text-slate-500">Configura límites, fechas de corte y pagos</p>
            </div>
          </div>
          <button
            id="btn-close-card-modal"
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

          {/* Visual Card Preview */}
          <div className={`p-4 rounded-xl text-white bg-gradient-to-r ${colorTheme} shadow-md space-y-3`}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs uppercase tracking-wider opacity-80">{bank || 'Banco'}</p>
                <p className="text-sm font-bold">{name || 'Nombre de la Tarjeta'}</p>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-xs">
                {currency}
              </span>
            </div>
            <div className="flex justify-between items-end pt-2">
              <p className="font-mono text-sm tracking-widest">•••• •••• •••• {cardLast4 || 'XXXX'}</p>
              <div className="text-right text-[11px] opacity-80">
                <p>Corte: día {cutoffDay} | Pago: día {paymentDueDay}</p>
              </div>
            </div>
          </div>

          {/* Bank & Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Banco Emisor
              </label>
              <input
                type="text"
                id="input-card-bank"
                placeholder="Ej. BAC Credomatic, BN, Promerica"
                value={bank}
                onChange={(e) => setBank(e.target.value)}
                required
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:border-indigo-500 focus:bg-white outline-hidden"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Nombre de la Tarjeta
              </label>
              <input
                type="text"
                id="input-card-name"
                placeholder="Ej. Cashback Visa, Premia USD"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:border-indigo-500 focus:bg-white outline-hidden"
              />
            </div>
          </div>

          {/* Currency & Last 4 digits */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Moneda de la Tarjeta
              </label>
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  id="btn-card-currency-crc"
                  onClick={() => setCurrency('CRC')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    currency === 'CRC' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Colones (₡ CRC)
                </button>
                <button
                  type="button"
                  id="btn-card-currency-usd"
                  onClick={() => setCurrency('USD')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    currency === 'USD' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Dólares ($ USD)
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Últimos 4 Dígitos
              </label>
              <input
                type="text"
                id="input-card-last4"
                maxLength={4}
                placeholder="Ej. 4512"
                value={cardLast4}
                onChange={(e) => setCardLast4(e.target.value.replace(/\D/g, ''))}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-800 focus:border-indigo-500 focus:bg-white outline-hidden"
              />
            </div>
          </div>

          {/* Credit Limit & Current Balance Used */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Límite de Crédito ({currency})
              </label>
              <input
                type="number"
                id="input-card-limit"
                value={creditLimit}
                onChange={(e) => setCreditLimit(e.target.value)}
                required
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:border-indigo-500 focus:bg-white outline-hidden"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Saldo Usado Actual ({currency})
              </label>
              <input
                type="number"
                id="input-card-balance"
                value={currentBalanceUsed}
                onChange={(e) => setCurrentBalanceUsed(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-rose-600 focus:border-indigo-500 focus:bg-white outline-hidden"
              />
            </div>
          </div>

          {/* Cutoff and Payment Due Days */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Día de Corte Mensual (1 - 31)
              </label>
              <input
                type="number"
                min={1}
                max={31}
                id="input-card-cutoff"
                value={cutoffDay}
                onChange={(e) => setCutoffDay(parseInt(e.target.value) || 1)}
                required
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:border-indigo-500 focus:bg-white outline-hidden"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Día Límite de Pago (1 - 31)
              </label>
              <input
                type="number"
                min={1}
                max={31}
                id="input-card-due"
                value={paymentDueDay}
                onChange={(e) => setPaymentDueDay(parseInt(e.target.value) || 1)}
                required
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:border-indigo-500 focus:bg-white outline-hidden"
              />
            </div>
          </div>

          {/* Color theme selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Color y Estilo de Tarjeta
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CARD_THEMES.map((theme) => (
                <button
                  key={theme.value}
                  type="button"
                  onClick={() => setColorTheme(theme.value)}
                  className={`h-8 rounded-lg bg-gradient-to-r ${theme.value} text-[11px] font-medium text-white flex items-center justify-center transition-all ${
                    colorTheme === theme.value ? 'ring-2 ring-indigo-500 ring-offset-2 scale-102' : 'opacity-85 hover:opacity-100'
                  }`}
                >
                  {theme.label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-between border-t border-slate-100">
            {editingCard ? (
              <button
                type="button"
                id="btn-delete-card"
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
                id="btn-cancel-card"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                id="btn-save-card"
                className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 active:scale-98 rounded-xl shadow-md transition-all"
              >
                {editingCard ? 'Guardar Cambios' : 'Añadir Tarjeta'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
