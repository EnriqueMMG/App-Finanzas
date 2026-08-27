import React from 'react';
import { LayoutDashboard, ReceiptText, CreditCard, CalendarClock, PieChart, BarChart3 } from 'lucide-react';
import { NAV_ITEMS } from './Sidebar';

interface MobileNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ activeTab, setActiveTab }) => {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-lg">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            id={`mobile-nav-${item.id}`}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
              isActive ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Icon className={`w-4 h-4 mb-0.5 ${isActive ? 'text-emerald-600 scale-110' : 'text-slate-400'}`} />
            <span className="text-[10px] tracking-tight truncate max-w-[56px] text-center">
              {item.id === 'dashboard'
                ? 'Inicio'
                : item.id === 'transactions'
                ? 'Movimientos'
                : item.id === 'accounts'
                ? 'Tarjetas'
                : item.id === 'scheduled'
                ? 'Cuotas'
                : item.id === 'budgets'
                ? 'Presupuesto'
                : 'Reportes'}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
