import React, { useState } from 'react';
import {
  Wallet,
  CreditCard as CardIcon,
  Plus,
  ArrowRight,
  ShieldCheck,
  Edit2,
  Trash2,
  Calendar,
  AlertCircle,
  TrendingDown,
  Sparkles,
  Layers,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/currency';
import { CreditCard } from '../types';

interface AccountsViewProps {
  onOpenAddCard: () => void;
  onEditCard: (card: CreditCard) => void;
  onOpenCardPay: (card: CreditCard) => void;
  onOpenNewTx: () => void;
}

export const AccountsView: React.FC<AccountsViewProps> = ({
  onOpenAddCard,
  onEditCard,
  onOpenCardPay,
  onOpenNewTx,
}) => {
  const {
    mainAccount,
    updateMainAccount,
    creditCards,
    deleteCreditCard,
    displayCurrency,
    exchangeRate,
    transactions,
  } = useFinance();

  const [isEditingMainBalance, setIsEditingMainBalance] = useState(false);
  const [newCrcBalance, setNewCrcBalance] = useState(mainAccount.balanceCRC.toString());
  const [newUsdBalance, setNewUsdBalance] = useState(mainAccount.balanceUSD.toString());

  const handleSaveMainAccount = (e: React.FormEvent) => {
    e.preventDefault();
    updateMainAccount({
      balanceCRC: parseFloat(newCrcBalance) || 0,
      balanceUSD: parseFloat(newUsdBalance) || 0,
    });
    setIsEditingMainBalance(false);
  };

  const totalCardsDebtCRC = creditCards.reduce((acc, c) => {
    const debt = c.currency === 'CRC' ? c.currentBalanceUsed : c.currentBalanceUsed * exchangeRate.usdToCrc;
    return acc + debt;
  }, 0);

  const totalCreditLimitCRC = creditCards.reduce((acc, c) => {
    const limit = c.currency === 'CRC' ? c.creditLimit : c.creditLimit * exchangeRate.usdToCrc;
    return acc + limit;
  }, 0);

  return (
    <div id="view-accounts" className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Cuentas & Tarjetas de Crédito
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Administra tu cuenta principal, efectivo, transferencias SINPE y tarjetas bancarias
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-add-new-card"
            onClick={onOpenAddCard}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Tarjeta</span>
          </button>
        </div>
      </div>

      {/* 1. SECCIÓN: CUENTA PRINCIPAL (EFECTIVO / SINPE MÓVIL / SALARIOS) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-600" />
            <span>Cuenta Principal (Ingresos & SINPE)</span>
          </h2>
          <button
            onClick={() => {
              setNewCrcBalance(mainAccount.balanceCRC.toString());
              setNewUsdBalance(mainAccount.balanceUSD.toString());
              setIsEditingMainBalance(!isEditingMainBalance);
            }}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 underline cursor-pointer"
          >
            {isEditingMainBalance ? 'Cancelar edición' : 'Ajustar saldo inicial'}
          </button>
        </div>

        {isEditingMainBalance ? (
          <form
            onSubmit={handleSaveMainAccount}
            className="p-5 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-4 animate-in fade-in duration-150"
          >
            <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
              Ajustar saldo de Cuenta Principal
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Saldo en Colones (₡ CRC)
                </label>
                <input
                  type="number"
                  step="any"
                  value={newCrcBalance}
                  onChange={(e) => setNewCrcBalance(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Saldo en Dólares ($ USD)
                </label>
                <input
                  type="number"
                  step="any"
                  value={newUsdBalance}
                  onChange={(e) => setNewUsdBalance(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditingMainBalance(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs"
              >
                Guardar Saldo
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/50">
                  Colones Costarricenses
                </span>
                <h3 className="text-2xl font-black text-slate-900 mt-2 font-mono-num">
                  ₡{mainAccount.balanceCRC.toLocaleString('es-CR')}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Disponible para transferencias SINPE y pagos de tarjeta
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-extrabold text-xl">
                ₡
              </div>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/50">
                  Dólares Americanos
                </span>
                <h3 className="text-2xl font-black text-slate-900 mt-2 font-mono-num">
                  ${mainAccount.balanceUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  ≈ ₡{(mainAccount.balanceUSD * exchangeRate.usdToCrc).toLocaleString('es-CR')} (T.C: ₡{exchangeRate.usdToCrc})
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-extrabold text-xl">
                $
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. SECCIÓN: TARJETAS DE CRÉDITO */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CardIcon className="w-5 h-5 text-indigo-600" />
              <span>Tarjetas de Crédito Registradas ({creditCards.length})</span>
            </h2>
            <p className="text-xs text-slate-500">
              Límite total combinado: <strong className="text-slate-800 font-mono-num">{formatCurrency(displayCurrency === 'CRC' ? totalCreditLimitCRC : totalCreditLimitCRC / exchangeRate.usdToCrc, displayCurrency)}</strong> • Deuda usada: <strong className="text-rose-600 font-mono-num">{formatCurrency(displayCurrency === 'CRC' ? totalCardsDebtCRC : totalCardsDebtCRC / exchangeRate.usdToCrc, displayCurrency)}</strong>
            </p>
          </div>
        </div>

        {creditCards.length === 0 ? (
          <div className="p-8 bg-white border border-slate-200 rounded-2xl text-center space-y-3">
            <p className="text-sm font-bold text-slate-700">No tienes tarjetas registradas</p>
            <button
              onClick={onOpenAddCard}
              className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl"
            >
              Registrar mi primera tarjeta
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {creditCards.map((card) => {
              const usagePercent = Math.min(100, Math.round((card.currentBalanceUsed / card.creditLimit) * 100));
              const available = Math.max(0, card.creditLimit - card.currentBalanceUsed);

              return (
                <div
                  key={card.id}
                  id={`card-full-${card.id}`}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
                >
                  {/* Card Visual Header Banner */}
                  <div className={`p-4 bg-gradient-to-r ${card.colorTheme} text-white space-y-3`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[10px] uppercase font-bold tracking-wider opacity-85">{card.bank}</p>
                        <h3 className="text-sm font-bold truncate max-w-[200px]">{card.name}</h3>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onEditCard(card)}
                          className="p-1 rounded-lg bg-black/20 hover:bg-black/40 text-white transition-colors"
                          title="Editar tarjeta"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`¿Deseas eliminar la tarjeta ${card.name} (${card.bank})?`)) {
                              deleteCreditCard(card.id);
                            }
                          }}
                          className="p-1 rounded-lg bg-black/20 hover:bg-rose-600/90 text-white transition-colors"
                          title="Eliminar tarjeta"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20">
                          {card.currency}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 flex items-baseline justify-between">
                      <p className="font-mono text-sm tracking-widest opacity-95">•••• •••• •••• {card.cardLast4}</p>
                    </div>
                  </div>

                  {/* Card Body Details */}
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-baseline justify-between">
                        <div>
                          <span className="text-xs font-semibold text-slate-500">Saldo Usado (Deuda):</span>
                          {card.currency === 'USD' && (
                            <p className="text-[11px] text-slate-500 font-mono-num">
                              ≈ ₡{Math.round(card.currentBalanceUsed * exchangeRate.usdToCrc).toLocaleString('es-CR')}
                            </p>
                          )}
                          {card.currency === 'CRC' && displayCurrency === 'USD' && (
                            <p className="text-[11px] text-slate-500 font-mono-num">
                              ≈ ${(card.currentBalanceUsed / exchangeRate.usdToCrc).toFixed(2)} USD
                            </p>
                          )}
                        </div>
                        <span className="text-lg font-black text-rose-600 font-mono-num">
                          {formatCurrency(card.currentBalanceUsed, card.currency)}
                        </span>
                      </div>

                      {/* Usage Bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span>Uso del límite: {usagePercent}%</span>
                          <span title={`Límite: ${formatCurrency(card.creditLimit, card.currency)}`}>
                            Disp: {formatCurrency(available, card.currency)}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              usagePercent > 80 ? 'bg-rose-500' : usagePercent > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${usagePercent}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono-num pt-0.5">
                          <span>Límite total: {formatCurrency(card.creditLimit, card.currency)}</span>
                          {card.currency === 'USD' && (
                            <span>≈ ₡{Math.round(card.creditLimit * exchangeRate.usdToCrc).toLocaleString('es-CR')}</span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                        <div className="p-2 bg-slate-50 rounded-xl">
                          <p className="text-[10px] uppercase font-bold text-slate-400">Fecha de Corte</p>
                          <p className="text-xs font-bold text-slate-800 mt-0.5">Día {card.cutoffDay} del mes</p>
                        </div>
                        <div className="p-2 bg-slate-50 rounded-xl">
                          <p className="text-[10px] uppercase font-bold text-slate-400">Fecha Límite Pago</p>
                          <p className="text-xs font-bold text-indigo-700 mt-0.5">Día {card.paymentDueDay} del mes</p>
                        </div>
                      </div>
                    </div>

                    {/* Pay Button Action */}
                    <div className="pt-3 border-t border-slate-100">
                      <button
                        onClick={() => onOpenCardPay(card)}
                        className="w-full py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                      >
                        <Wallet className="w-3.5 h-3.5" />
                        <span>Pagar Tarjeta desde Cuenta Principal</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
