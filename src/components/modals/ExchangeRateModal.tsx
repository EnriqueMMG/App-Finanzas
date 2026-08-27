import React, { useState, useEffect } from 'react';
import { X, RefreshCw, DollarSign, ArrowRight, Info } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

interface ExchangeRateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExchangeRateModal: React.FC<ExchangeRateModalProps> = ({ isOpen, onClose }) => {
  const { exchangeRate, updateExchangeRate } = useFinance();
  const [rate, setRate] = useState<string>(exchangeRate.usdToCrc.toString());

  useEffect(() => {
    if (isOpen) {
      setRate(exchangeRate.usdToCrc.toString());
    }
  }, [isOpen, exchangeRate.usdToCrc]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(rate);
    if (!isNaN(num) && num > 0) {
      updateExchangeRate(num);
      onClose();
    }
  };

  const quickRates = [510, 515, 520, 525, 530];
  const numRate = parseFloat(rate) || exchangeRate.usdToCrc;

  return (
    <div id="modal-backdrop-fx" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        id="modal-fx"
        className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              $
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Tipo de Cambio USD / CRC</h2>
              <p className="text-xs text-slate-500">Costa Rica (Colones por 1 Dólar)</p>
            </div>
          </div>
          <button
            id="btn-close-fx-modal"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Valor de 1 USD en Colones (₡)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                ₡
              </span>
              <input
                type="number"
                step="0.01"
                id="input-exchange-rate"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                required
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl text-base font-bold text-slate-900 outline-hidden"
              />
            </div>
          </div>

          {/* Live Preview of Conversion */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 text-slate-600 font-semibold">
              <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Impacto en gastos y tarjetas:</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1 font-mono-num text-[11px] text-slate-700">
              <div>$10 USD ≈ ₡{Math.round(10 * numRate).toLocaleString('es-CR')}</div>
              <div>$50 USD ≈ ₡{Math.round(50 * numRate).toLocaleString('es-CR')}</div>
              <div>$100 USD ≈ ₡{Math.round(100 * numRate).toLocaleString('es-CR')}</div>
              <div>$500 USD ≈ ₡{Math.round(500 * numRate).toLocaleString('es-CR')}</div>
            </div>
          </div>

          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Valores Rápidos de Referencia (BCCR / Bancos)
            </p>
            <div className="flex flex-wrap gap-1.5">
              {quickRates.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRate(r.toString())}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                    parseFloat(rate) === r
                      ? 'bg-emerald-100 border-emerald-300 text-emerald-800 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  ₡{r}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              id="btn-cancel-fx"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              id="btn-save-fx"
              className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-md transition-all"
            >
              Actualizar Tipo de Cambio
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
