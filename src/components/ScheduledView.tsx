import React, { useState } from 'react';
import {
  CalendarClock,
  ShoppingBag,
  Repeat,
  Landmark,
  Plus,
  Edit2,
  CheckCircle2,
  AlertCircle,
  TrendingDown,
  Sparkles,
  Calendar,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/currency';
import { ScheduledExpense, ScheduledType } from '../types';
import { CategoryIcon } from './CategoryIcon';

interface ScheduledViewProps {
  onOpenNewScheduled: () => void;
  onEditScheduled: (item: ScheduledExpense) => void;
}

export const ScheduledView: React.FC<ScheduledViewProps> = ({
  onOpenNewScheduled,
  onEditScheduled,
}) => {
  const {
    scheduledExpenses,
    creditCards,
    categories,
    payScheduledInstallment,
    displayCurrency,
    exchangeRate,
  } = useFinance();

  const [activeSubTab, setActiveSubTab] = useState<'ALL' | 'TASA_CERO' | 'FIXED' | 'LOANS'>('ALL');

  // Filtered items
  const filteredList = scheduledExpenses.filter((item) => {
    if (activeSubTab === 'TASA_CERO') return item.type === 'TASA_CERO';
    if (activeSubTab === 'FIXED') return item.type === 'FIXED_MONTHLY';
    if (activeSubTab === 'LOANS') return item.type === 'LOAN';
    return true;
  });

  // Totals
  const totalMonthlyCommittedCRC = scheduledExpenses
    .filter((s) => s.isActive)
    .reduce((acc, item) => {
      const amtCRC = item.currency === 'CRC' ? item.monthlyAmount : item.monthlyAmount * exchangeRate.usdToCrc;
      return acc + amtCRC;
    }, 0);

  const tasaCeroCount = scheduledExpenses.filter((s) => s.type === 'TASA_CERO' && s.isActive).length;
  const fixedCount = scheduledExpenses.filter((s) => s.type === 'FIXED_MONTHLY' && s.isActive).length;
  const loanCount = scheduledExpenses.filter((s) => s.type === 'LOAN' && s.isActive).length;

  return (
    <div id="view-scheduled" className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Gastos Programados & Cuotas
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Compras a Tasa Cero, suscripciones fijas y préstamos descontados automáticamente
          </p>
        </div>

        <button
          id="btn-add-scheduled"
          onClick={onOpenNewScheduled}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Gasto Programado</span>
        </button>
      </div>

      {/* KPI Cards for Scheduled Commitments */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-[10px] uppercase font-bold text-slate-400">Total Mensual Comprometido</p>
          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1 font-mono-num">
            {formatCurrency(
              displayCurrency === 'CRC' ? totalMonthlyCommittedCRC : totalMonthlyCommittedCRC / exchangeRate.usdToCrc,
              displayCurrency
            )}
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Se resta de tu proyección</p>
        </div>

        <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase font-bold text-emerald-800">Tasa Cero / Cuotas</p>
            <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <h3 className="text-lg font-bold text-emerald-900 mt-1">{tasaCeroCount} activas</h3>
          <p className="text-[11px] text-emerald-700">Sin intereses (BAC, BN)</p>
        </div>

        <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase font-bold text-indigo-800">Gastos Fijos Mensuales</p>
            <Repeat className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <h3 className="text-lg font-bold text-indigo-900 mt-1">{fixedCount} servicios/fijos</h3>
          <p className="text-[11px] text-indigo-700">Alquiler, Luz, Internet</p>
        </div>

        <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase font-bold text-amber-800">Préstamos</p>
            <Landmark className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <h3 className="text-lg font-bold text-amber-900 mt-1">{loanCount} préstamos</h3>
          <p className="text-[11px] text-amber-700">Vehículo / Personal</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 max-w-fit">
        {[
          { id: 'ALL', label: 'Todos' },
          { id: 'TASA_CERO', label: 'Tasa Cero / Cuotas' },
          { id: 'FIXED', label: 'Gastos Fijos' },
          { id: 'LOANS', label: 'Préstamos' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeSubTab === tab.id
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List of Scheduled items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredList.map((item) => {
          const category = categories.find((c) => c.id === item.categoryId);
          const card = creditCards.find((c) => c.id === item.sourceAccountId);
          const sourceLabel = card ? `${card.bank} (${card.name})` : 'Cuenta Principal (SINPE)';

          const isInstallment = item.type === 'TASA_CERO' || item.type === 'LOAN';
          const progressPercent =
            item.totalInstallments && item.paidInstallments !== undefined
              ? Math.round((item.paidInstallments / item.totalInstallments) * 100)
              : 0;

          return (
            <div
              key={item.id}
              id={`sched-card-${item.id}`}
              className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        item.type === 'TASA_CERO'
                          ? 'bg-emerald-100 text-emerald-700'
                          : item.type === 'FIXED_MONTHLY'
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {item.type === 'TASA_CERO' ? (
                        <ShoppingBag className="w-4 h-4" />
                      ) : item.type === 'FIXED_MONTHLY' ? (
                        <Repeat className="w-4 h-4" />
                      ) : (
                        <Landmark className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                      <p className="text-xs text-slate-500">
                        {item.type === 'TASA_CERO'
                          ? 'Tasa Cero'
                          : item.type === 'FIXED_MONTHLY'
                          ? 'Gasto Fijo Recurrente'
                          : 'Préstamo'} • {sourceLabel}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onEditScheduled(item)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Amount & Due Date */}
                <div className="mt-4 flex items-baseline justify-between">
                  <div>
                    <span className="text-[11px] text-slate-500">Cuota mensual:</span>
                    <p className="text-lg font-black text-slate-900 font-mono-num">
                      {formatCurrency(item.monthlyAmount, item.currency)}
                    </p>
                  </div>

                  <div className="text-right text-xs">
                    <span className="text-slate-500">Día de cobro:</span>
                    <p className="font-bold text-slate-800">Día {item.dueDay} del mes</p>
                  </div>
                </div>

                {/* Installment Progress Bar (If Tasa Cero or Loan) */}
                {isInstallment && item.totalInstallments && (
                  <div className="mt-3 space-y-1.5 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">
                        Cuota {item.paidInstallments} de {item.totalInstallments}
                      </span>
                      <span className="text-slate-500 font-medium">
                        {item.remainingInstallments} restantes ({progressPercent}%)
                      </span>
                    </div>

                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Action: Pay / Execute installment */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span
                  className="px-2 py-0.5 rounded-full text-[11px] font-semibold"
                  style={{
                    backgroundColor: `${category?.color || '#10b981'}15`,
                    color: category?.color || '#10b981',
                  }}
                >
                  {category?.name || 'Categoría'}
                </span>

                <button
                  onClick={() => {
                    if (confirm(`¿Registrar el pago de la cuota de este mes para "${item.title}"?`)) {
                      payScheduledInstallment(item.id);
                    }
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-2xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Marcar pagado este mes</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
