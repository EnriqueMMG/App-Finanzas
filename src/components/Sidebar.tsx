import React from 'react';
import {
  LayoutDashboard,
  ReceiptText,
  CreditCard,
  CalendarClock,
  PieChart,
  BarChart3,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'transactions', label: 'Movimientos', icon: ReceiptText },
  { id: 'accounts', label: 'Cuentas & Tarjetas', icon: CreditCard },
  { id: 'scheduled', label: 'Cuotas & Fijos', icon: CalendarClock },
  { id: 'budgets', label: 'Presupuestos', icon: PieChart },
  { id: 'reports', label: 'Reportes & Proyección', icon: BarChart3 },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { alerts, resetToDefaultData } = useFinance();

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200/80 p-4 shrink-0 h-[calc(100vh-61px)] sticky top-[61px]">
      <div className="space-y-1">
        <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
          Navegación
        </p>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-emerald-50 text-emerald-800 font-bold shadow-xs border border-emerald-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.id === 'accounts' && alerts.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-500" />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-auto pt-4 border-t border-slate-100 space-y-2">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <p className="text-[11px] font-bold text-slate-700">Modo Costa Rica 🇨🇷</p>
          <p className="text-[10px] text-slate-500 leading-normal mt-0.5">
            Soporte completo para cuentas SINPE Móvil, tarjetas BAC, BN, Promerica y compras a Tasa Cero.
          </p>
        </div>

        <button
          id="btn-reset-data"
          onClick={() => {
            if (confirm('¿Restablecer los datos de ejemplo iniciales?')) {
              resetToDefaultData();
            }
          }}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 text-[11px] font-medium text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Restablecer datos de ejemplo
        </button>
      </div>
    </aside>
  );
};
