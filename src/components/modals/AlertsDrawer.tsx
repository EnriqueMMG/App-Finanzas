import React from 'react';
import { X, AlertTriangle, Info, AlertOctagon, ArrowRight, Bell } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

interface AlertsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AlertsDrawer: React.FC<AlertsDrawerProps> = ({ isOpen, onClose }) => {
  const { alerts, setActiveTab } = useFinance();

  if (!isOpen) return null;

  return (
    <div id="modal-backdrop-alerts" className="fixed inset-0 z-50 flex items-center justify-center sm:justify-end p-4 sm:p-0 bg-slate-900/50 backdrop-blur-xs">
      <div
        id="drawer-alerts"
        className="bg-white w-full sm:max-w-md h-full max-h-[90vh] sm:max-h-full sm:h-screen rounded-2xl sm:rounded-none sm:rounded-l-3xl shadow-2xl border-l border-slate-100 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Centro de Alertas</h2>
              <p className="text-xs text-slate-500">Cortes, pagos de tarjetas y presupuestos</p>
            </div>
          </div>
          <button
            id="btn-close-alerts-drawer"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto space-y-3">
          {alerts.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
                ✓
              </div>
              <p className="text-sm font-bold text-slate-800">¡Todo al día!</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                No tienes pagos de tarjeta atrasados, cobros programados urgentes ni presupuestos excedidos.
              </p>
            </div>
          ) : (
            alerts.map((alert) => {
              let icon = <Info className="w-4 h-4 text-blue-600" />;
              let cardBg = 'bg-blue-50/60 border-blue-200/80';
              let badgeColor = 'bg-blue-100 text-blue-700';

              if (alert.severity === 'warning') {
                icon = <AlertTriangle className="w-4 h-4 text-amber-600" />;
                cardBg = 'bg-amber-50/60 border-amber-200/80';
                badgeColor = 'bg-amber-100 text-amber-800';
              } else if (alert.severity === 'danger') {
                icon = <AlertOctagon className="w-4 h-4 text-rose-600" />;
                cardBg = 'bg-rose-50/60 border-rose-200/80';
                badgeColor = 'bg-rose-100 text-rose-800';
              }

              return (
                <div
                  key={alert.id}
                  id={`alert-card-${alert.id}`}
                  className={`p-4 rounded-xl border ${cardBg} space-y-2 transition-all hover:shadow-xs`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-md bg-white shadow-xs">{icon}</div>
                      <h3 className="text-xs font-bold text-slate-900">{alert.title}</h3>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${badgeColor}`}>
                      {alert.severity === 'danger' ? 'Urgente' : alert.severity === 'warning' ? 'Aviso' : 'Info'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{alert.message}</p>

                  {alert.linkTab && (
                    <button
                      onClick={() => {
                        setActiveTab(alert.linkTab!);
                        onClose();
                      }}
                      className="inline-flex items-center gap-1 text-xs font-bold text-slate-900 hover:text-emerald-600 transition-colors pt-1"
                    >
                      <span>Ver detalles</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <p className="text-[11px] text-center text-slate-400">
            Las alertas se calculan automáticamente con las fechas de corte y límites de tus tarjetas y presupuestos.
          </p>
        </div>
      </div>
    </div>
  );
};
