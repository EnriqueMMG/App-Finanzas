import React, { useState, useMemo } from 'react';
import {
  PieChart as PieChartIcon,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Sparkles,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  HelpCircle,
  Layers,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import { useFinance } from '../context/FinanceContext';
import {
  formatCurrency,
  getCurrentYearMonth,
  getMonthName,
  getShortMonthName,
} from '../utils/currency';

export const ReportsView: React.FC = () => {
  const {
    transactions,
    categories,
    creditCards,
    scheduledExpenses,
    projection,
    expectedMonthlyIncomeCRC,
    setExpectedMonthlyIncomeCRC,
    displayCurrency,
    exchangeRate,
  } = useFinance();

  const now = new Date();
  const currentYM = getCurrentYearMonth();
  const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevYM = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;

  const [selectedMonth, setSelectedMonth] = useState<string>(currentYM);

  // Category Expenses for selected month
  const categoryChartData = useMemo(() => {
    const monthTx = transactions.filter(
      (t) => t.type === 'EXPENSE' && t.date.startsWith(selectedMonth) && t.categoryId
    );

    const map: Record<string, number> = {};
    monthTx.forEach((t) => {
      if (!t.categoryId) return;
      const amtCRC = t.currency === 'CRC' ? t.amount : t.amount * exchangeRate.usdToCrc;
      map[t.categoryId] = (map[t.categoryId] || 0) + amtCRC;
    });

    const total = Object.values(map).reduce((a, b) => a + b, 0);

    return categories
      .map((cat) => {
        const valueCRC = map[cat.id] || 0;
        const valueDisplay = displayCurrency === 'CRC' ? valueCRC : valueCRC / exchangeRate.usdToCrc;
        const percentage = total > 0 ? Math.round((valueCRC / total) * 100) : 0;
        return {
          id: cat.id,
          name: cat.name,
          value: Math.round(valueDisplay),
          valueCRC,
          percentage,
          color: cat.color,
        };
      })
      .filter((c) => c.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [transactions, selectedMonth, categories, displayCurrency, exchangeRate.usdToCrc]);

  // Monthly Comparison (Current vs Previous Month)
  const currentMonthExpensesCRC = transactions
    .filter((t) => t.type === 'EXPENSE' && t.date.startsWith(currentYM))
    .reduce((acc, t) => acc + (t.currency === 'CRC' ? t.amount : t.amount * exchangeRate.usdToCrc), 0);

  const prevMonthExpensesCRC = transactions
    .filter((t) => t.type === 'EXPENSE' && t.date.startsWith(prevYM))
    .reduce((acc, t) => acc + (t.currency === 'CRC' ? t.amount : t.amount * exchangeRate.usdToCrc), 0);

  const expenseDifferenceCRC = currentMonthExpensesCRC - prevMonthExpensesCRC;
  const expensePercentChange =
    prevMonthExpensesCRC > 0
      ? Math.round(((currentMonthExpensesCRC - prevMonthExpensesCRC) / prevMonthExpensesCRC) * 100)
      : 0;

  // Monthly History Bar Chart (Last 6 Months)
  const monthlyHistoryData = useMemo(() => {
    const months: string[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months.push(ym);
    }

    return months.map((ym) => {
      const monthIncomeCRC = transactions
        .filter((t) => t.type === 'INCOME' && t.date.startsWith(ym))
        .reduce((acc, t) => acc + (t.currency === 'CRC' ? t.amount : t.amount * exchangeRate.usdToCrc), 0);

      const monthExpensesCRC = transactions
        .filter((t) => t.type === 'EXPENSE' && t.date.startsWith(ym))
        .reduce((acc, t) => acc + (t.currency === 'CRC' ? t.amount : t.amount * exchangeRate.usdToCrc), 0);

      return {
        monthKey: ym,
        month: getShortMonthName(ym),
        Ingresos: Math.round(
          displayCurrency === 'CRC' ? monthIncomeCRC : monthIncomeCRC / exchangeRate.usdToCrc
        ),
        Gastos: Math.round(
          displayCurrency === 'CRC' ? monthExpensesCRC : monthExpensesCRC / exchangeRate.usdToCrc
        ),
      };
    });
  }, [transactions, displayCurrency, exchangeRate.usdToCrc]);

  return (
    <div id="view-reports" className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Reportes, Análisis & Proyecciones
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Descubre en qué se va tu dinero y planifica tu disponibilidad para el próximo mes
          </p>
        </div>
      </div>

      {/* 1. SECCIÓN: PROYECCIÓN DINERO DISPONIBLE PRÓXIMO MES */}
      <div className="p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl text-white shadow-lg space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Proyección: Dinero Disponible el Próximo Mes
              </h2>
              <p className="text-xs text-slate-300">
                Fórmula: Ingresos esperados − Gastos fijos − Cuotas/Tasa Cero − Pago estimado de tarjetas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white/10 p-1.5 rounded-xl border border-white/10">
            <span className="text-xs text-slate-300 pl-2">Ingreso esperado:</span>
            <input
              type="number"
              value={expectedMonthlyIncomeCRC}
              onChange={(e) => setExpectedMonthlyIncomeCRC(parseFloat(e.target.value) || 0)}
              className="w-32 px-2.5 py-1 text-xs font-bold bg-white text-slate-900 rounded-lg outline-hidden"
            />
            <span className="text-xs font-bold text-emerald-400 pr-2">₡ CRC</span>
          </div>
        </div>

        {/* Big Surplus Stat */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Superávit / Dinero Libre Proyectado
            </p>
            <h3 className="text-3xl sm:text-4xl font-black text-emerald-400 mt-1 font-mono-num">
              {formatCurrency(
                displayCurrency === 'CRC'
                  ? projection.projectedSurplusCRC
                  : projection.projectedSurplusCRC / exchangeRate.usdToCrc,
                displayCurrency
              )}
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Dinero disponible después de cumplir con todos tus compromisos financieros del mes.
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400">Total compromisos fijos:</span>
            <p className="text-lg font-extrabold text-rose-400 font-mono-num">
              - {formatCurrency(
                displayCurrency === 'CRC'
                  ? projection.totalCommittedCRC
                  : projection.totalCommittedCRC / exchangeRate.usdToCrc,
                displayCurrency
              )}
            </p>
          </div>
        </div>

        {/* 4 Pillars Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10">
            <span className="text-[10px] uppercase font-bold text-emerald-400">1. Ingresos Estimados</span>
            <p className="text-base font-extrabold text-white mt-1">
              + {formatCurrency(
                displayCurrency === 'CRC'
                  ? projection.expectedIncomeCRC
                  : projection.expectedIncomeCRC / exchangeRate.usdToCrc,
                displayCurrency
              )}
            </p>
          </div>

          <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10">
            <span className="text-[10px] uppercase font-bold text-slate-300">2. Gastos Fijos</span>
            <p className="text-base font-extrabold text-white mt-1">
              - {formatCurrency(
                displayCurrency === 'CRC'
                  ? projection.fixedExpensesCRC
                  : projection.fixedExpensesCRC / exchangeRate.usdToCrc,
                displayCurrency
              )}
            </p>
          </div>

          <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10">
            <span className="text-[10px] uppercase font-bold text-amber-400">3. Cuotas & Tasa Cero</span>
            <p className="text-base font-extrabold text-white mt-1">
              - {formatCurrency(
                displayCurrency === 'CRC'
                  ? projection.scheduledInstallmentsCRC + projection.loansCRC
                  : (projection.scheduledInstallmentsCRC + projection.loansCRC) / exchangeRate.usdToCrc,
                displayCurrency
              )}
            </p>
          </div>

          <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10">
            <span className="text-[10px] uppercase font-bold text-rose-400">4. Deuda Tarjetas</span>
            <p className="text-base font-extrabold text-white mt-1">
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

      {/* 2. SECCIÓN: ¿EN QUÉ SE VA MÁS EL DINERO? (GRAFICO DE PASTEL / DONUT & BARRAS) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donut Chart & Category Ranking */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">¿En qué se va más el dinero?</h2>
              <p className="text-xs text-slate-500">Distribución de gastos por categoría</p>
            </div>

            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
            >
              <option value={currentYM}>Este Mes ({getMonthName(currentYM)})</option>
              <option value={prevYM}>Mes Pasado ({getMonthName(prevYM)})</option>
            </select>
          </div>

          {categoryChartData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-xs text-slate-400">
              No hay gastos registrados en este período.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {categoryChartData.map((entry) => (
                        <Cell key={`cell-${entry.id}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: number) => [
                        formatCurrency(val, displayCurrency),
                        'Gasto',
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Category Legend & List */}
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {categoryChartData.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-50 border border-slate-100"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                      <span className="font-bold text-slate-800 truncate">{cat.name}</span>
                    </div>
                    <div className="text-right shrink-0 flex items-center gap-2">
                      <span className="font-mono-num font-extrabold text-slate-900">
                        {formatCurrency(cat.value, displayCurrency)}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500 bg-slate-200/80 px-1.5 py-0.5 rounded-md">
                        {cat.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Monthly Comparison Card & Trend */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Comparativa Mensual</h2>
                <p className="text-xs text-slate-500">¿Gastaste más o menos que el mes pasado?</p>
              </div>
            </div>

            {/* Comparison Metric Box */}
            <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Gasto Mes Actual</span>
                  <p className="text-lg font-black text-slate-900 font-mono-num">
                    {formatCurrency(
                      displayCurrency === 'CRC' ? currentMonthExpensesCRC : currentMonthExpensesCRC / exchangeRate.usdToCrc,
                      displayCurrency
                    )}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Gasto Mes Pasado</span>
                  <p className="text-lg font-black text-slate-600 font-mono-num">
                    {formatCurrency(
                      displayCurrency === 'CRC' ? prevMonthExpensesCRC : prevMonthExpensesCRC / exchangeRate.usdToCrc,
                      displayCurrency
                    )}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-600">Variación de gastos:</span>
                <span
                  className={`font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                    expenseDifferenceCRC <= 0
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {expenseDifferenceCRC <= 0 ? (
                    <>
                      <TrendingDown className="w-3.5 h-3.5" />
                      <span>Gastaste {Math.abs(expensePercentChange)}% menos</span>
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>Gastaste {expensePercentChange}% más</span>
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* 6 Month Trend Bar Chart */}
            <div className="mt-4 h-52 w-full">
              <p className="text-xs font-bold text-slate-700 mb-2">Historial Ingresos vs Gastos (Últimos 6 meses)</p>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyHistoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip
                    formatter={(val: number) => [
                      formatCurrency(val, displayCurrency),
                    ]}
                  />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: '10px' }} />
                  <Bar dataKey="Ingresos" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Gastos" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
