import React, { useState, useEffect } from 'react';
import { X, CreditCard as CardIcon, CheckCircle2, ArrowRight } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { CreditCard } from '../../types';
import { formatCurrency } from '../../utils/currency';

interface CardPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: CreditCard | null;
}

export const CardPaymentModal: React.FC<CardPaymentModalProps> = ({ isOpen, onClose, card }) => {
  const { payCreditCard, mainAccount, exchangeRate } = useFinance();
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (card) {
      setAmount(card.currentBalanceUsed.toString());
      setDate(new Date().toISOString().split('T')[0]);
      setNote(`Pago total tarjeta ${card.bank} (${card.name})`);
    }
    setError('');
  }, [card, isOpen]);

  if (!isOpen || !card) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Por favor ingresa un monto válido');
      return;
    }

    payCreditCard(card.id, numAmount, card.currency, date, note);
    onClose();
  };

  const setTotalPayment = () => {
    setAmount(card.currentBalanceUsed.toString());
    setNote(`Pago total ${card.bank} ${card.name}`);
  };

  const setMinPayment = () => {
    const minEstimated = Math.max(15000, Math.round(card.currentBalanceUsed * 0.05));
    setAmount(minEstimated.toString());
    setNote(`Pago mínimo estimado ${card.bank} ${card.name}`);
  };

  return (
    <div id="modal-backdrop-card-pay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        id="modal-card-pay"
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <CardIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Pagar Tarjeta de Crédito</h2>
              <p className="text-xs text-slate-500">Desde Cuenta Principal (SINPE / Efectivo)</p>
            </div>
          </div>
          <button
            id="btn-close-pay-modal"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">
              {error}
            </div>
          )}

          {/* Card Summary Badge */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">{card.bank} • {card.name}</span>
              <span className="text-xs font-mono font-bold text-slate-900">•••• {card.cardLast4}</span>
            </div>
            <div className="flex items-baseline justify-between pt-1 border-t border-slate-200/60">
              <span className="text-xs text-slate-500">Saldo actual usado:</span>
              <span className="text-sm font-bold text-rose-600">
                {formatCurrency(card.currentBalanceUsed, card.currency)}
              </span>
            </div>
            <div className="flex items-baseline justify-between text-xs text-slate-500">
              <span>Saldo disponible en cuenta:</span>
              <span className="font-semibold text-slate-700">
                {card.currency === 'CRC'
                  ? formatCurrency(mainAccount.balanceCRC, 'CRC')
                  : formatCurrency(mainAccount.balanceUSD, 'USD')}
              </span>
            </div>
          </div>

          {/* Quick Pay Buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              id="btn-pay-total"
              onClick={setTotalPayment}
              className="flex-1 py-1.5 px-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg text-xs font-bold text-indigo-700 transition-colors text-center"
            >
              Pagar Todo ({formatCurrency(card.currentBalanceUsed, card.currency)})
            </button>
            <button
              type="button"
              id="btn-pay-min"
              onClick={setMinPayment}
              className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition-colors text-center"
            >
              Pago Parcial (5%)
            </button>
          </div>

          {/* Amount input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Monto a abonar ({card.currency})
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                {card.currency === 'CRC' ? '₡' : '$'}
              </span>
              <input
                type="number"
                step="any"
                id="input-card-pay-amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl text-base font-bold text-slate-900 outline-hidden transition-all"
              />
            </div>
            {amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0 && (
              <p className="text-[11px] text-slate-500 font-mono-num pl-1 pt-0.5">
                {card.currency === 'USD' ? (
                  <>
                    ≈ <strong className="text-slate-800">₡{Math.round(parseFloat(amount) * exchangeRate.usdToCrc).toLocaleString('es-CR')}</strong> debitados en Colones (T.C: ₡{exchangeRate.usdToCrc})
                  </>
                ) : (
                  <>
                    ≈ <strong className="text-slate-800">${(parseFloat(amount) / exchangeRate.usdToCrc).toFixed(2)}</strong> USD (T.C: ₡{exchangeRate.usdToCrc})
                  </>
                )}
              </p>
            )}
          </div>

          {/* Date & Note */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Fecha de pago
              </label>
              <input
                type="date"
                id="input-card-pay-date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:border-indigo-500 focus:bg-white outline-hidden"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Nota / Detalle
              </label>
              <input
                type="text"
                id="input-card-pay-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:border-indigo-500 focus:bg-white outline-hidden"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              id="btn-cancel-card-pay"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              id="btn-confirm-card-pay"
              className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Confirmar Pago
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
