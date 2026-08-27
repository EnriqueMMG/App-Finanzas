import React, { useState } from 'react';
import {
  Wallet,
  CreditCard as CardIcon,
  TrendingUp,
  TrendingDown,
  Calendar,
  AlertTriangle,
  ArrowRight,
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  ShieldAlert,
  Clock,
  Sparkles,
  ChevronRight,
  PieChart as PieChartIcon,
  DollarSign,
  CheckCircle,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, convertCurrency, getCurrentYearMonth, getMonthName } from '../utils/currency';
import { CategoryIcon } from './CategoryIcon';
import { CreditCard, Transaction } from '../types';

interface DashboardProps {
  onOpenNewTx: () => void;
  onOpenCardPay: (card: CreditCard) => void;
  onOpenAddCard: () => void;
  onOpenNewScheduled: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onOpenNewTx,
  onOpenCardPay,
  onOpenAddCard,
  onOpenNewScheduled,
}) => {
  const {
    mainAccount,
    creditCards,
    transactions,
    scheduledExpenses,
    categories,
    displayCurrency,
    exchangeRate,
    projection,
    alerts,
    setActiveTab,
    expectedMonthlyIncomeCRC,
    setExpectedMonthlyIncomeCRC,
  } = useFinance();

  const [showProjectionDetails, setShowProjectionDetails] = useState(false);
  const currentYM = getCurrentYearMonth();

  // Current month income & expenses calculations
  const currentMonthTransactions = transactions.filter((t) => t.date.startsWith(currentYM));

  const totalIncomeCurrentMonth = currentMonthTransactions
    .filter((t) => t.type === 'INCOME')
    .reduce((acc, t) => {
      const amtCRC = t.currency === 'CRC' ? t.amount : t.amount * exchangeRate.usdToCrc;
      return acc + amtCRC;
    }, 0);

  const totalExpensesCurrentMonth = currentMonthTransactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((acc, t) => {
      const amtCRC = t.currency === 'CRC' ? t.amount : t.amount * exchangeRate.usdToCrc;
      return acc + amtCRC;
    }, 0);

  const currentMonthBalanceCRC = totalIncomeCurrentMonth - totalExpensesCurrentMonth;

  // Main Account Total in Display Currency
  const mainAccountInDisplayCRC =
    mainAccount.balanceCRC + mainAccount.balanceUSD * exchangeRate.usdToCrc;
  const mainAccountInDisplay =
    displayCurrency === 'CRC'
      ? mainAccountInDisplayCRC
      : mainAccountInDisplayCRC / exchangeRate.usdToCrc;

  // Total Credit Cards Debt in Display Currency
  const totalCardsDebtCRC = creditCards.reduce((acc, card) => {
    const debtCRC = card.currency === 'CRC' ? card.currentBalanceUsed : card.currentBalanceUsed * exchangeRate.usdToCrc;
    return acc + debtCRC;
  }, 0);
  const totalCardsDebtInDisplay =
    displayCurrency === 'CRC'
      ? totalCardsDebtCRC
      : totalCardsDebtCRC / exchangeRate.usdToCrc;

  // Projected next month available in display currency
  const projectedInDisplay =
    displayCurrency === 'CRC'
      ? projection.projectedSurplusCRC
      : projection.projectedSurplusCRC / exchangeRate.usdToCrc;

  // Recent 6 transactions
  const recentTransactions = transactions.slice(0, 6);

  return (
    <div id="view-dashboard" className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Greeting & Quick Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Resumen Financiero
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Período actual: <span className="font-bold text-slate-700 capitalize">{getMonthName(currentYM)}</span>
          </p>
        </div>

        {/* Quick Action Badges */}
        <div className="flex items-center gap-2">
          <button
            id="btn-quick-expense"
            onClick={onOpenNewTx}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Registrar Gasto / SINPE</span>
          </button>
        </div>
      </div>

      {/* Urgent Alerts Banner (if any) */}
      {alerts.filter(a => a.severity === 'danger' || a.severity === 'warning').length > 0 && (
        <div className="p-4 bg-amber-50/80 border border-amber-200/90 rounded-2xl flex items-start gap-3 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <p className="font-bold text-amber-900">
              Atención: Tienes {alerts.filter(a => a.severity === 'danger' || a.severity === 'warning').length} recordatorios pendientes
            </p>
            <p className="text-amber-700 mt-0.5">
              {alerts.find(a => a.severity === 'danger')?.message || alerts.find(a => a.severity === 'warning')?.message}
            </p>
          </div>
          <button
            onClick={() => setActiveTab('accounts')}
            className="text-xs font-bold text-amber-900 hover:underline shrink-0"
          >
            Revisar
          </button>
        </div>
      )}

      {/* Top 3 Core KPI Hero Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Saldo Cuenta Principal */}
        <div
          id="card-kpi-main-account"
          className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/50">
              Efectivo & SINPE
            </span>
          </div>

          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Saldo Cuenta Principal
          </p>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 font-mono-num">
            {formatCurrency(mainAccountInDisplay, displayCurrency)}
          </h3>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>En colones: <strong className="text-slate-700">₡{mainAccount.balanceCRC.toLocaleString('es-CR')}</strong></span>
            <span>En dólares: <strong className="text-slate-700">${mainAccount.balanceUSD}</strong></span>
          </div>
        </div>

        {/* 2. Deuda Total Tarjetas de Crédito */}
        <div
          id="card-kpi-cards-debt"
          className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <CardIcon className="w-5 h-5" />
            </div>
            <button
              onClick={() => setActiveTab('accounts')}
              className="text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-full transition-colors flex items-center gap-1"
            >
              <span>{creditCards.length} tarjetas</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Saldo Usado en Tarjetas
          </p>
          <h3 className="text-2xl sm:text-3xl font-black text-rose-600 mt-1 font-mono-num">
            {formatCurrency(totalCardsDebtInDisplay, displayCurrency)}
          </h3>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              {creditCards.filter(c => c.currentBalanceUsed > 0).length} con saldo pendiente
            </span>
            <button
              onClick={() => setActiveTab('accounts')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
            >
              Pagar tarjetas →
            </button>
          </div>
        </div>

        {/* 3. Dinero Disponible Próximo Mes (Proyección) */}
        <div
          id="card-kpi-projected-surplus"
          className={`p-5 rounded-2xl border shadow-xs hover:shadow-md transition-all relative overflow-hidden ${
            projection.projectedSurplusCRC >= 0
              ? 'bg-gradient-to-br from-slate-900 to-slate-800 text-white border-slate-800'
              : 'bg-gradient-to-br from-rose-900 to-rose-950 text-white border-rose-900'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/15 text-slate-200">
              Proyección Próximo Mes
            </span>
          </div>

          <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Dinero Disponible Estimado
          </p>
          <h3 className="text-2xl sm:text-3xl font-black text-white mt-1 font-mono-num">
            {formatCurrency(projectedInDisplay, displayCurrency)}
          </h3>

          <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
            <span>Ingresos − Fijos − Cuotas − Tarjetas</span>
            <button
              onClick={() => setShowProjectionDetails(!showProjectionDetails)}
              className="text-emerald-400 hover:text-emerald-300 font-bold underline cursor-pointer"
            >
              {showProjectionDetails ? 'Ocultar desglose' : 'Ver desglose'}
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Projection Breakdown Banner */}
      {showProjectionDetails && (
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Fórmula de Cálculo: Dinero Disponible el Próximo Mes
              </h4>
              <p className="text-xs text-slate-500">
                Ingresos esperados − Gastos fijos − Cuotas/Tasa Cero − Pago de tarjetas de crédito
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600">Ingreso esperado (₡):</span>
              <input
                type="number"
                id="input-quick-expected-income"
                value={expectedMonthlyIncomeCRC}
                onChange={(e) => setExpectedMonthlyIncomeCRC(parseFloat(e.target.value) || 0)}
                className="w-32 px-2.5 py-1 text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
              <p className="text-[11px] font-semibold text-emerald-800 uppercase">Ingresos Esperados</p>
              <p className="text-base font-extrabold text-emerald-700 mt-1">
                + {formatCurrency(
                  displayCurrency === 'CRC'
                    ? projection.expectedIncomeCRC
                    : projection.expectedIncomeCRC / exchangeRate.usdToCrc,
                  displayCurrency
                )}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-[11px] font-semibold text-slate-600 uppercase">Gastos Fijos</p>
              <p className="text-base font-bold text-slate-800 mt-1">
                - {formatCurrency(
                  displayCurrency === 'CRC'
                    ? projection.fixedExpensesCRC
                    : projection.fixedExpensesCRC / exchangeRate.usdToCrc,
                  displayCurrency
                )}
              </p>
            </div>

            <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100">
              <p className="text-[11px] font-semibold text-amber-800 uppercase">Cuotas & Tasa Cero</p>
              <p className="text-base font-bold text-amber-700 mt-1">
                - {formatCurrency(
                  displayCurrency === 'CRC'
                    ? projection.scheduledInstallmentsCRC + projection.loansCRC
                    : (projection.scheduledInstallmentsCRC + projection.loansCRC) / exchangeRate.usdToCrc,
                  displayCurrency
                )}
              </p>
            </div>

            <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-100">
              <p className="text-[11px] font-semibold text-rose-800 uppercase">Deuda Tarjetas</p>
              <p className="text-base font-bold text-rose-700 mt-1">
                - {formatCurrency(
                  displayCurrency === 'CRC'
                    ? projection.estimatedCardPaymentsCRC
                    : projection.estimatedCardPaymentsCRC / exchangeRate.usdToCrc,
                  displayCurrency
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Month Summary Bar (Ingresos, Gastos, Balance del Mes Actual) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-100/80 rounded-2xl border border-slate-200/70">
        <div className="flex items-center gap-3 p-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase">Ingresos de este Mes</p>
            <p className="text-base font-extrabold text-slate-900">
              {formatCurrency(
                displayCurrency === 'CRC'
                  ? totalIncomeCurrentMonth
                  : totalIncomeCurrentMonth / exchangeRate.usdToCrc,
                displayCurrency
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-2 border-t sm:border-t-0 sm:border-l border-slate-200">
          <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
            <TrendingDown className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase">Gastos de este Mes</p>
            <p className="text-base font-extrabold text-slate-900">
              {formatCurrency(
                displayCurrency === 'CRC'
                  ? totalExpensesCurrentMonth
                  : totalExpensesCurrentMonth / exchangeRate.usdToCrc,
                displayCurrency
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-2 border-t sm:border-t-0 sm:border-l border-slate-200">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
            <PieChartIcon className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase">Balance Neto Actual</p>
            <p className={`text-base font-extrabold ${currentMonthBalanceCRC >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {formatCurrency(
                displayCurrency === 'CRC'
                  ? currentMonthBalanceCRC
                  : currentMonthBalanceCRC / exchangeRate.usdToCrc,
                displayCurrency
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Credit Cards Carousel / Grid (Tarjetas de Crédito con corte, pago y saldo) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Tus Tarjetas de Crédito</h2>
            <p className="text-xs text-slate-500">
              Control de límites, fecha de corte y fecha de pago
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAddCard}
              className="text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nueva Tarjeta</span>
            </button>
            <button
              onClick={() => setActiveTab('accounts')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
            >
              Ver todas →
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {creditCards.map((card) => {
            const usagePercent = Math.min(100, Math.round((card.currentBalanceUsed / card.creditLimit) * 100));
            const available = Math.max(0, card.creditLimit - card.currentBalanceUsed);

            return (
              <div
                key={card.id}
                id={`card-widget-${card.id}`}
                className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                {/* Mini Card Header */}
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        {card.bank}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900">{card.name}</h3>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-slate-400">
                      •••• {card.cardLast4}
                    </span>
                  </div>

                  {/* Balance details */}
                  <div className="mt-3 space-y-1">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-slate-500">Saldo Usado:</span>
                      <span className="text-base font-extrabold text-rose-600 font-mono-num">
                        {formatCurrency(card.currentBalanceUsed, card.currency)}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between text-xs text-slate-400">
                      <span>Disponible: {formatCurrency(available, card.currency)}</span>
                      <span>Límite: {formatCurrency(card.creditLimit, card.currency)}</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mt-1.5">
                      <div
                        className={`h-full rounded-full transition-all ${
                          usagePercent > 80 ? 'bg-rose-500' : usagePercent > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${usagePercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Footer Dates & Pay Button */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[11px] text-slate-500">
                    <p>Corte: <strong className="text-slate-700">Día {card.cutoffDay}</strong></p>
                    <p>Pago: <strong className="text-slate-700">Día {card.paymentDueDay}</strong></p>
                  </div>

                  <button
                    onClick={() => onOpenCardPay(card)}
                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold border border-indigo-200 transition-colors"
                  >
                    Pagar Tarjeta
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scheduled expenses quick overview & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Transactions */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Movimientos Recientes</h2>
              <p className="text-xs text-slate-500">Ingresos, gastos y pagos registrados</p>
            </div>
            <button
              onClick={() => setActiveTab('transactions')}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-800"
            >
              Ver todos ({transactions.length}) →
            </button>
          </div>

          <div className="space-y-2.5">
            {recentTransactions.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No hay movimientos registrados.</p>
            ) : (
              recentTransactions.map((tx) => {
                const isIncome = tx.type === 'INCOME';
                const isPayment = tx.type === 'CARD_PAYMENT';
                const category = categories.find((c) => c.id === tx.categoryId);

                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-slate-100/80"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isIncome
                            ? 'bg-emerald-100 text-emerald-700'
                            : isPayment
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {isIncome ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : isPayment ? (
                          <CardIcon className="w-4 h-4" />
                        ) : (
                          <CategoryIcon name={category?.icon || 'Tag'} className="w-4 h-4" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {tx.description || (isIncome ? 'Ingreso' : isPayment ? 'Pago Tarjeta' : 'Gasto')}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {tx.date} • {category?.name || (isIncome ? 'Entrada' : isPayment ? 'Pago Tarjeta' : 'Gasto')}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p
                        className={`text-sm font-extrabold font-mono-num ${
                          isIncome
                            ? 'text-emerald-600'
                            : isPayment
                            ? 'text-indigo-600'
                            : 'text-slate-900'
                        }`}
                      >
                        {isIncome ? '+' : '-'} {formatCurrency(tx.amount, tx.currency)}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {tx.sourceType === 'MAIN_ACCOUNT' ? 'Cuenta Principal' : 'Tarjeta'}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 1 Col: Cuotas y Gastos Programados */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Cuotas & Tasa Cero</h2>
                <p className="text-xs text-slate-500">Gastos futuros automatizados</p>
              </div>
              <button
                onClick={onOpenNewScheduled}
                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                title="Añadir cuota o gasto fijo"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5">
              {scheduledExpenses.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 truncate max-w-[150px]">
                      {item.title}
                    </span>
                    <span className="text-xs font-extrabold text-slate-900 font-mono-num">
                      {formatCurrency(item.monthlyAmount, item.currency)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>
                      {item.type === 'TASA_CERO'
                        ? `Cuota ${(item.paidInstallments || 0) + 1}/${item.totalInstallments}`
                        : item.type === 'FIXED_MONTHLY'
                        ? 'Fijo Mensual'
                        : 'Préstamo'}
                    </span>
                    <span>Cobro día {item.dueDay}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={() => setActiveTab('scheduled')}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors text-center"
            >
              Gestionar todos los cobros fijos ({scheduledExpenses.length}) →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
