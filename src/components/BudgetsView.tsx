import React from 'react';
import {
  PieChart,
  Plus,
  Edit2,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Tag,
  Sparkles,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, getCurrentYearMonth } from '../utils/currency';
import { Category, Budget } from '../types';
import { CategoryIcon } from './CategoryIcon';

interface BudgetsViewProps {
  onOpenNewCategory: () => void;
  onEditCategory: (cat: Category) => void;
}

export const BudgetsView: React.FC<BudgetsViewProps> = ({
  onOpenNewCategory,
  onEditCategory,
}) => {
  const {
    categories,
    budgets,
    transactions,
    displayCurrency,
    exchangeRate,
  } = useFinance();

  const currentYM = getCurrentYearMonth();

  // Calculate expenses this month per category
  const currentMonthExpenses = transactions.filter(
    (t) => t.type === 'EXPENSE' && t.date.startsWith(currentYM) && t.categoryId
  );

  const spentPerCategoryCRC: Record<string, number> = {};
  currentMonthExpenses.forEach((t) => {
    if (!t.categoryId) return;
    const amtCRC = t.currency === 'CRC' ? t.amount : t.amount * exchangeRate.usdToCrc;
    spentPerCategoryCRC[t.categoryId] = (spentPerCategoryCRC[t.categoryId] || 0) + amtCRC;
  });

  const totalBudgetedCRC = budgets.reduce((acc, b) => acc + b.monthlyLimitCRC, 0);
  const totalSpentInBudgetedCRC = Object.values(spentPerCategoryCRC).reduce((a, b) => a + b, 0);

  return (
    <div id="view-budgets" className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Presupuestos por Categoría
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Define límites mensuales por categoría y controla tus gastos con alertas de sobregiro
          </p>
        </div>

        <button
          id="btn-add-category"
          onClick={onOpenNewCategory}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Categoría</span>
        </button>
      </div>

      {/* Global Budget Overview Card */}
      <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Presupuesto Mensual Total
          </p>
          <h3 className="text-2xl font-black text-slate-900 font-mono-num">
            {formatCurrency(
              displayCurrency === 'CRC' ? totalBudgetedCRC : totalBudgetedCRC / exchangeRate.usdToCrc,
              displayCurrency
            )}
          </h3>
          <p className="text-xs text-slate-500">
            Gastado en el mes: <strong className="text-slate-800">{formatCurrency(displayCurrency === 'CRC' ? totalSpentInBudgetedCRC : totalSpentInBudgetedCRC / exchangeRate.usdToCrc, displayCurrency)}</strong>
          </p>
        </div>

        <div className="w-full sm:w-64 space-y-1.5">
          <div className="flex justify-between text-xs font-bold text-slate-700">
            <span>Progreso General</span>
            <span>{totalBudgetedCRC > 0 ? Math.round((totalSpentInBudgetedCRC / totalBudgetedCRC) * 100) : 0}%</span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                totalSpentInBudgetedCRC > totalBudgetedCRC
                  ? 'bg-rose-500'
                  : (totalSpentInBudgetedCRC / (totalBudgetedCRC || 1)) > 0.8
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{
                width: `${Math.min(100, totalBudgetedCRC > 0 ? (totalSpentInBudgetedCRC / totalBudgetedCRC) * 100 : 0)}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Categories & Budgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const budget = budgets.find((b) => b.categoryId === cat.id);
          const limitCRC = budget ? budget.monthlyLimitCRC : 0;
          const spentCRC = spentPerCategoryCRC[cat.id] || 0;
          const hasBudget = limitCRC > 0;
          const percentage = hasBudget ? Math.round((spentCRC / limitCRC) * 100) : 0;
          const isOver = hasBudget && spentCRC > limitCRC;
          const isNear = hasBudget && !isOver && percentage >= 80;

          return (
            <div
              key={cat.id}
              id={`cat-budget-card-${cat.id}`}
              className={`p-5 rounded-2xl bg-white border transition-all shadow-xs hover:shadow-md flex flex-col justify-between space-y-4 ${
                isOver
                  ? 'border-rose-300 bg-rose-50/20 ring-1 ring-rose-200'
                  : isNear
                  ? 'border-amber-300 bg-amber-50/20'
                  : 'border-slate-200/80'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-2xs"
                      style={{ backgroundColor: cat.color }}
                    >
                      <CategoryIcon name={cat.icon} className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{cat.name}</h3>
                      <p className="text-xs text-slate-500">
                        {hasBudget ? 'Con presupuesto activo' : 'Sin límite definido'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onEditCategory(cat)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Editar categoría o límite"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Spent vs Budget */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Gastado este mes</span>
                      <p className="text-base font-extrabold text-slate-900 font-mono-num">
                        {formatCurrency(
                          displayCurrency === 'CRC' ? spentCRC : spentCRC / exchangeRate.usdToCrc,
                          displayCurrency
                        )}
                      </p>
                    </div>

                    {hasBudget && (
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Límite mensual</span>
                        <p className="text-xs font-bold text-slate-600 font-mono-num">
                          {formatCurrency(
                            displayCurrency === 'CRC' ? limitCRC : limitCRC / exchangeRate.usdToCrc,
                            displayCurrency
                          )}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Progress Bar & Alert state */}
                  {hasBudget ? (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span
                          className={`font-bold ${
                            isOver ? 'text-rose-600' : isNear ? 'text-amber-600' : 'text-emerald-600'
                          }`}
                        >
                          {percentage}% usado {isOver ? '• ¡Límite excedido!' : isNear ? '• Cerca del límite' : ''}
                        </span>
                        <span className="text-slate-400">
                          {isOver
                            ? `+${formatCurrency(
                                displayCurrency === 'CRC'
                                  ? spentCRC - limitCRC
                                  : (spentCRC - limitCRC) / exchangeRate.usdToCrc,
                                displayCurrency
                              )} excedido`
                            : `${formatCurrency(
                                displayCurrency === 'CRC'
                                  ? limitCRC - spentCRC
                                  : (limitCRC - spentCRC) / exchangeRate.usdToCrc,
                                displayCurrency
                              )} restante`}
                        </span>
                      </div>

                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isOver ? 'bg-rose-500' : isNear ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, percentage)}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => onEditCategory(cat)}
                      className="w-full py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 text-center transition-colors"
                    >
                      + Definir límite de presupuesto
                    </button>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>{currentMonthExpenses.filter(t => t.categoryId === cat.id).length} gastos este mes</span>
                <span className="text-[11px] font-mono" style={{ color: cat.color }}>● Activa</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
