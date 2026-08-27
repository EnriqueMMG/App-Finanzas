import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  Plus,
  Trash2,
  Edit2,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard as CardIcon,
  Calendar,
  X,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { Transaction, TransactionType, PaymentMethodType } from '../types';
import { formatCurrency } from '../utils/currency';
import { exportTransactionsToCSV } from '../utils/export';
import { CategoryIcon } from './CategoryIcon';

interface TransactionsViewProps {
  onOpenNewTx: () => void;
  onEditTx: (tx: Transaction) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({ onOpenNewTx, onEditTx }) => {
  const {
    transactions,
    categories,
    creditCards,
    mainAccount,
    deleteTransaction,
    displayCurrency,
    exchangeRate,
  } = useFinance();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterAccount, setFilterAccount] = useState<string>('ALL');
  const [dateRange, setDateRange] = useState<string>('ALL'); // ALL, THIS_MONTH, LAST_MONTH, YEAR

  const now = new Date();
  const currentYM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevYM = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;
  const currentYearStr = `${now.getFullYear()}`;

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const descMatch = tx.description.toLowerCase().includes(term);
        const cat = categories.find((c) => c.id === tx.categoryId);
        const catMatch = cat ? cat.name.toLowerCase().includes(term) : false;
        if (!descMatch && !catMatch) return false;
      }

      // Filter Type
      if (filterType !== 'ALL' && tx.type !== filterType) {
        return false;
      }

      // Filter Category
      if (filterCategory !== 'ALL' && tx.categoryId !== filterCategory) {
        return false;
      }

      // Filter Account
      if (filterAccount !== 'ALL') {
        if (filterAccount === 'main') {
          if (tx.sourceType !== 'MAIN_ACCOUNT') return false;
        } else {
          if (tx.sourceId !== filterAccount && tx.targetCardId !== filterAccount) return false;
        }
      }

      // Date Range
      if (dateRange === 'THIS_MONTH') {
        if (!tx.date.startsWith(currentYM)) return false;
      } else if (dateRange === 'LAST_MONTH') {
        if (!tx.date.startsWith(prevYM)) return false;
      } else if (dateRange === 'YEAR') {
        if (!tx.date.startsWith(currentYearStr)) return false;
      }

      return true;
    });
  }, [
    transactions,
    searchTerm,
    filterType,
    filterCategory,
    filterAccount,
    dateRange,
    categories,
    currentYM,
    prevYM,
    currentYearStr,
  ]);

  // Totals of filtered transactions
  const totals = useMemo(() => {
    let incomeCRC = 0;
    let expenseCRC = 0;

    filteredTransactions.forEach((tx) => {
      const amtCRC = tx.currency === 'CRC' ? tx.amount : tx.amount * exchangeRate.usdToCrc;
      if (tx.type === 'INCOME') incomeCRC += amtCRC;
      if (tx.type === 'EXPENSE') expenseCRC += amtCRC;
    });

    return {
      incomeCRC,
      expenseCRC,
      balanceCRC: incomeCRC - expenseCRC,
    };
  }, [filteredTransactions, exchangeRate.usdToCrc]);

  const handleExport = () => {
    exportTransactionsToCSV(filteredTransactions, categories, creditCards, mainAccount);
  };

  return (
    <div id="view-transactions" className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Movimientos y Registro
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Consulta, filtra, edita y exporta tus ingresos y gastos
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-export-csv"
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 shadow-2xs transition-all"
            title="Exportar a CSV / Excel"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Exportar CSV</span>
          </button>

          <button
            id="btn-new-tx-view"
            onClick={onOpenNewTx}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Movimiento</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              id="input-search-tx"
              placeholder="Buscar por descripción o categoría (ej. automercado, salario)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-emerald-500 outline-hidden transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Period Selector */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
            {[
              { id: 'ALL', label: 'Todo' },
              { id: 'THIS_MONTH', label: 'Este Mes' },
              { id: 'LAST_MONTH', label: 'Mes Pasado' },
              { id: 'YEAR', label: 'Año' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setDateRange(p.id)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  dateRange === p.id ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
          {/* Type Filter */}
          <div>
            <select
              id="select-filter-type"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 outline-hidden"
            >
              <option value="ALL">Todos los Tipos (Ingresos, Gastos, Pagos)</option>
              <option value="EXPENSE">Solo Gastos</option>
              <option value="INCOME">Solo Ingresos</option>
              <option value="CARD_PAYMENT">Solo Pagos de Tarjeta</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              id="select-filter-category"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 outline-hidden"
            >
              <option value="ALL">Todas las Categorías</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Account Filter */}
          <div>
            <select
              id="select-filter-account"
              value={filterAccount}
              onChange={(e) => setFilterAccount(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 outline-hidden"
            >
              <option value="ALL">Todas las Cuentas & Tarjetas</option>
              <option value="main">Cuenta Principal (SINPE / Efectivo)</option>
              {creditCards.map((card) => (
                <option key={card.id} value={card.id}>
                  {card.bank} - {card.name} (•••• {card.cardLast4})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Filtered Summary Header */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-100/70 rounded-2xl border border-slate-200 text-center">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-500">Ingresos Filtrados</span>
          <p className="text-sm font-extrabold text-emerald-600 font-mono-num">
            + {formatCurrency(
              displayCurrency === 'CRC' ? totals.incomeCRC : totals.incomeCRC / exchangeRate.usdToCrc,
              displayCurrency
            )}
          </p>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-500">Gastos Filtrados</span>
          <p className="text-sm font-extrabold text-rose-600 font-mono-num">
            - {formatCurrency(
              displayCurrency === 'CRC' ? totals.expenseCRC : totals.expenseCRC / exchangeRate.usdToCrc,
              displayCurrency
            )}
          </p>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-500">Balance Neto</span>
          <p className={`text-sm font-extrabold font-mono-num ${totals.balanceCRC >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
            {formatCurrency(
              displayCurrency === 'CRC' ? totals.balanceCRC : totals.balanceCRC / exchangeRate.usdToCrc,
              displayCurrency
            )}
          </p>
        </div>
      </div>

      {/* Transactions Table / List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <p className="text-sm font-bold text-slate-700">No se encontraron movimientos</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Intenta cambiar los filtros de búsqueda o registra un nuevo movimiento.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredTransactions.map((tx) => {
              const isIncome = tx.type === 'INCOME';
              const isPayment = tx.type === 'CARD_PAYMENT';
              const category = categories.find((c) => c.id === tx.categoryId);

              let accountName = 'Cuenta Principal (SINPE)';
              if (tx.sourceType === 'CREDIT_CARD') {
                const c = creditCards.find((card) => card.id === tx.sourceId);
                accountName = c ? `${c.bank} (${c.name})` : 'Tarjeta de Crédito';
              }
              if (isPayment && tx.targetCardId) {
                const targetC = creditCards.find((c) => c.id === tx.targetCardId);
                accountName = `Pago a: ${targetC ? targetC.name : 'Tarjeta'}`;
              }

              return (
                <div
                  key={tx.id}
                  id={`tx-row-${tx.id}`}
                  className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isIncome
                          ? 'bg-emerald-100 text-emerald-700'
                          : isPayment
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-rose-50 text-rose-600'
                      }`}
                    >
                      {isIncome ? (
                        <ArrowUpRight className="w-5 h-5" />
                      ) : isPayment ? (
                        <CardIcon className="w-5 h-5" />
                      ) : (
                        <CategoryIcon name={category?.icon || 'Tag'} className="w-5 h-5" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">
                        {tx.description || (isIncome ? 'Ingreso registrado' : 'Gasto registrado')}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span className="font-medium text-slate-600">{tx.date}</span>
                        <span>•</span>
                        <span className="text-slate-600">{accountName}</span>
                        {category && (
                          <>
                            <span>•</span>
                            <span
                              className="px-2 py-0.2 rounded-full text-[11px] font-semibold"
                              style={{ backgroundColor: `${category.color}15`, color: category.color }}
                            >
                              {category.name}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <p
                        className={`text-base font-extrabold font-mono-num ${
                          isIncome
                            ? 'text-emerald-600'
                            : isPayment
                            ? 'text-indigo-600'
                            : 'text-slate-900'
                        }`}
                      >
                        {isIncome ? '+' : '-'} {formatCurrency(tx.amount, tx.currency)}
                      </p>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">
                        {tx.currency}
                      </span>
                    </div>

                    {/* Action buttons (Edit / Delete) */}
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        id={`btn-edit-tx-${tx.id}`}
                        onClick={() => onEditTx(tx)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Editar movimiento"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        id={`btn-delete-tx-${tx.id}`}
                        onClick={() => {
                          if (confirm('¿Deseas eliminar este movimiento? Los saldos se ajustarán automáticamente.')) {
                            deleteTransaction(tx.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Eliminar movimiento"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
