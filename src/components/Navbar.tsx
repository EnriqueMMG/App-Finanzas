import React from 'react';
import {
  Wallet,
  Bell,
  Plus,
  RefreshCw,
  Sparkles,
  ArrowDownRight,
  CreditCard as CardIcon,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/currency';

interface NavbarProps {
  onOpenNewTx: () => void;
  onOpenFxModal: () => void;
  onOpenAlerts: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenNewTx,
  onOpenFxModal,
  onOpenAlerts,
}) => {
  const {
    displayCurrency,
    setDisplayCurrency,
    exchangeRate,
    alerts,
    mainAccount,
  } = useFinance();

  const unreadAlertsCount = alerts.length;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand & Tagline */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 font-extrabold text-lg">
            ₡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 text-lg tracking-tight">Finanzo</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 hidden sm:inline-block">
                Costa Rica
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Control de Cuentas, Tarjetas & Cuotas
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Exchange Rate Badge */}
          <button
            id="btn-open-fx"
            onClick={onOpenFxModal}
            title="Cambiar tipo de cambio USD/CRC"
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100/80 hover:bg-slate-200/80 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all"
          >
            <span className="text-slate-400 font-normal">T.C:</span>
            <span className="font-mono font-bold text-slate-900">₡{exchangeRate.usdToCrc}</span>
            <RefreshCw className="w-3 h-3 text-slate-400" />
          </button>

          {/* Currency Toggle (CRC / USD) */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              id="btn-toggle-display-crc"
              onClick={() => setDisplayCurrency('CRC')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                displayCurrency === 'CRC'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              ₡ CRC
            </button>
            <button
              id="btn-toggle-display-usd"
              onClick={() => setDisplayCurrency('USD')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                displayCurrency === 'USD'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              $ USD
            </button>
          </div>

          {/* Notifications / Alerts Bell */}
          <button
            id="btn-open-alerts"
            onClick={onOpenAlerts}
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-transparent hover:border-slate-200 transition-colors"
            title="Ver alertas y fechas de pago"
          >
            <Bell className="w-4 h-4" />
            {unreadAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center ring-2 ring-white animate-pulse">
                {unreadAlertsCount}
              </span>
            )}
          </button>

          {/* New Transaction Button */}
          <button
            id="btn-header-new-tx"
            onClick={onOpenNewTx}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl text-xs font-bold shadow-sm shadow-emerald-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nuevo Movimiento</span>
            <span className="sm:hidden">Nuevo</span>
          </button>
        </div>
      </div>
    </header>
  );
};
